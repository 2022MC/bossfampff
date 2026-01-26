"use client";

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const { currentUser, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !currentUser) {
            router.push(`/login?redirect=${pathname}`);
        }
    }, [currentUser, loading, router, pathname]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-bg-primary text-text-primary">
                Loading...
            </div>
        );
    }

    if (!currentUser) {
        return null;
    }

    return <>{children}</>;
}
