"use client";

import React from 'react';

const ShootingStars = () => {
    const stars = [
        { top: '0px', right: '0px', delay: '0s', duration: '1s' },
        { top: '0px', right: '80px', delay: '0.2s', duration: '3s' },
        { top: '80px', right: '0px', delay: '0.4s', duration: '2s' },
        { top: '0px', right: '180px', delay: '0.6s', duration: '1.5s' },
        { top: '0px', right: '400px', delay: '0.8s', duration: '2.5s' },
        { top: '0px', right: '600px', delay: '1s', duration: '3s' },
        { top: '300px', right: '0px', delay: '1.2s', duration: '1.75s' },
        { top: '0px', right: '700px', delay: '1.4s', duration: '1.25s' },
        { top: '0px', right: '1000px', delay: '0.75s', duration: '2.25s' },
        { top: '0px', right: '450px', delay: '2.75s', duration: '2.25s' },
    ];

    return (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-[1] pointer-events-none">
            {stars.map((star, index) => (
                <span
                    key={index}
                    className="absolute w-1 h-1 bg-white rounded-full 
                    shadow-[0_0_0_4px_rgba(255,255,255,0.1),0_0_0_8px_rgba(255,255,255,0.1),0_0_20px_rgba(255,255,255,1)]
                    before:content-[''] before:absolute before:top-1/2 before:-translate-y-1/2 before:w-[300px] before:h-[1px] before:bg-gradient-to-r before:from-white before:to-transparent
                    animate-shooting-star"
                    style={{
                        top: star.top,
                        right: star.right,
                        left: 'initial',
                        animationDelay: star.delay,
                        animationDuration: star.duration
                    }}
                ></span>
            ))}
        </div>
    );
};

export default ShootingStars;
