"use client";

import React from 'react';
import { FaHeart, FaInstagram, FaFacebook, FaEnvelope } from 'react-icons/fa';
import { FaLine } from 'react-icons/fa6';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const socialLinks = [
        { icon: <FaInstagram />, href: 'https://www.instagram.com/bosskung.cc/', label: 'Instagram' },
        { icon: <FaFacebook />, href: 'https://www.facebook.com/nathasit.opachalermpan.2025/', label: 'Facebook' },
        { icon: <FaLine />, href: 'https://line.me/ti/p/@bosszaza1852', label: 'Line' },
        { icon: <FaEnvelope />, href: 'mailto:nathasit.mac@gmail.com', label: 'Email' },
    ];

    return (
        <footer className="border-t pt-16 px-5 pb-8 relative transition-colors duration-300"
            style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--glass-border)'
            }}>

            {/* Gradient divider at top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 max-w-[400px] h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.3), transparent)' }}></div>

            <div className="max-w-[1200px] mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-10 md:gap-16 mb-12">
                    <div className="flex flex-col gap-4">
                        <h3 className="font-space text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                            <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black"
                                style={{ background: 'linear-gradient(135deg, #06b6d4, #14b8a6)' }}>B</span>
                            Portfolio
                        </h3>
                        <p className="text-sm leading-relaxed max-w-[300px]" style={{ color: 'var(--text-secondary)' }}>
                            สร้างด้วย Next.js และความรักในการพัฒนา
                            <br />
                            มุ่งมั่นสร้างสรรค์ผลงานคุณภาพ
                        </p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h4 className="font-space text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>เมนู</h4>
                        <ul className="list-none flex flex-col gap-3">
                            {[
                                { name: 'หน้าแรก', href: '#home' },
                                { name: 'เกี่ยวกับ', href: '#about' },
                                { name: 'ทักษะ', href: '#skills' },
                                { name: 'ผลงาน', href: '#projects' },
                            ].map((link) => (
                                <li key={link.href}>
                                    <a href={link.href} className="text-sm transition-all duration-300 inline-block hover:translate-x-1"
                                        style={{ color: 'var(--text-secondary)' }}
                                        onMouseEnter={(e) => (e.currentTarget.style.color = '#06b6d4')}
                                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h4 className="font-space text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>ช่องทางติดต่อ</h4>
                        <div className="flex gap-3">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target={social.href.startsWith('http') ? '_blank' : undefined}
                                    rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-300 hover:-translate-y-1"
                                    style={{
                                        color: 'var(--text-secondary)',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid var(--glass-border)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = '#06b6d4';
                                        e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.3)';
                                        e.currentTarget.style.background = 'rgba(6, 182, 212, 0.08)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = 'var(--text-secondary)';
                                        e.currentTarget.style.borderColor = 'var(--glass-border)';
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                    }}
                                    title={social.label}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="text-center pt-6 border-t" style={{ borderColor: 'var(--glass-border)' }}>
                    <p className="text-xs flex items-center justify-center gap-2" style={{ color: 'var(--text-tertiary)' }}>
                        © {currentYear} สร้างด้วย <FaHeart className="animate-heartbeat" style={{ color: '#06b6d4' }} /> โดย Boss Entertainment
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
