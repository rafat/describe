// app/posts/[id]/page.tsx
import CommentForm from "@/components/CommentForm";
import RewardButton from "@/components/RewardButton";
import ShareButtons from '@/components/ShareButtons';
import CoinInfoSidebar from "@/components/CoinInfoSidebar";

async function getPost(id: string) {
    // Use relative URL for internal API calls
    const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
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

export default async function PostPage({ params }: { params: { id: string } }) {
    const { id } = params;
    type Comment = {
        id: number;
        post_id: number;
        author: `0x${string}` | string;
        text: string;
        created_at: string;
    };

    try {
        const post = await getPost(id);

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
                <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                    {/* Main content */}
                    <main className="lg:col-span-2">
                        <div className="max-w-3xl mx-auto">
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
                                                        />
                                                    )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-400">No comments yet. Be the first to comment!</p>
                                )}
                            </div>

                            <CommentForm postId={parseInt(id)} />
                        </div>
                    </main>

                    {/* Sidebar */}
                    <aside className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-6 space-y-4">
                           {post.coin_address && <CoinInfoSidebar coinAddress={post.coin_address} />}
                        </div>
                    </aside>

                     {/* Coin Info for mobile */}
                     <div className="lg:hidden mt-8">
                        {post.coin_address && <CoinInfoSidebar coinAddress={post.coin_address} />}
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error('Error loading post:', error);
        return (
            <div className="max-w-3xl mx-auto text-center text-red-400">
                <h1 className="text-3xl font-bold mb-4">Error Loading Post</h1>
                <p>Something went wrong. Please try again later.</p>
            </div>
        );
    }
}