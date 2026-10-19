import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE, toDirectImageUrl, getInitials } from '../utils/api';
import AdminThemeToggle from '../components/AdminThemeToggle';
import '../admin.css';

const STORAGE_KEY = 'selam_admin_token';
const USER_KEY    = 'selam_admin_user';

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [user,  setUser]  = useState(() => { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; } });
  const [theme, setTheme] = useState(() => localStorage.getItem('selam_admin_theme') || 'light');

  useEffect(() => {
    localStorage.setItem('selam_admin_theme', theme);
    document.documentElement.setAttribute('data-admin-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  /* ── Login ─────────────────────────────────────────────── */
  const [loginId, setLoginId]   = useState('');
  const [loginPw, setLoginPw]   = useState('');
  const [showPw,  setShowPw]    = useState(false);
  const [logging, setLogging]   = useState(false);
  const [loginErr, setLoginErr] = useState('');

  /* ── Navigation ─────────────────────────────────────────── */
  const [tab, setTab] = useState('overview');

  /* ── Data ───────────────────────────────────────────────── */
  const [stats,       setStats]       = useState({ counts: {}, recentSubmissions: [] });
  const [submissions, setSubmissions] = useState([]);
  const [projects,    setProjects]    = useState([]);
  const [jobs,        setJobs]        = useState([]);
  const [refreshing,  setRefreshing]  = useState(false);

  /* ── Modals / dialogs ───────────────────────────────────── */
  const [modal,   setModal]   = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast,   setToast]   = useState(null);

  /* ── Project image ──────────────────────────────────────── */
  const [imgMode,     setImgMode]     = useState('link');
  const [imgUrl,      setImgUrl]      = useState('');
  const [imgData,     setImgData]     = useState(null);
  const [imgFileName, setImgFileName] = useState('');
  const [dragging,    setDragging]    = useState(false);

  /* ── Search ─────────────────────────────────────────────── */
  const [search, setSearch] = useState('');

  // ── Helpers ──────────────────────────────────────────────
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const headers = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  });

  const safeJson = async (res) => {
    try { return await res.json(); } catch { return {}; }
  };

  // ── Load data ─────────────────────────────────────────────
  const loadData = () => {
    if (!token) return;
    setRefreshing(true);
    Promise.all([
      fetch(`${API_BASE}/api/stats`,    { headers: headers() }).then(r => safeJson(r)).then(d => d.counts && setStats(d)),
      fetch(`${API_BASE}/api/contact`,  { headers: headers() }).then(r => safeJson(r)).then(d => Array.isArray(d) && setSubmissions(d)),
      fetch(`${API_BASE}/api/projects`)                        .then(r => safeJson(r)).then(d => Array.isArray(d) && setProjects(d)),
      fetch(`${API_BASE}/api/jobs/all`, { headers: headers() }).then(r => safeJson(r)).then(d => Array.isArray(d) && setJobs(d)),
    ]).finally(() => setTimeout(() => setRefreshing(false), 400));
  };

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/auth/me`, { headers: headers() })
      .then(async (res) => {
        if (!res.ok) {
          handleLogout();
          return;
        }
        const d = await safeJson(res);
        if (d?.user) {
          setUser(d.user);
          localStorage.setItem(USER_KEY, JSON.stringify(d.user));
        } else {
          handleLogout();
        }
      })
      .catch(() => {});
    loadData();
  }, [token]);

  // ── Auth ──────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLogging(true); setLoginErr('');
    try {
      const res  = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: loginId, password: loginPw }),
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.error || 'Login failed.');
      localStorage.setItem(STORAGE_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setToken(data.token); setUser(data.user);
      showToast('Welcome back!');
    } catch (err) { setLoginErr(err.message); }
    finally      { setLogging(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(USER_KEY);
    setToken(null); setUser(null);
  };

  // ── Delete helpers ────────────────────────────────────────
  const askDelete = (title, message, onConfirm) =>
    setConfirm({ title, message, onConfirm });

  const delSubmission = (s) => askDelete(
    'Delete Inquiry',
    `Delete the message from "${s.name}"? This cannot be undone.`,
    async () => {
      const res = await fetch(`${API_BASE}/api/contact/${s._id}`, { method: 'DELETE', headers: headers() });
      if (res.ok) { showToast('Inquiry deleted.'); loadData(); }
      else showToast('Could not delete.', 'error');
    }
  );

  const delProject = (p) => askDelete(
    'Delete Project',
    `Delete "${p.title}" from the portfolio? It will be removed from the public site.`,
    async () => {
      const res = await fetch(`${API_BASE}/api/projects/${p._id}`, { method: 'DELETE', headers: headers() });
      if (res.ok) { showToast(`"${p.title}" deleted.`); loadData(); }
      else showToast('Could not delete.', 'error');
    }
  );

  const delJob = (j) => askDelete(
    'Delete Job Posting',
    `Close and delete the posting for "${j.title}"?`,
    async () => {
      const res = await fetch(`${API_BASE}/api/jobs/${j._id}`, { method: 'DELETE', headers: headers() });
      if (res.ok) { showToast(`"${j.title}" removed.`); loadData(); }
      else showToast('Could not delete.', 'error');
    }
  );

  // ── Project image file handler ────────────────────────────
  const handleImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('Please pick an image file.', 'error'); return; }
    if (file.size > 15 * 1024 * 1024)   { showToast('Image must be under 15 MB.', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (e) => { setImgData(e.target.result); setImgFileName(file.name); };
    reader.readAsDataURL(file);
  };

  // ── Add Project ───────────────────────────────────────────
  const handleAddProject = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    if (imgMode === 'upload' && imgData) data.imageurl = imgData;
    else if (imgUrl) data.imageurl = imgUrl;

    try {
      const res = await fetch(`${API_BASE}/api/projects`, { method: 'POST', headers: headers(), body: JSON.stringify(data) });
      if (res.ok) {
        showToast('Project saved!');
        setModal(null); setImgUrl(''); setImgData(null); setImgFileName('');
        loadData();
      } else {
        const err = await safeJson(res);
        showToast(err.error || 'Failed to save project.', 'error');
      }
    } catch { showToast('Network error.', 'error'); }
  };

  // ── Add Job ───────────────────────────────────────────────
  const handleAddJob = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    try {
      const res = await fetch(`${API_BASE}/api/jobs`, { method: 'POST', headers: headers(), body: JSON.stringify(data) });
      if (res.ok) { showToast('Job posting published!'); setModal(null); loadData(); }
      else showToast('Failed to publish job.', 'error');
    } catch { showToast('Network error.', 'error'); }
  };

  // ── Filtered collections ──────────────────────────────────
  const q = search.toLowerCase();
  const filteredSubs = useMemo(() =>
    !q ? submissions : submissions.filter(s =>
      [s.name, s.email, s.service].some(v => v?.toLowerCase().includes(q))
    ), [submissions, q]);

  const filteredProjects = useMemo(() =>
    !q ? projects : projects.filter(p =>
      [p.title, p.category, p.location].some(v => v?.toLowerCase().includes(q))
    ), [projects, q]);

  const filteredJobs = useMemo(() =>
    !q ? jobs : jobs.filter(j =>
      [j.title, j.department, j.location].some(v => v?.toLowerCase().includes(q))
    ), [jobs, q]);

  const catBadge = (cat) => {
    const map = { commercial: 'badge-gold', residential: 'badge-teal', public: 'badge-blue', hospitality: 'badge-grey' };
    return map[cat] || 'badge-grey';
  };

  // ══════════════════════════════════════════════════════════
  // LOGIN SCREEN
  // ══════════════════════════════════════════════════════════
  if (!token) {
    return (
      <div className="login-screen" data-theme={theme}>
        <div className="login-top-bar">
          <AdminThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
        {toast && <ToastBar toast={toast} onClose={() => setToast(null)} />}

        <div className="login-card">
          <div className="login-logo-wrap">
            <img src="/assets/logos/logo.png" alt="Selam" className="login-logo"
              onError={(e) => { e.currentTarget.src = '/logo.png'; }} />
            <div>
              <div className="login-brand">Selam Consulting</div>
              <div className="login-brand-sub">Staff Admin Portal</div>
            </div>
          </div>

          <h1 className="login-title">Sign In</h1>
          <p className="login-subtitle">Architects &amp; Engineers PLC — internal management</p>

          {loginErr && <div className="alert alert-error">{loginErr}</div>}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-field">
              <label>Email or Username</label>
              <div className="input-wrap">
                <span className="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                <input type="text" className="form-input has-prefix" required placeholder="admin@selam.com"
                  value={loginId} onChange={e => setLoginId(e.target.value)} />
              </div>
            </div>

            <div className="form-field">
              <label>Password</label>
              <div className="input-wrap">
                <span className="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input type={showPw ? 'text' : 'password'} className="form-input has-prefix" required placeholder="••••••••"
                  value={loginPw} onChange={e => setLoginPw(e.target.value)} />
                <button type="button" className="input-toggle-btn" onClick={() => setShowPw(!showPw)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {showPw
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></>
                      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                    }
                  </svg>
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={logging}>
              {logging ? 'Signing in…' : 'Sign In to Dashboard'}
            </button>
          </form>

          <Link to="/" className="link-muted">← Return to Selam public website</Link>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // DASHBOARD
  // ══════════════════════════════════════════════════════════
  const tabLabel = { overview: 'Overview', submissions: 'Contact Inquiries', projects: 'Projects Portfolio', jobs: 'Career Openings' };

  return (
    <div className="admin-layout" data-theme={theme}>
      {toast && <ToastBar toast={toast} onClose={() => setToast(null)} />}

      {/* ── SIDEBAR ──────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src="/assets/logos/logo.png" alt="Selam" className="sidebar-logo"
            onError={e => { e.currentTarget.src = '/logo.png'; }} />
          <div className="sidebar-brand-text">
            <div className="sidebar-brand-name">Selam Consulting</div>
            <div className="sidebar-brand-role">Staff Portal</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">Navigation</div>

          {[
            { key: 'overview',     label: 'Overview',           icon: <><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></>, count: null },
            { key: 'submissions', label: 'Contact Inquiries',   icon: <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></>,               count: submissions.length },
            { key: 'projects',    label: 'Projects Portfolio',  icon: <><path d="M2 20h20"/><path d="M5 20V8.2c0-.7.6-1.2 1.3-1.2h11.4c.7 0 1.3.5 1.3 1.2V20"/></>,                            count: projects.length },
            { key: 'jobs',        label: 'Career Openings',     icon: <><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>,            count: jobs.length },
          ].map(({ key, label, icon, count }) => (
            <button key={key} type="button"
              className={`nav-btn ${tab === key ? 'active' : ''}`}
              onClick={() => { setTab(key); setSearch(''); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{icon}</svg>
              <span>{label}</span>
              {count !== null && <span className="nav-count">{count}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{getInitials(user?.username || user?.email)}</div>
            <div className="user-info">
              <div className="user-email">{user?.email}</div>
              <div className="user-role-tag">Administrator</div>
            </div>
          </div>
          <Link to="/" className="sidebar-action-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/>
            </svg>
            View Live Website
          </Link>
          <button type="button" className="sidebar-action-btn logout" onClick={handleLogout}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/>
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN ─────────────────────────────────────────── */}
      <main className="admin-main">
        <header className="topbar">
          <span className="topbar-title">{tabLabel[tab]}</span>
          <div className="topbar-right">
            <span className="status-dot"><span className="dot" />Connected</span>
            <AdminThemeToggle theme={theme} toggleTheme={toggleTheme} />
            <button className="btn-secondary" onClick={loadData} disabled={refreshing}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ transition: 'transform .6s', transform: refreshing ? 'rotate(360deg)' : 'none' }}>
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </header>

        <div className="content-area">

          {/* ── OVERVIEW ──────────────────────────────────── */}
          {tab === 'overview' && (
            <>
              <div className="stats-grid">
                {[
                  { key: 'submissions', label: 'Contact Inquiries',  val: stats.counts?.submissions || 0, color: 'blue', go: 'submissions', icon: <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></> },
                  { key: 'projects',    label: 'Portfolio Projects',  val: stats.counts?.projects    || 0, color: 'gold', go: 'projects',    icon: <><path d="M2 20h20"/><path d="M5 20V8.2c0-.7.6-1.2 1.3-1.2h11.4c.7 0 1.3.5 1.3 1.2V20"/></> },
                  { key: 'jobs',        label: 'Active Job Openings', val: stats.counts?.jobs        || 0, color: 'teal', go: 'jobs',        icon: <><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></> },
                  { key: 'team',        label: 'Team Members',        val: stats.counts?.team        || 0, color: 'grey', go: null,          icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></> },
                ].map(({ key, label, val, color, go, icon }) => (
                  <div key={key} className={`stat-card ${tab === go ? 'active' : ''}`}
                    onClick={() => go && setTab(go)} style={{ cursor: go ? 'pointer' : 'default' }}>
                    <div className={`stat-icon ${color}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{icon}</svg>
                    </div>
                    <div>
                      <div className="stat-value">{val}</div>
                      <div className="stat-label">{label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">Recent Inquiries</span>
                  <button className="btn-secondary" onClick={() => setTab('submissions')}>
                    View All ({submissions.length}) →
                  </button>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Date</th><th>Client</th><th>Email</th><th>Service</th><th>Message</th></tr></thead>
                    <tbody>
                      {stats.recentSubmissions?.length > 0
                        ? stats.recentSubmissions.map(s => (
                            <tr key={s._id}>
                              <td><span className="badge badge-grey">{new Date(s.createdAt).toLocaleDateString()}</span></td>
                              <td><strong>{s.name}</strong></td>
                              <td><a href={`mailto:${s.email}`} style={{ color: 'var(--primary)' }}>{s.email}</a></td>
                              <td><span className="badge badge-blue">{s.service}</span></td>
                              <td style={{ maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-muted)', fontSize: '0.82rem' }}>{s.message}</td>
                            </tr>
                          ))
                        : <tr className="empty-row"><td colSpan="5">No inquiries yet.</td></tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ── CONTACT INQUIRIES ─────────────────────────── */}
          {tab === 'submissions' && (
            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">Contact Inquiries <span className="badge badge-blue" style={{ marginLeft: 8 }}>{filteredSubs.length}</span></span>
                <div className="panel-actions">
                  <input className="search-input" placeholder="Search by name, email, service…"
                    value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Date</th><th>Client</th><th>Email</th><th>Phone</th><th>Service</th><th>Message</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredSubs.length > 0
                      ? filteredSubs.map(s => (
                          <tr key={s._id}>
                            <td style={{ whiteSpace: 'nowrap' }}>{new Date(s.createdAt).toLocaleDateString()}</td>
                            <td><strong>{s.name}</strong></td>
                            <td><a href={`mailto:${s.email}`} style={{ color: 'var(--primary)' }}>{s.email}</a></td>
                            <td style={{ color: 'var(--text-muted)' }}>{s.phone || '—'}</td>
                            <td><span className="badge badge-blue">{s.service}</span></td>
                            <td style={{ maxWidth: 260, fontSize: '0.82rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.message}</td>
                            <td>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <a href={`mailto:${s.email}`} className="btn-icon edit" title="Reply">✉</a>
                                <button type="button" className="btn-icon danger" title="Delete" onClick={() => delSubmission(s)}>🗑</button>
                              </div>
                            </td>
                          </tr>
                        ))
                      : <tr className="empty-row"><td colSpan="7">No inquiries found.</td></tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── PROJECTS ──────────────────────────────────── */}
          {tab === 'projects' && (
            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">Portfolio Projects <span className="badge badge-gold" style={{ marginLeft: 8 }}>{filteredProjects.length}</span></span>
                <div className="panel-actions">
                  <input className="search-input" placeholder="Search by title, category, location…"
                    value={search} onChange={e => setSearch(e.target.value)} />
                  <button className="btn-accent" onClick={() => { setImgMode('link'); setImgUrl(''); setImgData(null); setImgFileName(''); setModal('project'); }}>
                    + Add Project
                  </button>
                </div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Image</th><th>Title</th><th>Category</th><th>Location</th><th>Year</th><th>Featured</th><th></th></tr>
                  </thead>
                  <tbody>
                    {filteredProjects.length > 0
                      ? filteredProjects.map(p => (
                          <tr key={p._id}>
                            <td>
                              <img className="table-thumb"
                                src={toDirectImageUrl(p.imageurl) || '/logo.png'} alt={p.title}
                                onError={e => { e.currentTarget.src = '/logo.png'; }} />
                            </td>
                            <td><strong>{p.title}</strong></td>
                            <td><span className={`badge ${catBadge(p.category)}`}>{p.category}</span></td>
                            <td style={{ color: 'var(--text-muted)' }}>{p.location || '—'}</td>
                            <td style={{ color: 'var(--text-muted)' }}>{p.year || '—'}</td>
                            <td>{p.featured === 'yes' ? <span className="badge badge-teal">★ Featured</span> : <span className="badge badge-grey">Standard</span>}</td>
                            <td>
                              <button type="button" className="btn-icon danger" title="Delete" onClick={() => delProject(p)}>🗑</button>
                            </td>
                          </tr>
                        ))
                      : <tr className="empty-row"><td colSpan="7">No projects in portfolio yet.</td></tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── JOBS ──────────────────────────────────────── */}
          {tab === 'jobs' && (
            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">Career Openings <span className="badge badge-teal" style={{ marginLeft: 8 }}>{filteredJobs.length}</span></span>
                <div className="panel-actions">
                  <input className="search-input" placeholder="Search by title, dept, location…"
                    value={search} onChange={e => setSearch(e.target.value)} />
                  <button className="btn-accent teal" onClick={() => setModal('job')}>+ Post Job</button>
                </div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Position</th><th>Department</th><th>Location</th><th>Type</th><th>Deadline</th><th>Status</th><th></th></tr>
                  </thead>
                  <tbody>
                    {filteredJobs.length > 0
                      ? filteredJobs.map(j => (
                          <tr key={j._id}>
                            <td><strong>{j.title}</strong></td>
                            <td style={{ color: 'var(--text-muted)' }}>{j.department || '—'}</td>
                            <td style={{ color: 'var(--text-muted)' }}>{j.location || '—'}</td>
                            <td><span className="badge badge-gold">{j.type || 'Full-time'}</span></td>
                            <td style={{ color: 'var(--text-muted)' }}>{j.deadline || 'Open'}</td>
                            <td>{j.isActive ? <span className="badge badge-teal">● Active</span> : <span className="badge badge-red">Closed</span>}</td>
                            <td>
                              <button type="button" className="btn-icon danger" title="Delete" onClick={() => delJob(j)}>🗑</button>
                            </td>
                          </tr>
                        ))
                      : <tr className="empty-row"><td colSpan="7">No job postings yet.</td></tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── ADD PROJECT MODAL ─────────────────────────────── */}
      {modal === 'project' && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal wide" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-title">Add Portfolio Project</span>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <form onSubmit={handleAddProject}>
              <div className="modal-body">
                <div className="form-field">
                  <label>Project Title *</label>
                  <input type="text" name="title" className="form-input" required placeholder="e.g. Hawassa Commercial Tower" />
                </div>
                <div className="form-grid">
                  <div className="form-field">
                    <label>Category</label>
                    <select name="category" className="form-input">
                      <option value="commercial">Commercial</option>
                      <option value="residential">Residential</option>
                      <option value="hospitality">Hospitality</option>
                      <option value="public">Public / Civic</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Featured on Homepage?</label>
                    <select name="featured" className="form-input">
                      <option value="no">No</option>
                      <option value="yes">Yes — Show on Homepage</option>
                    </select>
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-field">
                    <label>Location</label>
                    <input type="text" name="location" className="form-input" placeholder="e.g. Hawassa, Ethiopia" />
                  </div>
                  <div className="form-field">
                    <label>Year / Status</label>
                    <input type="text" name="year" className="form-input" placeholder="e.g. 2024" />
                  </div>
                </div>

                <div className="form-field">
                  <label>Cover Image</label>
                  <div className="image-mode-toggle">
                    <button type="button" className={`img-mode-btn ${imgMode === 'link' ? 'active' : ''}`} onClick={() => setImgMode('link')}>🔗 Paste URL</button>
                    <button type="button" className={`img-mode-btn ${imgMode === 'upload' ? 'active' : ''}`} onClick={() => setImgMode('upload')}>📁 Upload File</button>
                  </div>
                  {imgMode === 'link' ? (
                    <>
                      <input type="text" className="form-input" placeholder="https://… or Google Drive link"
                        value={imgUrl} onChange={e => setImgUrl(e.target.value)} />
                      {imgUrl && (
                        <div className="img-preview" style={{ marginTop: 8 }}>
                          <img src={toDirectImageUrl(imgUrl)} alt="preview" onError={e => e.currentTarget.style.display = 'none'} />
                          <div className="img-preview-info">
                            <div className="img-preview-name">{imgUrl}</div>
                            <div className="img-preview-status">Link attached</div>
                          </div>
                          <button type="button" className="btn-secondary" onClick={() => setImgUrl('')}>Clear</button>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {!imgData ? (
                        <div className={`dropzone ${dragging ? 'dragging' : ''}`}
                          onDragOver={e => { e.preventDefault(); setDragging(true); }}
                          onDragLeave={() => setDragging(false)}
                          onDrop={e => { e.preventDefault(); setDragging(false); handleImageFile(e.dataTransfer.files[0]); }}
                          onClick={() => document.getElementById('proj-file')?.click()}>
                          <input type="file" id="proj-file" accept="image/*" style={{ display: 'none' }}
                            onChange={e => handleImageFile(e.target.files[0])} />
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 28, height: 28, margin: '0 auto 8px', display: 'block' }}>
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                          </svg>
                          <div className="dropzone-label">Click to browse or drag image here</div>
                          <div className="dropzone-hint">PNG, JPG, WEBP — max 15 MB</div>
                        </div>
                      ) : (
                        <div className="img-preview">
                          <img src={imgData} alt="preview" />
                          <div className="img-preview-info">
                            <div className="img-preview-name">{imgFileName}</div>
                            <div className="img-preview-status">Ready to upload</div>
                          </div>
                          <button type="button" className="btn-secondary" onClick={() => { setImgData(null); setImgFileName(''); }}>Remove</button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="form-field">
                  <label>Description (optional)</label>
                  <textarea name="description" className="form-input" rows="3" placeholder="Brief project summary…" />
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn-accent">Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ADD JOB MODAL ────────────────────────────────── */}
      {modal === 'job' && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-title">Post Job Opening</span>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <form onSubmit={handleAddJob}>
              <div className="modal-body">
                <div className="form-field">
                  <label>Position Title *</label>
                  <input type="text" name="title" className="form-input" required placeholder="e.g. Senior Structural Engineer" />
                </div>
                <div className="form-grid">
                  <div className="form-field">
                    <label>Department</label>
                    <input type="text" name="department" className="form-input" placeholder="e.g. Structural Engineering" />
                  </div>
                  <div className="form-field">
                    <label>Location</label>
                    <input type="text" name="location" className="form-input" placeholder="e.g. Hawassa" />
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-field">
                    <label>Employment Type</label>
                    <select name="type" className="form-input">
                      <option value="Full-time">Full-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Part-time">Part-time</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Deadline</label>
                    <input type="text" name="deadline" className="form-input" placeholder="e.g. 31-Dec-2026" />
                  </div>
                </div>
                <div className="form-field">
                  <label>Requirements &amp; Description</label>
                  <textarea name="description" className="form-input" rows="4" placeholder="Qualifications and key duties…" />
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn-accent teal">Publish Job</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CONFIRM DIALOG ───────────────────────────────── */}
      {confirm && (
        <div className="modal-backdrop" onClick={() => setConfirm(null)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="confirm-body">
              <div className="confirm-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div className="confirm-title">{confirm.title}</div>
              <p className="confirm-msg">{confirm.message}</p>
            </div>
            <div className="confirm-foot">
              <button className="btn-secondary" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => { const fn = confirm.onConfirm; setConfirm(null); fn(); }}>
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Reusable Toast Component ──────────────────────────────
function ToastBar({ toast, onClose }) {
  return (
    <div className="toast-wrap">
      <div className={`toast ${toast.type}`}>
        <div className="toast-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
            {toast.type === 'success'
              ? <polyline points="20 6 9 17 4 12"/>
              : <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
            }
          </svg>
        </div>
        <div className="toast-body">
          <div className="toast-title">{toast.type === 'success' ? 'Success' : 'Error'}</div>
          <div className="toast-msg">{toast.message}</div>
        </div>
        <button className="toast-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
}
