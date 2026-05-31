import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Menu, X, BookOpen, LayoutDashboard, GraduationCap, LogOut, User as UserIcon, Shield } from 'lucide-react';

const Header: React.FC = () => {
  const { view, setView, user, logout, setAuthModal } = useAppContext();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { key: 'marketing', label: 'Home' },
    { key: 'courses',   label: 'Courses' },
    { key: 'pricing',   label: 'Pricing' },
    { key: 'about',     label: 'About' },
    { key: 'contact',   label: 'Contact' },
  ] as const;

  const isEmbed = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('embed') === 'true';
  if (isEmbed) return null;

  const tierMap: Record<string, { label: string; cls: string }> = {
    paid:       { label: 'Lifetime', cls: 'badge badge-green' },
    course:     { label: `Course ${user?.courseLevel ?? ''}`, cls: 'badge badge-purple' },
    admin:      { label: 'Admin',    cls: 'badge badge-amber' },
    registered: { label: 'Free',     cls: 'badge badge-blue' },
    guest:      { label: 'Guest',    cls: 'badge badge-slate' },
  };
  const tierInfo = user ? (tierMap[user.tier] ?? { label: user.tier, cls: 'badge badge-slate' }) : null;

  const NavBtn: React.FC<{ navKey: string; label: string; icon?: React.ReactNode }> = ({ navKey, label, icon }) => {
    const active = view === navKey;
    return (
      <button
        onClick={() => setView(navKey as any)}
        style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          padding: '6px 12px',
          borderRadius: '8px',
          fontFamily: 'Figtree, sans-serif',
          fontSize: '14px',
          fontWeight: active ? 600 : 500,
          color: active ? 'var(--accent-text)' : 'var(--text-secondary)',
          background: active ? 'var(--accent-light)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          transition: 'color 180ms ease, background 180ms ease',
        }}
        onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-elevated)'; } }}
        onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; } }}
      >
        {icon}{label}
      </button>
    );
  };

  return (
    <header className="topbar">
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link to="/" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <img src="https://cdn.designfast.io/image/2026-05-04/bf29e216-cf4b-45ef-b1eb-9ecd8f9b150a.png" alt="Langrushi" width={180} height={90} style={{ objectFit: 'contain' }} />
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2px' }} className="hidden md:flex">
          {navItems.map(item => <NavBtn key={item.key} navKey={item.key} label={item.label} />)}
          <NavBtn navKey="learn" label="Learn" icon={<BookOpen className="w-3.5 h-3.5" />} />
          {user && (user.tier === 'paid' || user.tier === 'course' || user.tier === 'admin') && (
            <NavBtn navKey="dashboard" label="Dashboard" icon={<LayoutDashboard className="w-3.5 h-3.5" />} />
          )}
          {user?.tier === 'admin' && (
            <NavBtn navKey="admin" label="Admin" icon={<Shield className="w-3.5 h-3.5" />} />
          )}
        </nav>

        {/* Desktop auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="hidden md:flex">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '5px 10px 5px 6px',
                borderRadius: '999px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
              }}>
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '11px', color: '#fff', flexShrink: 0,
                }}>
                  {user.name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <span style={{ fontFamily: 'Figtree, sans-serif', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</span>
                {tierInfo && <span className={tierInfo.cls}>{tierInfo.label}</span>}
              </div>
              <Button variant="ghost" size="sm" onClick={logout} title="Sign out" aria-label="Sign out">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setAuthModal('login')}>Sign In</Button>
              <button className="btn-primary" onClick={() => setAuthModal('register')}>Get Started</button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-surface)', padding: '10px 16px 14px' }}>
          {[...navItems, { key: 'learn' as const, label: 'Learn' }].map(item => (
            <button key={item.key} onClick={() => { setView(item.key as any); setMobileOpen(false); }}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 10px', fontFamily: 'Figtree, sans-serif', fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', background: 'none', border: 'none', borderRadius: '7px', cursor: 'pointer', marginBottom: '2px' }}>
              {item.label}
            </button>
          ))}
          {user && (user.tier === 'paid' || user.tier === 'course' || user.tier === 'admin') && (
            <button onClick={() => { setView('dashboard'); setMobileOpen(false); }}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 10px', fontFamily: 'Figtree, sans-serif', fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', background: 'none', border: 'none', borderRadius: '7px', cursor: 'pointer', marginBottom: '2px' }}>
              Dashboard
            </button>
          )}
          <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border)', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {user ? (
              <Button variant="outline" onClick={logout}>Sign out ({user.name})</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => { setAuthModal('login'); setMobileOpen(false); }}>Sign In</Button>
                <button className="btn-primary w-full" onClick={() => { setAuthModal('register'); setMobileOpen(false); }}>Get Started</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
