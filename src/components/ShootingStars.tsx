"use client";

import React from 'react';

const ShootingStars = () => {
    const stars = [
        { top: '10%', right: '20%', delay: '0s', duration: '3s' },
        { top: '30%', right: '40%', delay: '1.5s', duration: '2.5s' },
        { top: '50%', right: '10%', delay: '3s', duration: '3.5s' },
        { top: '20%', right: '60%', delay: '4.5s', duration: '2.8s' },
        { top: '70%', right: '30%', delay: '6s', duration: '3.2s' },
    ];

    return (
        <>
            {stars.map((star, index) => (
                <div
                    key={index}
                    className="absolute animate-shooting-star"
                    style={{
                        top: star.top,
                        right: star.right,
                        animationDelay: star.delay,
                        animationDuration: star.duration,
                        width: '2px',
                        height: '2px',
                        background: 'linear-gradient(45deg, #22d3ee, transparent)',
                        boxShadow: '0 0 6px 1px rgba(34, 211, 238, 0.4)',
                        borderRadius: '50%',
                    }}
                />
            ))}
        </>
    );
};

export default ShootingStars;
