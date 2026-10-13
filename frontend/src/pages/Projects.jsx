import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE, toDirectImageUrl } from '../utils/api';

const fallbackProjects = [
  { _id: '1', title: "Ultimate Motors – G+6 Office Building", location: "Ethiopia, Hawassa", year: "2013 E.C", category: "commercial", description: "Showroom and office headquarters for a leading automotive dealership.", imageurl: "assets/front/ultimate.jpg" },
  { _id: '2', title: "B+G+6+T Commercial (Mekane Yesus)", location: "Hawassa, Ethiopia", year: "", category: "commercial", description: "A B+G+6+Terrace commercial building for the Ethiopian Evangelical Church Mekane Yesus.", imageurl: "assets/front/g6.jpg" },
  { _id: '3', title: "B+G+10 Commercial", location: "Hawassa, Ethiopia", year: "2015 E.C", category: "commercial", description: "A ten-story commercial high-rise for private clients Ato Tewodros Iran & Biruktawit Goyta.", imageurl: "assets/front/hawasa-g10.jpg" },
  { _id: '4', title: "B+G+M+8 Magelas Hotel & Resort", location: "Ethiopia, Hawassa", year: "2013 E.C", category: "commercial", description: "A full-service hotel and resort with landscaped courtyards and resort-grade amenities.", imageurl: "assets/front/megalis.jpg" },
  { _id: '5', title: "G+2 Residence Building", location: "Ethiopia, Hawassa", year: "", category: "residential", description: "A private two-story family residence with generous outdoor living space.", imageurl: "assets/front/menoria.jpg" },
  { _id: '6', title: "B+G+6 Hotel", location: "Ethiopia, Hawassa", year: "", category: "commercial", description: "A boutique hotel building for Dr. Gezhage Bekele.", imageurl: "assets/front/ngd.jpg" },
  { _id: '7', title: "Zebra Green Hotel Building – G+4 & G+2", location: "Hawassa, Ethiopia", year: "2015 E.C", category: "commercial", description: "A two-block hotel development combining a G+4 tower with a G+2 annex.", imageurl: "assets/projects/commercial-zebragreen.jpg" },
  { _id: '8', title: "B+G+7 Commercial Building", location: "Hawassa, Ethiopia", year: "2014 E.C", category: "commercial", description: "A seven-story mixed commercial building for private client Ato Mekoyet Tsegaye.", imageurl: "assets/projects/commercial-bg7.jpg" },
  { _id: '9', title: "Ethiopian Teachers Association HQ – 2B+G+32", location: "Addis Ababa, Ethiopia", year: "2010 E.C", category: "commercial", description: "Our flagship high-rise: a 32-story mixed-use tower and HQ for the Ethiopian Teachers Association.", imageurl: "assets/projects/commercial-teachers-tower.jpg" },
  { _id: '10', title: "Ethiopian Red Cross Association Building – B+G+6", location: "Jinka, Ethiopia", year: "2012 E.C", category: "public", description: "A mixed-use civic building for the Ethiopian Red Cross Association.", imageurl: "assets/projects/civic-redcross.jpg" },
  { _id: '11', title: "Marsil Youth Center", location: "Sodo, Ethiopia", year: "2013 E.C", category: "public", description: "A landmark youth center master plan with a sculptural gateway arch.", imageurl: "assets/projects/civic-youthcenter.jpg" },
  { _id: '12', title: "Worship Hall & Office – G+1 & G+4", location: "Hawassa, Ethiopia", year: "2012 E.C", category: "public", description: "A worship hall and office building for the Addis Ketema Full Gospel Believers Church.", imageurl: "assets/projects/civic-worshiphall.jpg" },
  { _id: '13', title: "B+G+5 Mixed-Use Building", location: "Hawassa, Ethiopia", year: "", category: "residential", description: "A five-story mixed-use residential and retail building for Ato Hailu Haro.", imageurl: "assets/front/foq.jpg" },
  { _id: '14', title: "G+2+T Residence Building", location: "Hawassa, Ethiopia", year: "2015 E.C", category: "residential", description: "A private villa with rooftop terrace and stone-clad chimney feature.", imageurl: "assets/projects/residential-villa-g2t.jpg" },
  { _id: '15', title: "G+1 Residence Building", location: "Hawassa, Ethiopia", year: "2013 E.C", category: "residential", description: "A compact single-story-plus residence with a bold façade and integrated garage.", imageurl: "assets/projects/residential-g1.jpg" }
];

export default function Projects() {
  const [projects, setProjects] = useState(fallbackProjects);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/projects`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
        }
      })
      .catch(() => {});
  }, []);

  // Filter projects by category and search query
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesCategory = filter === 'all' || (p.category || '').toLowerCase() === filter.toLowerCase();
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const titleMatch = (p.title || '').toLowerCase().includes(query);
      const locMatch = (p.location || '').toLowerCase().includes(query);
      const descMatch = (p.description || '').toLowerCase().includes(query);
      const yearMatch = (p.year || '').toLowerCase().includes(query);

      return titleMatch || locMatch || descMatch || yearMatch;
    });
  }, [projects, filter, searchQuery]);

  // Dynamic counts for each category
  const categoryCounts = useMemo(() => {
    const counts = { all: projects.length, commercial: 0, residential: 0, public: 0 };
    projects.forEach(p => {
      const cat = (p.category || '').toLowerCase();
      if (counts[cat] !== undefined) counts[cat]++;
    });
    return counts;
  }, [projects]);

  // Modal navigation handlers
  const handlePrevProject = useCallback(() => {
    setSelectedProjectIndex(curr => (curr === null || curr === 0 ? filteredProjects.length - 1 : curr - 1));
  }, [filteredProjects.length]);

  const handleNextProject = useCallback(() => {
    setSelectedProjectIndex(curr => (curr === null || curr === filteredProjects.length - 1 ? 0 : curr + 1));
  }, [filteredProjects.length]);

  const closeModal = useCallback(() => {
    setSelectedProjectIndex(null);
  }, []);

  // Keyboard navigation for the modal
  useEffect(() => {
    if (selectedProjectIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') handlePrevProject();
      if (e.key === 'ArrowRight') handleNextProject();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProjectIndex, closeModal, handlePrevProject, handleNextProject]);

  const activeProject = selectedProjectIndex !== null ? filteredProjects[selectedProjectIndex] : null;

  return (
    <div className="page-wrapper">
      <section className="projects-section" id="projects-section">
        <div className="projects-container">

          {/* Section Header */}
          <div className="projects-header">
            <span className="section-tag">PORTFOLIO &amp; WORKS</span>
            <h1 className="projects-title">Delivered Architecture &amp; Engineering Landmarks</h1>
            <p className="projects-subtitle">
              Explore our portfolio of commercial high-rises, boutique hospitality resorts, private residences, and civic complexes built across Ethiopia.
            </p>

            {/* Live Search Input */}
            <div className="projects-search-wrapper">
              <svg className="projects-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                className="projects-search-input"
                placeholder="Search by project name, city (e.g. Hawassa, Addis), or year..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="projects-search-clear"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                  aria-label="Clear search"
                >
                  &times;
                </button>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="project-filters">
              {[
                { id: 'all', label: 'ALL' },
                { id: 'commercial', label: 'COMMERCIAL' },
                { id: 'residential', label: 'RESIDENTIAL' },
                { id: 'public', label: 'CIVIC & PUBLIC' }
              ].map(cat => (
                <button
                  key={cat.id}
                  className={`filter-btn ${filter === cat.id ? 'active' : ''}`}
                  onClick={() => setFilter(cat.id)}
                  type="button"
                >
                  {cat.label}
                  <span className="filter-btn-count">{categoryCounts[cat.id] || 0}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Projects Grid */}
          <div className="projects-grid" id="projects-grid">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((p, idx) => {
                const meta = [p.location, p.year].filter(Boolean).join(' • ');
                const imgSrc = toDirectImageUrl(p.imageurl) || '/assets/front/foq.jpg';

                return (
                  <div
                    key={p._id || p.title || idx}
                    className="project-card"
                    data-category={(p.category || 'commercial').toLowerCase()}
                    onClick={() => setSelectedProjectIndex(idx)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') setSelectedProjectIndex(idx); }}
                    aria-label={`View details for ${p.title}`}
                  >
                    <div className="project-img-wrapper">
                      <img
                        src={imgSrc}
                        alt={p.title}
                        className="project-img"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = '/assets/front/foq.jpg'; }}
                      />
                      <span className="project-tag">
                        {(p.category || 'commercial').replace(/^\w/, c => c.toUpperCase())}
                      </span>
                      <div className="project-img-overlay">
                        <span className="project-view-badge">
                          <span>View Project</span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                          </svg>
                        </span>
                      </div>
                    </div>

                    <div className="project-info">
                      {meta && <div className="project-meta">{meta}</div>}
                      <h3 className="project-card-title">{p.title}</h3>
                      <p className="project-card-desc">{p.description}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="project-empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1rem' }}>
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <h3>No Matching Projects Found</h3>
                <p>No projects match your filter "{searchQuery || filter}".</p>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ marginTop: '1rem', cursor: 'pointer' }}
                  onClick={() => { setFilter('all'); setSearchQuery(''); }}
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>

          {/* Bottom Call-to-Action Banner */}
          <div className="projects-cta-box">
            <h2 className="projects-cta-title">Have a Project in Mind? Let's Shape Your Landmark.</h2>
            <p className="projects-cta-desc">
              Whether commercial towers, boutique hotels, or civic infrastructure, our Category-1 architectural and structural engineering team is ready to assist.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/contact" className="btn-primary">
                Request a Consultation &rarr;
              </Link>
              <Link to="/services" className="btn-secondary">
                Explore Engineering Services
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Detail Modal / Lightbox */}
      {activeProject && (
        <div
          className="project-modal-overlay"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-project-title"
        >
          <div
            className="project-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              className="project-modal-close"
              onClick={closeModal}
              aria-label="Close modal"
              title="Close (Esc)"
            >
              &times;
            </button>

            {/* Modal Hero Image */}
            <div className="project-modal-hero">
              <img
                src={toDirectImageUrl(activeProject.imageurl) || '/assets/front/foq.jpg'}
                alt={activeProject.title}
                onError={(e) => { e.currentTarget.src = '/assets/front/foq.jpg'; }}
              />

              {/* Navigation arrows if multiple items exist */}
              {filteredProjects.length > 1 && (
                <>
                  <button
                    type="button"
                    className="project-modal-nav-btn project-modal-prev"
                    onClick={handlePrevProject}
                    aria-label="Previous project"
                    title="Previous (Left Arrow)"
                  >
                    &#8592;
                  </button>
                  <button
                    type="button"
                    className="project-modal-nav-btn project-modal-next"
                    onClick={handleNextProject}
                    aria-label="Next project"
                    title="Next (Right Arrow)"
                  >
                    &#8594;
                  </button>
                </>
              )}
            </div>

            {/* Modal Body */}
            <div className="project-modal-body">
              <div className="project-modal-tag-row">
                <span className="project-tag" style={{ position: 'static' }}>
                  {(activeProject.category || 'commercial').toUpperCase()}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Project {selectedProjectIndex + 1} of {filteredProjects.length}
                </span>
              </div>

              <h2 id="modal-project-title" className="project-modal-title">
                {activeProject.title}
              </h2>

              {/* Project Specifications Grid */}
              <div className="project-modal-specs">
                <div className="project-spec-item">
                  <strong>Location</strong>
                  <span>{activeProject.location || 'Ethiopia'}</span>
                </div>
                <div className="project-spec-item">
                  <strong>Completion Year</strong>
                  <span>{activeProject.year || 'Completed'}</span>
                </div>
                <div className="project-spec-item">
                  <strong>Consultancy Scope</strong>
                  <span>Architectural &amp; Structural</span>
                </div>
                <div className="project-spec-item">
                  <strong>Status</strong>
                  <span>Delivered / Category-I</span>
                </div>
              </div>

              <p className="project-modal-desc">
                {activeProject.description || 'Full architectural design, structural engineering analysis, and site supervision delivered in accordance with Ethiopian Building Codes.'}
              </p>

              {/* Modal Actions */}
              <div className="project-modal-actions">
                <Link
                  to={`/contact?service=${encodeURIComponent(activeProject.category || 'commercial')}`}
                  className="btn-primary"
                  onClick={closeModal}
                >
                  Consult On Similar Project &rarr;
                </Link>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeModal}
                >
                  Back to Portfolio
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
