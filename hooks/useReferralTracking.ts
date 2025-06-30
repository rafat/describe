// hooks/useReferralTracking.ts
'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

interface EngagementData {
    timeSpent: number;
    scrollDepth: number;
    interactions: number;
}

export function useReferralTracking(postId: string) {
    const searchParams = useSearchParams();
    const referrerAddress = searchParams.get('ref');
    const referralIdRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(Date.now());
    const engagementDataRef = useRef<EngagementData>({
        timeSpent: 0,
        scrollDepth: 0,
        interactions: 0
    });

    useEffect(() => {
        if (!referrerAddress) return;

        // Track the referral visit
        const trackReferral = async () => {
            try {
                const response = await fetch('/api/referrals/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        referrerAddress,
                        postId,
                        visitorInfo: {
                            timestamp: Date.now(),
                            userAgent: navigator.userAgent
                        }
                    })
                });
                
                const result = await response.json();
                if (result.success) {
                    referralIdRef.current = result.referralId;
                }
            } catch (error) {
                console.error('Error tracking referral:', error);
            }
        };

        trackReferral();

        // Track engagement
        const handleScroll = () => {
            const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
            engagementDataRef.current.scrollDepth = Math.max(engagementDataRef.current.scrollDepth, scrollPercent);
        };

        const handleInteraction = () => {
            engagementDataRef.current.interactions += 1;
        };

        window.addEventListener('scroll', handleScroll);
        document.addEventListener('click', handleInteraction);
        document.addEventListener('keydown', handleInteraction);

        // Validate referral on page unload or after 60 seconds
        const validateReferral = async () => {
            if (!referralIdRef.current) return;
            
            engagementDataRef.current.timeSpent = Date.now() - startTimeRef.current;
            
            try {
                await fetch('/api/referrals/validate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        referralId: referralIdRef.current,
                        engagementData: engagementDataRef.current
                    })
                });
            } catch (error) {
                console.error('Error validating referral:', error);
            }
        };

        const timer = setTimeout(validateReferral, 60000); // Validate after 1 minute
        
        const handleBeforeUnload = () => {
            validateReferral();
        };
        
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('keydown', handleInteraction);
            validateReferral(); // Validate on cleanup
        };
    }, [referrerAddress, postId]);

    return { referrerAddress, isTracked: !!referralIdRef.current };
}
