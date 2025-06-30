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
            const rewardAmount = 0.1; // Example: 0.1 tokens per valid referral
            
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
                .select('referrer_address')
                .eq('id', referralId)
                .single();
                
            if (referral) {
                await updateReferralStats(referral.referrer_address);
            }
        }
        
        return NextResponse.json({ success: true, isValid });
        
    } catch (error) {
        console.error('Error validating referral:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

async function updateReferralStats(referrerAddress: string) {
    // Get current stats
    const { data: stats } = await supabase
        .from('referrals')
        .select('id, is_valid, reward_amount')
        .eq('referrer_address', referrerAddress);
        
    if (stats) {
        const totalReferrals = stats.length;
        const validReferrals = stats.filter(r => r.is_valid).length;
        const totalRewards = stats.reduce((sum, r) => sum + (r.reward_amount || 0), 0);
        
        // Upsert stats
        await supabase
            .from('referral_stats')
            .upsert({
                referrer_address: referrerAddress,
                total_referrals: totalReferrals,
                valid_referrals: validReferrals,
                total_rewards: totalRewards,
                updated_at: new Date().toISOString()
            });
    }
}