import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE, getInitials, toDirectImageUrl } from '../utils/api';
import '../admin.css';

const STORAGE_KEY = 'selam_admin_token';
const USER_KEY    = 'selam_admin_user';

const DEPARTMENTS = [
  'Architecture',
  'Structural Engineering',
  'Electrical Engineering',
  'Sanitary & Geotechnical',
  'Contract Administration & CAD',
  'Administration & Management',
];

const BLANK_MEMBER = {
  name: '', position: '', department: 'Architecture',
  profession: '', yearsexperience: '', photo: '', order: 0,
  email: '', password: '',
};

export default function SuperAdmin() {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [user,  setUser]  = useState(() => { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; } });

  /* ── Login ──────────────────────────────────────────────── */
  const [loginId, setLoginId]   = useState('admin@selam.com');
  const [loginPw, setLoginPw]   = useState('admin123');
  const [showPw,  setShowPw]    = useState(false);
  const [logging, setLogging]   = useState(false);
  const [loginErr, setLoginErr] = useState('');

  /* ── Tabs ───────────────────────────────────────────────── */
  const [tab, setTab] = useState('team');

  /* ── Team Members ───────────────────────────────────────── */
  const [team,        setTeam]        = useState([]);
  const [teamSearch,  setTeamSearch]  = useState('');
  const [deptFilter,  setDeptFilter]  = useState('all');
  const [teamModal,   setTeamModal]   = useState(null); // null | 'add' | 'edit'
  const [memberForm,  setMemberForm]  = useState(BLANK_MEMBER);
  const [showMemberPw, setShowMemberPw] = useState(false);
  const [editId,      setEditId]      = useState(null);

  /* ── Admin Accounts ─────────────────────────────────────── */
  const [accounts,      setAccounts]      = useState([]);
  const [acctSearch,    setAcctSearch]    = useState('');
  const [acctModal,     setAcctModal]     = useState(false);
  const [acctForm,      setAcctForm]      = useState({ username: '', email: '', password: '', role: 'admin' });

  /* ── Stats / Shared ─────────────────────────────────────── */
  const [stats,       setStats]       = useState({ counts: {} });
  const [refreshing,  setRefreshing]  = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [confirm,     setConfirm]     = useState(null);
  const [toast,       setToast]       = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3800);
  };

  const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });
  const safeJson = async (res) => { try { return await res.json(); } catch { return {}; } };

  // ── Load all data ─────────────────────────────────────────
  const loadData = () => {
    if (!token) return;
    setRefreshing(true);
    Promise.all([
      fetch(`${API_BASE}/api/team`)                         .then(r => safeJson(r)).then(d => Array.isArray(d) && setTeam(d)),
      fetch(`${API_BASE}/api/auth/users`, { headers: headers() }).then(r => safeJson(r)).then(d => Array.isArray(d.users) && setAccounts(d.users)),
      fetch(`${API_BASE}/api/stats`,      { headers: headers() }).then(r => safeJson(r)).then(d => d.counts && setStats(d)),
    ]).finally(() => setTimeout(() => setRefreshing(false), 400));
  };

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/auth/me`, { headers: headers() })
      .then(r => safeJson(r))
      .then(d => { if (d?.user) { setUser(d.user); localStorage.setItem(USER_KEY, JSON.stringify(d.user)); } });
    loadData();
  }, [token]);

  // ── Login ─────────────────────────────────────────────────
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
      if (data.user?.role !== 'superadmin') throw new Error('Access denied. Only the Owner can access this page.');
      localStorage.setItem(STORAGE_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setToken(data.token); setUser(data.user);
      showToast('Welcome, Super Admin!');
    } catch (err) { setLoginErr(err.message); }
    finally      { setLogging(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(USER_KEY);
    setToken(null); setUser(null);
  };

  // ── Team Member CRUD ──────────────────────────────────────
  const openAddMember = () => {
    setMemberForm(BLANK_MEMBER);
    setEditId(null);
    setShowMemberPw(false);
    setTeamModal('add');
  };

  const openEditMember = (m) => {
    setMemberForm({
      name: m.name || '', position: m.position || '',
      department: m.department || 'Architecture',
      profession: m.profession || '', yearsexperience: m.yearsexperience || '',
      photo: m.photo || '', order: m.order || 0,
      email: m.email || m.user?.email || '',
      password: '',
    });
    setEditId(m._id);
    setShowMemberPw(false);
    setTeamModal('edit');
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const isEdit = teamModal === 'edit';
      const url    = isEdit ? `${API_BASE}/api/team/${editId}` : `${API_BASE}/api/team`;
      const res    = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: headers(),
        body: JSON.stringify(memberForm),
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.error || 'Failed to save member.');
      showToast(data.message || (isEdit ? 'Member updated.' : 'Member created.'));
      setTeamModal(null);
      loadData();
    } catch (err) { showToast(err.message, 'error'); }
    finally      { setSubmitting(false); }
  };

  const deleteMember = (m) => {
    const hasLogin = m.email || m.user;
    setConfirm({
      title: 'Delete Team Member',
      message: `Delete "${m.name}"?${hasLogin ? ' Their /admin login access will also be revoked.' : ''}`,
      onConfirm: async () => {
        const res = await fetch(`${API_BASE}/api/team/${m._id}`, { method: 'DELETE', headers: headers() });
        const data = await safeJson(res);
        if (res.ok) { showToast(data.message || 'Member deleted.'); loadData(); }
        else showToast(data.error || 'Could not delete.', 'error');
      },
    });
  };

  // ── Admin Account CRUD ────────────────────────────────────
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res  = await fetch(`${API_BASE}/api/auth/users`, {
        method: 'POST', headers: headers(), body: JSON.stringify(acctForm),
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.error || 'Failed to create account.');
      showToast(`Account for ${data.user?.email} created.`);
      setAcctModal(false);
      setAcctForm({ username: '', email: '', password: '', role: 'admin' });
      loadData();
    } catch (err) { showToast(err.message, 'error'); }
    finally      { setSubmitting(false); }
  };

  const deleteAccount = (u) => {
    setConfirm({
      title: 'Revoke Login Access',
      message: `Remove "${u.username || u.email}" from admin access? They will no longer be able to log into /admin.`,
      onConfirm: async () => {
        const res = await fetch(`${API_BASE}/api/auth/users/${u._id}`, { method: 'DELETE', headers: headers() });
        const data = await safeJson(res);
        if (res.ok) { showToast(data.message || 'Account removed.'); loadData(); }
        else showToast(data.error || 'Could not remove.', 'error');
      },
    });
  };

  // ── Filtered data ─────────────────────────────────────────
  const filteredTeam = useMemo(() => {
    return team.filter(m => {
      const q   = teamSearch.toLowerCase();
      const ok  = !q || [m.name, m.position, m.department, m.profession, m.email].some(v => v?.toLowerCase().includes(q));
      const dep = deptFilter === 'all' || m.department === deptFilter;
      return ok && dep;
    });
  }, [team, teamSearch, deptFilter]);

  const uniqueDepts = useMemo(() => [...new Set(team.map(m => m.department).filter(Boolean))], [team]);

  const filteredAccounts = useMemo(() => {
    if (!acctSearch) return accounts;
    const q = acctSearch.toLowerCase();
    return accounts.filter(u => [u.username, u.email, u.role].some(v => v?.toLowerCase().includes(q)));
  }, [accounts, acctSearch]);

  // ══════════════════════════════════════════════════════════
  // LOGIN SCREEN
  // ══════════════════════════════════════════════════════════
  if (!token || user?.role !== 'superadmin') {
    return (
      <div className="login-screen">
        {toast && <ToastBar toast={toast} onClose={() => setToast(null)} />}

        <div className="login-card">
          <div className="login-logo-wrap">
            <img src="/assets/logos/logo.png" alt="Selam" className="login-logo"
              onError={e => { e.currentTarget.src = '/logo.png'; }} />
            <div>
              <div className="login-brand">Selam Consulting</div>
              <div className="login-brand-sub">Owner Super Admin</div>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <span className="owner-badge">👑 Owner Access Only</span>
          </div>

          <h1 className="login-title">Super Admin Login</h1>
          <p className="login-subtitle">Manage team members, credentials, and staff accounts</p>

          {token && user?.role !== 'superadmin' && (
            <div className="alert alert-warn" style={{ marginBottom: 16 }}>
              You are signed in as a staff member (<strong>{user.email}</strong>). Super Admin access is required.
              <br />
              <Link to="/admin" style={{ color: 'inherit', fontWeight: 600 }}>→ Go to Staff Admin Portal</Link>
            </div>
          )}

          {loginErr && <div className="alert alert-error">{loginErr}</div>}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-field">
              <label>Email or Username</label>
              <div className="input-wrap">
                <span className="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
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
              {logging ? 'Signing in…' : '👑 Sign In as Owner'}
            </button>
          </form>

          <Link to="/admin" className="link-muted" style={{ marginTop: 12, display: 'block' }}>
            Staff member? → Go to Admin Portal (/admin)
          </Link>
          <Link to="/" className="link-muted">← Return to Selam website</Link>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // OWNER DASHBOARD
  // ══════════════════════════════════════════════════════════
  return (
    <div className="admin-layout">
      {toast && <ToastBar toast={toast} onClose={() => setToast(null)} />}

      {/* ── SIDEBAR ──────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src="/assets/logos/logo.png" alt="Selam" className="sidebar-logo"
            onError={e => { e.currentTarget.src = '/logo.png'; }} />
          <div className="sidebar-brand-text">
            <div className="sidebar-brand-name">Selam Consulting</div>
            <div className="sidebar-brand-role">Owner Portal</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">Management</div>

          <button type="button" className={`nav-btn ${tab === 'team' ? 'active' : ''}`} onClick={() => setTab('team')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>Team Members</span>
            <span className="nav-count">{team.length}</span>
          </button>

          <button type="button" className={`nav-btn ${tab === 'accounts' ? 'active' : ''}`} onClick={() => setTab('accounts')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>Admin Accounts</span>
            <span className="nav-count">{accounts.length}</span>
          </button>

          <div className="sidebar-section" style={{ marginTop: 8 }}>Shortcuts</div>

          <Link to="/admin" className="nav-btn" style={{ textDecoration: 'none' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            <span>Staff Admin Portal</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-light)' }}>↗</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar" style={{ background: '#92400e' }}>{getInitials(user?.username || user?.email)}</div>
            <div className="user-info">
              <div className="user-email">{user?.email}</div>
              <div className="user-role-tag">👑 Super Admin</div>
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
          <span className="topbar-title">
            {tab === 'team' ? 'Team Members Management' : 'Admin Accounts'}
          </span>
          <div className="topbar-right">
            <span className="status-dot"><span className="dot" />Connected</span>
            <button className="btn-secondary" onClick={loadData} disabled={refreshing}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ transition: 'transform .6s', transform: refreshing ? 'rotate(360deg)' : 'none' }}>
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
              Refresh
            </button>
          </div>
        </header>

        <div className="content-area">
          {/* ── STATS ──────────────────────────────────────── */}
          <div className="stats-grid">
            <div className={`stat-card ${tab === 'team' ? 'active' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setTab('team')}>
              <div className="stat-icon blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div><div className="stat-value">{team.length}</div><div className="stat-label">Team Members</div></div>
            </div>

            <div className={`stat-card ${tab === 'accounts' ? 'active' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setTab('accounts')}>
              <div className="stat-icon gold">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div><div className="stat-value">{accounts.length}</div><div className="stat-label">Staff Login Accounts</div></div>
            </div>

            <div className="stat-card">
              <div className="stat-icon teal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 20h20"/><path d="M5 20V8.2c0-.7.6-1.2 1.3-1.2h11.4c.7 0 1.3.5 1.3 1.2V20"/>
                </svg>
              </div>
              <div><div className="stat-value">{stats.counts?.projects || 0}</div><div className="stat-label">Portfolio Projects</div></div>
            </div>

            <div className="stat-card">
              <div className="stat-icon grey">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </div>
              <div><div className="stat-value">{stats.counts?.submissions || 0}</div><div className="stat-label">Client Inquiries</div></div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════ */}
          {/* TAB: TEAM MEMBERS                               */}
          {/* ════════════════════════════════════════════════ */}
          {tab === 'team' && (
            <>
              <div className="info-banner">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>
                  Create, edit, or delete team members here. You can optionally give each member an <strong>email and password</strong> so they can log into the <strong>Staff Admin Portal (/admin)</strong>. Deleting a member also revokes their login access.
                </span>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">
                    Team Directory <span className="badge badge-blue" style={{ marginLeft: 8 }}>{filteredTeam.length} members</span>
                  </span>
                  <div className="panel-actions">
                    <select className="search-input" style={{ width: 'auto' }} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
                      <option value="all">All Departments</option>
                      {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <input className="search-input" placeholder="Search name, role, email…"
                      value={teamSearch} onChange={e => setTeamSearch(e.target.value)} />
                    <button className="btn-accent" onClick={openAddMember}>+ Add Member</button>
                  </div>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Position &amp; Department</th>
                        <th>Profession</th>
                        <th>Experience</th>
                        <th>Login Access (/admin)</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTeam.length > 0 ? filteredTeam.map(m => {
                        const loginEmail = m.email || m.user?.email;
                        const photoUrl   = toDirectImageUrl(m.photo);
                        return (
                          <tr key={m._id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                  width: 36, height: 36, borderRadius: 8,
                                  background: 'var(--primary-light)', color: 'var(--primary)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontWeight: 700, fontSize: '0.8rem', flexShrink: 0, overflow: 'hidden',
                                  border: '1px solid var(--border)',
                                }}>
                                  {photoUrl
                                    ? <img src={photoUrl} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.style.display = 'none'; }} />
                                    : getInitials(m.name)
                                  }
                                </div>
                                <strong>{m.name}</strong>
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 500 }}>{m.position || '—'}</div>
                              <span className="badge badge-grey" style={{ marginTop: 3 }}>{m.department}</span>
                            </td>
                            <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{m.profession || '—'}</td>
                            <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{m.yearsexperience || '—'}</td>
                            <td>
                              {loginEmail
                                ? <div>
                                    <span className="badge badge-teal" style={{ marginBottom: 4 }}>✓ Can Login</span>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{loginEmail}</div>
                                  </div>
                                : <span className="badge badge-grey">No Login</span>
                              }
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button type="button" className="btn-icon edit" title="Edit" onClick={() => openEditMember(m)}>✏</button>
                                <button type="button" className="btn-icon danger" title="Delete" onClick={() => deleteMember(m)}>🗑</button>
                              </div>
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr className="empty-row"><td colSpan="6">No team members found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ════════════════════════════════════════════════ */}
          {/* TAB: ADMIN ACCOUNTS                             */}
          {/* ════════════════════════════════════════════════ */}
          {tab === 'accounts' && (
            <>
              <div className="info-banner">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>
                  All accounts that have login access to <strong>/admin</strong>. You can create standalone accounts here, or give team members login access from the Team Members tab.
                </span>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">
                    Staff Login Accounts <span className="badge badge-gold" style={{ marginLeft: 8 }}>{filteredAccounts.length}</span>
                  </span>
                  <div className="panel-actions">
                    <input className="search-input" placeholder="Search accounts…"
                      value={acctSearch} onChange={e => setAcctSearch(e.target.value)} />
                    <button className="btn-accent" onClick={() => { setAcctForm({ username: '', email: '', password: '', role: 'admin' }); setAcctModal(true); }}>
                      + Create Account
                    </button>
                  </div>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Username</th><th>Email</th><th>Role</th><th>Created</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {filteredAccounts.length > 0 ? filteredAccounts.map(u => {
                        const isSelf  = u._id === user?.id || u._id === user?._id || u.email === user?.email;
                        const isOwner = u.role === 'superadmin';
                        return (
                          <tr key={u._id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div className="user-avatar" style={{ width: 30, height: 30, fontSize: '0.72rem', background: isOwner ? '#92400e' : 'var(--primary)' }}>
                                  {getInitials(u.username || u.email)}
                                </div>
                                <strong>{u.username}</strong>
                                {isSelf && <span className="badge badge-gold">You</span>}
                              </div>
                            </td>
                            <td><a href={`mailto:${u.email}`} style={{ color: 'var(--primary)' }}>{u.email}</a></td>
                            <td>
                              {isOwner
                                ? <span className="badge badge-gold">👑 Super Admin</span>
                                : <span className="badge badge-blue">Staff Admin</span>
                              }
                            </td>
                            <td style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                            </td>
                            <td>
                              {isSelf
                                ? <span className="badge badge-teal">Active (You)</span>
                                : <button type="button" className="btn-icon danger" title="Revoke" onClick={() => deleteAccount(u)}>🗑</button>
                              }
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr className="empty-row"><td colSpan="5">No accounts found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* ── TEAM MEMBER ADD / EDIT MODAL ─────────────────── */}
      {(teamModal === 'add' || teamModal === 'edit') && (
        <div className="modal-backdrop" onClick={() => setTeamModal(null)}>
          <div className="modal wide" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-title">{teamModal === 'add' ? 'Add Team Member' : `Edit: ${memberForm.name}`}</span>
              <button className="modal-close" onClick={() => setTeamModal(null)}>×</button>
            </div>
            <form onSubmit={handleSaveMember}>
              <div className="modal-body">
                <div className="form-field">
                  <label>Full Name *</label>
                  <input type="text" className="form-input" required placeholder="e.g. Alemu Tamiru"
                    value={memberForm.name} onChange={e => setMemberForm({ ...memberForm, name: e.target.value })} />
                </div>

                <div className="form-grid">
                  <div className="form-field">
                    <label>Position / Role</label>
                    <input type="text" className="form-input" placeholder="e.g. Lead Architect"
                      value={memberForm.position} onChange={e => setMemberForm({ ...memberForm, position: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label>Department</label>
                    <select className="form-input" value={memberForm.department} onChange={e => setMemberForm({ ...memberForm, department: e.target.value })}>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-field">
                    <label>Profession</label>
                    <input type="text" className="form-input" placeholder="e.g. Practicing Architect"
                      value={memberForm.profession} onChange={e => setMemberForm({ ...memberForm, profession: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label>Years of Experience</label>
                    <input type="text" className="form-input" placeholder="e.g. 8 years"
                      value={memberForm.yearsexperience} onChange={e => setMemberForm({ ...memberForm, yearsexperience: e.target.value })} />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-field">
                    <label>Photo URL (optional)</label>
                    <input type="text" className="form-input" placeholder="https://… or /assets/…"
                      value={memberForm.photo} onChange={e => setMemberForm({ ...memberForm, photo: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label>Sort Order</label>
                    <input type="number" className="form-input" placeholder="0"
                      value={memberForm.order} onChange={e => setMemberForm({ ...memberForm, order: Number(e.target.value) })} />
                  </div>
                </div>

                {/* Login credentials box */}
                <div className="cred-box">
                  <div className="cred-box-title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    Staff Admin Portal Login (/admin)
                  </div>
                  <p className="cred-box-hint">
                    Give this person an email and password to let them log into <strong>/admin</strong> as a staff member.
                    {teamModal === 'edit' && ' Leave password blank to keep the existing one.'}
                  </p>
                  <div className="form-field">
                    <label>Login Email</label>
                    <input type="email" className="form-input" placeholder="e.g. alemu@selam.com"
                      value={memberForm.email} onChange={e => setMemberForm({ ...memberForm, email: e.target.value })} />
                  </div>
                  <div className="form-field" style={{ marginBottom: 0 }}>
                    <label>{teamModal === 'edit' ? 'New Password (leave blank to keep current)' : 'Password (min. 6 characters)'}</label>
                    <div className="input-wrap">
                      <input type={showMemberPw ? 'text' : 'password'} className="form-input"
                        placeholder={teamModal === 'edit' ? '••••••  (leave blank to keep)' : 'Set login password…'}
                        value={memberForm.password} onChange={e => setMemberForm({ ...memberForm, password: e.target.value })} />
                      <button type="button" className="input-toggle-btn" onClick={() => setShowMemberPw(!showMemberPw)}>
                        {showMemberPw ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn-secondary" onClick={() => setTeamModal(null)}>Cancel</button>
                <button type="submit" className="btn-accent" disabled={submitting}>
                  {submitting ? 'Saving…' : teamModal === 'add' ? 'Create Member' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CREATE ACCOUNT MODAL ─────────────────────────── */}
      {acctModal && (
        <div className="modal-backdrop" onClick={() => setAcctModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-title">Create Admin Account</span>
              <button className="modal-close" onClick={() => setAcctModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateAccount}>
              <div className="modal-body">
                <div className="form-field">
                  <label>Username / Display Name *</label>
                  <input type="text" className="form-input" required placeholder="e.g. daniel_engineer"
                    value={acctForm.username} onChange={e => setAcctForm({ ...acctForm, username: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>Email Address *</label>
                  <input type="email" className="form-input" required placeholder="e.g. daniel@selam.com"
                    value={acctForm.email} onChange={e => setAcctForm({ ...acctForm, email: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>Password * (min. 6 characters)</label>
                  <input type="password" className="form-input" required minLength={6} placeholder="Secure password"
                    value={acctForm.password} onChange={e => setAcctForm({ ...acctForm, password: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>Role</label>
                  <select className="form-input" value={acctForm.role} onChange={e => setAcctForm({ ...acctForm, role: e.target.value })}>
                    <option value="admin">Staff Admin — Standard access</option>
                    <option value="superadmin">Super Admin — Full owner access</option>
                  </select>
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn-secondary" onClick={() => setAcctModal(false)}>Cancel</button>
                <button type="submit" className="btn-accent" disabled={submitting}>
                  {submitting ? 'Creating…' : 'Create Account'}
                </button>
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
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
