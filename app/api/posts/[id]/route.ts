import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';


// GET a single post with commnets by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
    const awaitedParams = await params;
    const { id } = awaitedParams;

    try {
        // Fetch the post
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

        // Fetch comments for this post
        const { data: comments, error: commentsError } = await supabase
            .from('comments')
            .select('*')
            .eq('post_id', parseInt(id))
            .order('created_at', { ascending: true });

        if (commentsError) {
            throw commentsError;
        }

        // Combine post with comments
        const postWithComments = {
            ...post,
            comments: comments || []
        };

        return NextResponse.json(postWithComments);

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { error: 'Internal server error' }, 
            { status: 500 }
        );
    }
}