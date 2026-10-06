import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getR2Client, getR2Config, isR2Configured } from '@/lib/r2/client';

export const dynamic = 'force-dynamic';

/**
 * Handle individual chunk upload for large videos (> 3.5MB)
 * Each chunk is ~3MB, avoiding Vercel serverless 4.5MB payload limit.
 */
export async function POST(request: Request) {
  try {
    if (!isR2Configured()) {
      return NextResponse.json({ error: 'Cloudflare R2 is not configured' }, { status: 500 });
    }

    const formData = await request.formData();
    const chunk = formData.get('chunk') as File | null;
    const uploadId = formData.get('uploadId') as string | null;
    const indexStr = formData.get('index') as string | null;

    if (!chunk || !uploadId || indexStr === null) {
      return NextResponse.json({ error: 'Missing chunk, uploadId, or index' }, { status: 400 });
    }

    const index = parseInt(indexStr, 10);
    const bytes = await chunk.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const config = getR2Config();
    const client = getR2Client();
    const chunkKey = `temp-chunks/${uploadId}_part_${String(index).padStart(4, '0')}`;

    await client.send(
      new PutObjectCommand({
        Bucket: config.bucketName,
        Key: chunkKey,
        Body: buffer,
        ContentType: 'application/octet-stream',
      })
    );

    return NextResponse.json({
      success: true,
      uploadId,
      index,
      size: buffer.length,
    });
  } catch (err: any) {
    console.error('Error in /api/r2/chunk-upload:', err);
    return NextResponse.json({ error: err.message || 'Chunk upload failed' }, { status: 500 });
  }
}
