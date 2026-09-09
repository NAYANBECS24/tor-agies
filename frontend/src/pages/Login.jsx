import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../features/auth/authSlice';

// ─── Demo users (SQLite-like in-memory store) ───────────────────────────────
const DEMO_USERS = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@torageis.gov',
    password: 'Admin@2024',
    role: 'Super Admin',
    clearance: 'TOP SECRET',
    avatar: 'A',
    color: '#e53935',
    department: 'Command & Control',
    lastLogin: '2024-01-15 09:42 UTC',
  },
  {
    id: 2,
    username: 'analyst',
    email: 'analyst@torageis.gov',
    password: 'Analyst@2024',
    role: 'Senior Analyst',
    clearance: 'SECRET',
    avatar: 'S',
    color: '#1e88e5',
    department: 'Intelligence Division',
    lastLogin: '2024-01-14 14:17 UTC',
  },
  {
    id: 3,
    username: 'operator',
    email: 'operator@torageis.gov',
    password: 'Operator@2024',
    role: 'Network Operator',
    clearance: 'CONFIDENTIAL',
    avatar: 'N',
    color: '#43a047',
    department: 'Network Operations',
    lastLogin: '2024-01-13 22:05 UTC',
  },
  {
    id: 4,
    username: 'auditor',
    email: 'auditor@torageis.gov',
    password: 'Auditor@2024',
    role: 'Security Auditor',
    clearance: 'RESTRICTED',
    avatar: 'R',
    color: '#fb8c00',
    department: 'Compliance & Audit',
    lastLogin: '2024-01-12 11:33 UTC',
  },
];

// ─── Particle Canvas ─────────────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    const particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(33,150,243,${p.alpha})`;
        ctx.fill();
      });

      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(33,150,243,${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}

// ─── Main Login Component ────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const [activeDemo, setActiveDemo] = useState(null);
  const [glitch, setGlitch] = useState(false);
  const [scanLine, setScanLine] = useState(0);

  // Scanning animation
  useEffect(() => {
    const id = setInterval(() => {
      setScanLine((prev) => (prev >= 100 ? 0 : prev + 0.5));
    }, 20);
    return () => clearInterval(id);
  }, []);

  // Glitch effect on error
  useEffect(() => {
    if (error) {
      setGlitch(true);
      const t = setTimeout(() => setGlitch(false), 600);
      return () => clearTimeout(t);
    }
  }, [error]);

  const handleDemoClick = (user) => {
    setActiveDemo(user.id);
    setEmail(user.email);
    setPassword(user.password);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('All fields are required.');
      return;
    }

    setLoading(true);
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 1200));

    const found = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    setLoading(false);

    if (!found) {
      setError('Invalid credentials. Access denied.');
      return;
    }

    // Persist session
    const sessionUser = {
      id: found.id,
      username: found.username,
      email: found.email,
      role: found.role,
      clearance: found.clearance,
      department: found.department,
      avatar: found.avatar,
      color: found.color,
    };
    localStorage.setItem('token', `demo-token-${found.id}-${Date.now()}`);
    localStorage.setItem('user', JSON.stringify(sessionUser));
    if (remember) localStorage.setItem('rememberMe', 'true');

    dispatch(setUser(sessionUser));
    navigate('/');
  };

  const clearanceColor = {
    'TOP SECRET': '#e53935',
    SECRET: '#1e88e5',
    CONFIDENTIAL: '#43a047',
    RESTRICTED: '#fb8c00',
  };

  return (
    <div style={styles.root}>
      {/* Animated background */}
      <div style={styles.bgGradient} />
      <ParticleCanvas />

      {/* Scan line */}
      <div
        style={{
          ...styles.scanLine,
          top: `${scanLine}%`,
        }}
      />

      {/* Grid overlay */}
      <div style={styles.grid} />

      {/* Main content */}
      <div style={styles.content}>
        {/* ── Left Panel ── */}
        <div style={styles.leftPanel}>
          <div style={styles.logoWrap}>
            <div style={styles.logoHex}>
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <polygon
                  points="28,2 52,15 52,41 28,54 4,41 4,15"
                  fill="none"
                  stroke="#2196f3"
                  strokeWidth="2"
                />
                <polygon
                  points="28,10 46,20 46,36 28,46 10,36 10,20"
                  fill="rgba(33,150,243,0.1)"
                  stroke="#1565c0"
                  strokeWidth="1"
                />
                <text x="28" y="34" textAnchor="middle" fontSize="18" fill="#2196f3" fontWeight="bold">
                  T
                </text>
              </svg>
            </div>
            <div>
              <div style={styles.logoTitle}>TOR AEGIS</div>
              <div style={styles.logoSub}>INTELLIGENCE PLATFORM v4.2</div>
            </div>
          </div>

          <div style={styles.classifiedBadge}>
            <span style={styles.classifiedDot} />
            CLASSIFIED SYSTEM — AUTHORIZED PERSONNEL ONLY
          </div>

          <div style={styles.tagline}>
            Advanced Threat Intelligence &amp; Tor Network Monitoring
          </div>

          {/* Stats */}
          <div style={styles.statsRow}>
            {[
              { label: 'Active Nodes', value: '14,829' },
              { label: 'Threats Blocked', value: '2,341' },
              { label: 'Uptime', value: '99.97%' },
            ].map((s) => (
              <div key={s.label} style={styles.statBox}>
                <div style={styles.statValue}>{s.value}</div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Demo Accounts */}
          <div style={styles.demoSection}>
            <div style={styles.demoTitle}>
              <span style={{ color: '#2196f3' }}>▸</span> DEMO CREDENTIALS
            </div>
            {DEMO_USERS.map((u) => (
              <button
                key={u.id}
                style={{
                  ...styles.demoCard,
                  borderColor: activeDemo === u.id ? u.color : 'rgba(255,255,255,0.08)',
                  background:
                    activeDemo === u.id
                      ? `rgba(${hexToRgb(u.color)},0.12)`
                      : 'rgba(255,255,255,0.03)',
                }}
                onClick={() => handleDemoClick(u)}
              >
                <div
                  style={{
                    ...styles.demoAvatar,
                    background: u.color,
                    boxShadow: `0 0 12px ${u.color}66`,
                  }}
                >
                  {u.avatar}
                </div>
                <div style={styles.demoInfo}>
                  <div style={styles.demoName}>{u.role}</div>
                  <div style={styles.demoEmail}>{u.email}</div>
                  <div
                    style={{
                      ...styles.demoClearance,
                      color: clearanceColor[u.clearance],
                      borderColor: clearanceColor[u.clearance] + '55',
                    }}
                  >
                    {u.clearance}
                  </div>
                </div>
                {activeDemo === u.id && (
                  <div style={{ color: u.color, fontSize: '18px', marginLeft: 'auto' }}>✓</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Right Panel (Login Form) ── */}
        <div style={{ ...styles.rightPanel, ...(glitch ? styles.glitch : {}) }}>
          {/* Header */}
          <div style={styles.formHeader}>
            <div style={styles.formTitle}>SECURE ACCESS</div>
            <div style={styles.formSub}>Authenticate to continue</div>
            <div style={styles.formDivider} />
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Email */}
            <div style={styles.fieldWrap}>
              <label style={styles.label}>OPERATOR EMAIL</label>
              <div style={styles.inputWrap}>
                <span style={styles.inputIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); setActiveDemo(null); }}
                  placeholder="operator@torageis.gov"
                  style={styles.input}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div style={styles.fieldWrap}>
              <label style={styles.label}>ACCESS CODE</label>
              <div style={styles.inputWrap}>
                <span style={styles.inputIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••••"
                  style={styles.input}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={styles.errorBox}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef5350" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {/* Remember / Forgot */}
            <div style={styles.rememberRow}>
              <label style={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  style={{ accentColor: '#2196f3' }}
                />
                <span style={{ color: '#90caf9' }}>Remember session</span>
              </label>
              <button type="button" style={styles.forgotBtn}>
                Forgot access code?
              </button>
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.8 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <span style={styles.loadingWrap}>
                  <span style={styles.spinner} />
                  AUTHENTICATING...
                </span>
              ) : (
                <span>
                  ⚡ INITIATE SECURE LOGIN
                </span>
              )}
            </button>
          </form>

          {/* Security footer */}
          <div style={styles.securityFooter}>
            <div style={styles.securityItem}>
              <span style={styles.securityDot} />
              TLS 1.3 Encrypted
            </div>
            <div style={styles.securityItem}>
              <span style={styles.securityDot} />
              Zero-Knowledge Auth
            </div>
            <div style={styles.securityItem}>
              <span style={styles.securityDot} />
              MFA Ready
            </div>
          </div>

          <div style={styles.copyright}>
            © 2024 TOR AEGIS Intelligence Platform · All access attempts are logged
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #020b18; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes glitch {
          0%   { transform: translate(0); }
          20%  { transform: translate(-2px, 2px); filter: hue-rotate(90deg); }
          40%  { transform: translate(2px, -2px); }
          60%  { transform: translate(-2px, 0); filter: hue-rotate(0deg); }
          80%  { transform: translate(2px, 2px); }
          100% { transform: translate(0); }
        }
        @keyframes scanMove {
          0%   { opacity: 0.4; }
          50%  { opacity: 0.7; }
          100% { opacity: 0.4; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        input:focus { outline: none; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #061829 inset !important;
          -webkit-text-fill-color: #e3f2fd !important;
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #020b18; }
        ::-webkit-scrollbar-thumb { background: #1565c0; border-radius: 2px; }
      `}</style>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  root: {
    minHeight: '100vh',
    background: '#020b18',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  bgGradient: {
    position: 'fixed',
    inset: 0,
    background:
      'radial-gradient(ellipse at 20% 50%, rgba(13,71,161,0.25) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(21,101,192,0.15) 0%, transparent 50%)',
    zIndex: 0,
  },
  grid: {
    position: 'fixed',
    inset: 0,
    backgroundImage:
      'linear-gradient(rgba(33,150,243,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(33,150,243,0.03) 1px, transparent 1px)',
    backgroundSize: '40px 40px',
    zIndex: 0,
  },
  scanLine: {
    position: 'fixed',
    left: 0,
    width: '100%',
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(33,150,243,0.4), transparent)',
    zIndex: 1,
    animation: 'scanMove 2s infinite',
    pointerEvents: 'none',
  },
  content: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    gap: '0',
    width: '100%',
    maxWidth: '1100px',
    minHeight: '100vh',
    padding: '20px',
    alignItems: 'center',
    animation: 'fadeIn 0.6s ease',
  },
  // ── Left Panel ──
  leftPanel: {
    flex: '1 1 420px',
    padding: '40px 36px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  logoHex: { flexShrink: 0 },
  logoTitle: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '22px',
    fontWeight: '700',
    color: '#e3f2fd',
    letterSpacing: '4px',
  },
  logoSub: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '9px',
    color: '#42a5f5',
    letterSpacing: '2px',
    marginTop: '2px',
  },
  classifiedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(229,57,53,0.12)',
    border: '1px solid rgba(229,57,53,0.3)',
    borderRadius: '4px',
    padding: '6px 12px',
    fontSize: '9px',
    fontFamily: "'JetBrains Mono', monospace",
    color: '#ef9a9a',
    letterSpacing: '1px',
    width: 'fit-content',
  },
  classifiedDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#e53935',
    display: 'inline-block',
    animation: 'pulse 1.5s infinite',
  },
  tagline: {
    fontSize: '14px',
    color: '#78909c',
    lineHeight: '1.6',
    maxWidth: '340px',
  },
  statsRow: {
    display: 'flex',
    gap: '12px',
  },
  statBox: {
    flex: 1,
    background: 'rgba(33,150,243,0.06)',
    border: '1px solid rgba(33,150,243,0.15)',
    borderRadius: '8px',
    padding: '12px',
    textAlign: 'center',
  },
  statValue: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '16px',
    fontWeight: '700',
    color: '#42a5f5',
  },
  statLabel: {
    fontSize: '9px',
    color: '#546e7a',
    marginTop: '4px',
    letterSpacing: '0.5px',
  },
  demoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  demoTitle: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '10px',
    color: '#546e7a',
    letterSpacing: '2px',
    marginBottom: '4px',
  },
  demoCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.08)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    width: '100%',
    textAlign: 'left',
  },
  demoAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
    color: '#fff',
    flexShrink: 0,
  },
  demoInfo: { flex: 1, minWidth: 0 },
  demoName: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#e3f2fd',
    marginBottom: '2px',
  },
  demoEmail: {
    fontSize: '10px',
    color: '#546e7a',
    fontFamily: "'JetBrains Mono', monospace",
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  demoClearance: {
    fontSize: '8px',
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: '1px',
    padding: '2px 6px',
    borderRadius: '2px',
    border: '1px solid',
    display: 'inline-block',
  },
  // ── Right Panel ──
  rightPanel: {
    flex: '0 0 420px',
    background: 'rgba(6,24,44,0.85)',
    border: '1px solid rgba(33,150,243,0.2)',
    borderRadius: '16px',
    padding: '40px',
    backdropFilter: 'blur(20px)',
    boxShadow:
      '0 0 80px rgba(33,150,243,0.08), 0 0 0 1px rgba(33,150,243,0.1) inset',
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  glitch: {
    animation: 'glitch 0.3s linear',
  },
  formHeader: {
    marginBottom: '32px',
  },
  formTitle: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '24px',
    fontWeight: '700',
    color: '#e3f2fd',
    letterSpacing: '4px',
    marginBottom: '6px',
  },
  formSub: {
    fontSize: '12px',
    color: '#546e7a',
    letterSpacing: '1px',
  },
  formDivider: {
    marginTop: '16px',
    height: '1px',
    background: 'linear-gradient(90deg, #1565c0, transparent)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '9px',
    color: '#42a5f5',
    letterSpacing: '2px',
  },
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: '#546e7a',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    background: 'rgba(2,11,24,0.8)',
    border: '1px solid rgba(33,150,243,0.2)',
    borderRadius: '8px',
    padding: '14px 44px',
    fontSize: '14px',
    color: '#e3f2fd',
    fontFamily: "'Inter', sans-serif",
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  eyeBtn: {
    position: 'absolute',
    right: '14px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#546e7a',
    display: 'flex',
    alignItems: 'center',
    padding: '0',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(229,57,53,0.1)',
    border: '1px solid rgba(229,57,53,0.3)',
    borderRadius: '6px',
    padding: '10px 14px',
    fontSize: '12px',
    color: '#ef9a9a',
    fontFamily: "'JetBrains Mono', monospace",
  },
  rememberRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  forgotBtn: {
    background: 'none',
    border: 'none',
    color: '#42a5f5',
    fontSize: '12px',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontFamily: "'Inter', sans-serif",
  },
  submitBtn: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 50%, #1565c0 100%)',
    backgroundSize: '200% 100%',
    border: '1px solid rgba(33,150,243,0.4)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '13px',
    fontWeight: '700',
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: '2px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '4px',
    boxShadow: '0 4px 24px rgba(21,101,192,0.4)',
  },
  loadingWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  spinner: {
    width: '14px',
    height: '14px',
    border: '2px solid rgba(255,255,255,0.2)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.8s linear infinite',
  },
  securityFooter: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '28px',
    paddingTop: '20px',
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  securityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '10px',
    color: '#546e7a',
    fontFamily: "'JetBrains Mono', monospace",
  },
  securityDot: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    background: '#43a047',
    flexShrink: 0,
  },
  copyright: {
    textAlign: 'center',
    marginTop: '16px',
    fontSize: '9px',
    color: '#37474f',
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: '0.5px',
  },
};