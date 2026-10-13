import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE, getInitials, toDirectImageUrl } from '../utils/api';
import '../admin.css';

const STORAGE_KEY = 'selam_admin_token';
const USER_KEY = 'selam_admin_user';

const DEPARTMENTS = [
  'Architecture',
  'Structural Engineering',
  'Electrical Engineering',
  'Sanitary & Geotechnical',
  'Contract Administration & CAD',
  'Administration & Management',
  'Executive Office',
];

const INITIAL_MEMBER_FORM = {
  name: '',
  position: '',
  department: 'Architecture',
  profession: '',
  yearsexperience: '',
  photo: '',
  order: 0,
  email: '',
  password: '',
};

export default function SuperAdmin() {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      return null;
    }
  });

  // Tab navigation: 'team' | 'accounts'
  const [activeTab, setActiveTab] = useState('team');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('admin@selam.com');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Team Members data state
  const [team, setTeam] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [teamSearch, setTeamSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');

  // Team Member Modals
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [teamFormData, setTeamFormData] = useState(INITIAL_MEMBER_FORM);
  const [showMemberPassword, setShowMemberPassword] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Standalone Admin Accounts state
  const [adminUsers, setAdminUsers] = useState([]);
  const [accountSearch, setAccountSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [newAccountUsername, setNewAccountUsername] = useState('');
  const [newAccountEmail, setNewAccountEmail] = useState('');
  const [newAccountPassword, setNewAccountPassword] = useState('');
  const [newAccountRole, setNewAccountRole] = useState('admin');

  // Statistics
  const [stats, setStats] = useState({ counts: {} });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Confirmation dialog & Toast
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  };

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  });

  // Load team, users, and stats
  const loadData = () => {
    if (!token) return;
    setIsRefreshing(true);
    setLoadingTeam(true);
    setLoadingUsers(true);

    Promise.all([
      fetch(`${API_BASE}/api/team`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setTeam(data);
        })
        .catch(() => {}),

      fetch(`${API_BASE}/api/auth/users`, { headers: authHeaders() })
        .then((res) => {
          if (!res.ok) throw new Error('Forbidden');
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data.users)) setAdminUsers(data.users);
        })
        .catch(() => {}),

      fetch(`${API_BASE}/api/stats`, { headers: authHeaders() })
        .then((res) => res.json())
        .then((d) => d.counts && setStats(d))
        .catch(() => {}),
    ]).finally(() => {
      setLoadingTeam(false);
      setLoadingUsers(false);
      setTimeout(() => setIsRefreshing(false), 400);
    });
  };

  // Sync session on mount / token change
  useEffect(() => {
    if (token) {
      fetch(`${API_BASE}/api/auth/me`, { headers: authHeaders() })
        .then((res) => res.json())
        .then((d) => {
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
    setLoginError('');

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: loginEmail, password: loginPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed.');
      }

      if (data.user.role !== 'superadmin') {
        throw new Error('Access denied: Only the Owner / Super Admin can access this vault. Staff members please sign in at /admin.');
      }

      localStorage.setItem(STORAGE_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      showToast('Welcome back, Super Admin!', 'success');
    } catch (err) {
      setLoginError(err.message || 'Connection error.');
      showToast(err.message || 'Login error.', 'error');
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
    showToast('Signed out safely from Super Admin Vault.', 'success');
  };

  // ─── TEAM MEMBER ACTIONS ───────────────────────────────────────────

  // Open Create Member Modal
  const openCreateTeamModal = () => {
    setTeamFormData(INITIAL_MEMBER_FORM);
    setShowMemberPassword(false);
    setIsTeamModalOpen(true);
  };

  // Create Team Member
  const handleCreateTeamMember = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/api/team`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(teamFormData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create team member.');
      }

      showToast(data.message || 'Team member and login credentials created!', 'success');
      setIsTeamModalOpen(false);
      setTeamFormData(INITIAL_MEMBER_FORM);
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Open Edit Member Modal
  const openEditTeamModal = (m) => {
    setEditingMember({
      _id: m._id,
      name: m.name || '',
      position: m.position || '',
      department: m.department || 'Architecture',
      profession: m.profession || '',
      yearsexperience: m.yearsexperience || '',
      photo: m.photo || '',
      order: m.order || 0,
      email: m.email || (m.user && m.user.email) || '',
      password: '', // blank by default (only filled if resetting password)
    });
    setShowMemberPassword(false);
  };

  // Save Edit Team Member
  const handleUpdateTeamMember = async (e) => {
    e.preventDefault();
    if (!editingMember) return;
    setFormSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/api/team/${editingMember._id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(editingMember),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update team member.');
      }

      showToast(data.message || 'Team member updated successfully!', 'success');
      setEditingMember(null);
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Team Member
  const handleDeleteTeamMember = (m) => {
    const hasLogin = m.email || m.user;
    setConfirmDialog({
      title: 'Remove Team Member',
      message: `Are you sure you want to delete "${m.name}"? ${
        hasLogin
          ? `Their login access for (${m.email || m.user?.email || 'admin'}) will also be immediately revoked.`
          : 'They will be removed from the public website showcase.'
      }`,
      confirmText: 'Yes, Delete & Revoke',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE}/api/team/${m._id}`, {
            method: 'DELETE',
            headers: authHeaders(),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to delete team member.');

          showToast(data.message || 'Team member removed.', 'success');
          loadData();
        } catch (err) {
          showToast(err.message, 'error');
        }
      },
    });
  };

  // ─── ADMIN ACCOUNTS ACTIONS ────────────────────────────────────────

  // Create Standalone Admin Account
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/users`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          username: newAccountUsername,
          email: newAccountEmail,
          password: newAccountPassword,
          role: newAccountRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create account.');

      showToast(`Admin account for ${data.user.email} created!`, 'success');
      setIsAccountModalOpen(false);
      setNewAccountUsername('');
      setNewAccountEmail('');
      setNewAccountPassword('');
      setNewAccountRole('admin');
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Standalone Admin Account
  const handleDeleteAccount = (u) => {
    setConfirmDialog({
      title: 'Revoke Admin Login Access',
      message: `Are you sure you want to revoke login access for "${u.username || u.email}"? They will no longer be able to log in at /admin.`,
      confirmText: 'Yes, Revoke Access',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE}/api/auth/users/${u._id}`, {
            method: 'DELETE',
            headers: authHeaders(),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to revoke access.');

          showToast(data.message || 'Account revoked.', 'success');
          loadData();
        } catch (err) {
          showToast(err.message, 'error');
        }
      },
    });
  };

  // Copy helper
  const copyToClipboard = (text, label = 'email') => {
    navigator.clipboard?.writeText(text);
    showToast(`Copied ${label} to clipboard!`, 'success');
  };

  // Filtered Team Members
  const filteredTeam = useMemo(() => {
    return team.filter((m) => {
      const q = teamSearch.toLowerCase();
      const matchSearch =
        !q ||
        (m.name && m.name.toLowerCase().includes(q)) ||
        (m.position && m.position.toLowerCase().includes(q)) ||
        (m.department && m.department.toLowerCase().includes(q)) ||
        (m.profession && m.profession.toLowerCase().includes(q)) ||
        (m.email && m.email.toLowerCase().includes(q));

      const matchDept = deptFilter === 'all' || m.department === deptFilter;
      return matchSearch && matchDept;
    });
  }, [team, teamSearch, deptFilter]);

  // Unique departments for filter dropdown
  const uniqueDepartments = useMemo(() => {
    const set = new Set(team.map((m) => m.department).filter(Boolean));
    return Array.from(set);
  }, [team]);

  // Filtered Admin Accounts
  const filteredAccounts = useMemo(() => {
    if (!accountSearch) return adminUsers;
    const q = accountSearch.toLowerCase();
    return adminUsers.filter(
      (u) =>
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.role && u.role.toLowerCase().includes(q))
    );
  }, [adminUsers, accountSearch]);

  // ─────────────────────────────────────────────────────────────
  // 1. LOGIN GATE: NOT LOGGED IN OR NOT SUPER ADMIN
  // ─────────────────────────────────────────────────────────────
  if (!token || user?.role !== 'superadmin') {
    return (
      <div className="login-screen">
        <div className="ambient-glow-orb glow-orb-gold"></div>
        <div className="ambient-glow-orb glow-orb-blue"></div>

        {toast && (
          <div className="toast-container">
            <div className={`toast-card toast-${toast.type}`}>
              <div className="toast-icon">
                {toast.type === 'success' ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                )}
              </div>
              <div className="toast-content">
                <span className="toast-title">{toast.type === 'success' ? 'Success' : 'Notice'}</span>
                <p className="toast-message">{toast.message}</p>
              </div>
            </div>
          </div>
        )}

        <div
          className="login-card"
          style={{
            border: '1px solid rgba(212, 175, 55, 0.45)',
            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.85), 0 0 60px rgba(212, 175, 55, 0.2)',
          }}
        >
          <div
            className="login-header-emblem"
            style={{ background: 'radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, rgba(13, 18, 30, 0.95) 80%)' }}
          >
            <span style={{ fontSize: '2.2rem', filter: 'drop-shadow(0 0 12px rgba(212, 175, 55, 0.6))' }}>👑</span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 14px',
              borderRadius: '9999px',
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              color: 'var(--accent-gold-light)',
              fontSize: '0.74rem',
              fontWeight: '800',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '14px',
            }}
          >
            <span className="status-pulse-dot" style={{ backgroundColor: '#d4af37' }}></span>
            Root Owner Access
          </div>

          <h1 className="login-title" style={{ fontSize: '1.7rem' }}>Super Admin Vault</h1>
          <p className="login-subtitle">
            System Ownership &amp; Team Member Governance
          </p>

          {loginError && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '10px',
                padding: '13px 16px',
                marginBottom: '20px',
                color: '#f87171',
                fontSize: '0.86rem',
                textAlign: 'left',
                lineHeight: 1.5,
              }}
            >
              {loginError}
            </div>
          )}

          {token && user?.role !== 'superadmin' && (
            <div
              style={{
                background: 'rgba(234, 179, 8, 0.12)',
                border: '1px solid rgba(234, 179, 8, 0.35)',
                borderRadius: '10px',
                padding: '14px 16px',
                marginBottom: '20px',
                color: '#facc15',
                fontSize: '0.86rem',
                textAlign: 'left',
              }}
            >
              You are signed in as a standard Staff Member (<strong>{user.email}</strong>). Super Admin authorization is required to access this vault.
              <div style={{ marginTop: '12px' }}>
                <Link to="/admin" className="btn-secondary" style={{ display: 'inline-flex', padding: '7px 14px', fontSize: '0.82rem' }}>
                  Open Staff Admin Portal →
                </Link>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-field">
              <label>Owner Email or Username</label>
              <div className="input-with-icon-wrapper">
                <span className="input-icon-prefix">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
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
              <label>Owner Security Key</label>
              <div className="input-with-icon-wrapper">
                <span className="input-icon-prefix">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
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
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn-primary" disabled={loginLoading}>
              {loginLoading ? (
                <>
                  <span className="status-pulse-dot" style={{ backgroundColor: '#080b11' }}></span>
                  <span>Verifying Clearance...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Super Admin 👑</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Autofill */}
          <div className="demo-fill-pill">
            <div>
              <span>Owner Auth: </span>
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

          <div
            style={{
              marginTop: '24px',
              paddingTop: '18px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <Link to="/admin" style={{ color: 'var(--accent-gold)', fontSize: '0.84rem', textDecoration: 'none', fontWeight: '600' }}>
              Staff Team Member? Go to Admin Portal (/admin) →
            </Link>
            <Link to="/" style={{ color: 'var(--text-dim)', fontSize: '0.8rem', textDecoration: 'none' }}>
              ← Return to Selam Consulting Live Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. LOGGED IN SUPER ADMIN DASHBOARD
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="admin-layout">
      {toast && (
        <div className="toast-container">
          <div className={`toast-card toast-${toast.type}`}>
            <div className="toast-icon">
              {toast.type === 'success' ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              )}
            </div>
            <div className="toast-content">
              <span className="toast-title">{toast.type === 'success' ? 'Success' : 'Notice'}</span>
              <p className="toast-message">{toast.message}</p>
            </div>
            <button type="button" className="toast-close-btn" onClick={() => setToast(null)}>
              &times;
            </button>
          </div>
        </div>
      )}

      {/* SUPER ADMIN SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <img
            src="/assets/logos/logo.png"
            alt="Selam Logo"
            className="sidebar-logo"
            onError={(e) => {
              e.currentTarget.src = '/logo.png';
            }}
          />
          <div>
            <div className="sidebar-brand-title">SELAM CONSULTING</div>
            <div className="sidebar-brand-sub" style={{ color: 'var(--accent-gold-light)', fontWeight: '800' }}>
              👑 OWNER VAULT
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-header">TEAM &amp; ACCESS CONTROL</div>

          {/* TEAM MEMBERS TAB (Primary requested page) */}
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>Team Members</span>
            <span
              className="sidebar-count-chip"
              style={activeTab === 'team' ? { background: '#080b11', color: 'var(--accent-gold)' } : {}}
            >
              {team.length}
            </span>
          </button>

          {/* ADMIN ACCOUNTS TAB */}
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'accounts' ? 'active' : ''}`}
            onClick={() => setActiveTab('accounts')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <span>Admin Accounts</span>
            <span
              className="sidebar-count-chip"
              style={activeTab === 'accounts' ? { background: '#080b11', color: 'var(--accent-gold)' } : {}}
            >
              {adminUsers.length}
            </span>
          </button>

          <div className="sidebar-section-header" style={{ marginTop: '16px' }}>
            OPERATIONAL SHORTCUTS
          </div>

          <Link to="/admin" className="nav-tab-btn" style={{ textDecoration: 'none' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="20" height="16" x="2" y="4" rx="2"></rect>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
            </svg>
            <span>Staff Admin Portal</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-dim)' }}>↗</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div
            className="user-profile-badge"
            style={{ borderColor: 'rgba(212, 175, 55, 0.35)', background: 'rgba(212, 175, 55, 0.06)' }}
          >
            <div
              className="user-avatar"
              style={{ border: '2px solid var(--accent-gold-light)', boxShadow: '0 0 16px rgba(212,175,55,0.45)' }}
            >
              {getInitials(user?.username || user?.email || 'Owner')}
            </div>
            <div className="user-info-text">
              <div className="user-name">{user?.email}</div>
              <div className="user-role" style={{ color: 'var(--accent-gold-light)', fontWeight: '800' }}>
                👑 Super Admin (Owner)
              </div>
            </div>
          </div>

          <Link
            to="/admin"
            className="btn-sidebar-action"
            style={{
              background: 'rgba(212, 175, 55, 0.08)',
              borderColor: 'rgba(212, 175, 55, 0.28)',
              color: 'var(--accent-gold-light)',
            }}
          >
            Switch to Staff Admin (/admin)
          </Link>

          <Link to="/" className="btn-sidebar-action">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
            </svg>
            View Live Website
          </Link>

          <button type="button" className="btn-sidebar-action btn-sidebar-logout" onClick={handleLogout}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* SUPER ADMIN MAIN CONTENT */}
      <main className="admin-main">
        {/* TOPBAR */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <div className="topbar-breadcrumbs">
              <span>Owner Vault</span>
              <span>/</span>
              <span className="active">
                {activeTab === 'team' ? 'Team Members Management' : 'Admin Accounts Governance'}
              </span>
            </div>
          </div>

          <div className="topbar-actions">
            <div
              className="status-indicator-pill"
              style={{
                background: 'rgba(212, 175, 55, 0.1)',
                borderColor: 'rgba(212, 175, 55, 0.35)',
                color: 'var(--accent-gold-light)',
              }}
            >
              <span className="status-pulse-dot" style={{ backgroundColor: '#d4af37' }}></span>
              <span>Root Clearance Active</span>
            </div>

            <button type="button" className="btn-secondary" onClick={loadData} disabled={isRefreshing}>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{
                  transform: isRefreshing ? 'rotate(360deg)' : 'none',
                  transition: 'transform 0.6s ease',
                }}
              >
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
              </svg>
              <span>{isRefreshing ? 'Syncing...' : 'Sync Data'}</span>
            </button>
          </div>
        </header>

        <div className="admin-content">
          {/* STATS OVERVIEW CARDS */}
          <div className="stats-grid">
            <div
              className={`stat-card ${activeTab === 'team' ? 'superadmin-stat-card-gold' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setActiveTab('team')}
            >
              <div className="stat-icon gold">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div>
                <div className="stat-value">{team.length}</div>
                <div className="stat-label">Total Team Members</div>
              </div>
            </div>

            <div
              className={`stat-card ${activeTab === 'accounts' ? 'superadmin-stat-card-gold' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setActiveTab('accounts')}
            >
              <div className="stat-icon blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <div>
                <div className="stat-value">{adminUsers.length}</div>
                <div className="stat-label">Active Staff Logins</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon emerald">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 20h20"></path>
                  <path d="M5 20V8.2c0-.7.6-1.2 1.3-1.2h11.4c.7 0 1.3.5 1.3 1.2V20"></path>
                </svg>
              </div>
              <div>
                <div className="stat-value">{stats.counts?.projects || 0}</div>
                <div className="stat-label">Portfolio Projects</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon purple">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
              </div>
              <div>
                <div className="stat-value">{stats.counts?.submissions || 0}</div>
                <div className="stat-label">Client Enquiries</div>
              </div>
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB 1: TEAM MEMBERS MANAGEMENT (PAGE REQUESTED BY USER) */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeTab === 'team' && (
            <>
              {/* SUPER ADMIN GUIDANCE BANNER */}
              <div className="superadmin-banner">
                <div className="superadmin-banner-icon">👥</div>
                <div>
                  <h4>Team Directory &amp; Staff Login Provisioning</h4>
                  <p>
                    Here you can <strong>create, edit, and delete team members</strong>. When adding or editing a member, you can assign them an <strong>Email and Password</strong>. They can immediately use those credentials to sign in at the <strong>Staff Admin Portal (/admin)</strong> to manage projects, inquiries, and careers. Deleting a member also revokes their login access.
                  </p>
                </div>
              </div>

              {/* TEAM MEMBERS TABLE PANEL */}
              <div className="panel">
                <div className="panel-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h3 className="panel-title">Team Members Directory</h3>
                    <span className="badge badge-gold">{filteredTeam.length} Members</span>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Department Filter */}
                    <select
                      className="form-input"
                      style={{ width: 'auto', padding: '8px 14px', fontSize: '0.84rem' }}
                      value={deptFilter}
                      onChange={(e) => setDeptFilter(e.target.value)}
                    >
                      <option value="all">All Departments ({team.length})</option>
                      {uniqueDepartments.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>

                    {/* Search Input */}
                    <input
                      type="text"
                      className="table-search-input"
                      placeholder="Search by name, role, email..."
                      value={teamSearch}
                      onChange={(e) => setTeamSearch(e.target.value)}
                    />

                    {/* + Add Team Member Button */}
                    <button type="button" className="btn-gold" onClick={openCreateTeamModal}>
                      + Add Team Member
                    </button>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Member Name &amp; Photo</th>
                        <th>Position &amp; Department</th>
                        <th>Profession &amp; Exp.</th>
                        <th>Staff Login Credentials (/admin)</th>
                        <th>Order</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTeam.length > 0 ? (
                        filteredTeam.map((m) => {
                          const photoUrl = toDirectImageUrl(m.photo);
                          const loginEmail = m.email || (m.user && m.user.email);

                          return (
                            <tr key={m._id || m.name}>
                              {/* Member info */}
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                  <div
                                    className="avatar-circle-sm"
                                    style={{
                                      width: '42px',
                                      height: '42px',
                                      borderRadius: '12px',
                                      overflow: 'hidden',
                                      border: '1px solid rgba(212, 175, 55, 0.35)',
                                    }}
                                  >
                                    {photoUrl ? (
                                      <img
                                        src={photoUrl}
                                        alt={m.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                    ) : (
                                      getInitials(m.name)
                                    )}
                                  </div>
                                  <div>
                                    <strong style={{ fontSize: '0.94rem', display: 'block', color: 'var(--text-main)' }}>
                                      {m.name}
                                    </strong>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                                      {m.department || 'Team'}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Position & Department */}
                              <td>
                                <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.88rem' }}>
                                  {m.position || 'Specialist'}
                                </div>
                                <span
                                  className="badge badge-blue"
                                  style={{ marginTop: '4px', fontSize: '0.7rem', padding: '2px 8px' }}
                                >
                                  {m.department || 'General'}
                                </span>
                              </td>

                              {/* Profession & Experience */}
                              <td>
                                <div style={{ fontSize: '0.86rem', color: 'var(--text-main)' }}>
                                  {m.profession || 'Consultant'}
                                </div>
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                  {m.yearsexperience ? `${m.yearsexperience} exp.` : '—'}
                                </span>
                              </td>

                              {/* Login Access Credentials */}
                              <td>
                                {loginEmail ? (
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span className="badge badge-emerald" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>
                                        <span className="status-pulse-dot" style={{ backgroundColor: '#10b981', width: '6px', height: '6px' }}></span>
                                        Can Login
                                      </span>
                                      <button
                                        type="button"
                                        className="btn-action-icon"
                                        style={{ width: '24px', height: '24px', fontSize: '0.7rem' }}
                                        title="Copy Login Email"
                                        onClick={() => copyToClipboard(loginEmail, 'login email')}
                                      >
                                        📋
                                      </button>
                                    </div>
                                    <div
                                      style={{
                                        fontFamily: 'monospace',
                                        fontSize: '0.82rem',
                                        color: 'var(--accent-gold-light)',
                                        marginTop: '4px',
                                      }}
                                    >
                                      {loginEmail}
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <span
                                      className="badge"
                                      style={{
                                        background: 'rgba(255,255,255,0.06)',
                                        color: 'var(--text-dim)',
                                        fontSize: '0.7rem',
                                        padding: '3px 8px',
                                      }}
                                    >
                                      Showcase Only
                                    </span>
                                    <span
                                      style={{
                                        display: 'block',
                                        fontSize: '0.74rem',
                                        color: 'var(--text-dim)',
                                        marginTop: '3px',
                                      }}
                                    >
                                      No /admin login
                                    </span>
                                  </div>
                                )}
                              </td>

                              {/* Order */}
                              <td style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                                #{m.order || 0}
                              </td>

                              {/* Action Buttons */}
                              <td>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button
                                    type="button"
                                    className="btn-action-icon"
                                    title="Edit Team Member & Credentials"
                                    onClick={() => openEditTeamModal(m)}
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-action-icon delete"
                                    title="Delete Member & Revoke Login"
                                    onClick={() => handleDeleteTeamMember(m)}
                                  >
                                    🗑
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="6" className="empty-state">
                            <div className="empty-state-icon">👥</div>
                            <p>{loadingTeam ? 'Loading team members...' : 'No team members match your criteria.'}</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB 2: SYSTEM ADMIN ACCOUNTS GOVERNANCE */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeTab === 'accounts' && (
            <>
              <div className="superadmin-banner">
                <div className="superadmin-banner-icon">🛡️</div>
                <div>
                  <h4>Staff Clearance Accounts</h4>
                  <p>
                    Below is the complete list of system accounts with permission to log in to <strong>/admin</strong>. You can create direct staff accounts here or revoke access for any user at any time.
                  </p>
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h3 className="panel-title">System Admin Accounts</h3>
                    <span className="badge badge-gold">{filteredAccounts.length} Active Logins</span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="table-search-input"
                      placeholder="Search admin accounts..."
                      value={accountSearch}
                      onChange={(e) => setAccountSearch(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn-gold"
                      onClick={() => {
                        setNewAccountUsername('');
                        setNewAccountEmail('');
                        setNewAccountPassword('');
                        setNewAccountRole('admin');
                        setIsAccountModalOpen(true);
                      }}
                    >
                      + Create Admin Account
                    </button>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Account Holder</th>
                        <th>Login Email</th>
                        <th>Clearance Role</th>
                        <th>Created On</th>
                        <th>Access Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAccounts.length > 0 ? (
                        filteredAccounts.map((u) => {
                          const isSelf = u._id === user?.id || u._id === user?._id || u.email === user?.email;
                          const isSuper = u.role === 'superadmin';
                          return (
                            <tr key={u._id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div
                                    className="avatar-circle-sm"
                                    style={
                                      isSuper
                                        ? {
                                            borderColor: 'rgba(212, 175, 55, 0.7)',
                                            background:
                                              'linear-gradient(135deg, rgba(212,175,55,0.3), rgba(245,215,127,0.15))',
                                          }
                                        : {}
                                    }
                                  >
                                    {getInitials(u.username || u.email)}
                                  </div>
                                  <div>
                                    <strong style={{ fontSize: '0.92rem' }}>{u.username}</strong>
                                    {isSelf && (
                                      <span className="badge badge-gold" style={{ marginLeft: '8px', fontSize: '0.65rem' }}>
                                        You (Owner)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <a href={`mailto:${u.email}`} style={{ color: 'var(--accent-gold)', textDecoration: 'none' }}>
                                    {u.email}
                                  </a>
                                  <button
                                    type="button"
                                    className="btn-action-icon"
                                    style={{ width: '26px', height: '26px', fontSize: '0.72rem' }}
                                    title="Copy Email"
                                    onClick={() => copyToClipboard(u.email)}
                                  >
                                    📋
                                  </button>
                                </div>
                              </td>
                              <td>
                                {isSuper ? (
                                  <span className="badge badge-gold">👑 Super Admin</span>
                                ) : (
                                  <span className="badge badge-blue">Team Member (Admin)</span>
                                )}
                              </td>
                              <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Initial Setup'}</td>
                              <td>
                                {isSelf ? (
                                  <span className="badge badge-emerald">Active Owner</span>
                                ) : (
                                  <button
                                    type="button"
                                    className="btn-action-icon delete"
                                    title="Revoke Login Access"
                                    onClick={() => handleDeleteAccount(u)}
                                  >
                                    🗑
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="5" className="empty-state">
                            {loadingUsers ? 'Loading accounts...' : 'No accounts match your search.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* MODAL: CREATE TEAM MEMBER (WITH EMAIL & PASSWORD LOGIN FIELDS)   */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {isTeamModalOpen && (
        <div className="modal-overlay" onClick={() => setIsTeamModalOpen(false)}>
          <div
            className="modal-card"
            style={{ maxWidth: '640px', width: '92%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">+ Add Team Member &amp; Login Access</h3>
              <button type="button" className="modal-close" onClick={() => setIsTeamModalOpen(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateTeamMember}>
              <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
                  Add a team member to the firm portfolio. You can also provision their staff credentials so they can sign into <strong>/admin</strong>.
                </p>

                <div className="form-field">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. Alemu Tamiru"
                    value={teamFormData.name}
                    onChange={(e) => setTeamFormData({ ...teamFormData, name: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-field">
                    <label>Position / Role</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Lead Architect"
                      value={teamFormData.position}
                      onChange={(e) => setTeamFormData({ ...teamFormData, position: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Department</label>
                    <select
                      className="form-input"
                      value={teamFormData.department}
                      onChange={(e) => setTeamFormData({ ...teamFormData, department: e.target.value })}
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-field">
                    <label>Profession / Specialization</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Practicing Architect"
                      value={teamFormData.profession}
                      onChange={(e) => setTeamFormData({ ...teamFormData, profession: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Years of Experience</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 8 years"
                      value={teamFormData.yearsexperience}
                      onChange={(e) => setTeamFormData({ ...teamFormData, yearsexperience: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
                  <div className="form-field">
                    <label>Photo URL (Optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="https://... or /assets/team/..."
                      value={teamFormData.photo}
                      onChange={(e) => setTeamFormData({ ...teamFormData, photo: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Display Sort Order</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="0"
                      value={teamFormData.order}
                      onChange={(e) => setTeamFormData({ ...teamFormData, order: Number(e.target.value) })}
                    />
                  </div>
                </div>

                {/* ─── CREDENTIALS PROVISIONING BOX ─────────────────── */}
                <div
                  style={{
                    background: 'rgba(212, 175, 55, 0.06)',
                    border: '1px solid rgba(212, 175, 55, 0.35)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginTop: '16px',
                    boxShadow: '0 0 25px rgba(212, 175, 55, 0.08)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>🔑</span>
                    <strong style={{ color: 'var(--accent-gold-light)', fontSize: '0.92rem' }}>
                      Staff Admin Portal Login Credentials (/admin)
                    </strong>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.45 }}>
                    Give this team member an email and password so they can log into the <strong>Staff Admin (/admin)</strong> to manage portfolio projects and customer enquiries.
                  </p>

                  <div className="form-field">
                    <label>Login Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="e.g. alemu@selam.com"
                      value={teamFormData.email}
                      onChange={(e) => setTeamFormData({ ...teamFormData, email: e.target.value })}
                    />
                  </div>

                  <div className="form-field" style={{ marginBottom: 0 }}>
                    <label>Login Password {teamFormData.email ? '(Min. 6 characters)' : '(Optional)'}</label>
                    <div className="input-with-icon-wrapper">
                      <input
                        type={showMemberPassword ? 'text' : 'password'}
                        className="form-input"
                        placeholder="Set password for team member"
                        minLength={teamFormData.email ? 6 : undefined}
                        value={teamFormData.password}
                        onChange={(e) => setTeamFormData({ ...teamFormData, password: e.target.value })}
                      />
                      <button
                        type="button"
                        className="input-toggle-btn"
                        onClick={() => setShowMemberPassword(!showMemberPassword)}
                      >
                        {showMemberPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsTeamModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-gold" disabled={formSubmitting}>
                  {formSubmitting ? 'Creating Team Member...' : 'Create Team Member & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* MODAL: EDIT TEAM MEMBER (UPDATE DETAILS & UPDATE/RESET PASSWORD) */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {editingMember && (
        <div className="modal-overlay" onClick={() => setEditingMember(null)}>
          <div
            className="modal-card"
            style={{ maxWidth: '640px', width: '92%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">Edit Team Member: {editingMember.name}</h3>
              <button type="button" className="modal-close" onClick={() => setEditingMember(null)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleUpdateTeamMember}>
              <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                <div className="form-field">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={editingMember.name}
                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-field">
                    <label>Position / Role</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editingMember.position}
                      onChange={(e) => setEditingMember({ ...editingMember, position: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Department</label>
                    <select
                      className="form-input"
                      value={editingMember.department}
                      onChange={(e) => setEditingMember({ ...editingMember, department: e.target.value })}
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-field">
                    <label>Profession / Specialization</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editingMember.profession}
                      onChange={(e) => setEditingMember({ ...editingMember, profession: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Years of Experience</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editingMember.yearsexperience}
                      onChange={(e) => setEditingMember({ ...editingMember, yearsexperience: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
                  <div className="form-field">
                    <label>Photo URL</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editingMember.photo}
                      onChange={(e) => setEditingMember({ ...editingMember, photo: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Display Sort Order</label>
                    <input
                      type="number"
                      className="form-input"
                      value={editingMember.order}
                      onChange={(e) => setEditingMember({ ...editingMember, order: Number(e.target.value) })}
                    />
                  </div>
                </div>

                {/* ─── CREDENTIALS EDIT / RESET BOX ─────────────────── */}
                <div
                  style={{
                    background: 'rgba(212, 175, 55, 0.06)',
                    border: '1px solid rgba(212, 175, 55, 0.35)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginTop: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>🔑</span>
                    <strong style={{ color: 'var(--accent-gold-light)', fontSize: '0.92rem' }}>
                      Staff Admin Portal Access (/admin)
                    </strong>
                  </div>

                  <div className="form-field">
                    <label>Login Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="e.g. member@selam.com"
                      value={editingMember.email}
                      onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                    />
                  </div>

                  <div className="form-field" style={{ marginBottom: 0 }}>
                    <label>Reset / Change Password (Min. 6 chars)</label>
                    <div className="input-with-icon-wrapper">
                      <input
                        type={showMemberPassword ? 'text' : 'password'}
                        className="form-input"
                        placeholder="Leave blank to keep existing password"
                        minLength={6}
                        value={editingMember.password}
                        onChange={(e) => setEditingMember({ ...editingMember, password: e.target.value })}
                      />
                      <button
                        type="button"
                        className="input-toggle-btn"
                        onClick={() => setShowMemberPassword(!showMemberPassword)}
                      >
                        {showMemberPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                      Entering a new password here will immediately update their /admin login key.
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setEditingMember(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-gold" disabled={formSubmitting}>
                  {formSubmitting ? 'Saving Changes...' : 'Save Member Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* MODAL: CREATE STANDALONE ADMIN ACCOUNT                            */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {isAccountModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAccountModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Provision Admin Account</h3>
              <button type="button" className="modal-close" onClick={() => setIsAccountModalOpen(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateAccount}>
              <div className="modal-body">
                <div className="form-field">
                  <label>Display Name / Username *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. daniel_engineer"
                    value={newAccountUsername}
                    onChange={(e) => setNewAccountUsername(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label>Email Address (Login ID) *</label>
                  <input
                    type="email"
                    className="form-input"
                    required
                    placeholder="e.g. daniel@selam.com"
                    value={newAccountEmail}
                    onChange={(e) => setNewAccountEmail(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label>Password (Min. 6 characters) *</label>
                  <input
                    type="password"
                    className="form-input"
                    required
                    minLength={6}
                    placeholder="Enter secure password"
                    value={newAccountPassword}
                    onChange={(e) => setNewAccountPassword(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label>Clearance Level</label>
                  <select
                    className="form-input"
                    value={newAccountRole}
                    onChange={(e) => setNewAccountRole(e.target.value)}
                  >
                    <option value="admin">Team Member (Admin) — Staff Dashboard Access</option>
                    <option value="superadmin">Super Admin (Owner) — Root Vault Authority</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsAccountModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-gold" disabled={formSubmitting}>
                  {formSubmitting ? 'Provisioning...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* CONFIRMATION DIALOG MODAL                                        */}
      {/* ═════════════════════════════════════════════════════════════════ */}
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
              <button type="button" className="confirm-cancel-btn" onClick={() => setConfirmDialog(null)}>
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
                {confirmDialog.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
