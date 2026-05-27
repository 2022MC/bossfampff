"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { useMaintenanceContext } from '@/context/MaintenanceContext';
import { useAuth } from '@/context/AuthContext';
import MaintenancePage from './MaintenancePage';

// Routes that should always be accessible, even during maintenance
const BYPASS_ROUTES = ['/login', '/admin', '/auth'];

/**
 * MaintenanceGuard wraps page content and shows maintenance page
 * when maintenance mode is enabled. Admin users (logged in via Discord) bypass it.
 * The /login, /admin, and /auth routes are always accessible so admins can log in.
 */
const MaintenanceGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { maintenance, isLoading } = useMaintenanceContext();
    const { currentUser } = useAuth();
    const pathname = usePathname();

    // Check if current route should bypass maintenance
    const isBypassRoute = BYPASS_ROUTES.some(route => pathname?.startsWith(route));

    // Always allow access to bypass routes (login, admin, auth)
    if (isBypassRoute) {
        return <>{children}</>;
    }

    // While loading maintenance state, show nothing to avoid flash
    if (isLoading) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center"
                style={{ backgroundColor: 'var(--bg-primary, #020a18)' }}>
                <div className="flex flex-col items-center gap-4">
                    <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24" style={{ color: '#06b6d4' }}>
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                </div>
            </div>
        );
    }

    // If maintenance is on and user is NOT logged in as admin, show maintenance page
    if (maintenance.enabled && !currentUser) {
        return (
            <MaintenancePage
                message={maintenance.message}
                estimatedEnd={maintenance.estimatedEnd}
            />
        );
    }

    // Otherwise render normally (admin users or maintenance off)
    return <>{children}</>;
};

export default MaintenanceGuard;
