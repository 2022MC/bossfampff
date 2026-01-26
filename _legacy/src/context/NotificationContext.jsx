import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes, FaQuestionCircle } from 'react-icons/fa';
// import '../components/Notification/Notification.css'; // Removed CSS import

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        message: '',
        onConfirm: null,
        onCancel: null
    });

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, []);

    const showNotification = useCallback((message, type = 'info') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);

        // Auto remove after 4 seconds
        setTimeout(() => {
            removeNotification(id);
        }, 4000);
    }, [removeNotification]);

    const showConfirm = useCallback((message) => {
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

    const getTypeStyles = (type) => {
        switch (type) {
            case 'success':
                return 'border-green-500/50 bg-green-500/10 text-green-400 shadow-[0_4px_12px_rgba(34,197,94,0.15)]';
            case 'error':
                return 'border-red-500/50 bg-red-500/10 text-red-500 shadow-[0_4px_12px_rgba(239,68,68,0.15)]';
            case 'warning':
                return 'border-amber-500/50 bg-amber-500/10 text-amber-500 shadow-[0_4px_12px_rgba(245,158,11,0.15)]'; // Amber-500 is ~ #f59e0b
            default: // info
                return 'border-blue-500/50 bg-blue-500/10 text-blue-400 shadow-[0_4px_12px_rgba(59,130,246,0.15)]';
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
                            className={`pointer-events-auto min-w-[300px] max-w-[400px] p-4 rounded-2xl border backdrop-blur-md flex items-start gap-3 shadow-lg ${getTypeStyles(notification.type)}`}
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
                            <div className="flex-1 text-sm font-medium leading-[1.4] text-text-primary/90">
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
                        className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 backdrop-blur-sm p-5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-bg-tertiary border border-glass-border p-8 rounded-[24px] max-w-[400px] w-full text-center shadow-2xl relative overflow-hidden"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                        >
                            {/* Background decoration */}
                            <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/20 blur-[40px] rounded-full pointer-events-none"></div>

                            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary text-3xl flex items-center justify-center mx-auto mb-5">
                                <FaQuestionCircle />
                            </div>
                            <h3 className="font-space text-xl font-bold text-text-primary mb-3">ยืนยันการทำรายการ</h3>
                            <p className="text-text-secondary text-base mb-8 leading-relaxed">{confirmState.message}</p>
                            <div className="flex gap-4">
                                <button
                                    className="flex-1 py-3 px-5 rounded-xl border border-border-color bg-transparent text-text-secondary font-semibold hover:bg-white/5 hover:text-text-primary transition-all duration-200"
                                    onClick={confirmState.onCancel}
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    className="flex-1 py-3 px-5 rounded-xl border-none bg-primary text-white font-semibold shadow-glow-primary hover:bg-secondary hover:-translate-y-0.5 transition-all duration-200"
                                    onClick={confirmState.onConfirm}
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
