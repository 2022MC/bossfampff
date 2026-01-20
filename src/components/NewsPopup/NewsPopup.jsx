import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import './NewsPopup.css';

const NewsPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const newsItems = [
    {
      type: 'image',
      src: '/Fix Color.png',
      id: 1
    },
    {
      type: 'youtube',
      url: 'https://www.youtube.com/watch?v=wbGSggqwy8A', // ตัวอย่างวิดีโอ (4K Coral Reef)
      id: 2
    }
  ];

  useEffect(() => {
    // แสดง popup หลังจาก 1 วินาที
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setIsClosed(true);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % newsItems.length);
  };

  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + newsItems.length) % newsItems.length);
  };

  const getYouTubeEmbedUrl = (url) => {
    let videoId = '';

    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }

    return `https://www.youtube.com/embed/${videoId}`;
  };

  return (
    <AnimatePresence>
      {isVisible && !isClosed && (
        <motion.div
          className="news-popup-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleOverlayClick}
        >
          <motion.div
            className="news-popup-container"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, type: 'spring' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="news-popup-close" onClick={handleClose}>
              <FaTimes />
            </button>

            <div className="news-popup-content">
              {newsItems.length > 1 && (
                <>
                  <button className="news-nav-btn prev" onClick={prevSlide}>
                    &#10094;
                  </button>
                  <button className="news-nav-btn next" onClick={nextSlide}>
                    &#10095;
                  </button>

                  <div className="news-dots">
                    {newsItems.map((_, index) => (
                      <span
                        key={index}
                        className={`news-dot ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => setCurrentIndex(index)}
                      />
                    ))}
                  </div>
                </>
              )}

              <div className="news-item">
                {newsItems[currentIndex].type === 'image' ? (
                  <img
                    src={newsItems[currentIndex].src}
                    alt="ข่าวสาร"
                  />
                ) : (
                  <div className="video-container">
                    <iframe
                      src={getYouTubeEmbedUrl(newsItems[currentIndex].url)}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NewsPopup;
