import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { CheckCircle } from 'lucide-react';
import CollapsibleCard from './CollapsibleCard';

const SettingsAdmin: React.FC = () => {
  const { guestQuota, registeredQuota, setGuestQuota, setRegisteredQuota } = useAppContext();

  const Field: React.FC<{ label: string; desc: string; value: number; onChange: (v: number) => void }> =
    ({ label, desc, value, onChange }) => (
      <div style={{ padding: '18px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <div style={{ fontFamily: 'Figtree, sans-serif', fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '3px' }}>{label}</div>
            <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: '12px', color: 'var(--text-muted)' }}>{desc}</div>
          </div>
          <input
            type="number"
            value={value}
            onChange={e => onChange(+e.target.value)}
            min={0}
            className="input"
            style={{ width: '90px', textAlign: 'center', fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: '16px' }}
          />
        </div>
      </div>
    );

  return (
    <div style={{ maxWidth: '560px' }}>
      <div style={{ marginBottom: '20px' }}>
        <div className="section-label">Configuration</div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>Quiz Access Settings</h2>
      </div>

      <CollapsibleCard label="Quiz Access Quotas">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Field
            label="Guest free quizzes"
            desc="Number of attempts a guest can make before being asked to register."
            value={guestQuota}
            onChange={setGuestQuota}
          />
          <Field
            label="Registered free quizzes"
            desc="Number of attempts a registered (free) user can make before the upgrade prompt."
            value={registeredQuota}
            onChange={setRegisteredQuota}
          />
        </div>
      </CollapsibleCard>

      <CollapsibleCard label="Save Behaviour" style={{ marginBottom: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '12px 14px', borderRadius: '9px',
          background: 'var(--success-bg)', border: '1px solid rgba(5,150,105,0.18)',
        }}>
          <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--success)' }} />
          <span style={{ fontFamily: 'Figtree, sans-serif', fontSize: '13px', color: 'var(--success)' }}>
            Settings are saved automatically and persist across sessions.
          </span>
        </div>
      </CollapsibleCard>
    </div>
  );
};

export default SettingsAdmin;
