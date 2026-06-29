import React, { useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import Header from './langrushi/Header';
import LearnPage from './langrushi/LearnPage';
import Dashboard from './langrushi/Dashboard';
import AdminPanel from './langrushi/admin';
import AuthModal from './langrushi/AuthModal';
import ForcedUpgradeModal from './langrushi/ForcedUpgradeModal';
import CookieBanner from './langrushi/CookieBanner';
import { PricingPage } from './langrushi/SimplePages';
import Footer from './langrushi/Footer';

const AppLayout: React.FC = () => {
  const { view, loading, activeExerciseId } = useAppContext();
  const isQuizMode = view === 'learn' && !!activeExerciseId;

  useEffect(() => {
    const isEmbed = new URLSearchParams(window.location.search).get('embed') === 'true';
    if (!isEmbed) return;
    const sendHeight = () => window.parent.postMessage({ type: 'langrushi-height', height: document.body.scrollHeight }, '*');
    sendHeight();
    const ro = new ResizeObserver(sendHeight);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, [view]);

  const renderView = () => {
    switch (view) {
      case 'learn':     return <LearnPage />;
      case 'dashboard': return <Dashboard />;
      case 'admin':     return <AdminPanel />;
      case 'pricing':   return <PricingPage />;
      default:          return <LearnPage />;
    }
  };

  const showHeader = !isQuizMode && view !== 'admin' && view !== 'dashboard';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="flex flex-col items-center gap-5">
          {/* Skeleton-style loading */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '200px' }}>
            <div className="skeleton" style={{ width: '56px', height: '56px', borderRadius: '14px' }} />
            <div className="skeleton" style={{ width: '140px', height: '14px' }} />
            <div className="skeleton" style={{ width: '100px', height: '11px' }} />
          </div>
          <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Loading Langrushi...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)' }}>
      {showHeader && <Header />}
      <main className="flex-1">{renderView()}</main>
      {showHeader && <Footer />}
      <AuthModal />
      <ForcedUpgradeModal />
      <CookieBanner />
    </div>
  );
};

export default AppLayout;
