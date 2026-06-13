import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { ArrowRight, Check, Mail, MapPin, Phone, Star, GraduationCap } from 'lucide-react';

export const CoursesPage: React.FC = () => {
  const { setView, setAuthModal, user, priceLifetime, priceCourseA1, priceCourseA2, priceCourseB1, priceCourseB2 } = useAppContext();
  const courses = [
    { level: 'A1', title: 'German A1 — Beginner', desc: 'Build a solid foundation. Greetings, numbers, basic conversations.', weeks: 8, price: priceCourseA1, color: 'emerald' },
    { level: 'A2', title: 'German A2 — Elementary', desc: 'Daily life, shopping, travel. Express opinions and preferences.', weeks: 10, price: priceCourseA2, color: 'blue' },
    { level: 'B1', title: 'German B1 — Intermediate', desc: 'Discuss complex topics, work language, formal writing.', weeks: 12, price: priceCourseB1, color: 'purple' },
    { level: 'B2', title: 'German B2 — Upper-Int.', desc: 'Argumentation, abstract themes, near-fluent comprehension.', weeks: 14, price: priceCourseB2, color: 'orange' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-black">Live German Courses</h1>
        <p className="mt-3 text-lg text-black max-w-2xl mx-auto">Learn with Rushika. Small cohorts, live weekly lessons, structured curriculum, and personalized feedback.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {courses.map(c => (
          <div key={c.level} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition group">
            <div className={`h-2 ${c.color === 'emerald' ? 'bg-emerald-500' : c.color === 'blue' ? 'bg-[#0a192f]' : c.color === 'purple' ? 'bg-purple-600' : 'bg-[#0a192f]'}`}></div>
            <div className="p-6">
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full text-white font-bold text-lg mb-4 ${c.color === 'emerald' ? 'bg-emerald-500' : c.color === 'blue' ? 'bg-[#0a192f]' : c.color === 'purple' ? 'bg-purple-600' : 'bg-[#0a192f]'
                }`}>{c.level}</div>
              <h3 className="font-bold text-xl text-black">{c.title}</h3>
              <p className="text-sm text-black mt-1 mb-4">{c.desc}</p>
              <ul className="space-y-1.5 text-sm text-black mb-4">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> {c.weeks} weeks of live classes</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> Quiz platform included</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> Small group (max 12)</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> Goethe exam prep</li>
              </ul>
              <div className="text-2xl font-bold text-black mb-3">₹{c.price}</div>
              <Button className="w-full bg-[#0a192f] hover:bg-[#020c1b]" onClick={() => {
                if (!user) setAuthModal('register');
                else { toast({ title: 'Enrollment processing...', description: 'You will be redirected to checkout.' }); setTimeout(() => setView('dashboard'), 1500); }
              }}>
                Enroll <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-gradient-to-r from-blue-50 to-orange-50 rounded-2xl p-8 text-center border border-blue-100">
        <GraduationCap className="w-10 h-10 mx-auto text-red-600 mb-3" />
        <h2 className="text-2xl font-bold text-black">Just want quizzes?</h2>
        <p className="mt-2 text-black">Get lifetime access to the full quiz library for a one-time payment of ₹{priceLifetime}.</p>
        <Button className="mt-4 bg-[#0a192f] hover:bg-[#020c1b]" onClick={() => setView('pricing')}>See quiz pricing</Button>
      </div>
    </div>
  );
};

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

export const AboutPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h1 className="text-4xl md:text-5xl font-bold text-black">About Langrushi</h1>
    <p className="mt-4 text-lg text-black">Bridging the gap between textbook German and real-world fluency.</p>

    <div className="mt-10 grid md:grid-cols-3 gap-6 items-start">
      <div className="md:col-span-1">
        <div className="aspect-square rounded-2xl bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center text-white text-6xl font-bold">R</div>
        <div className="mt-4">
          <h3 className="font-bold text-xl">Rushika</h3>
          <p className="text-sm text-black">Founder · Goethe-certified German teacher · 10+ years</p>
          <div className="flex gap-0.5 mt-2 text-yellow-400">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}</div>
        </div>
      </div>

      <div className="md:col-span-2 prose prose-slate max-w-none">
        <p>I started Langrushi in 2020 after years of watching learners struggle with the gap between classroom German and real-life conversations. The textbooks were dry. The apps were too gamified. The exam prep was overwhelming.</p>
        <p>So I built what I wished existed: a quiz platform with real audio from native speakers, model writing samples that actually teach style, and grammar drills that respect your time.</p>
        <p>Today, Langrushi helps over 12,000 learners worldwide pass Goethe and telc exams — and more importantly, speak German with confidence in real life.</p>
        <p className="font-semibold">Our promise: Hand-crafted exercises. Honest pricing. No upsell tricks.</p>
      </div>
    </div>
  </div>
);

export const ContactPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.includes('@') || !form.message) {
      toast({ title: 'Please fill all fields' });
      return;
    }
    await fetch('#', {//'https://famous.ai/api/crm/69f7abee58024ee320e024b5/subscribe'
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email, name: form.name, source: 'contact-form', tags: ['contact', 'langrushi'] }),
    }).catch(() => { });
    toast({ title: 'Message sent!', description: 'We will reply within 24 hours.' });
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-black">Contact Us</h1>
        <p className="mt-3 text-lg text-black">Questions? Course inquiries? We're here to help.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <Mail className="w-5 h-5 text-red-600 mb-2" />
            <div className="font-semibold">Email</div>
            <div className="text-sm text-black">info@langeushi.com</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <Phone className="w-5 h-5 text-red-600 mb-2" />
            <div className="font-semibold">Phone</div>
            <div className="text-sm text-black">721 937 1994</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <MapPin className="w-5 h-5 text-red-600 mb-2" />
            <div className="font-semibold">Pune, India</div>
            <div className="text-sm text-black">Mon–Fri</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
          </div>
          <div>
            <Label>Message</Label>
            <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={6} className="w-full mt-1 p-3 border border-slate-300 rounded-md focus:outline-none focus:border-[#1D4ED8]" required />
          </div>
          <Button type="submit" className="bg-[#0a192f] hover:bg-[#020c1b]">Send message</Button>
        </form>
      </div>
    </div>
  );
};
