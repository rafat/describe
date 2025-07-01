// components/ShareButtons.tsx
'use client';

import { usePathname } from 'next/navigation';
import { FaTwitter, FaLinkedin, FaReddit } from 'react-icons/fa';
import { useWeb3 } from '@/context/Web3Provider';

interface ShareButtonsProps {
    postTitle: string;
}

export default function ShareButtons({ postTitle }: ShareButtonsProps) {
    const pathname = usePathname();
    const { account } = useWeb3();
    
    // Include referral parameter if user is connected
    const baseUrl = process.env.NEXT_PUBLIC_URL; // Replace with your actual domain
    const shareUrl = account 
        ? `${baseUrl}${pathname}?ref=${account}`
        : `${baseUrl}${pathname}`;
    console.log(shareUrl);

    const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(postTitle)}`;
    const linkedInShareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(postTitle)}`;
    const redditShareUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(postTitle)}`;

    return (
        <div className="flex items-center space-x-4 my-6">
            <h3 className="text-lg font-semibold">Share this post:</h3>
            {account ? (
                <>
                    <span className="text-sm text-green-400">✨ Earn rewards for successful referrals!</span>
                    <a href={twitterShareUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white" aria-label="Share on Twitter">
                        <FaTwitter size={24} />
                    </a>
                    <a href={linkedInShareUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white" aria-label="Share on LinkedIn">
                        <FaLinkedin size={24} />
                    </a>
                    <a href={redditShareUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white" aria-label="Share on Reddit">
                        <FaReddit size={24} />
                    </a>
                </>
            ) : (
                <span className="text-sm text-gray-400">Connect wallet to earn rewards from sharing</span>
            )}
        </div>
    );
}
