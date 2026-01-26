/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#030712', // --bg-primary
          secondary: '#0f172a', // --bg-secondary
          tertiary: '#1e293b', // --bg-tertiary
        },
        primary: {
          DEFAULT: '#6366f1', // --primary-color: Indigo 500
          glow: 'rgba(99, 102, 241, 0.5)', // --primary-glow
        },
        secondary: {
          DEFAULT: '#a855f7', // --secondary-color: Purple 500
          glow: 'rgba(168, 85, 247, 0.5)', // --secondary-glow
        },
        accent: {
          DEFAULT: '#f43f5e', // --accent-color: Rose 500
          glow: 'rgba(244, 63, 94, 0.5)', // --accent-glow
        },
        text: {
          primary: '#f8fafc', // --text-primary: Slate 50
          secondary: '#94a3b8', // --text-secondary: Slate 400
          tertiary: '#64748b', // --text-tertiary: Slate 500
        }
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        space: ['"Space Grotesk"', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-main': 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
        'gradient-hover': 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)',
        'gradient-text': 'linear-gradient(to right, #818cf8, #e879f9)',
        'glass-panel': 'linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.6))',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-primary': '0 0 20px rgba(99, 102, 241, 0.5)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-orb': 'floatOrb 20s infinite ease-in-out',
        'shine': 'shine 5s linear infinite',
        'shimmer': 'shimmer 2s infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
        'fade-in': 'fadeIn 1s ease-out',
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'slide-in-left': 'slideInLeft 0.8s ease-out',
        'slide-in-right': 'slideInRight 0.8s ease-out',
        'shooting-star': 'shooting-star 3s linear infinite',
      },
      keyframes: {
        'shooting-star': {
          '0%': { transform: 'rotate(315deg) translateX(0)', opacity: '1' },
          '70%': { opacity: '1' },
          '100%': { transform: 'rotate(315deg) translateX(-1000px)', opacity: '0' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        floatOrb: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
        shine: {
          'to': { 'background-position': '200% center' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(99, 102, 241, 0.5)' },
          '50%': { boxShadow: '0 0 20px #6366f1' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        }
      }
    },
  },
  plugins: [],
}
