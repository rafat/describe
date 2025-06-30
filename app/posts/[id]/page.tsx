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

async function getPost(id: string) {
    // Use relative URL for internal API calls
    const baseUrl = process.env.NET_URL 
        ? `https://${process.env.NET_URL}` 
        : 'http://localhost:3000';
    
    const res = await fetch(`${baseUrl}/api/posts/${id}`, { 
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    
    if (!res.ok) {
        if (res.status === 404) {
            return null;
        }
        throw new Error(`Failed to fetch post: ${res.status}`);
    }
    
    return res.json();
}

type Comment = {
    id: number;
    post_id: number;
    author: `0x${string}` | string;
    text: string;
    created_at: string;
};

type Post = {
  id: number;
  author?: string;
  title?: string;
  content?: string;
  created_at?: string;
  coin_address?: string;
};

// Referral Tracker Component
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

// Main Post Page Component - converted to client component for referral tracking
export default function PostPage({ 
    params 
}: { 
    params: Promise<{ id: string }> 
}) {
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

    // Resolve params on client side
    useEffect(() => {
        params.then(setResolvedParams);
    }, [params]);

    // Fetch post data
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
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [resolvedParams?.id]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto text-center text-gray-400">
                    <div className="animate-pulse">
                        <div className="h-12 bg-gray-700 rounded mb-4"></div>
                        <div className="h-4 bg-gray-700 rounded mb-6"></div>
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-700 rounded"></div>
                            <div className="h-4 bg-gray-700 rounded"></div>
                            <div className="h-4 bg-gray-700 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-3xl mx-auto text-center text-red-400">
                <h1 className="text-3xl font-bold mb-4">Error Loading Post</h1>
                <p>Something went wrong. Please try again later.</p>
                <p className="text-sm text-gray-500 mt-2">{error}</p>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="max-w-3xl mx-auto text-center text-gray-400">
                <h1 className="text-5xl font-bold mb-4">Post Not Found</h1>
                <p>The requested post does not exist.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Referral tracking notification */}
            {resolvedParams?.id && <ReferralTracker postId={resolvedParams.id} />}
            
            <div className="lg:grid lg:grid-cols-4 lg:gap-8">
                {/* Main content - takes up 3 columns */}
                <main className="lg:col-span-3">
                    <div className="max-w-4xl">
                        <h1 className="text-5xl font-bold mb-2">{post.title}</h1>
                        <p className="text-gray-400 mb-6">by {post.author}</p>
                        
                        <div className="prose prose-invert max-w-none">
                            <p className="whitespace-pre-wrap">{post.content}</p>
                        </div>

                        <ShareButtons postTitle={post.title} />

                        <hr className="my-8 border-gray-700" />

                        <h2 className="text-3xl font-bold mb-4">Comments</h2>
                        <div className="space-y-4">
                            {post.comments && post.comments.length > 0 ? (
                                post.comments.map((comment: Comment) => (
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

                {/* Sidebar - takes up 1 column */}
                <aside className="hidden lg:block lg:col-span-1">
                    <div className="sticky top-6 space-y-6">
                        {/* Coin Info Sidebar */}
                        {post.coin_address && (
                            <div>
                                <CoinInfoSidebar coinAddress={post.coin_address} />
                            </div>
                        )}
                        
                        {/* Referral Dashboard */}
                        <div>
                            <ReferralDashboard />
                        </div>
                        
                        {/* Referral Leaderboard - only visible to post author */}
                        {resolvedParams?.id && (
                            <div>
                                <ReferralLeaderboard 
                                    postId={resolvedParams.id}
                                    coinAddress={post.coin_address}
                                    postAuthor={post.author}
                                />
                            </div>
                        )}
                    </div>
                </aside>

                {/* Mobile sections */}
                <div className="lg:hidden mt-8 space-y-6">
                    {/* Coin Info for mobile */}
                    {post.coin_address && (
                        <div>
                            <CoinInfoSidebar coinAddress={post.coin_address} />
                        </div>
                    )}
                    
                    {/* Referral Dashboard for mobile */}
                    <div>
                        <ReferralDashboard />
                    </div>
                    
                    {/* Referral Leaderboard for mobile */}
                    {resolvedParams?.id && (
                        <div>
                            <ReferralLeaderboard 
                                postId={resolvedParams.id}
                                coinAddress={post.coin_address}
                                postAuthor={post.author}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}