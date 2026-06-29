import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';

export const PricingPage: React.FC = () => {
  const { upgradeToPaid, user, setAuthModal, priceLifetime, guestQuota, registeredQuota } = useAppContext();
  const [coupon, setCoupon] = useState('');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-black">Quiz Platform Pricing</h1>
        <p className="mt-3 text-lg text-black">Lifetime access. One-time payment. No subscription.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <PricingCard tier="Guest" price="₹0" subtitle="No login required" features={['Grammar (always free)', 'Games (always free)', `${guestQuota} free quiz attempts`, 'Basic UI']} cta="Try free" onCta={() => setAuthModal('register')} />

        <PricingCard tier="Registered" price="₹0" subtitle="Free account" features={['Everything in Guest', `${registeredQuota} free quiz attempts`, 'Save your progress', 'Email support']} cta="Sign up free" onCta={() => setAuthModal('register')} highlighted={false} />

        <div className="bg-gradient-to-br from-[#1D4ED8] to-[#EA580C] rounded-2xl p-6 text-white relative shadow-2xl">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full">BEST VALUE</span>
          <div className="text-sm font-semibold opacity-90">Lifetime</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-bold">₹{priceLifetime}</span>
            <span className="text-blue-100 line-through">₹{Math.round(priceLifetime * 2)}</span>
          </div>
          <div className="text-xs mt-1">One-time · 50% off</div>
          <ul className="mt-5 space-y-2 text-sm">
            {['Unlimited quiz access', 'All A1 to B2 levels', 'Audio listening exercises', 'Full dashboard', 'Progress analytics', 'Lifetime updates'].map(f => (
              <li key={f} className="flex items-center gap-2"><Check className="w-4 h-4" /> {f}</li>
            ))}
          </ul>

          <div className="mt-5">
            <Label className="text-white text-xs">Coupon code (optional)</Label>
            <Input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="WELCOME20" className="bg-white/20 border-white/30 text-white placeholder:text-white/60 mt-1" />
          </div>

          <Button className="mt-4 w-full bg-white text-red-600 hover:bg-slate-100 font-semibold" onClick={() => {
            if (!user) setAuthModal('register');
            else upgradeToPaid(coupon || undefined);
          }}>
            {user?.tier === 'paid' ? 'Already lifetime ✓' : 'Get lifetime access'}
          </Button>
        </div>
      </div>

      <div className="mt-12 grid md:grid-cols-3 gap-4 text-center">
        {[
          ['🎓', 'Course students', 'Get free full access via class code'],
          ['🔒', 'Secure payment', 'SSL encrypted checkout'],
          ['💸', '14-day refund', 'Not happy? Get your money back'],
        ].map(([icon, t, d]) => (
          <div key={t} className="p-5 bg-slate-50 rounded-xl">
            <div className="text-2xl mb-1">{icon}</div>
            <div className="font-semibold text-black">{t}</div>
            <div className="text-sm text-black">{d}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PricingCard: React.FC<{ tier: string; price: string; subtitle: string; features: string[]; cta: string; onCta: () => void; highlighted?: boolean }> = ({ tier, price, subtitle, features, cta, onCta }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-6">
    <div className="text-sm font-semibold text-black">{tier}</div>
    <div className="text-4xl font-bold text-black mt-2">{price}</div>
    <div className="text-xs text-black mt-1">{subtitle}</div>
    <ul className="mt-5 space-y-2 text-sm text-black">
      {features.map(f => <li key={f} className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> {f}</li>)}
    </ul>
    <Button variant="outline" className="mt-5 w-full" onClick={onCta}>{cta}</Button>
  </div>
);
