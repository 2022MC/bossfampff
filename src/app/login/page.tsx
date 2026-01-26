"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaDiscord } from 'react-icons/fa';

export default function LoginPage() {
    const { loginWithDiscord } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const pass = searchParams.get('pass');

        // Secret Key Logic: Check if pass === 'bossfampf'
        // If not, redirect to Home immediately.
        if (pass !== 'bossfampf') {
            router.push('/');
        }
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex flex-col theme-bg-primary relative overflow-hidden transition-colors duration-300">
            {/* Background Orbs */}
            <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] bg-[radial-gradient(circle,rgba(99,102,241,0.2)_0%,transparent_60%)] blur-[80px] z-[1] animate-float-orb"></div>
            <div className="absolute -bottom-[10%] -right-[10%] w-[50vw] h-[50vw] bg-[radial-gradient(circle,rgba(168,85,247,0.2)_0%,transparent_60%)] blur-[80px] z-[1] animate-float-orb [animation-direction:reverse]"></div>

            <div className="flex-1 flex items-center justify-center p-8 mt-20 relative z-[2]">
                <div className="glass-panel backdrop-blur-[20px] p-14 rounded-[24px] w-full max-w-[440px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] flex flex-col items-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/30">
                    <h2 className="text-center mb-6 font-space text-[2.5rem] font-bold bg-gradient-text text-transparent bg-clip-text">
                        Admin Access
                    </h2>
                    <p className="text-center theme-text-secondary mb-10 leading-[1.6] text-[1.05rem]">
                        Please login with Discord to continue.<br />You must have the required role to access.
                    </p>

                    <button
                        onClick={loginWithDiscord}
                        className="w-full p-4 bg-[#5865F2] text-white border-none rounded-xl text-[1.1rem] font-semibold cursor-pointer flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_4px_15px_rgba(88,101,242,0.4)] hover:bg-[#4752c4] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(88,101,242,0.5)] active:translate-y-0"
                    >
                        <FaDiscord className="text-[1.5rem]" /> Login with Discord
                    </button>
                </div>
            </div>
        </div>
    );
}
