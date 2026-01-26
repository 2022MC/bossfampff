"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ProjectData } from '@/components/ProjectModal';

export default function GraphicAIPage() {
    const [selectedImage, setSelectedImage] = useState<ProjectData | null>(null);
    const [graphicWorks, setGraphicWorks] = useState<ProjectData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadGraphicWorks();
    }, []);

    const loadGraphicWorks = async () => {
        try {
            const q = query(
                collection(db, "works"),
                where("type", "==", "Graphic")
            );

            const querySnapshot = await getDocs(q);
            const works = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as ProjectData[];

            works.sort((a, b) => {
                const orderA = a.order !== undefined ? a.order : 999999;
                const orderB = b.order !== undefined ? b.order : 999999;
                if (orderA !== orderB) return orderA - orderB;
                return (b.createdAt || 0) - (a.createdAt || 0);
            });

            setGraphicWorks(works);
        } catch (error) {
            console.error("Error loading works:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSelectedImage(null);
            }
        };
        if (selectedImage) {
            if (typeof window !== 'undefined') {
                document.addEventListener('keydown', handleEscape);
                document.body.style.overflow = 'hidden';
            }
        }
        return () => {
            if (typeof window !== 'undefined') {
                document.removeEventListener('keydown', handleEscape);
                document.body.style.overflow = 'unset';
            }
        };
    }, [selectedImage]);

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
        hidden: { y: 50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    return (
        <div className="min-h-screen bg-bg-primary pt-[100px] pb-20 px-5">
            <div className="max-w-[1400px] mx-auto">
                <motion.section
                    className="text-center mb-[60px]"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={itemVariants}>
                        <h1 className="font-space text-[clamp(40px,5vw,60px)] font-bold mb-4 flex flex-col items-center justify-center gap-2">
                            <span className="text-primary font-space-grotesk text-xl tracking-[5px] uppercase relative pl-[60px] before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[40px] before:h-[2px] before:bg-primary">Graphic & AI</span>
                        </h1>
                        <p className="text-[clamp(16px,2vw,18px)] text-text-secondary max-w-[600px] mx-auto leading-relaxed">
                            ผลงานกราฟฟิกและ AI Art
                        </p>
                    </motion.div>
                </motion.section>

                <motion.section
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {loading ? (
                        <div className="text-center p-12 text-text-secondary">Loading content...</div>
                    ) : graphicWorks.length === 0 ? (
                        <div className="text-center p-12 text-text-secondary">ยังไม่มีผลงาน</div>
                    ) : (
                        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5">
                            {graphicWorks.map((work) => {
                                const aspectRatio = work.size?.aspectRatio || '4/3';

                                return (
                                    <motion.div
                                        key={work.id}
                                        className={`break-inside-avoid bg-bg-tertiary rounded-[20px] overflow-hidden border border-white/5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl group cursor-pointer ${work.featured ? 'border-primary shadow-[0_0_20px_rgba(99,102,241,0.2)]' : ''}`}
                                        variants={itemVariants}
                                        onClick={() => setSelectedImage(work)}
                                    >
                                        <div
                                            className="relative w-full overflow-hidden bg-black/20"
                                            style={{ aspectRatio: aspectRatio.replace('/', '/') }} // CSS aspect-ratio supports / syntax but tailwind might need care. Inline style is safe.
                                        >
                                            <img
                                                src={work.image}
                                                alt={work.title}
                                                loading="lazy"
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                                                <div className="inline-block bg-primary/90 text-white text-xs font-bold px-2 py-1 rounded mb-2 backdrop-blur-sm self-start transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-100">
                                                    {work.category}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-5">
                                            <h3 className="font-space text-lg font-bold text-text-primary mb-2 line-clamp-1 group-hover:text-primary transition-colors">{work.title}</h3>
                                            <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed mb-4">{work.description}</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {work.tech && work.tech.map((tech, techIndex) => {
                                                    const techName = typeof tech === 'string' ? tech : tech.name;
                                                    const color = typeof tech === 'object' ? tech.color : undefined;
                                                    const style = color ? {
                                                        color: color,
                                                        backgroundColor: `${color}20`,
                                                        borderColor: `${color}40`
                                                    } : {};

                                                    return (
                                                        <span
                                                            key={techIndex}
                                                            className="text-[10px] font-semibold px-2 py-1 rounded bg-bg-primary text-text-tertiary border border-white/5"
                                                            style={style}
                                                        >
                                                            {techName}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {work.featured && (
                                            <div className="absolute top-3 left-3 bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 rounded shadow-lg z-10 flex items-center gap-1">
                                                ✨ ผลงานเด่น
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </motion.section>
            </div >

            {/* Image Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        className="fixed inset-0 bg-black/90 backdrop-blur-md z-[2000] flex items-center justify-center p-5 cursor-zoom-out"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => setSelectedImage(null)}
                    >
                        <motion.div
                            className="relative max-w-[1200px] w-full bg-bg-tertiary rounded-[24px] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:h-auto cursor-default"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.3, type: 'spring' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center border border-white/10 hover:bg-white hover:text-black transition-all duration-300 rotate-0 hover:rotate-90 md:top-4 md:right-4 md:bg-transparent md:border-none md:text-white/50 md:hover:text-white"
                                onClick={() => setSelectedImage(null)}
                            >
                                <FaTimes size={20} />
                            </button>

                            <div className="w-full md:w-2/3 bg-black flex items-center justify-center p-0 md:h-auto overflow-hidden">
                                <img
                                    src={selectedImage.image}
                                    alt={selectedImage.title}
                                    className="w-full h-full object-contain max-h-[50vh] md:max-h-[90vh]"
                                />
                            </div>

                            <div className="w-full md:w-1/3 p-6 md:p-8 flex flex-col overflow-y-auto max-h-[40vh] md:max-h-[90vh] bg-[#1a1f2e] border-l border-white/5">
                                <h3 className="font-space text-2xl md:text-3xl font-bold text-text-primary mb-4 leading-tight">{selectedImage.title}</h3>
                                <div className="w-10 h-1 bg-primary rounded-full mb-6"></div>
                                <p className="text-text-secondary leading-relaxed mb-8 text-base md:text-lg">{selectedImage.description}</p>

                                <div className="mt-auto">
                                    <h4 className="text-sm font-bold text-text-tertiary uppercase tracking-wider mb-3">Technologies</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedImage.tech && selectedImage.tech.map((tech, techIndex) => {
                                            const techName = typeof tech === 'string' ? tech : tech.name;
                                            const color = typeof tech === 'object' ? tech.color : undefined;
                                            const style = color ? {
                                                color: color,
                                                backgroundColor: `${color}20`,
                                                borderColor: `${color}40`
                                            } : {};
                                            return (
                                                <span
                                                    key={techIndex}
                                                    className="px-3 py-1.5 rounded-lg bg-bg-primary text-text-secondary text-sm border border-white/5 font-medium"
                                                    style={style}
                                                >
                                                    {techName}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
