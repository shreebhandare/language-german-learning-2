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
    { key: 'courses', label: 'Courses' },
    { key: 'pricing', label: 'Pricing' },
    { key: 'about', label: 'About' },
    { key: 'contact', label: 'Contact' },
  ] as const;

  const closeAll = () => {
    setMobileOpen(false);
  };
  const isEmbed = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('embed') === 'true';
  if (isEmbed) return null;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" onClick={closeAll} className="flex items-center gap-2">
            <img src="https://cdn.designfast.io/image/2026-05-04/bf29e216-cf4b-45ef-b1eb-9ecd8f9b150a.png" alt="Logo" width={200} height={100} />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => setView(item.key)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition ${view === item.key ? 'text-red-600 bg-blue-50' : 'text-black hover:text-red-600 hover:bg-slate-50'
                  }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => setView('learn')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition flex items-center gap-1.5 ${view === 'learn' ? 'text-red-600 bg-blue-50' : 'text-black hover:text-red-600 hover:bg-slate-50'
                }`}
            >
              <BookOpen className="w-4 h-4" /> Learn
            </button>
            {user && (user.tier === 'paid' || user.tier === 'course' || user.tier === 'admin') && (
              <button
                onClick={() => setView('dashboard')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition flex items-center gap-1.5 ${view === 'dashboard' ? 'text-red-600 bg-blue-50' : 'text-black hover:text-red-600 hover:bg-slate-50'
                  }`}
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </button>
            )}
            {user?.tier === 'admin' && (
              <button
                onClick={() => setView('admin')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition flex items-center gap-1.5 ${view === 'admin' ? 'text-red-600 bg-orange-50' : 'text-black hover:text-red-600 hover:bg-slate-50'
                  }`}
              >
                <Shield className="w-4 h-4" /> Admin
              </button>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
                  <UserIcon className="w-4 h-4 text-black" />
                  <span className="text-sm font-medium text-black">{user.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${user.tier === 'paid' ? 'bg-green-100 text-green-700' :
                    user.tier === 'course' ? 'bg-purple-100 text-purple-700' :
                      user.tier === 'admin' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                    }`}>
                    {user.tier === 'course' ? `Course ${user.courseLevel}` : user.tier}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={logout}><LogOut className="w-4 h-4" /></Button>
              </div>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setAuthModal('login')}>Sign In</Button>
                <Button className="bg-[#0a192f] hover:bg-[#020c1b]" onClick={() => setAuthModal('register')}>
                  Get Started
                </Button>
              </>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden py-3 border-t border-slate-200 space-y-1">
            {[...navItems, { key: 'learn' as const, label: 'Learn' }].map(item => (
              <button
                key={item.key}
                onClick={() => { setView(item.key as any); setMobileOpen(false); }}
                className="block w-full text-left px-3 py-2 rounded-md hover:bg-slate-50"
              >
                {item.label}
              </button>
            ))}
            {user && (user.tier === 'paid' || user.tier === 'course' || user.tier === 'admin') && (
              <button onClick={() => { setView('dashboard'); setMobileOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md hover:bg-slate-50">Dashboard</button>
            )}
            <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
              {user ? (
                <Button variant="outline" onClick={logout}>Sign out ({user.name})</Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => { setAuthModal('login'); setMobileOpen(false); }}>Sign In</Button>
                  <Button className="bg-[#0a192f]" onClick={() => { setAuthModal('register'); setMobileOpen(false); }}>Get Started</Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
