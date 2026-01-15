import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import About from './components/About/About';
import Skills from './components/Skills/Skills';
import Projects from './components/Projects/Projects';
import Contact from './components/Contact/Contact';
import Footer from './components/Footer/Footer';
import NewsPopup from './components/NewsPopup/NewsPopup';
import ProjectsPage from './pages/ProjectsPage/ProjectsPage';
import GraphicAIPage from './pages/GraphicAIPage/GraphicAIPage';
import AdminPage from './pages/AdminPage/AdminPage';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import LoginPage from './pages/LoginPage/LoginPage';
import DiscordCallback from './pages/DiscordCallback/DiscordCallback';


function HomePage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="App">
      <NewsPopup />
      <Navbar scrollY={scrollY} />
      <Hero />
      <About />
      <Skills />
      <Projects limit={2} />
      <Contact />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ThemeProvider>

          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/graphic-ai" element={<GraphicAIPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/discord/callback" element={<DiscordCallback />} />
              <Route
                path="/admin"
                element={
                  <PrivateRoute>
                    <AdminPage />
                  </PrivateRoute>
                }
              />
            </Routes>
          </Router>
        </ThemeProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
