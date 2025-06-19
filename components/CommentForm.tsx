'use client';
import { useState } from 'react';
import { useWeb3 } from '@/context/Web3Provider';
import { useRouter } from 'next/navigation';

export default function CommentForm({ postId }: { postId: number }) {
    const [text, setText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { account } = useWeb3();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!account) {
            alert('Please connect your wallet to comment.');
            return;
        }
        if (!text.trim()) {
            alert('Comment text cannot be empty.');
            return;
        }

        setIsSubmitting(true);
        
        try {
            const response = await fetch(`/api/posts/${postId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text.trim(), author: account }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to post comment');
            }

            setText('');
            router.refresh(); // Re-fetch server-side data to show the new comment
        } catch (error) {
            console.error('Error posting comment:', error);
            alert(error instanceof Error ? error.message : 'Failed to post comment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-6">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-2 border rounded-md text-black"
                rows={3}
                disabled={!account || isSubmitting}
            ></textarea>
            <button
                type="submit"
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400"
                disabled={!account || isSubmitting || !text.trim()}
            >
                {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
        </form>
    );
}