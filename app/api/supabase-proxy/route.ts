import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseUrl, getSupabaseKey } from '@/lib/supabase/env';

export const dynamic = 'force-dynamic';

async function handleProxy(req: NextRequest) {
  try {
    const supabaseUrl = getSupabaseUrl().replace(/\/+$/, '');
    const supabaseKey = getSupabaseKey();
    const url = new URL(req.url);

    // Extract target path from query param "path"
    const targetPath = url.searchParams.get('path') || '';
    url.searchParams.delete('path');

    // Build remaining query string
    const remainingQuery = url.searchParams.toString();
    const cleanPath = targetPath.startsWith('/') ? targetPath : `/${targetPath}`;
    const destinationUrl = `${supabaseUrl}${cleanPath}${remainingQuery ? `?${remainingQuery}` : ''}`;

    // Clone incoming headers, ensuring Supabase apikey & auth
    const headers = new Headers();
    req.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (!['host', 'connection', 'content-length'].includes(lowerKey)) {
        headers.set(key, value);
      }
    });

    if (!headers.has('apikey')) {
      headers.set('apikey', supabaseKey);
    }
    if (!headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${supabaseKey}`);
    }

    // Read body if present
    let body: any = null;
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      try {
        const text = await req.text();
        if (text && text.trim().length > 0) {
          body = text;
        }
      } catch (_) {}
    }

    const response = await fetch(destinationUrl, {
      method: req.method,
      headers,
      body,
      cache: 'no-store',
    });

    const respText = await response.text();
    const respHeaders = new Headers();

    response.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (!['transfer-encoding', 'content-encoding', 'connection'].includes(lower)) {
        respHeaders.set(key, value);
      }
    });

    respHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate');

    return new NextResponse(respText, {
      status: response.status,
      statusText: response.statusText,
      headers: respHeaders,
    });
  } catch (err: any) {
    console.error('Supabase Proxy Error (phulwari-admin):', err);
    return NextResponse.json(
      { error: err.message || 'Supabase proxy request failed' },
      { status: 502 }
    );
  }
}

export async function GET(req: NextRequest) {
  return handleProxy(req);
}

export async function POST(req: NextRequest) {
  return handleProxy(req);
}

export async function PUT(req: NextRequest) {
  return handleProxy(req);
}

export async function PATCH(req: NextRequest) {
  return handleProxy(req);
}

export async function DELETE(req: NextRequest) {
  return handleProxy(req);
}

export async function HEAD(req: NextRequest) {
  return handleProxy(req);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD',
      'Access-Control-Allow-Headers': '*',
    },
  });
}
