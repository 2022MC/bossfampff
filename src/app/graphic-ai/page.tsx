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
            if (e.key === 'Escape') setSelectedImage(null);
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

    return (
        <div className="min-h-screen pt-[100px] pb-20 px-5" style={{backgroundColor: 'var(--bg-primary)'}}>
            <div className="max-w-[1400px] mx-auto">
                <motion.section
                    className="text-center mb-14"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div>
                        <div className="flex flex-col items-center gap-3 mb-4">
                            <span className="text-sm tracking-[4px] uppercase font-semibold flex items-center gap-3"
                                  style={{color: '#06b6d4'}}>
                                <span className="w-8 h-px" style={{background: '#06b6d4'}}></span>
                                Graphic & AI
                                <span className="w-8 h-px" style={{background: '#06b6d4'}}></span>
                            </span>
                        </div>
                        <p className="text-base max-w-[500px] mx-auto leading-relaxed" style={{color: 'var(--text-secondary)'}}>
                            ผลงานกราฟฟิกและ AI Art
                        </p>
                    </div>
                </motion.section>

                <section>
                    {loading ? (
                        <div className="text-center p-12" style={{color: 'var(--text-secondary)'}}>
                            <svg className="animate-spin h-8 w-8 mx-auto mb-3" viewBox="0 0 24 24" style={{color: '#06b6d4'}}>
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                            Loading content...
                        </div>
                    ) : graphicWorks.length === 0 ? (
                        <div className="text-center p-12" style={{color: 'var(--text-secondary)'}}>ยังไม่มีผลงาน</div>
                    ) : (
                        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                            {graphicWorks.map((work) => {
                                const aspectRatio = work.size?.aspectRatio || '4/3';

                                return (
                                    <motion.div
                                        key={work.id}
                                        className={`relative break-inside-avoid bento-card !p-0 overflow-hidden group cursor-pointer ${work.featured ? 'ring-1 ring-cyan-500/30' : ''}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5 }}
                                        onClick={() => setSelectedImage(work)}
                                    >
                                        <div
                                            className="relative w-full overflow-hidden"
                                            style={{ aspectRatio: aspectRatio.replace('/', '/'), background: 'rgba(0,0,0,0.2)' }}
                                        >
                                            <img
                                                src={work.image}
                                                alt={work.title}
                                                loading="lazy"
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                                                <div className="inline-block text-white text-[10px] font-bold px-2.5 py-1 rounded-md backdrop-blur-sm self-start transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-100"
                                                     style={{background: 'rgba(6, 182, 212, 0.8)'}}>
                                                    {work.category}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <h3 className="font-space text-base font-bold mb-1.5 line-clamp-1 transition-colors duration-200"
                                                style={{color: 'var(--text-primary)'}}>{work.title}</h3>
                                            <p className="text-xs line-clamp-2 leading-relaxed mb-3" style={{color: 'var(--text-secondary)'}}>{work.description}</p>
                                            <div className="flex flex-wrap gap-1">
                                                {work.tech && work.tech.map((tech, techIndex) => {
                                                    const techName = typeof tech === 'string' ? tech : tech.name;
                                                    const color = typeof tech === 'object' ? tech.color : undefined;
                                                    const style = color ? {
                                                        color: color,
                                                        backgroundColor: `${color}15`,
                                                        borderColor: `${color}30`
                                                    } : {
                                                        color: 'var(--text-tertiary)',
                                                        backgroundColor: 'rgba(6, 182, 212, 0.06)',
                                                        borderColor: 'var(--glass-border)'
                                                    };
                                                    return (
                                                        <span
                                                            key={techIndex}
                                                            className="text-[9px] font-semibold px-2 py-0.5 rounded border"
                                                            style={style}
                                                        >
                                                            {techName}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {work.featured && (
                                            <div className="absolute top-3 left-3 text-[10px] font-bold px-2 py-1 rounded shadow-lg z-10 flex items-center gap-1"
                                                 style={{background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: '#000'}}>
                                                ✨ ผลงานเด่น
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>

            {/* Image Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        className="fixed inset-0 z-[2000] flex items-center justify-center p-5 cursor-zoom-out"
                        style={{background: 'rgba(2, 10, 24, 0.92)', backdropFilter: 'blur(12px)'}}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setSelectedImage(null)}
                    >
                        <motion.div
                            className="relative max-w-[1200px] w-full rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:h-auto cursor-default"
                            style={{backgroundColor: 'var(--bg-tertiary)'}}
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer text-white border-none"
                                style={{background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)'}}
                                onClick={() => setSelectedImage(null)}
                                onMouseEnter={(e) => {e.currentTarget.style.transform = 'rotate(90deg)'; e.currentTarget.style.background = 'rgba(6,182,212,0.3)';}}
                                onMouseLeave={(e) => {e.currentTarget.style.transform = 'rotate(0deg)'; e.currentTarget.style.background = 'rgba(0,0,0,0.4)';}}
                            >
                                <FaTimes size={18} />
                            </button>

                            <div className="w-full md:w-2/3 flex items-center justify-center p-0 md:h-auto overflow-hidden" style={{background: '#000'}}>
                                {selectedImage.image && (
                                    <img
                                        src={selectedImage.image}
                                        alt={selectedImage.title || ''}
                                        className="w-full h-full object-contain max-h-[50vh] md:max-h-[90vh]"
                                    />
                                )}
                            </div>

                            <div className="w-full md:w-1/3 p-6 md:p-8 flex flex-col overflow-y-auto max-h-[40vh] md:max-h-[90vh]"
                                 style={{background: 'var(--bg-secondary)', borderLeft: '1px solid var(--glass-border)'}}>
                                <h3 className="font-space text-xl md:text-2xl font-bold mb-3 leading-tight" style={{color: 'var(--text-primary)'}}>{selectedImage.title}</h3>
                                <div className="w-8 h-0.5 rounded-full mb-5" style={{background: '#06b6d4'}}></div>
                                <p className="leading-relaxed mb-6 text-sm" style={{color: 'var(--text-secondary)'}}>{selectedImage.description}</p>

                                <div className="mt-auto">
                                    <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{color: 'var(--text-tertiary)'}}>Technologies</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedImage.tech && selectedImage.tech.map((tech, techIndex) => {
                                            const techName = typeof tech === 'string' ? tech : tech.name;
                                            const color = typeof tech === 'object' ? tech.color : undefined;
                                            const style = color ? {
                                                color: color,
                                                backgroundColor: `${color}15`,
                                                borderColor: `${color}30`
                                            } : {
                                                color: 'var(--text-secondary)',
                                                backgroundColor: 'rgba(6, 182, 212, 0.06)',
                                                borderColor: 'var(--glass-border)'
                                            };
                                            return (
                                                <span
                                                    key={techIndex}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-medium border"
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
        </div>
    );
}
