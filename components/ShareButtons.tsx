'use client';

import { usePathname } from 'next/navigation';

interface ShareButtonsProps {
    postTitle: string;
}

export default function ShareButtons({ postTitle }: ShareButtonsProps) {
    const pathname = usePathname();
    const shareUrl = `https://your-domain.com${pathname}`; // Replace with your actual domain

    const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(postTitle)}`;
    const linkedInShareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(postTitle)}`;
    const redditShareUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(postTitle)}`;

    return (
        <div className="flex items-center space-x-4 my-6">
            <h3 className="text-lg font-semibold">Share this post:</h3>
            <a href={twitterShareUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                Twitter (X)
            </a>
            <a href={linkedInShareUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                LinkedIn
            </a>
            <a href={redditShareUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                Reddit
            </a>
        </div>
    );
}