import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';
// import './Contact.css'; // Removed CSS import
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
    <section id="contact" className="py-[100px] px-5 bg-bg-secondary relative">
      <motion.div
        className="max-w-[1200px] mx-auto"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div className="text-center mb-20" variants={itemVariants}>
          <h2 className="font-space text-[clamp(32px,5vw,48px)] font-bold text-text-primary mb-4 flex items-center justify-center gap-4">
            <span className="font-mono text-xl text-primary font-normal">04.</span>
            ติดต่อผม
          </h2>
          <p className="text-[clamp(16px,2vw,18px)] text-text-secondary max-w-[600px] mx-auto">
            มีโปรเจกต์ที่น่าสนใจ? มาแลกเปลี่ยนความคิดเห็นกันเลย!
          </p>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-20 items-start">
          <motion.div className="flex flex-col gap-10" variants={itemVariants}>
            <div className="mb-4">
              <h3 className="font-space text-[28px] font-bold text-text-primary mb-4">ติดต่อได้ที่</h3>
              <p className="text-base text-text-secondary leading-[1.6]">
                ผมพร้อมรับฟังความคิดเห็นและโอกาสใหม่ๆ
                ไม่ว่าจะเป็นโปรเจกต์งานหรือการร่วมมือกัน
              </p>
            </div>
            <div className="flex flex-col gap-6">
              {contactInfo.map((info, index) => (
                <motion.a
                  key={index}
                  href={info.link}
                  className="flex flex-col md:flex-row items-center md:items-center text-center md:text-left gap-6 p-6 bg-white/[0.03] rounded-[30px] border border-white/10 transition-all duration-300 hover:border-primary hover:translate-x-2.5 hover:bg-primary/5 group decoration-0"
                  variants={itemVariants}
                  whileHover={{ x: 10 }}
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl shrink-0 transition-all duration-300 group-hover:bg-primary group-hover:text-white">{info.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-space text-lg font-semibold text-text-primary mb-1">{info.title}</h4>
                    <p className="text-sm text-text-secondary">{info.content}</p>
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>
          <motion.form
            className="bg-bg-tertiary p-8 md:p-10 rounded-[30px] border border-white/10 flex flex-col gap-6"
            onSubmit={handleSubmit}
            variants={itemVariants}
          >
            <div className="w-full">
              <input
                type="text"
                name="name"
                placeholder="ชื่อของคุณ"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-5 bg-bg-primary border border-white/10 rounded-2xl text-text-primary text-base transition-all duration-300 outline-none placeholder:text-text-tertiary focus:border-primary focus:bg-primary/5 focus:ring-4 focus:ring-primary/10"
              />
            </div>
            <div className="w-full">
              <input
                type="email"
                name="email"
                placeholder="อีเมลของคุณ"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-5 bg-bg-primary border border-white/10 rounded-2xl text-text-primary text-base transition-all duration-300 outline-none placeholder:text-text-tertiary focus:border-primary focus:bg-primary/5 focus:ring-4 focus:ring-primary/10"
              />
            </div>
            <div className="w-full">
              <input
                type="text"
                name="subject"
                placeholder="หัวข้อ"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full p-5 bg-bg-primary border border-white/10 rounded-2xl text-text-primary text-base transition-all duration-300 outline-none placeholder:text-text-tertiary focus:border-primary focus:bg-primary/5 focus:ring-4 focus:ring-primary/10"
              />
            </div>
            <div className="w-full">
              <textarea
                name="message"
                placeholder="ข้อความ"
                rows="6"
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full p-5 bg-bg-primary border border-white/10 rounded-2xl text-text-primary text-base transition-all duration-300 outline-none placeholder:text-text-tertiary focus:border-primary focus:bg-primary/5 focus:ring-4 focus:ring-primary/10 resize-y min-h-[160px]"
              ></textarea>
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-3 w-full p-4 mt-2.5 text-base font-semibold rounded-2xl bg-primary text-white shadow-glow-primary transition-all duration-300 hover:bg-secondary hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed group"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'กำลังส่ง...' : 'ส่งข้อความ'}
              {!isSubmitting && <FaPaperPlane className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-rotate-12" />}
            </button>
          </motion.form>
        </div>
      </motion.div>
    </section>
  );
};

export default Contact;
