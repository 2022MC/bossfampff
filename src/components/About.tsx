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
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    const features = [
        {
            icon: <FaCut />,
            title: 'Cutting and Editing',
            description: 'กระบวนการนำคลิปวิดีโอหรือภาพที่ถ่ายทำไว้ (ฟุตเทจ) มา "ตัด" (Cut) ส่วนที่ไม่ต้องการทิ้ง และนำส่วนที่ต้องการมา "เรียงลำดับ" (Edit) ต่อกันอย่างต่อเนื่อง เชื่อมโยงภาพและเสียงเข้าด้วยกัน'
        },
        {
            icon: <FaBrain />,
            title: 'Growth Mindset',
            description: 'การมี เป้าหมายชัดเจน, ทำงานเป็นระบบ, พัฒนาตัวเองสม่ำเสมอ'
        },
        {
            icon: <FaRocket />,
            title: 'One things at a time',
            description: 'วางแผนและจัดลำดับก่อนลงมือเสมอ มีสมาธิในการทำงานที่กำหนด'
        }
    ];

    return (
        <section id="about" className="py-[100px] px-5 bg-bg-secondary relative overflow-hidden">
            <motion.div
                className="max-w-[1200px] mx-auto relative z-[2]"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
            >
                <motion.div className="mb-[60px]" variants={itemVariants}>
                    <h2 className="font-space text-3xl md:text-4xl font-bold flex items-baseline gap-3">
                        <span className="text-primary font-space text-2xl md:text-3xl">01.</span>
                        เกี่ยวกับผม
                    </h2>
                </motion.div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-[60px] items-start">
                    <motion.div className="flex flex-col gap-6" variants={itemVariants}>
                        <p className="text-lg leading-[1.8] text-text-secondary text-justify">
                            สวัสดีครับ ผมชื่อ บอส ผมเป็นคนตัดต่อวิดีโอที่หลงใหลการเล่าเรื่องผ่านภาพและจังหวะ เสียง และอารมณ์ในทุกเฟรม งานของผมเน้นความลื่นไหล เรียบง่าย แต่มีพลัง ผมชอบการทำงานที่ใส่ใจรายละเอียด และพร้อมเรียนรู้เทคนิคใหม่ ๆ เพื่อให้ทุกโปรเจกต์ออกมาดีที่สุด เป้าหมายของผมคือการสร้างวิดีโอที่ทำให้คนดู "รู้สึก" และเชื่อมต่อกับเรื่องราวได้อย่างแท้จริง
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-5">
                            <div className="text-center p-6 bg-bg-tertiary rounded-2xl border border-white/10 transition-transform duration-300 hover:-translate-y-1 hover:border-primary">
                                <div className="font-space text-[32px] font-bold bg-gradient-text text-transparent bg-clip-text mb-2 inline-block">20+</div>
                                <div className="text-sm text-text-tertiary font-medium leading-[1.4]">โปรเจกต์ที่เสร็จแล้ว</div>
                            </div>
                            <div className="text-center p-6 bg-bg-tertiary rounded-2xl border border-white/10 transition-transform duration-300 hover:-translate-y-1 hover:border-primary">
                                <div className="font-space text-[32px] font-bold bg-gradient-text text-transparent bg-clip-text mb-2 inline-block">2 ปี</div>
                                <div className="text-sm text-text-tertiary font-medium leading-[1.4]">ประสบการณ์ด้าน <br />
                                    โปรดักชั่น <br />
                                    และ ตัดต่อ</div>
                            </div>
                            <div className="text-center p-6 bg-bg-tertiary rounded-2xl border border-white/10 transition-transform duration-300 hover:-translate-y-1 hover:border-primary">
                                <div className="font-space text-[32px] font-bold bg-gradient-text text-transparent bg-clip-text mb-2 inline-block">100%</div>
                                <div className="text-sm text-text-tertiary font-medium leading-[1.4]">ความมุ่งมั่น</div>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div className="flex flex-col gap-5" variants={itemVariants}>
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                className="flex flex-col items-start p-8 bg-bg-primary/60 rounded-[20px] border border-white/10 backdrop-blur-md transition-all duration-300 hover:translate-x-2.5 hover:border-secondary hover:bg-secondary/5"
                                variants={itemVariants}
                                whileHover={{ y: -10 }}
                            >
                                <div className="text-[32px] text-primary mb-4 bg-primary/10 p-3 rounded-xl inline-flex">{feature.icon}</div>
                                <h3 className="font-space text-xl font-semibold text-text-primary mb-2">{feature.title}</h3>
                                <p className="text-base text-text-secondary leading-[1.6]">{feature.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </motion.div>
        </section>
    );
};

export default About;
