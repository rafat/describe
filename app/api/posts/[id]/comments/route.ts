///api/posts/[id]/comments/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper to extract dynamic route param from URL
function extractIdFromUrl(request: Request): string | null {
  const url = new URL(request.url);
  const segments = url.pathname.split('/');
  return segments[segments.indexOf('posts') + 1] || null;
}

export async function POST(request: Request) {
  const postId = extractIdFromUrl(request);
  if (!postId) {
    return NextResponse.json({ error: 'Post ID missing from URL' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { author, text } = body;

    if (!author || !text) {
      return NextResponse.json(
        { error: 'Missing required fields: author, text' },
        { status: 400 }
      );
    }

    const { data: postExists } = await supabase
      .from('posts')
      .select('id')
      .eq('id', parseInt(postId))
      .single();

    if (!postExists) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .insert([{ post_id: parseInt(postId), author, text }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const postId = extractIdFromUrl(request);
  if (!postId) {
    return NextResponse.json({ error: 'Post ID missing from URL' }, { status: 400 });
  }

  try {
    const { data: comments, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', parseInt(postId))
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json(comments || []);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
