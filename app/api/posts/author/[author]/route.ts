import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET handler for fetching all posts by a specific author.
 * The author's name is taken from the URL's dynamic segment.
 */
export async function GET(
    request: Request,
    { params }: { params: { author: string } }
) {
    try {
        // Decode the author name from the URL to handle special characters.
        const author = decodeURIComponent(params.author);

        // Query Supabase for posts where the 'author' column matches.
        const { data: posts, error } = await supabase
            .from('posts')
            .select('*') // Select all post fields for the profile page preview.
            .eq('author', author)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        // It's not an error if an author has no posts, just return an empty array.
        return NextResponse.json(posts || []);

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { error: 'Internal server error' }, 
            { status: 500 }
        );
    }
}
