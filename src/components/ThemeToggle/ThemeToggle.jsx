import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative w-12 h-12 rounded-full flex items-center justify-center 
                       bg-transparent border border-[var(--glass-border)] 
                       backdrop-blur-md transition-all duration-300 
                       hover:bg-primary/10 hover:border-primary/30 hover:scale-110
                       focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
            <div className="relative w-6 h-6">
                {/* Sun Icon */}
                <FaSun
                    className={`absolute inset-0 w-6 h-6 text-amber-400 transition-all duration-300 
                                ${theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'}`}
                />
                {/* Moon Icon */}
                <FaMoon
                    className={`absolute inset-0 w-6 h-6 text-indigo-500 transition-all duration-300 
                                ${theme === 'light' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`}
                />
            </div>
        </button>
    );
};

export default ThemeToggle;
