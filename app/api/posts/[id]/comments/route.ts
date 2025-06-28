// app/api/posts/[id]/comments/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    // Await the params Promise
    const resolvedParams = await params;
    const postId = resolvedParams.id;

    if (!postId) {
      return NextResponse.json({ error: 'Post ID missing' }, { status: 400 });
    }

    const body = await request.json();
    const { author, text } = body;

    if (!author || !text) {
      return NextResponse.json(
        { error: 'Missing required fields: author, text' },
        { status: 400 }
      );
    }

    // Check if post exists
    const { data: postExists } = await supabase
      .from('posts')
      .select('id')
      .eq('id', parseInt(postId))
      .single();

    if (!postExists) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Insert comment
    const { data: comment, error } = await supabase
      .from('comments')
      .insert([{ post_id: parseInt(postId), author, text }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    // Await the params Promise
    const resolvedParams = await params;
    const postId = resolvedParams.id;

    if (!postId) {
      return NextResponse.json({ error: 'Post ID missing' }, { status: 400 });
    }

    const { data: comments, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', parseInt(postId))
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return NextResponse.json(comments || []);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}