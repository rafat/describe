import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for server-side operations
);

export async function POST(request: NextRequest) {
    try {
        const { referrerAddress, postId, visitorInfo } = await request.json();
        
        // Get visitor IP and user agent
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
        const userAgent = request.headers.get('user-agent') || '';
        
        // Check if this IP has already been referred for this post by this referrer (prevent spam)
        const { data: existingReferral } = await supabase
            .from('referrals')
            .select('id')
            .eq('referrer_address', referrerAddress)
            .eq('post_id', postId)
            .eq('visitor_ip', ip.split(',')[0].trim()) // Take first IP if multiple
            .single();
            
        if (existingReferral) {
            return NextResponse.json({ success: false, message: 'Referral already tracked' });
        }
        
        // Insert new referral
        const { data, error } = await supabase
            .from('referrals')
            .insert({
                referrer_address: referrerAddress,
                post_id: parseInt(postId),
                visitor_ip: ip.split(',')[0].trim(),
                visitor_user_agent: userAgent,
                is_valid: false // Will be validated later based on user behavior
            })
            .select()
            .single();
            
        if (error) {
            console.error('Error inserting referral:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }
        
        return NextResponse.json({ success: true, referralId: data.id });
        
    } catch (error) {
        console.error('Error tracking referral:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}