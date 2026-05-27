"use client";

import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { MaintenanceProvider } from "@/context/MaintenanceContext";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <NotificationProvider>
                <MaintenanceProvider>
                    {children}
                </MaintenanceProvider>
            </NotificationProvider>
        </AuthProvider>
    );
}
