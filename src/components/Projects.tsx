"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMapMarkerAlt, FaEnvelope, FaFacebook, FaShareAlt, FaInstagram, FaLink, FaCopy, FaTimes, FaPlay, FaStar } from 'react-icons/fa';
import { SiLine } from 'react-icons/si';
import Link from 'next/link';

import ProjectModal, { ProjectData } from './ProjectModal';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface ProjectsProps {
    limit?: number;
    group?: string;
}

const Projects = ({ limit, group }: ProjectsProps) => {
    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
    const [isBioExpanded, setIsBioExpanded] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [visibleCount, setVisibleCount] = useState(6);

    const handleCopyLink = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(window.location.href);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    useEffect(() => {
        loadVideoProjects();
    }, [group]);

    const loadVideoProjects = async () => {
        try {
            let q;
            if (group) {
                q = query(
                    collection(db, "works"),
                    where("group", "==", group)
                );
            } else {
                q = query(
                    collection(db, "works"),
                    where("type", "==", "Video")
                );
            }
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
        if (youtubeId) return `https://www.youtube.com/embed/${youtubeId}`;
        if (url.includes('facebook.com')) {
            const encodedUrl = encodeURIComponent(url);
            return `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&width=560`;
        }
        return null;
    };

    const displayedProjects = limit
        ? projects.slice(0, limit)
        : projects.slice(0, visibleCount);

    return (
        <section id="projects" className="py-[80px] md:py-[100px] px-4 md:px-5 relative min-h-screen"
                 style={{backgroundColor: 'var(--bg-primary)'}}>
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-1/2 h-1/2 z-0"
                     style={{background: 'radial-gradient(circle at 100% 0%, rgba(6, 182, 212, 0.06) 0%, transparent 60%)'}}></div>
            </div>

            <div className="max-w-[1280px] mx-auto relative z-1">
                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 md:gap-12 items-start">
                    {/* Left Sidebar: Profile Card */}
                    <motion.div
                        className="bento-card !p-7 relative lg:sticky lg:top-24"
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="relative mb-6">
                            <div className="relative w-28 h-28 mx-auto lg:mx-0">
                                <div className="w-full h-full rounded-full overflow-hidden shadow-lg p-[2px]"
                                     style={{background: 'linear-gradient(135deg, #06b6d4, #14b8a6, #3b82f6)'}}>
                                    <div className="w-full h-full rounded-full overflow-hidden" style={{background: 'var(--bg-tertiary)'}}>
                                        <img
                                            src="/Profile.jpg"
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                                <div className="absolute bottom-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                                     style={{
                                         background: '#10b981',
                                         border: '3px solid var(--bg-tertiary)'
                                     }}></div>
                            </div>

                            <button
                                className="absolute top-0 right-0 p-2 rounded-lg transition-all duration-200 cursor-pointer border-none"
                                style={{color: 'var(--text-tertiary)', background: 'transparent'}}
                                onClick={() => setIsShareOpen(true)}
                                onMouseEnter={(e) => {e.currentTarget.style.color = '#06b6d4'; e.currentTarget.style.background = 'rgba(6,182,212,0.08)';}}
                                onMouseLeave={(e) => {e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = 'transparent';}}
                            >
                                <FaShareAlt />
                            </button>
                        </div>

                        <h2 className="text-xl font-bold mb-1 text-center lg:text-left" style={{color: 'var(--text-primary)'}}>BossFam</h2>
                        <div className="flex items-center justify-center lg:justify-start gap-2 mb-4 text-xs font-medium" style={{color: 'var(--text-tertiary)'}}>
                            <FaMapMarkerAlt />
                            <span>Bangkok Thailand</span>
                        </div>

                        <p className="text-sm mb-5 leading-relaxed text-center lg:text-left" style={{color: 'var(--text-secondary)'}}>
                            he/him
                            <br /><br />
                            Base in Bangkok TH Editor, Beginner Colorist Service ...
                            {!isBioExpanded && (
                                <span
                                    className="cursor-pointer hover:underline ml-1 font-medium"
                                    style={{color: '#06b6d4'}}
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
                                        className="cursor-pointer hover:underline mt-2 inline-block font-medium"
                                        style={{color: '#06b6d4'}}
                                        onClick={() => setIsBioExpanded(false)}
                                    >
                                        Show less
                                    </span>
                                </span>
                            )}
                        </p>

                        <div className="flex flex-col gap-3 mb-6 items-center lg:items-start">
                            <a href="mailto:nathasit.mac@gmail.com" className="flex items-center gap-3 text-sm font-medium transition-colors duration-200"
                               style={{color: 'var(--text-primary)'}}
                               onMouseEnter={(e) => (e.currentTarget.style.color = '#06b6d4')}
                               onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}>
                                <FaEnvelope className="text-base" />
                                <span>nathasit.mac@gmail.com</span>
                            </a>
                            <a href="https://www.facebook.com/nathasit.opachalermpan.2025/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm font-medium transition-colors duration-200"
                               style={{color: 'var(--text-primary)'}}
                               onMouseEnter={(e) => (e.currentTarget.style.color = '#06b6d4')}
                               onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}>
                                <FaFacebook className="text-base" />
                                <span>Nathasit Opachalermpan</span>
                            </a>
                        </div>
                    </motion.div>

                    {/* Right Content: Videos */}
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold" style={{color: 'var(--text-primary)'}}>{projects.length} videos</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {displayedProjects.map((project, index) => {
                                const embedUrl = getEmbedUrl(project.videoUrl);
                                const hasVideo = embedUrl !== null;

                                return (
                                    <motion.div
                                        key={project.id || project.title || index}
                                        className={`bento-card !p-0 overflow-hidden group flex flex-col h-full relative ${project.featured ? 'ring-1 ring-yellow-500/30' : ''}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.08 }}
                                    >
                                        {/* Featured Badge */}
                                        {project.featured && (
                                            <div className="absolute top-3 left-3 z-20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1"
                                                 style={{background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: '#000'}}>
                                                <FaStar className="text-[9px]" /> ผลงานเด่น
                                            </div>
                                        )}

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
                                                                <div className="w-14 h-14 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg"
                                                                     style={{
                                                                         background: 'rgba(255,255,255,0.15)',
                                                                         border: '1px solid rgba(255,255,255,0.3)'
                                                                     }}>
                                                                    <FaPlay className="text-white text-lg ml-0.5" />
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
                                                        <span className="text-white font-medium px-4 py-2 rounded-full backdrop-blur-sm"
                                                              style={{border: '1px solid rgba(255,255,255,0.2)'}}>View Details</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div
                                            className="p-5 flex flex-col flex-grow cursor-pointer"
                                            onClick={() => setSelectedProject(project)}
                                        >
                                            <h3 className="font-bold text-base mb-2 line-clamp-1 transition-colors duration-200"
                                                style={{color: 'var(--text-primary)'}}>
                                                {project.title}
                                            </h3>
                                            <div className="text-sm mb-4 line-clamp-2 leading-relaxed" style={{color: 'var(--text-secondary)'}}>
                                                {project.description}
                                            </div>

                                            <div className="mt-auto flex flex-wrap gap-1.5">
                                                {project.tech && project.tech.map((tech, i) => {
                                                    const techName = typeof tech === 'string' ? tech : tech.name;
                                                    const color = typeof tech === 'object' ? tech.color : undefined;
                                                    const style = color ? {
                                                        backgroundColor: `${color}15`,
                                                        color: color,
                                                        borderColor: `${color}30`
                                                    } : {
                                                        backgroundColor: 'rgba(6, 182, 212, 0.08)',
                                                        color: 'var(--text-secondary)',
                                                        borderColor: 'rgba(6, 182, 212, 0.12)'
                                                    };

                                                    return (
                                                        <span
                                                            key={i}
                                                            className="text-[11px] font-medium px-2.5 py-1 rounded-md border"
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
                        </div>

                        {limit && (
                            <div className="mt-14 flex justify-center">
                                <Link href="/projects" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-semibold transition-all duration-300 hover:-translate-y-1 no-underline"
                                      style={{
                                          color: 'var(--text-primary)',
                                          border: '1px solid var(--glass-border)',
                                          background: 'transparent'
                                      }}
                                      onMouseEnter={(e) => {
                                          e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.4)';
                                          e.currentTarget.style.background = 'rgba(6, 182, 212, 0.06)';
                                      }}
                                      onMouseLeave={(e) => {
                                          e.currentTarget.style.borderColor = 'var(--glass-border)';
                                          e.currentTarget.style.background = 'transparent';
                                      }}>
                                    ดูผลงานเพิ่มเติม
                                </Link>
                            </div>
                        )}

                        {!limit && visibleCount < projects.length && (
                            <div className="mt-14 flex justify-center">
                                <button
                                    onClick={() => setVisibleCount(prev => prev + 4)}
                                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-semibold transition-all duration-300 hover:-translate-y-1 cursor-pointer border-none"
                                    style={{
                                        color: 'var(--text-primary)',
                                        border: '1px solid var(--glass-border)',
                                        background: 'transparent'
                                    }}
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
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                        style={{background: 'rgba(2, 10, 24, 0.8)', backdropFilter: 'blur(8px)'}}
                        onClick={() => setIsShareOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bento-card w-full max-w-[400px] !p-6 relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold" style={{color: 'var(--text-primary)'}}>Share profile</h3>
                                <button
                                    onClick={() => setIsShareOpen(false)}
                                    className="p-2 rounded-lg transition-colors duration-200 cursor-pointer border-none"
                                    style={{color: 'var(--text-tertiary)', background: 'transparent'}}
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="space-y-2 mb-6">
                                {[
                                    { icon: <FaFacebook className="text-xl" />, name: 'Facebook', href: 'https://www.facebook.com/nathasit.opachalermpan.2025/', color: '#1877F2' },
                                    { icon: <FaInstagram className="text-xl" />, name: 'Instagram', href: 'https://instagram.com', color: '#E4405F' },
                                    { icon: <SiLine className="text-xl" />, name: 'Line', href: 'https://line.me', color: '#00C300' },
                                ].map((social) => (
                                    <a
                                        key={social.name}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group"
                                        style={{border: '1px solid var(--glass-border)'}}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
                                             style={{color: social.color, background: `${social.color}10`}}>
                                            {social.icon}
                                        </div>
                                        <span className="font-medium" style={{color: 'var(--text-primary)'}}>{social.name}</span>
                                    </a>
                                ))}
                            </div>

                            <div>
                                <p className="text-xs font-medium mb-2" style={{color: 'var(--text-tertiary)'}}>Page link</p>
                                <div className="flex items-center gap-2 p-2 rounded-xl transition-colors"
                                     style={{background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)'}}>
                                    <div className="p-2" style={{color: 'var(--text-tertiary)'}}><FaLink /></div>
                                    <input
                                        type="text"
                                        readOnly
                                        value={typeof window !== 'undefined' ? window.location.href : ''}
                                        className="bg-transparent border-none outline-none text-sm w-full truncate"
                                        style={{color: 'var(--text-primary)'}}
                                    />
                                    <button
                                        onClick={handleCopyLink}
                                        className="p-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer border-none"
                                        style={{color: 'var(--text-primary)', background: 'transparent'}}
                                    >
                                        {copySuccess ? <span className="text-xs font-bold" style={{color: '#10b981'}}>Copied!</span> : <FaCopy />}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default Projects;
