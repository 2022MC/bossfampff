"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

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
            url: 'https://www.youtube.com/watch?v=wbGSggqwy8A',
            id: 2
        }
    ];

    useEffect(() => {
        // Show popup after 1 second
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setIsClosed(true);
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    const nextSlide = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % newsItems.length);
    };

    const prevSlide = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + newsItems.length) % newsItems.length);
    };

    const getYouTubeEmbedUrl = (url: string) => {
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
                    className="fixed top-0 left-0 w-full h-full bg-black/80 backdrop-blur-[5px] z-[9999] flex items-center justify-center p-5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={handleOverlayClick}
                >
                    <motion.div
                        className="relative max-w-[500px] w-4/5 max-h-[80vh] bg-transparent rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] md:max-w-[500px] sm:w-[95%]"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.3, type: 'spring' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-[15px] right-[15px] w-[45px] h-[45px] rounded-full bg-black/60 backdrop-blur-[10px] border-2 border-white/30 text-white text-[22px] cursor-pointer flex items-center justify-center z-10 transition-all duration-300 hover:bg-black/80 hover:border-white/50 hover:rotate-90 hover:scale-110 sm:w-10 sm:h-10 sm:text-lg sm:top-2.5 sm:right-2.5"
                            onClick={handleClose}
                        >
                            <FaTimes />
                        </button>

                        <div className="relative w-full h-full">
                            {newsItems.length > 1 && (
                                <>
                                    <button className="absolute top-1/2 -translate-y-1/2 bg-black/50 text-white border-none w-10 h-10 rounded-full cursor-pointer flex items-center justify-center text-xl z-[5] transition-all duration-300 hover:bg-black/80 left-[10px]" onClick={prevSlide}>
                                        &#10094;
                                    </button>
                                    <button className="absolute top-1/2 -translate-y-1/2 bg-black/50 text-white border-none w-10 h-10 rounded-full cursor-pointer flex items-center justify-center text-xl z-[5] transition-all duration-300 hover:bg-black/80 right-[10px]" onClick={nextSlide}>
                                        &#10095;
                                    </button>

                                    <div className="absolute bottom-[15px] left-1/2 -translate-x-1/2 flex gap-2 z-[5]">
                                        {newsItems.map((_, index) => (
                                            <span
                                                key={index}
                                                className={`w-2 h-2 rounded-full bg-white/50 cursor-pointer transition-all duration-300 ${index === currentIndex ? 'bg-white scale-125' : ''}`}
                                                onClick={() => setCurrentIndex(index)}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}

                            <div className="w-full h-auto block overflow-hidden rounded-xl">
                                {newsItems[currentIndex].type === 'image' ? (
                                    <img
                                        src={newsItems[currentIndex].src}
                                        alt="ข่าวสาร"
                                        className="w-full h-auto block object-contain"
                                    />
                                ) : (
                                    <div className="relative pb-[56.25%] h-0 overflow-hidden bg-black">
                                        <iframe
                                            src={getYouTubeEmbedUrl(newsItems[currentIndex].url!)}
                                            title="YouTube video player"
                                            className="absolute top-0 left-0 w-full h-full"
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
