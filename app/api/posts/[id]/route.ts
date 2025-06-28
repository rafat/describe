import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper to extract the dynamic [id] from the request URL
function getPostIdFromRequest(request: Request): string | null {
  const url = new URL(request.url);
  const segments = url.pathname.split('/');
  const id = segments[segments.indexOf('posts') + 1];
  return id || null;
}

// GET - Get a single post with its comments
export async function GET(request: Request) {
  const id = getPostIdFromRequest(request);
  if (!id) {
    return NextResponse.json({ error: 'Missing post ID' }, { status: 400 });
  }

  try {
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', parseInt(id))
      .single();

    if (postError) {
      if (postError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
      throw postError;
    }

    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', parseInt(id))
      .order('created_at', { ascending: true });

    if (commentsError) throw commentsError;

    return NextResponse.json({ ...post, comments: comments || [] });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new post
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { author, title, content } = body;

    if (!author || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: author, title, content' },
        { status: 400 }
      );
    }

    const { data: post, error } = await supabase
      .from('posts')
      .insert([{ author, title, content }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update a post
export async function PUT(request: Request) {
  const id = getPostIdFromRequest(request);
  if (!id) {
    return NextResponse.json({ error: 'Missing post ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { title, content, coin_address } = body;

    const updateData: {
      title?: string;
      content?: string;
      coin_address?: string;
    } = {};

    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (coin_address !== undefined) updateData.coin_address = coin_address;

    const { data: post, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', parseInt(id))
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a post
export async function DELETE(request: Request) {
  const id = getPostIdFromRequest(request);
  if (!id) {
    return NextResponse.json({ error: 'Missing post ID' }, { status: 400 });
  }

  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', parseInt(id));

    if (error) throw error;

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
