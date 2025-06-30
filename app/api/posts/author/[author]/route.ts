// app/api/posts/author/[author]/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET handler for fetching all posts by a specific author.
 * The author's name is taken from the URL's dynamic segment.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ author: string }> } // <-- Updated type annotation
) {
  try {
    const resolvedParams = await params;
    const author = resolvedParams.author;
    
    if (!author) {
      return NextResponse.json({ error: 'Missing author parameter' }, { status: 400 });
    }
    
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .eq('author', author)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }
    
    return NextResponse.json(posts || []);
  } catch (error) {
    console.error('API GET handler error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}