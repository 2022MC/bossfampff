import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import './GraphicAIPage.css';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const GraphicAIPage = () => {
  const [scrollY, setScrollY] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [graphicWorks, setGraphicWorks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadGraphicWorks();
  }, []);

  // โหลดข้อมูลจาก Firebase
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
      }));

      // Sort by order (asc), fallback to createdAt (desc)
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

  // ปิด modal เมื่อกด ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setSelectedImage(null);
      }
    };
    if (selectedImage) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // ป้องกัน scroll เมื่อ modal เปิด
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage]);

  const openImageModal = (work) => {
    setSelectedImage(work);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="graphic-ai-page">
      <Navbar scrollY={scrollY} />
      <div className="graphic-ai-content">
        <motion.section
          className="graphic-ai-header"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="page-header" variants={itemVariants}>
            <h1 className="page-title">
              <span className="title-number">Graphic & AI</span>
            </h1>
            <p className="page-subtitle">
              ผลงานกราฟฟิกและ AI Art
            </p>
          </motion.div>
        </motion.section>

        <motion.section
          className="graphic-works-section"
          animate="visible"
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>Loading content...</div>
          ) : graphicWorks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>ยังไม่มีผลงาน</div>
          ) : (
            <div className="works-grid">
              {graphicWorks.map((work) => {
                // Determine aspect ratio from saved string or default
                const aspectRatio = work.size?.aspectRatio || '4/3';

                return (
                  <motion.div
                    key={work.id}
                    className={`work-card ${work.featured ? 'featured' : ''}`}
                    variants={itemVariants}
                    whileHover={{ y: -10 }}
                  >
                    {work.featured && (
                      <div className="work-featured-badge">
                        ✨ ผลงานเด่น
                      </div>
                    )}

                    <div
                      className="work-image"
                      style={{ aspectRatio: aspectRatio }}
                      onClick={() => openImageModal(work)}
                    >
                      <img src={work.image} alt={work.title} loading="lazy" />
                      <div className="work-overlay">
                        <div className="work-category">{work.category}</div>
                      </div>
                    </div>
                    <div className="work-content">
                      <h3 className="work-title">{work.title}</h3>
                      <p className="work-description">{work.description}</p>
                      <div className="work-tech">
                        {work.tech && work.tech.map((tech, techIndex) => {
                          const techName = typeof tech === 'string' ? tech : tech.name;
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
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.section>
      </div >
      <Footer />

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="image-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeImageModal}
          >
            <motion.div
              className="image-modal-container"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3, type: 'spring' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="image-modal-close" onClick={closeImageModal}>
                <FaTimes />
              </button>
              <div className="image-modal-image">
                <img src={selectedImage.image} alt={selectedImage.title} />
              </div>
              <div className="image-modal-content">
                <h3 className="image-modal-title">{selectedImage.title}</h3>
                <p className="image-modal-description">{selectedImage.description}</p>
                <div className="image-modal-tech">
                  {selectedImage.tech && selectedImage.tech.map((tech, techIndex) => {
                    const techName = typeof tech === 'string' ? tech : tech.name;
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
};

export default GraphicAIPage;
