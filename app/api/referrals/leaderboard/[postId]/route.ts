import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
) {
    try {
        const { postId } = await params;
        
        // Get all referrals for this post with aggregated stats
        const { data: referrals, error } = await supabase
            .from('referrals')
            .select('referrer_address, is_valid, reward_amount, created_at')
            .eq('post_id', parseInt(postId));
            
        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }
        
        // Aggregate data by referrer address
        const leaderboardMap = new Map();
        
        referrals?.forEach(referral => {
            const address = referral.referrer_address;
            if (!leaderboardMap.has(address)) {
                leaderboardMap.set(address, {
                    referrer_address: address,
                    total_referrals: 0,
                    valid_referrals: 0,
                    total_rewards: 0,
                    latest_referral: referral.created_at
                });
            }
            
            const stats = leaderboardMap.get(address);
            stats.total_referrals += 1;
            if (referral.is_valid) {
                stats.valid_referrals += 1;
                stats.total_rewards += referral.reward_amount || 0;
            }
            
            // Update latest referral time
            if (new Date(referral.created_at) > new Date(stats.latest_referral)) {
                stats.latest_referral = referral.created_at;
            }
        });
        
        // Convert to array and sort by valid referrals
        const leaderboard = Array.from(leaderboardMap.values())
            .sort((a, b) => b.valid_referrals - a.valid_referrals);
        
        return NextResponse.json({ success: true, leaderboard });
        
    } catch (error) {
        console.error('Error fetching referral leaderboard:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}