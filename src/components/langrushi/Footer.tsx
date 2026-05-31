import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { useToast } from '@/components/ui/use-toast';
import { Mail, Linkedin, Instagram, Facebook, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  const { setView } = useAppContext();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const isEmbed = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('embed') === 'true';
  if (isEmbed) return null;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) { toast({ title: 'Please enter a valid email' }); return; }
    setLoading(true);
    try {
      await fetch('https://famous.ai/api/crm/69f7abee58024ee320e024b5/subscribe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer-signup', tags: ['newsletter', 'langrushi'] }),
      });
      toast({ title: 'Subscribed!', description: 'Thanks for joining our newsletter.' });
      setEmail('');
    } catch { toast({ title: 'Subscription failed' }); }
    setLoading(false);
  };

  const linkStyle: React.CSSProperties = {
    display: 'inline-block', fontFamily: 'Figtree, sans-serif', fontSize: '13px',
    color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer',
    padding: '2px 0', transition: 'color 180ms ease', textDecoration: 'none',
  };

  const FooterLink: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
    <li>
      <button style={linkStyle} onClick={onClick}
        onMouseEnter={e => (e.currentTarget.style.color = '#F1F5F9')}
        onMouseLeave={e => (e.currentTarget.style.color = '#94A3B8')}>
        {label}
      </button>
    </li>
  );

  return (
    <footer style={{ background: '#0F172A', color: '#94A3B8', marginTop: '64px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '40px' }} className="grid-cols-2 md:grid-cols-4">
          {/* Brand col */}
          <div>
            <img src="https://cdn.designfast.io/image/2026-05-04/f1839146-da23-4922-a38b-c05ffeb53214.png" alt="Langrushi" style={{ width: '160px', marginBottom: '14px', objectFit: 'contain' }} />
            <p style={{ fontFamily: 'Figtree, sans-serif', fontSize: '13px', lineHeight: 1.7, maxWidth: '280px', marginBottom: '18px' }}>
              Master German with confidence. Practice A1 to B2 with native-quality exercises and feedback.
            </p>
            {/* Newsletter */}
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '6px', maxWidth: '280px' }}>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{ flex: 1, padding: '8px 12px', borderRadius: '7px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#F1F5F9', fontFamily: 'Figtree, sans-serif', fontSize: '13px', outline: 'none' }}
              />
              <button type="submit" disabled={loading}
                style={{ padding: '8px 14px', borderRadius: '7px', background: 'var(--accent)', color: '#fff', fontFamily: 'Figtree, sans-serif', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', opacity: loading ? 0.6 : 1, whiteSpace: 'nowrap' }}>
                {loading ? '…' : 'Subscribe'}
              </button>
            </form>
          </div>

          {/* Platform */}
          <div>
            <h4 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '13px', color: '#F1F5F9', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Platform</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <FooterLink label="Practice Quizzes" onClick={() => setView('learn')} />
              <FooterLink label="Courses"          onClick={() => setView('courses')} />
              <FooterLink label="Pricing"          onClick={() => setView('pricing')} />
              <FooterLink label="Dashboard"        onClick={() => setView('dashboard')} />
            </ul>
          </div>

          {/* Levels */}
          <div>
            <h4 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '13px', color: '#F1F5F9', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Levels</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['A1 Beginner', 'A2 Elementary', 'B1 Intermediate', 'B2 Upper-Intermediate'].map(l => (
                <FooterLink key={l} label={l} onClick={() => setView('learn')} />
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '13px', color: '#F1F5F9', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <FooterLink label="About"   onClick={() => setView('about')} />
              <FooterLink label="Contact" onClick={() => setView('contact')} />
              <FooterLink label="Privacy" onClick={() => toast({ title: 'Privacy Policy' })} />
              <FooterLink label="Terms"   onClick={() => toast({ title: 'Terms of Service' })} />
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ fontFamily: 'Figtree, sans-serif', fontSize: '12px', color: '#475569' }}>
            © 2026 Langrushi. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { href: 'https://www.youtube.com/@langrushi', Icon: Youtube },
              { href: 'https://www.linkedin.com/in/rushika-hemade/', Icon: Linkedin },
              { href: 'https://www.facebook.com/langrushi', Icon: Facebook },
              { href: 'https://www.instagram.com/langrushi', Icon: Instagram },
              { href: 'mailto:info@langeushi.com', Icon: Mail },
            ].map(({ href, Icon }) => (
              <a key={href} href={href} target="_blank" rel="noreferrer"
                style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', transition: 'all 180ms ease', textDecoration: 'none' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#F1F5F9'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#94A3B8'; }}
              >
                <Icon className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
