// app/posts/[id]/page.tsx
import CommentForm from "@/components/CommentForm";
import RewardButton from "@/components/RewardButton";
import ShareButtons from '@/components/ShareButtons';

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
    const awaitedParams = await params;
    const { id } = awaitedParams;

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
            <div className="max-w-3xl mx-auto">
                <h1 className="text-5xl font-bold mb-2">{post.title}</h1>
                <p className="text-gray-400 mb-6">by {post.author}</p>
                
                {post.coin_address && (
                    <div className="mb-6 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                        <h3 className="text-lg font-semibold text-purple-300 mb-2">🪙 This Post Has a Coin!</h3>
                        <p className="text-sm text-gray-300 mb-2">
                            Coin Address: 
                            <a 
                                href={`https://sepolia-explorer.base.org/token/${post.coin_address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 text-purple-400 hover:text-purple-300 underline"
                            >
                                {post.coin_address}
                            </a>
                        </p>
                        <p className="text-xs text-gray-400">
                            View on Base Sepolia Explorer
                        </p>
                    </div>
                )}
                
                <div className="prose prose-invert max-w-none">
                    <p className="whitespace-pre-wrap">{post.content}</p>
                </div>

                <ShareButtons postTitle={post.title} />

                <hr className="my-8 border-gray-700" />

                <h2 className="text-3xl font-bold mb-4">Comments</h2>
                <div className="space-y-4">
                    {post.comments && post.comments.length > 0 ? (
                        post.comments.map((comment: any) => (
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
                                    {post.coin_address && (
                                        <RewardButton 
                                            coinAddress={post.coin_address}
                                            recipientAddress={comment.author} 
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