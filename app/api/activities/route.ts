import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    const supabase = createClient();

    if (slug) {
      const { data, error } = await supabase
        .from('activity_pages')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      if (!data) return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
      return NextResponse.json(data);
    }

    const { data, error } = await supabase
      .from('activity_pages')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err: any) {
    console.error('API /api/activities GET error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || !body.slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const supabase = createClient();
    const { content_color, ...cleanBody } = body;
    const payload = {
      ...cleanBody,
      cta: {
        ...(cleanBody.cta || {}),
        ...(content_color ? { content_color } : {}),
      },
      id: body.id || body.slug,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('activity_pages')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;

    const returnData = {
      ...data,
      content_color: data?.cta?.content_color || content_color || '#334155',
    };

    return NextResponse.json({ success: true, data: returnData });
  } catch (err: any) {
    console.error('API /api/activities POST error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || searchParams.get('slug');

    if (!id) {
      return NextResponse.json({ error: 'ID or slug is required' }, { status: 400 });
    }

    const supabase = createClient();
    const { error } = await supabase
      .from('activity_pages')
      .delete()
      .or(`id.eq.${id},slug.eq.${id}`);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (err: any) {
    console.error('API /api/activities DELETE error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
