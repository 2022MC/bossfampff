import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaGithub, FaExternalLinkAlt, FaCalendar, FaUser, FaTools } from 'react-icons/fa';
// import './ProjectModal.css'; // Removed CSS import

const ProjectModal = ({ project, onClose }) => {
    // Prevent scrolling when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
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
            transition: { type: "spring", duration: 0.5, bounce: 0.3 }
        },
        exit: { y: 50, opacity: 0, scale: 0.95 }
    };

    // Helper to get embed URL (same as in Projects.jsx, refactor later to utils if needed)
    const getEmbedUrl = (url) => {
        if (!url) return null;
        const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/;
        const youtubeMatch = url.match(youtubeRegex);
        if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;

        if (url.includes('facebook.com')) {
            const encodedUrl = encodeURIComponent(url);
            return `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&width=560`;
        }
        return null;
    };

    const embedUrl = project.type === 'Video' ? getEmbedUrl(project.videoUrl) : null;

    return (
        <motion.div
            className="fixed inset-0 bg-[#030712]/90 backdrop-blur-md z-[10000] flex justify-center items-center p-5"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
        >
            <motion.div
                className="bg-bg-secondary text-text-primary w-full max-w-[1400px] h-[95vh] rounded-[24px] shadow-2xl flex flex-col relative border border-white/10 overflow-hidden"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    className="absolute top-4 right-4 z-50 bg-black/50 border border-white/10 backdrop-blur-sm text-white w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-primary hover:border-primary hover:rotate-90"
                    onClick={onClose}
                >
                    <FaTimes />
                </button>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 p-6 md:p-10">
                        {/* LEFT COLUMN: Video & Main Content */}
                        <div className="flex flex-col gap-8">
                            {/* Video / Image Player */}
                            <div className="w-full bg-black rounded-xl overflow-hidden shadow-2xl border border-white/5 relative" style={{ aspectRatio: '16/9' }}>
                                {project.type === 'Video' && embedUrl ? (
                                    <iframe
                                        src={embedUrl}
                                        title={project.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="absolute inset-0 w-full h-full"
                                    />
                                ) : (
                                    <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                                )}
                            </div>

                            {/* Title & Header (YouTube Style: Under Video) */}
                            <div className="border-b border-white/10 pb-6">
                                <span className="font-mono text-sm text-primary uppercase tracking-[2px] font-medium mb-3 block">{project.category}</span>
                                <h2 className="font-space text-[2rem] md:text-[2.8rem] font-bold text-text-primary leading-[1.2] mb-4">{project.title}</h2>
                                {project.featured && <span className="inline-block bg-bg-primary border border-primary text-primary text-[0.7rem] font-bold py-1.5 px-3 rounded-lg uppercase tracking-wider">Featured Project</span>}
                            </div>

                            {/* Description Content */}
                            <div className="text-base md:text-lg leading-[1.8] text-text-secondary pr-0 lg:pr-10">
                                <section className="mb-8">
                                    <h3 className="font-space text-[1.4rem] text-text-primary mb-4 font-semibold">About the Project</h3>
                                    <p>{project.description}</p>
                                </section>

                                {project.challenge && (
                                    <section className="mb-8">
                                        <h3 className="font-space text-[1.4rem] text-text-primary mb-4 font-semibold">The Challenge</h3>
                                        <p>{project.challenge}</p>
                                    </section>
                                )}
                                {project.solution && (
                                    <section className="mb-8">
                                        <h3 className="font-space text-[1.4rem] text-text-primary mb-4 font-semibold">The Solution</h3>
                                        <p>{project.solution}</p>
                                    </section>
                                )}
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Sidebar (Actions, Meta, Tags) */}
                        <div className="flex flex-col gap-6 h-fit lg:sticky lg:top-0">
                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3">
                                {project.videoUrl && project.type === 'Video' && (
                                    <a href={project.videoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 bg-primary text-white shadow-glow-primary hover:bg-secondary hover:-translate-y-1 no-underline">
                                        <FaExternalLinkAlt /> Watch on Platform
                                    </a>
                                )}
                                {project.demo && project.type !== 'Video' && (
                                    <a href={project.demo} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 bg-primary text-white shadow-glow-primary hover:bg-secondary hover:-translate-y-1 no-underline">
                                        <FaExternalLinkAlt /> Live Demo
                                    </a>
                                )}
                                {project.github && (
                                    <a href={project.github} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-semibold transition-all duration-200 bg-white/5 border border-white/10 text-text-primary hover:bg-white/10 hover:border-text-primary/50 hover:-translate-y-1 no-underline">
                                        <FaGithub /> View Source Code
                                    </a>
                                )}
                            </div>

                            {/* Info Card */}
                            <div className="bg-white/[0.03] rounded-2xl border border-white/10 p-5 backdrop-blur-sm">
                                <div className="grid grid-cols-1 gap-5">
                                    <div className="flex items-start gap-4 p-2">
                                        <div className="p-2.5 rounded-lg bg-secondary/10 text-secondary">
                                            <FaUser className="text-xl" />
                                        </div>
                                        <div>
                                            <span className="block text-xs text-text-tertiary uppercase tracking-wider mb-1">Client</span>
                                            <span className="block text-lg text-text-primary font-medium">{project.client || "Personal Project"}</span>
                                        </div>
                                    </div>
                                    <div className="h-px bg-white/10 w-full" />
                                    <div className="flex items-start gap-4 p-2">
                                        <div className="p-2.5 rounded-lg bg-secondary/10 text-secondary">
                                            <FaCalendar className="text-xl" />
                                        </div>
                                        <div>
                                            <span className="block text-xs text-text-tertiary uppercase tracking-wider mb-1">Year</span>
                                            <span className="block text-lg text-text-primary font-medium">{project.year || new Date().getFullYear()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="bg-white/[0.03] rounded-2xl border border-white/10 p-6 backdrop-blur-sm">
                                <h3 className="font-space text-lg text-text-primary mb-4 font-semibold flex items-center gap-2">
                                    <FaTools className="text-secondary" /> Technologies
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {project.tech && project.tech.map((t, i) => {
                                        const techName = typeof t === 'string' ? t : t.name;
                                        const style = typeof t === 'string'
                                            ? {}
                                            : {
                                                color: t.color,
                                                backgroundColor: `${t.color}15`,
                                                borderColor: `${t.color}30`
                                            };

                                        return (
                                            <span key={i} className="bg-white/5 text-text-secondary py-1.5 px-3 rounded-lg text-sm border border-white/10 font-medium transition-colors hover:bg-white/10" style={style}>
                                                {techName}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ProjectModal;
