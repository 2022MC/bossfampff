"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DiscordCallbackPage() {
    const [status, setStatus] = useState('Processing login...');
    const [error, setError] = useState<string | null>(null);
    const { handleDiscordCallback } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const processLogin = async () => {
            // 1. Parse hash params (Implicit Grant returns params in hash)
            // Next.js useSearchParams only gets query params. Metadata/hash is client-side.
            if (typeof window === 'undefined') return;

            const hash = window.location.hash.slice(1);
            const fragment = new URLSearchParams(hash);
            const accessToken = fragment.get('access_token');
            const tokenType = fragment.get('token_type');
            const errorParam = fragment.get('error');

            if (errorParam) {
                setError('Login denied by user or Discord error.');
                return;
            }

            if (!accessToken) {
                // Sometimes it might be query params? Discord Implicit Grant uses Hash usually.
                // Fallback to check search params just in case (though unlikely for implicit)
                const searchParams = new URLSearchParams(window.location.search);
                const queryError = searchParams.get('error');
                if (queryError) {
                    setError('Login denied by user or Discord error.');
                    return;
                }

                // If strictly no hash, wait? Or error.
                if (!hash) {
                    // Could be initial render before hash is available or wrong URL
                    // setError('No access token received.'); // Delay error to let hash load?
                    return;
                }

                setError('No access token received.');
                return;
            }

            try {
                setStatus('Checking your roles...');
                await handleDiscordCallback(accessToken, tokenType || 'Bearer');
                router.push('/admin');
            } catch (err: any) {
                setError(err.message || 'Authentication failed');
            }
        };

        processLogin();
    }, [handleDiscordCallback, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-primary text-text-primary">
            <div className="bg-bg-tertiary p-8 rounded-2xl shadow-xl flex flex-col items-center gap-4 border border-white/5">
                {error ? (
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-red-500 mb-2">Access Denied</h2>
                        <p className="text-text-secondary mb-4">{error}</p>
                        <button onClick={() => router.push('/login')} className="btn-primary px-4 py-2 rounded-lg bg-primary text-white">
                            Back to Login
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                        <h2 className="font-space text-lg">{status}</h2>
                    </div>
                )}
            </div>
        </div>
    );
}
