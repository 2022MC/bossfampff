import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';

const Navbar = ({ scrollY }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsProjectsOpen(false);
  };

  const toggleProjects = (e) => {
    e.preventDefault();
    setIsProjectsOpen(!isProjectsOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProjectsOpen(false);
      }
    };

    if (isProjectsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProjectsOpen]);

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Skills', href: '#skills' },
    { name: 'Contact', href: '#contact' },
  ];

  const projectsItems = [
    { name: 'Video Projects', href: '/projects', isRoute: true },
    { name: 'Graphic & AI', href: '/graphic-ai', isRoute: true },
  ];

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    closeMenu();
    const targetId = href.replace('#', '');
    if (href.startsWith('#')) {
      if (location.pathname === '/') {
        const element = document.getElementById(targetId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = `/${href}`;
      }
    } else {
      window.location.href = href;
    }
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-[1000] transition-all duration-400 ease-in-out ${scrollY > 50 ? 'py-2' : 'py-5'}`}>
      <div
        className={`
          flex justify-between items-center px-6 h-[70px] rounded-full transition-all duration-400 ease-out
          ${scrollY > 50
            ? 'mx-5 w-[calc(100%-40px)] lg:w-full lg:max-w-[1240px] lg:mx-auto bg-bg-primary/60 backdrop-blur-md border border-white/10 shadow-glass'
            : 'max-w-[1240px] mx-auto bg-transparent border border-transparent'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="font-space text-2xl font-bold text-text-primary flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] block"></span>
            Portfolio
          </Link>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center gap-8 list-none">
          {navItems.map((item, index) => (
            <li key={index}>
              <a
                href={item.href}
                onClick={(e) => handleLinkClick(e, item.href)}
                className="text-text-secondary font-medium text-[15px] hover:text-text-primary hover:bg-white/5 px-4 py-2 rounded-full transition-all"
              >
                {item.name}
              </a>
            </li>
          ))}

          <li className="relative group" ref={dropdownRef}>
            <button
              onClick={toggleProjects}
              className="flex items-center gap-1 cursor-pointer text-text-secondary font-medium text-[15px] hover:text-text-primary hover:bg-white/5 px-4 py-2 rounded-full transition-all bg-transparent border-none outline-none"
            >
              Projects
              <FaChevronDown className={`text-[10px] transition-transform duration-300 ${isProjectsOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            <ul className={`
              absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2 
              bg-bg-tertiary border border-white/10 shadow-glass p-2 rounded-xl 
              min-w-[180px] list-none
              transition-all duration-300 ease-in-out origin-top
              ${isProjectsOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}
            `}>
              {projectsItems.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.href}
                    onClick={closeMenu}
                    className="block w-full text-left px-4 py-2.5 rounded-lg text-text-secondary hover:text-white hover:bg-primary transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        </ul>

        {/* Mobile Toggle */}
        <div className="md:hidden text-2xl text-text-primary cursor-pointer" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`
          fixed top-[80px] left-5 right-5 
          bg-bg-tertiary border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)] 
          p-6 rounded-3xl flex flex-col gap-4 
          transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) origin-top
          ${isMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-5'}
        `}>
          {navItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              onClick={(e) => handleLinkClick(e, item.href)}
              className="block text-center p-3 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 bg-white/[0.03]"
            >
              {item.name}
            </a>
          ))}

          <div className="bg-white/[0.03] rounded-lg overflow-hidden">
            <div className="p-3 text-center text-text-secondary font-medium border-b border-white/5">Projects</div>
            {projectsItems.map((item, index) => (
              <Link
                key={index}
                to={item.href}
                onClick={closeMenu}
                className="block text-center p-3 text-text-secondary hover:text-primary hover:bg-white/5"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
