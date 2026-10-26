"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes, FaQuestionCircle } from 'react-icons/fa';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
    id: number;
    message: string;
    type: NotificationType;
}

interface ConfirmState {
    isOpen: boolean;
    message: string;
    onConfirm: (() => void) | null;
    onCancel: (() => void) | null;
}

interface NotificationContextType {
    showNotification: (message: string, type?: NotificationType) => void;
    showConfirm: (message: string) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [confirmState, setConfirmState] = useState<ConfirmState>({
        isOpen: false,
        message: '',
        onConfirm: null,
        onCancel: null
    });

    const removeNotification = useCallback((id: number) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, []);

    const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);

        // Auto remove after 4 seconds
        setTimeout(() => {
            removeNotification(id);
        }, 4000);
    }, [removeNotification]);

    const showConfirm = useCallback((message: string): Promise<boolean> => {
        return new Promise((resolve) => {
            setConfirmState({
                isOpen: true,
                message,
                onConfirm: () => {
                    setConfirmState(prev => ({ ...prev, isOpen: false }));
                    resolve(true);
                },
                onCancel: () => {
                    setConfirmState(prev => ({ ...prev, isOpen: false }));
                    resolve(false);
                }
            });
        });
    }, []);

    const getTypeStyles = (type: NotificationType) => {
        switch (type) {
            case 'success':
                return 'border-emerald-500/30 bg-emerald-50/95 text-emerald-700 shadow-[0_8px_24px_rgba(16,185,129,0.15)]';
            case 'error':
                return 'border-rose-500/30 bg-rose-50/95 text-rose-700 shadow-[0_8px_24px_rgba(244,63,94,0.15)]';
            case 'warning':
                return 'border-amber-500/30 bg-amber-50/95 text-amber-700 shadow-[0_8px_24px_rgba(245,158,11,0.15)]';
            default: // info
                return 'border-sky-500/30 bg-sky-50/95 text-sky-700 shadow-[0_8px_24px_rgba(2,132,199,0.15)]';
        }
    };

    return (
        <NotificationContext.Provider value={{ showNotification, showConfirm }}>
            {children}
            <div className="fixed top-5 right-5 z-[10000] flex flex-col gap-2.5 pointer-events-none">
                <AnimatePresence>
                    {notifications.map((notification) => (
                        <motion.div
                            key={notification.id}
                            className={`pointer-events-auto min-w-[300px] max-w-[400px] p-4 rounded-2xl border backdrop-blur-xl flex items-start gap-3 shadow-lg ${getTypeStyles(notification.type)}`}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 50, scale: 0.9 }}
                            layout
                        >
                            <div className="text-xl mt-0.5 shrink-0">
                                {notification.type === 'success' && <FaCheckCircle />}
                                {notification.type === 'error' && <FaExclamationCircle />}
                                {notification.type === 'warning' && <FaExclamationCircle />}
                                {notification.type === 'info' && <FaInfoCircle />}
                            </div>
                            <div className="flex-1 text-sm font-medium leading-[1.4] text-slate-800">
                                <p>{notification.message}</p>
                            </div>
                            <button
                                className="w-6 h-6 rounded-full border border-current text-current opacity-60 hover:opacity-100 flex items-center justify-center text-xs shrink-0 cursor-pointer transition-opacity"
                                onClick={() => removeNotification(notification.id)}
                            >
                                <FaTimes />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {confirmState.isOpen && (
                    <motion.div
                        className="fixed inset-0 z-[10001] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="p-8 rounded-[24px] max-w-[400px] w-full text-center shadow-2xl relative overflow-hidden"
                            style={{
                                background: 'rgba(255, 255, 255, 0.92)',
                                backdropFilter: 'blur(24px) saturate(180%)',
                                border: '1px solid rgba(255, 255, 255, 0.95)',
                                boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.2)'
                            }}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                        >
                            {/* Background decoration */}
                            <div className="absolute -top-10 -right-10 w-24 h-24 bg-sky-400/20 blur-[40px] rounded-full pointer-events-none"></div>

                            <div className="w-16 h-16 rounded-full bg-sky-50 text-sky-600 border border-sky-100 text-3xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                                <FaQuestionCircle />
                            </div>
                            <h3 className="font-space text-xl font-bold text-slate-900 mb-3">ยืนยันการทำรายการ</h3>
                            <p className="text-slate-600 text-base mb-8 leading-relaxed">{confirmState.message}</p>
                            <div className="flex gap-4">
                                <button
                                    className="flex-1 py-3 px-5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-all duration-200 shadow-sm cursor-pointer"
                                    onClick={() => confirmState.onCancel && confirmState.onCancel()}
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    className="flex-1 py-3 px-5 rounded-xl border-none text-white font-semibold transition-all duration-200 cursor-pointer shadow-md hover:brightness-105"
                                    style={{
                                        background: 'linear-gradient(135deg, #0284c7, #0d9488)',
                                        boxShadow: '0 4px 15px rgba(2, 132, 199, 0.35)'
                                    }}
                                    onClick={() => confirmState.onConfirm && confirmState.onConfirm()}
                                >
                                    ยืนยัน
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </NotificationContext.Provider>
    );
};
