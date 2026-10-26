"use client";

import React from 'react';
import { FaArrowDown } from 'react-icons/fa';
import { motion } from 'framer-motion';
import WeatherWidget from './WeatherWidget';
import ShootingStars from './ShootingStars';

const Hero = () => {

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.3,
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }
        }
    };

    const letterVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: 0.8 + i * 0.04,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1] as const
            }
        })
    };

    const name1 = "แก้นิดเดียว";
    const name2 = "ใจสั่นทั้งไทม์ไลน์";

    // Use Intl.Segmenter to properly split Thai text into grapheme clusters
    const segmenter = new Intl.Segmenter('th', { granularity: 'grapheme' });
    const splitGraphemes = (text: string) => [...segmenter.segment(text)].map(s => s.segment);

    return (
        <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-[120px] px-5 pb-20 transition-colors duration-300"
            style={{
                backgroundColor: 'var(--bg-primary)',
                background: 'radial-gradient(ellipse at 50% 0%, rgba(56, 189, 248, 0.12) 0%, var(--bg-primary) 70%)'
            }}>

            {/* Mesh Gradient Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute w-[800px] h-[800px] -top-[20%] -left-[15%] rounded-full blur-[120px] opacity-40 animate-mesh-float"
                    style={{ background: 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, transparent 70%)' }}></div>
                <div className="absolute w-[600px] h-[600px] -bottom-[15%] -right-[10%] rounded-full blur-[120px] opacity-35 animate-mesh-float [animation-delay:-5s]"
                    style={{ background: 'radial-gradient(circle, rgba(45, 212, 191, 0.22) 0%, transparent 70%)' }}></div>
                <div className="absolute w-[500px] h-[500px] top-[30%] right-[15%] rounded-full blur-[120px] opacity-30 animate-mesh-float [animation-delay:-10s]"
                    style={{ background: 'radial-gradient(circle, rgba(129, 140, 248, 0.2) 0%, transparent 70%)' }}></div>

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 opacity-[0.035]"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(2, 132, 199, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(2, 132, 199, 0.3) 1px, transparent 1px)',
                        backgroundSize: '60px 60px'
                    }}></div>

                <ShootingStars />
            </div>

            <motion.div
                className="max-w-[900px] text-center relative z-[2] w-full"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={itemVariants} className="mb-8 flex justify-center">
                    <WeatherWidget />
                </motion.div>

                <motion.div className="mb-6" variants={itemVariants}>
                    <span className="font-space text-[clamp(14px,1.8vw,18px)] font-semibold tracking-[3px] uppercase px-5 py-2.5 rounded-full inline-block backdrop-blur-md shadow-sm"
                        style={{
                            color: '#0284c7',
                            background: 'rgba(255, 255, 255, 0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.95)',
                            boxShadow: '0 4px 15px -3px rgba(2, 132, 199, 0.12)'
                        }}>
                        ตัดไวกว่าใจเธอเปลี่ยน
                    </span>
                </motion.div>

                <h1 className="text-[clamp(48px,8vw,96px)] font-extrabold mb-4 leading-[1.1] tracking-[0px]">
                    <span className="block" style={{ color: 'var(--text-primary)' }}>
                        {splitGraphemes(name1).map((letter, i) => (
                            <motion.span
                                key={i}
                                custom={i}
                                variants={letterVariants}
                                initial="hidden"
                                animate="visible"
                                className="inline"
                            >
                                {letter}
                            </motion.span>
                        ))}
                    </span>
                    <span className="block bg-clip-text text-transparent bg-[length:300%_auto] animate-gradient-shift drop-shadow-sm"
                        style={{ backgroundImage: 'linear-gradient(135deg, #0284c7 0%, #0d9488 25%, #2563eb 50%, #0284c7 75%, #0d9488 100%)' }}>
                        {splitGraphemes(name2).map((letter, i) => (
                            <motion.span
                                key={i}
                                custom={i + name1.length}
                                variants={letterVariants}
                                initial="hidden"
                                animate="visible"
                                className="inline"
                            >
                                {letter}
                            </motion.span>
                        ))}
                    </span>
                </h1>

                <motion.h2 className="font-space text-[clamp(18px,3.5vw,28px)] font-normal mb-8 leading-[1.5] tracking-[-0.5px]" variants={itemVariants}
                    style={{ color: 'var(--text-secondary)' }}>
                    <span className="block mb-1">VideoEditor</span>
                    <span className="block text-[0.85em]" style={{ color: 'var(--text-tertiary)' }}>ชื่อเล่น : บอส</span>
                </motion.h2>

                <motion.p className="text-[clamp(14px,1.8vw,17px)] leading-[1.9] mb-14 max-w-[620px] mx-auto" variants={itemVariants}
                    style={{ color: 'var(--text-tertiary)' }}>
                    รับตัดต่อวิดีโอแต่ตัดใจไม่ได้ ประสบการณ์มากกว่า 2 ปี
                </motion.p>

                <motion.div className="flex gap-4 justify-center mb-24 flex-col sm:flex-row items-center w-full" variants={itemVariants}>
                    <a href="#projects" className="btn-primary w-full max-w-[260px] sm:w-auto text-center relative overflow-hidden group">
                        <span className="relative z-10">ดูผลงาน</span>
                        <div className="absolute inset-0 bg-gradient-hover opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </a>
                    <a href="#contact" className="btn-secondary w-full max-w-[260px] sm:w-auto text-center">
                        ติดต่อ
                    </a>
                </motion.div>

                <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10" variants={itemVariants}>
                    <a href="#about" className="flex flex-col items-center gap-2 no-underline text-xs font-medium tracking-[2px] uppercase transition-all duration-300 group" style={{ color: 'var(--text-tertiary)' }}>
                        <span>เลื่อนลง</span>
                        <FaArrowDown className="text-base animate-bounce group-hover:text-primary" style={{ color: '#0284c7' }} />
                    </a>
                </motion.div>
            </motion.div>
        </section>
    );
};

export default Hero;
