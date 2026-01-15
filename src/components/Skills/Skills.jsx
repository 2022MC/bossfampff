import React from 'react';
import { motion } from 'framer-motion';
import {
  FaCut,
  FaBrain,
  FaVideo,
  FaCamera,
  FaFilm,
} from 'react-icons/fa';
import {
  SiAdobepremierepro,
  SiAdobeaftereffects,
  SiAdobephotoshop,
  SiAdobeillustrator,
  SiCanva,
} from 'react-icons/si';
import './Skills.css';

const Skills = () => {
  const skillCategories = [
    {
      title: 'Skills',
      skills: [
        { name: 'Adobe Premiere Pro (ดีมาก)', icon: <SiAdobepremierepro />, level: 85 },
        { name: 'Final Cut Pro (ดีมาก)', icon: <FaVideo />, level: 85 },
        { name: 'Adobe After Effects (ดี)', icon: <SiAdobeaftereffects />, level: 60 },
        { name: 'Adobe Photoshop (ดี)', icon: <SiAdobephotoshop />, level: 60 },
        { name: 'Adobe Illustrator (ปานกลาง)', icon: <SiAdobeillustrator />, level: 40 },
        { name: 'Capcut (ดีมาก)', icon: <FaCut />, level: 75 },
        { name: 'Canva (ดีมาก)', icon: <SiCanva />, level: 75 },
        { name: 'Stable Diffusion (พื้นฐาน)', icon: <FaBrain />, level: 30 },
      ]
    },
    {
      title: 'ทักษะการใช้อุปกรณ์',
      skills: [
        { name: 'ทักษะการใช้กล้อง (ดี)', icon: <FaCamera />, level: 80 },
        { name: 'ทักษะการใช้โรนิน (ปานกลาง)', icon: <FaFilm />, level: 60 },
      ]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <section id="skills" className="skills">
      <motion.div
        className="skills-container"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.div className="skills-header" variants={itemVariants}>
          <h2 className="section-title">
            <span className="title-number">02.</span>
            ทักษะและเทคโนโลยี
          </h2>
        </motion.div>
        <div className="skills-grid">
          {skillCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.title || categoryIndex}
              className="skill-category"
              variants={itemVariants}
            >
              <h3 className="category-title">{category.title}</h3>
              <div className="skills-list">
                {category.skills.map((skill, skillIndex) => (
                  <motion.div
                    key={skill.name || skillIndex}
                    className="skill-item"
                    variants={itemVariants}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="skill-header">
                      <div className="skill-icon">{skill.icon}</div>
                      <span className="skill-name">{skill.name}</span>
                      <span className="skill-percentage">{skill.level}%</span>
                    </div>
                    <div className="skill-bar">
                      <motion.div
                        className="skill-progress"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: skillIndex * 0.1 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default Skills;
