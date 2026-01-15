import React, { useState, useEffect } from 'react';
import Projects from '../../components/Projects/Projects';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import './ProjectsPage.css';

const ProjectsPage = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="projects-page">
      <Navbar scrollY={scrollY} />
      <div className="projects-page-content">
        <Projects />
      </div>
      <Footer />
    </div>
  );
};

export default ProjectsPage;
