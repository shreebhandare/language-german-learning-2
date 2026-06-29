import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const isEmbed = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('embed') === 'true';
  if (isEmbed) return null;

  const year = new Date().getFullYear();

  return (
    <footer style={{ background: '#0F172A', color: '#94A3B8', marginTop: '64px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'inline-block', lineHeight: 0 }}>
          <img
            src="https://cdn.designfast.io/image/2026-05-04/f1839146-da23-4922-a38b-c05ffeb53214.png"
            alt="Langrushi"
            style={{ height: '36px', objectFit: 'contain', opacity: 0.85 }}
          />
        </Link>

        {/* Policy links */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { label: 'Privacy Policy', href: '#' },
            { label: 'Terms of Service', href: '#' },
            { label: 'Cookie Policy', href: '#' },
            { label: 'Pricing', href: '/pricing' },
          ].map(({ label, href }) => (
            href.startsWith('/') ? (
              <Link
                key={label}
                to={href}
                style={{ fontFamily: 'Figtree, sans-serif', fontSize: '12px', color: '#64748B', textDecoration: 'none', transition: 'color 150ms ease' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#CBD5E1')}
                onMouseLeave={e => (e.currentTarget.style.color = '#64748B')}
              >
                {label}
              </Link>
            ) : (
              <a
                key={label}
                href={href}
                style={{ fontFamily: 'Figtree, sans-serif', fontSize: '12px', color: '#64748B', textDecoration: 'none', transition: 'color 150ms ease' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#CBD5E1')}
                onMouseLeave={e => (e.currentTarget.style.color = '#64748B')}
              >
                {label}
              </a>
            )
          ))}
        </div>

        {/* Copyright */}
        <p style={{ fontFamily: 'Figtree, sans-serif', fontSize: '12px', color: '#334155', margin: 0 }}>
          © {year} Langrushi. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
