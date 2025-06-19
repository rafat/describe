// app/posts/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3 } from '@/context/Web3Provider';
import CoinCreationForm from '@/components/CoinCreationForm';

export default function CreatePostPage() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCoinCreation, setShowCoinCreation] = useState(false);
    const [createdPostId, setCreatedPostId] = useState<number | null>(null);
    const { account } = useWeb3();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!account) {
            alert('Please connect your wallet to create a post.');
            return;
        }

        if (!title.trim() || !content.trim()) {
            alert('Please fill in both title and content.');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    title: title.trim(), 
                    content: content.trim(), 
                    author: account 
                }),
            });

            if (response.ok) {
                const newPost = await response.json();
                setCreatedPostId(newPost.id);
                setShowCoinCreation(true);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create post');
            }
        } catch (error) {
            console.error('Error creating post:', error);
            alert(error instanceof Error ? error.message : 'Failed to create post. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCoinCreated = async (coinAddress: string) => {
        if (!createdPostId) return;

        try {
            // Update the post with the coin address
            const response = await fetch(`/api/posts/${createdPostId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    coin_address: coinAddress 
                }),
            });

            if (response.ok) {
                router.push(`/posts/${createdPostId}`);
            } else {
                console.error('Failed to update post with coin address');
                // Still redirect to the post even if updating coin address fails
                router.push(`/posts/${createdPostId}`);
            }
        } catch (error) {
            console.error('Error updating post with coin address:', error);
            router.push(`/posts/${createdPostId}`);
        }
    };

    const handleSkipCoin = () => {
        if (createdPostId) {
            router.push(`/posts/${createdPostId}`);
        }
    };

    if (!account) {
        return (
            <div className="max-w-2xl mx-auto text-center">
                <h1 className="text-3xl font-bold mb-6">Create a New Post</h1>
                <p className="text-gray-400">Please connect your wallet to create a post.</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            {!showCoinCreation ? (
                <>
                    <h1 className="text-3xl font-bold mb-6">Create a New Post</h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium mb-1">
                                Title
                            </label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full p-2 border rounded-md bg-gray-800 text-white"
                                placeholder="Enter your post title..."
                                disabled={isSubmitting}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="content" className="block text-sm font-medium mb-1">
                                Content
                            </label>
                            <textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full p-2 border rounded-md bg-gray-800 text-white"
                                rows={10}
                                placeholder="Write your post content..."
                                disabled={isSubmitting}
                                required
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            disabled={isSubmitting || !title.trim() || !content.trim()}
                        >
                            {isSubmitting ? 'Publishing...' : 'Publish'}
                        </button>
                    </form>
                </>
            ) : (
                <>
                    <h1 className="text-3xl font-bold mb-6">Post Created Successfully!</h1>
                    <p className="text-gray-400 mb-6">
                        Your post has been published. You can now create a coin for it or skip this step.
                    </p>
                    
                    <CoinCreationForm 
                        postTitle={title}
                        onCoinCreated={handleCoinCreated}
                    />
                    
                    <div className="mt-6">
                        <button
                            onClick={handleSkipCoin}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                            Skip Coin Creation
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}