import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';
import './Navbar.css';

const Navbar = ({ scrollY }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const dropdownRef = useRef(null);

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



  return (
    <nav className={`navbar ${scrollY > 50 ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <div className="nav-logo">
          <Link to="/">Portfolio</Link>
        </div>

        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          {navItems.map((item, index) => (
            <li key={index} className="nav-item">
              <a
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  closeMenu();
                  const targetId = item.href.replace('#', '');
                  if (item.href.startsWith('#')) {
                    if (window.location.pathname === '/') {
                      const element = document.getElementById(targetId);
                      if (element) element.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      window.location.href = `/${item.href}`;
                    }
                  } else {
                    window.location.href = item.href;
                  }
                }}
              >
                {item.name}
              </a>
            </li>
          ))}
          <li className="nav-item nav-item-dropdown" ref={dropdownRef}>
            <a
              href="#projects"
              className="nav-dropdown-toggle"
              onClick={toggleProjects}
            >
              Projects
              <FaChevronDown className={`dropdown-icon ${isProjectsOpen ? 'open' : ''}`} />
            </a>
            <ul className={`nav-dropdown ${isProjectsOpen ? 'active' : ''}`}>
              {projectsItems.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.href}
                    onClick={closeMenu}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>


        </ul>

        <div className="nav-actions">


          <div className="nav-toggle" onClick={toggleMenu}>
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
