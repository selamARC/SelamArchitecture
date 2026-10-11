import React, { useState, useEffect } from 'react';
import { API_BASE, toDirectImageUrl, getInitials } from '../utils/api';

const fallbackTeam = [
  { _id: '1', name: "Alemu Tamiru", position: "Team Leader", department: "Architecture", profession: "Practicing Architect", yearsexperience: "18 years" },
  { _id: '2', name: "Zekariyas Tesfaye", position: "Architect", department: "Architecture", profession: "Practicing Architect", yearsexperience: "5 years" },
  { _id: '3', name: "Yosef Fatahun", position: "Architect", department: "Architecture", profession: "Practicing Architect", yearsexperience: "5 years" },
  { _id: '4', name: "Biruk Girma", position: "Architect", department: "Architecture", profession: "Practicing Architect", yearsexperience: "4 years" },
  { _id: '5', name: "Efrem Eyasu", position: "Architect", department: "Architecture", profession: "Graduate Architect", yearsexperience: "2 years" },
  { _id: '6', name: "Melekamsew Teshome", position: "Architect", department: "Architecture", profession: "Graduate Architect", yearsexperience: "3 years" },
  { _id: '7', name: "Ali Hussen", position: "Head, Structural Engineering", department: "Structural Engineering", profession: "Professional Structural Engineer", yearsexperience: "7 years" },
  { _id: '8', name: "Mihiretu Tefera", position: "Lead Structural Engineer", department: "Structural Engineering", profession: "Professional Structural Engineer", yearsexperience: "5 years" },
  { _id: '9', name: "Eden Birara", position: "Structural Engineer", department: "Structural Engineering", profession: "Graduate Engineer", yearsexperience: "2 years" },
  { _id: '10', name: "Eskedar Masresha", position: "Head, Electrical Engineering", department: "Electrical Engineering", profession: "Professional Electrical Engineer", yearsexperience: "10 years" },
  { _id: '11', name: "Soloma Ashenafi", position: "Electrical Engineer", department: "Electrical Engineering", profession: "Professional Electrical Engineer", yearsexperience: "8 years" },
  { _id: '12', name: "Lema Teferi", position: "Head, Sanitary Engineering", department: "Sanitary & Geotechnical", profession: "Professional Sanitary Engineer", yearsexperience: "10 years" },
  { _id: '13', name: "Danial Haylemariam", position: "Soil Investigation", department: "Sanitary & Geotechnical", profession: "Professional Geotechnical Engineer", yearsexperience: "10 years" },
  { _id: '14', name: "Abel Alemu", position: "Quantity Surveyor", department: "Contract Administration & CAD", profession: "Construction Technology Management", yearsexperience: "3 years" },
  { _id: '15', name: "Esrael Mulugeta", position: "AutoCAD Technician", department: "Contract Administration & CAD", profession: "Construction Technology Management", yearsexperience: "2 years" }
];

export default function Team() {
  const [team, setTeam] = useState(fallbackTeam);

  useEffect(() => {
    fetch(`${API_BASE}/api/team`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setTeam(data);
        }
      })
      .catch(() => {});
  }, []);

  // Group by department preserving order
  const departments = [];
  team.forEach(m => {
    const dept = m.department || 'Team';
    let group = departments.find(d => d.name === dept);
    if (!group) {
      group = { name: dept, members: [] };
      departments.push(group);
    }
    group.members.push(m);
  });

  return (
    <div className="page-wrapper">
      <section className="team-section" id="team">
        <div className="team-container">

          <div className="team-header">
            <span className="section-tag">EXPERT LEADERSHIP</span>
            <h1 className="team-title">Engineers &amp; Architects Behind Our Projects</h1>
            <p className="team-subtitle">
              A multidisciplinary team of Category-I licensed consultants, structural analysts, and senior architects dedicated to engineering excellence.
            </p>
          </div>

          {/* CEO Spotlight Card (Permanent) */}
          <div className="ceo-spotlight">
            <div className="ceo-photo-wrap">
              <img
                src="/assets/team/ceo.jpg"
                alt="Ato Beniyam Alemayehu Beyene - General Manager"
                className="ceo-photo"
                onError={(e) => { e.currentTarget.src = '/assets/logos/logo.png'; }}
              />
            </div>
            <div className="ceo-info">
              <span className="team-role">Founder &amp; General Manager</span>
              <h2 className="ceo-name" style={{ fontSize: '1.6rem', margin: '8px 0 14px' }}>Ato Beniyam Alemayehu Beyene</h2>
              <p className="ceo-bio">
                Founder and General Manager of Selam Consulting Architects &amp; Engineers PLC, leading the firm's
                CAT-I registered practice since its establishment in 2017. He oversees architectural direction,
                structural sign-off, and client relationships across every project the firm delivers &mdash; from
                mixed-use commercial towers to residential villas across Hawassa and Addis Ababa.
              </p>
            </div>
          </div>

          {/* Dynamic Team Grid Grouped by Department */}
          <div id="team-dynamic-content">
            {departments.map((dept) => (
              <div key={dept.name}>
                <h3 className="team-dept-heading">{dept.name}</h3>
                <div className="team-grid">
                  {dept.members.map((m) => {
                    const initials = getInitials(m.name);
                    const photoUrl = toDirectImageUrl(m.photo);

                    return (
                      <div key={m._id || m.name} className="team-card">
                        <div className="team-avatar">
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt={m.name}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <span
                            className="avatar-initials"
                            style={{ display: photoUrl ? 'none' : 'flex' }}
                          >
                            {initials}
                          </span>
                        </div>
                        <h3 className="team-name">{m.name}</h3>
                        <span className="team-role">{m.position || ''}</span>
                        <p className="team-bio">
                          {m.profession || ''}
                          {m.yearsexperience ? ` — ${m.yearsexperience} of professional experience.` : ''}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </div>
  );
}
