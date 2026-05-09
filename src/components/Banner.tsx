"use client";

import React from 'react';
import { motion } from 'framer-motion';

const Banner = () => {
    return (
        <motion.section
            className="relative w-full overflow-hidden pt-[90px]"
            style={{ backgroundColor: 'var(--bg-primary)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
        >
            {/* Video Container */}
            <div className="relative w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[550px] xl:h-[600px]">
                <video
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                >
                    <source src="/banner.mp4" type="video/mp4" />
                </video>

                {/* Text Overlay */}
                <motion.div
                    className="absolute bottom-8 left-8 z-[2] sm:bottom-10 sm:left-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                >
                    <h2
                        className="font-space text-[clamp(18px,3vw,36px)] font-bold tracking-[0.12em] uppercase mb-4"
                        style={{
                            color: 'rgba(255,255,255,0.9)',
                            textShadow: '0 2px 20px rgba(0,0,0,0.6), 0 0 40px rgba(6, 182, 212, 0.3)',
                        }}
                    >
                        Typographic Style
                    </h2>
                    <a
                        href="https://www.tiktok.com/@_bosskung_/video/7606368411404274951"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer transition-all duration-300 hover:-translate-y-0.5"
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(10px)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(6, 182, 212, 0.8)';
                            e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.9)';
                            e.currentTarget.style.boxShadow = '0 0 20px rgba(6, 182, 212, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        ดูผลงาน →
                    </a>
                </motion.div>

                {/* Top gradient fade */}
                <div
                    className="absolute top-0 left-0 w-full h-[80px] z-[1] pointer-events-none"
                    style={{
                        background: 'linear-gradient(to bottom, var(--bg-primary) 0%, transparent 100%)',
                    }}
                />

                {/* Bottom gradient fade */}
                <div
                    className="absolute bottom-0 left-0 w-full h-[120px] z-[1] pointer-events-none"
                    style={{
                        background: 'linear-gradient(to top, var(--bg-primary) 0%, transparent 100%)',
                    }}
                />

                {/* Side vignette */}
                <div
                    className="absolute inset-0 z-[1] pointer-events-none"
                    style={{
                        background: 'radial-gradient(ellipse at center, transparent 50%, var(--bg-primary) 100%)',
                    }}
                />
            </div>
        </motion.section>
    );
};

export default Banner;
