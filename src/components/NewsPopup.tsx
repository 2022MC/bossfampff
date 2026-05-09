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
        }
    ];

    useEffect(() => {
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

    return (
        <AnimatePresence>
            {isVisible && !isClosed && (
                <motion.div
                    className="fixed top-0 left-0 w-full h-full z-[9999] flex items-center justify-center p-5"
                    style={{
                        background: 'rgba(2, 10, 24, 0.85)',
                        backdropFilter: 'blur(8px)'
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={handleOverlayClick}
                >
                    <motion.div
                        className="relative max-w-[500px] w-4/5 max-h-[80vh] rounded-2xl overflow-hidden md:max-w-[500px] sm:w-[95%]"
                        style={{
                            background: 'transparent',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(6, 182, 212, 0.05)'
                        }}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.3, type: 'spring' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-3 right-3 w-10 h-10 rounded-full backdrop-blur-xl text-white text-lg cursor-pointer flex items-center justify-center z-10 transition-all duration-300 hover:rotate-90 hover:scale-110"
                            style={{
                                background: 'rgba(0, 0, 0, 0.5)',
                                border: '1px solid rgba(255,255,255,0.2)'
                            }}
                            onClick={handleClose}
                        >
                            <FaTimes />
                        </button>

                        <div className="relative w-full h-full">
                            {newsItems.length > 1 && (
                                <>
                                    <button className="absolute top-1/2 -translate-y-1/2 w-9 h-9 rounded-full cursor-pointer flex items-center justify-center text-lg z-[5] transition-all duration-300 left-2.5 text-white border-none"
                                            style={{ background: 'rgba(0,0,0,0.4)' }}
                                            onClick={prevSlide}>
                                        &#10094;
                                    </button>
                                    <button className="absolute top-1/2 -translate-y-1/2 w-9 h-9 rounded-full cursor-pointer flex items-center justify-center text-lg z-[5] transition-all duration-300 right-2.5 text-white border-none"
                                            style={{ background: 'rgba(0,0,0,0.4)' }}
                                            onClick={nextSlide}>
                                        &#10095;
                                    </button>

                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-[5]">
                                        {newsItems.map((_, index) => (
                                            <span
                                                key={index}
                                                className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300 ${index === currentIndex ? 'scale-125' : ''}`}
                                                style={{
                                                    background: index === currentIndex ? '#06b6d4' : 'rgba(255,255,255,0.4)'
                                                }}
                                                onClick={() => setCurrentIndex(index)}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}

                            <div className="w-full h-auto block overflow-hidden rounded-2xl">
                                <img
                                    src={newsItems[currentIndex].src}
                                    alt="ข่าวสาร"
                                    className="w-full h-auto block object-contain"
                                />
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NewsPopup;
