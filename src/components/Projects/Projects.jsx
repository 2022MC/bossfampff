import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa';
import './Projects.css';
import ProjectModal from '../ProjectModal/ProjectModal';

import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const Projects = ({ limit }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    loadVideoProjects();
  }, []);

  // โหลดข้อมูลจาก Firebase
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
      }));

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

  // ฟังก์ชันแปลง URL เป็น embed URL
  const getEmbedUrl = (url) => {
    if (!url) return null;

    // YouTube URL patterns
    // https://www.youtube.com/watch?v=VIDEO_ID
    // https://youtu.be/VIDEO_ID
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    // Facebook Video URL
    // https://www.facebook.com/username/videos/VIDEO_ID
    // https://www.facebook.com/watch/?v=VIDEO_ID
    if (url.includes('facebook.com')) {
      const encodedUrl = encodeURIComponent(url);
      return `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&width=560`;
    }

    return null;
  };

  const [videoErrors, setVideoErrors] = useState({});
  const [videoLoading, setVideoLoading] = useState({});

  const handleVideoError = (index) => {
    setVideoErrors(prev => ({ ...prev, [index]: true }));
    setVideoLoading(prev => ({ ...prev, [index]: false }));
  };

  const handleVideoLoad = (index) => {
    setVideoLoading(prev => ({ ...prev, [index]: false }));
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const displayedProjects = limit ? projects.slice(0, limit) : projects;

  return (
    <section id="projects" className="projects" >
      <motion.div
        className="projects-container"
        animate="visible"
      >
        <motion.div className="projects-header" variants={itemVariants}>
          <h2 className="section-title">
            <span className="title-number">03.</span>
            โปรเจกต์ที่ผ่านมา
          </h2>
          <p className="section-subtitle">
            ผลงานตัดต่อที่ผ่านมา
          </p>
        </motion.div>
        <div className="projects-grid">
          {displayedProjects.map((project, index) => {
            const embedUrl = project.videoUrl ? getEmbedUrl(project.videoUrl) : null;
            const hasVideo = embedUrl !== null;
            // Loading is true by default if video exists and hasn't loaded yet
            const isLoading = hasVideo && videoLoading[index] !== false && !videoErrors[index];
            const hasError = videoErrors[index];

            return (
              <motion.div
                key={project.title || index}
                className={`project-card ${project.featured ? 'featured' : ''}`}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                onClick={() => setSelectedProject(project)}
              >
                {hasVideo ? (
                  <div className="project-video">
                    {hasError ? (
                      <div className="video-error">
                        <p>ไม่สามารถโหลดวิดีโอได้</p>
                        <a
                          href={project.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary"
                        >
                          เปิดวิดีโอในแท็บใหม่
                        </a>
                      </div>
                    ) : (
                      <>
                        {isLoading && (
                          <div className="video-loading">
                            <div className="loading-spinner"></div>
                            <p>กำลังโหลดวิดีโอ...</p>
                          </div>
                        )}
                        <iframe
                          src={embedUrl}
                          title={project.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          onLoad={() => handleVideoLoad(index)}
                          onError={() => handleVideoError(index)}
                          style={{ display: isLoading ? 'none' : 'block', zIndex: 1 }}
                        />
                      </>
                    )}
                  </div>
                ) : (
                  <div className="project-image">
                    <img src={project.image || 'https://via.placeholder.com/800x450'} alt={project.title} />
                    <div className="project-overlay">
                      <div className="project-links">
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="GitHub"
                        >
                          <FaGithub />
                        </a>
                        <a
                          href={project.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Demo"
                        >
                          <FaExternalLinkAlt />
                        </a>
                      </div>
                    </div>
                  </div>
                )}
                <div className="project-content">
                  <h3 className="project-title">{project.title}</h3>
                  <p className="project-description">{project.description}</p>
                  <div className="project-tech">
                    {project.tech.map((tech, techIndex) => {
                      const techName = typeof tech === 'string' ? tech : tech.name;
                      // Fallback color logic: if string, use default blue style class (via empty inline style letting CSS handle it)
                      // if object, use inline style.
                      const style = typeof tech === 'string'
                        ? {}
                        : {
                          color: tech.color,
                          backgroundColor: `${tech.color}20`,
                          borderColor: `${tech.color}40`
                        };

                      return (
                        <span key={techIndex} className="tech-tag" style={style}>
                          {techName}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {project.featured && (
                  <div className="project-featured-badge">
                    ✨ ผลงานเด่น
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
        {limit && (
          <div className="view-more-container">
            <Link to="/projects" className="btn-view-more">
              ดูผลงานเพิ่มเติม
            </Link>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </section >
  );
};

export default Projects;
