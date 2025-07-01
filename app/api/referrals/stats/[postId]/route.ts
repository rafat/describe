// app/api/referrals/stats/[address]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ postId: number }> } 
) {
    try {
        const { postId } = await params;
        
        const { data: stats, error } = await supabase
            .from('referral_stats')
            .select('*')
            .eq('post_id', postId)
            .single();
            
        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }
        
        const defaultStats = {
            total_referrals: 0,
            valid_referrals: 0,  
            total_rewards: 0,
            claimed_rewards: 0
        };
        
        return NextResponse.json({ 
            success: true, 
            stats: stats || defaultStats 
        });
        
    } catch (error) {
        console.error('Error fetching referral stats:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
