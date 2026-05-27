"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaTools, FaClock, FaEnvelope } from 'react-icons/fa';

interface MaintenancePageProps {
    message?: string;
    estimatedEnd?: string;
}

const MaintenancePage: React.FC<MaintenancePageProps> = ({ message, estimatedEnd }) => {
    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 600);
        return () => clearInterval(interval);
    }, []);

    // Animated gear component
    const Gear = ({ size, delay, x, y }: { size: number; delay: number; x: string; y: string }) => (
        <motion.div
            className="absolute pointer-events-none"
            style={{ left: x, top: y }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8 + delay * 2, repeat: Infinity, ease: 'linear' }}
        >
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="rgba(6,182,212,0.12)" strokeWidth="1">
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
            </svg>
        </motion.div>
    );

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: 'var(--bg-primary, #020a18)' }}>

            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-[-30%] right-[-20%] w-[80vw] h-[80vw] blur-[120px] pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(6, 182, 212, 0.06) 0%, transparent 60%)' }} />
                <div className="absolute bottom-[-30%] left-[-20%] w-[70vw] h-[70vw] blur-[100px] pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(20, 184, 166, 0.05) 0%, transparent 60%)' }} />

                {/* Floating gears */}
                <Gear size={120} delay={0} x="10%" y="15%" />
                <Gear size={80} delay={1} x="80%" y="20%" />
                <Gear size={100} delay={2} x="75%" y="70%" />
                <Gear size={60} delay={3} x="15%" y="75%" />
                <Gear size={90} delay={1.5} x="50%" y="10%" />
            </div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(rgba(6,182,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,1) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px'
                }} />

            {/* Content */}
            <motion.div
                className="relative z-10 text-center px-6 max-w-[600px] mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
                {/* Animated icon */}
                <motion.div
                    className="w-24 h-24 mx-auto mb-8 rounded-3xl flex items-center justify-center relative"
                    style={{
                        background: 'linear-gradient(135deg, rgba(6,182,212,0.12), rgba(20,184,166,0.08))',
                        border: '1px solid rgba(6,182,212,0.15)',
                        boxShadow: '0 0 60px rgba(6,182,212,0.1)',
                    }}
                    animate={{
                        boxShadow: [
                            '0 0 60px rgba(6,182,212,0.1)',
                            '0 0 80px rgba(6,182,212,0.2)',
                            '0 0 60px rgba(6,182,212,0.1)',
                        ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                >
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <FaTools className="text-4xl" style={{ color: '#06b6d4' }} />
                    </motion.div>
                </motion.div>

                {/* Title */}
                <h1 className="font-space text-3xl md:text-4xl font-bold mb-4"
                    style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                    กำลังปรับปรุงเว็บไซต์
                </h1>

                {/* Subtitle with animated dots */}
                <p className="text-lg mb-6 font-medium"
                    style={{ color: '#06b6d4' }}>
                    อยู่ระหว่างการอัปเดต{dots}
                </p>

                {/* Message */}
                <p className="text-base mb-8 leading-relaxed max-w-[450px] mx-auto"
                    style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                    {message || 'เว็บไซต์กำลังอยู่ในระหว่างการปรับปรุง เพื่อให้บริการที่ดียิ่งขึ้น กรุณากลับมาใหม่ในภายหลัง'}
                </p>

                {/* Estimated End Time */}
                {estimatedEnd && (
                    <motion.div
                        className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl mb-8"
                        style={{
                            background: 'rgba(6,182,212,0.06)',
                            border: '1px solid rgba(6,182,212,0.12)',
                        }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <FaClock style={{ color: '#06b6d4' }} />
                        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                            คาดว่าจะกลับมาใช้งานได้: <strong style={{ color: '#06b6d4' }}>{estimatedEnd}</strong>
                        </span>
                    </motion.div>
                )}

                {/* Contact */}
                <motion.div
                    className="flex items-center justify-center gap-2 text-sm"
                    style={{ color: 'var(--text-tertiary, #64748b)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <FaEnvelope />
                    <span>ติดต่อ: </span>
                    <a href="mailto:nathasit.mac@gmail.com"
                        className="font-medium transition-colors duration-200"
                        style={{ color: '#06b6d4' }}
                    >
                        nathasit.mac@gmail.com
                    </a>
                </motion.div>

                {/* Animated progress bar */}
                <motion.div
                    className="mt-10 h-1 rounded-full overflow-hidden max-w-[200px] mx-auto"
                    style={{ background: 'rgba(6,182,212,0.1)' }}
                >
                    <motion.div
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #06b6d4, #14b8a6)' }}
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                </motion.div>
            </motion.div>
        </div>
    );
};

export default MaintenancePage;
