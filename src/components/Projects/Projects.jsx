import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa';
// import './Projects.css'; // Removed CSS import
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
    <section id="projects" className="py-[100px] px-5 bg-bg-primary relative overflow-hidden">
      {/* Background gradient accent */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[radial-gradient(circle_at_100%_0%,rgba(99,102,241,0.15)_0%,transparent_60%)] z-0 pointer-events-none"></div>

      <motion.div
        className="max-w-[1200px] mx-auto relative z-1"
        animate="visible"
      >
        <motion.div className="text-center mb-20" variants={itemVariants}>
          <h2 className="font-space text-[clamp(32px,5vw,48px)] font-bold text-text-primary mb-4 flex items-center justify-center gap-4">
            <span className="font-mono text-xl text-primary font-normal">03.</span>
            โปรเจกต์ที่ผ่านมา
          </h2>
          <p className="text-[clamp(16px,2vw,18px)] text-text-secondary max-w-[600px] mx-auto">
            ผลงานตัดต่อที่ผ่านมา
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedProjects.map((project, index) => {
            const embedUrl = project.videoUrl ? getEmbedUrl(project.videoUrl) : null;
            const hasVideo = embedUrl !== null;
            // Loading is true by default if video exists and hasn't loaded yet
            const isLoading = hasVideo && videoLoading[index] !== false && !videoErrors[index];
            const hasError = videoErrors[index];

            return (
              <motion.div
                key={project.title || index}
                className={`bg-bg-tertiary rounded-[20px] overflow-hidden border transition-all duration-400 relative shadow-md group hover:-translate-y-2 hover:shadow-xl ${project.featured ? 'border-[rgba(245,158,11,0.5)] shadow-[0_4px_20px_rgba(245,158,11,0.15)]' : 'border-white/10 hover:border-primary'}`}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                onClick={() => setSelectedProject(project)}
              >
                {hasVideo ? (
                  <div className="relative w-full aspect-video bg-black overflow-hidden">
                    {hasError ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-tertiary z-[2] text-text-secondary">
                        <p>ไม่สามารถโหลดวิดีโอได้</p>
                        <a
                          href={project.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-transparent text-text-primary py-3 px-8 border-2 border-primary rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 no-underline inline-block hover:bg-primary hover:-translate-y-0.5 mt-4"
                        >
                          เปิดวิดีโอในแท็บใหม่
                        </a>
                      </div>
                    ) : (
                      <>
                        {isLoading && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-tertiary z-[2] text-text-secondary">
                            <div className="w-10 h-10 border-2 border-bg-secondary border-t-secondary rounded-full animate-spin mb-4"></div>
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
                          className="w-full h-full border-none"
                          style={{ display: isLoading ? 'none' : 'block', zIndex: 1 }}
                        />
                      </>
                    )}
                  </div>
                ) : (
                  <div className="relative w-full h-[250px] overflow-hidden group">
                    <img
                      src={project.image || 'https://via.placeholder.com/800x450'}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-[4px] flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <div className="flex gap-4">
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="GitHub"
                          className="w-12 h-12 rounded-full bg-white text-bg-primary flex items-center justify-center text-xl transition-transform duration-200 hover:scale-110"
                        >
                          <FaGithub />
                        </a>
                        <a
                          href={project.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Demo"
                          className="w-12 h-12 rounded-full bg-white text-bg-primary flex items-center justify-center text-xl transition-transform duration-200 hover:scale-110"
                        >
                          <FaExternalLinkAlt />
                        </a>
                      </div>
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <h3 className="font-space text-2xl font-bold text-text-primary mb-3">{project.title}</h3>
                  <p className="text-base text-text-secondary leading-[1.6] mb-6 line-clamp-3">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
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

                      const defaultClasses = "text-[13px] font-medium px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary";

                      return (
                        <span key={techIndex} className={typeof tech === 'string' ? defaultClasses : "text-[13px] font-medium px-3 py-1 rounded-full border"} style={style}>
                          {techName}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {project.featured && (
                  <div className="absolute top-3 right-3 bg-gradient-to-br from-amber-400 to-amber-600 text-white px-3 py-1.5 rounded-[20px] text-xs font-bold z-20 shadow-md flex items-center gap-1 tracking-wide">
                    ✨ ผลงานเด่น
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
        {limit && (
          <div className="mt-[60px] flex justify-center">
            <Link to="/projects" className="inline-flex items-center gap-2 px-8 py-4 bg-transparent text-text-primary border border-white/10 rounded-full font-semibold transition-all duration-300 hover:border-primary hover:bg-primary/10 hover:-translate-y-0.5">
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
