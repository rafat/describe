import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET all posts
export async function GET() {
    try {
        const { data: posts, error } = await supabase
            .from('posts')
            .select(`
                *,
                comments (
                    id,
                    author,
                    text,
                    created_at
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return NextResponse.json(posts || []);

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { error: 'Internal server error' }, 
            { status: 500 }
        );
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

        if (error) {
            throw error;
        }

        return NextResponse.json(post, { status: 201 });

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { error: 'Internal server error' }, 
            { status: 500 }
        );
    }
}