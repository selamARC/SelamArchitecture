import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-grid">

          <div className="footer-col footer-brand-col">
            <div className="footer-brand">
              <img src="/assets/logos/logo.png" alt="Selam Logo" className="footer-logo" onError={(e) => { e.currentTarget.src = '/logo.png'; }} />
              <div>
                <span className="footer-brand-title">SELAM CONSULTING</span>
                <span className="footer-brand-sub">ARCHITECTS &amp; ENGINEERS PLC</span>
              </div>
            </div>
            <p className="footer-brand-desc">
              CAT-I registered architectural &amp; engineering consultancy delivering durable, iconic landmarks across Ethiopia since 2017.
            </p>
            <div className="footer-social-wrapper">
              <span className="footer-social-label">Connect With Us</span>
              <div className="footer-social">
                <a href="https://t.me/selamconsulting" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Telegram" title="Telegram">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg>
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook" title="Facebook" onClick={(e) => { if (e.currentTarget.getAttribute('href') === '#') e.preventDefault(); }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="LinkedIn" title="LinkedIn" onClick={(e) => { if (e.currentTarget.getAttribute('href') === '#') e.preventDefault(); }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram" title="Instagram" onClick={(e) => { if (e.currentTarget.getAttribute('href') === '#') e.preventDefault(); }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
              </div>
            </div>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Quick Links</h4>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/services">Services</Link>
            <Link to="/projects">Projects</Link>
            <Link to="/team">Team</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/#careers">Careers</Link>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Our Offices</h4>
            <p><strong>Head Office</strong>Addis Ababa, Ethiopia</p>
            <p><strong>Branch Office</strong>Atota, W/Amanuel Road, in front of Hayole School, Hawassa, Ethiopia</p>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Get In Touch</h4>
            <p><strong>Phone</strong>+251 91 606 7138<br />+251 96 104 7689</p>
            <p><strong>Email</strong>selamconsultantplc12@gmail.com</p>
          </div>

        </div>

        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} Selam Consulting Architects &amp; Engineers PLC. All Rights Reserved. &bull;{' '}
            <Link to="/admin" className="footer-staff-link" title="Authorized Staff Management Portal">Staff Portal</Link>
          </p>
          <p className="footer-tagline">CAT-I Certified Engineering &amp; Architectural Consultancy</p>
        </div>
      </div>
    </footer>
  );
}
