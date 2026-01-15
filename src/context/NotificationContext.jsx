import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes, FaQuestionCircle } from 'react-icons/fa';
import '../components/Notification/Notification.css';

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

    return (
        <NotificationContext.Provider value={{ showNotification, showConfirm }}>
            {children}
            <div className="notification-container">
                <AnimatePresence>
                    {notifications.map((notification) => (
                        <motion.div
                            key={notification.id}
                            className={`notification-toast ${notification.type}`}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 50, scale: 0.9 }}
                            layout
                        >
                            <div className="notification-icon">
                                {notification.type === 'success' && <FaCheckCircle />}
                                {notification.type === 'error' && <FaExclamationCircle />}
                                {notification.type === 'warning' && <FaExclamationCircle />}
                                {notification.type === 'info' && <FaInfoCircle />}
                            </div>
                            <div className="notification-content">
                                <p>{notification.message}</p>
                            </div>
                            <button
                                className="notification-close"
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
                        className="confirm-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="confirm-modal"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                        >
                            <div className="confirm-icon">
                                <FaQuestionCircle />
                            </div>
                            <h3 className="confirm-title">ยืนยันการทำรายการ</h3>
                            <p className="confirm-message">{confirmState.message}</p>
                            <div className="confirm-actions">
                                <button className="btn-confirm-cancel" onClick={confirmState.onCancel}>
                                    ยกเลิก
                                </button>
                                <button className="btn-confirm-ok" onClick={confirmState.onConfirm}>
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
