import React from 'react';
import { FaHeart } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <h3 className="footer-logo">Portfolio</h3>
            <p className="footer-description">
              สร้างด้วย React และความรักในการพัฒนา
              <br />
              มุ่งมั่นสร้างสรรค์ผลงานคุณภาพด้วยเทคโนโลยีที่ทันสมัย
            </p>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">เมนู</h4>
            <ul className="footer-list">
              <li><a href="#home">หน้าแรก</a></li>
              <li><a href="#about">เกี่ยวกับ</a></li>
              <li><a href="#skills">ทักษะ</a></li>
              <li><a href="#projects">ผลงาน</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">ช่องทางติดต่อ</h4>
            <ul className="footer-list">
              <li><a href="mailto:nathasit.mac@gmail.com">nathasit.mac@gmail.com</a></li>
              <li><a href="https://www.instagram.com/bossfam_editor/" target="_blank" rel="noopener noreferrer">Instargram</a></li>
              <li><a href="https://www.facebook.com/nathasit.opachalermpan.2025/" target="_blank" rel="noopener noreferrer">Facebook</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {currentYear} สร้างด้วย <FaHeart className="heart-icon" /> โดย Boss Entertainment
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
