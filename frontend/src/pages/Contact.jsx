import React, { useState } from 'react';
import { API_BASE } from '../utils/api';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ state: 'pending', message: 'Sending message...' });

    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok && data.result === 'success') {
        setStatus({
          state: 'success',
          message: 'Thank you! Your project inquiry has been received. Our senior engineering team will review your requirements and get in touch within 24 hours.'
        });
        setFormData({ name: '', email: '', phone: '', service: '', message: '' });
      } else {
        throw new Error(data.message || data.error || 'Something went wrong.');
      }
    } catch (err) {
      setStatus({
        state: 'error',
        message: "We couldn't submit your inquiry online right now. Please call our team directly at +251 91 606 7138 or email selamconsultantplc12@gmail.com."
      });
    }
  };

  return (
    <div className="page-wrapper">
      <section className="contact-section" id="contact">
        <div className="contact-container">
          <div className="contact-grid">

            {/* Left: Contact Details */}
            <div className="contact-info">
              <span className="section-tag">GET IN TOUCH</span>
              <h1 className="contact-title" style={{ fontSize: '2rem', lineHeight: '1.2', margin: '14px 0 20px' }}>
                Start Your Engineering Partnership Today
              </h1>
              <p className="contact-desc">
                Have an upcoming architectural design, structural assessment, or master planning requirement? Reach out to our consulting team.
              </p>

              <div className="contact-details">
                <div className="contact-item">
                  <div className="c-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <div>
                    <strong>Head Office</strong>
                    <p>Addis Ababa, Ethiopia (Branch office: Hawassa)</p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="c-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z"></path>
                    </svg>
                  </div>
                  <div>
                    <strong>Direct Call</strong>
                    <p>+251 91 606 7138 / +251 96 104 7689</p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="c-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                      <path d="m22 6-10 7L2 6"></path>
                    </svg>
                  </div>
                  <div>
                    <strong>Email Enquiries</strong>
                    <p>selamconsultantplc12@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Inquiry Form */}
            <div className="contact-form-wrapper">
              <form className="contact-form" id="contact-form" onSubmit={handleSubmit}>
                <h2 className="form-title" style={{ fontSize: '1.4rem' }}>Request a Consultation</h2>

                <div className="form-group">
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Full Name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email Address"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Your Phone Number (optional)"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <select name="service" required value={formData.service} onChange={handleChange}>
                    <option value="" disabled>Select Service Required</option>
                    <option value="architectural">Architectural Design</option>
                    <option value="structural">Structural Engineering</option>
                    <option value="interior">Interior Design Study</option>
                    <option value="landscape">Landscape Design Study</option>
                    <option value="supervision">Construction Supervision &amp; Contract Administration</option>
                    <option value="mep">MEP Engineering</option>
                    <option value="feasibility">Feasibility &amp; Valuation</option>
                  </select>
                </div>

                <div className="form-group">
                  <textarea
                    rows="4"
                    name="message"
                    placeholder="Briefly describe your project details..."
                    required
                    value={formData.message}
                    onChange={handleChange}
                  ></textarea>
                </div>

                {status.state !== 'idle' && (
                  <p className={`form-status form-status-${status.state}`}>
                    {status.message}
                  </p>
                )}

                <button
                  type="submit"
                  className="btn-primary form-submit"
                  disabled={status.state === 'pending'}
                >
                  {status.state === 'pending' ? 'Sending...' : 'Send Message →'}
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
