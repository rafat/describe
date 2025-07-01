// app/posts/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import CommentForm from "@/components/CommentForm";
import RewardButton from "@/components/RewardButton";
import ShareButtons from '@/components/ShareButtons';
import CoinInfoSidebar from "@/components/CoinInfoSidebar";
import ReferralDashboard from "@/components/ReferralDashboard";
import ReferralLeaderboard from "@/components/ReferralLeaderboard";
import { useReferralTracking } from '@/hooks/useReferralTracking';

// --- Type Definitions ---
// Defines the structure for a comment object.
type Comment = {
    id: number;
    post_id: number;
    author: `0x${string}` | string;
    text: string;
    created_at: string;
};

// Defines the structure for the main post object.
type Post = {
    id: number;
    title: string;
    author: `0x${string}` | string;
    content: string;
    comments: Comment[];
    created_at?: string;
    coin_address?: `0x${string}`; // Address is optional and must be a hex string.
};

/**
 * Fetches a single post from the API by its ID.
 * @param id - The ID of the post to fetch.
 * @returns A promise that resolves to the post object or null if not found.
 */
async function getPost(id: string): Promise<Post | null> {
    // Use relative URL for internal API calls.
    const baseUrl = process.env.NEXT_PUBLIC_URL 
        ? `https://${process.env.NEXT_PUBLIC_URL}` 
        : 'http://localhost:3000';
    console.log(baseUrl);
    
    const res = await fetch(`${baseUrl}/api/posts/${id}`, { 
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    
    if (!res.ok) {
        if (res.status === 404) {
            return null; // Handle not found case gracefully.
        }
        // Throw an error for other server-side issues.
        throw new Error(`Failed to fetch post: ${res.status}`);
    }
    
    return res.json();
}

/**
 * A component to display a notification if the visit is being tracked for referrals.
 */
function ReferralTracker({ postId }: { postId: string }) {
    const { referrerAddress, isTracked } = useReferralTracking(postId);
    
    if (referrerAddress && isTracked) {
        return (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                <p className="text-blue-300 text-sm">
                    📈 This visit is being tracked for referral rewards
                </p>
            </div>
        );
    }
    
    return null;
}

/**
 * The main component for displaying a single post page.
 * It's a client component to handle state and effects for fetching data
 * and tracking referrals.
 */
export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
    // State for the post data, using the specific 'Post' type.
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

    // Effect to resolve the `params` promise on the client side.
    useEffect(() => {
        params.then(setResolvedParams);
    }, [params]);

    // Effect to fetch the post data once the ID is available.
    useEffect(() => {
        if (!resolvedParams?.id) return;

        const fetchPost = async () => {
            try {
                setLoading(true);
                const postData = await getPost(resolvedParams.id);
                setPost(postData);
                setError(null);
            } catch (err) {
                console.error('Error loading post:', err);
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [resolvedParams?.id]);

    // --- Render Logic ---

    // Display a loading skeleton while data is being fetched.
    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto text-center text-gray-400">
                    <div className="animate-pulse">
                        <div className="h-12 bg-gray-700 rounded mb-4"></div>
                        <div className="h-4 bg-gray-700 rounded w-1/4 mx-auto mb-6"></div>
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-700 rounded"></div>
                            <div className="h-4 bg-gray-700 rounded w-5/6 mx-auto"></div>
                            <div className="h-4 bg-gray-700 rounded w-4/6 mx-auto"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Display an error message if the fetch failed.
    if (error) {
        return (
            <div className="max-w-3xl mx-auto text-center text-red-400">
                <h1 className="text-3xl font-bold mb-4">Error Loading Post</h1>
                <p>Something went wrong. Please try again later.</p>
                <p className="text-sm text-gray-500 mt-2">{error}</p>
            </div>
        );
    }

    // Display a "not found" message if the post doesn't exist.
    if (!post) {
        return (
            <div className="max-w-3xl mx-auto text-center text-gray-400">
                <h1 className="text-5xl font-bold mb-4">Post Not Found</h1>
                <p>The requested post could not be found.</p>
            </div>
        );
    }

    // Render the full post page with content, comments, and sidebars.
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {resolvedParams?.id && <ReferralTracker postId={resolvedParams.id} />}
            
            <div className="lg:grid lg:grid-cols-4 lg:gap-8">
                {/* Main content area */}
                <main className="lg:col-span-3">
                    <div className="max-w-4xl">
                        <h1 className="text-5xl font-bold mb-2">{post.title}</h1>
                        <p className="text-gray-400 mb-6">by {post.author}</p>
                        
                        <div className="prose prose-invert max-w-none">
                            <p className="whitespace-pre-wrap">{post.content}</p>
                        </div>

                        <ShareButtons postTitle={post.title} />

                        <hr className="my-8 border-gray-700" />

                        {/* Comments Section */}
                        <h2 className="text-3xl font-bold mb-4">Comments</h2>
                        <div className="space-y-4">
                            {post.comments && post.comments.length > 0 ? (
                                post.comments.map((comment) => (
                                    <div key={comment.id} className="p-4 bg-gray-800 rounded-lg">
                                        <p className="text-gray-300">{comment.text}</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <p className="text-xs text-gray-500">
                                                by {comment.author.length > 10 
                                                    ? `${comment.author.slice(0, 6)}...${comment.author.slice(-4)}`
                                                    : comment.author
                                                }
                                                {comment.created_at && (
                                                    <span className="ml-2">
                                                        • {new Date(comment.created_at).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </p>
                                            {typeof comment.author === 'string' &&
                                                comment.author.startsWith('0x') &&
                                                post.coin_address && (
                                                    <RewardButton
                                                        coinAddress={post.coin_address}
                                                        recipientAddress={comment.author as `0x${string}`}
                                                        customLabel=''
                                                    />
                                                )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400">No comments yet. Be the first to comment!</p>
                            )}
                        </div>

                        {resolvedParams?.id && <CommentForm postId={parseInt(resolvedParams.id)} />}
                    </div>
                </main>

                {/* Sidebar for desktop */}
                <aside className="hidden lg:block lg:col-span-1">
                    <div className="sticky top-6 space-y-6">
                        {post.coin_address && <CoinInfoSidebar coinAddress={post.coin_address} />}
                        {resolvedParams?.id && (<ReferralDashboard postId={Number(resolvedParams.id)}/>)}
                        {resolvedParams?.id && post.coin_address && (
                            <ReferralLeaderboard 
                                postId={resolvedParams.id}
                                coinAddress={post.coin_address}
                                postAuthor={post.author}
                            />
                        )}
                    </div>
                </aside>

                {/* Sections for mobile */}
                <div className="lg:hidden mt-8 space-y-6">
                    {post.coin_address && <CoinInfoSidebar coinAddress={post.coin_address} />}
                    {resolvedParams?.id && (<ReferralDashboard postId={Number(resolvedParams.id)}/>)}
                    {resolvedParams?.id && post.coin_address && (
                        <ReferralLeaderboard 
                            postId={resolvedParams.id}
                            coinAddress={post.coin_address}
                            postAuthor={post.author}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
