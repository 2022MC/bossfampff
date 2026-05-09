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
        if (pass !== 'bossfampf') {
            router.push('/');
        }
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden transition-colors duration-300"
             style={{backgroundColor: 'var(--bg-primary)'}}>
            {/* Background Mesh */}
            <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] blur-[80px] z-[1] animate-mesh-float"
                 style={{background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 60%)'}}></div>
            <div className="absolute -bottom-[10%] -right-[10%] w-[50vw] h-[50vw] blur-[80px] z-[1] animate-mesh-float [animation-direction:reverse]"
                 style={{background: 'radial-gradient(circle, rgba(20, 184, 166, 0.15) 0%, transparent 60%)'}}></div>
            
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.02] z-[1]"
                 style={{
                     backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.5) 1px, transparent 1px)',
                     backgroundSize: '60px 60px'
                 }}></div>

            <div className="flex-1 flex items-center justify-center p-8 mt-20 relative z-[2]">
                <div className="bento-card !p-12 w-full max-w-[440px] flex flex-col items-center relative overflow-hidden">
                    {/* Gradient accent at top */}
                    <div className="absolute top-0 left-0 right-0 h-px"
                         style={{background: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.5), transparent)'}}></div>

                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                         style={{background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(20, 184, 166, 0.15))', border: '1px solid rgba(6, 182, 212, 0.2)'}}>
                        <span className="text-2xl">🔐</span>
                    </div>

                    <h2 className="text-center mb-4 font-space text-3xl font-bold bg-clip-text text-transparent"
                        style={{backgroundImage: 'linear-gradient(135deg, #22d3ee, #2dd4bf)'}}>
                        Admin Access
                    </h2>
                    <p className="text-center mb-10 leading-[1.6] text-sm" style={{color: 'var(--text-secondary)'}}>
                        Please login with Discord to continue.<br />You must have the required role to access.
                    </p>

                    <button
                        onClick={loginWithDiscord}
                        className="w-full py-4 border-none rounded-2xl text-base font-semibold cursor-pointer flex items-center justify-center gap-3 transition-all duration-300 text-white hover:-translate-y-0.5"
                        style={{
                            background: '#5865F2',
                            boxShadow: '0 4px 15px rgba(88, 101, 242, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#4752c4';
                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(88, 101, 242, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#5865F2';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(88, 101, 242, 0.3)';
                        }}
                    >
                        <FaDiscord className="text-xl" /> Login with Discord
                    </button>
                </div>
            </div>
        </div>
    );
}
