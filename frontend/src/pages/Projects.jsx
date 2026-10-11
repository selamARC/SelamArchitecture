import React, { useState, useEffect } from 'react';
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

  const filteredProjects = projects.filter(p => {
    if (filter === 'all') return true;
    return (p.category || '').toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="page-wrapper">
      <section className="portfolio-section">
        <div className="portfolio-container">
          <div className="portfolio-header">
            <span className="section-tag">PROJECT PORTFOLIO</span>
            <h1 className="portfolio-title">Delivered Architecture &amp; Engineering Landmarks</h1>
            <p className="portfolio-subtitle">
              Explore our selected commercial high-rises, boutique resorts, residential villas, and civic institutional complexes across Ethiopia.
            </p>

            {/* Filter Buttons */}
            <div className="filter-group">
              {['all', 'commercial', 'residential', 'public'].map(cat => (
                <button
                  key={cat}
                  className={`filter-btn ${filter === cat ? 'active' : ''}`}
                  onClick={() => setFilter(cat)}
                  type="button"
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Projects Grid */}
          <div className="projects-grid" id="projects-grid">
            {filteredProjects.map((p) => {
              const meta = [p.location, p.year].filter(Boolean).join(' • ');
              const imgSrc = toDirectImageUrl(p.imageurl) || 'assets/front/foq.jpg';

              return (
                <div key={p._id || p.title} className="project-card" data-category={(p.category || 'commercial').toLowerCase()}>
                  <div className="project-img-wrapper">
                    <img
                      src={imgSrc}
                      alt={p.title}
                      className="project-img"
                      loading="lazy"
                      onError={(e) => { e.currentTarget.src = 'assets/front/foq.jpg'; }}
                    />
                    <span className="project-tag">
                      {(p.category || 'commercial').replace(/^\w/, c => c.toUpperCase())}
                    </span>
                  </div>

                  <div className="project-info">
                    {meta && <div className="project-meta">{meta}</div>}
                    <h3 className="project-card-title">{p.title}</h3>
                    <p className="project-card-desc">{p.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
