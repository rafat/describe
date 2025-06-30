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
 * Fetches all posts for a given author from the API endpoint.
 * This function now correctly handles 404 errors for authors with no posts.
 * @param author - The URL-encoded name of the author.
 */
async function getPostsByAuthor(author: string): Promise<Post[]> {
    const baseUrl =
        process.env.NEXT_PUBLIC_URL 
            ? `https://${process.env.NEXT_PUBLIC_URL}`
            : 'http://localhost:3000';

    const res = await fetch(`${baseUrl}/api/posts/author/${author}`, {
        cache: 'no-store',
    });

    // If a 404 status is returned, it means the author has no posts.
    // Return an empty array to be handled gracefully by the UI.
    if (res.status === 404) {
        return [];
    }

    // If the response is not successful for any other reason, log the error and throw.
    if (!res.ok) {
        const errorBody = await res.text();
        console.error("Failed to fetch author posts. Status:", res.status, "Body:", errorBody);
        throw new Error(`Failed to fetch posts for author: ${author}`);
    }

    // If the response is successful, parse the JSON body.
    return res.json();
}

/**
 * The page component for displaying an author's profile and their posts.
 */
export default async function AuthorPage({ 
    params 
}: { 
    params: { author: string } 
}) {
    // Decode the original author name from the URL to preserve its casing for display.
    const authorNameForDisplay = decodeURIComponent(params.author);
    
    // Fetch posts using a lowercase version of the address to fix potential case-sensitivity issues in the API lookup.
    const posts = await getPostsByAuthor(params.author.toLowerCase());
    
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <p className="text-lg text-gray-400 text-center">Posts by</p>
            <h1 className="text-5xl font-bold mb-8 text-center text-white break-words">{authorNameForDisplay}</h1>
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
                                {post.content && post.content.length > 200 
                                    ? `${post.content.substring(0, 200)}...`
                                    : post.content
                                }
                            </p>
                            <Link href={`/posts/${post.id}`} className="text-blue-400 font-semibold hover:underline">
                                Click for More →
                            </Link>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-400 text-lg">This author has not published any posts yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
