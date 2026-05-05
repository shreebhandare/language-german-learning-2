import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Sparkles } from 'lucide-react';

const ForcedUpgradeModal: React.FC = () => {
  const { forcedModal, user, setAuthModal, upgradeToPaid, logout } = useAppContext();
  const [coupon, setCoupon] = useState('');

  if (!forcedModal) return null;

  const isGuest = !user;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#1D4ED8] to-[#EA580C] flex items-center justify-center">
          {isGuest ? <Lock className="w-8 h-8 text-white" /> : <Sparkles className="w-8 h-8 text-white" />}
        </div>
        <h2 className="text-2xl font-bold text-center mb-2">
          {isGuest ? 'Register to unlock more quizzes' : 'Upgrade for unlimited access'}
        </h2>
        <p className="text-center text-black mb-6">
          {isGuest
            ? "You've used your free quiz attempts. Create a free account to unlock 10 more quizzes."
            : "You've reached your limit. Get lifetime access to the entire quiz library with a single payment."}
        </p>

        {isGuest ? (
          <div className="space-y-3">
            <Button className="w-full bg-[#0a192f] hover:bg-[#020c1b] h-12 text-base" onClick={() => setAuthModal('register')}>
              Create free account
            </Button>
            <Button variant="outline" className="w-full h-12" onClick={() => setAuthModal('login')}>
              I already have an account
            </Button>
            <button onClick={() => window.location.href = '/'} className="w-full text-sm text-black hover:text-black pt-2">
              Leave site
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-orange-50 rounded-xl p-5 border border-blue-100">
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-bold text-black">€49</span>
                <span className="text-black line-through">€99</span>
                <span className="text-xs bg-[#0a192f] text-white px-2 py-0.5 rounded-full font-semibold">50% OFF</span>
              </div>
              <ul className="space-y-1.5 text-sm text-black">
                <li>✓ Lifetime access to all A1–B2 quizzes</li>
                <li>✓ Detailed progress dashboard</li>
                <li>✓ Audio listening exercises</li>
                <li>✓ One-time payment, no subscription</li>
              </ul>
            </div>
            <div>
              <label className="text-sm font-medium text-black">Coupon code (optional)</label>
              <Input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="WELCOME20" />
              <p className="text-xs text-black mt-1">Try: WELCOME20 or STUDENT10</p>
            </div>
            <Button className="w-full bg-[#0a192f] hover:bg-[#020c1b] h-12 text-base" onClick={() => upgradeToPaid(coupon || undefined)}>
              Pay €49 — Get lifetime access
            </Button>
            <button onClick={logout} className="w-full text-sm text-black hover:text-black">Sign out</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForcedUpgradeModal;
