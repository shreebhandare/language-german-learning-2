import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Menu, X, BookOpen, LayoutDashboard, GraduationCap, LogOut, User as UserIcon, Shield } from 'lucide-react';

const Header: React.FC = () => {
  const { view, setView, user, logout, setAuthModal } = useAppContext();
  const [mobileOpen, setMobileOpen] = useState(false);

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
    const toPath = navKey === 'learn' ? '/' : `/${navKey}`;
    return (
      <Link
        to={toPath}
        style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          padding: '6px 12px',
          borderRadius: '8px',
          fontFamily: 'Figtree, sans-serif',
          fontSize: '14px',
          fontWeight: active ? 600 : 500,
          color: active ? 'var(--accent-text)' : 'var(--text-secondary)',
          background: active ? 'var(--accent-light)' : 'transparent',
          textDecoration: 'none',
          transition: 'color 180ms ease, background 180ms ease',
        }}
        onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-elevated)'; } }}
        onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; } }}
      >
        {icon}{label}
      </Link>
    );
  };

  return (
    <header className="topbar">
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link to="/" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <img 
            src="https://cdn.designfast.io/image/2026-05-04/bf29e216-cf4b-45ef-b1eb-9ecd8f9b150a.png" 
            alt="Langrushi" 
            style={{ objectFit: 'contain', height: '45px' }} 
            className="md:h-[90px]"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-[2px]">
          {user?.tier === 'admin' && (
            <NavBtn navKey="admin" label="Admin" icon={<Shield className="w-3.5 h-3.5" />} />
          )}
        </nav>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link to="/dashboard" style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '5px 10px 5px 6px',
                borderRadius: '999px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                textDecoration: 'none',
                cursor: 'pointer',
              }} className="hover:opacity-90 transition-opacity">
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
              </Link>
              {user.tier === 'admin' && (
                <Button variant="outline" size="sm" onClick={() => setView('admin')} className="border-amber-300 text-amber-700 hover:bg-amber-50 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Admin
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={logout} title="Sign out" aria-label="Sign out">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              <Button variant="outline" className="min-w-[120px]" onClick={() => setAuthModal('login')}>Sign In</Button>
              <Button className="min-w-[120px] bg-[#0a192f] hover:bg-[#020c1b]" onClick={() => setAuthModal('register')}>Get Started</Button>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {user ? (
              <>
                {/* Profile display on mobile */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  marginBottom: '4px'
                }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '12px', color: '#fff', flexShrink: 0,
                  }}>
                    {user.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.name}
                    </div>
                  </div>
                  {tierInfo && <span className={tierInfo.cls}>{tierInfo.label}</span>}
                </div>

                {/* Dashboard Access Button */}
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none' }} className="w-full">
                  <Button className="w-full bg-[#3563E9] hover:bg-[#1E5AE6] text-white flex items-center justify-center gap-2">
                    <LayoutDashboard className="w-4 h-4" /> Learner Dashboard
                  </Button>
                </Link>

                {/* Admin Dashboard Button - only for admins */}
                {user.tier === 'admin' && (
                  <Button 
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center gap-2" 
                    onClick={() => { setView('admin'); setMobileOpen(false); }}
                  >
                    <Shield className="w-4 h-4" /> Admin Dashboard
                  </Button>
                )}

                {/* Sign Out Button */}
                <Button 
                  variant="outline" 
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center justify-center gap-2" 
                  onClick={() => { logout(); setMobileOpen(false); }}
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </Button>
              </>
            ) : (
              <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Button variant="outline" className="w-full" onClick={() => { setAuthModal('login'); setMobileOpen(false); }}>Sign In</Button>
                <Button className="w-full bg-[#0a192f] hover:bg-[#020c1b]" onClick={() => { setAuthModal('register'); setMobileOpen(false); }}>Get Started</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
