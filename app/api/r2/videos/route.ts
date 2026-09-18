import { NextResponse } from 'next/server';
import { listVideos, isR2Configured } from '@/lib/r2/client';

export async function GET() {
  try {
    const videos = await listVideos();
    return NextResponse.json({
      success: true,
      videos,
      r2_enabled: isR2Configured(),
    });
  } catch (err: any) {
    console.error('API /api/r2/videos error:', err);
    return NextResponse.json({ error: err.message || 'Failed to list videos' }, { status: 500 });
  }
}
