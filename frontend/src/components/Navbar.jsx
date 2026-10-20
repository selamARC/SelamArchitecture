import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { getCalendarStrings } from '../utils/calendar';

export default function Navbar() {
  const [theme, setTheme] = useState('dark');
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDates, setCalendarDates] = useState({ gcString: '', ecString: '' });
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile navigation on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    setCalendarDates(getCalendarStrings());
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    setTheme(current);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    if (next === 'light') {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
    }
  };

  const closeMenu = () => setMobileOpen(false);

  return (
    <>
      <nav className="navbar">
        {/* Far Left: Logo & Company Name */}
        <Link to="/" className="logo-container" onClick={closeMenu} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="logo-icon-wrapper">
            <img
              src={theme === 'light' ? '/assets/logos/light.png' : '/assets/logos/logo.png'}
              alt="Selam Logo"
              className="nav-logo"
              id="logo-img"
              onError={(e) => { e.currentTarget.src = '/logo.png'; }}
            />
          </div>
          <div className="logo-text">
            <span className="brand-title">SELAM CONSULTING</span>
            <span className="brand-sub">ARCHITECTS &amp; ENGINEERS PLC</span>
          </div>
        </Link>

        {/* Center: Navigation Links (Desktop + Mobile Dropdown/Drawer) */}
        <div className={`nav-links ${mobileOpen ? 'mobile-open' : ''}`}>
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMenu}>HOME</NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMenu}>ABOUT</NavLink>
          <NavLink to="/services" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMenu}>SERVICES</NavLink>
          <NavLink to="/projects" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMenu}>PROJECTS</NavLink>
          <NavLink to="/team" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMenu}>TEAM</NavLink>
          <NavLink to="/contact" className="btn-contact" onClick={closeMenu}>CONTACT</NavLink>
        </div>

        {/* Far Right: Booking Calendar Icon & Theme Switcher & Mobile Hamburger */}
        <div className="nav-utilities">
          {/* Booking Icon Wrapper (Hover / Click Popover) */}
          <div
            className="calendar-wrapper"
            id="booking-wrapper"
            onMouseEnter={() => setShowCalendar(true)}
            onMouseLeave={() => setShowCalendar(false)}
          >
            <button
              id="calendar-toggle"
              className="util-btn"
              aria-label="Toggle Booking Info"
              type="button"
              onClick={() => setShowCalendar(prev => !prev)}
            >
              <svg className="util-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
                <circle cx="12" cy="15" r="2"></circle>
              </svg>
            </button>

            {/* Hover/Click Popover */}
            <div id="calendar-popover" className={`calendar-popover ${showCalendar ? 'show' : ''}`}>
              <div className="popover-title">DATE &amp; SCHEDULE</div>
              <div id="date-display" className="popover-dates">
                GC: <strong>{calendarDates.gcString}</strong><br />
                EC: <span>{calendarDates.ecString}</span>
              </div>
            </div>
          </div>

          {/* Theme Switcher (Moon / Sun) */}
          <button id="theme-toggle" className="util-btn" aria-label="Toggle Theme" onClick={toggleTheme} type="button">
            {theme === 'dark' ? (
              <svg id="icon-moon" className="util-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            ) : (
              <svg id="icon-sun" className="util-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            )}
          </button>

          {/* Mobile Hamburger Toggle Button */}
          <button
            id="nav-hamburger"
            className="util-btn nav-hamburger-btn"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileOpen}
            type="button"
            onClick={() => setMobileOpen(prev => !prev)}
          >
            <svg className="util-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              {mobileOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Backdrop overlay for mobile menu */}
      {mobileOpen && (
        <div className="nav-mobile-backdrop" onClick={closeMenu} aria-hidden="true" />
      )}
    </>
  );
}
