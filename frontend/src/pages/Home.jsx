import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE, toDirectImageUrl } from '../utils/api';

const defaultProjects = [
  {
    title: "B+G+5 Mixed Used",
    location: "Ethiopia, Hawassa",
    img: "/assets/front/foq.jpg"
  },
  {
    title: "B+G+6+T Commercial",
    location: "Hawassa, Ethiopia",
    img: "/assets/front/g6.jpg"
  },
  {
    title: "B+G+10 Commercial",
    location: "Hawassa, Ethiopia",
    img: "/assets/front/hawasa-g10.jpg"
  },
  {
    title: "B+G+M+8 Magelas Hotel & Resort",
    location: "Ethiopia, Hawassa",
    img: "/assets/front/megalis.jpg"
  },
  {
    title: "G+2 Residence Building",
    location: "Ethiopia, Hawassa",
    img: "/assets/front/menoria.jpg"
  },
  {
    title: "B+G+6 Hotel",
    location: "Ethiopia, Hawassa",
    img: "/assets/front/ngd.jpg"
  },
  {
    title: "Ultimate Motors - G+6 Office Building",
    location: "Ethiopia, Hawassa",
    img: "/assets/front/ultimate.jpg"
  }
];

const defaultJobs = [
  {
    _id: "default-job-1",
    title: "Junior Architect",
    department: "Architecture",
    location: "Hawassa, Ethiopia",
    type: "Full-time",
    description: "We're looking for a junior architect with 1-3 years of experience in residential and commercial design to join our Hawassa studio.",
    deadline: "31-Dec-2026"
  },
  {
    _id: "default-job-2",
    title: "Structural Engineer",
    department: "Structural Engineering",
    location: "Hawassa, Ethiopia",
    type: "Full-time",
    description: "Experienced structural engineer needed for high-rise and mixed-use project design and site supervision.",
    deadline: "31-Dec-2026"
  },
  {
    _id: "default-job-3",
    title: "Senior Architect & Project Lead",
    department: "Architecture & Urban Planning",
    location: "Hawassa / Addis Ababa, Ethiopia",
    type: "Full-time",
    description: "We are seeking an experienced Senior Architect to lead major commercial and mixed-use projects from conceptual design through construction supervision. The candidate will collaborate with multidisciplinary engineering teams, coordinate with clients, and champion architectural excellence.",
    deadline: "31-Dec-2026"
  }
];

export default function Home() {
  const [projectsList, setProjectsList] = useState(defaultProjects);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLitUp, setIsLitUp] = useState(false);
  const [imgOpacity, setImgOpacity] = useState(1);
  const [jobs, setJobs] = useState(defaultJobs);

  useEffect(() => {
    // Fetch featured projects from MongoDB backend
    fetch(`${API_BASE}/api/projects`)
      .then(res => res.json())
      .then(rows => {
        if (Array.isArray(rows)) {
          const featured = rows.filter(r => String(r.featured).toLowerCase() === 'yes');
          if (featured.length > 0) {
            setProjectsList(featured.map(r => ({
              title: r.title || '',
              location: r.location || '',
              img: toDirectImageUrl(r.imageurl) || 'assets/front/foq.jpg'
            })));
          }
        }
      })
      .catch(() => { });

    // Fetch active jobs from MongoDB backend
    fetch(`${API_BASE}/api/jobs`)
      .then(res => res.json())
      .then(rows => {
        if (Array.isArray(rows) && rows.length > 0) {
          setJobs(rows);
        }
      })
      .catch(() => { });
  }, []);

  const handleCardClick = () => {
    setIsLitUp(true);
    setImgOpacity(0.3);

    const nextIndex = (currentIndex + 1) % projectsList.length;

    setTimeout(() => {
      setCurrentIndex(nextIndex);
      setImgOpacity(1);
    }, 200);

    setTimeout(() => {
      setIsLitUp(false);
    }, 1500);
  };

  const currentProject = projectsList[currentIndex] || defaultProjects[0];

  return (
    <>
      {/* SECTION 1: HERO / LANDING SECTION */}
      <section className="hero-section" id="home">
        <div className="hero-container">

          {/* Left Column: Headline & Credentials */}
          <div className="hero-content">
            <h1 className="hero-title">
              Where <span className="highlight-gold">Visionary</span> Engineering Meets <span className="highlight-white">Timeless</span> Architecture
            </h1>

            <p className="hero-description">
              Transforming bold ideas into iconic landmarks. Selam Consulting delivers innovative architectural concepts, structural engineering precision, and master planning across Ethiopia.
            </p>

            <div className="hero-actions">
              <Link to="/projects" className="btn-primary">Explore Projects &rarr;</Link>
              <Link to="/contact" className="btn-secondary">Get In Touch</Link>
            </div>

            {/* Credentials / Stats Bar */}
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-num">2017 G.C.</span>
                <span className="stat-lbl">Established</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-num">30</span>
                <span className="stat-lbl">Professionals</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-num">CAT I</span>
                <span className="stat-lbl">Consultant</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Project Render Card */}
          <div className="hero-visual">
            <div
              className={`render-card ${isLitUp ? 'lit-up' : ''}`}
              id="render-card"
              onClick={handleCardClick}
              style={{ cursor: 'pointer' }}
            >
              <img
                id="hero-render-img"
                src={currentProject.img}
                alt="Architectural Render"
                className="render-img"
                style={{ opacity: imgOpacity, transition: 'opacity 0.2s ease' }}
                onError={(e) => { e.currentTarget.src = '/assets/front/foq.jpg'; }}
              />

              <div className="render-overlay"></div>

              {/* Top Badge Card */}
              <div className="render-top-badge">
                <div className="badge-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="22" x2="21" y2="22"></line>
                    <line x1="6" y1="18" x2="6" y2="11"></line>
                    <line x1="10" y1="18" x2="10" y2="11"></line>
                    <line x1="14" y1="18" x2="14" y2="11"></line>
                    <line x1="18" y1="18" x2="18" y2="11"></line>
                    <polygon points="12 2 21 8 3 8"></polygon>
                  </svg>
                </div>
                <div>
                  <div className="render-badge-title" id="render-category">{currentProject.title}</div>
                  <div className="render-badge-sub" id="render-location">{currentProject.location}</div>
                </div>
              </div>

              {/* Bottom Floating Specs Tag */}
              <div className="render-bottom-tags">
                <span className="tag-pill">Structural Integrity</span>
                <span className="tag-pill">Modern Façade</span>
                <span className="tag-pill">3D Rendering</span>
                <span className="tag-pill">Urban Planning</span>
              </div>

              {/* Click To Light Up Prompt */}
              <div className="render-click-hint">Click to switch project</div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2: OUR PROCESS */}
      <section className="process-section" id="process">
        <div className="process-container">
          <div className="process-header">
            <span className="section-tag">HOW WE WORK</span>
            <h2 className="process-title">From First Sketch to Final Handover</h2>
            <p className="process-subtitle">
              A disciplined four-stage workflow that keeps every project — architectural or structural — on schedule, on code, and on budget.
            </p>
          </div>

          <div className="process-steps">
            <div className="process-step">
              <span className="process-num">01</span>
              <h3 className="process-step-title">Consultation</h3>
              <p className="process-step-desc">We study your site, brief, and budget to define clear project objectives.</p>
            </div>
            <div className="process-step">
              <span className="process-num">02</span>
              <h3 className="process-step-title">Concept &amp; Design</h3>
              <p className="process-step-desc">Architectural concepts and 3D renders are developed and refined with you.</p>
            </div>
            <div className="process-step">
              <span className="process-num">03</span>
              <h3 className="process-step-title">Engineering &amp; Approval</h3>
              <p className="process-step-desc">Structural and MEP drawings are finalized and processed for permits.</p>
            </div>
            <div className="process-step">
              <span className="process-num">04</span>
              <h3 className="process-step-title">Delivery &amp; Supervision</h3>
              <p className="process-step-desc">Our engineers supervise construction on-site through to final handover.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: RECOGNITION & MILESTONES */}
      <section className="recognition-section" id="recognition">
        <div className="recognition-container">
          <div className="recognition-header">
            <span className="section-tag">RECOGNITION &amp; MILESTONES</span>
            <h2 className="recognition-title">Trusted &amp; Recognized in the Industry</h2>
            <p className="recognition-subtitle">
              Milestones and recognitions earned across our years of practice.
            </p>
          </div>

          <div className="recognition-grid recognition-grid-2">
            <div className="award-card">
              <div className="award-img-wrap">
                <a href="/certificates/itec-award.jpg" target="_blank" rel="noopener noreferrer">
                  <img
                    src="/certificates/itec-award.jpg"
                    alt="ITEC Certificate - Sustainable Urban Development"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = '/assets/certificates/itec-award.jpg'; }}
                  />
                </a>
              </div>
              <h3 className="award-name">ITEC Training Certificate</h3>
              <p className="award-issuer">Government of India &middot; EPTRI Hyderabad &middot; 2024</p>
              <p className="award-note">
                Awarded to our General Manager, Ato Beniyam Alemayehu Beyene, for completing the Civilian Training Programme on Sustainable Urban Development.
              </p>
            </div>

            <div className="award-card award-card-quote">
              <div className="quote-mark">&ldquo;</div>
              <p className="award-quote-text">
                We extend our sincere gratitude to Selam Architects &amp; Engineering Consultants for winning the
                competitive design bid and completing an outstanding B+G+4 mixed-use building design for our
                association, to everyone's satisfaction. This certificate is presented in appreciation of their
                professional contribution.
              </p>
              <p className="award-quote-source">&mdash; Certificate of Appreciation, Community Association (Edir), Addis Ababa</p>
              <p className="award-quote-hint">Translated &amp; paraphrased from the original Amharic certificate.</p>
            </div>
          </div>
          <p className="cert-hint">Click the certificate to view full size.</p>
        </div>
      </section>

      {/* SECTION 4: CLOSING CTA BANNER */}
      <section className="home-cta-section">
        <div className="home-cta-container">
          <h2 className="home-cta-title">Have a Site? Let's Design What Belongs On It.</h2>
          <p className="home-cta-subtitle">Talk to our team about your next architectural or engineering project.</p>
          <Link to="/contact" className="btn-primary">Get In Touch &rarr;</Link>
        </div>
      </section>

      {/* SECTION 5: CAREERS SECTION */}
      <section className="careers-section" id="careers">
        <div className="careers-container">
          <div className="careers-header">
            <span className="section-tag">JOIN OUR TEAM</span>
            <h2 className="careers-title">Careers at Selam Consulting</h2>
            <p className="careers-subtitle">Open positions across our architecture and engineering practice.</p>
          </div>

          <div className={`jobs-grid ${jobs.length === 1 ? 'single-job' : ''}`} id="jobs-grid">
            {jobs.length > 0 ? (
              jobs.map(job => (
                <div key={job._id || job.title} className="job-card">
                  <h3 className="job-title">{job.title}</h3>
                  <div className="job-meta">
                    {[job.department, job.location, job.type].filter(Boolean).join(' • ')}
                  </div>
                  <p className="job-desc">{job.description}</p>
                  {job.deadline && <p className="job-deadline">Apply by {job.deadline}</p>}
                  <a
                    className="job-apply-btn"
                    href={`mailto:selamconsultantplc12@gmail.com?subject=Application: ${encodeURIComponent(job.title)}`}
                  >
                    Apply via Email &rarr;
                  </a>
                </div>
              ))
            ) : (
              <p className="jobs-empty-msg">
                We don't have any open positions listed right now, but we're always glad to hear from strong candidates. Send your CV to <a href="mailto:selamconsultantplc12@gmail.com">selamconsultantplc12@gmail.com</a>.
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
