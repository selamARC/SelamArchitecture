import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE, toDirectImageUrl, getInitials } from '../utils/api';
import '../admin.css';

const STORAGE_KEY = 'selam_admin_token';
const USER_KEY = 'selam_admin_user';

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      return null;
    }
  });

  // Login form state
  const [loginEmail, setLoginEmail] = useState('admin@selam.com');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Active tab: 'overview' | 'submissions' | 'projects' | 'jobs'
  const [activeTab, setActiveTab] = useState('overview');

  // Search & Filter queries
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [stats, setStats] = useState({ counts: {}, recentSubmissions: [] });
  const [submissions, setSubmissions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  // Modals state
  const [modal, setModal] = useState(null); // 'project' | 'job'
  const [confirmDialog, setConfirmDialog] = useState(null);

  // Project Image input state (Link vs Browse/Upload)
  const [projectImageMode, setProjectImageMode] = useState('link'); // 'link' | 'upload'
  const [projectImageUrl, setProjectImageUrl] = useState('');
  const [projectUploadedImage, setProjectUploadedImage] = useState(null);
  const [projectFileName, setProjectFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleProjectFileChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WEBP).', 'error');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      showToast('Image file size must be under 15MB.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setProjectUploadedImage(e.target.result);
      setProjectFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  // Fetch all dashboard data
  const loadData = () => {
    if (!token) return;
    setIsRefreshing(true);

    Promise.all([
      fetch(`${API_BASE}/api/stats`, { headers: authHeaders() })
        .then(res => res.json())
        .then(d => d.counts && setStats(d))
        .catch(() => {}),

      fetch(`${API_BASE}/api/contact`, { headers: authHeaders() })
        .then(res => res.json())
        .then(d => Array.isArray(d) && setSubmissions(d))
        .catch(() => {}),

      fetch(`${API_BASE}/api/projects`)
        .then(res => res.json())
        .then(d => Array.isArray(d) && setProjects(d))
        .catch(() => {}),

      fetch(`${API_BASE}/api/jobs/all`, { headers: authHeaders() })
        .then(res => res.json())
        .then(d => Array.isArray(d) && setJobs(d))
        .catch(() => {})
    ]).finally(() => {
      setTimeout(() => setIsRefreshing(false), 500);
    });
  };

  useEffect(() => {
    if (token) {
      fetch(`${API_BASE}/api/auth/me`, { headers: authHeaders() })
        .then(res => res.json())
        .then(d => {
          if (d && d.user) {
            setUser(d.user);
            localStorage.setItem(USER_KEY, JSON.stringify(d.user));
          }
        })
        .catch(() => {});

      loadData();
    }
  }, [token]);

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: loginEmail, password: loginPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed.');
      }

      localStorage.setItem(STORAGE_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      showToast('Welcome back to the Admin Dashboard!', 'success');
    } catch (err) {
      showToast(err.message || 'Cannot connect to backend server.', 'error');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    showToast('Signed out safely.', 'success');
  };

  // Delete Handlers with Confirmation Modal
  const handleDeleteSubmission = (subOrId) => {
    const sub = typeof subOrId === 'object' ? subOrId : submissions.find(s => s._id === subOrId) || {};
    const id = sub._id || subOrId;
    setConfirmDialog({
      title: 'Delete Client Message',
      message: `Are you sure you want to delete the enquiry from ${sub.name ? `"${sub.name}"` : 'this client'}? This action cannot be undone.`,
      confirmText: 'Yes, Delete Message',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE}/api/contact/${id}`, { method: 'DELETE', headers: authHeaders() });
          if (res.ok) {
            showToast('The client message has been removed successfully.', 'success');
            loadData();
          } else {
            showToast('Unable to delete message. Please try again.', 'error');
          }
        } catch {
          showToast('Network error while deleting message.', 'error');
        }
      }
    });
  };

  const handleDeleteProject = (projOrId) => {
    const proj = typeof projOrId === 'object' ? projOrId : projects.find(p => p._id === projOrId) || {};
    const id = proj._id || projOrId;
    setConfirmDialog({
      title: 'Delete Portfolio Project',
      message: `Are you sure you want to permanently delete ${proj.title ? `"${proj.title}"` : 'this project'}? It will be removed immediately from the public website.`,
      confirmText: 'Yes, Delete Project',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE}/api/projects/${id}`, { method: 'DELETE', headers: authHeaders() });
          if (res.ok) {
            showToast(`"${proj.title || 'Project'}" has been deleted from your portfolio.`, 'success');
            loadData();
          } else {
            showToast('Unable to delete project. Please try again.', 'error');
          }
        } catch {
          showToast('Network error while deleting project.', 'error');
        }
      }
    });
  };

  const handleDeleteJob = (jobOrId) => {
    const job = typeof jobOrId === 'object' ? jobOrId : jobs.find(j => j._id === jobOrId) || {};
    const id = job._id || jobOrId;
    setConfirmDialog({
      title: 'Delete Job Opening',
      message: `Are you sure you want to close and delete the career posting for ${job.title ? `"${job.title}"` : 'this position'}?`,
      confirmText: 'Yes, Delete Job',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE}/api/jobs/${id}`, { method: 'DELETE', headers: authHeaders() });
          if (res.ok) {
            showToast(`Job opening ${job.title ? `"${job.title}" ` : ''}has been removed.`, 'success');
            loadData();
          } else {
            showToast('Unable to delete job posting. Please try again.', 'error');
          }
        } catch {
          showToast('Network error while deleting job.', 'error');
        }
      }
    });
  };

  // Add Project Submission
  const handleAddProject = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());

    if (projectImageMode === 'upload' && projectUploadedImage) {
      data.imageurl = projectUploadedImage;
    } else if (projectImageUrl) {
      data.imageurl = projectImageUrl;
    }

    try {
      const res = await fetch(`${API_BASE}/api/projects`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data)
      });
      if (res.ok) {
        showToast('Project created successfully!');
        setModal(null);
        setProjectImageUrl('');
        setProjectUploadedImage(null);
        setProjectFileName('');
        loadData();
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.error || 'Failed to save project.', 'error');
      }
    } catch {
      showToast('Failed to save project.', 'error');
    }
  };

  // Add Job Submission
  const handleAddJob = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    try {
      const res = await fetch(`${API_BASE}/api/jobs`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data)
      });
      if (res.ok) {
        showToast('Job posting created!');
        setModal(null);
        loadData();
      } else {
        showToast('Failed to save job.', 'error');
      }
    } catch {
      showToast('Failed to save job.', 'error');
    }
  };

  // Filtered collections
  const filteredSubmissions = useMemo(() => {
    if (!searchQuery) return submissions;
    const q = searchQuery.toLowerCase();
    return submissions.filter(s =>
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      (s.service && s.service.toLowerCase().includes(q))
    );
  }, [submissions, searchQuery]);

  const filteredProjects = useMemo(() => {
    if (!searchQuery) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter(p =>
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.location && p.location.toLowerCase().includes(q))
    );
  }, [projects, searchQuery]);

  const filteredJobs = useMemo(() => {
    if (!searchQuery) return jobs;
    const q = searchQuery.toLowerCase();
    return jobs.filter(j =>
      (j.title && j.title.toLowerCase().includes(q)) ||
      (j.department && j.department.toLowerCase().includes(q)) ||
      (j.location && j.location.toLowerCase().includes(q))
    );
  }, [jobs, searchQuery]);

  // ─────────────────────────────────────────────────────────────
  // 1. LOGIN SCREEN
  // ─────────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div className="login-screen">
        <div className="ambient-glow-orb glow-orb-gold"></div>
        <div className="ambient-glow-orb glow-orb-blue"></div>

        {toast && (
          <div className="toast-container">
            <div className={`toast-card toast-${toast.type}`}>
              <div className="toast-icon">
                {toast.type === 'success' ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                )}
              </div>
              <div className="toast-content">
                <span className="toast-title">{toast.type === 'success' ? 'Success' : 'Notice'}</span>
                <p className="toast-message">{toast.message}</p>
              </div>
            </div>
          </div>
        )}

        <div className="login-card">
          <div className="login-header-emblem">
            <img src="/assets/logos/logo.png" alt="Selam Logo" className="login-logo" onError={(e) => { e.currentTarget.src = '/logo.png'; }} />
          </div>

          <h1 className="login-title">Staff Admin Portal</h1>
          <p className="login-subtitle">
            Selam Consulting Architects &amp; Engineers PLC
          </p>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-field">
              <label>Email or Username</label>
              <div className="input-with-icon-wrapper">
                <span className="input-icon-prefix">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </span>
                <input
                  type="text"
                  className="form-input has-prefix"
                  required
                  placeholder="admin@selam.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-field">
              <label>Password</label>
              <div className="input-with-icon-wrapper">
                <span className="input-icon-prefix">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input has-prefix"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="input-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn-primary" disabled={loginLoading}>
              {loginLoading ? (
                <>
                  <span className="status-pulse-dot" style={{ backgroundColor: '#080b11' }}></span>
                  <span>Verifying Session...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Helper */}
          <div className="demo-fill-pill">
            <div>
              <span>Demo Login: </span>
              <strong>admin@selam.com</strong>
            </div>
            <button
              type="button"
              className="btn-mini-fill"
              onClick={() => {
                setLoginEmail('admin@selam.com');
                setLoginPassword('admin123');
              }}
            >
              Autofill
            </button>
          </div>

          <div style={{ marginTop: '22px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <Link to="/" style={{ color: 'var(--text-dim)', fontSize: '0.82rem', textDecoration: 'none', transition: 'var(--transition-fast)' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = 'var(--text-dim)'}>
              ← Return to Selam Public Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. MAIN EXECUTIVE DASHBOARD
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="admin-layout">
      {toast && (
        <div className="toast-container">
          <div className={`toast-card toast-${toast.type}`}>
            <div className="toast-icon">
              {toast.type === 'success' ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              )}
            </div>
            <div className="toast-content">
              <span className="toast-title">{toast.type === 'success' ? 'Success' : 'Notice'}</span>
              <p className="toast-message">{toast.message}</p>
            </div>
            <button
              type="button"
              className="toast-close-btn"
              onClick={() => setToast(null)}
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* LUXURY SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <img src="/assets/logos/logo.png" alt="Selam Logo" className="sidebar-logo" onError={(e) => { e.currentTarget.src = '/logo.png'; }} />
          <div>
            <div className="sidebar-brand-title">SELAM CONSULTING</div>
            <div className="sidebar-brand-sub">STAFF ADMIN PORTAL</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-header">WORKSPACE</div>

          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => { setActiveTab('overview'); setSearchQuery(''); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect></svg>
            <span>Overview</span>
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}
            onClick={() => { setActiveTab('submissions'); setSearchQuery(''); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
            <span>Contact Inquiries</span>
            <span className="sidebar-count-chip">{submissions.length}</span>
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => { setActiveTab('projects'); setSearchQuery(''); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M2 20h20"></path><path d="M5 20V8.2c0-.7.6-1.2 1.3-1.2h11.4c.7 0 1.3.5 1.3 1.2V20"></path></svg>
            <span>Projects Portfolio</span>
            <span className="sidebar-count-chip">{projects.length}</span>
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => { setActiveTab('jobs'); setSearchQuery(''); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="20" height="14" x="2" y="7" rx="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
            <span>Career Openings</span>
            <span className="sidebar-count-chip">{jobs.length}</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-badge">
            <div className="user-avatar">
              {getInitials(user?.username || user?.email || 'Admin')}
            </div>
            <div className="user-info-text">
              <div className="user-name">{user?.email || 'admin@selam.com'}</div>
              <div className="user-role">Administrator</div>
            </div>
          </div>

          <Link to="/" className="btn-sidebar-action">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline></svg>
            View Live Site
          </Link>

          <button type="button" className="btn-sidebar-action btn-sidebar-logout" onClick={handleLogout}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline></svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="admin-main">
        {/* TOPBAR */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <div className="topbar-breadcrumbs">
              <span>Selam Portal</span>
              <span>/</span>
              <span className="active" style={{ textTransform: 'capitalize' }}>{activeTab}</span>
            </div>
          </div>

          <div className="topbar-actions">
            <div className="status-indicator-pill">
              <span className="status-pulse-dot" style={{ backgroundColor: '#10b981' }}></span>
              <span>Database Connected</span>
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={loadData}
              disabled={isRefreshing}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ transform: isRefreshing ? 'rotate(360deg)' : 'none', transition: 'transform 0.6s ease' }}
              >
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
              </svg>
              <span>{isRefreshing ? 'Syncing...' : 'Sync Data'}</span>
            </button>
          </div>
        </header>

        <div className="admin-content">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon gold">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                  </div>
                  <div>
                    <div className="stat-value">{stats.counts?.submissions || 0}</div>
                    <div className="stat-label">Customer Inquiries</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon blue">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M2 20h20"></path><path d="M5 20V8.2c0-.7.6-1.2 1.3-1.2h11.4c.7 0 1.3.5 1.3 1.2V20"></path></svg>
                  </div>
                  <div>
                    <div className="stat-value">{stats.counts?.projects || 0}</div>
                    <div className="stat-label">Portfolio Projects</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon purple">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="20" height="14" x="2" y="7" rx="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                  </div>
                  <div>
                    <div className="stat-value">{stats.counts?.jobs || 0}</div>
                    <div className="stat-label">Active Career Openings</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon emerald">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                  </div>
                  <div>
                    <div className="stat-value" style={{ fontSize: '1.4rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="status-pulse-dot" style={{ backgroundColor: '#10b981' }}></span>
                      Online
                    </div>
                    <div className="stat-label">Cloud MongoDB API</div>
                  </div>
                </div>
              </div>

              {/* Recent Inquiries Panel */}
              <div className="panel">
                <div className="panel-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h3 className="panel-title">Recent Customer Contact Messages</h3>
                    <span className="badge badge-gold">Latest Activity</span>
                  </div>
                  <button type="button" className="btn-secondary" onClick={() => setActiveTab('submissions')}>
                    View All Inquiries ({submissions.length}) →
                  </button>
                </div>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Client Name</th>
                        <th>Email</th>
                        <th>Service Category</th>
                        <th>Message Preview</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentSubmissions?.length > 0 ? (
                        stats.recentSubmissions.map((s) => (
                          <tr key={s._id}>
                            <td><span className="badge badge-gold">{new Date(s.createdAt).toLocaleDateString()}</span></td>
                            <td><strong>{s.name}</strong></td>
                            <td><a href={`mailto:${s.email}`} style={{ color: 'var(--accent-gold)' }}>{s.email}</a></td>
                            <td><span className="badge badge-emerald">{s.service}</span></td>
                            <td style={{ maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.message}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="5" className="empty-state">No inquiries received yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SUBMISSIONS */}
          {activeTab === 'submissions' && (
            <div className="panel">
              <div className="panel-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h3 className="panel-title">Customer Contact Inquiries</h3>
                  <span className="badge badge-gold">{filteredSubmissions.length} Messages</span>
                </div>
                <div className="panel-search-bar">
                  <input
                    type="text"
                    className="table-search-input"
                    placeholder="Search inquiries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Submitted On</th>
                      <th>Client Name</th>
                      <th>Email Address</th>
                      <th>Phone</th>
                      <th>Service Required</th>
                      <th>Message</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubmissions.length > 0 ? (
                      filteredSubmissions.map((s) => (
                        <tr key={s._id}>
                          <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                          <td><strong>{s.name}</strong></td>
                          <td><a href={`mailto:${s.email}`} style={{ color: 'var(--accent-gold)' }}>{s.email}</a></td>
                          <td>{s.phone || '—'}</td>
                          <td><span className="badge badge-emerald">{s.service}</span></td>
                          <td style={{ maxWidth: '300px', fontSize: '0.85rem' }}>{s.message}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <a href={`mailto:${s.email}?subject=Selam Consulting Architectural Consultation`} className="btn-action-icon" title="Reply via Email">
                                ✉
                              </a>
                              <button type="button" className="btn-action-icon delete" title="Delete Message" onClick={() => handleDeleteSubmission(s._id)}>
                                🗑
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="7" className="empty-state">No inquiries found matching search criteria.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PROJECTS */}
          {activeTab === 'projects' && (
            <div className="panel">
              <div className="panel-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h3 className="panel-title">Portfolio Projects</h3>
                  <span className="badge badge-gold">{filteredProjects.length} Projects</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="table-search-input"
                    placeholder="Filter projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="button" className="btn-gold" onClick={() => setModal('project')}>
                    + Add New Project
                  </button>
                </div>
              </div>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Thumbnail</th>
                      <th>Project Title</th>
                      <th>Category</th>
                      <th>Location</th>
                      <th>Year</th>
                      <th>Featured</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.length > 0 ? (
                      filteredProjects.map((p) => (
                        <tr key={p._id}>
                          <td>
                            <img
                              src={toDirectImageUrl(p.imageurl) || '/assets/front/foq.jpg'}
                              alt={p.title}
                              style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.25)' }}
                              onError={(e) => { e.currentTarget.src = '/logo.png'; }}
                            />
                          </td>
                          <td><strong>{p.title}</strong></td>
                          <td>
                            <span className={`badge ${
                              p.category === 'commercial' ? 'badge-gold' :
                              p.category === 'residential' ? 'badge-emerald' :
                              p.category === 'public' ? 'badge-blue' : 'badge-purple'
                            }`}>
                              {p.category}
                            </span>
                          </td>
                          <td>{p.location || '—'}</td>
                          <td>{p.year || '—'}</td>
                          <td>
                            {p.featured === 'yes' ? (
                              <span className="badge badge-emerald">★ Featured</span>
                            ) : (
                              <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Standard</span>
                            )}
                          </td>
                          <td>
                            <button type="button" className="btn-action-icon delete" title="Delete Project" onClick={() => handleDeleteProject(p._id)}>
                              🗑
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="7" className="empty-state">No portfolio projects found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: JOBS */}
          {activeTab === 'jobs' && (
            <div className="panel">
              <div className="panel-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h3 className="panel-title">Career Opportunities</h3>
                  <span className="badge badge-gold">{filteredJobs.length} Openings</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="table-search-input"
                    placeholder="Search careers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="button" className="btn-gold" onClick={() => setModal('job')}>
                    + Post Career Opening
                  </button>
                </div>
              </div>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Job Position</th>
                      <th>Department</th>
                      <th>Office Location</th>
                      <th>Employment Type</th>
                      <th>Deadline</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs.length > 0 ? (
                      filteredJobs.map((j) => (
                        <tr key={j._id}>
                          <td><strong>{j.title}</strong></td>
                          <td>{j.department || '—'}</td>
                          <td>{j.location || '—'}</td>
                          <td><span className="badge badge-gold">{j.type || 'Full-time'}</span></td>
                          <td>{j.deadline || 'Open'}</td>
                          <td>
                            {j.isActive ? (
                              <span className="badge badge-emerald">● Active</span>
                            ) : (
                              <span className="badge badge-red">Closed</span>
                            )}
                          </td>
                          <td>
                            <button type="button" className="btn-action-icon delete" title="Close & Delete Job" onClick={() => handleDeleteJob(j._id)}>
                              🗑
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="7" className="empty-state">No career listings found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL 1: ADD PROJECT */}
      {modal === 'project' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Publish Portfolio Project</h3>
              <button type="button" className="modal-close" onClick={() => setModal(null)}>&times;</button>
            </div>
            <form onSubmit={handleAddProject}>
              <div className="modal-body">
                <div className="form-field">
                  <label>Project Title *</label>
                  <input type="text" name="title" className="form-input" required placeholder="e.g. Mekane Yesus Commercial High-Rise" />
                </div>
                <div className="form-field">
                  <label>Architectural Category</label>
                  <select name="category" className="form-input">
                    <option value="commercial">Commercial Building</option>
                    <option value="residential">Residential Villa / Complex</option>
                    <option value="hospitality">Hospitality / Hotel &amp; Resort</option>
                    <option value="public">Civic &amp; Public Infrastructure</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Location</label>
                  <input type="text" name="location" className="form-input" placeholder="e.g. Hawassa, Ethiopia" />
                </div>
                <div className="form-field">
                  <label>Year / Status</label>
                  <input type="text" name="year" className="form-input" placeholder="e.g. 2024 E.C." />
                </div>
                <div className="form-field">
                  <label>Project Cover Image</label>
                  
                  {/* Mode Selector Toggle */}
                  <div className="image-mode-toggle">
                    <button
                      type="button"
                      className={`image-mode-btn ${projectImageMode === 'link' ? 'active' : ''}`}
                      onClick={() => setProjectImageMode('link')}
                    >
                      🔗 Paste Image Link
                    </button>
                    <button
                      type="button"
                      className={`image-mode-btn ${projectImageMode === 'upload' ? 'active' : ''}`}
                      onClick={() => setProjectImageMode('upload')}
                    >
                      📁 Browse / Upload File
                    </button>
                  </div>

                  {projectImageMode === 'link' ? (
                    <div>
                      <input
                        type="text"
                        name="imageurl"
                        className="form-input"
                        placeholder="Google Drive link, https://... or /assets/front/..."
                        value={projectImageUrl}
                        onChange={(e) => setProjectImageUrl(e.target.value)}
                      />
                      {projectImageUrl && (
                        <div className="image-preview-container">
                          <img
                            src={toDirectImageUrl(projectImageUrl)}
                            alt="Link Preview"
                            className="image-preview-thumb"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            onLoad={(e) => { e.currentTarget.style.display = 'block'; }}
                          />
                          <div className="image-preview-meta">
                            <span className="image-preview-name">{projectImageUrl}</span>
                            <span className="image-preview-badge">Link Connected</span>
                          </div>
                          <button
                            type="button"
                            className="image-remove-btn"
                            onClick={() => setProjectImageUrl('')}
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {!projectUploadedImage ? (
                        <div
                          className={`image-dropzone ${isDragging ? 'dragging' : ''}`}
                          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                              handleProjectFileChange(e.dataTransfer.files[0]);
                            }
                          }}
                          onClick={() => document.getElementById('project-file-input')?.click()}
                        >
                          <input
                            type="file"
                            id="project-file-input"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleProjectFileChange(e.target.files[0]);
                              }
                            }}
                          />
                          <div className="dropzone-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="17 8 12 3 7 8"></polyline>
                              <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                          </div>
                          <div className="dropzone-text">Click to Browse or Drag Image Here</div>
                          <div className="dropzone-hint">Supports PNG, JPG, JPEG, WEBP (Max 15MB)</div>
                        </div>
                      ) : (
                        <div className="image-preview-container">
                          <img
                            src={projectUploadedImage}
                            alt="Uploaded preview"
                            className="image-preview-thumb"
                          />
                          <div className="image-preview-meta">
                            <span className="image-preview-name">{projectFileName || 'Selected Image'}</span>
                            <span className="image-preview-badge">Ready for Upload</span>
                          </div>
                          <button
                            type="button"
                            className="image-remove-btn"
                            onClick={() => {
                              setProjectUploadedImage(null);
                              setProjectFileName('');
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="form-field">
                  <label>Featured in Hero Showcase?</label>
                  <select name="featured" className="form-input">
                    <option value="no">No — Standard Portfolio</option>
                    <option value="yes">Yes — Highlight on Homepage Hero</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Project Architectural Narrative</label>
                  <textarea name="description" className="form-input" rows="3" placeholder="Brief design summary..."></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn-gold">Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD JOB */}
      {modal === 'job' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Publish Career Opening</h3>
              <button type="button" className="modal-close" onClick={() => setModal(null)}>&times;</button>
            </div>
            <form onSubmit={handleAddJob}>
              <div className="modal-body">
                <div className="form-field">
                  <label>Position Title *</label>
                  <input type="text" name="title" className="form-input" required placeholder="e.g. Senior Structural Engineer" />
                </div>
                <div className="form-field">
                  <label>Engineering / Architectural Department</label>
                  <input type="text" name="department" className="form-input" placeholder="e.g. Structural Engineering Studio" />
                </div>
                <div className="form-field">
                  <label>Job Location</label>
                  <input type="text" name="location" className="form-input" placeholder="e.g. Hawassa, Ethiopia (Headquarters)" />
                </div>
                <div className="form-field">
                  <label>Employment Commitment</label>
                  <select name="type" className="form-input">
                    <option value="Full-time">Full-time Contract</option>
                    <option value="Contract">Project-based Contract</option>
                    <option value="Part-time">Part-time Consultancy</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Submission Deadline</label>
                  <input type="text" name="deadline" className="form-input" placeholder="e.g. 31-Dec-2026" />
                </div>
                <div className="form-field">
                  <label>Role Requirements &amp; Scope</label>
                  <textarea name="description" className="form-input" rows="3" placeholder="Candidate qualifications and key duties..."></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn-gold">Publish Career Opening</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION POPUP MODAL */}
      {confirmDialog && (
        <div className="modal-overlay" onClick={() => setConfirmDialog(null)}>
          <div className="modal-card confirm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-body">
              <div className="confirm-modal-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <h3 className="confirm-modal-title">{confirmDialog.title}</h3>
              <p className="confirm-modal-text">{confirmDialog.message}</p>
            </div>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="confirm-cancel-btn"
                onClick={() => setConfirmDialog(null)}
              >
                Keep &amp; Cancel
              </button>
              <button
                type="button"
                className="btn-danger-confirm"
                onClick={() => {
                  const action = confirmDialog.onConfirm;
                  setConfirmDialog(null);
                  if (action) action();
                }}
              >
                {confirmDialog.confirmText || 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
