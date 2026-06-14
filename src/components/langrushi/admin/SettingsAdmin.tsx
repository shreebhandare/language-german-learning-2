import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { CheckCircle } from 'lucide-react';
import CollapsibleCard from './CollapsibleCard';

const SettingsAdmin: React.FC = () => {
  const {
    guestQuota,
    registeredQuota,
    setGuestQuota,
    setRegisteredQuota,
    answerDisplayMode,
    setAnswerDisplayMode,
    priceLifetime,
    setPriceLifetime,
    priceCourseA1,
    setPriceCourseA1,
    priceCourseA2,
    setPriceCourseA2,
    priceCourseB1,
    setPriceCourseB1,
    priceCourseB2,
    setPriceCourseB2,
  } = useAppContext();

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

  const PriceField: React.FC<{ label: string; desc: string; value: number; onChange: (v: number) => void }> =
    ({ label, desc, value, onChange }) => (
      <div style={{ padding: '18px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <div style={{ fontFamily: 'Figtree, sans-serif', fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '3px' }}>{label}</div>
            <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: '12px', color: 'var(--text-muted)' }}>{desc}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontFamily: 'Figtree, sans-serif', fontWeight: 600, fontSize: '16px', color: 'var(--text-primary)' }}>₹</span>
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
      </div>
    );

  const DropdownField: React.FC<{ label: string; desc: string; value: string; options: { label: string; value: string }[]; onChange: (v: any) => void }> =
    ({ label, desc, value, options, onChange }) => (
      <div style={{ padding: '18px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <div style={{ fontFamily: 'Figtree, sans-serif', fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '3px' }}>{label}</div>
            <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: '12px', color: 'var(--text-muted)' }}>{desc}</div>
          </div>
          <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className="input"
            style={{ width: '180px', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', fontFamily: 'Figtree, sans-serif' }}
          >
            {options.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
    );

  return (
    <div style={{ maxWidth: '560px' }}>
      <div style={{ marginBottom: '20px' }}>
        <div className="section-label">Configuration</div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>Quiz & Pricing Settings</h2>
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

      <CollapsibleCard label="Quiz Feedback Settings">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <DropdownField
            label="Correct Answer Feedback"
            desc="Control when correct answers are shown to the user."
            value={answerDisplayMode}
             options={[
              { label: 'In the quiz itself', value: 'instant' },
              { label: 'In the end summary review', value: 'end' },
              { label: 'Never reveal correct answers', value: 'none' },
            ]}
            onChange={setAnswerDisplayMode}
          />
        </div>
      </CollapsibleCard>

      <CollapsibleCard label="Course & Plan Pricing (INR)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <PriceField
            label="Lifetime Access Plan"
            desc="One-time payment for full platform lifetime access."
            value={priceLifetime}
            onChange={setPriceLifetime}
          />
          <PriceField
            label="A1 Course Price"
            desc="Enrollment fee for Level A1 Course."
            value={priceCourseA1}
            onChange={setPriceCourseA1}
          />
          <PriceField
            label="A2 Course Price"
            desc="Enrollment fee for Level A2 Course."
            value={priceCourseA2}
            onChange={setPriceCourseA2}
          />
          <PriceField
            label="B1 Course Price"
            desc="Enrollment fee for Level B1 Course."
            value={priceCourseB1}
            onChange={setPriceCourseB1}
          />
          <PriceField
            label="B2 Course Price"
            desc="Enrollment fee for Level B2 Course."
            value={priceCourseB2}
            onChange={setPriceCourseB2}
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
