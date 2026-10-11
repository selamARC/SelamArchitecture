import React from 'react';
import { Link } from 'react-router-dom';

export default function Services() {
  return (
    <div className="page-wrapper">
      <section className="services-section" id="services">
        <div className="services-container">
          
          {/* Section Header */}
          <div className="services-header">
            <span className="section-tag">OUR EXPERTISE &amp; DISCIPLINES</span>
            <h1 className="services-title" style={{ fontSize: '2.4rem', lineHeight: '1.2', margin: '14px 0 18px' }}>
              Comprehensive Architectural &amp; Engineering Solutions
            </h1>
            <p className="services-subtitle">
              Delivering end-to-end design, engineering precision, and site oversight for high-rise commercial, residential, and public infrastructure projects.
            </p>
          </div>

          {/* Services Grid */}
          <div className="services-grid">
            
            {/* Service Card 1 */}
            <div className="service-card">
              <div className="service-icon">
                <svg viewBox="0 0 48 48" fill="none">
                  <rect x="6" y="8" width="36" height="32" rx="3" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="2"></rect>
                  <path d="M12 16h20M12 22h14M12 28h17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></path>
                  <path d="M28 36l8-8 3 3-8 8h-3v-3z" fill="currentColor"></path>
                </svg>
              </div>
              <span className="service-badge">Grade-I Standard</span>
              <h3 className="service-card-title">Architectural Design</h3>
              <p className="service-card-desc">
                Our Comprehensive Building Design Study, from conceptual design through to detailed architectural &amp; engineering drawings.
              </p>
              <ul className="service-features">
                <li>Conceptual &amp; Preliminary Design</li>
                <li>Detail Architectural Design (DED)</li>
                <li>3D Renders &amp; Photorealistic Visualization</li>
              </ul>
            </div>

            {/* Service Card 2 */}
            <div className="service-card">
              <div className="service-icon">
                <svg viewBox="0 0 48 48" fill="none">
                  <rect x="10" y="16" width="28" height="24" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="2"></rect>
                  <path d="M10 16 24 6 38 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"></path>
                  <path d="M10 24h28M10 32h28M18 16v24M30 16v24" stroke="currentColor" strokeWidth="1.6"></path>
                </svg>
              </div>
              <span className="service-badge">Structural Rigor</span>
              <h3 className="service-card-title">Structural Engineering</h3>
              <p className="service-card-desc">
                Advanced structural analysis and load calculation ensuring long-term resilience, safety, and code compliance.
              </p>
              <ul className="service-features">
                <li>High-Rise Reinforced Concrete &amp; Steel Structures</li>
                <li>Seismic &amp; Wind Resistance Analysis</li>
                <li>Foundation &amp; Substructure Engineering</li>
              </ul>
            </div>

            {/* Service Card 3 */}
            <div className="service-card">
              <div className="service-icon">
                <svg viewBox="0 0 48 48" fill="none">
                  <rect x="8" y="10" width="32" height="24" rx="2" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="2"></rect>
                  <path d="M8 26l9-8 7 6 8-9 8 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"></path>
                  <rect x="14" y="36" width="20" height="3" rx="1.5" fill="currentColor"></rect>
                </svg>
              </div>
              <span className="service-badge">Spatial Design</span>
              <h3 className="service-card-title">Interior Design Study</h3>
              <p className="service-card-desc">
                Complete interior design studies that shape the finished feel of every space, from material palette to furnishing layout.
              </p>
              <ul className="service-features">
                <li>Interior Design Study</li>
                <li>Material &amp; Finish Selection</li>
                <li>Furnishing &amp; Space Layout</li>
              </ul>
            </div>

            {/* Service Card 3b */}
            <div className="service-card">
              <div className="service-icon">
                <svg viewBox="0 0 48 48" fill="none">
                  <path d="M24 40V21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"></path>
                  <path d="M24 21c-6.5 0-11-4.5-11-11 6.5 0 11 4.5 11 11z" fill="currentColor" opacity="0.85"></path>
                  <path d="M24 25c6.5 0 11-4.5 11-11-6.5 0-11 4.5-11 11z" fill="currentColor" opacity="0.5"></path>
                  <rect x="13" y="40" width="22" height="3" rx="1.5" fill="currentColor"></rect>
                </svg>
              </div>
              <span className="service-badge">Landscape</span>
              <h3 className="service-card-title">Landscape Design Study</h3>
              <p className="service-card-desc">
                Landscape design studies covering the site's own architectural, structural, electrical and sanitary-mechanical components.
              </p>
              <ul className="service-features">
                <li>Landscape Design Study</li>
                <li>Site Structures &amp; Electrical/Sanitary Works</li>
                <li>Preparation of Bills of Quantity</li>
              </ul>
            </div>

            {/* Service Card 4 */}
            <div className="service-card">
              <div className="service-icon">
                <svg viewBox="0 0 48 48" fill="none">
                  <path d="M24 6c-7.7 0-14 6.3-14 14h28c0-7.7-6.3-14-14-14z" fill="currentColor" opacity="0.85"></path>
                  <rect x="7" y="20" width="34" height="4.5" rx="2.2" fill="currentColor"></rect>
                  <rect x="14" y="28.5" width="20" height="11" rx="2" fill="currentColor" opacity="0.14" stroke="currentColor" strokeWidth="2"></rect>
                  <path d="M19 34h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></path>
                </svg>
              </div>
              <span className="service-badge">Quality Control</span>
              <h3 className="service-card-title">Construction Supervision &amp; Contract Administration</h3>
              <p className="service-card-desc">
                Rigorous on-site engineering supervision guaranteeing strict adherence to construction drawings and budget.
              </p>
              <ul className="service-features">
                <li>Quality Assurance &amp; Material Testing</li>
                <li>Contract Administration &amp; Permit Compliance</li>
                <li>Preparation of Bills of Quantity (BOQ)</li>
              </ul>
            </div>

            {/* Service Card 5 */}
            <div className="service-card">
              <div className="service-icon">
                <svg viewBox="0 0 48 48" fill="none">
                  <path d="M26 6 14 26h8l-4 16 16-22h-9l5-14z" fill="currentColor" opacity="0.9"></path>
                  <circle cx="35" cy="35" r="7" fill="none" stroke="currentColor" strokeWidth="2"></circle>
                  <path d="M35 31v8M31 35h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></path>
                </svg>
              </div>
              <span className="service-badge">Systems Integration</span>
              <h3 className="service-card-title">MEP Engineering</h3>
              <p className="service-card-desc">
                Integrated Mechanical, Electrical, and Plumbing engineering design for operational building performance.
              </p>
              <ul className="service-features">
                <li>HVAC &amp; Ventilation Layouts</li>
                <li>Electrical Distribution &amp; Backup Systems</li>
                <li>Plumbing, Sanitation &amp; Fire Protection</li>
              </ul>
            </div>

            {/* Service Card 6 */}
            <div className="service-card">
              <div className="service-icon">
                <svg viewBox="0 0 48 48" fill="none">
                  <rect x="7" y="26" width="7" height="14" fill="currentColor" opacity="0.5"></rect>
                  <rect x="17" y="19" width="7" height="21" fill="currentColor" opacity="0.7"></rect>
                  <rect x="27" y="12" width="7" height="28" fill="currentColor" opacity="0.9"></rect>
                  <circle cx="34" cy="16" r="7" fill="none" stroke="currentColor" strokeWidth="2.2"></circle>
                  <path d="M39 21l5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"></path>
                </svg>
              </div>
              <span className="service-badge">Strategic Analysis</span>
              <h3 className="service-card-title">Feasibility &amp; Valuation</h3>
              <p className="service-card-desc">
                Comprehensive pre-construction technical assessment, budget forecasting, and property appraisals.
              </p>
              <ul className="service-features">
                <li>Technical &amp; Financial Feasibility Reports</li>
                <li>Environmental Impact Assessments (EIA)</li>
                <li>Asset Valuation &amp; Renovation Audits</li>
              </ul>
            </div>

          </div>

          {/* CTA Banner */}
          <div style={{ textAlign: 'center', marginTop: '60px', padding: '40px', background: 'rgba(212, 175, 55, 0.05)', borderRadius: '16px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
            <h2 style={{ fontSize: '1.6rem', marginBottom: '12px' }}>Need a formal quotation for your upcoming project?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '600px', margin: '0 auto 24px' }}>
              Our multi-disciplinary team is ready to evaluate your brief, site parameters, and deliver an itemized consultancy proposal.
            </p>
            <Link to="/contact" className="btn-primary">Request a Formal Quote &rarr;</Link>
          </div>

        </div>
      </section>
    </div>
  );
}
