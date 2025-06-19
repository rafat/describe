import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST - Add a comment to a post
export async function POST(request: Request, { params }: { params: { id: string } }) {
    const awaitedParams = await params;
    const { id: postId } = awaitedParams;

    try {
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
            throw error;
        }

        return NextResponse.json(comment, { status: 201 });

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { error: 'Internal server error' }, 
            { status: 500 }
        );
    }
}

// GET - Get all comments for a post
export async function GET(request: Request, { params }: { params: { id: string } }) {
    const awaitedParams = await params;
    const { id: postId } = awaitedParams;

    try {
        const { data: comments, error } = await supabase
            .from('comments')
            .select('*')
            .eq('post_id', parseInt(postId))
            .order('created_at', { ascending: true });

        if (error) {
            throw error;
        }

        return NextResponse.json(comments || []);

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { error: 'Internal server error' }, 
            { status: 500 }
        );
    }
}