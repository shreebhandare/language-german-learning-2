import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { toast } from '@/components/ui/use-toast';
import { Mail, Linkedin, Instagram, Facebook, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  const { setView } = useAppContext();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const isEmbed = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('embed') === 'true';
  if (isEmbed) return null;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast({ title: 'Please enter a valid email' });
      return;
    }
    setLoading(true);
    try {
      await fetch('https://famous.ai/api/crm/69f7abee58024ee320e024b5/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer-signup', tags: ['newsletter', 'langrushi'] }),
      });
      toast({ title: 'Subscribed!', description: 'Thanks for joining our newsletter.' });
      setEmail('');
    } catch {
      toast({ title: 'Subscription failed' });
    }
    setLoading(false);
  };

  return (
    <footer className="bg-slate-900 text-slate-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">

              <img src="https://cdn.designfast.io/image/2026-05-04/f1839146-da23-4922-a38b-c05ffeb53214.png" alt="logo-light" className='w-48 mb-4' />
            </div>
            <p className="text-sm text-slate-400 mb-4 max-w-sm">
              Master German with confidence. Practice A1 to B2 with native-quality exercises and personalized feedback.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-[#1D4ED8]"
              />
              <button type="submit" disabled={loading} className="px-4 py-2 bg-[#0a192f] hover:bg-[#020c1b] rounded text-white text-sm font-medium disabled:opacity-50">
                {loading ? '...' : 'Subscribe'}
              </button>
            </form>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => setView('learn')} className="hover:text-white">Practice Quizzes</button></li>
              <li><button onClick={() => setView('courses')} className="hover:text-white">Courses</button></li>
              <li><button onClick={() => setView('pricing')} className="hover:text-white">Pricing</button></li>
              <li><button onClick={() => setView('dashboard')} className="hover:text-white">Dashboard</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Levels</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => setView('learn')} className="hover:text-white">A1 Beginner</button></li>
              <li><button onClick={() => setView('learn')} className="hover:text-white">A2 Elementary</button></li>
              <li><button onClick={() => setView('learn')} className="hover:text-white">B1 Intermediate</button></li>
              <li><button onClick={() => setView('learn')} className="hover:text-white">B2 Upper-Intermediate</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => setView('about')} className="hover:text-white">About</button></li>
              <li><button onClick={() => setView('contact')} className="hover:text-white">Contact</button></li>
              <li><button onClick={() => toast({ title: 'Privacy Policy', description: 'Placeholder content' })} className="hover:text-white">Privacy</button></li>
              <li><button onClick={() => toast({ title: 'Terms of Service', description: 'Placeholder content' })} className="hover:text-white">Terms</button></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-black">© 2026 Langrushi. All rights reserved. Made with care for German learners.</p>
          <div className="flex gap-3">
            <a href="https://www.youtube.com/@langrushi" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition">
              <Youtube className="w-4 h-4" />
            </a>
            <a href="https://www.linkedin.com/in/rushika-hemade/?_l=en_US" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href="https://www.facebook.com/langrushi" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="https://www.instagram.com/langrushi" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="mailto:info@langeushi.com" className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition">
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
