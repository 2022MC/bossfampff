"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    FaCut,
    FaBrain,
    FaVideo,
    FaCamera,
    FaFilm,
} from 'react-icons/fa';
import {
    SiAdobepremierepro,
    SiAdobeaftereffects,
    SiAdobephotoshop,
    SiAdobeillustrator,
    SiCanva,
} from 'react-icons/si';

const Skills = () => {
    const skillCategories = [
        {
            title: 'Skills',
            skills: [
                { name: 'Adobe Premiere Pro (ดีมาก)', icon: <SiAdobepremierepro />, level: 85 },
                { name: 'Final Cut Pro (ดีมาก)', icon: <FaVideo />, level: 85 },
                { name: 'Adobe After Effects (ดี)', icon: <SiAdobeaftereffects />, level: 60 },
                { name: 'Adobe Photoshop (ดี)', icon: <SiAdobephotoshop />, level: 60 },
                { name: 'Adobe Illustrator (ปานกลาง)', icon: <SiAdobeillustrator />, level: 40 },
                { name: 'Capcut (ดีมาก)', icon: <FaCut />, level: 75 },
                { name: 'Canva (ดีมาก)', icon: <SiCanva />, level: 75 },
                { name: 'Stable Diffusion (พื้นฐาน)', icon: <FaBrain />, level: 30 },
            ]
        },
        {
            title: 'ทักษะการใช้อุปกรณ์',
            skills: [
                { name: 'ทักษะการใช้กล้อง (ดี)', icon: <FaCamera />, level: 80 },
                { name: 'ทักษะการใช้โรนิน (ปานกลาง)', icon: <FaFilm />, level: 60 },
            ]
        }
    ];

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

    return (
        <section id="skills" className="py-[100px] px-5 bg-bg-primary relative">
            <motion.div
                className="max-w-[1200px] mx-auto"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
            >
                <motion.div className="text-center mb-20" variants={itemVariants}>
                    <h2 className="font-space text-[clamp(32px,5vw,48px)] font-bold text-text-primary mb-4 flex items-center justify-center gap-4">
                        <span className="font-mono text-xl text-primary font-normal">02.</span>
                        ทักษะและเทคโนโลยี
                    </h2>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-10">
                    {skillCategories.map((category, categoryIndex) => (
                        <motion.div
                            key={category.title || categoryIndex}
                            className="bg-bg-tertiary p-10 rounded-[24px] border border-white/10 shadow-md transition-transform duration-300 hover:-translate-y-1.5 hover:border-white/10"
                            variants={itemVariants}
                        >
                            <h3 className="font-space text-2xl font-bold text-text-primary mb-8 pb-4 border-b border-white/10 inline-block w-full">{category.title}</h3>
                            <div className="flex flex-col gap-6">
                                {category.skills.map((skill, skillIndex) => (
                                    <motion.div
                                        key={skill.name || skillIndex}
                                        className="p-4 rounded-xl bg-white/[0.02] border border-transparent transition-all duration-300 hover:bg-white/5 hover:border-white/10 group"
                                        variants={itemVariants}
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className="text-2xl text-primary bg-primary/10 p-2 rounded-lg flex items-center justify-center">{skill.icon}</div>
                                            <span className="flex-1 text-base font-medium text-text-primary">{skill.name}</span>
                                            <span className="font-mono text-sm text-text-secondary">{skill.level}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-main rounded-full relative overflow-hidden"
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${skill.level}%` }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 1, delay: skillIndex * 0.1 }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer"></div>
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
};

export default Skills;
