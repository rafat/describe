// app/authors/[author]/page.tsx
import Link from 'next/link';

type Post = {
  id: number;
  author?: string;
  title?: string;
  content?: string;
  created_at?: string;
  coin_address?: string;
};

/**
 * Fetches all posts for a given author from the new API endpoint.
 * @param author - The URL-encoded name of the author.
 */
async function getPostsByAuthor(author: string): Promise<Post[]> {
    const baseUrl =
        process.env.NEXT_PUBLIC_URL 
            ? `https://${process.env.NEXT_PUBLIC_URL }`
            : 'http://localhost:3000';

    console.log(baseUrl);
    const res = await fetch(`${baseUrl}/api/posts/author/${author}`, {
        cache: 'no-store',
    });
    if (!res.ok && res.status !== 404) {
        throw new Error(`Failed to fetch posts for author: ${author}`);
    }
    return res.json();
}

/**
 * The page component for displaying an author's profile and their posts.
 */
export default async function AuthorPage({ 
    params 
}: { 
    params: Promise<{ author: string }> 
}) {
    // Await the params Promise
    const resolvedParams = await params;
    
    // Decode the author name from the URL params.
    const authorName = decodeURIComponent(resolvedParams.author);
    const posts = await getPostsByAuthor(resolvedParams.author);
    
    return (
        <div className="max-w-4xl mx-auto">
            <p className="text-lg text-gray-400 text-center">Posts by</p>
            <h1 className="text-5xl font-bold mb-8 text-center text-white">{authorName}</h1>
            <div className="space-y-8">
                {posts && posts.length > 0 ? (
                    posts.map((post: Post) => (
                         <div key={post.id} className="p-6 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700/50 transition-colors duration-200 border border-gray-700">
                            <h2 className="text-3xl font-bold mb-2">
                                <Link href={`/posts/${post.id}`} className="text-white hover:text-blue-400 transition-colors">
                                    {post.title}
                                </Link>
                            </h2>
                            <p className="text-gray-300 mb-4 leading-relaxed">
                                {post.content?.substring(0, 200)}...
                            </p>
                            <Link href={`/posts/${post.id}`} className="text-blue-400 font-semibold hover:underline">
                                Click for More →
                            </Link>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-400">This author has not published any posts yet.</p>
                )}
            </div>
        </div>
    );
}