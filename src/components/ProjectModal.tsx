"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaGithub, FaExternalLinkAlt, FaCalendar, FaUser, FaTools, FaPlay } from 'react-icons/fa';

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

    // Prevent scrolling when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
            setIsPlaying(false); // Reset on close/unmount
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

    // Helper to get embed URL
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
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[10000] flex justify-center items-center p-4 md:p-6"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
        >
            <motion.div
                className="bg-[#0B1120] text-text-primary w-full max-w-[1280px] h-[90vh] md:h-auto md:max-h-[90vh] rounded-[24px] shadow-2xl flex flex-col relative border border-white/10 overflow-hidden"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    className="absolute top-4 right-4 z-50 bg-black/40 border border-white/10 backdrop-blur-md text-white w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-white/10 hover:rotate-90"
                    onClick={onClose}
                >
                    <FaTimes />
                </button>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 p-6 md:p-10">
                        {/* LEFT COLUMN: Video & Main Content */}
                        <div className="flex flex-col gap-6">
                            {/* Video / Image Player */}
                            <div className="w-full bg-black rounded-xl overflow-hidden shadow-2xl border border-white/5 relative group" style={{ aspectRatio: '16/9' }}>
                                {project.type === 'Video' && embedUrl ? (
                                    // Special handle for Facebook: Render iframe directly to avoid black screen / missing thumbnail issues
                                    // For YouTube/Others: Use the clean Click-to-Play overlay
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
                                                className="w-full h-full object-cover opacity-90 transition-opacity duration-300 group-hover:opacity-100"
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

                                            {/* Custom Play Button Overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30 shadow-2xl">
                                                    <FaPlay className="text-white text-3xl ml-1 drop-shadow-lg" />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    <img src={project.image || 'https://via.placeholder.com/800x450'} alt={project.title} className="w-full h-full object-cover" />
                                )}
                            </div>

                            {/* Title & Header */}
                            <div className="border-b border-white/5 pb-6">
                                <span className="font-outfit text-sm text-[#818cf8] uppercase tracking-[2px] font-semibold mb-2 block">{project.category || 'SERIES'}</span>
                                <h2 className="font-outfit text-[2rem] md:text-[2.5rem] font-bold text-white leading-[1.1] mb-4">{project.title}</h2>
                                {project.featured && <span className="inline-block bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 text-[0.7rem] font-bold py-1.5 px-3 rounded-md uppercase tracking-wider">Featured Project</span>}
                            </div>

                            {/* Description Content */}
                            <div className="text-base text-gray-400 leading-relaxed space-y-6">
                                <section>
                                    <h3 className="font-outfit text-xl text-white mb-3 font-semibold">About the Project</h3>
                                    <p>{project.description || "Video editor and colorist for this project, checking the visual tone and pacing."}</p>
                                </section>

                                {(project.challenge || project.solution) && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {project.challenge && (
                                            <section>
                                                <h3 className="font-outfit text-lg text-white mb-2 font-semibold">The Challenge</h3>
                                                <p className="text-sm">{project.challenge}</p>
                                            </section>
                                        )}
                                        {project.solution && (
                                            <section>
                                                <h3 className="font-outfit text-lg text-white mb-2 font-semibold">The Solution</h3>
                                                <p className="text-sm">{project.solution}</p>
                                            </section>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Sidebar (Actions, Meta, Tags) */}
                        <div className="flex flex-col gap-5 h-fit lg:sticky lg:top-0">
                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3">
                                {project.videoUrl && project.type === 'Video' && (
                                    <a href={project.videoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-base transition-all duration-200 bg-[#5865F2] text-white hover:bg-[#4752c4] hover:shadow-lg no-underline shadow-[0_4px_14px_0_rgba(88,101,242,0.39)]">
                                        <FaExternalLinkAlt className="text-sm" /> Watch on Platform
                                    </a>
                                )}
                                {project.demo && project.type !== 'Video' && (
                                    <a href={project.demo} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-base transition-all duration-200 bg-[#5865F2] text-white hover:bg-[#4752c4] hover:shadow-lg no-underline shadow-[0_4px_14px_0_rgba(88,101,242,0.39)]">
                                        <FaExternalLinkAlt className="text-sm" /> Live Demo
                                    </a>
                                )}
                            </div>

                            {/* Client & Year Card */}
                            <div className="bg-[#111827]/50 rounded-2xl border border-white/5 p-5 backdrop-blur-sm">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2.5 rounded-lg bg-[#5865F2]/20 text-[#5865F2]">
                                            <FaUser className="text-lg" />
                                        </div>
                                        <div>
                                            <span className="block text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-0.5">CLIENT</span>
                                            <span className="block text-base text-white font-medium">{project.client || "Personal Project"}</span>
                                        </div>
                                    </div>
                                    <div className="h-px bg-white/5 w-full" />
                                    <div className="flex items-start gap-4">
                                        <div className="p-2.5 rounded-lg bg-[#5865F2]/20 text-[#5865F2]">
                                            <FaCalendar className="text-lg" />
                                        </div>
                                        <div>
                                            <span className="block text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-0.5">YEAR</span>
                                            <span className="block text-base text-white font-medium">{project.year || new Date().getFullYear()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Role / Position Tags */}
                            <div className="bg-[#111827]/50 rounded-2xl border border-white/5 p-5 backdrop-blur-sm">
                                <h3 className="font-outfit text-sm text-[#A78BFA] mb-3 font-bold flex items-center gap-2">
                                    <FaTools className="text-xs" /> ตำแหน่งที่ทำ
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {project.tech && project.tech.map((t, i) => {
                                        const techName = typeof t === 'string' ? t : t.name;
                                        return (
                                            <span key={i} className="bg-[#1F2937] text-gray-300 py-1.5 px-3 rounded-lg text-xs border border-white/5 font-medium">
                                                {techName}
                                            </span>
                                        );
                                    })}
                                    {(!project.tech || project.tech.length === 0) && (
                                        <span className="bg-[#1F2937] text-gray-300 py-1.5 px-3 rounded-lg text-xs border border-white/5 font-medium">Editor</span>
                                    )}
                                </div>
                            </div>

                            {/* Copyright */}
                            <div className="bg-[#111827]/30 rounded-2xl border border-white/5 p-5 backdrop-blur-sm mt-auto">
                                <h3 className="font-outfit text-xs text-gray-500 mb-2 font-bold uppercase tracking-wider">
                                    หมายเหตุ / ลิขสิทธิ์
                                </h3>
                                <p className="text-[10px] text-gray-600 leading-relaxed font-medium">
                                    © {new Date().getFullYear()} BossFam. All rights reserved.
                                    <br />
                                    ผลงานนี้จัดทำขึ้นเพื่อการศึกษาหรือแฟ้มสะสมผลงานเท่านั้น ห้ามนำไปใช้ในเชิงพาณิชย์โดยไม่ได้รับอนุญาต
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
