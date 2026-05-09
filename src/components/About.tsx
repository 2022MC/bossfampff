"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FaCut, FaBrain, FaRocket } from 'react-icons/fa';

const About = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.2,
                staggerChildren: 0.08
            }
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }
        }
    };

    const stats = [
        { value: '20+', label: 'โปรเจกต์ที่เสร็จแล้ว' },
        { value: '2 ปี', label: 'ประสบการณ์ด้าน\nโปรดักชั่นและตัดต่อ' },
        { value: '100%', label: 'ความมุ่งมั่น' },
    ];

    const features = [
        {
            icon: <FaCut />,
            title: 'Cutting & Editing',
            description: 'กระบวนการนำคลิปวิดีโอหรือภาพที่ถ่ายทำไว้มา "ตัด" ส่วนที่ไม่ต้องการ และ "เรียงลำดับ" ต่อกันอย่างต่อเนื่อง',
            accent: '#06b6d4'
        },
        {
            icon: <FaBrain />,
            title: 'Growth Mindset',
            description: 'การมีเป้าหมายชัดเจน ทำงานเป็นระบบ พัฒนาตัวเองสม่ำเสมอ',
            accent: '#14b8a6'
        },
        {
            icon: <FaRocket />,
            title: 'One thing at a time',
            description: 'วางแผนและจัดลำดับก่อนลงมือเสมอ มีสมาธิในการทำงานที่กำหนด',
            accent: '#3b82f6'
        }
    ];

    return (
        <section id="about" className="py-[100px] px-5 relative overflow-hidden"
                 style={{backgroundColor: 'var(--bg-secondary)'}}>
            
            {/* Subtle background decoration */}
            <div className="absolute top-0 right-0 w-1/2 h-1/2 pointer-events-none opacity-30"
                 style={{background: 'radial-gradient(circle at 100% 0%, rgba(6, 182, 212, 0.06) 0%, transparent 50%)'}}></div>

            <motion.div
                className="max-w-[1200px] mx-auto relative z-[2]"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
            >
                <motion.div className="mb-16" variants={itemVariants}>
                    <h2 className="font-space text-3xl md:text-4xl font-bold flex items-baseline gap-3" style={{color: 'var(--text-primary)'}}>
                        <span className="font-mono text-lg" style={{color: '#06b6d4'}}>01.</span>
                        เกี่ยวกับผม
                    </h2>
                </motion.div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    
                    {/* About Text — Large Card */}
                    <motion.div className="lg:col-span-7 bento-card" variants={itemVariants}>
                        <p className="text-base lg:text-lg leading-[1.9]" style={{color: 'var(--text-secondary)'}}>
                            สวัสดีครับ ผมชื่อ <span style={{color: '#06b6d4'}} className="font-semibold">บอส</span> ผมเป็นคนตัดต่อวิดีโอที่หลงใหลการเล่าเรื่องผ่านภาพและจังหวะ เสียง และอารมณ์ในทุกเฟรม งานของผมเน้นความลื่นไหล เรียบง่าย แต่มีพลัง ผมชอบการทำงานที่ใส่ใจรายละเอียด และพร้อมเรียนรู้เทคนิคใหม่ ๆ เพื่อให้ทุกโปรเจกต์ออกมาดีที่สุด เป้าหมายของผมคือการสร้างวิดีโอที่ทำให้คนดู &ldquo;รู้สึก&rdquo; และเชื่อมต่อกับเรื่องราวได้อย่างแท้จริง
                        </p>
                    </motion.div>

                    {/* Stats Cards */}
                    <motion.div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-5" variants={itemVariants}>
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                className="bento-card text-center lg:text-left flex flex-col lg:flex-row lg:items-center lg:gap-5"
                                variants={itemVariants}
                            >
                                <div className="font-space text-3xl lg:text-4xl font-bold bg-clip-text text-transparent inline-block mb-1 lg:mb-0 lg:min-w-[80px]"
                                     style={{backgroundImage: 'linear-gradient(135deg, #22d3ee, #2dd4bf)'}}>
                                    {stat.value}
                                </div>
                                <div className="text-sm font-medium leading-[1.5] whitespace-pre-line" style={{color: 'var(--text-tertiary)'}}>
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Feature Cards — 3 across bottom */}
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="lg:col-span-4 bento-card group cursor-default"
                            variants={itemVariants}
                            whileHover={{ y: -6 }}
                        >
                            <div className="flex items-start gap-4">
                                <div className="text-2xl p-3 rounded-xl shrink-0 transition-all duration-300"
                                     style={{
                                         color: feature.accent,
                                         background: `${feature.accent}15`
                                     }}>
                                    {feature.icon}
                                </div>
                                <div>
                                    <h3 className="font-space text-lg font-semibold mb-2" style={{color: 'var(--text-primary)'}}>
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm leading-[1.7]" style={{color: 'var(--text-secondary)'}}>
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                            {/* Accent bar */}
                            <div className="mt-4 h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-full"
                                 style={{background: `linear-gradient(90deg, ${feature.accent}, transparent)`}}></div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
};

export default About;
