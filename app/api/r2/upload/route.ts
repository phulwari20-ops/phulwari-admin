import { NextResponse } from 'next/server';
import { uploadVideoFile, isR2Configured } from '@/lib/r2/client';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadVideoFile(
      buffer,
      file.name,
      file.type || 'video/mp4'
    );

    return NextResponse.json({
      success: true,
      url: result.url,
      key: result.key,
      size: result.size,
      storage: result.storage,
      original_name: file.name,
      title: title || file.name.replace(/\.[^/.]+$/, ''),
      r2_enabled: isR2Configured(),
    });
  } catch (err: any) {
    console.error('API /api/r2/upload error:', err);
    return NextResponse.json({ error: err.message || 'Video upload failed' }, { status: 500 });
  }
}
