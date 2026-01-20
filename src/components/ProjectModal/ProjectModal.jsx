import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaGithub, FaExternalLinkAlt, FaCalendar, FaUser, FaTools } from 'react-icons/fa';
import './ProjectModal.css';

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
            className="project-modal-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
        >
            <motion.div
                className="project-modal-content"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()} // Prevent click propagation to backdrop
            >
                <button className="modal-close-btn" onClick={onClose}>
                    <FaTimes />
                </button>

                <div className="modal-media-section">
                    {project.type === 'Video' && embedUrl ? (
                        <iframe
                            src={embedUrl}
                            title={project.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="modal-video-iframe"
                        />
                    ) : (
                        <div className="modal-image-container">
                            <img src={project.image} alt={project.title} className="modal-image" />
                        </div>
                    )}
                </div>

                <div className="modal-info-section">
                    <div className="modal-header">
                        <span className="modal-category">{project.category}</span>
                        <h2 className="modal-title">{project.title}</h2>
                        {project.featured && <span className="modal-featured-badge">Featured Project</span>}
                    </div>

                    <div className="modal-meta-grid">
                        <div className="meta-item">
                            <FaUser className="meta-icon" />
                            <div>
                                <span className="meta-label">Client</span>
                                <span className="meta-value">{project.client || "Personal Project"}</span>
                            </div>
                        </div>
                        <div className="meta-item">
                            <FaCalendar className="meta-icon" />
                            <div>
                                <span className="meta-label">Year</span>
                                <span className="meta-value">{project.year || new Date().getFullYear()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="modal-description">
                        <h3>About the Project</h3>
                        <p>{project.description}</p>

                        {/* Future extensibility for Challenge/Solution */}
                        {project.challenge && (
                            <>
                                <h3>The Challenge</h3>
                                <p>{project.challenge}</p>
                            </>
                        )}
                        {project.solution && (
                            <>
                                <h3>The Solution</h3>
                                <p>{project.solution}</p>
                            </>
                        )}
                    </div>

                    <div className="modal-tech">
                        <h3><FaTools style={{ marginRight: '8px', fontSize: '0.8em' }} /> Tag</h3>
                        <div className="tech-tags-wrapper">
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
                                    <span key={i} className="tech-tag modal-tag" style={style}>
                                        {techName}
                                    </span>
                                );
                            })}
                        </div>
                    </div>

                    <div className="modal-actions">
                        {project.videoUrl && project.type === 'Video' && (
                            <a href={project.videoUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                                <FaExternalLinkAlt /> Watch on Platform
                            </a>
                        )}
                        {project.github && (
                            <a href={project.github} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                                <FaGithub /> View Code
                            </a>
                        )}
                        {project.demo && project.type !== 'Video' && (
                            <a href={project.demo} target="_blank" rel="noopener noreferrer" className="btn-primary">
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
