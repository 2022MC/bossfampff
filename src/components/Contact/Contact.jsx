import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';
import './Contact.css';
import { useNotification } from '../../context/NotificationContext';
import { sendDiscordWebhook } from '../../utils/discordWebhook';

const Contact = () => {
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await sendDiscordWebhook('contact', formData);
      showNotification('ขอบคุณสำหรับข้อความ! ผมจะติดต่อกลับโดยเร็วที่สุด', 'success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error("Error sending message:", error);
      showNotification('เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <FaEnvelope />,
      title: 'Email',
      content: 'nathasit.mac@gmail.com',
      link: 'mailto:nathasit.mac@gmail.com'
    },
    {
      icon: <FaPhone />,
      title: 'Phone',
      content: '+66 94 306 6392',
      link: 'tel:+66943066392'
    },
    {
      icon: <FaMapMarkerAlt />,
      title: 'Location',
      content: 'Bangkok, Thailand',
      link: '#'
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
    <section id="contact" className="contact">
      <motion.div
        className="contact-container"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div className="contact-header" variants={itemVariants}>
          <h2 className="section-title">
            <span className="title-number">04.</span>
            ติดต่อผม
          </h2>
          <p className="section-subtitle">
            มีโปรเจกต์ที่น่าสนใจ? มาแลกเปลี่ยนความคิดเห็นกันเลย!
          </p>
        </motion.div>
        <div className="contact-content">
          <motion.div className="contact-info" variants={itemVariants}>
            <h3 className="info-title">ติดต่อได้ที่</h3>
            <p className="info-description">
              ผมพร้อมรับฟังความคิดเห็นและโอกาสใหม่ๆ
              ไม่ว่าจะเป็นโปรเจกต์งานหรือการร่วมมือกัน
            </p>
            <div className="contact-items">
              {contactInfo.map((info, index) => (
                <motion.a
                  key={index}
                  href={info.link}
                  className="contact-item"
                  variants={itemVariants}
                  whileHover={{ x: 10 }}
                >
                  <div className="contact-icon">{info.icon}</div>
                  <div className="contact-details">
                    <h4 className="contact-item-title">{info.title}</h4>
                    <p className="contact-item-content">{info.content}</p>
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>
          <motion.form
            className="contact-form"
            onSubmit={handleSubmit}
            variants={itemVariants}
          >
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="ชื่อของคุณ"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="อีเมลของคุณ"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="subject"
                placeholder="หัวข้อ"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <textarea
                name="message"
                placeholder="ข้อความ"
                rows="6"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="btn-primary form-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'กำลังส่ง...' : 'ส่งข้อความ'}
              {!isSubmitting && <FaPaperPlane className="submit-icon" />}
            </button>
          </motion.form>
        </div>
      </motion.div>
    </section>
  );
};

export default Contact;
