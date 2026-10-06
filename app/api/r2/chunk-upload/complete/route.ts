import { NextResponse } from 'next/server';
import { GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getR2Client, getR2Config, isR2Configured } from '@/lib/r2/client';

export const dynamic = 'force-dynamic';
// Allow max duration on Vercel for assembling larger files
export const maxDuration = 60;

async function streamToBuffer(stream: any): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export async function POST(request: Request) {
  try {
    if (!isR2Configured()) {
      return NextResponse.json({ error: 'Cloudflare R2 is not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { uploadId, total, filename, contentType = 'video/mp4', title } = body;

    if (!uploadId || !total || !filename) {
      return NextResponse.json({ error: 'Missing uploadId, total, or filename' }, { status: 400 });
    }

    const config = getR2Config();
    const client = getR2Client();

    // 1. Fetch each chunk in order and assemble into single Buffer
    const partBuffers: Buffer[] = [];
    const keysToDelete: string[] = [];

    for (let i = 0; i < total; i++) {
      const chunkKey = `temp-chunks/${uploadId}_part_${String(i).padStart(4, '0')}`;
      keysToDelete.push(chunkKey);

      const getRes = await client.send(
        new GetObjectCommand({
          Bucket: config.bucketName,
          Key: chunkKey,
        })
      );

      if (!getRes.Body) {
        throw new Error(`Failed to retrieve chunk ${i} from R2`);
      }

      const partBuf = await streamToBuffer(getRes.Body);
      partBuffers.push(partBuf);
    }

    const finalBuffer = Buffer.concat(partBuffers);

    // 2. Put final assembled object into R2
    const cleanFilename = String(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
    const folder = contentType.startsWith('image/') ? 'images' : 'videos';
    const finalKey = `${folder}/${Date.now()}-${cleanFilename}`;

    await client.send(
      new PutObjectCommand({
        Bucket: config.bucketName,
        Key: finalKey,
        Body: finalBuffer,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      })
    );

    // 3. Asynchronously cleanup temp chunks in background
    (async () => {
      for (const k of keysToDelete) {
        try {
          await client.send(new DeleteObjectCommand({ Bucket: config.bucketName, Key: k }));
        } catch (_) {}
      }
    })();

    const publicUrl = config.publicDomain
      ? `${config.publicDomain.replace(/\/$/, '')}/${finalKey}`
      : `https://www.phulwari.co.in/api/media/${finalKey}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      key: finalKey,
      size: finalBuffer.length,
      storage: 'r2',
      original_name: filename,
      title: title || filename.replace(/\.[^/.]+$/, ''),
      r2_enabled: true,
    });
  } catch (err: any) {
    console.error('Error completing chunked upload:', err);
    return NextResponse.json({ error: err.message || 'Failed to complete chunk upload' }, { status: 500 });
  }
}
