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
    const allSkills = [
        { name: 'Adobe Premiere Pro', label: 'ดีมาก', icon: <SiAdobepremierepro />, level: 85, color: '#9999FF' },
        { name: 'Final Cut Pro', label: 'ดีมาก', icon: <FaVideo />, level: 85, color: '#06b6d4' },
        { name: 'Adobe After Effects', label: 'ดี', icon: <SiAdobeaftereffects />, level: 60, color: '#CF96FD' },
        { name: 'Adobe Photoshop', label: 'ดี', icon: <SiAdobephotoshop />, level: 60, color: '#31A8FF' },
        { name: 'Adobe Illustrator', label: 'ปานกลาง', icon: <SiAdobeillustrator />, level: 40, color: '#FF9A00' },
        { name: 'Capcut', label: 'ดีมาก', icon: <FaCut />, level: 75, color: '#22d3ee' },
        { name: 'Canva', label: 'ดีมาก', icon: <SiCanva />, level: 75, color: '#00C4CC' },
        { name: 'Stable Diffusion', label: 'พื้นฐาน', icon: <FaBrain />, level: 30, color: '#14b8a6' },
    ];

    const equipmentSkills = [
        { name: 'ทักษะการใช้กล้อง', label: 'ดี', icon: <FaCamera />, level: 80, color: '#f59e0b' },
        { name: 'ทักษะการใช้โรนิน', label: 'ปานกลาง', icon: <FaFilm />, level: 60, color: '#ef4444' },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.2,
                staggerChildren: 0.06
            }
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }
        }
    };

    const SkillCard = ({ skill, index }: { skill: typeof allSkills[0], index: number }) => (
        <motion.div
            className="bento-card group cursor-default"
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <div className="flex items-center gap-3 mb-3">
                <div className="text-xl p-2.5 rounded-xl transition-all duration-300"
                     style={{
                         color: skill.color,
                         background: `${skill.color}12`
                     }}>
                    {skill.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate" style={{color: 'var(--text-primary)'}}>{skill.name}</div>
                    <div className="text-xs font-medium" style={{color: skill.color}}>({skill.label})</div>
                </div>
                <span className="font-mono text-xs font-bold tabular-nums px-2 py-1 rounded-lg"
                      style={{color: skill.color, background: `${skill.color}10`}}>
                    {skill.level}%
                </span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{background: 'rgba(255,255,255,0.04)'}}>
                <motion.div
                    className="h-full rounded-full relative overflow-hidden"
                    style={{background: `linear-gradient(90deg, ${skill.color}, ${skill.color}88)`}}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] as const }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer"></div>
                </motion.div>
            </div>
        </motion.div>
    );

    return (
        <section id="skills" className="py-[100px] px-5 relative" style={{backgroundColor: 'var(--bg-primary)'}}>
            {/* Background decoration */}
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 pointer-events-none opacity-30"
                 style={{background: 'radial-gradient(circle at 0% 100%, rgba(20, 184, 166, 0.06) 0%, transparent 50%)'}}></div>

            <motion.div
                className="max-w-[1200px] mx-auto relative z-[1]"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
            >
                <motion.div className="mb-16" variants={itemVariants}>
                    <h2 className="font-space text-3xl md:text-4xl font-bold flex items-baseline gap-3" style={{color: 'var(--text-primary)'}}>
                        <span className="font-mono text-lg" style={{color: '#06b6d4'}}>02.</span>
                        ทักษะและเทคโนโลยี
                    </h2>
                </motion.div>

                {/* Software Skills — Bento Grid */}
                <motion.div variants={itemVariants} className="mb-8">
                    <h3 className="font-space text-xl font-semibold mb-6 flex items-center gap-3" style={{color: 'var(--text-primary)'}}>
                        <div className="w-8 h-0.5 rounded-full" style={{background: 'linear-gradient(90deg, #06b6d4, transparent)'}}></div>
                        Skills
                    </h3>
                </motion.div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                    {allSkills.map((skill, index) => (
                        <SkillCard key={skill.name} skill={skill} index={index} />
                    ))}
                </div>

                {/* Equipment Skills */}
                <motion.div variants={itemVariants} className="mb-8">
                    <h3 className="font-space text-xl font-semibold mb-6 flex items-center gap-3" style={{color: 'var(--text-primary)'}}>
                        <div className="w-8 h-0.5 rounded-full" style={{background: 'linear-gradient(90deg, #14b8a6, transparent)'}}></div>
                        ทักษะการใช้อุปกรณ์
                    </h3>
                </motion.div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {equipmentSkills.map((skill, index) => (
                        <SkillCard key={skill.name} skill={skill} index={index} />
                    ))}
                </div>
            </motion.div>
        </section>
    );
};

export default Skills;
