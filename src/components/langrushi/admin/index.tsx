import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import ExercisesAdmin from './ExercisesAdmin';
import UsersAdmin from './UsersAdmin';
import ClassCodesAdmin from './ClassCodesAdmin';
import CouponsAdmin from './CouponsAdmin';
import CSVAdmin from './CSVAdmin';
import SettingsAdmin from './SettingsAdmin';
import AnalyticsAdmin from './AnalyticsAdmin';
import { Settings, Users, Tag, KeyRound, BookOpen, FileText, Shield, ChevronRight, LogOut, LayoutDashboard, BarChart3 } from 'lucide-react';

type AdminTab = 'exercises' | 'users' | 'classcodes' | 'coupons' | 'csv' | 'settings' | 'analytics';

const NAV: { key: AdminTab; label: string; icon: React.FC<any>; desc: string }[] = [
  { key: 'exercises',  label: 'Exercises',   icon: BookOpen,   desc: 'Manage quiz content' },
  { key: 'users',      label: 'Users',        icon: Users,      desc: 'Performance & tiers' },
  { key: 'classcodes', label: 'Class Codes',  icon: KeyRound,   desc: 'Student access codes' },
  { key: 'coupons',    label: 'Coupons',      icon: Tag,        desc: 'Discount codes' },
  { key: 'csv',        label: 'CSV Import',   icon: FileText,   desc: 'Bulk import / export' },
  { key: 'settings',   label: 'Settings',     icon: Settings,   desc: 'Quotas & config' },
  { key: 'analytics',  label: 'Analytics',    icon: BarChart3,  desc: 'Visitor activity logs' },
];

const AdminPanel: React.FC = () => {
  const ctx = useAppContext();
  const [tab, setTab] = useState<AdminTab>('exercises');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  /* ── Access guard ────────────────────────── */
  if (ctx.user?.tier !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="card p-10 text-center animate-fade-up" style={{ maxWidth: '360px', width: '100%', margin: '0 16px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '50%',
            background: 'var(--danger-bg)', border: '1px solid rgba(220,38,38,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
          }}>
            <Shield className="w-6 h-6" style={{ color: 'var(--danger)' }} />
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>Admin Only</h1>
          <button className="btn-primary w-full" onClick={() => ctx.setAuthModal('login')}>Sign In</button>
        </div>
      </div>
    );
  }

  const activeNav = NAV.find(n => n.key === tab)!;
  const ActiveIcon = activeNav.icon;

  return (
    <div className="admin-panel flex relative" style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Mobile Sidebar backdrop overlay */}
      {mobileSidebarOpen && (
        <div 
          className="dashboard-sidebar-overlay" 
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ───────────────────────── */}
      <aside 
        className={`dashboard-sidebar ${mobileSidebarOpen ? 'open' : ''}`}
        style={{
          width: '220px', flexShrink: 0,
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          position: 'sticky', top: '0',
          height: '100vh',
        }}
      >
        {/* Brand */}
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img 
            src="https://cdn.designfast.io/image/2026-05-04/bf29e216-cf4b-45ef-b1eb-9ecd8f9b150a.png" 
            alt="Langrushi" 
            style={{ objectFit: 'contain', height: '50px' }} 
          />
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
          {NAV.map(item => {
            const Icon = item.icon;
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setTab(item.key);
                  setMobileSidebarOpen(false);
                }}
                className={`nav-item${active ? ' active' : ''}`}
                title={item.desc}
                aria-label={item.label}
                style={{ marginBottom: '2px' }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span style={{ flex: 1 }}>{item.label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />}
              </button>
            );
          })}
        </nav>

        {/* User chip */}
        <div style={{ padding: '10px 8px 12px', borderTop: '1px solid var(--border)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '9px',
            padding: '9px 10px', borderRadius: '10px', background: 'var(--bg-elevated)',
          }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '12px', color: '#fff',
            }}>
              {ctx.user?.name?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Figtree, sans-serif', fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {ctx.user?.name ?? 'Admin'}
              </div>
              <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '9px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>admin</div>
            </div>
            <button
              type="button"
              onClick={() => {
                ctx.logout();
                setMobileSidebarOpen(false);
              }}
              title="Sign out"
              aria-label="Sign out"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '3px', borderRadius: '5px', transition: 'color 180ms ease' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main panel ────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <div 
          className="dashboard-header-bar"
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '0 28px', height: '56px', flexShrink: 0,
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {/* Sidebar toggle button for mobile */}
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden p-1 mr-1 hover:bg-slate-100 rounded-lg focus:outline-none"
            aria-label="Toggle sidebar menu"
          >
            <img src="/placeholder.svg" alt="Menu" width={28} height={28} style={{ objectFit: 'contain' }} />
          </button>

          <div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>{activeNav.label}</div>
          </div>

          {/* Breadcrumb */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }} className="hidden md:flex">
            <LayoutDashboard className="w-3 h-3" />
            <span>Admin</span>
            <ChevronRight className="w-3 h-3" />
            <span style={{ color: 'var(--accent-text)', fontWeight: 600 }}>{activeNav.label}</span>
          </div>
        </div>

        {/* Content */}
        <div className="dashboard-main-content" style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
          <div key={tab} className="animate-fade-up">
            {tab === 'exercises'  && <ExercisesAdmin />}
            {tab === 'users'      && <UsersAdmin />}
            {tab === 'classcodes' && <ClassCodesAdmin />}
            {tab === 'coupons'    && <CouponsAdmin />}
            {tab === 'csv'        && <CSVAdmin />}
            {tab === 'settings'   && <SettingsAdmin />}
            {tab === 'analytics'  && <AnalyticsAdmin />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
