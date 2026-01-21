import React from 'react';
import { FaArrowDown } from 'react-icons/fa';
import { motion } from 'framer-motion';
// import './Hero.css'; // Removed CSS import
import WeatherWidget from '../WeatherWidget/WeatherWidget';
import ShootingStars from '../ShootingStars/ShootingStars';

const Hero = () => {

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-[120px] px-5 pb-20 bg-[radial-gradient(circle_at_50%_50%,#0f172a_0%,#020617_100%)]">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full blur-[100px] opacity-40 animate-float-orb z-0 w-[600px] h-[600px] bg-primary-glow -top-[10%] -left-[10%]"></div>
        <div className="absolute rounded-full blur-[100px] opacity-40 animate-float-orb z-0 w-[500px] h-[500px] bg-secondary-glow -bottom-[10%] -right-[5%] [animation-delay:-5s]"></div>
        <div className="absolute rounded-full blur-[100px] opacity-40 animate-float-orb z-0 w-[400px] h-[400px] bg-accent-glow top-[40%] right-[20%] [animation-delay:-10s]"></div>
        <ShootingStars />
      </div>
      <motion.div
        className="max-w-[900px] text-center relative z-[2] w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-8 flex justify-center">
          <WeatherWidget />
        </motion.div>

        <motion.div className="mb-6" variants={itemVariants}>
          <span className="font-space text-[clamp(16px,2vw,20px)] text-primary font-medium tracking-[2px] uppercase bg-primary-glow/10 px-4 py-2 rounded-full border border-primary/20 inline-block">
            สวัสดีครับ, ผมชื่อ
          </span>
        </motion.div>
        <motion.h1 className="text-[clamp(48px,8vw,96px)] font-extrabold mb-4 leading-[1.1] tracking-[-2px]" variants={itemVariants}>
          <span className="block text-text-primary">Nathasit</span>
          <span className="block bg-gradient-to-r from-[#818cf8] via-[#c084fc] to-[#f472b6] text-transparent bg-clip-text bg-[length:200%_auto] animate-shine">Opachalermpan</span>
        </motion.h1>
        <motion.h2 className="font-space text-[clamp(20px,4vw,32px)] font-normal text-text-secondary mb-8 leading-[1.4] tracking-[-0.5px]" variants={itemVariants}>
          <span className="block mb-2">EDITOR & Beginner Colorist</span>
          <span className="block mb-2">ชื่อเล่น : บอส</span>
        </motion.h2>
        <motion.p className="text-[clamp(16px,2vw,18px)] text-text-secondary leading-[1.8] mb-12 max-w-[650px] mx-auto" variants={itemVariants}>
          ผมเป็นคนตัดต่อวิดีโอที่หลงใหลการเล่าเรื่องผ่านภาพและจังหวะ
          เสียง และอารมณ์ในทุกเฟรม งานของผมเน้นความลื่นไหล เรียบง่าย แต่มีพลัง
          ผมชอบการทำงานที่ใส่ใจรายละเอียด และพร้อมเรียนรู้เทคนิคใหม่ ๆ
          เพื่อให้ทุกโปรเจกต์ออกมาดีที่สุด เป้าหมายของผมคือการสร้างวิดีโอที่ทำให้คนดู "รู้สึก" และเชื่อมต่อกับเรื่องราวได้อย่างแท้จริง
        </motion.p>
        <motion.div className="flex gap-6 justify-center mb-20 flex-col md:flex-row items-center w-full" variants={itemVariants}>
          <a href="#projects" className="btn-primary w-full max-w-[300px] md:w-auto relative z-[1] shadow-glow-primary hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] hover:bg-secondary">
            ดูผลงาน
          </a>
          <a href="#contact" className="btn-secondary w-full max-w-[300px] md:w-auto border border-white/10 backdrop-blur-md hover:bg-white/5 hover:border-text-primary">
            ติดต่อ
          </a>
        </motion.div>
        <motion.div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10" variants={itemVariants}>
          <a href="#about" className="flex flex-col items-center gap-2 text-text-tertiary no-underline text-sm font-medium tracking-wide uppercase transition-all duration-300 hover:text-text-primary group">
            <span>เลื่อนลง</span>
            <FaArrowDown className="text-xl animate-bounce text-primary group-hover:text-secondary" />
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
