import React from 'react';
import { motion } from 'framer-motion';
import { FaCut, FaBrain, FaRocket } from 'react-icons/fa';
import './About.css';

const About = () => {
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

  const features = [
    {
      icon: <FaCut />,
      title: 'Cutting and Editing',
      description: 'กระบวนการนำคลิปวิดีโอหรือภาพที่ถ่ายทำไว้ (ฟุตเทจ) มา "ตัด" (Cut) ส่วนที่ไม่ต้องการทิ้ง และนำส่วนที่ต้องการมา "เรียงลำดับ" (Edit) ต่อกันอย่างต่อเนื่อง เชื่อมโยงภาพและเสียงเข้าด้วยกัน'
    },
    {
      icon: <FaBrain />,
      title: 'Growth Mindset',
      description: 'การมี เป้าหมายชัดเจน, ทำงานเป็นระบบ, พัฒนาตัวเองสม่ำเสมอ'
    },
    {
      icon: <FaRocket />,
      title: 'One things at a time',
      description: 'วางแผนและจัดลำดับก่อนลงมือเสมอ มีสมาธิในการทำงานที่กำหนด'
    }
  ];

  return (
    <section id="about" className="about">
      <motion.div
        className="about-container"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.div className="about-header" variants={itemVariants}>
          <h2 className="section-title">
            <span className="title-number">01.</span>
            เกี่ยวกับผม
          </h2>
        </motion.div>
        <div className="about-content">
          <motion.div className="about-text" variants={itemVariants}>
            <p>
            สวัสดีครับ ผมชื่อ บอส ผมเป็นคนตัดต่อวิดีโอที่หลงใหลการเล่าเรื่องผ่านภาพและจังหวะ เสียง และอารมณ์ในทุกเฟรม งานของผมเน้นความลื่นไหล เรียบง่าย แต่มีพลัง ผมชอบการทำงานที่ใส่ใจรายละเอียด และพร้อมเรียนรู้เทคนิคใหม่ ๆ เพื่อให้ทุกโปรเจกต์ออกมาดีที่สุด เป้าหมายของผมคือการสร้างวิดีโอที่ทำให้คนดู "รู้สึก" และเชื่อมต่อกับเรื่องราวได้อย่างแท้จริง
            </p>
            <div className="about-stats">
              <div className="stat-item">
                <div className="stat-number">20+</div>
                <div className="stat-label">โปรเจกต์ที่เสร็จแล้ว</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">2 ปี</div>
                <div className="stat-label">ประสบการณ์ด้าน <br />
                  โปรดักชั่น <br />
                  และ ตัดต่อ</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">100%</div>
                <div className="stat-label">ความมุ่งมั่น</div>
              </div>
            </div>
          </motion.div>
          <motion.div className="about-features" variants={itemVariants}>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card"
                variants={itemVariants}
                whileHover={{ y: -10 }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default About;
