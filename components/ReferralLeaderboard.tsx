// components/ReferralLeaderboard.tsx
'use client';

import { useState, useEffect } from 'react';
import RewardButton from './RewardButton';

interface LeaderboardEntry {
    referrer_address: string;
    total_referrals: number;
    valid_referrals: number;
    total_rewards: number;
    latest_referral: string;
}

interface ReferralLeaderboardProps {
    postId: string;
    coinAddress?: string;
    postAuthor?: string;
}

// Type guard to check if address is a valid 0x address
function isValidAddress(address: string | undefined): address is `0x${string}` {
    return typeof address === 'string' && address.startsWith('0x') && address.length === 42;
}

export default function ReferralLeaderboard({ postId, coinAddress }: ReferralLeaderboardProps) {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);


    useEffect(() => {
        if (!showLeaderboard) return;

        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/referrals/leaderboard/${postId}`);
                const result = await response.json();
                if (result.success) {
                    setLeaderboard(result.leaderboard);
                }
            } catch (error) {
                console.error('Error fetching referral leaderboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [postId, showLeaderboard]);

    return (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 w-full">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Referral Leaderboard</h2>
                <button
                    onClick={() => setShowLeaderboard(!showLeaderboard)}
                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors flex-shrink-0"
                >
                    {showLeaderboard ? 'Hide' : 'Show'}
                </button>
            </div>
            {showLeaderboard && (
                <>
                    {loading ? (
                        <div className="animate-pulse space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-16 bg-gray-700 rounded"></div>
                            ))}
                        </div>
                    ) : leaderboard.length > 0 ? (
                        <div className="space-y-3">
                            {leaderboard.map((entry, index) => (
                                <div key={entry.referrer_address} className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                    {/* Header with rank and address */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-lg font-bold text-yellow-400">
                                            #{index + 1}
                                        </span>
                                        <span className="text-gray-300 font-mono text-sm">
                                            {entry.referrer_address.slice(0, 6)}...{entry.referrer_address.slice(-4)}
                                        </span>
                                    </div>
                                    
                                    {/* Stats grid */}
                                    <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                                        <div>
                                            <span className="text-gray-400">Total:</span>
                                            <span className="text-blue-400 ml-1 font-semibold">
                                                {entry.total_referrals}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Valid:</span>
                                            <span className="text-green-400 ml-1 font-semibold">
                                                {entry.valid_referrals}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Rate:</span>
                                            <span className="text-cyan-400 ml-1 font-semibold">
                                                {entry.total_referrals > 0 
                                                    ? ((entry.valid_referrals / entry.total_referrals) * 100).toFixed(0)
                                                    : 0
                                                }%
                                            </span>
                                        </div>
                                    </div>
                                    {/* Reward Button - Full width container */}
                                    {isValidAddress(coinAddress) && 
                                     isValidAddress(entry.referrer_address) && 
                                     entry.valid_referrals > 0 && (
                                        <div className="w-full mb-3">
                                            <RewardButton
                                                coinAddress={coinAddress}
                                                recipientAddress={entry.referrer_address}
                                                customLabel={`Reward (${entry.valid_referrals} refs)`}
                                            />
                                        </div>
                                    )}
                                    
                                    {/* Latest activity */}
                                    <div className="mt-2 pt-2 border-t border-gray-600">
                                        <span className="text-xs text-gray-500">
                                            Latest referral: {new Date(entry.latest_referral).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-400">No referrals yet for this post.</p>
                            <p className="text-gray-500 text-sm mt-1">
                                Share your post to start earning referral rewards!
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}