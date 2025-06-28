import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Helper to extract the [author] param from the request URL
 */
function getAuthorFromRequest(request: Request): string | null {
  const url = new URL(request.url);
  const segments = url.pathname.split('/');
  const index = segments.indexOf('authors');
  if (index === -1 || !segments[index + 1]) return null;
  return decodeURIComponent(segments[index + 1]);
}

/**
 * GET handler for fetching all posts by a specific author.
 * The author's name is taken from the URL's dynamic segment.
 */
export async function GET(request: Request) {
  try {
    const author = getAuthorFromRequest(request);

    if (!author) {
      return NextResponse.json({ error: 'Missing author parameter' }, { status: 400 });
    }

    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .eq('author', author)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(posts || []);

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
