//app/api/referrals/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const { referralId, engagementData } = await request.json();
        
        // Define validation criteria (customize based on your needs)
        const isValid = engagementData.timeSpent > 30000 || // 30 seconds
                        engagementData.scrollDepth > 50 || // 50% scroll
                        engagementData.interactions > 0; // Any clicks/interactions
        
        if (isValid) {
            // Update referral as valid and calculate reward
            const rewardAmount = 10;
            
            const { error } = await supabase
                .from('referrals')
                .update({
                    is_valid: true,
                    reward_amount: rewardAmount
                })
                .eq('id', referralId);
                
            if (error) {
                return NextResponse.json({ success: false, error: error.message }, { status: 500 });
            }
            
            // Update referral stats
            const { data: referral } = await supabase
                .from('referrals')
                .select('referrer_address, post_id') // Fetch post_id as well
                .eq('id', referralId)
                .single();
                
            if (referral) {
                await updateReferralStats(referral.referrer_address, referral.post_id); // Pass post_id
            }
        }
        
        return NextResponse.json({ success: true, isValid });
        
    } catch (error) {
        console.error('Error validating referral:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

async function updateReferralStats(referrerAddress: string, postId: number) {
    // Get current stats
    const { data: stats } = await supabase
        .from('referral_stats')
        .select('*')
        .eq('referrer_address', referrerAddress)
        .eq('post_id', postId) // Include post_id in the query
        .single(); 
        
        const totalReferrals = stats ? stats.total_referrals + 1 : 1; // Increment total referrals
        const validReferrals = stats ? stats.valid_referrals + 1 : 1;   // Increment valid referrals
        const totalRewards = stats ? stats.total_rewards + 10 : 10;     // Increment total rewards; assume rewardAmount is 10
        
        if (stats) {
        // If stats already exist, update them
        await supabase
            .from('referral_stats')
            .update({
                total_referrals: totalReferrals,
                valid_referrals: validReferrals,
                total_rewards: totalRewards,
                updated_at: new Date().toISOString()
            })
            .eq('referrer_address', referrerAddress)
            .eq('post_id', postId);
    } else {
        // If no stats exist, create a new record
        await supabase
            .from('referral_stats')
            .insert({
                referrer_address: referrerAddress,
                post_id: postId,
                total_referrals: totalReferrals,
                valid_referrals: validReferrals,
                total_rewards: totalRewards,
                updated_at: new Date().toISOString()
            });
    }
}