// app/page.tsx
import Link from 'next/link';

/**
 * Fetches all posts from the API.
 * Uses a relative URL for API calls within the same Next.js application.
 * Caching is disabled to ensure fresh data on every request.
 */
async function getPosts() {
    const baseUrl = process.env.NET_URL 
        ? `https://${process.env.NET_URL}` 
        : 'http://localhost:3000';
    
    const res = await fetch(`${baseUrl}/api/posts`, { cache: 'no-store' });
    
    if (!res.ok) {
        throw new Error('Failed to fetch posts');
    }
    
    return res.json();
}

/**
 * The main homepage component that displays a list of all blog posts.
 */
export default async function HomePage() {
    const posts = await getPosts();
    type Post = {
        id: number;
        author?: string;
        title?: string;
        content?: string;
        created_at?: string;
        coin_address?: string;
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-8 text-center text-white">All Posts</h1>
            <div className="space-y-8">
                {posts.map((post: Post) => (
                    <div key={post.id} className="p-6 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700/50 transition-colors duration-200 border border-gray-700">
                        <h2 className="text-3xl font-bold mb-2">
                            <Link href={`/posts/${post.id}`} className="text-white hover:text-blue-400 transition-colors">
                                {post.title}
                            </Link>
                        </h2>
                        <p className="text-gray-400 mb-4">
                            By: <Link href={`/authors/${encodeURIComponent(post.author ?? '')}`} className="font-semibold hover:underline text-blue-300">
                                {post.author}
                            </Link>
                        </p>
                        <p className="text-gray-300 mb-4 leading-relaxed">
                            {post.content?.substring(0, 200)}...
                        </p>
                        <Link href={`/posts/${post.id}`} className="text-blue-400 font-semibold hover:underline">
                            Click for More →
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}