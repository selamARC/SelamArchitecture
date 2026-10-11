import React, { useState, useEffect } from 'react';
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
  const [loginLoading, setLoginLoading] = useState(false);

  // Active tab: 'overview' | 'submissions' | 'projects' | 'team' | 'jobs'
  const [activeTab, setActiveTab] = useState('overview');

  // Data states
  const [stats, setStats] = useState({ counts: {}, recentSubmissions: [] });
  const [submissions, setSubmissions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [team, setTeam] = useState([]);
  const [jobs, setJobs] = useState([]);

  // Toast
  const [toast, setToast] = useState(null);

  // Modals state
  const [modal, setModal] = useState(null); // 'project' | 'team' | 'edit-team' | 'job'
  const [editingTeamMember, setEditingTeamMember] = useState(null);

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

    // Stats
    fetch(`${API_BASE}/api/stats`, { headers: authHeaders() })
      .then(res => res.json())
      .then(d => d.counts && setStats(d))
      .catch(() => {});

    // Submissions
    fetch(`${API_BASE}/api/contact`, { headers: authHeaders() })
      .then(res => res.json())
      .then(d => Array.isArray(d) && setSubmissions(d))
      .catch(() => {});

    // Projects
    fetch(`${API_BASE}/api/projects`)
      .then(res => res.json())
      .then(d => Array.isArray(d) && setProjects(d))
      .catch(() => {});

    // Team
    fetch(`${API_BASE}/api/team`)
      .then(res => res.json())
      .then(d => Array.isArray(d) && setTeam(d))
      .catch(() => {});

    // Jobs
    fetch(`${API_BASE}/api/jobs/all`, { headers: authHeaders() })
      .then(res => res.json())
      .then(d => Array.isArray(d) && setJobs(d))
      .catch(() => {});
  };

  useEffect(() => {
    if (token) {
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
      showToast('Signed in successfully!', 'success');
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
    showToast('Logged out.', 'success');
  };

  // Delete Handlers
  const handleDeleteSubmission = async (id) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/contact/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (res.ok) {
        showToast('Submission deleted.');
        loadData();
      }
    } catch (err) {
      showToast('Failed to delete submission.', 'error');
    }
  };

  const handleDeleteProject = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/projects/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (res.ok) {
        showToast('Project deleted.');
        loadData();
      }
    } catch (err) {
      showToast('Failed to delete project.', 'error');
    }
  };

  const handleDeleteTeam = async (id) => {
    if (!confirm('Are you sure you want to delete this team member?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/team/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (res.ok) {
        showToast('Team member deleted.');
        loadData();
      }
    } catch (err) {
      showToast('Failed to delete member.', 'error');
    }
  };

  const handleDeleteJob = async (id) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/jobs/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (res.ok) {
        showToast('Job posting deleted.');
        loadData();
      }
    } catch (err) {
      showToast('Failed to delete job.', 'error');
    }
  };

  // Add / Edit Form Submissions
  const handleAddProject = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    try {
      const res = await fetch(`${API_BASE}/api/projects`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data)
      });
      if (res.ok) {
        showToast('Project created successfully!');
        setModal(null);
        loadData();
      }
    } catch (err) {
      showToast('Failed to save project.', 'error');
    }
  };

  const handleAddTeam = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    try {
      const res = await fetch(`${API_BASE}/api/team`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data)
      });
      if (res.ok) {
        showToast('Team member added!');
        setModal(null);
        loadData();
      }
    } catch (err) {
      showToast('Failed to save member.', 'error');
    }
  };

  const handleEditTeam = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    try {
      const res = await fetch(`${API_BASE}/api/team/${editingTeamMember._id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data)
      });
      if (res.ok) {
        showToast('Team member updated successfully!');
        setModal(null);
        setEditingTeamMember(null);
        loadData();
      }
    } catch (err) {
      showToast('Failed to update member.', 'error');
    }
  };

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
      }
    } catch (err) {
      showToast('Failed to save job.', 'error');
    }
  };

  // If not logged in, render the Login Screen
  if (!token) {
    return (
      <div className="login-screen">
        {toast && (
          <div id="toast-container">
            <div className={`toast ${toast.type}`}>
              <span>{toast.type === 'success' ? '✓' : '⚠'}</span>
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        <div className="login-card">
          <img src="/assets/logos/logo.png" alt="Selam Consulting" className="login-logo" onError={(e) => { e.currentTarget.src = '/logo.png'; }} />
          <h1 className="login-title">Admin Portal</h1>
          <p className="login-subtitle">Selam Consulting Architects &amp; Engineers PLC</p>

          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-field">
              <label>Email or Username</label>
              <input
                type="text"
                className="form-input"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Password</label>
              <input
                type="password"
                className="form-input"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-gold" disabled={loginLoading}>
              {loginLoading ? 'Verifying...' : 'Sign In to Dashboard →'}
            </button>
          </form>

          <div className="login-tip">
            Default credentials:<br />
            Email: <strong>admin@selam.com</strong> • Password: <strong>admin123</strong>
          </div>
        </div>
      </div>
    );
  }

  // Render the Authenticated Executive Dashboard
  return (
    <div className="admin-layout">
      {toast && (
        <div id="toast-container">
          <div className={`toast ${toast.type}`}>
            <span>{toast.type === 'success' ? '✓' : '⚠'}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <img src="/assets/logos/logo.png" alt="Selam Logo" className="sidebar-logo" onError={(e) => { e.currentTarget.src = '/logo.png'; }} />
          <div>
            <div className="sidebar-brand-name">SELAM</div>
            <div className="sidebar-brand-sub">Admin Portal</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect></svg>
            Overview
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('submissions')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
            Contact Inquiries
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M2 20h20"></path><path d="M5 20V8.2c0-.7.6-1.2 1.3-1.2h11.4c.7 0 1.3.5 1.3 1.2V20"></path></svg>
            Projects Portfolio
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path></svg>
            Team Members
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="20" height="14" x="2" y="7" rx="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
            Career Openings
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-badge">
            <div className="user-avatar">{getInitials(user?.username || 'Admin')}</div>
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

      {/* MAIN VIEW */}
      <main className="admin-main">
        <header className="admin-topbar">
          <h2 className="topbar-title" style={{ textTransform: 'capitalize' }}>{activeTab}</h2>
          <button type="button" className="btn-secondary" onClick={loadData}>
            ↻ Refresh Data
          </button>
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
                    <div className="stat-label">Inquiries Received</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon blue">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M2 20h20"></path><path d="M5 20V8.2c0-.7.6-1.2 1.3-1.2h11.4c.7 0 1.3.5 1.3 1.2V20"></path></svg>
                  </div>
                  <div>
                    <div className="stat-value">{stats.counts?.projects || 0}</div>
                    <div className="stat-label">Total Projects</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon emerald">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                  </div>
                  <div>
                    <div className="stat-value">{stats.counts?.team || 0}</div>
                    <div className="stat-label">Team Members</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon purple">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="20" height="14" x="2" y="7" rx="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                  </div>
                  <div>
                    <div className="stat-value">{stats.counts?.jobs || 0}</div>
                    <div className="stat-label">Open Positions</div>
                  </div>
                </div>
              </div>

              {/* Recent Inquiries Panel */}
              <div className="panel">
                <div className="panel-header">
                  <h3 className="panel-title">Recent Customer Contact Inquiries</h3>
                  <button type="button" className="btn-secondary" onClick={() => setActiveTab('submissions')}>
                    View All Inquiries →
                  </button>
                </div>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Customer Name</th>
                        <th>Email</th>
                        <th>Service</th>
                        <th>Message Snippet</th>
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
                            <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.message}</td>
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
                  <h3 className="panel-title">All Customer Submissions</h3>
                  <span className="badge badge-gold">{submissions.length} Total</span>
                </div>
              </div>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Submitted At</th>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Service Required</th>
                      <th>Message</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.length > 0 ? (
                      submissions.map((s) => (
                        <tr key={s._id}>
                          <td>{new Date(s.createdAt).toLocaleString()}</td>
                          <td><strong>{s.name}</strong></td>
                          <td><a href={`mailto:${s.email}`} style={{ color: 'var(--accent-gold)' }}>{s.email}</a></td>
                          <td>{s.phone || '—'}</td>
                          <td><span className="badge badge-emerald">{s.service}</span></td>
                          <td style={{ maxWidth: '320px', fontSize: '0.85rem' }}>{s.message}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <a href={`mailto:${s.email}?subject=Selam Consulting Response`} className="btn-action-icon" title="Reply by Email">
                                ✉
                              </a>
                              <button type="button" className="btn-action-icon delete" title="Delete" onClick={() => handleDeleteSubmission(s._id)}>
                                🗑
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="7" className="empty-state">No customer submissions yet.</td></tr>
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
                  <h3 className="panel-title">Projects Management</h3>
                  <span className="badge badge-gold">{projects.length} Total</span>
                </div>
                <button type="button" className="btn-gold" onClick={() => setModal('project')}>
                  + Add New Project
                </button>
              </div>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Location</th>
                      <th>Year</th>
                      <th>Featured</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.length > 0 ? (
                      projects.map((p) => (
                        <tr key={p._id}>
                          <td>
                            <img
                              src={toDirectImageUrl(p.imageurl) || '/assets/front/foq.jpg'}
                              alt={p.title}
                              style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
                              onError={(e) => { e.currentTarget.src = '/logo.png'; }}
                            />
                          </td>
                          <td><strong>{p.title}</strong></td>
                          <td><span className="badge badge-gold">{p.category}</span></td>
                          <td>{p.location || '—'}</td>
                          <td>{p.year || '—'}</td>
                          <td>{p.featured === 'yes' ? <span className="badge badge-emerald">Featured</span> : 'No'}</td>
                          <td>
                            <button type="button" className="btn-action-icon delete" onClick={() => handleDeleteProject(p._id)}>
                              🗑
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="7" className="empty-state">No projects in database.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: TEAM */}
          {activeTab === 'team' && (
            <div className="panel">
              <div className="panel-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h3 className="panel-title">Team Directory</h3>
                  <span className="badge badge-gold">{team.length} Total</span>
                </div>
                <button type="button" className="btn-gold" onClick={() => setModal('team')}>
                  + Add Team Member
                </button>
              </div>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Avatar</th>
                      <th>Full Name</th>
                      <th>Position / Title</th>
                      <th>Department</th>
                      <th>Experience</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.length > 0 ? (
                      team.map((m) => {
                        const inits = getInitials(m.name);
                        const photoUrl = toDirectImageUrl(m.photo);
                        return (
                          <tr key={m._id}>
                            <td>
                              {photoUrl ? (
                                <img
                                  src={photoUrl}
                                  alt={m.name}
                                  style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div
                                className="avatar-circle-sm"
                                style={{ display: photoUrl ? 'none' : 'flex' }}
                              >
                                {inits}
                              </div>
                            </td>
                            <td>
                              <strong>{m.name}</strong>
                              {m.profession && <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{m.profession}</div>}
                            </td>
                            <td>{m.position || '—'}</td>
                            <td><span className="badge badge-blue">{m.department || 'Team'}</span></td>
                            <td>{m.yearsexperience || '—'}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  type="button"
                                  className="btn-action-icon edit"
                                  onClick={() => {
                                    setEditingTeamMember(m);
                                    setModal('edit-team');
                                  }}
                                  title="Edit Member"
                                >
                                  ✏
                                </button>
                                <button
                                  type="button"
                                  className="btn-action-icon delete"
                                  onClick={() => handleDeleteTeam(m._id)}
                                  title="Delete Member"
                                >
                                  🗑
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr><td colSpan="6" className="empty-state">No team members yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: JOBS */}
          {activeTab === 'jobs' && (
            <div className="panel">
              <div className="panel-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h3 className="panel-title">Career Openings</h3>
                  <span className="badge badge-gold">{jobs.length} Total</span>
                </div>
                <button type="button" className="btn-gold" onClick={() => setModal('job')}>
                  + Add Job Posting
                </button>
              </div>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Job Title</th>
                      <th>Department</th>
                      <th>Location</th>
                      <th>Type</th>
                      <th>Deadline</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.length > 0 ? (
                      jobs.map((j) => (
                        <tr key={j._id}>
                          <td><strong>{j.title}</strong></td>
                          <td>{j.department || '—'}</td>
                          <td>{j.location || '—'}</td>
                          <td><span className="badge badge-gold">{j.type || 'Full-time'}</span></td>
                          <td>{j.deadline || 'Open'}</td>
                          <td>{j.isActive ? <span className="badge badge-emerald">Active</span> : 'Closed'}</td>
                          <td>
                            <button type="button" className="btn-action-icon delete" onClick={() => handleDeleteJob(j._id)}>
                              🗑
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="7" className="empty-state">No job postings yet.</td></tr>
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
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Add New Project</h3>
              <button type="button" className="modal-close" onClick={() => setModal(null)}>&times;</button>
            </div>
            <form onSubmit={handleAddProject}>
              <div className="modal-body">
                <div className="form-field">
                  <label>Project Title *</label>
                  <input type="text" name="title" className="form-input" required />
                </div>
                <div className="form-field">
                  <label>Category</label>
                  <select name="category" className="form-input">
                    <option value="commercial">Commercial</option>
                    <option value="residential">Residential</option>
                    <option value="hospitality">Hospitality</option>
                    <option value="public">Public</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Location</label>
                  <input type="text" name="location" className="form-input" placeholder="e.g. Hawassa, Ethiopia" />
                </div>
                <div className="form-field">
                  <label>Year</label>
                  <input type="text" name="year" className="form-input" placeholder="e.g. 2024" />
                </div>
                <div className="form-field">
                  <label>Image URL</label>
                  <input type="text" name="imageurl" className="form-input" placeholder="Drive URL or assets path" />
                </div>
                <div className="form-field">
                  <label>Featured in Hero?</label>
                  <select name="featured" className="form-input">
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Description</label>
                  <textarea name="description" className="form-input" rows="3"></textarea>
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

      {/* MODAL 2: ADD TEAM */}
      {modal === 'team' && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Add Team Member</h3>
              <button type="button" className="modal-close" onClick={() => setModal(null)}>&times;</button>
            </div>
            <form onSubmit={handleAddTeam}>
              <div className="modal-body">
                <div className="form-field">
                  <label>Full Name *</label>
                  <input type="text" name="name" className="form-input" required />
                </div>
                <div className="form-field">
                  <label>Position / Title</label>
                  <input type="text" name="position" className="form-input" />
                </div>
                <div className="form-field">
                  <label>Department</label>
                  <input type="text" name="department" className="form-input" />
                </div>
                <div className="form-field">
                  <label>Profession / Background</label>
                  <input type="text" name="profession" className="form-input" />
                </div>
                <div className="form-field">
                  <label>Years of Experience</label>
                  <input type="text" name="yearsexperience" className="form-input" />
                </div>
                <div className="form-field">
                  <label>Photo URL (Optional)</label>
                  <input type="text" name="photo" className="form-input" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn-gold">Save Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT TEAM */}
      {modal === 'edit-team' && editingTeamMember && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Edit Team Member</h3>
              <button type="button" className="modal-close" onClick={() => setModal(null)}>&times;</button>
            </div>
            <form onSubmit={handleEditTeam}>
              <div className="modal-body">
                <div className="form-field">
                  <label>Full Name *</label>
                  <input type="text" name="name" className="form-input" defaultValue={editingTeamMember.name} required />
                </div>
                <div className="form-field">
                  <label>Position / Title</label>
                  <input type="text" name="position" className="form-input" defaultValue={editingTeamMember.position} />
                </div>
                <div className="form-field">
                  <label>Department</label>
                  <input type="text" name="department" className="form-input" defaultValue={editingTeamMember.department} />
                </div>
                <div className="form-field">
                  <label>Profession / Background</label>
                  <input type="text" name="profession" className="form-input" defaultValue={editingTeamMember.profession} />
                </div>
                <div className="form-field">
                  <label>Years of Experience</label>
                  <input type="text" name="yearsexperience" className="form-input" defaultValue={editingTeamMember.yearsexperience} />
                </div>
                <div className="form-field">
                  <label>Photo URL (Optional)</label>
                  <input type="text" name="photo" className="form-input" defaultValue={editingTeamMember.photo} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn-gold">Update Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD JOB */}
      {modal === 'job' && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Add Job Posting</h3>
              <button type="button" className="modal-close" onClick={() => setModal(null)}>&times;</button>
            </div>
            <form onSubmit={handleAddJob}>
              <div className="modal-body">
                <div className="form-field">
                  <label>Job Title *</label>
                  <input type="text" name="title" className="form-input" required />
                </div>
                <div className="form-field">
                  <label>Department</label>
                  <input type="text" name="department" className="form-input" />
                </div>
                <div className="form-field">
                  <label>Location</label>
                  <input type="text" name="location" className="form-input" />
                </div>
                <div className="form-field">
                  <label>Employment Type</label>
                  <select name="type" className="form-input">
                    <option value="Full-time">Full-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Part-time">Part-time</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Application Deadline</label>
                  <input type="text" name="deadline" className="form-input" />
                </div>
                <div className="form-field">
                  <label>Job Description</label>
                  <textarea name="description" className="form-input" rows="3"></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn-gold">Save Job</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
