import { NextResponse } from 'next/server';
import { GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getR2Client, getR2Config } from '@/lib/r2/client';
import { Readable } from 'stream';

export const dynamic = 'force-dynamic';

const MIME_MAP: Record<string, string> = {
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  webp: 'image/webp',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  svg: 'image/svg+xml',
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    if (!pathSegments || pathSegments.length === 0) {
      return NextResponse.json({ error: 'Media path is required' }, { status: 400 });
    }

    const key = pathSegments.map((s) => decodeURIComponent(s)).join('/');
    const client = getR2Client();
    const config = getR2Config();

    const ext = key.split('.').pop()?.toLowerCase() || '';
    const defaultMime = MIME_MAP[ext] || 'application/octet-stream';

    const rangeHeader = request.headers.get('range');

    const command = new GetObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      Range: rangeHeader || undefined,
    });

    const response = await client.send(command);

    if (!response.Body) {
      return NextResponse.json({ error: 'Object body not found' }, { status: 404 });
    }

    let webStream: ReadableStream;
    if (response.Body instanceof Readable) {
      webStream = Readable.toWeb(response.Body) as ReadableStream;
    } else if (typeof (response.Body as any).transformToWebStream === 'function') {
      webStream = (response.Body as any).transformToWebStream();
    } else {
      webStream = response.Body as unknown as ReadableStream;
    }

    const headers = new Headers();
    headers.set('Content-Type', response.ContentType || defaultMime);
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

    if (response.ContentLength !== undefined) {
      headers.set('Content-Length', response.ContentLength.toString());
    }
    if (response.ContentRange) {
      headers.set('Content-Range', response.ContentRange);
    }
    if (response.ETag) {
      headers.set('ETag', response.ETag);
    }

    const status = rangeHeader && response.ContentRange ? 206 : 200;

    return new Response(webStream, {
      status,
      headers,
    });
  } catch (err: any) {
    if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
      return NextResponse.json({ error: 'Media not found on R2 storage' }, { status: 404 });
    }
    console.error('Admin R2 Media streaming error:', err);
    return NextResponse.json({ error: err.message || 'Error streaming media' }, { status: 500 });
  }
}

export async function HEAD(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const key = pathSegments.map((s) => decodeURIComponent(s)).join('/');
    const client = getR2Client();
    const config = getR2Config();

    const ext = key.split('.').pop()?.toLowerCase() || '';
    const defaultMime = MIME_MAP[ext] || 'application/octet-stream';

    const response = await client.send(
      new HeadObjectCommand({
        Bucket: config.bucketName,
        Key: key,
      })
    );

    const headers = new Headers();
    headers.set('Content-Type', response.ContentType || defaultMime);
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('Access-Control-Allow-Origin', '*');
    if (response.ContentLength !== undefined) {
      headers.set('Content-Length', response.ContentLength.toString());
    }
    if (response.ETag) {
      headers.set('ETag', response.ETag);
    }

    return new Response(null, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Media not found' }, { status: 404 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type',
    },
  });
}
