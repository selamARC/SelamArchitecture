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
              <div className="footer-social-header">
                <div className="footer-social-title-wrap">
                  <span className="footer-social-dot"></span>
                  <span className="footer-social-label">Official Channels</span>
                </div>
                <span className="footer-live-badge">
                  <span className="live-pulse-dot"></span> Active
                </span>
              </div>
              <p className="footer-social-subtext">Direct architectural consultations &amp; updates</p>
              <div className="footer-social">
                <a
                  href="https://t.me/selamconsulting"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon telegram"
                  aria-label="Telegram Channel"
                  data-tooltip="Telegram"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.95-1.28 4.92-2.13 5.92-2.54 2.81-1.17 3.4-1.38 3.78-1.38.08 0 .28.02.4.12.1.08.13.2.14.28-.01.07-.01.21-.03.47z"/>
                  </svg>
                  <span className="social-tooltip">Telegram</span>
                </a>

                <a
                  href="https://wa.me/251916067138"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon whatsapp"
                  aria-label="WhatsApp Direct"
                  data-tooltip="WhatsApp"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.35C9.34 7.35 9.04 7.42 8.78 7.7C8.53 7.98 7.8 8.66 7.8 10.05C7.8 11.44 8.82 12.78 8.96 12.97C9.1 13.16 10.94 16 13.78 17.22C16.14 18.24 16.62 18.04 17.13 17.99C17.64 17.94 18.78 17.31 19.02 16.65C19.25 15.98 19.25 15.41 19.18 15.3C19.11 15.18 18.93 15.11 18.65 14.97C18.37 14.83 17.01 14.16 16.76 14.07C16.5 13.98 16.32 13.93 16.13 14.21C15.95 14.49 15.42 15.11 15.26 15.3C15.1 15.48 14.94 15.51 14.66 15.37C14.38 15.23 13.48 14.93 12.42 13.98C11.59 13.24 11.03 12.33 10.87 12.05C10.71 11.77 10.85 11.62 10.99 11.48C11.12 11.35 11.28 11.14 11.42 10.98C11.56 10.82 11.61 10.7 11.7 10.51C11.79 10.33 11.75 10.17 11.68 10.03C11.61 9.89 11.06 8.53 10.82 7.97C10.6 7.43 10.37 7.5 10.19 7.5H9.53V7.35Z"/>
                  </svg>
                  <span className="social-tooltip">WhatsApp</span>
                </a>

                <a
                  href="https://linkedin.com/company/selam-consulting"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon linkedin"
                  aria-label="LinkedIn Profile"
                  data-tooltip="LinkedIn"
                  onClick={(e) => { if (e.currentTarget.getAttribute('href') === '#') e.preventDefault(); }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                  </svg>
                  <span className="social-tooltip">LinkedIn</span>
                </a>

                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon facebook"
                  aria-label="Facebook Page"
                  data-tooltip="Facebook"
                  onClick={(e) => { if (e.currentTarget.getAttribute('href') === '#') e.preventDefault(); }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z"/>
                  </svg>
                  <span className="social-tooltip">Facebook</span>
                </a>

                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon instagram"
                  aria-label="Instagram Gallery"
                  data-tooltip="Instagram"
                  onClick={(e) => { if (e.currentTarget.getAttribute('href') === '#') e.preventDefault(); }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span className="social-tooltip">Instagram</span>
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
            <Link to="/admin" className="footer-staff-link" title="Authorized Staff Management Portal">Admin Portal</Link> &bull;{' '}
            <Link to="/super-admin" className="footer-staff-link" title="Super Admin / Owner Control Panel" style={{ color: 'var(--accent-gold)' }}>👑 Super Admin</Link>
          </p>
          <p className="footer-tagline">CAT-I Certified Engineering &amp; Architectural Consultancy</p>
        </div>
      </div>
    </footer>
  );
}
