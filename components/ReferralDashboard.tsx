// components/ReferralDashboard.tsx
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ReferralStats {
    referrer_address: string;
    total_referrals: number;
    valid_referrals: number;
    total_rewards: number;
}

const ReferralDashboard: React.FC<{ postId: number }> = ({ postId }) => {
    const [stats, setStats] = useState<ReferralStats[]>([]);

    useEffect(() => {
        const fetchReferralStats = async () => {
            const { data, error } = await supabase
                .from('referral_stats')
                .select('referrer_address, total_referrals, valid_referrals, total_rewards')
                .eq('post_id', postId);

            if (error) {
                console.error("Error fetching referral stats:", error);
            } else {
                setStats(data);
            }
        };

        fetchReferralStats();
    }, [postId]);

    return (
        <div>
            <h2>Referral Dashboard for Post ID: {postId}</h2>
            <table>
                <thead>
                    <tr>
                        <th>Referrer Address</th>
                        <th>Total Referrals</th>
                        <th>Valid Referrals</th>
                        <th>Total Rewards</th>
                    </tr>
                </thead>
                <tbody>
                    {stats.map((stat) => (
                        <tr key={stat.referrer_address}>
                            <td>{stat.referrer_address}</td>
                            <td>{stat.total_referrals}</td>
                            <td>{stat.valid_referrals}</td>
                            <td>{stat.total_rewards}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ReferralDashboard;
