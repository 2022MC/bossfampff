"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaExternalLinkAlt, FaCalendar, FaUser, FaTools, FaPlay } from 'react-icons/fa';

export interface ProjectData {
    id?: string;
    title?: string;
    type?: 'Video' | 'Graphic' | 'Other';
    videoUrl?: string;
    image?: string;
    category?: string;
    featured?: boolean;
    description?: string;
    challenge?: string;
    solution?: string;
    client?: string;
    year?: string | number;
    tech?: (string | { name: string; color?: string })[];
    demo?: string;
    group?: string;
    order?: number;
    createdAt?: number;
    [key: string]: any;
}

interface ProjectModalProps {
    project: ProjectData;
    onClose: () => void;
}

const ProjectModal = ({ project, onClose }: ProjectModalProps) => {
    const [isPlaying, setIsPlaying] = React.useState(false);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
            setIsPlaying(false);
        };
    }, []);

    if (!project) return null;

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    const modalVariants = {
        hidden: { y: 50, opacity: 0, scale: 0.95 },
        visible: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: { type: "spring" as const, duration: 0.5, bounce: 0.3 }
        },
        exit: { y: 50, opacity: 0, scale: 0.95 }
    };

    const getEmbedUrl = (url?: string) => {
        if (!url) return null;
        const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/;
        const youtubeMatch = url.match(youtubeRegex);
        if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1`;
        if (url.includes('facebook.com')) {
            const encodedUrl = encodeURIComponent(url);
            return `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&width=560&autoplay=1`;
        }
        return null;
    };

    const getYoutubeId = (url?: string) => {
        if (!url) return null;
        const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/;
        const youtubeMatch = url.match(youtubeRegex);
        return youtubeMatch ? youtubeMatch[1] : null;
    };

    const embedUrl = project.type === 'Video' ? getEmbedUrl(project.videoUrl) : null;
    const thumbnail = project.image || (project.type === 'Video' && getYoutubeId(project.videoUrl) ? `https://img.youtube.com/vi/${getYoutubeId(project.videoUrl)}/maxresdefault.jpg` : null);

    return (
        <motion.div
            className="fixed inset-0 z-[10000] flex justify-center items-center p-4 md:p-6"
            style={{background: 'rgba(2, 10, 24, 0.85)', backdropFilter: 'blur(12px)'}}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
        >
            <motion.div
                className="w-full max-w-[1280px] h-[90vh] md:h-auto md:max-h-[90vh] rounded-3xl shadow-2xl flex flex-col relative overflow-hidden"
                style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--glass-border)'
                }}
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    className="absolute top-4 right-4 z-50 w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 text-white border-none"
                    style={{background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)'}}
                    onClick={onClose}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(6, 182, 212, 0.3)';
                        e.currentTarget.style.transform = 'rotate(90deg)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(0,0,0,0.3)';
                        e.currentTarget.style.transform = 'rotate(0deg)';
                    }}
                >
                    <FaTimes />
                </button>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 p-6 md:p-10">
                        {/* LEFT: Video & Content */}
                        <div className="flex flex-col gap-6">
                            {/* Video player */}
                            <div className="w-full rounded-2xl overflow-hidden shadow-2xl relative" style={{ aspectRatio: '16/9', border: '1px solid var(--glass-border)' }}>
                                {project.type === 'Video' && embedUrl ? (
                                    (project.videoUrl?.includes('facebook.com') || isPlaying) ? (
                                        <iframe
                                            src={embedUrl}
                                            title={project.title}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="absolute inset-0 w-full h-full"
                                        />
                                    ) : (
                                        <div
                                            className="absolute inset-0 w-full h-full cursor-pointer group"
                                            onClick={() => setIsPlaying(true)}
                                        >
                                            <img
                                                src={thumbnail || 'https://via.placeholder.com/800x450?text=No+Preview'}
                                                alt={project.title}
                                                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.onerror = null;
                                                    const ytId = getYoutubeId(project.videoUrl);
                                                    if (ytId && target.src.includes('maxresdefault')) {
                                                        target.src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
                                                    } else {
                                                        target.src = 'https://via.placeholder.com/800x450?text=Video+Preview';
                                                    }
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="w-20 h-20 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-2xl"
                                                     style={{background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)'}}>
                                                    <FaPlay className="text-white text-3xl ml-1 drop-shadow-lg" />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    <img src={project.image || 'https://via.placeholder.com/800x450'} alt={project.title} className="w-full h-full object-cover" />
                                )}
                            </div>

                            {/* Title */}
                            <div className="pb-6" style={{borderBottom: '1px solid var(--glass-border)'}}>
                                <span className="text-xs uppercase tracking-[2px] font-semibold mb-2 block" style={{color: '#06b6d4'}}>{project.category || 'SERIES'}</span>
                                <h2 className="font-space text-2xl md:text-3xl font-bold leading-[1.15] mb-3" style={{color: 'var(--text-primary)'}}>{project.title}</h2>
                                {project.featured && (
                                    <span className="inline-block text-[11px] font-bold py-1 px-3 rounded-md uppercase tracking-wider"
                                          style={{background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#f59e0b'}}>
                                        ผลงานเด่น
                                    </span>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-6">
                                <section>
                                    <h3 className="text-lg font-semibold mb-3" style={{color: 'var(--text-primary)'}}>About the Project</h3>
                                    <p className="text-sm leading-relaxed" style={{color: 'var(--text-secondary)'}}>
                                        {project.description || "Video editor and colorist for this project, checking the visual tone and pacing."}
                                    </p>
                                </section>

                                {(project.challenge || project.solution) && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {project.challenge && (
                                            <section>
                                                <h3 className="text-base font-semibold mb-2" style={{color: 'var(--text-primary)'}}>The Challenge</h3>
                                                <p className="text-sm leading-relaxed" style={{color: 'var(--text-secondary)'}}>{project.challenge}</p>
                                            </section>
                                        )}
                                        {project.solution && (
                                            <section>
                                                <h3 className="text-base font-semibold mb-2" style={{color: 'var(--text-primary)'}}>The Solution</h3>
                                                <p className="text-sm leading-relaxed" style={{color: 'var(--text-secondary)'}}>{project.solution}</p>
                                            </section>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: Sidebar */}
                        <div className="flex flex-col gap-4 h-fit lg:sticky lg:top-0">
                            {/* Actions */}
                            <div className="flex flex-col gap-3">
                                {project.videoUrl && project.type === 'Video' && (
                                    <a href={project.videoUrl} target="_blank" rel="noopener noreferrer"
                                       className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-sm transition-all duration-200 text-white no-underline hover:-translate-y-0.5"
                                       style={{background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', boxShadow: '0 4px 14px rgba(6, 182, 212, 0.3)'}}>
                                        <FaExternalLinkAlt className="text-xs" /> Watch on Platform
                                    </a>
                                )}
                                {project.demo && project.type !== 'Video' && (
                                    <a href={project.demo} target="_blank" rel="noopener noreferrer"
                                       className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-sm transition-all duration-200 text-white no-underline hover:-translate-y-0.5"
                                       style={{background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', boxShadow: '0 4px 14px rgba(6, 182, 212, 0.3)'}}>
                                        <FaExternalLinkAlt className="text-xs" /> Live Demo
                                    </a>
                                )}
                            </div>

                            {/* Client & Year */}
                            <div className="rounded-2xl p-5 backdrop-blur-sm" style={{background: 'rgba(6, 182, 212, 0.04)', border: '1px solid var(--glass-border)'}}>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2.5 rounded-xl" style={{background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4'}}>
                                            <FaUser className="text-base" />
                                        </div>
                                        <div>
                                            <span className="block text-[10px] uppercase tracking-wider font-bold mb-0.5" style={{color: 'var(--text-tertiary)'}}>CLIENT</span>
                                            <span className="block text-sm font-medium" style={{color: 'var(--text-primary)'}}>{project.client || "Personal Project"}</span>
                                        </div>
                                    </div>
                                    <div className="h-px w-full" style={{background: 'var(--glass-border)'}} />
                                    <div className="flex items-start gap-4">
                                        <div className="p-2.5 rounded-xl" style={{background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4'}}>
                                            <FaCalendar className="text-base" />
                                        </div>
                                        <div>
                                            <span className="block text-[10px] uppercase tracking-wider font-bold mb-0.5" style={{color: 'var(--text-tertiary)'}}>YEAR</span>
                                            <span className="block text-sm font-medium" style={{color: 'var(--text-primary)'}}>{project.year || new Date().getFullYear()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tech Tags */}
                            <div className="rounded-2xl p-5 backdrop-blur-sm" style={{background: 'rgba(6, 182, 212, 0.04)', border: '1px solid var(--glass-border)'}}>
                                <h3 className="text-xs font-bold flex items-center gap-2 mb-3" style={{color: '#06b6d4'}}>
                                    <FaTools className="text-[10px]" /> ตำแหน่งที่ทำ
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {project.tech && project.tech.map((t, i) => {
                                        const techName = typeof t === 'string' ? t : t.name;
                                        return (
                                            <span key={i} className="py-1.5 px-3 rounded-lg text-xs font-medium"
                                                  style={{background: 'rgba(6, 182, 212, 0.08)', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)'}}>
                                                {techName}
                                            </span>
                                        );
                                    })}
                                    {(!project.tech || project.tech.length === 0) && (
                                        <span className="py-1.5 px-3 rounded-lg text-xs font-medium"
                                              style={{background: 'rgba(6, 182, 212, 0.08)', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)'}}>
                                            Editor
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Copyright */}
                            <div className="rounded-2xl p-5 backdrop-blur-sm mt-auto" style={{background: 'rgba(6, 182, 212, 0.02)', border: '1px solid var(--glass-border)'}}>
                                <h3 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{color: 'var(--text-tertiary)'}}>
                                    หมายเหตุ / ลิขสิทธิ์
                                </h3>
                                <p className="text-[10px] leading-relaxed font-medium" style={{color: 'var(--text-tertiary)'}}>
                                    © {new Date().getFullYear()} BossFam. All rights reserved.
                                    <br />
                                    ผลงานนี้จัดทำขึ้นเพื่อการศึกษาหรือแฟ้มสะสมผลงานเท่านั้น
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ProjectModal;
