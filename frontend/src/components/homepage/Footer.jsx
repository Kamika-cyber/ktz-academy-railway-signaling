import React from 'react';

function Footer({ t }) {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-logos">
          <img src="/public/KTZ-logo.png" alt="KTZ Academy Logo" className="footer-logo-img" />
          <img src="/public/aitu-logo.png" alt="Safety Dept Logo" className="footer-logo-img" />
        </div>
        
        <div className="footer-links">
          <h4>{t.footer_quick_links}</h4>
          <a href="#about">{t.footer_about}</a>
          <a href="#company">{t.footer_company}</a>
          <a href="#contact">{t.footer_contact}</a>
          <a href="index.html">{t.footer_portal}</a>
        </div>
        
        <div className="footer-links">
          <h4>{t.footer_legal}</h4>
          <a href="#">{t.footer_privacy}</a>
          <a href="#">{t.footer_terms}</a>
          <a href="#">{t.footer_cookie}</a>
        </div>
        
        <div className="footer-social">
          <h4>{t.footer_connect}</h4>
          <div>
            <a href="https://www.tiktok.com/@railwayskz" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
              <i className="fab fa-tiktok"></i>
            </a>
            <a href="https://instagram.com/railways.kz" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://www.youtube.com/@railwaysresmi" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
              <i className="fab fa-youtube"></i>
            </a>
          </div>
        </div>
      </div>
      
      <p className="copy">
        &copy; 2026 KTZ Academy. <span>{t.footer_copy}</span>
      </p>
    </footer>
  );
}

export default Footer;