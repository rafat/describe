import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const { postId, rewardAmount, minValidReferrals = 1 } = await request.json();
        
        // Get all referrers with minimum valid referrals
        const { data: referrals, error } = await supabase
            .from('referrals')
            .select('referrer_address, is_valid')
            .eq('post_id', parseInt(postId))
            .eq('is_valid', true);
            
        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }
        
        // Count valid referrals per address
        const referrerCounts = new Map();
        referrals?.forEach(ref => {
            const count = referrerCounts.get(ref.referrer_address) || 0;
            referrerCounts.set(ref.referrer_address, count + 1);
        });
        
        // Filter by minimum referrals
        const eligibleReferrers = Array.from(referrerCounts.entries())
            .filter(([_, count]) => count >= minValidReferrals)
            .map(([address, count]) => ({ address, count }));
        
        return NextResponse.json({ 
            success: true, 
            eligibleReferrers,
            totalRewardAmount: eligibleReferrers.length * rewardAmount
        });
        
    } catch (error) {
        console.error('Error calculating bulk rewards:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}