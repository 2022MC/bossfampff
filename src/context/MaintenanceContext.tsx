"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface MaintenanceData {
    enabled: boolean;
    message: string;
    estimatedEnd: string;
}

interface MaintenanceContextType {
    maintenance: MaintenanceData;
    isLoading: boolean;
}

const defaultMaintenance: MaintenanceData = {
    enabled: false,
    message: '',
    estimatedEnd: '',
};

const MaintenanceContext = createContext<MaintenanceContextType>({
    maintenance: defaultMaintenance,
    isLoading: true,
});

export const useMaintenanceContext = () => useContext(MaintenanceContext);

export function MaintenanceProvider({ children }: { children: React.ReactNode }) {
    const [maintenance, setMaintenance] = useState<MaintenanceData>(defaultMaintenance);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsub = onSnapshot(
            doc(db, 'settings', 'maintenance'),
            (snap) => {
                if (snap.exists()) {
                    const data = snap.data();
                    setMaintenance({
                        enabled: data.enabled ?? false,
                        message: data.message ?? '',
                        estimatedEnd: data.estimatedEnd ?? '',
                    });
                } else {
                    setMaintenance(defaultMaintenance);
                }
                setIsLoading(false);
            },
            (error) => {
                console.error('Error listening to maintenance status:', error);
                setIsLoading(false);
            }
        );

        return () => unsub();
    }, []);

    return (
        <MaintenanceContext.Provider value={{ maintenance, isLoading }}>
            {children}
        </MaintenanceContext.Provider>
    );
}
