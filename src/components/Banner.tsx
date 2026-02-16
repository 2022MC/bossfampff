"use client";

import React from 'react';
import Link from 'next/link';
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
                        className="font-space text-[clamp(18px,3vw,36px)] font-bold tracking-[0.12em] uppercase text-white/90 mb-4"
                        style={{
                            textShadow: '0 2px 20px rgba(0,0,0,0.6), 0 0 40px rgba(99,102,241,0.3)',
                        }}
                    >
                        Typographic Style
                    </h2>
                    <a
                        href="https://www.tiktok.com/@_bosskung_/video/7606368411404274951"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-white/10 border border-white/20 backdrop-blur-md cursor-pointer transition-all duration-300 hover:bg-primary hover:border-primary hover:shadow-glow-primary hover:-translate-y-0.5"
                    >
                        ดูผลงาน →
                    </a>
                </motion.div>

                {/* Top gradient fade — blends into Navbar */}
                <div
                    className="absolute top-0 left-0 w-full h-[80px] z-[1] pointer-events-none"
                    style={{
                        background: 'linear-gradient(to bottom, var(--bg-primary) 0%, transparent 100%)',
                    }}
                />

                {/* Bottom gradient fade — blends into next section */}
                <div
                    className="absolute bottom-0 left-0 w-full h-[120px] z-[1] pointer-events-none"
                    style={{
                        background: 'linear-gradient(to top, var(--bg-primary) 0%, transparent 100%)',
                    }}
                />

                {/* Subtle side vignette */}
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
