import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';

const CookieBanner: React.FC = () => {
  const { cookieConsent, setCookieConsent } = useAppContext();
  const isEmbed = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('embed') === 'true';
  if (cookieConsent || isEmbed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg p-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
        <p className="text-sm text-black">
          We use cookies to improve your experience and analyze site usage. You can accept or reject non-essential cookies.
        </p>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => setCookieConsent('rejected')}>Reject</Button>
          <Button size="sm" className="bg-[#0a192f] hover:bg-[#020c1b]" onClick={() => setCookieConsent('accepted')}>Accept all</Button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
