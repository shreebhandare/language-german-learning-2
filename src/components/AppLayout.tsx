import React, { useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import Header from './langrushi/Header';
import Footer from './langrushi/Footer';
import MarketingPage from './langrushi/MarketingPage';
import LearnPage from './langrushi/LearnPage';
import Dashboard from './langrushi/Dashboard';
import AdminPanel from './langrushi/admin';
import AuthModal from './langrushi/AuthModal';
import ForcedUpgradeModal from './langrushi/ForcedUpgradeModal';
import CookieBanner from './langrushi/CookieBanner';
import { CoursesPage, PricingPage, AboutPage, ContactPage } from './langrushi/SimplePages';

const AppLayout: React.FC = () => {
  const { view, loading, activeExerciseId } = useAppContext();

  const isQuizMode = view === 'learn' && !!activeExerciseId;

  // postMessage height sync for embed mode
  useEffect(() => {
    const isEmbed = new URLSearchParams(window.location.search).get('embed') === 'true';
    if (!isEmbed) return;
    const sendHeight = () => {
      window.parent.postMessage({ type: 'langrushi-height', height: document.body.scrollHeight }, '*');
    };
    sendHeight();
    const ro = new ResizeObserver(sendHeight);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, [view]);

  const renderView = () => {
    switch (view) {
      case 'marketing': return <MarketingPage />;
      case 'learn': return <LearnPage />;
      case 'dashboard': return <Dashboard />;
      case 'admin': return <AdminPanel />;
      case 'courses': return <CoursesPage />;
      case 'pricing': return <PricingPage />;
      case 'about': return <AboutPage />;
      case 'contact': return <ContactPage />;
      default: return <MarketingPage />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center flex flex-col items-center">
          <img src="/loader.gif" alt="Loading..." className="w-16 h-16 mx-auto mb-3 object-contain" />
          <div className="text-white text-sm font-medium">Loading Langrushi...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {!isQuizMode && <Header />}
      <main className="flex-1">
        {renderView()}
      </main>
      {!isQuizMode && <Footer />}
      <AuthModal />
      <ForcedUpgradeModal />
      <CookieBanner />
    </div>
  );
};

export default AppLayout;
