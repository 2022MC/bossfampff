"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMapMarkerAlt, FaEnvelope, FaFacebook, FaShareAlt, FaInstagram, FaLink, FaCopy, FaTimes, FaPlay } from 'react-icons/fa';
import { SiLine } from 'react-icons/si';
import Link from 'next/link';

import ProjectModal, { ProjectData } from './ProjectModal';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface ProjectsProps {
    limit?: number;
}

const Projects = ({ limit }: ProjectsProps) => {
    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
    const [isBioExpanded, setIsBioExpanded] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [visibleCount, setVisibleCount] = useState(6);
    const [videoErrors, setVideoErrors] = useState<{ [key: number]: boolean }>({});
    const [videoLoading, setVideoLoading] = useState<{ [key: number]: boolean }>({});

    const handleCopyLink = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(window.location.href);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    useEffect(() => {
        loadVideoProjects();
    }, []);

    const loadVideoProjects = async () => {
        try {
            const q = query(
                collection(db, "works"),
                where("type", "==", "Video")
            );

            const querySnapshot = await getDocs(q);
            const works = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as ProjectData[];

            // Sort by order (asc), fallback to createdAt (desc)
            works.sort((a, b) => {
                const orderA = a.order !== undefined ? a.order : 999999;
                const orderB = b.order !== undefined ? b.order : 999999;
                if (orderA !== orderB) return orderA - orderB;
                return (b.createdAt || 0) - (a.createdAt || 0);
            });

            setProjects(works);
        } catch (error) {
            console.error("Error loading video projects:", error);
        }
    };

    const getYoutubeId = (url?: string) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const getEmbedUrl = (url?: string) => {
        if (!url) return null;

        const youtubeId = getYoutubeId(url);
        if (youtubeId) {
            return `https://www.youtube.com/embed/${youtubeId}`;
        }

        if (url.includes('facebook.com')) {
            const encodedUrl = encodeURIComponent(url);
            return `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&width=560`;
        }
        return null;
    };

    const itemVariants = {
        hidden: { y: 50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    const displayedProjects = limit ? projects.slice(0, limit) : projects.slice(0, visibleCount);

    return (
        <section id="projects" className="py-[80px] md:py-[100px] px-4 md:px-5 bg-bg-primary relative min-h-screen">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[radial-gradient(circle_at_100%_0%,rgba(99,102,241,0.15)_0%,transparent_60%)] z-0"></div>
            </div>

            <div className="max-w-[1280px] mx-auto relative z-1">
                <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 md:gap-12 items-start">
                    {/* Left Sidebar: Profile Card */}
                    <motion.div
                        className="glass-panel rounded-[24px] p-6 md:p-8 relative lg:sticky lg:top-24"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="relative mb-6">
                            <div className="relative w-32 h-32 mx-auto lg:mx-0">
                                <div className="w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-[#1e293b] shadow-lg">
                                    <img
                                        src="https://scontent.fbkk7-3.fna.fbcdn.net/v/t39.30808-6/591834656_2727646697568544_2737661402911912305_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHl79uEHD0cvSpC5D6Ko5zbM5R0j879GBgzlHSPzv0YGIsFiZpPl5daxGSQ67fLWL--ixKLXJXmdJVxmnrXfoSt&_nc_ohc=T9CAbKOPVYYQ7kNvwGFk23H&_nc_oc=AdmlFcskAfutTfGBq50ABQjmAY6RKyElnc-E-Mk-BJanUscKvnYKHkv6_S07gSxjzqU&_nc_zt=23&_nc_ht=scontent.fbkk7-3.fna&_nc_gid=LS3wB3nuO6Ie9lBmZjdE6w&oh=00_AfoFHWP80VvQVS1CPMD03etcA6fIk2oz2vV5g8GfgzR1pg&oe=697CBBD3"
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute bottom-2 right-2 bg-emerald-500 w-6 h-6 rounded-full border-4 border-white dark:border-[#1e293b] flex items-center justify-center">
                                </div>
                            </div>

                            <button
                                className="absolute top-0 right-0 text-text-secondary hover:text-text-primary transition-colors cursor-pointer p-2"
                                onClick={() => setIsShareOpen(true)}
                            >
                                <FaShareAlt />
                            </button>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-1 text-center lg:text-left">BossFam</h2>
                        <div className="flex items-center justify-center lg:justify-start gap-2 text-text-secondary mb-4 text-sm font-medium">
                            <FaMapMarkerAlt />
                            <span>Bangkok Thailand</span>
                        </div>

                        <p className="text-text-secondary text-sm mb-6 leading-relaxed text-center lg:text-left">
                            he/him
                            <br /><br />
                            Base in Bangkok TH Editor, Beginner Colorist Service ...
                            {!isBioExpanded && (
                                <span
                                    className="text-primary cursor-pointer hover:underline ml-1"
                                    onClick={() => setIsBioExpanded(true)}
                                >
                                    Read more
                                </span>
                            )}
                            {isBioExpanded && (
                                <span>
                                    <br />
                                    Short Film , Music Video , Content Online , Youtube , Tiktok/Reel
                                    <br />
                                    <span
                                        className="text-primary cursor-pointer hover:underline mt-2 inline-block"
                                        onClick={() => setIsBioExpanded(false)}
                                    >
                                        Show less
                                    </span>
                                </span>
                            )}
                        </p>

                        <div className="flex flex-col gap-4 mb-8 items-center lg:items-start">
                            <a href="mailto:nathasit.mac@gmail.com" className="flex items-center gap-3 text-text-primary hover:text-primary transition-colors font-medium">
                                <FaEnvelope className="text-lg" />
                                <span>nathasit.mac@gmail.com</span>
                            </a>
                            <a href="https://www.facebook.com/nathasit.opachalermpan.2025/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-text-primary hover:text-primary transition-colors font-medium">
                                <FaFacebook className="text-lg" />
                                <span>Nathasit Opachalermpan</span>
                            </a>
                        </div>
                    </motion.div>

                    {/* Right Content: Videos */}
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-text-primary">{projects.length} videos</h2>
                        </div>

                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 gap-8"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                visible: {
                                    transition: {
                                        staggerChildren: 0.1
                                    }
                                }
                            }}
                        >
                            {displayedProjects.map((project, index) => {
                                const embedUrl = getEmbedUrl(project.videoUrl);
                                const hasVideo = embedUrl !== null;

                                return (
                                    <motion.div
                                        key={project.title || index}
                                        className={`glass-panel rounded-[16px] overflow-hidden transition-all duration-300 hover:shadow-glow-primary group flex flex-col h-full`}
                                        variants={itemVariants}
                                    >
                                        <div
                                            className="relative w-full aspect-video bg-black overflow-hidden cursor-pointer"
                                            onClick={() => !project.videoUrl?.includes('facebook.com') && setSelectedProject(project)}
                                        >
                                            {hasVideo ? (
                                                <>
                                                    {project.videoUrl?.includes('facebook.com') ? (
                                                        <iframe
                                                            src={embedUrl || ''}
                                                            title={project.title}
                                                            frameBorder="0"
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                            allowFullScreen
                                                            className="absolute inset-0 w-full h-full"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full relative group">
                                                            <img
                                                                src={
                                                                    project.image ||
                                                                    (getYoutubeId(project.videoUrl) ? `https://img.youtube.com/vi/${getYoutubeId(project.videoUrl)}/maxresdefault.jpg` :
                                                                        'https://via.placeholder.com/800x450?text=No+Thumbnail')
                                                                }
                                                                alt={project.title}
                                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    const ytId = getYoutubeId(project.videoUrl);
                                                                    if (ytId && target.src.includes('maxresdefault')) {
                                                                        target.src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
                                                                    }
                                                                }}
                                                            />
                                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
                                                            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                                                                <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-md border border-white/50 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-white shadow-lg">
                                                                    <FaPlay className="text-white text-xl ml-1 group-hover:text-primary transition-colors duration-300" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="w-full h-full relative group">
                                                    <img
                                                        src={project.image || 'https://via.placeholder.com/800x450'}
                                                        alt={project.title}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                        <span className="text-white font-medium px-4 py-2 border border-white/30 rounded-full backdrop-blur-sm">View Details</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div
                                            className="p-5 flex flex-col flex-grow cursor-pointer"
                                            onClick={() => setSelectedProject(project)}
                                        >
                                            <h3 className="font-bold text-lg text-text-primary mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                                                {project.title}
                                            </h3>
                                            <div className="text-text-secondary text-sm mb-4 line-clamp-2 leading-relaxed">
                                                {project.description}
                                            </div>

                                            <div className="mt-auto flex flex-wrap gap-2">
                                                {project.tech && project.tech.map((tech, i) => {
                                                    const techName = typeof tech === 'string' ? tech : tech.name;
                                                    const color = typeof tech === 'object' ? tech.color : undefined;
                                                    const style = color ? {
                                                        backgroundColor: `${color}20`,
                                                        color: color,
                                                        borderColor: `${color}40`
                                                    } : {};

                                                    return (
                                                        <span
                                                            key={i}
                                                            className="text-xs font-medium px-2.5 py-1 rounded-md bg-white/5 text-text-secondary border border-white/5"
                                                            style={style}
                                                        >
                                                            {techName}
                                                        </span>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>

                        {limit && (
                            <div className="mt-[60px] flex justify-center">
                                <Link href="/projects" className="inline-flex items-center gap-2 px-8 py-4 bg-transparent text-text-primary border border-slate-200 dark:border-white/10 rounded-full font-semibold transition-all duration-300 hover:border-primary hover:bg-primary/10 hover:-translate-y-0.5">
                                    ดูผลงานเพิ่มเติม
                                </Link>
                            </div>
                        )}

                        {!limit && visibleCount < projects.length && (
                            <div className="mt-[60px] flex justify-center">
                                <button
                                    onClick={() => setVisibleCount(prev => prev + 4)}
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-transparent text-text-primary border border-slate-200 dark:border-white/10 rounded-full font-semibold transition-all duration-300 hover:border-primary hover:bg-primary/10 hover:-translate-y-0.5"
                                >
                                    Load more
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {selectedProject && (
                    <ProjectModal
                        project={selectedProject}
                        onClose={() => setSelectedProject(null)}
                    />
                )}

                {isShareOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsShareOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-panel w-full max-w-[400px] rounded-2xl p-6 relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-text-primary">Share profile</h3>
                                <button
                                    onClick={() => setIsShareOpen(false)}
                                    className="p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="space-y-3 mb-6">
                                <a
                                    href="https://facebook.com/sharer/sharer.php?u=https://facebook.com/sarat.peetaro"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-[#1877F2]/10 flex items-center justify-center text-[#1877F2] group-hover:bg-[#1877F2] group-hover:text-white transition-colors">
                                        <FaFacebook className="text-xl" />
                                    </div>
                                    <span className="font-medium text-text-primary">Facebook</span>
                                </a>

                                <a
                                    href="https://instagram.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-[#E4405F]/10 flex items-center justify-center text-[#E4405F] group-hover:bg-[#E4405F] group-hover:text-white transition-colors">
                                        <FaInstagram className="text-xl" />
                                    </div>
                                    <span className="font-medium text-text-primary">Instagram</span>
                                </a>

                                <a
                                    href="https://line.me"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-[#00C300]/10 flex items-center justify-center text-[#00C300] group-hover:bg-[#00C300] group-hover:text-white transition-colors">
                                        <SiLine className="text-xl" />
                                    </div>
                                    <span className="font-medium text-text-primary">Line</span>
                                </a>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-text-secondary mb-2">Page link</p>
                                <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-transparent focus-within:border-primary/50 transition-colors">
                                    <div className="p-2 text-text-secondary">
                                        <FaLink />
                                    </div>
                                    <input
                                        type="text"
                                        readOnly
                                        value={typeof window !== 'undefined' ? window.location.href : ''}
                                        className="bg-transparent border-none outline-none text-text-primary text-sm w-full truncate"
                                    />
                                    <button
                                        onClick={handleCopyLink}
                                        className="p-2 text-text-primary hover:text-primary rounded-lg hover:bg-white/10 transition-all flex items-center gap-2"
                                    >
                                        {copySuccess ? <span className="text-xs text-emerald-500 font-bold">Copied!</span> : <FaCopy />}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section >
    );
};

export default Projects;
