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
                className="bg-bg-secondary text-text-primary w-full max-w-[1280px] max-h-[90vh] rounded-[24px] shadow-2xl flex flex-col overflow-hidden relative border border-white/10"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()} // Prevent click propagation to backdrop
            >
                <button
                    className="absolute top-5 right-5 bg-black/30 border border-white/10 backdrop-blur-sm text-white w-10 h-10 rounded-full flex items-center justify-center cursor-pointer z-20 transition-all duration-200 hover:bg-primary hover:border-primary hover:rotate-90"
                    onClick={onClose}
                >
                    <FaTimes />
                </button>

                {/* Video/Image Section - 16:9 Aspect Ratio */}
                <div className="w-full bg-black relative" style={{ aspectRatio: '16/9' }}>
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
                        <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                            <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>

                <div className="flex-1 p-6 md:p-10 overflow-y-auto flex flex-col gap-6 bg-bg-tertiary">
                    <div className="border-b border-white/10 pb-5">
                        <span className="font-mono text-sm text-primary uppercase tracking-[2px] font-medium mb-3 block">{project.category}</span>
                        <h2 className="font-space text-[1.8rem] md:text-[2.5rem] font-bold text-text-primary leading-[1.1] m-0">{project.title}</h2>
                        {project.featured && <span className="inline-block bg-bg-primary border border-primary text-primary text-[0.7rem] font-bold py-1 px-2.5 rounded-xl mt-3 uppercase tracking-wider">Featured Project</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-4 bg-white/[0.02] rounded-2xl border border-white/10">
                        <div className="flex items-center gap-3">
                            <FaUser className="text-[1.2rem] text-secondary" />
                            <div>
                                <span className="block text-xs text-text-tertiary uppercase tracking-wider mb-0.5">Client</span>
                                <span className="block text-base text-text-primary font-medium">{project.client || "Personal Project"}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <FaCalendar className="text-[1.2rem] text-secondary" />
                            <div>
                                <span className="block text-xs text-text-tertiary uppercase tracking-wider mb-0.5">Year</span>
                                <span className="block text-base text-text-primary font-medium">{project.year || new Date().getFullYear()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-base leading-[1.7] text-text-secondary">
                        <h3 className="font-space text-[1.2rem] text-text-primary mb-3 font-semibold">About the Project</h3>
                        <p className="mb-4">{project.description}</p>

                        {/* Future extensibility for Challenge/Solution */}
                        {project.challenge && (
                            <>
                                <h3 className="font-space text-[1.2rem] text-text-primary mb-3 font-semibold mt-4">The Challenge</h3>
                                <p className="mb-4">{project.challenge}</p>
                            </>
                        )}
                        {project.solution && (
                            <>
                                <h3 className="font-space text-[1.2rem] text-text-primary mb-3 font-semibold mt-4">The Solution</h3>
                                <p className="mb-4">{project.solution}</p>
                            </>
                        )}
                    </div>

                    <div>
                        <h3 className="font-space text-[1.2rem] text-text-primary mb-3 font-semibold flex items-center gap-2">
                            <FaTools className="text-[0.8em]" /> Tag
                        </h3>
                        <div className="flex flex-wrap gap-2.5">
                            {project.tech && project.tech.map((t, i) => {
                                const techName = typeof t === 'string' ? t : t.name;
                                const style = typeof t === 'string'
                                    ? {}
                                    : {
                                        color: t.color,
                                        backgroundColor: `${t.color}20`,
                                        borderColor: `${t.color}40`
                                    };

                                return (
                                    <span key={i} className="bg-primary/10 text-primary py-1.5 px-3.5 rounded-[20px] text-sm border border-primary/20 font-medium" style={style}>
                                        {techName}
                                    </span>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-auto flex gap-4 pt-6 border-t border-white/10 md:flex-row flex-col">
                        {project.videoUrl && project.type === 'Video' && (
                            <a href={project.videoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-3 px-6 rounded-[10px] font-semibold transition-all duration-200 flex-1 bg-primary text-white shadow-glow-primary hover:bg-secondary hover:-translate-y-0.5 no-underline">
                                <FaExternalLinkAlt /> Watch on Platform
                            </a>
                        )}
                        {project.github && (
                            <a href={project.github} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-3 px-6 rounded-[10px] font-semibold transition-all duration-200 flex-1 bg-transparent border border-white/10 text-text-primary hover:bg-white/5 hover:border-text-primary hover:-translate-y-0.5 no-underline">
                                <FaGithub /> View Code
                            </a>
                        )}
                        {project.demo && project.type !== 'Video' && (
                            <a href={project.demo} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-3 px-6 rounded-[10px] font-semibold transition-all duration-200 flex-1 bg-primary text-white shadow-glow-primary hover:bg-secondary hover:-translate-y-0.5 no-underline">
                                <FaExternalLinkAlt /> Live Demo
                            </a>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ProjectModal;
