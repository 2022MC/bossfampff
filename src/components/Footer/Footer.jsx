import React from 'react';
import { FaHeart } from 'react-icons/fa';
// import './Footer.css'; // Removed CSS import

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-bg-primary border-t border-white/10 pt-20 px-5 pb-10 relative">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-10 md:gap-[60px] mb-[60px]">
          <div className="flex flex-col gap-4">
            <h3 className="font-space text-[32px] font-bold text-text-primary">Portfolio</h3>
            <p className="text-base text-text-secondary leading-relaxed max-w-[300px]">
              สร้างด้วย React และความรักในการพัฒนา
              <br />
              มุ่งมั่นสร้างสรรค์ผลงานคุณภาพด้วยเทคโนโลยีที่ทันสมัย
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <h4 className="font-space text-lg font-semibold text-text-primary">เมนู</h4>
            <ul className="list-none flex flex-col gap-4">
              <li><a href="#home" className="text-text-secondary text-[15px] transition-all duration-300 inline-block hover:text-primary hover:translate-x-[5px]">หน้าแรก</a></li>
              <li><a href="#about" className="text-text-secondary text-[15px] transition-all duration-300 inline-block hover:text-primary hover:translate-x-[5px]">เกี่ยวกับ</a></li>
              <li><a href="#skills" className="text-text-secondary text-[15px] transition-all duration-300 inline-block hover:text-primary hover:translate-x-[5px]">ทักษะ</a></li>
              <li><a href="#projects" className="text-text-secondary text-[15px] transition-all duration-300 inline-block hover:text-primary hover:translate-x-[5px]">ผลงาน</a></li>
            </ul>
          </div>

          <div className="flex flex-col gap-6">
            <h4 className="font-space text-lg font-semibold text-text-primary">ช่องทางติดต่อ</h4>
            <ul className="list-none flex flex-col gap-4">
              <li><a href="mailto:nathasit.mac@gmail.com" className="text-text-secondary text-[15px] transition-all duration-300 inline-block hover:text-primary hover:translate-x-[5px]">nathasit.mac@gmail.com</a></li>
              <li><a href="https://www.instagram.com/bossfam_editor/" target="_blank" rel="noopener noreferrer" className="text-text-secondary text-[15px] transition-all duration-300 inline-block hover:text-primary hover:translate-x-[5px]">Instargram</a></li>
              <li><a href="https://www.facebook.com/nathasit.opachalermpan.2025/" target="_blank" rel="noopener noreferrer" className="text-text-secondary text-[15px] transition-all duration-300 inline-block hover:text-primary hover:translate-x-[5px]">Facebook</a></li>
            </ul>
          </div>
        </div>

        <div className="text-center pt-[30px] border-t border-white/10">
          <p className="text-text-tertiary text-sm flex items-center justify-center gap-2">
            © {currentYear} สร้างด้วย <FaHeart className="text-accent animate-heartbeat" /> โดย Boss Entertainment
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
