import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';

import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Projects from './pages/Projects';
import Team from './pages/Team';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import SuperAdmin from './pages/SuperAdmin';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/admin') || location.pathname.startsWith('/super-admin') || location.pathname.startsWith('/superadmin');

  return (
    <>
      <ScrollToTop />
      {!isDashboard && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/index.html" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/about.html" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services.html" element={<Services />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects.html" element={<Projects />} />
        <Route path="/team" element={<Team />} />
        <Route path="/team.html" element={<Team />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/contact.html" element={<Contact />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin.html" element={<Admin />} />
        <Route path="/super-admin" element={<SuperAdmin />} />
        <Route path="/super-admin.html" element={<SuperAdmin />} />
        <Route path="/superadmin" element={<SuperAdmin />} />
        <Route path="/superadmin.html" element={<SuperAdmin />} />
      </Routes>

      {!isDashboard && <Footer />}
      {!isDashboard && <Chatbot />}
    </>
  );
}
