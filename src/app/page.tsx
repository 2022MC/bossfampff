"use client";

import Hero from '@/components/Hero';
import About from '@/components/About';
import Skills from '@/components/Skills';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import NewsPopup from '@/components/NewsPopup';

export default function Home() {
  return (
    <div className="w-full min-h-screen relative">
      <NewsPopup />
      <Hero />
      <About />
      <Skills />
      <Projects limit={2} />
      <Contact />
    </div>
  );
}
