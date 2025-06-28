import Link from 'next/link';

/**
 * Fetches all posts for a given author from the new API endpoint.
 * @param author - The URL-encoded name of the author.
 */
async function getPostsByAuthor(author: string) {
    const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : 'http://localhost:3000';
        
    const res = await fetch(`${baseUrl}/api/posts/author/${author}`, { 
        cache: 'no-store' 
    });
    
    if (!res.ok) {
        // If the response is not OK but not a 404, throw an error.
        // A 404 is a valid case where an author might not have posts.
        if (res.status !== 404) {
             throw new Error(`Failed to fetch posts for author: ${author}`);
        }
    }
    
    return res.json();
}

/**
 * The page component for displaying an author's profile and their posts.
 */
export default async function AuthorPage({ params }: { params: { author: string } }) {
    // Decode the author name from the URL params.
    const authorName = decodeURIComponent(params.author);
    const posts = await getPostsByAuthor(params.author);

    const postData: {
            id?: number;
            author?: string;
            title?: string;
            content?: string;
            created_at?: string;
            coin_address?: string;
    } = {};

    return (
        <div className="max-w-4xl mx-auto">
            <p className="text-lg text-gray-400 text-center">Posts by</p>
            <h1 className="text-5xl font-bold mb-8 text-center text-white">{authorName}</h1>
            <div className="space-y-8">
                {posts && posts.length > 0 ? (
                    posts.map((post: typeof postData) => (
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