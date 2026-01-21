import React, { useEffect, useState } from 'react';
// import './CustomCursor.css'; // Removed CSS import

const CustomCursor = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [hidden, setHidden] = useState(false);
    const [click, setClick] = useState(false);
    const [linkHover, setLinkHover] = useState(false);

    useEffect(() => {
        const addEventListeners = () => {
            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseenter", onMouseEnter);
            document.addEventListener("mouseleave", onMouseLeave);
            document.addEventListener("mousedown", onMouseDown);
            document.addEventListener("mouseup", onMouseUp);
        };

        const removeEventListeners = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseenter", onMouseEnter);
            document.removeEventListener("mouseleave", onMouseLeave);
            document.removeEventListener("mousedown", onMouseDown);
            document.removeEventListener("mouseup", onMouseUp);
        };

        const onMouseMove = (e) => {
            setPosition({ x: e.clientX, y: e.clientY });
        };

        const onMouseEnter = () => {
            setHidden(false);
        };

        const onMouseLeave = () => {
            setHidden(true);
        };

        const onMouseDown = () => {
            setClick(true);
        };

        const onMouseUp = () => {
            setClick(false);
        };

        addEventListeners();
        return () => removeEventListeners();
    }, []);

    // Use Event Delegation for better performance and support for dynamic content
    useEffect(() => {
        const handleMouseOver = (e) => {
            if (
                e.target.tagName === 'A' ||
                e.target.tagName === 'BUTTON' ||
                e.target.closest('a') ||
                e.target.closest('button') ||
                e.target.classList.contains('clickable') ||
                (e.target.classList && e.target.classList.contains('project-card'))
            ) {
                setLinkHover(true);
            }
        };

        const handleMouseOut = (e) => {
            if (
                e.target.tagName === 'A' ||
                e.target.tagName === 'BUTTON' ||
                e.target.closest('a') ||
                e.target.closest('button') ||
                e.target.classList.contains('clickable') ||
                (e.target.classList && e.target.classList.contains('project-card'))

            ) {
                setLinkHover(false);
            }
        };

        document.body.addEventListener('mouseover', handleMouseOver);
        document.body.addEventListener('mouseout', handleMouseOut);

        return () => {
            document.body.removeEventListener('mouseover', handleMouseOver);
            document.body.removeEventListener('mouseout', handleMouseOut);
        };
    }, []);

    // Don't render on mobile/touch devices
    if (typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return null;
    }

    const baseClasses = "fixed -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[9999] transition-all duration-200 ease-out mix-blend-difference rounded-full border-2 border-white";
    const hoverClasses = linkHover ? "!w-[60px] !h-[60px] bg-white mix-blend-difference" : "w-10 h-10";
    const clickClasses = click ? "!scale-75 bg-white/80" : "";
    const hiddenClasses = hidden ? "opacity-0" : "";

    return (
        <div
            className={`${baseClasses} ${hoverClasses} ${clickClasses} ${hiddenClasses}`}
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                // transition: 'width 0.2s, height 0.2s, background-color 0.2s, transform 0.1s' // Handle via Tailwind classes where possible, or keep inline for specific transform if needed but tailwind handles standard transitions
            }}
        />
    );
};

export default CustomCursor;
