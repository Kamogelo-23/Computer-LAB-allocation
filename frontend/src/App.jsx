import { useState, useEffect, useCallback } from "react";
import campusGridLogo from "./assets/campusgrid-logo.svg";

// ─── Palette & Globals ────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink:    #0e1a2b;
    --muted:  #5b6f88;
    --line:   #d4dff0;
    --paper:  #f0f5fd;
    --white:  #ffffff;
    --navy:   #0b2a5c;
    --blue:   #1353c8;
    --sky:    #3b82f6;
    --teal:   #0d9488;
    --amber:  #d97706;
    --rose:   #e11d48;
    --green:  #16a34a;
    --panel:  rgba(255,255,255,0.92);
    --radius: 14px;
    --shadow: 0 4px 24px rgba(11,42,92,0.10);
    --shadow-lg: 0 12px 48px rgba(11,42,92,0.18);
    font-family: 'DM Sans', sans-serif;
  }

  body { background: var(--paper); color: var(--ink); }

  .cc-app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, #dce9ff 0%, #f0f5fd 40%, #e4f0fb 100%);
  }

  /* ── LOGIN ── */
  .login-wrap {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    overflow: hidden;
  }
  @media(max-width:700px){ .login-wrap { grid-template-columns:1fr; } .login-hero { display:none; } }

  .login-hero {
    background: linear-gradient(155deg, #071a3e 0%, #0b2a5c 45%, #0f3d7a 75%, #1353c8 100%);
    color: white;
    padding: 3rem 3.5rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
  }
  .login-hero::before {
    content:'';
    position:absolute; inset:0;
    background:
      radial-gradient(ellipse at 90% 10%, rgba(99,179,237,0.13) 0%, transparent 50%),
      radial-gradient(ellipse at 5% 90%, rgba(59,130,246,0.15) 0%, transparent 55%),
      radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 70%);
  }
  .login-hero::after {
    content:'';
    position:absolute;
    bottom:-120px; right:-120px;
    width:380px; height:380px;
    border-radius:50%;
    border: 1px solid rgba(255,255,255,0.06);
    box-shadow: inset 0 0 80px rgba(59,130,246,0.08);
    z-index:0;
  }

  .hero-top { position:relative; z-index:1; }
  .hero-logo {
    display: inline-flex; align-items: center; gap: .55rem;
    font-family: 'DM Serif Display', serif; font-size: 1.4rem;
    letter-spacing: -0.01em;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.18);
    border-radius: 999px;
    padding: .4rem 1.1rem .4rem .65rem;
  }
  .hero-logo-icon { width: 34px; height: 34px; object-fit: contain; display:block; }

  .hero-middle { position:relative; z-index:1; }
  .hero-eyebrow {
    font-size: .72rem; font-weight: 700; letter-spacing: .14em;
    text-transform: uppercase; color: rgba(255,255,255,0.5);
    margin-bottom: .9rem;
  }
  .hero-tagline {
    font-size: clamp(2rem, 3.5vw, 3rem);
    font-family:'DM Serif Display',serif;
    line-height: 1.08;
    position:relative; z-index:1;
    margin-bottom: 1.1rem;
  }
  .hero-tagline em { font-style:italic; color: rgba(255,255,255,0.75); }
  .hero-sub {
    color: rgba(255,255,255,0.65); font-size:.93rem;
    line-height: 1.65; max-width: 38ch;
    position:relative; z-index:1;
    margin-bottom: 1.8rem;
  }

  .hero-features { position:relative; z-index:1; display:flex; flex-direction:column; gap:.65rem; }
  .hero-feature {
    display: flex; align-items: flex-start; gap: .75rem;
  }
  .hero-feature-icon {
    width: 32px; height: 32px; flex-shrink:0;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 8px;
    display: flex; align-items:center; justify-content:center;
    font-size: .95rem; margin-top:.05rem;
  }
  .hero-feature-text strong { display:block; font-size:.86rem; font-weight:600; color:rgba(255,255,255,0.92); }
  .hero-feature-text span { font-size:.78rem; color:rgba(255,255,255,0.5); }

  .hero-bottom { position:relative; z-index:1; border-top:1px solid rgba(255,255,255,0.1); padding-top:1.3rem; }
  .hero-bottom p { font-size:.76rem; color:rgba(255,255,255,0.38); line-height:1.6; }
  .hero-bottom strong { color:rgba(255,255,255,0.55); font-weight:600; }

  .hero-badges { display:flex; gap:.6rem; flex-wrap:wrap; position:relative; z-index:1; }
  .hero-badge { background: rgba(255,255,255,0.13); border: 1px solid rgba(255,255,255,0.2); border-radius:999px; padding:.28rem .85rem; font-size:.78rem; }

  .login-form-side {
    display: flex; align-items: center; justify-content: center;
    padding: 2.5rem;
    background: var(--white);
  }
  .login-card { width: 100%; max-width: 400px; }
  .login-card h2 { font-family: 'DM Serif Display', serif; font-size:1.9rem; margin-bottom:.3rem; }
  .login-card .sub { color: var(--muted); font-size:.9rem; margin-bottom:2rem; }

  .field { display:flex; flex-direction:column; gap:.4rem; margin-bottom:1.1rem; }
  .field label { font-size:.82rem; font-weight:600; color:var(--muted); letter-spacing:.04em; text-transform:uppercase; }
  .field input, .field select {
    border: 1.5px solid var(--line); border-radius: 9px;
    padding: .65rem .9rem; font-size:.95rem; font-family: inherit;
    color: var(--ink); background: var(--paper);
    transition: border-color .18s, box-shadow .18s;
    outline: none;
  }
  .field input:focus, .field select:focus { border-color: var(--sky); box-shadow: 0 0 0 3px rgba(59,130,246,.14); }

  .role-selector { display:grid; grid-template-columns:1fr 1fr; gap:.6rem; margin-bottom:1.4rem; }
  .role-btn {
    border: 1.5px solid var(--line); border-radius: 10px;
    padding:.6rem .5rem; text-align:center; cursor:pointer;
    background: var(--paper); font-size:.85rem; font-weight:500;
    transition: all .18s; user-select:none;
  }
  .role-btn:hover { border-color: var(--sky); background: #eff6ff; }
  .role-btn.active { border-color: var(--blue); background: #eff6ff; color: var(--blue); font-weight:700; }
  .role-icon { font-size:1.4rem; display:block; margin-bottom:.25rem; }

  .btn-primary {
    width:100%; background: var(--blue); color:white;
    border:none; border-radius:10px; padding:.78rem 1.2rem;
    font-size:.97rem; font-weight:600; cursor:pointer; font-family:inherit;
    transition: background .18s, transform .1s, box-shadow .18s;
    box-shadow: 0 4px 14px rgba(19,83,200,.35);
  }
  .btn-primary:hover { background: #0f47b0; transform:translateY(-1px); box-shadow: 0 6px 20px rgba(19,83,200,.4); }
  .btn-primary:active { transform:translateY(0); }

  .err-msg { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; border-radius:8px; padding:.6rem .9rem; font-size:.85rem; margin-bottom:1rem; }
  .info-msg { background: #ecfeff; border: 1px solid #a5f3fc; color: #155e75; border-radius:8px; padding:.6rem .9rem; font-size:.85rem; margin-bottom:1rem; }
  .auth-note { font-size:.78rem; color: var(--muted); margin-bottom: .8rem; }
  .password-wrap { display:flex; gap:.5rem; align-items:center; }
  .password-wrap input { flex:1; }
  .toggle-pass {
    border: 1.5px solid var(--line);
    border-radius: 8px;
    background: var(--white);
    color: var(--muted);
    font-size: .78rem;
    padding: .45rem .7rem;
    cursor: pointer;
  }
  .toggle-pass:hover { border-color: var(--sky); color: var(--blue); }
  .remember-row { display:flex; align-items:center; justify-content:space-between; gap: .5rem; margin-bottom: 1rem; }
  .remember-row label { display:flex; align-items:center; gap:.45rem; font-size:.82rem; color:var(--muted); }
  .auth-links { display:flex; align-items:center; justify-content:space-between; gap: .8rem; margin-top: .9rem; flex-wrap:wrap; }
  .auth-link { background:none; border:none; padding:0; color: var(--blue); font-size:.82rem; cursor:pointer; text-decoration:underline; }
  .auth-link:hover { color:#0f47b0; }
  .spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255,255,255,.35);
    border-top-color: #fff;
    border-radius: 50%;
    display: inline-block;
    animation: spin .6s linear infinite;
    vertical-align: middle;
    margin-right: .4rem;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── DASHBOARD SHELL ── */
  .dash-shell { display:flex; min-height:100vh; }

  .sidebar {
    width: 230px; flex-shrink:0;
    background: var(--navy);
    color: white;
    display: flex; flex-direction: column;
    padding: 1.6rem 0 1.2rem;
    position: sticky; top:0; height:100vh;
    overflow-y:auto;
  }
  .sidebar-logo {
    font-family:'DM Serif Display',serif;
    font-size:1.35rem;
    padding:0 1.4rem 1.4rem;
    border-bottom:1px solid rgba(255,255,255,.1);
    display:flex;
    align-items:center;
    gap:.55rem;
  }
  .sidebar-logo img { width: 26px; height: 26px; object-fit: contain; }
  .sidebar-user { padding:.9rem 1.4rem 1rem; border-bottom:1px solid rgba(255,255,255,.1); }
  .sidebar-user .name { font-weight:600; font-size:.92rem; }
  .sidebar-user .role-tag { font-size:.75rem; color:rgba(255,255,255,.55); margin-top:.15rem; }

  .sidebar-nav { flex:1; padding:.8rem 0; }
  .nav-item {
    display:flex; align-items:center; gap:.7rem;
    padding:.62rem 1.4rem; font-size:.87rem; font-weight:500;
    color: rgba(255,255,255,.65); cursor:pointer;
    border-left: 3px solid transparent;
    transition: all .15s; user-select:none;
  }
  .nav-item:hover { color:white; background:rgba(255,255,255,.06); }
  .nav-item.active { color:white; border-left-color: var(--sky); background:rgba(59,130,246,.14); }
  .nav-icon { font-size:1.05rem; width:20px; text-align:center; flex-shrink:0; }

  .sidebar-foot { padding:.8rem 1.4rem 0; border-top:1px solid rgba(255,255,255,.1); }
  .logout-btn { background:none; border:1px solid rgba(255,255,255,.2); color:rgba(255,255,255,.7); border-radius:8px; padding:.5rem 1rem; cursor:pointer; font-size:.83rem; font-family:inherit; transition: all .15s; width:100%; }
  .logout-btn:hover { background:rgba(255,255,255,.1); color:white; }

  .main-area { flex:1; min-width:0; display:flex; flex-direction:column; }

  .topbar {
    background: var(--white); border-bottom: 1px solid var(--line);
    padding: .85rem 2rem; display:flex; align-items:center; justify-content:space-between;
    position:sticky; top:0; z-index:10;
  }
  .topbar-title { font-family:'DM Serif Display',serif; font-size:1.25rem; }
  .topbar-right { display:flex; align-items:center; gap:1rem; }
  .notif-dot { position:relative; cursor:pointer; }
  .notif-dot span { position:absolute; top:-4px; right:-4px; background:var(--rose); color:white; border-radius:999px; font-size:.65rem; min-width:16px; height:16px; display:flex; align-items:center; justify-content:center; font-weight:700; }
  .avatar { width:34px; height:34px; border-radius:50%; background:var(--blue); color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:.88rem; }

  .content { flex:1; padding:1.8rem 2rem; }

  /* ── PANELS & CARDS ── */
  .panel {
    background: var(--panel); border: 1px solid var(--line);
    border-radius: var(--radius); padding: 1.4rem 1.5rem;
    box-shadow: var(--shadow); margin-bottom:1.2rem;
  }
  .panel h3 { font-family:'DM Serif Display',serif; font-size:1.15rem; margin-bottom:.9rem; }
  .panel-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:.9rem; }
  .panel-row h3 { margin-bottom:0; }

  .kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-bottom:1.2rem; }
  @media(max-width:900px){ .kpi-grid { grid-template-columns:repeat(2,1fr); } }
  .kpi-card {
    background: var(--white); border:1px solid var(--line); border-radius: var(--radius);
    padding:1.1rem 1.3rem; box-shadow: var(--shadow);
  }
  .kpi-label { font-size:.78rem; font-weight:600; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:.4rem; }
  .kpi-value { font-family:'DM Serif Display',serif; font-size:2rem; color:var(--navy); }
  .kpi-value.warn { color: var(--rose); }
  .kpi-value.ok { color: var(--teal); }

  .dash-grid { display:grid; grid-template-columns:1.4fr 1fr; gap:1.2rem; margin-bottom:1.2rem; }
  @media(max-width:900px){ .dash-grid { grid-template-columns:1fr; } }

  /* ── TABLES ── */
  .table-wrap { overflow-x:auto; }
  table { width:100%; border-collapse:collapse; font-size:.88rem; }
  th { text-align:left; font-size:.75rem; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; padding:.55rem .8rem; border-bottom:2px solid var(--line); }
  td { padding:.6rem .8rem; border-bottom:1px solid var(--line); color:var(--ink); }
  tr:last-child td { border-bottom:none; }
  tr:hover td { background: #f7f9fd; }

  /* ── BADGES ── */
  .badge { display:inline-flex; align-items:center; border-radius:999px; padding:.18rem .65rem; font-size:.74rem; font-weight:600; }
  .badge-blue { background:#eff6ff; color:#1d4ed8; }
  .badge-teal { background:#f0fdfa; color:#0f766e; }
  .badge-amber { background:#fffbeb; color:#b45309; }
  .badge-rose { background:#fff1f2; color:#be123c; }
  .badge-green { background:#f0fdf4; color:#15803d; }

  /* ── BUTTONS ── */
  .btn { border:none; border-radius:9px; padding:.52rem 1.1rem; font-size:.87rem; font-weight:600; cursor:pointer; font-family:inherit; transition: all .15s; }
  .btn-blue { background: var(--blue); color:white; box-shadow:0 2px 8px rgba(19,83,200,.28); }
  .btn-blue:hover { background:#0f47b0; transform:translateY(-1px); }
  .btn-outline { background:transparent; border:1.5px solid var(--line); color:var(--muted); }
  .btn-outline:hover { border-color:var(--sky); color:var(--blue); }
  .btn-danger { background: var(--rose); color:white; }
  .btn-danger:hover { background:#be123c; }
  .btn-sm { padding:.35rem .8rem; font-size:.8rem; }
  .btn-row { display:flex; gap:.6rem; flex-wrap:wrap; }

  /* ── FORM GRID ── */
  .form-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:.8rem; }
  .form-grid input, .form-grid select, .form-grid textarea {
    border:1.5px solid var(--line); border-radius:9px; padding:.6rem .8rem;
    font-size:.88rem; font-family:inherit; color:var(--ink); background:var(--paper);
    outline:none; transition: border-color .18s;
  }
  .form-grid input:focus, .form-grid select:focus, .form-grid textarea:focus { border-color:var(--sky); }
  .form-full { grid-column: 1/-1; }

  /* ── ROLE HERO ── */
  .role-hero {
    background: linear-gradient(135deg, var(--navy), #163c80);
    color: white; border-color: transparent;
  }
  .role-hero h3 { color:white; }
  .role-hero p { color:rgba(255,255,255,.75); font-size:.9rem; margin-top:.3rem; }

  /* ── WEEK CARDS ── */
  .week-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:.8rem; }
  @media(max-width:1000px){ .week-grid { grid-template-columns:repeat(3,1fr); } }
  @media(max-width:650px){ .week-grid { grid-template-columns:1fr 1fr; } }
  .week-card { background:var(--white); border:1px solid var(--line); border-radius:12px; overflow:hidden; }
  .week-head { background:var(--navy); color:white; padding:.55rem .8rem; display:flex; justify-content:space-between; align-items:center; font-size:.82rem; font-weight:600; }
  .week-body { padding:.7rem .8rem; }
  .week-session { display:flex; flex-direction:column; gap:.15rem; padding:.45rem 0; border-bottom:1px solid var(--line); }
  .week-session:last-child { border-bottom:none; }
  .week-time { font-size:.75rem; color:var(--muted); }
  .week-course { font-weight:600; font-size:.85rem; }
  .week-venue { font-size:.78rem; color:var(--muted); }
  .empty-note { font-size:.8rem; color:var(--muted); font-style:italic; }

  /* ── MODULE CARDS ── */
  .module-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:.8rem; }
  .module-card { border:1px solid var(--line); border-radius:12px; padding:1rem; background:var(--paper); }
  .module-card strong { font-size:1rem; font-family:'DM Serif Display',serif; }
  .module-card p { font-size:.83rem; color:var(--muted); margin:.3rem 0; }
  .module-card span { font-size:.76rem; }

  /* ── NOTIFICATIONS ── */
  .notif-row { display:flex; gap:.8rem; align-items:flex-start; padding:.7rem 0; border-bottom:1px solid var(--line); }
  .notif-row:last-child { border-bottom:none; }
  .notif-icon { width:32px; height:32px; border-radius:50%; background:#eff6ff; color:var(--blue); display:flex; align-items:center; justify-content:center; font-size:.9rem; flex-shrink:0; margin-top:.1rem; }
  .notif-body .title { font-weight:600; font-size:.88rem; }
  .notif-body .meta { font-size:.78rem; color:var(--muted); margin-top:.15rem; }
  .notif-body .msg { font-size:.84rem; color:var(--muted); margin-top:.2rem; }
  .notif-unread .notif-icon { background: #fef3c7; color:var(--amber); }

  /* ── UTIL BAR ── */
  .util-bar-wrap { background:var(--line); border-radius:999px; height:6px; margin-top:.4rem; overflow:hidden; }
  .util-bar-fill { background: var(--sky); height:100%; border-radius:999px; transition: width .5s; }
  .util-stat { margin-bottom:.8rem; }
  .util-label { display:flex; justify-content:space-between; font-size:.83rem; }

  /* ── ALERT / TOAST ── */
  .toast {
    position:fixed; bottom:1.5rem; right:1.5rem; z-index:999;
    background:var(--navy); color:white; border-radius:12px;
    padding:.85rem 1.3rem; font-size:.88rem; box-shadow:var(--shadow-lg);
    max-width:340px; animation: slideUp .25s ease;
  }
  .toast.success { background: var(--teal); }
  .toast.error { background: var(--rose); }
  @keyframes slideUp { from { transform:translateY(20px); opacity:0; } to { transform:translateY(0); opacity:1; } }

  /* ── CONFLICTS ── */
  .conflict-card { border:1.5px solid #fecaca; background:#fff5f5; border-radius:12px; padding:1rem 1.2rem; margin-bottom:.8rem; }
  .conflict-card h4 { color:var(--rose); font-size:.9rem; margin-bottom:.4rem; }
  .conflict-card p { font-size:.84rem; color:var(--muted); }

  /* ── SETTINGS ── */
  .setting-row { display:flex; align-items:center; justify-content:space-between; padding:.75rem 0; border-bottom:1px solid var(--line); }
  .setting-row:last-child { border-bottom:none; }
  .setting-label { font-size:.9rem; font-weight:500; }
  .setting-sub { font-size:.78rem; color:var(--muted); margin-top:.1rem; }
  .toggle { position:relative; width:40px; height:22px; }
  .toggle input { opacity:0; width:0; height:0; }
  .slider { position:absolute; cursor:pointer; inset:0; background:var(--line); border-radius:999px; transition:.2s; }
  .slider::before { content:''; position:absolute; width:16px; height:16px; left:3px; bottom:3px; background:white; border-radius:50%; transition:.2s; }
  input:checked + .slider { background:var(--blue); }
  input:checked + .slider::before { transform:translateX(18px); }
`;

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

// ─── Data ─────────────────────────────────────────────────────────────────────
const initDb = () => ({
  venues: [
    { id: "v1", name: "Lab A1", capacity: 40, type: "lab", hasComputers: true },
    { id: "v2", name: "Hall B2", capacity: 120, type: "lecture", hasComputers: false },
    { id: "v3", name: "Lab C4", capacity: 32, type: "lab", hasComputers: true },
    { id: "v4", name: "Seminar D3", capacity: 25, type: "seminar", hasComputers: false },
  ],
  courses: [
    { id: "c1", code: "CSC301", name: "Advanced Databases", groupSize: 35, requiresLab: true, section: "A" },
    { id: "c2", code: "MAT210", name: "Discrete Mathematics", groupSize: 90, requiresLab: false, section: "MAIN" },
    { id: "c3", code: "INF220", name: "Systems Analysis", groupSize: 45, requiresLab: false, section: "B" },
    { id: "c4", code: "CSC410", name: "Machine Learning", groupSize: 28, requiresLab: true, section: "A" },
  ],
  users: [
    { id: "u1", name: "Leila Moyo", email: "admin@campus.edu", role: "Admin", courses: [], password: "demo", settings: { emailNotif: true, inAppNotif: true, compact: false } },
    { id: "u2", name: "Sam Dube", email: "scheduler@campus.edu", role: "Scheduler", courses: [], password: "demo", settings: { emailNotif: true, inAppNotif: true, compact: false } },
    { id: "u3", name: "Dr Ndlovu", email: "ndlovu@campus.edu", role: "Lecturer", courses: ["c1", "c3"], password: "demo", settings: { emailNotif: true, inAppNotif: true, compact: false } },
    { id: "u4", name: "Dr Dlamini", email: "dlamini@campus.edu", role: "Lecturer", courses: ["c2", "c4"], password: "demo", settings: { emailNotif: true, inAppNotif: true, compact: false } },
    { id: "u5", name: "Aisha Khan", studentNumber: "222883571", email: "222883571@tut4life.ac.za", role: "Student", courses: ["c1", "c2"], password: "demo", settings: { emailNotif: false, inAppNotif: true, compact: false } },
    { id: "u6", name: "Piet Naidoo", studentNumber: "222883572", email: "222883572@tut4life.ac.za", role: "Student", courses: ["c2", "c3"], password: "demo", settings: { emailNotif: false, inAppNotif: true, compact: false } },
  ],
  allocations: [
    { id: "a1", courseId: "c1", venueId: "v1", lecturerId: "u3", date: "2026-04-21", startTime: "09:00", endTime: "11:00", createdBy: "u2", createdAt: new Date().toISOString() },
    { id: "a2", courseId: "c2", venueId: "v2", lecturerId: "u4", date: "2026-04-22", startTime: "13:00", endTime: "15:00", createdBy: "u2", createdAt: new Date().toISOString() },
  ],
  notifications: [
    { id: "n1", fromUserId: "u2", toRole: "All", toUserId: null, title: "Welcome to CampusGrid", message: "The new scheduling platform is live!", createdAt: new Date().toISOString(), readBy: [] },
    { id: "n2", fromUserId: "u1", toRole: "Lecturer", toUserId: null, title: "Timetable Published", message: "Semester 1 timetables are now available.", createdAt: new Date().toISOString(), readBy: [] },
  ],
  logs: [],
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const overlaps = (a0, a1, b0, b1) => toMin(a0) < toMin(b1) && toMin(b0) < toMin(a1);
const nextId = (prefix, list) => {
  const nums = list.map((x) => parseInt(x.id.replace(prefix, ""), 10)).filter(Number.isFinite);
  return `${prefix}${nums.length ? Math.max(...nums) + 1 : 1}`;
};
const fmt = (iso) => new Date(iso).toLocaleString([], { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
const fmtDate = (d) => new Date(d + "T00:00:00").toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
const initials = (name) => name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
const roleTabs = {
  Admin:     ["overview", "venues", "users", "courses", "allocations", "reports", "notifications", "settings"],
  Scheduler: ["overview", "allocations", "conflicts", "archives", "notifications", "settings"],
  Lecturer:  ["overview", "modules", "room-request", "notifications", "settings"],
  Student:   ["overview", "timetable", "notifications", "settings"],
};
const tabMeta = {
  overview:     { label: "Overview",        icon: "⊞" },
  venues:       { label: "Venues",          icon: "📍" },
  users:        { label: "Users",           icon: "👥" },
  courses:      { label: "Course Management", icon: "🎓" },
  allocations:  { label: "Allocations",     icon: "📅" },
  reports:      { label: "Reports",         icon: "📊" },
  conflicts:    { label: "Conflicts",       icon: "⚠️" },
  archives:     { label: "Archives",        icon: "🗄" },
  modules:      { label: "Modules",         icon: "📚" },
  "room-request": { label: "Room Request",  icon: "🚪" },
  notifications: { label: "Notifications",  icon: "🔔" },
  settings:     { label: "Settings",        icon: "⚙️" },
  timetable:    { label: "Timetable",       icon: "🗓" },
};

const STUDENT_DOMAIN = "@tut4life.ac.za";
const STAFF_DOMAIN = "@tut.ac.za";

const isHashedPassword = (value) => typeof value === "string" && value.startsWith("h$");

const hashPassword = (value) => {
  const input = String(value ?? "");
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return `h$${Math.abs(hash).toString(36)}${input.length.toString(36)}`;
};

const verifyPassword = (rawPassword, storedPassword) => {
  if (isHashedPassword(storedPassword)) return hashPassword(rawPassword) === storedPassword;
  return String(rawPassword ?? "") === String(storedPassword ?? "");
};

const normalizeDomainByRole = (email, role) => {
  const normalized = String(email || "").trim().toLowerCase();
  const [localPart = "user"] = normalized.split("@");
  if (normalized.endsWith(STUDENT_DOMAIN) || normalized.endsWith(STAFF_DOMAIN)) return normalized;
  return `${localPart}${role === "Student" ? STUDENT_DOMAIN : STAFF_DOMAIN}`;
};

const studentNumberFromEmail = (email) => String(email || "").trim().toLowerCase().split("@")[0];

const normalizeAuthDb = (incomingDb) => ({
  ...incomingDb,
  users: (incomingDb.users || []).map((user) => {
    const normalizedEmail = normalizeDomainByRole(user.email, user.role);
    return {
      ...user,
      email: normalizedEmail,
      isVerified: user.isVerified ?? true,
      status: user.status ?? (user.role === "Student" ? "PENDING" : "VERIFIED"),
      proofFileName: user.proofFileName ?? null,
      studentNumber: user.role === "Student" ? (user.studentNumber ?? studentNumberFromEmail(normalizedEmail)) : (user.studentNumber ?? null),
      password: isHashedPassword(user.password) ? user.password : hashPassword(user.password),
    };
  }),
});

function validateEmail(email) {
  const normalized = String(email || "").trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!normalized) return { ok: false, error: "Email is required." };
  if (!emailRegex.test(normalized)) return { ok: false, error: "Enter a valid email address." };
  return { ok: true, email: normalized };
}

function validateDomain(email, context = "login") {
  const normalized = String(email || "").trim().toLowerCase();
  const isStudent = normalized.endsWith(STUDENT_DOMAIN);
  const isStaff = normalized.endsWith(STAFF_DOMAIN);

  if (context === "signup") {
    if (!isStudent) return { ok: false, error: `Only ${STUDENT_DOMAIN} is allowed for student signup.` };
    return { ok: true, domainType: "student" };
  }

  if (!isStudent && !isStaff) {
    return { ok: false, error: `Use ${STUDENT_DOMAIN} for students or ${STAFF_DOMAIN} for staff.` };
  }
  return { ok: true, domainType: isStudent ? "student" : "staff" };
}

function loginUser(db, email, password) {
  const emailResult = validateEmail(email);
  if (!emailResult.ok) return { ok: false, error: emailResult.error, errorCode: "EMAIL_INVALID" };

  const domainResult = validateDomain(emailResult.email, "login");
  if (!domainResult.ok) return { ok: false, error: domainResult.error, errorCode: "DOMAIN_INVALID" };

  if (!password) return { ok: false, error: "Password is required.", errorCode: "PASSWORD_REQUIRED" };

  const user = (db.users || []).find((entry) => entry.email.toLowerCase() === emailResult.email);
  if (!user) return { ok: false, error: "Account not found.", errorCode: "ACCOUNT_NOT_FOUND" };

  if (user.role === "Student" && !emailResult.email.endsWith(STUDENT_DOMAIN)) {
    return { ok: false, error: "Student accounts must use @tut4life.ac.za.", errorCode: "DOMAIN_ROLE_MISMATCH" };
  }

  if (user.role !== "Student" && !emailResult.email.endsWith(STAFF_DOMAIN)) {
    return { ok: false, error: "Staff accounts must use @tut.ac.za.", errorCode: "DOMAIN_ROLE_MISMATCH" };
  }

  if (!user.isVerified) {
    return { ok: false, error: "Please verify your email before logging in.", errorCode: "NOT_VERIFIED" };
  }

  if (!verifyPassword(password, user.password)) {
    return { ok: false, error: "Incorrect password.", errorCode: "BAD_PASSWORD" };
  }

  return { ok: true, userId: user.id, role: user.role };
}

function registerUser(db, payload) {
  const { fullName, email, studentNumber, password, confirmPassword } = payload;

  if (!fullName?.trim()) return { ok: false, error: "Full name is required." };

  const emailResult = validateEmail(email);
  if (!emailResult.ok) return { ok: false, error: emailResult.error };

  const domainResult = validateDomain(emailResult.email, "signup");
  if (!domainResult.ok) return { ok: false, error: domainResult.error };

  const derivedStudentNumber = studentNumberFromEmail(emailResult.email);
  const normalizedStudentNumber = String(studentNumber || derivedStudentNumber || "").trim();
  if (!/^\d{7,10}$/.test(normalizedStudentNumber)) return { ok: false, error: "Student number must be 7 to 10 digits." };
  if (derivedStudentNumber && normalizedStudentNumber !== derivedStudentNumber) return { ok: false, error: "Student number must match the numeric part of the student email." };

  if (!password || password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
  if (password !== confirmPassword) return { ok: false, error: "Passwords do not match." };

  if ((db.users || []).some((entry) => entry.email.toLowerCase() === emailResult.email)) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const newUser = {
    id: nextId("u", db.users || []),
    name: fullName.trim(),
    email: emailResult.email,
    studentNumber: normalizedStudentNumber,
    role: "Student",
    courses: [],
    password: hashPassword(password),
    isVerified: false,
    status: "PENDING",
    proofFileName: null,
    settings: { emailNotif: true, inAppNotif: true, compact: false },
  };

  return {
    ok: true,
    db: {
      ...db,
      users: [...(db.users || []), newUser],
    },
    email: newUser.email,
  };
}

function resetPassword(db, payload) {
  const { email, password, confirmPassword } = payload;
  const emailResult = validateEmail(email);
  if (!emailResult.ok) return { ok: false, error: emailResult.error };

  const domainResult = validateDomain(emailResult.email, "login");
  if (!domainResult.ok) return { ok: false, error: domainResult.error };

  const user = (db.users || []).find((entry) => entry.email.toLowerCase() === emailResult.email);
  if (!user) return { ok: false, error: "No account found for this email." };

  if (!password || password.length < 6) return { ok: false, error: "New password must be at least 6 characters." };
  if (password !== confirmPassword) return { ok: false, error: "Passwords do not match." };

  return {
    ok: true,
    db: {
      ...db,
      users: (db.users || []).map((entry) =>
        entry.id === user.id ? { ...entry, password: hashPassword(password) } : entry
      ),
    },
  };
}

function validateAllocation(db, data, excludeId = null) {
  const { courseId, venueId, lecturerId, date, startTime, endTime } = data;
  const course = db.courses.find((c) => c.id === courseId);
  const venue = db.venues.find((v) => v.id === venueId);
  if (!course || !venue) return "Course or venue not found.";
  if (!date || !startTime || !endTime) return "All fields are required.";
  if (toMin(startTime) >= toMin(endTime)) return "Start time must be before end time.";
  if (toMin(startTime) < toMin("07:00") || toMin(endTime) > toMin("20:00")) return "Sessions must be between 07:00 and 20:00.";
  if (course.groupSize > venue.capacity) return `Capacity mismatch: ${venue.name} holds ${venue.capacity}, course needs ${course.groupSize}.`;
  if (course.requiresLab && venue.type !== "lab") return `${course.code} requires a computer lab.`;
  const others = db.allocations.filter((a) => a.id !== excludeId && a.date === date);
  if (others.find((a) => a.venueId === venueId && overlaps(a.startTime, a.endTime, startTime, endTime)))
    return "Conflict: venue already booked in this slot.";
  if (others.find((a) => a.lecturerId === lecturerId && overlaps(a.startTime, a.endTime, startTime, endTime)))
    return "Conflict: lecturer already assigned in this slot.";
  return "";
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return <div className={`toast ${type}`}>{msg}</div>;
}

// ─── Login ────────────────────────────────────────────────────────────────────
function Login({ db, setDb, onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState(localStorage.getItem("campusgridRememberedEmail") || localStorage.getItem("labconnectRememberedEmail") || "");
  const [pass, setPass] = useState("");
  const [rememberMe, setRememberMe] = useState(Boolean(localStorage.getItem("campusgridRememberedEmail") || localStorage.getItem("labconnectRememberedEmail")));
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  const [signupForm, setSignupForm] = useState({ fullName: "", email: "", studentNumber: "", password: "", confirmPassword: "" });
    const [verificationEmail, setVerificationEmail] = useState(null);
    const [verificationMode, setVerificationMode] = useState("pending");
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState("");

  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const clearMessages = () => {
    setErr("");
    setInfo("");
  };

  const handleLogin = async () => {
    clearMessages();
    if (attemptsLeft <= 0) {
      setErr("Too many failed attempts. Use Forgot Password or refresh to try again.");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 550));

    const result = loginUser(db, email, pass);
    if (!result.ok) {
      if (result.errorCode === "BAD_PASSWORD" || result.errorCode === "ACCOUNT_NOT_FOUND") {
        setAttemptsLeft((current) => Math.max(0, current - 1));
      }
      setErr(result.error);
      setLoading(false);
      return;
    }

    if (rememberMe) {
      localStorage.setItem("campusgridRememberedEmail", email.trim().toLowerCase());
      localStorage.removeItem("labconnectRememberedEmail");
    } else {
      localStorage.removeItem("campusgridRememberedEmail");
      localStorage.removeItem("labconnectRememberedEmail");
    }

    onLogin(result.userId);
  };

  const handleRegister = async () => {
    clearMessages();
    const result = registerUser(db, signupForm);
    if (!result.ok) {
      setErr(result.error);
      return;
    }

    try {
      // Call backend API to register user and send welcome email
      const response = await fetch(`${API_BASE}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupForm.fullName,
          email: signupForm.email,
          studentNumber: signupForm.studentNumber,
          password: signupForm.password
        })
      });

      const data = await response.json();
      if (response.status === 403) {
        setErr(data.error);
        setVerificationEmail(email.trim());
        setVerificationMode("not-verified");
        return;
      }
      if (!response.ok) {
        setErr(data.error || 'Signup failed');
        return;
      }

      setDb(result.db);
      setPendingVerificationEmail(result.email);
      setVerificationEmail(result.email);
      setVerificationMode("pending");
      setInfo("Check your email for verification link. Once verified, you can log in.");
      setSignupForm({ fullName: "", email: "", studentNumber: "", password: "", confirmPassword: "" });
    } catch (error) {
      setErr('Network error: ' + error.message);
    }
  };

  const handleVerifyEmail = () => {
    if (!pendingVerificationEmail) return;
    setDb((currentDb) => ({
      ...currentDb,
      users: currentDb.users.map((entry) =>
        entry.email.toLowerCase() === pendingVerificationEmail.toLowerCase()
          ? { ...entry, isVerified: true }
          : entry
      ),
    }));
    setInfo("Email verified. You can now log in.");
    setErr("");
    setEmail(pendingVerificationEmail);
    setPendingVerificationEmail("");
    setMode("login");
  };

  const handleSendResetEmail = () => {
    clearMessages();
    const emailResult = validateEmail(resetEmail);
    if (!emailResult.ok) {
      setErr(emailResult.error);
      return;
    }
    const domainResult = validateDomain(emailResult.email, "login");
    if (!domainResult.ok) {
      setErr(domainResult.error);
      return;
    }
    const exists = db.users.some((entry) => entry.email.toLowerCase() === emailResult.email);
    if (!exists) {
      setErr("No account found for this email.");
      return;
    }
    setResetSent(true);
    setInfo("Password reset email sent (simulated). You can now set a new password.");
  };

  const handleResetPassword = () => {
    clearMessages();
    const result = resetPassword(db, {
      email: resetEmail,
      password: newPassword,
      confirmPassword: confirmNewPassword,
    });
    if (!result.ok) {
      setErr(result.error);
      return;
    }

    setDb(result.db);
    setInfo("Password updated successfully. Please log in.");
    setMode("login");
    setPass("");
    setEmail(resetEmail.trim().toLowerCase());
    setResetSent(false);
    setResetEmail("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  return (
    <div className="login-wrap">
      <div className="login-hero">
        <div className="hero-top">
          <div className="hero-logo">
            <img className="hero-logo-icon" src={campusGridLogo} alt="CampusGrid logo" />
            CampusGrid
          </div>
        </div>
        <div className="hero-middle">
          <div className="hero-eyebrow">Campus Resource Management Platform</div>
          <div className="hero-tagline">Smart scheduling for <em>modern</em> institutions</div>
          <div className="hero-sub">
            CampusGrid streamlines venue allocation, timetable management, and cross-departmental coordination — giving every role the tools they need to work efficiently.
          </div>
          <div className="hero-features">
            {[
              { icon: "📅", title: "Intelligent Scheduling", desc: "Conflict-free allocations with real-time validation" },
              { icon: "🏛️", title: "Venue Management", desc: "Labs, halls & seminar rooms in one system" },
              { icon: "👥", title: "Role-Based Access", desc: "Tailored dashboards for Admins, Schedulers, Lecturers & Students" },
              { icon: "🔔", title: "Instant Notifications", desc: "Stay informed with live in-app alerts" },
            ].map((f) => (
              <div key={f.title} className="hero-feature">
                <div className="hero-feature-icon">{f.icon}</div>
                <div className="hero-feature-text">
                  <strong>{f.title}</strong>
                  <span>{f.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-bottom">
          <p><strong>Authorised access only.</strong> This system is intended for registered staff and students. All activity is logged and monitored in accordance with institutional policy.</p>
        </div>
      </div>
      <div className="login-form-side">
        <div className="login-card">
          <h2>{mode === "signup" ? "Create Student Account" : mode === "forgot" ? "Reset Password" : "Sign In"}</h2>
          <div className="sub">
            {mode === "signup"
              ? "Student registration is only available for @tut4life.ac.za accounts."
              : mode === "forgot"
                ? "Enter your email and set a new password after reset email simulation."
                : "Use your institutional email and password."}
          </div>

          {info && <div className="info-msg">{info}</div>}

          {err && <div className="err-msg">{err}</div>}

          {verificationEmail ? (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📧</div>
              <h3 style={{ marginBottom: ".5rem" }}>Verify Your Email</h3>
              <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>We sent a verification link to <strong>{verificationEmail}</strong></p>
              {verificationMode === "pending" && (
                <p style={{ color: "var(--muted)", fontSize: ".9rem", marginBottom: "1.5rem" }}>Click the link in your email to verify your account. Once verified, you can log in here.</p>
              )}
              {verificationMode === "not-verified" && (
                <p style={{ color: "#ef4444", fontSize: ".9rem", marginBottom: "1.5rem" }}>Your email hasn't been verified yet. Please check your email and click the verification link.</p>
              )}
              <button className="btn-primary" onClick={() => { setVerificationEmail(null); setMode("login"); clearMessages(); }}>Back to Login</button>
            </div>
          ) : (
            <>

          {mode === "login" && (
            <>
              <div className="field">
                <label>Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="name@tut.ac.za" />
              </div>
              <div className="field">
                <label>Password</label>
                <div className="password-wrap">
                  <input
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                  <button type="button" className="toggle-pass" onClick={() => setShowPassword((s) => !s)}>
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <div className="remember-row">
                <label>
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                  Remember Me
                </label>
                <span style={{ fontSize: ".8rem", color: "var(--muted)" }}>Attempts left: {attemptsLeft}</span>
              </div>
              <button className="btn-primary" onClick={handleLogin} disabled={loading}>
                {loading && <span className="spinner" />}
                {loading ? "Signing In..." : "Login"}
              </button>
              <div className="auth-links">
                <button className="auth-link" onClick={() => { clearMessages(); setMode("forgot"); }}>Forgot Password?</button>
                <button className="auth-link" onClick={() => { clearMessages(); setMode("signup"); }}>Sign Up</button>
                <span style={{ fontSize: ".8rem", color: "var(--muted)", display: "block", marginTop: ".8rem" }}>Staff accounts are created by administrators. Students can sign up using the form below.</span>
              </div>
            </>
          )}

          {mode === "signup" && (
            <>
              <div className="info-msg" style={{ marginBottom: "1rem", fontSize: ".9rem", backgroundColor: "rgba(59, 130, 246, 0.08)", borderLeft: "3px solid var(--sky)" }}>Student registration is only available for @tut4life.ac.za accounts. Staff accounts are created by administrators.</div>
              <div className="field"><label>Full Name</label><input value={signupForm.fullName} onChange={(e) => setSignupForm((s) => ({ ...s, fullName: e.target.value }))} type="text" /></div>
              <div className="field"><label>Email</label><input value={signupForm.email} onChange={(e) => setSignupForm((s) => ({ ...s, email: e.target.value }))} type="email" /></div>
              <div className="field"><label>Student Number</label><input value={signupForm.studentNumber} onChange={(e) => setSignupForm((s) => ({ ...s, studentNumber: e.target.value }))} type="text" inputMode="numeric" placeholder="e.g. 222883571" /></div>
              <div className="field">
                <label>Password</label>
                <div className="password-wrap">
                  <input value={signupForm.password} onChange={(e) => setSignupForm((s) => ({ ...s, password: e.target.value }))} type={showPassword ? "text" : "password"} />
                  <button type="button" className="toggle-pass" onClick={() => setShowPassword((s) => !s)}>{showPassword ? "Hide" : "Show"}</button>
                </div>
              </div>
              <div className="field"><label>Confirm Password</label><input value={signupForm.confirmPassword} onChange={(e) => setSignupForm((s) => ({ ...s, confirmPassword: e.target.value }))} type="password" /></div>
              <button className="btn-primary" onClick={handleRegister}>Create Account</button>
              {pendingVerificationEmail && <button className="btn btn-outline" style={{ width: "100%", marginTop: ".7rem" }} onClick={handleVerifyEmail}>Simulate Email Verification</button>}
              <div className="auth-links">
                <button className="auth-link" onClick={() => { clearMessages(); setMode("login"); }}>Back to Login</button>
              </div>
            </>
          )}

          {mode === "forgot" && (
            <>
              <div className="field"><label>Email</label><input value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} type="email" placeholder="name@tut.ac.za" /></div>
              {!resetSent && <button className="btn-primary" onClick={handleSendResetEmail}>Send Reset Email</button>}
              {resetSent && (
                <>
                  <div className="field">
                    <label>New Password</label>
                    <div className="password-wrap">
                      <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type={showPassword ? "text" : "password"} />
                      <button type="button" className="toggle-pass" onClick={() => setShowPassword((s) => !s)}>{showPassword ? "Hide" : "Show"}</button>
                    </div>
                  </div>
                  <div className="field"><label>Confirm New Password</label><input value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} type="password" /></div>
                  <button className="btn-primary" onClick={handleResetPassword}>Update Password</button>
                </>
              )}
              <div className="auth-links">
                <button className="auth-link" onClick={() => { clearMessages(); setMode("login"); setResetSent(false); }}>Back to Login</button>
              </div>
            </>
          )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ user, tab, setTab, onLogout, unread }) {
  const tabs = roleTabs[user.role] || [];
  return (
    <aside className="sidebar">
      <div className="sidebar-logo"><img src={campusGridLogo} alt="CampusGrid logo" /> CampusGrid</div>
      <div className="sidebar-user">
        <div className="name">{user.name}</div>
        <div className="role-tag">{user.role}</div>
      </div>
      <nav className="sidebar-nav">
        {tabs.map((t) => (
          <div key={t} className={`nav-item ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            <span className="nav-icon">{tabMeta[t]?.icon}</span>
            {tabMeta[t]?.label}
            {t === "notifications" && unread > 0 && <span style={{ marginLeft: "auto", background: "#e11d48", color: "white", borderRadius: "999px", fontSize: ".68rem", padding: ".1rem .45rem", fontWeight: 700 }}>{unread}</span>}
          </div>
        ))}
      </nav>
      <div className="sidebar-foot">
        <button className="logout-btn" onClick={onLogout}>← Sign Out</button>
      </div>
    </aside>
  );
}

// ─── Overview Views ───────────────────────────────────────────────────────────
function AdminOverview({ db }) {
  const labs = db.venues.filter((v) => v.type === "lab").length;
  const utilPct = Math.min(100, Math.round((db.allocations.length / (db.venues.length * 4)) * 100));
  const recent = db.allocations.slice(-4).reverse().map((a) => {
    const c = db.courses.find((x) => x.id === a.courseId);
    const v = db.venues.find((x) => x.id === a.venueId);
    const l = db.users.find((x) => x.id === a.lecturerId);
    return { ...a, courseName: c?.code, venueName: v?.name, lecturerName: l?.name };
  });
  return (
    <>
      <div className="panel role-hero"><h3>Admin Dashboard</h3><p>Full system oversight — venues, users, allocations, and reporting.</p></div>
      <div className="kpi-grid">
        <div className="kpi-card"><div className="kpi-label">Total Venues</div><div className="kpi-value">{db.venues.length}</div></div>
        <div className="kpi-card"><div className="kpi-label">Computer Labs</div><div className="kpi-value ok">{labs}</div></div>
        <div className="kpi-card"><div className="kpi-label">Total Allocations</div><div className="kpi-value">{db.allocations.length}</div></div>
        <div className="kpi-card"><div className="kpi-label">Utilization</div><div className="kpi-value">{utilPct}%</div></div>
      </div>
      <div className="dash-grid">
        <div className="panel"><h3>Recent Allocations</h3>
          <div className="table-wrap"><table>
            <thead><tr><th>Course</th><th>Venue</th><th>Date</th><th>Lecturer</th></tr></thead>
            <tbody>{recent.length ? recent.map((a) => (
              <tr key={a.id}><td><span className="badge badge-blue">{a.courseName}</span></td><td>{a.venueName}</td><td>{fmtDate(a.date)}</td><td>{a.lecturerName}</td></tr>
            )) : <tr><td colSpan={4} style={{ color: "var(--muted)", fontStyle: "italic" }}>No allocations yet.</td></tr>}</tbody>
          </table></div>
        </div>
        <div className="panel"><h3>Venue Utilization</h3>
          {db.venues.map((v) => {
            const used = db.allocations.filter((a) => a.venueId === v.id).length;
            const pct = Math.min(100, Math.round((used / 6) * 100));
            return (
              <div key={v.id} className="util-stat">
                <div className="util-label"><span>{v.name}</span><span style={{ color: "var(--muted)" }}>{pct}%</span></div>
                <div className="util-bar-wrap"><div className="util-bar-fill" style={{ width: `${pct}%` }} /></div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function SchedulerOverview({ db, setTab }) {
  const conflicts = db.allocations.filter((a, _, arr) =>
    arr.some((b) => b.id !== a.id && b.date === a.date && b.venueId === a.venueId && overlaps(a.startTime, a.endTime, b.startTime, b.endTime))
  ).length / 2;
  const pending = db.notifications.filter((n) => n.toRole === "Scheduler").length;
  return (
    <>
      <div className="panel role-hero" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div><h3>Scheduler Dashboard</h3><p>Timetable planning, conflict resolution, and allocation control.</p></div>
        <div className="btn-row">
          <button className="btn btn-outline" style={{ color: "white", borderColor: "rgba(255,255,255,.4)" }} onClick={() => setTab("conflicts")}>View Conflicts</button>
          <button className="btn btn-outline" style={{ color: "white", borderColor: "rgba(255,255,255,.4)" }} onClick={() => setTab("allocations")}>New Allocation</button>
        </div>
      </div>
      <div className="kpi-grid">
        <div className="kpi-card"><div className="kpi-label">Venues</div><div className="kpi-value">{db.venues.length}</div></div>
        <div className="kpi-card"><div className="kpi-label">Allocations</div><div className="kpi-value">{db.allocations.length}</div></div>
        <div className="kpi-card"><div className="kpi-label">Pending Requests</div><div className="kpi-value warn">{pending}</div></div>
        <div className="kpi-card"><div className="kpi-label">Conflicts</div><div className="kpi-value warn">{conflicts}</div></div>
      </div>
    </>
  );
}

function LecturerOverview({ db, user, setTab }) {
  const sessions = db.allocations.filter((a) => a.lecturerId === user.id);
  const myCourses = db.courses.filter((c) => user.courses.includes(c.id));
  return (
    <>
      <div className="panel role-hero"><h3>Lecturer Dashboard</h3><p>Teaching schedule, modules, and room requests.</p></div>
      <div className="kpi-grid">
        <div className="kpi-card"><div className="kpi-label">Assigned Modules</div><div className="kpi-value">{myCourses.length}</div></div>
        <div className="kpi-card"><div className="kpi-label">Scheduled Sessions</div><div className="kpi-value">{sessions.length}</div></div>
        <div className="kpi-card"><div className="kpi-label">Students</div><div className="kpi-value">{db.users.filter((u) => u.role === "Student").length}</div></div>
        <div className="kpi-card"><div className="kpi-label">Compliance</div><div className="kpi-value ok">100%</div></div>
      </div>
      <div className="panel"><h3>My Modules</h3>
        <div className="module-grid">
          {myCourses.map((c) => (
            <div key={c.id} className="module-card">
              <strong>{c.code}</strong><p>{c.name}</p>
              <span className={`badge ${c.requiresLab ? "badge-teal" : "badge-blue"}`}>{c.requiresLab ? "Lab Module" : "Lecture Module"}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

const DAILY_QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Learning is not attained by chance; it must be sought for with ardor and attended to with diligence.", author: "Abigail Adams" },
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
  { text: "Great things never came from comfort zones.", author: "Unknown" },
  { text: "Dream it. Wish it. Do it.", author: "Unknown" },
  { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Strive for progress, not perfection.", author: "Unknown" },
  { text: "Small steps every day lead to big results over time.", author: "Unknown" },
  { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
  { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
  { text: "Your only limit is your mind.", author: "Unknown" },
  { text: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
  { text: "A person who never made a mistake never tried anything new.", author: "Albert Einstein" },
  { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "You are braver than you believe, stronger than you seem, and smarter than you think.", author: "A.A. Milne" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { text: "Hardships often prepare ordinary people for an extraordinary destiny.", author: "C.S. Lewis" },
  { text: "Be so good they can't ignore you.", author: "Steve Martin" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
];

function StudentOverview({ db, user }) {
  const myCourses = db.courses.filter((c) => user.courses.includes(c.id));

  // Pick a quote based on day-of-year so it changes daily but is consistent within the day
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const quote = DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];

  // Today's sessions
  const todayName = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date().getDay()];
  const todayAllocs = db.allocations.filter((a) => {
    const d = new Date(a.date + "T00:00:00");
    return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][d.getDay()] === todayName
      && myCourses.some((c) => c.id === a.courseId);
  });

  return (
    <>
      {/* Welcome hero */}
      <div className="panel role-hero" style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 80% 50%, rgba(99,179,237,0.18) 0%, transparent 60%)", pointerEvents: "none" }} />
        <h3 style={{ position: "relative" }}>Welcome back, {user.name.split(" ")[0]}! 👋</h3>
        <p style={{ position: "relative" }}>Here's your day at a glance — make it count.</p>
      </div>

      {/* Daily quote card */}
      <div style={{
        background: "linear-gradient(135deg, #0f2850 0%, #1353c8 60%, #2563eb 100%)",
        border: "none", borderRadius: 16, padding: "1.8rem 2rem",
        boxShadow: "0 8px 32px rgba(19,83,200,.28)", marginBottom: "1.2rem",
        position: "relative", overflow: "hidden",
      }}>
        {/* decorative quote mark */}
        <div style={{ position: "absolute", top: -10, left: 16, fontSize: "8rem", lineHeight: 1, color: "rgba(255,255,255,.07)", fontFamily: "Georgia, serif", userSelect: "none" }}>"</div>
        <div style={{ position: "absolute", bottom: -30, right: 20, fontSize: "8rem", lineHeight: 1, color: "rgba(255,255,255,.07)", fontFamily: "Georgia, serif", userSelect: "none" }}>"</div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: ".5rem", marginBottom: "1rem" }}>
            <span style={{ fontSize: ".7rem", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(255,255,255,.55)", background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.15)", borderRadius: "999px", padding: ".2rem .75rem" }}>
              ✨ Quote of the Day
            </span>
          </div>
          <p style={{ fontSize: "clamp(1rem, 2.2vw, 1.3rem)", fontFamily: "'DM Serif Display', serif", fontStyle: "italic", color: "white", lineHeight: 1.55, marginBottom: "1rem", maxWidth: "55ch" }}>
            "{quote.text}"
          </p>
          <p style={{ fontSize: ".82rem", color: "rgba(255,255,255,.6)", fontWeight: 500 }}>— {quote.author}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="kpi-grid" style={{ marginBottom: "1.2rem" }}>
        <div className="kpi-card"><div className="kpi-label">My Courses</div><div className="kpi-value">{myCourses.length}</div></div>
        <div className="kpi-card"><div className="kpi-label">Today's Sessions</div><div className="kpi-value ok">{todayAllocs.length || "—"}</div></div>
        <div className="kpi-card"><div className="kpi-label">Week Day</div><div className="kpi-value" style={{ fontSize: "1.4rem" }}>{todayName.slice(0, 3)}</div></div>
        <div className="kpi-card"><div className="kpi-label">Campus</div><div className="kpi-value" style={{ fontSize: "1.3rem" }}>🎓</div></div>
      </div>

      {/* Today's sessions or nudge */}
      <div className="panel">
        <h3>Today — {todayName}</h3>
        {todayAllocs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "1.5rem 1rem", color: "var(--muted)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: ".5rem" }}>☕</div>
            <div style={{ fontWeight: 600, marginBottom: ".25rem" }}>No scheduled sessions today.</div>
            <div style={{ fontSize: ".85rem" }}>Use the time to review your notes or get ahead on assignments!</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: ".7rem" }}>
            {todayAllocs.map((a) => {
              const c = myCourses.find((x) => x.id === a.courseId);
              const v = db.venues.find((x) => x.id === a.venueId);
              const col = SESSION_COLORS[myCourses.indexOf(c) % SESSION_COLORS.length];
              return (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: "1rem", background: col.bg, border: `1.5px solid ${col.border}`, borderLeft: `5px solid ${col.border}`, borderRadius: 12, padding: ".8rem 1.1rem" }}>
                  <div style={{ textAlign: "center", minWidth: 52 }}>
                    <div style={{ fontSize: ".75rem", fontWeight: 700, color: col.text }}>{a.startTime}</div>
                    <div style={{ fontSize: ".68rem", color: "var(--muted)" }}>{a.endTime}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: col.text, fontSize: ".88rem" }}>{c?.code}</div>
                    <div style={{ fontSize: ".84rem", color: "var(--ink)" }}>{c?.name}</div>
                    {v && <div style={{ fontSize: ".76rem", color: "var(--muted)", marginTop: ".15rem" }}>📍 {v.name}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Venues Tab ───────────────────────────────────────────────────────────────
function VenuesTab({ db, setDb, toast }) {
  const [form, setForm] = useState({ name: "", capacity: "", type: "lab", hasComputers: false });
  const [editing, setEditing] = useState(null);

  const save = () => {
    if (!form.name || !form.capacity) { toast("Fill all fields.", "error"); return; }
    if (editing) {
      setDb((d) => ({ ...d, venues: d.venues.map((v) => v.id === editing ? { ...v, ...form, capacity: +form.capacity } : v) }));
      toast("Venue updated.", "success"); setEditing(null);
    } else {
      const nv = { id: nextId("v", db.venues), ...form, capacity: +form.capacity };
      setDb((d) => ({ ...d, venues: [...d.venues, nv] }));
      toast("Venue added.", "success");
    }
    setForm({ name: "", capacity: "", type: "lab", hasComputers: false });
  };

  const del = (id) => {
    if (db.allocations.some((a) => a.venueId === id)) { toast("Cannot delete: venue has allocations.", "error"); return; }
    setDb((d) => ({ ...d, venues: d.venues.filter((v) => v.id !== id) }));
    toast("Venue removed.", "success");
  };

  const edit = (v) => { setEditing(v.id); setForm({ name: v.name, capacity: String(v.capacity), type: v.type, hasComputers: v.hasComputers }); };

  return (
    <>
      <div className="panel">
        <div className="panel-row"><h3>{editing ? "Edit Venue" : "Add Venue"}</h3>{editing && <button className="btn btn-outline btn-sm" onClick={() => { setEditing(null); setForm({ name: "", capacity: "", type: "lab", hasComputers: false }); }}>Cancel</button>}</div>
        <div className="form-grid">
          <input placeholder="Venue name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <input type="number" placeholder="Capacity" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} />
          <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
            <option value="lab">Lab</option><option value="lecture">Lecture Hall</option><option value="seminar">Seminar Room</option>
          </select>
          <label style={{ display: "flex", alignItems: "center", gap: ".5rem", fontSize: ".88rem" }}>
            <input type="checkbox" checked={form.hasComputers} onChange={(e) => setForm((f) => ({ ...f, hasComputers: e.target.checked }))} /> Has Computers
          </label>
          <button className="btn btn-blue" onClick={save}>{editing ? "Update" : "Add Venue"}</button>
        </div>
      </div>
      <div className="panel"><h3>All Venues</h3>
        <div className="table-wrap"><table>
          <thead><tr><th>Name</th><th>Type</th><th>Capacity</th><th>Computers</th><th>Actions</th></tr></thead>
          <tbody>{db.venues.map((v) => (
            <tr key={v.id}>
              <td><strong>{v.name}</strong></td>
              <td><span className={`badge ${v.type === "lab" ? "badge-teal" : v.type === "lecture" ? "badge-blue" : "badge-amber"}`}>{v.type}</span></td>
              <td>{v.capacity}</td>
              <td>{v.hasComputers ? "✅" : "—"}</td>
              <td><div className="btn-row"><button className="btn btn-outline btn-sm" onClick={() => edit(v)}>Edit</button><button className="btn btn-danger btn-sm" onClick={() => del(v.id)}>Delete</button></div></td>
            </tr>
          ))}</tbody>
        </table></div>
      </div>
    </>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────
function UsersTab({ db, setDb, toast }) {
  const emptyForm = { name: "", email: "", role: "Scheduler", password: "", courses: [] };
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const roleOptions = editingId ? ["Admin", "Scheduler", "Lecturer", "Student"] : ["Admin", "Scheduler", "Lecturer"];

  const refreshUsers = async () => {
    const response = await fetch(`${API_BASE}/api/admin/users`);
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "Failed to load users");
    }
    setDb((d) => ({ ...d, users: normalizeAuthDb({ users: payload.users }).users }));
  };

  const save = async () => {
    if (!form.name || !form.email || !form.role) { toast("Fill all fields.", "error"); return; }
    if (!editingId && !form.password) { toast("Password is required for new users.", "error"); return; }
    if (!editingId && form.role === "Student") { toast("Students must self-register via Sign Up.", "error"); return; }

    const isStaff = ["Admin", "Scheduler", "Lecturer"].includes(form.role);
    if (isStaff && !form.email.toLowerCase().endsWith("@tut.ac.za")) {
      toast("Staff email must end with @tut.ac.za", "error");
      return;
    }
    if (form.role === "Student" && !form.email.toLowerCase().endsWith("@tut4life.ac.za")) {
      toast("Student email must end with @tut4life.ac.za", "error");
      return;
    }

    setSaving(true);
    try {
      const endpoint = editingId ? `${API_BASE}/api/admin/users/${editingId}` : `${API_BASE}/api/admin/users`;
      const method = editingId ? "PUT" : "POST";
      const selectedCourses = form.role === "Lecturer" ? form.courses : [];
      const body = editingId
        ? { name: form.name, email: form.email, role: form.role, courses: selectedCourses, ...(form.password ? { password: form.password } : {}) }
        : { name: form.name, email: form.email, role: form.role, password: form.password, courses: selectedCourses };

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to save user");
      }

      await refreshUsers();
      setForm(emptyForm);
      setEditingId(null);
      toast(editingId ? "User updated." : "User added.", "success");
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const edit = (user) => {
    setEditingId(user.id);
    setForm({ name: user.name, email: user.email, role: user.role, password: "", courses: user.courses || [] });
  };

  const del = async (id) => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/users/${id}`, { method: "DELETE" });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to delete user");
      }
      await refreshUsers();
      toast("User removed.", "success");
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="panel"><h3>{editingId ? "Edit User" : "Add User"}</h3>
        <div className="form-grid">
          <input placeholder="Full name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <input placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
            {roleOptions.map((r) => <option key={r}>{r}</option>)}
          </select>
          <input placeholder={editingId ? "New password (optional)" : "Password"} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
          {form.role === "Lecturer" && (
            <select value="" onChange={(e) => {
              const courseId = e.target.value;
              if (!courseId) return;
              setForm((f) => ({ ...f, courses: [...new Set([...(f.courses || []), courseId])] }));
            }}>
              <option value="">Add module by code/name</option>
              {db.courses
                .filter((c) => !(form.courses || []).includes(c.id))
                .map((c) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
            </select>
          )}
          {form.role === "Lecturer" && (
            <div className="form-full" style={{ border: "1px solid var(--line)", borderRadius: 10, padding: ".55rem .7rem", background: "#f8fbff" }}>
              <div style={{ fontSize: ".8rem", color: "var(--muted)", marginBottom: ".45rem" }}>Assigned modules</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem" }}>
                {(form.courses || []).map((courseId) => {
                  const course = db.courses.find((c) => c.id === courseId);
                  if (!course) return null;
                  return (
                    <button
                      key={courseId}
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setForm((f) => ({ ...f, courses: (f.courses || []).filter((id) => id !== courseId) }))}
                      style={{ padding: ".2rem .5rem" }}
                    >
                      {course.code} ×
                    </button>
                  );
                })}
                {(form.courses || []).length === 0 && <span style={{ fontSize: ".78rem", color: "var(--muted)", fontStyle: "italic" }}>No modules selected.</span>}
              </div>
            </div>
          )}
          <button className="btn btn-blue" onClick={save} disabled={saving}>{editingId ? "Update User" : "Add User"}</button>
          {editingId && <button className="btn btn-outline" onClick={() => { setEditingId(null); setForm(emptyForm); }} disabled={saving}>Cancel</button>}
        </div>
      </div>
      <div className="panel"><h3>All Users ({db.users.length})</h3>
        <div className="table-wrap"><table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Modules / Students</th><th>Actions</th></tr></thead>
          <tbody>{db.users.map((u) => (
            <tr key={u.id}>
              <td><div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}><div className="avatar" style={{ width: 28, height: 28, fontSize: ".72rem" }}>{initials(u.name)}</div>{u.name}</div></td>
              <td style={{ color: "var(--muted)" }}>{u.email}</td>
              <td><span className={`badge ${{ Admin: "badge-rose", Scheduler: "badge-amber", Lecturer: "badge-blue", Student: "badge-teal" }[u.role]}`}>{u.role}</span></td>
              <td>
                {u.role !== "Lecturer"
                  ? <span style={{ color: "var(--muted)" }}>—</span>
                  : (() => {
                    const taughtCourses = db.courses.filter((c) => (u.courses || []).includes(c.id));
                    const taughtCourseIds = new Set(taughtCourses.map((c) => c.id));
                    const linkedStudents = db.users.filter((s) => s.role === "Student" && (s.courses || []).some((courseId) => taughtCourseIds.has(courseId)));
                    return (
                      <div>
                        <div style={{ fontSize: ".78rem", color: "var(--ink)", fontWeight: 600 }}>{taughtCourses.map((c) => c.code).join(", ") || "No modules"}</div>
                        <div style={{ fontSize: ".74rem", color: "var(--muted)" }}>{linkedStudents.length} linked student{linkedStudents.length === 1 ? "" : "s"}</div>
                      </div>
                    );
                  })()}
              </td>
              <td><div className="btn-row"><button className="btn btn-outline btn-sm" onClick={() => edit(u)} disabled={saving}>Edit</button><button className="btn btn-danger btn-sm" onClick={() => del(u.id)} disabled={saving}>Remove</button></div></td>
            </tr>
          ))}</tbody>
        </table></div>
      </div>
    </>
  );
}

// ─── Allocations Tab ──────────────────────────────────────────────────────────
function AllocationsTab({ db, setDb, toast, userId }) {
  const [form, setForm] = useState({ courseId: "", venueId: "", lecturerId: "", date: "", startTime: "", endTime: "" });
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState("");

  const lecturers = db.users.filter((u) => u.role === "Lecturer");
  const err = form.courseId ? validateAllocation(db, form, editId) : "";

  const save = () => {
    const e = validateAllocation(db, form, editId);
    if (e) { toast(e, "error"); return; }
    if (editId) {
      setDb((d) => ({ ...d, allocations: d.allocations.map((a) => a.id === editId ? { ...a, ...form } : a) }));
      toast("Allocation updated.", "success"); setEditId(null);
    } else {
      setDb((d) => ({ ...d, allocations: [...d.allocations, { id: nextId("a", d.allocations), ...form, createdBy: userId, createdAt: new Date().toISOString() }] }));
      toast("Allocation created.", "success");
    }
    setForm({ courseId: "", venueId: "", lecturerId: "", date: "", startTime: "", endTime: "" });
  };

  const del = (id) => { setDb((d) => ({ ...d, allocations: d.allocations.filter((a) => a.id !== id) })); toast("Allocation removed.", "success"); };
  const startEdit = (a) => { setEditId(a.id); setForm({ courseId: a.courseId, venueId: a.venueId, lecturerId: a.lecturerId, date: a.date, startTime: a.startTime, endTime: a.endTime }); };

  const alloc = db.allocations.filter((a) => {
    if (!filter) return true;
    const c = db.courses.find((x) => x.id === a.courseId);
    const v = db.venues.find((x) => x.id === a.venueId);
    return (c?.code + c?.name + v?.name + a.date).toLowerCase().includes(filter.toLowerCase());
  });

  return (
    <>
      <div className="panel">
        <div className="panel-row"><h3>{editId ? "Edit Allocation" : "New Allocation"}</h3>{editId && <button className="btn btn-outline btn-sm" onClick={() => { setEditId(null); setForm({ courseId: "", venueId: "", lecturerId: "", date: "", startTime: "", endTime: "" }); }}>Cancel</button>}</div>
        {err && <div className="err-msg" style={{ marginBottom: ".8rem" }}>{err}</div>}
        <div className="form-grid">
          <select value={form.courseId} onChange={(e) => setForm((f) => ({ ...f, courseId: e.target.value }))}>
            <option value="">Select course</option>{db.courses.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
          </select>
          <select value={form.venueId} onChange={(e) => setForm((f) => ({ ...f, venueId: e.target.value }))}>
            <option value="">Select venue</option>{db.venues.map((v) => <option key={v.id} value={v.id}>{v.name} (cap: {v.capacity})</option>)}
          </select>
          <select value={form.lecturerId} onChange={(e) => setForm((f) => ({ ...f, lecturerId: e.target.value }))}>
            <option value="">Select lecturer</option>{lecturers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          <input type="time" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} />
          <input type="time" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} />
          <button className="btn btn-blue" onClick={save}>{editId ? "Update" : "Create Allocation"}</button>
        </div>
      </div>
      <div className="panel">
        <div className="panel-row"><h3>Allocations ({alloc.length})</h3>
          <input style={{ borderRadius: 8, border: "1.5px solid var(--line)", padding: ".4rem .7rem", fontSize: ".85rem", outline: "none" }} placeholder="Search…" value={filter} onChange={(e) => setFilter(e.target.value)} />
        </div>
        <div className="table-wrap"><table>
          <thead><tr><th>Course</th><th>Venue</th><th>Lecturer</th><th>Date</th><th>Time</th><th>Actions</th></tr></thead>
          <tbody>{alloc.length ? alloc.map((a) => {
            const c = db.courses.find((x) => x.id === a.courseId);
            const v = db.venues.find((x) => x.id === a.venueId);
            const l = db.users.find((x) => x.id === a.lecturerId);
            return (
              <tr key={a.id}>
                <td><span className="badge badge-blue">{c?.code}</span></td>
                <td>{v?.name}</td><td>{l?.name}</td><td>{fmtDate(a.date)}</td>
                <td>{a.startTime}–{a.endTime}</td>
                <td><div className="btn-row"><button className="btn btn-outline btn-sm" onClick={() => startEdit(a)}>Edit</button><button className="btn btn-danger btn-sm" onClick={() => del(a.id)}>Delete</button></div></td>
              </tr>
            );
          }) : <tr><td colSpan={6} style={{ color: "var(--muted)", fontStyle: "italic" }}>No allocations found.</td></tr>}</tbody>
        </table></div>
      </div>
    </>
  );
}

// ─── Conflicts Tab ────────────────────────────────────────────────────────────
function ConflictsTab({ db }) {
  const conflicts = [];
  db.allocations.forEach((a, i) => {
    db.allocations.forEach((b, j) => {
      if (j <= i) return;
      if (a.date === b.date && (a.venueId === b.venueId || a.lecturerId === b.lecturerId) && overlaps(a.startTime, a.endTime, b.startTime, b.endTime)) {
        const ca = db.courses.find((x) => x.id === a.courseId);
        const cb = db.courses.find((x) => x.id === b.courseId);
        const v = db.venues.find((x) => x.id === a.venueId);
        const type = a.venueId === b.venueId ? "Venue conflict" : "Lecturer double-booked";
        conflicts.push({ id: `${a.id}-${b.id}`, type, detail: `${ca?.code} and ${cb?.code} — ${v?.name} on ${fmtDate(a.date)} ${a.startTime}–${a.endTime}` });
      }
    });
  });
  return (
    <div className="panel">
      <h3>Scheduling Conflicts {conflicts.length > 0 && <span className="badge badge-rose" style={{ marginLeft: ".5rem" }}>{conflicts.length}</span>}</h3>
      {conflicts.length === 0
        ? <p style={{ color: "var(--muted)", fontStyle: "italic" }}>✅ No conflicts detected. All allocations are clear.</p>
        : conflicts.map((c) => (
          <div key={c.id} className="conflict-card">
            <h4>⚠️ {c.type}</h4><p>{c.detail}</p>
          </div>
        ))}
    </div>
  );
}

// ─── Reports Tab ──────────────────────────────────────────────────────────────
function ReportsTab({ db }) {
  const download = (type) => {
    let headers, rows;
    if (type === "allocations") {
      headers = ["ID", "Course Code", "Course Name", "Venue", "Lecturer", "Date", "Start", "End"];
      rows = db.allocations.map((a) => {
        const c = db.courses.find((x) => x.id === a.courseId);
        const v = db.venues.find((x) => x.id === a.venueId);
        const l = db.users.find((x) => x.id === a.lecturerId);
        return [a.id, c?.code, c?.name, v?.name, l?.name, a.date, a.startTime, a.endTime];
      });
    } else {
      headers = ["ID", "Name", "Email", "Role"];
      rows = db.users.map((u) => [u.id, u.name, u.email, u.role]);
    }
    const csv = [headers, ...rows].map((r) => r.map((x) => `"${x ?? ""}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `${type}_report.csv`;
    a.click();
  };
  return (
    <div className="panel"><h3>Download Reports</h3>
      <p style={{ color: "var(--muted)", fontSize: ".88rem", marginBottom: "1rem" }}>Export data as CSV for offline analysis.</p>
      <div className="btn-row">
        <button className="btn btn-blue" onClick={() => download("allocations")}>📥 Allocations Report</button>
        <button className="btn btn-outline" onClick={() => download("users")}>📥 Users Report</button>
      </div>
    </div>
  );
}

// ─── Archives Tab ─────────────────────────────────────────────────────────────
function ArchivesTab({ db }) {
  const past = db.allocations.filter((a) => a.date < new Date().toISOString().slice(0, 10));
  return (
    <div className="panel"><h3>Archived Sessions ({past.length})</h3>
      <div className="table-wrap"><table>
        <thead><tr><th>Course</th><th>Venue</th><th>Date</th><th>Time</th></tr></thead>
        <tbody>{past.length ? past.map((a) => {
          const c = db.courses.find((x) => x.id === a.courseId);
          const v = db.venues.find((x) => x.id === a.venueId);
          return <tr key={a.id}><td><span className="badge badge-amber">{c?.code}</span></td><td>{v?.name}</td><td>{fmtDate(a.date)}</td><td>{a.startTime}–{a.endTime}</td></tr>;
        }) : <tr><td colSpan={4} style={{ color: "var(--muted)", fontStyle: "italic" }}>No past sessions.</td></tr>}</tbody>
      </table></div>
    </div>
  );
}

// ─── Modules Tab ──────────────────────────────────────────────────────────────
function ModulesTab({ db, user }) {
  const myCourses = db.courses.filter((c) => user.courses.includes(c.id));
  return (
    <div className="panel"><h3>My Modules</h3>
      <div className="module-grid">
        {myCourses.map((c) => (
          <div key={c.id} className="module-card">
            <strong>{c.code}</strong><p>{c.name}</p>
            <p style={{ fontSize: ".78rem", color: "var(--muted)" }}>Group size: {c.groupSize}</p>
            <span className={`badge ${c.requiresLab ? "badge-teal" : "badge-blue"}`}>{c.requiresLab ? "Lab Required" : "No Lab Needed"}</span>
          </div>
        ))}
        {myCourses.length === 0 && <p style={{ color: "var(--muted)", fontStyle: "italic" }}>No modules assigned.</p>}
      </div>
    </div>
  );
}

// ─── Room Request Tab ─────────────────────────────────────────────────────────
function RoomRequestTab({ db, setDb, user, toast }) {
  const [form, setForm] = useState({ courseId: "", date: "", time: "", reason: "" });
  const myRequests = db.notifications.filter((n) => n.fromUserId === user.id && n.toRole === "Scheduler");

  const submit = () => {
    if (!form.courseId || !form.date || !form.reason) { toast("Fill all fields.", "error"); return; }
    const c = db.courses.find((x) => x.id === form.courseId);
    const notif = {
      id: nextId("n", db.notifications),
      fromUserId: user.id,
      toRole: "Scheduler",
      toUserId: null,
      title: `Room Request: ${c?.code}`,
      message: `Date: ${form.date} at ${form.time || "TBD"}. Reason: ${form.reason}`,
      createdAt: new Date().toISOString(),
      readBy: [],
    };
    setDb((d) => ({ ...d, notifications: [...d.notifications, notif] }));
    setForm({ courseId: "", date: "", time: "", reason: "" });
    toast("Request submitted to Scheduler.", "success");
  };

  return (
    <>
      <div className="panel"><h3>Submit Room Request</h3>
        <div className="form-grid">
          <select value={form.courseId} onChange={(e) => setForm((f) => ({ ...f, courseId: e.target.value }))}>
            <option value="">Select module</option>
            {db.courses.filter((c) => user.courses.includes(c.id)).map((c) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
          </select>
          <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          <input type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
          <input placeholder="Reason for request" value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} className="form-full" />
          <button className="btn btn-blue" onClick={submit}>Submit Request</button>
        </div>
      </div>
      <div className="panel"><h3>My Requests ({myRequests.length})</h3>
        {myRequests.length === 0 ? <p style={{ color: "var(--muted)", fontStyle: "italic" }}>No requests submitted yet.</p>
          : myRequests.map((n) => (
            <div key={n.id} className="notif-row">
              <div className="notif-icon">📋</div>
              <div className="notif-body"><div className="title">{n.title}</div><div className="msg">{n.message}</div><div className="meta">{fmt(n.createdAt)}</div></div>
            </div>
          ))}
      </div>
    </>
  );
}

// ─── Timetable Tab ────────────────────────────────────────────────────────────
const SESSION_COLORS = [
  { bg: "#eff6ff", border: "#3b82f6", text: "#1d4ed8", light: "#dbeafe" },
  { bg: "#f0fdfa", border: "#0d9488", text: "#0f766e", light: "#ccfbf1" },
  { bg: "#fdf4ff", border: "#a855f7", text: "#7e22ce", light: "#f3e8ff" },
  { bg: "#fff7ed", border: "#f97316", text: "#c2410c", light: "#fed7aa" },
  { bg: "#fff1f2", border: "#f43f5e", text: "#be123c", light: "#ffe4e6" },
  { bg: "#f0fdf4", border: "#22c55e", text: "#15803d", light: "#dcfce7" },
];

const SLOTS = [
  { label: "08:00", end: "09:30" },
  { label: "10:00", end: "11:30" },
  { label: "12:00", end: "13:30" },
  { label: "14:00", end: "15:30" },
  { label: "16:00", end: "17:30" },
];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri"];

function TimetableTab({ db, user }) {
  const myCourses = db.courses.filter((c) => user.courses.includes(c.id));
  const SA_TIME_ZONE = "Africa/Johannesburg";

  // Build a grid: slot × day → session object or null
  // Distribute courses across the grid semi-realistically
  const grid = SLOTS.map((slot, si) =>
    DAYS.map((_, di) => {
      // Place courses in a fixed pattern across days/slots
      const idx = (si * 2 + di * 3) % (myCourses.length * 3);
      if (idx < myCourses.length && (si + di) % 3 !== 0) {
        const c = myCourses[idx % myCourses.length];
        const v = db.venues[idx % db.venues.length];
        const l = db.users.find((u) => u.id === db.allocations.find((a) => a.courseId === c.id)?.lecturerId);
        const colorIdx = myCourses.indexOf(c) % SESSION_COLORS.length;
        return { course: c, venue: v, lecturer: l, color: SESSION_COLORS[colorIdx] };
      }
      return null;
    })
  );

  const saWeekday = new Intl.DateTimeFormat("en-ZA", {
    timeZone: SA_TIME_ZONE,
    weekday: "short",
  }).format(new Date());
  const todayIdx = DAY_SHORT.indexOf(saWeekday);

  const headerDateLabel = (dayIndex) => {
    if (todayIdx < 0) return "";
    const dayOffset = dayIndex - todayIdx;
    const date = new Date(Date.now() + dayOffset * 24 * 60 * 60 * 1000);
    return new Intl.DateTimeFormat("en-ZA", {
      timeZone: SA_TIME_ZONE,
      day: "numeric",
      month: "short",
    }).format(date);
  };

  const totalSessions = grid.flat().filter(Boolean).length;
  const uniqueCodes = [...new Set(grid.flat().filter(Boolean).map((s) => s.course.code))];

  return (
    <div>
      {/* Legend / summary */}
      <div style={{ display: "flex", gap: ".7rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        {uniqueCodes.map((code, i) => {
          const col = SESSION_COLORS[i % SESSION_COLORS.length];
          return (
            <div key={code} style={{ display: "flex", alignItems: "center", gap: ".4rem", background: col.light, border: `1px solid ${col.border}`, borderRadius: "999px", padding: ".25rem .85rem", fontSize: ".78rem", fontWeight: 600, color: col.text }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: col.border, display: "inline-block" }} />
              {code}
            </div>
          );
        })}
        <div style={{ marginLeft: "auto", fontSize: ".8rem", color: "var(--muted)", alignSelf: "center" }}>{totalSessions} sessions this week</div>
      </div>

      {/* Grid */}
      <div style={{ background: "var(--white)", border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden", boxShadow: "var(--shadow)" }}>
        {/* Header row */}
        <div style={{ display: "grid", gridTemplateColumns: "72px repeat(5, 1fr)", borderBottom: "2px solid var(--line)" }}>
          <div style={{ padding: ".7rem .5rem", background: "#f8fafc" }} />
          {DAYS.map((day, di) => {
            const isToday = di === todayIdx;
            return (
              <div key={day} style={{ padding: ".75rem .5rem", textAlign: "center", background: isToday ? "var(--navy)" : "#f8fafc", borderLeft: "1px solid var(--line)" }}>
                <div style={{ fontSize: ".7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: isToday ? "rgba(255,255,255,.65)" : "var(--muted)" }}>{DAY_SHORT[di]}</div>
                <div style={{ fontSize: ".95rem", fontWeight: isToday ? 700 : 500, color: isToday ? "white" : "var(--ink)", marginTop: ".1rem" }}>{day.slice(0, 3)} {headerDateLabel(di)}</div>
                {isToday && <div style={{ fontSize: ".65rem", background: "rgba(255,255,255,.18)", color: "white", borderRadius: "999px", padding: ".05rem .45rem", display: "inline-block", marginTop: ".25rem" }}>Today</div>}
              </div>
            );
          })}
        </div>

        {/* Slot rows */}
        {SLOTS.map((slot, si) => (
          <div key={slot.label} style={{ display: "grid", gridTemplateColumns: "72px repeat(5, 1fr)", borderBottom: si < SLOTS.length - 1 ? "1px solid var(--line)" : "none", minHeight: 88 }}>
            {/* Time column */}
            <div style={{ padding: ".7rem .5rem", background: "#f8fafc", borderRight: "1px solid var(--line)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: ".15rem" }}>
              <span style={{ fontSize: ".78rem", fontWeight: 700, color: "var(--navy)" }}>{slot.label}</span>
              <span style={{ fontSize: ".68rem", color: "var(--muted)" }}>{slot.end}</span>
            </div>

            {/* Day cells */}
            {DAYS.map((_, di) => {
              const session = grid[si][di];
              const isToday = di === todayIdx;
              return (
                <div key={di} style={{ borderLeft: "1px solid var(--line)", padding: ".45rem .4rem", background: isToday ? "rgba(11,42,92,.02)" : "transparent", display: "flex", alignItems: "stretch" }}>
                  {session ? (
                    <div style={{
                      flex: 1, background: session.color.bg,
                      border: `1.5px solid ${session.color.border}`,
                      borderLeft: `4px solid ${session.color.border}`,
                      borderRadius: 9, padding: ".45rem .55rem",
                      display: "flex", flexDirection: "column", gap: ".18rem",
                      cursor: "default", transition: "transform .15s",
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                      onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                    >
                      <div style={{ fontSize: ".78rem", fontWeight: 800, color: session.color.text, letterSpacing: ".02em" }}>{session.course.code}</div>
                      <div style={{ fontSize: ".76rem", fontWeight: 500, color: "var(--ink)", lineHeight: 1.3 }}>{session.course.name}</div>
                      {session.venue && <div style={{ fontSize: ".7rem", color: "var(--muted)", marginTop: ".1rem" }}>📍 {session.venue.name}</div>}
                      {session.lecturer && <div style={{ fontSize: ".7rem", color: "var(--muted)" }}>👤 {session.lecturer.name.split(" ")[1]}</div>}
                    </div>
                  ) : (
                    <div style={{ flex: 1, borderRadius: 9, background: "transparent" }} />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p style={{ fontSize: ".78rem", color: "var(--muted)", marginTop: ".9rem", textAlign: "center" }}>
        Hover over a session card to highlight it · Times shown are SAST
      </p>
    </div>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────
function NotificationsTab({ db, setDb, user, toast }) {
  const [form, setForm] = useState({ to: "", title: "", message: "" });
  const canSend = ["Admin", "Scheduler", "Lecturer"].includes(user.role);
  const isAdminOrScheduler = ["Admin", "Scheduler"].includes(user.role);

  const visible = db.notifications.filter((n) =>
    n.toRole === "All" || n.toRole === user.role || n.toUserId === user.id || (n.fromUserId === user.id)
  );
  const unread = visible.filter((n) => !n.readBy.includes(user.id));

  const markAllRead = () => {
    setDb((d) => ({ ...d, notifications: d.notifications.map((n) => visible.some((v) => v.id === n.id) ? { ...n, readBy: [...new Set([...n.readBy, user.id])] } : n) }));
    toast("All notifications marked as read.", "success");
  };

  const send = () => {
    if (!form.to || !form.title) { toast("Fill all fields.", "error"); return; }
    const [type, val] = form.to.split(":");

    if (type === "course") {
      const enrolledStudents = db.users.filter((u) => u.role === "Student" && (u.courses || []).includes(val));
      const course = db.courses.find((c) => c.id === val);

      if (enrolledStudents.length === 0) {
        toast("No students are linked to that module/course.", "error");
        return;
      }

      const createdAt = new Date().toISOString();
      const scopedMessage = `${form.message}${form.message ? " " : ""}[Module: ${course?.code || val}]`;
      const tempList = [...db.notifications];
      const nextNotifications = enrolledStudents.map((student) => {
        const id = nextId("n", tempList);
        const notification = {
          id,
          fromUserId: user.id,
          toRole: "Student",
          toUserId: student.id,
          title: form.title,
          message: scopedMessage,
          createdAt,
          readBy: [],
        };
        tempList.push(notification);
        return notification;
      });

      setDb((d) => ({ ...d, notifications: [...d.notifications, ...nextNotifications] }));
      setForm({ to: "", title: "", message: "" });
      toast(`Notification sent to ${enrolledStudents.length} student${enrolledStudents.length === 1 ? "" : "s"}.`, "success");
      return;
    }

    const n = {
      id: nextId("n", db.notifications),
      fromUserId: user.id,
      toRole: type === "role" ? val : "All",
      toUserId: type === "user" ? val : null,
      title: form.title,
      message: form.message,
      createdAt: new Date().toISOString(),
      readBy: [],
    };
    setDb((d) => ({ ...d, notifications: [...d.notifications, n] }));
    setForm({ to: "", title: "", message: "" });
    toast("Notification sent.", "success");
  };

  const recipientOpts = isAdminOrScheduler
    ? [
        { v: "role:Student", l: "All Students" },
        { v: "role:Scheduler", l: "All Schedulers" },
        { v: "role:Lecturer", l: "All Lecturers" },
        ...db.courses.map((c) => ({ v: `course:${c.id}`, l: `Students in ${c.code} — ${c.name}` })),
      ]
    : [
        { v: "role:All", l: "Everyone" },
        { v: "role:Student", l: "All Students" },
        { v: "role:Lecturer", l: "All Lecturers" },
        { v: "role:Scheduler", l: "All Schedulers" },
        ...db.users.filter((u) => u.id !== user.id).map((u) => ({ v: `user:${u.id}`, l: `${u.name} (${u.role})` })),
      ];

  return (
    <>
      {canSend && (
        <div className="panel"><h3>Send Notification</h3>
          <div className="form-grid">
            <select value={form.to} onChange={(e) => setForm((f) => ({ ...f, to: e.target.value }))}>
              <option value="">Select recipient</option>
              {recipientOpts.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
            <input placeholder="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            <input placeholder="Message" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} className="form-full" />
            <button className="btn btn-blue" onClick={send}>Send</button>
          </div>
        </div>
      )}
      <div className="panel">
        <div className="panel-row">
          <h3>Inbox {unread.length > 0 && <span className="badge badge-rose" style={{ marginLeft: ".4rem" }}>{unread.length} new</span>}</h3>
          {unread.length > 0 && <button className="btn btn-outline btn-sm" onClick={markAllRead}>Mark all read</button>}
        </div>
        {visible.length === 0 ? <p style={{ color: "var(--muted)", fontStyle: "italic" }}>No notifications.</p>
          : visible.map((n) => {
            const sender = db.users.find((u) => u.id === n.fromUserId);
            const isUnread = !n.readBy.includes(user.id);
            return (
              <div key={n.id} className={`notif-row ${isUnread ? "notif-unread" : ""}`}>
                <div className="notif-icon">{isUnread ? "🔔" : "📭"}</div>
                <div className="notif-body">
                  <div className="title">{n.title}</div>
                  <div className="msg">{n.message}</div>
                  <div className="meta">From: {sender?.name || "System"} · {fmt(n.createdAt)}</div>
                </div>
              </div>
            );
          })}
      </div>
    </>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────
function SettingsTab({ db, setDb, user, toast }) {
  const s = user.settings || {};
  const isStudentLocked = user.role === "Student" && user.status !== "VERIFIED";
  const signedInStudentNumber = user.role === "Student" ? (user.studentNumber || studentNumberFromEmail(user.email)) : "";
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [proofFile, setProofFile] = useState(null);
  const [proofStatus, setProofStatus] = useState("");
  const [uploadingProof, setUploadingProof] = useState(false);

  const toggle = (key) => {
    if (isStudentLocked && (key === "emailNotif" || key === "inAppNotif")) {
      toast("Verify your profile before changing notification settings.", "error");
      return;
    }
    setDb((d) => ({ ...d, users: d.users.map((u) => u.id === user.id ? { ...u, settings: { ...u.settings, [key]: !u.settings?.[key] } } : u) }));
    toast("Setting updated.", "success");
  };

  const changePassword = () => {
    if (pwForm.current !== user.password) { toast("Current password is incorrect.", "error"); return; }
    if (!pwForm.next) { toast("New password cannot be empty.", "error"); return; }
    if (pwForm.next !== pwForm.confirm) { toast("Passwords do not match.", "error"); return; }
    setDb((d) => ({ ...d, users: d.users.map((u) => u.id === user.id ? { ...u, password: pwForm.next } : u) }));
    setPwForm({ current: "", next: "", confirm: "" });
    toast("Password changed successfully.", "success");
  };

  const uploadProof = async () => {
    if (!proofFile) {
      toast("Choose your Proof of Registration file first.", "error");
      return;
    }

    if (!signedInStudentNumber) {
      toast("Student number is missing from this account.", "error");
      return;
    }

    setUploadingProof(true);
    setProofStatus("Scanning document...");

    try {
      const formData = new FormData();
      formData.append("proof", proofFile);
      formData.append("currentStudent", JSON.stringify({ id: user.id, email: user.email, studentNumber: signedInStudentNumber }));

      const response = await fetch(`${API_BASE}/api/student/verify-por`, {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();
      if (!response.ok) {
        setProofStatus(payload.error || "Verification failed.");
        toast(payload.error || "Verification failed.", "error");
        return;
      }

      setDb((d) => ({
        ...d,
        users: d.users.map((u) => (
          u.id === user.id
            ? { ...u, status: payload.status, proofFileName: payload.fileName }
            : u
        )),
      }));
      setProofStatus("Proof verified successfully.");
      setProofFile(null);
      toast("Proof of Registration verified.", "success");
    } catch (error) {
      setProofStatus(error.message);
      toast(error.message, "error");
    } finally {
      setUploadingProof(false);
    }
  };

  return (
    <>
      {isStudentLocked && (
        <div className="panel" style={{ borderLeft: "4px solid #ef4444", background: "#fff7f7" }}>
          <h3 style={{ marginBottom: ".5rem" }}>Verification Required</h3>
          <p style={{ fontSize: ".88rem", color: "var(--muted)", lineHeight: 1.65, marginBottom: ".75rem" }}>
            Your profile is pending verification. Module access and notification preferences will unlock once your Proof of Registration is validated.
          </p>
          <div className="field">
            <label>Proof of Registration</label>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(e) => setProofFile(e.target.files?.[0] || null)} />
          </div>
          <div className="field">
            <label>Student Number</label>
            <input value={signedInStudentNumber} disabled placeholder="Student number from account" />
          </div>
          <button className="btn btn-blue form-full" onClick={uploadProof} disabled={uploadingProof} style={{ marginBottom: ".9rem" }}>
            {uploadingProof ? "Verifying..." : "Upload & Verify"}
          </button>
          {proofStatus && <div className="info-msg" style={{ marginBottom: ".9rem" }}>{proofStatus}</div>}
          <div className="setting-row" style={{ opacity: .72 }}>
            <div>
              <div className="setting-label">Module Access</div>
              <div className="setting-sub">Locked until your student number is verified.</div>
            </div>
            <span className="badge badge-amber">Pending</span>
          </div>
        </div>
      )}
      <div className="panel"><h3>Preferences</h3>
        {[
          { key: "emailNotif", label: "Email Notifications", sub: "Receive scheduling updates via email." },
          { key: "inAppNotif", label: "In-App Notifications", sub: "Show badge and bell alerts in the dashboard." },
          { key: "compact", label: "Compact Mode", sub: "Reduce padding for a denser view." },
        ].map(({ key, label, sub }) => (
          <div key={key} className="setting-row" style={isStudentLocked && (key === "emailNotif" || key === "inAppNotif") ? { opacity: .5 } : undefined}>
            <div><div className="setting-label">{label}</div><div className="setting-sub">{sub}</div></div>
            <label className="toggle">
              <input type="checkbox" checked={!!s[key]} disabled={isStudentLocked && (key === "emailNotif" || key === "inAppNotif")} onChange={() => toggle(key)} />
              <span className="slider" />
            </label>
          </div>
        ))}
      </div>
      <div className="panel"><h3>Change Password</h3>
        <div className="form-grid" style={{ maxWidth: 480 }}>
          <input type="password" placeholder="Current password" value={pwForm.current} onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))} className="form-full" />
          <input type="password" placeholder="New password" value={pwForm.next} onChange={(e) => setPwForm((f) => ({ ...f, next: e.target.value }))} />
          <input type="password" placeholder="Confirm new password" value={pwForm.confirm} onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))} />
          <button className="btn btn-blue form-full" onClick={changePassword}>Update Password</button>
        </div>
      </div>
    </>
  );
}

// ─── Courses Tab ──────────────────────────────────────────────────────────────
function CoursesTab({ db, setDb, toast }) {
  const emptyForm = { code: "", name: "", lecturerId: "", groupSize: "", section: "", requiresLab: false };
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const lecturers = db.users.filter((u) => u.role === "Lecturer");

  const save = () => {
    if (!form.code || !form.name || !form.groupSize) { toast("Course code, name and group size are required.", "error"); return; }
    if (editId) {
      setDb((d) => ({ ...d, courses: d.courses.map((c) => c.id === editId ? { ...c, ...form, groupSize: +form.groupSize } : c) }));
      toast("Course updated.", "success");
      setEditId(null);
    } else {
      if (db.courses.some((c) => c.code === form.code)) { toast("Course code already exists.", "error"); return; }
      const nc = { id: nextId("c", db.courses), ...form, groupSize: +form.groupSize };
      setDb((d) => ({ ...d, courses: [...d.courses, nc] }));
      toast("Course added.", "success");
    }
    setForm(emptyForm);
  };

  const startEdit = (c) => {
    setEditId(c.id);
    setForm({ code: c.code, name: c.name, lecturerId: c.lecturerId || "", groupSize: String(c.groupSize), section: c.section || "", requiresLab: c.requiresLab });
  };

  const del = (id) => {
    if (db.allocations.some((a) => a.courseId === id)) { toast("Cannot delete: course has existing allocations.", "error"); return; }
    setDb((d) => ({ ...d, courses: d.courses.filter((c) => c.id !== id) }));
    toast("Course removed.", "success");
  };

  const cancel = () => { setEditId(null); setForm(emptyForm); };

  return (
    <>
      {/* Info panel */}
      <div className="panel" style={{ borderLeft: "4px solid var(--blue)", background: "#f0f6ff" }}>
        <h3 style={{ marginBottom: ".5rem" }}>About Course Management</h3>
        <p style={{ fontSize: ".88rem", color: "var(--muted)", lineHeight: 1.65, marginBottom: ".8rem" }}>
          This page is used to manage academic courses that require venue scheduling. Course details are used by the Scheduler when allocating venues to ensure the right room is matched to each module.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: ".5rem" }}>
          {[
            { icon: "📘", label: "Course name & code" },
            { icon: "👨‍🏫", label: "Assigned lecturer" },
            { icon: "👥", label: "Group size" },
            { icon: "🔤", label: "Group section" },
            { icon: "🖥️", label: "Lab requirement" },
          ].map((f) => (
            <div key={f.label} style={{ display: "flex", alignItems: "center", gap: ".5rem", fontSize: ".82rem", color: "var(--ink)", background: "white", border: "1px solid var(--line)", borderRadius: "8px", padding: ".4rem .75rem" }}>
              <span>{f.icon}</span><span>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="panel">
        <div className="panel-row">
          <h3>{editId ? "Edit Course" : "Add New Course"}</h3>
          {editId && <button className="btn btn-outline btn-sm" onClick={cancel}>Cancel</button>}
        </div>
        <div className="form-grid">
          <input
            placeholder="Course code (e.g. CSC301)"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
          />
          <input
            placeholder="Course name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <select
            value={form.lecturerId}
            onChange={(e) => setForm((f) => ({ ...f, lecturerId: e.target.value }))}
          >
            <option value="">Assign lecturer (optional)</option>
            {lecturers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <input
            type="number"
            placeholder="Group size"
            value={form.groupSize}
            min={1}
            onChange={(e) => setForm((f) => ({ ...f, groupSize: e.target.value }))}
          />
          <input
            placeholder="Group section (e.g. A, B, MAIN)"
            value={form.section}
            onChange={(e) => setForm((f) => ({ ...f, section: e.target.value.toUpperCase() }))}
          />
          <label style={{ display: "flex", alignItems: "center", gap: ".55rem", fontSize: ".88rem", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={form.requiresLab}
              onChange={(e) => setForm((f) => ({ ...f, requiresLab: e.target.checked }))}
            />
            Requires computer lab
          </label>
          <button className="btn btn-blue" onClick={save}>{editId ? "Update Course" : "Add Course"}</button>
        </div>
      </div>

      {/* Table */}
      <div className="panel">
        <h3>All Courses ({db.courses.length})</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Course Name</th>
                <th>Lecturer</th>
                <th>Group Size</th>
                <th>Section</th>
                <th>Lab Required</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {db.courses.map((c) => {
                const lecturer = db.users.find((u) => u.id === c.lecturerId);
                const allocCount = db.allocations.filter((a) => a.courseId === c.id).length;
                return (
                  <tr key={c.id}>
                    <td><span className="badge badge-blue">{c.code}</span></td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: ".88rem" }}>{c.name}</div>
                      {allocCount > 0 && <div style={{ fontSize: ".74rem", color: "var(--muted)", marginTop: ".1rem" }}>{allocCount} allocation{allocCount > 1 ? "s" : ""}</div>}
                    </td>
                    <td>{lecturer ? lecturer.name : <span style={{ color: "var(--muted)", fontStyle: "italic" }}>Unassigned</span>}</td>
                    <td>{c.groupSize}</td>
                    <td><span className="badge badge-amber">{c.section || "—"}</span></td>
                    <td>
                      {c.requiresLab
                        ? <span className="badge badge-teal">✔ Lab</span>
                        : <span className="badge" style={{ background: "#f1f5f9", color: "var(--muted)" }}>No</span>}
                    </td>
                    <td>
                      <div className="btn-row">
                        <button className="btn btn-outline btn-sm" onClick={() => startEdit(c)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => del(c.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {db.courses.length === 0 && (
                <tr><td colSpan={7} style={{ color: "var(--muted)", fontStyle: "italic" }}>No courses found. Add one above.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ─── Dashboard Shell ──────────────────────────────────────────────────────────
function Dashboard({ db, setDb, userId, onLogout }) {
  const user = db.users.find((u) => u.id === userId);
  const [tab, setTab] = useState("overview");
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = "success") => setToast({ msg, type }), []);

  const unread = db.notifications.filter((n) =>
    (n.toRole === "All" || n.toRole === user?.role || n.toUserId === user?.id) && !n.readBy.includes(userId)
  ).length;

  if (!user) return null;

  const renderContent = () => {
    if (tab === "overview") {
      if (user.role === "Admin") return <AdminOverview db={db} />;
      if (user.role === "Scheduler") return <SchedulerOverview db={db} setTab={setTab} />;
      if (user.role === "Lecturer") return <LecturerOverview db={db} user={user} setTab={setTab} />;
      return <StudentOverview db={db} user={user} />;
    }
    if (tab === "venues") return <VenuesTab db={db} setDb={setDb} toast={showToast} />;
    if (tab === "users") return <UsersTab db={db} setDb={setDb} toast={showToast} />;
    if (tab === "courses") return <CoursesTab db={db} setDb={setDb} toast={showToast} />;
    if (tab === "allocations") return <AllocationsTab db={db} setDb={setDb} toast={showToast} userId={userId} />;
    if (tab === "reports") return <ReportsTab db={db} />;
    if (tab === "conflicts") return <ConflictsTab db={db} />;
    if (tab === "archives") return <ArchivesTab db={db} />;
    if (tab === "modules") return <ModulesTab db={db} user={user} />;
    if (tab === "room-request") return <RoomRequestTab db={db} setDb={setDb} user={user} toast={showToast} />;
    if (tab === "timetable") return <TimetableTab db={db} user={user} />;
    if (tab === "notifications") return <NotificationsTab db={db} setDb={setDb} user={user} toast={showToast} />;
    if (tab === "settings") return <SettingsTab db={db} setDb={setDb} user={user} toast={showToast} />;
    return null;
  };

  return (
    <div className="dash-shell">
      <Sidebar user={user} tab={tab} setTab={setTab} onLogout={onLogout} unread={unread} />
      <div className="main-area">
        <div className="topbar">
          <div className="topbar-title">{tabMeta[tab]?.label}</div>
          <div className="topbar-right">
            <div className="notif-dot" onClick={() => setTab("notifications")}>
              🔔{unread > 0 && <span>{unread}</span>}
            </div>
            <div className="avatar">{initials(user.name)}</div>
          </div>
        </div>
        <div className="content">{renderContent()}</div>
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [db, setDb] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/db`)
      .then((response) => response.json())
      .then((payload) => setDb(normalizeAuthDb(payload)))
      .catch(() => setDb(normalizeAuthDb(initDb())));
  }, []);

  if (!db) {
    return (
      <div className="cc-app" style={{ alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ background: "white", borderRadius: 16, padding: "1.5rem 1.8rem", boxShadow: "0 12px 48px rgba(11,42,92,0.14)" }}>
          Loading CampusGrid...
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="cc-app">
        {userId
          ? <Dashboard db={db} setDb={setDb} userId={userId} onLogout={() => setUserId(null)} />
          : <Login db={db} setDb={setDb} onLogin={setUserId} />}
      </div>
    </>
  );
}
