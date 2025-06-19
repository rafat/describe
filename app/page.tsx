// app/page.tsx
import Link from 'next/link';

async function getPosts() {
    // For a real app, you would fetch from your real API endpoint
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts`, { cache: 'no-store' });
    if (!res.ok) {
        throw new Error('Failed to fetch posts');
    }
    return res.json();
}

export default async function HomePage() {
    const posts = await getPosts();

    return (
        <div>
            <h1 className="text-4xl font-bold mb-6">All Posts</h1>
            <div className="space-y-4">
                {posts.map((post: any) => (
                    <Link href={`/posts/${post.id}`} key={post.id} className="block p-4 border rounded-lg hover:bg-gray-800">
                        <h2 className="text-2xl font-semibold">{post.title}</h2>
                        <p className="text-gray-400">by {post.author.slice(0, 6)}...{post.author.slice(-4)}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}