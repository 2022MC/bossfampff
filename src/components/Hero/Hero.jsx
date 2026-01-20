import React from 'react';
import { FaArrowDown } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './Hero.css';
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
    <section id="home" className="hero">
      <div className="hero-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <ShootingStars />
      </div>
      <motion.div
        className="hero-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="weather-container">
          <WeatherWidget />
        </motion.div>

        <motion.div className="hero-greeting" variants={itemVariants}>
          <span className="greeting-text">สวัสดีครับ, ผมชื่อ</span>
        </motion.div>
        <motion.h1 className="hero-name" variants={itemVariants}>
          <span className="name-first">Nathasit</span>
          <span className="name-last gradient-text">Opachalermpan</span>
        </motion.h1>
        <motion.h2 className="hero-title" variants={itemVariants}>
          <span className="title-line">EDITOR & Beginner Colorist</span>
          <span className="title-line">ชื่อเล่น : บอส</span>
        </motion.h2>
        <motion.p className="hero-description" variants={itemVariants}>
          ผมเป็นคนตัดต่อวิดีโอที่หลงใหลการเล่าเรื่องผ่านภาพและจังหวะ
          เสียง และอารมณ์ในทุกเฟรม งานของผมเน้นความลื่นไหล เรียบง่าย แต่มีพลัง
          ผมชอบการทำงานที่ใส่ใจรายละเอียด และพร้อมเรียนรู้เทคนิคใหม่ ๆ
          เพื่อให้ทุกโปรเจกต์ออกมาดีที่สุด เป้าหมายของผมคือการสร้างวิดีโอที่ทำให้คนดู "รู้สึก" และเชื่อมต่อกับเรื่องราวได้อย่างแท้จริง
        </motion.p>
        <motion.div className="hero-buttons" variants={itemVariants}>
          <a href="#projects" className="btn-primary">
            ดูผลงาน
          </a>
          <a href="#contact" className="btn-secondary">
            ติดต่อ
          </a>
        </motion.div>
        <motion.div className="hero-scroll" variants={itemVariants}>
          <a href="#about" className="scroll-indicator">
            <span>เลื่อนลง</span>
            <FaArrowDown className="scroll-arrow" />
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
