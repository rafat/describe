'use client';

import { useState, useEffect } from 'react';
import { useWeb3 } from '@/context/Web3Provider';

interface ReferralStats {
    total_referrals: number;
    valid_referrals: number;
    total_rewards: number;
    claimed_rewards: number;
}

export default function ReferralDashboard() {
    const { account } = useWeb3();
    const [stats, setStats] = useState<ReferralStats | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!account) return;

        const fetchStats = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/referrals/stats/${account}`);
                const result = await response.json();
                if (result.success) {
                    setStats(result.stats);
                }
            } catch (error) {
                console.error('Error fetching referral stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [account]);

    if (!account) {
        return (

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">

                <h2 className="text-xl font-bold mb-4 text-white">Referral Dashboard</h2>

                <p className="text-gray-300">Connect your wallet to view referral stats</p>

            </div>

        );
    }

    if (loading) {
        return (

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">

                <h2 className="text-xl font-bold mb-4 text-white">Referral Dashboard</h2>

                <div className="animate-pulse space-y-4">

                    <div className="h-16 bg-gray-700 rounded"></div>

                    <div className="h-16 bg-gray-700 rounded"></div>

                </div>

            </div>

        );
    }

    return (

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">

            <h2 className="text-xl font-bold mb-4 text-white">Your Referral Stats</h2>

            {stats && (

                <div className="space-y-4">

                    <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">

                        <h3 className="text-sm font-medium text-gray-300 mb-1">Total Referrals</h3>

                        <p className="text-2xl font-bold text-blue-400">{stats.total_referrals}</p>

                    </div>

                    <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">

                        <h3 className="text-sm font-medium text-gray-300 mb-1">Valid Referrals</h3>

                        <p className="text-2xl font-bold text-green-400">{stats.valid_referrals}</p>

                    </div>

                    <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">

                        <h3 className="text-sm font-medium text-gray-300 mb-1">Total Rewards</h3>

                        <p className="text-2xl font-bold text-yellow-400">{stats.total_rewards.toFixed(4)}</p>

                    </div>

                    <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">

                        <h3 className="text-sm font-medium text-gray-300 mb-1">Unclaimed Rewards</h3>

                        <p className="text-2xl font-bold text-purple-400">

                            {(stats.total_rewards - stats.claimed_rewards).toFixed(4)}

                        </p>

                    </div>

                    

                    {/* Conversion Rate */}

                    <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">

                        <h3 className="text-sm font-medium text-gray-300 mb-1">Conversion Rate</h3>

                        <p className="text-lg font-bold text-cyan-400">

                            {stats.total_referrals > 0 

                                ? ((stats.valid_referrals / stats.total_referrals) * 100).toFixed(1)

                                : 0

                            }%

                        </p>

                    </div>

                </div>

            )}

        </div>

    );
}