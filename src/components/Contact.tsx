"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane, FaFacebook, FaInstagram } from 'react-icons/fa';
import { FaLine } from 'react-icons/fa6';
import { useNotification } from '@/context/NotificationContext';
import { sendDiscordWebhook } from '@/utils/discordWebhook';

const Contact = () => {
    const { showNotification } = useNotification();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
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
            link: 'mailto:nathasit.mac@gmail.com',
            color: '#06b6d4'
        },
        {
            icon: <FaPhone />,
            title: 'Phone',
            content: '+66 94 306 6392',
            link: 'tel:+66943066392',
            color: '#14b8a6'
        },
        {
            icon: <FaMapMarkerAlt />,
            title: 'Location',
            content: 'Bangkok, Thailand',
            link: '#',
            color: '#3b82f6'
        },
        {
            icon: <FaLine />,
            title: 'Line',
            content: '@bosszaza1852',
            link: 'https://line.me/ti/p/@bosszaza1852',
            color: '#06C755'
        },
        {
            icon: <FaFacebook />,
            title: 'Facebook',
            content: 'Nathasit Opachalermpan',
            link: 'https://www.facebook.com/nathasit.opachalermpan.2025/',
            color: '#1877F2'
        },
        {
            icon: <FaInstagram />,
            title: 'Instagram',
            content: '@bosskung.cc',
            link: 'https://www.instagram.com/bosskung.cc/',
            color: '#E4405F'
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.2,
                staggerChildren: 0.08
            }
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }
        }
    };

    const inputClasses = "w-full px-5 py-4 rounded-2xl text-base transition-all duration-300 outline-none font-sans";

    return (
        <section id="contact" className="py-[100px] px-5 relative" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div className="absolute top-0 left-0 w-1/2 h-1/2 pointer-events-none opacity-30"
                style={{ background: 'radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.06) 0%, transparent 50%)' }}></div>

            <motion.div
                className="max-w-[1200px] mx-auto relative z-[1]"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
            >
                <motion.div className="mb-16" variants={itemVariants}>
                    <h2 className="font-space text-3xl md:text-4xl font-bold flex items-baseline gap-3" style={{ color: 'var(--text-primary)' }}>
                        <span className="font-mono text-lg" style={{ color: '#06b6d4' }}>04.</span>
                        ติดต่อผม
                    </h2>
                    <p className="text-base mt-3 max-w-[500px]" style={{ color: 'var(--text-secondary)' }}>
                        มีโปรเจกต์ที่น่าสนใจ? มาแลกเปลี่ยนความคิดเห็นกันเลย!
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-12 lg:gap-16 items-start">
                    <motion.div className="flex flex-col gap-4" variants={itemVariants}>
                        {contactInfo.map((info, index) => (
                            <motion.a
                                key={index}
                                href={info.link}
                                className="bento-card flex items-center gap-5 group !rounded-2xl decoration-0"
                                variants={itemVariants}
                                whileHover={{ x: 6 }}
                            >
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg shrink-0 transition-all duration-300"
                                    style={{
                                        color: info.color,
                                        background: `${info.color}12`
                                    }}>
                                    {info.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-space text-sm font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>{info.title}</h4>
                                    <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>{info.content}</p>
                                </div>
                            </motion.a>
                        ))}
                    </motion.div>

                    <motion.form
                        className="bento-card !p-8 md:!p-10 flex flex-col gap-5"
                        onSubmit={handleSubmit}
                        variants={itemVariants}
                    >
                        {[
                            { name: 'name', type: 'text', placeholder: 'ชื่อของคุณ' },
                            { name: 'email', type: 'email', placeholder: 'อีเมลของคุณ' },
                            { name: 'subject', type: 'text', placeholder: 'หัวข้อ' },
                        ].map((field) => (
                            <div key={field.name} className="w-full">
                                <input
                                    type={field.type}
                                    name={field.name}
                                    placeholder={field.placeholder}
                                    value={formData[field.name as keyof typeof formData]}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField(field.name)}
                                    onBlur={() => setFocusedField(null)}
                                    required
                                    className={inputClasses}
                                    style={{
                                        backgroundColor: focusedField === field.name ? 'rgba(6, 182, 212, 0.05)' : 'var(--bg-primary)',
                                        border: `1px solid ${focusedField === field.name ? 'rgba(6, 182, 212, 0.4)' : 'var(--glass-border)'}`,
                                        color: 'var(--text-primary)',
                                        boxShadow: focusedField === field.name ? '0 0 0 4px rgba(6, 182, 212, 0.06)' : 'none'
                                    }}
                                />
                            </div>
                        ))}
                        <div className="w-full">
                            <textarea
                                name="message"
                                placeholder="ข้อความ"
                                rows={5}
                                value={formData.message}
                                onChange={handleChange}
                                onFocus={() => setFocusedField('message')}
                                onBlur={() => setFocusedField(null)}
                                required
                                className={`${inputClasses} resize-y min-h-[140px]`}
                                style={{
                                    backgroundColor: focusedField === 'message' ? 'rgba(6, 182, 212, 0.05)' : 'var(--bg-primary)',
                                    border: `1px solid ${focusedField === 'message' ? 'rgba(6, 182, 212, 0.4)' : 'var(--glass-border)'}`,
                                    color: 'var(--text-primary)',
                                    boxShadow: focusedField === 'message' ? '0 0 0 4px rgba(6, 182, 212, 0.06)' : 'none'
                                }}
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            className="flex items-center justify-center gap-3 w-full py-4 mt-2 text-base font-semibold rounded-2xl text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                            disabled={isSubmitting}
                            style={{
                                background: 'linear-gradient(135deg, #06b6d4, #14b8a6)',
                                boxShadow: '0 0 20px rgba(6, 182, 212, 0.3), 0 4px 15px rgba(0, 0, 0, 0.2)'
                            }}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                    </svg>
                                    กำลังส่ง...
                                </span>
                            ) : (
                                <>
                                    ส่งข้อความ
                                    <FaPaperPlane className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-rotate-12" />
                                </>
                            )}
                        </button>
                    </motion.form>
                </div>
            </motion.div>
        </section>
    );
};

export default Contact;
