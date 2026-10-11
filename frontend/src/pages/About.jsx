import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="page-wrapper">

      {/* ── COMPANY OVERVIEW ── */}
      <section className="company-overview-section" aria-label="Company Overview">
        <div className="company-overview-container">

          <div className="company-overview-header">
            <span className="section-tag">COMPANY OVERVIEW</span>
            <h1 className="company-overview-title">Architecture, Engineering &amp; Consultancy</h1>
            <p className="company-overview-text">
              Selam Consulting Architects &amp; Engineers PLC is an Ethiopian architectural and engineering
              consultancy established in April 2017, providing multidisciplinary professional services from
              initial concept and design through construction supervision and project completion.
            </p>
          </div>

          {/* COMPANY PROFILE CARD */}
          <div className="company-profile-card">
            <div className="company-profile-content">
              <span className="company-profile-kicker">ABOUT SELAM</span>
              <h2 className="company-profile-title">Building Ideas Into Lasting Spaces</h2>
              <p className="company-profile-description">
                Selam Consulting Architects &amp; Engineers PLC is a multidisciplinary architectural and
                engineering consultancy established in April 2017. The company provides professional
                services from initial concept and design through construction supervision and project
                completion, serving government, non-government and private clients.
              </p>
            </div>

            <div className="company-profile-image">
              <img
                src="/company-image.jpg"
                alt="Selam Consulting Architects &amp; Engineers project or company image"
                onError={(e) => { e.currentTarget.src = '/assets/front/foq.jpg'; }}
              />
            </div>
          </div>

          {/* FACTS GRID */}
          <div className="company-facts-grid">
            <div className="company-fact-card">
              <div className="company-fact-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="17" rx="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div>
                <span className="company-fact-label">ESTABLISHED</span>
                <strong className="company-fact-value">April 2017</strong>
              </div>
            </div>

            <div className="company-fact-card">
              <div className="company-fact-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div>
                <span className="company-fact-label">TEAM</span>
                <strong className="company-fact-value">30 Professionals</strong>
              </div>
            </div>

            <div className="company-fact-card">
              <div className="company-fact-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <path d="M9 12l2 2 4-4"></path>
                </svg>
              </div>
              <div>
                <span className="company-fact-label">REGISTRATION</span>
                <strong className="company-fact-value">Category I Consultant</strong>
              </div>
            </div>

            <div className="company-fact-card">
              <div className="company-fact-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z"></path>
                  <circle cx="12" cy="10" r="2.5"></circle>
                </svg>
              </div>
              <div>
                <span className="company-fact-label">LOCATIONS</span>
                <strong className="company-fact-value">Addis Ababa &amp; Hawassa</strong>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── MISSION & VISION ── */}
      <section className="mission-vision-section" id="about">
        <div className="mv-container">

          <div className="mv-header">
            <span className="section-tag">OUR PURPOSE &amp; DIRECTION</span>
            <h2 className="mv-title">Driven by Purpose, Guided by Excellence</h2>
            <p className="mv-subtitle">
              At Selam Consulting Architects &amp; Engineers PLC, we build lasting partnerships by
              delivering engineering integrity and architectural mastery.
            </p>
          </div>

          {/* Mission & Vision Dual Cards */}
          <div className="mv-cards-grid">

            {/* Mission Card */}
            <div className="mv-card mission-card">
              <div className="mv-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </div>
              <h3 className="mv-card-title">Our Mission</h3>
              <p className="mv-card-text">
                To provide comprehensive, state-of-the-art architectural and engineering consultancy
                services that empower communities, optimize resources, and deliver sustainable,
                cost-effective structural solutions across Ethiopia.
              </p>
              <ul className="mv-card-bullets">
                <li>
                  <span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>
                  Uncompromising structural safety &amp; quality standards
                </li>
                <li>
                  <span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>
                  Efficient project delivery within time and budget
                </li>
                <li>
                  <span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>
                  Integration of sustainable building practices
                </li>
              </ul>
            </div>

            {/* Vision Card */}
            <div className="mv-card vision-card">
              <div className="mv-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </div>
              <h3 className="mv-card-title">Our Vision</h3>
              <p className="mv-card-text">
                To become Ethiopia's leading Grade-I architectural and engineering consultancy benchmark,
                recognized internationally for transformative spatial designs, structural innovation,
                and urban development excellence.
              </p>
              <ul className="mv-card-bullets">
                <li>
                  <span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>
                  Pioneering modern East African architecture
                </li>
                <li>
                  <span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>
                  Establishing industry standards in engineering consultancy
                </li>
                <li>
                  <span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>
                  Fostering long-term client trust &amp; community impact
                </li>
              </ul>
            </div>

          </div>

          {/* Core Objectives Bar */}
          <div className="mv-objectives-grid">
            <div className="obj-box">
              <div className="obj-num">01</div>
              <div className="obj-content">
                <h4>Precision Design</h4>
                <p>Rigorous structural calculations &amp; 3D BIM integration.</p>
              </div>
            </div>

            <div className="obj-box">
              <div className="obj-num">02</div>
              <div className="obj-content">
                <h4>Sustainable Planning</h4>
                <p>Eco-conscious materials &amp; energy-efficient systems.</p>
              </div>
            </div>

            <div className="obj-box">
              <div className="obj-num">03</div>
              <div className="obj-content">
                <h4>Regulatory Compliance</h4>
                <p>CAT-I certified full alignment with national codes.</p>
              </div>
            </div>

            <div className="obj-box">
              <div className="obj-num">04</div>
              <div className="obj-content">
                <h4>Client Centricity</h4>
                <p>Transparent communication from draft to final execution.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
