import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { toast } from '@/components/ui/use-toast';
import { Plus, Trash2, Infinity } from 'lucide-react';
import CollapsibleCard from './CollapsibleCard';

/* ── Label helper ────────────────────────────── */
const Lbl: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label style={{ display: 'block', fontFamily: 'Figtree, sans-serif', fontWeight: 600, fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px' }}>
    {children}
  </label>
);

/* ── Usage bar ───────────────────────────────── */
const UsageBar: React.FC<{ used: number; maxUses?: number }> = ({ used, maxUses }) => {
  if (!maxUses) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Infinity className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', color: 'var(--text-secondary)' }}>
          {used} used · unlimited
        </span>
      </div>
    );
  }
  const pct = Math.min(100, (used / maxUses) * 100);
  const exhausted = used >= maxUses;
  const color = exhausted ? 'var(--danger)' : pct >= 80 ? 'var(--warning)' : 'var(--success)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ flex: 1, minWidth: '70px', maxWidth: '110px' }}>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%`, background: color, transition: 'width 300ms ease' }} />
        </div>
      </div>
      <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', color: exhausted ? 'var(--danger)' : 'var(--text-secondary)', whiteSpace: 'nowrap', fontWeight: exhausted ? 700 : 400 }}>
        {used}/{maxUses}{exhausted ? ' · exhausted' : ''}
      </span>
    </div>
  );
};

/* ── Main component ──────────────────────────── */
const CouponsAdmin: React.FC = () => {
  const { coupons, addCoupon, updateCouponLocal, removeCoupon } = useAppContext();

  // Form state
  const [code, setCode]         = useState('');
  const [type, setType]         = useState<'percent' | 'fixed'>('percent');
  const [value, setValue]       = useState(20);
  const [limited, setLimited]   = useState(true);
  const [maxUses, setMaxUses]   = useState(50);

  const add = async () => {
    if (!code.trim()) { toast({ title: 'Code is required' }); return; }
    if (limited && maxUses < 1) { toast({ title: 'Max uses must be at least 1' }); return; }
    await addCoupon({
      id: 'co' + Date.now(),
      code: code.trim().toUpperCase(),
      discountType: type,
      value,
      maxUses: limited ? maxUses : undefined,
      used: 0,
      active: true,
    });
    setCode('');
    toast({ title: 'Coupon created' });
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <div className="section-label">Promotions</div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>Coupons</h2>
      </div>

      {/* ── Add form ── */}
      <CollapsibleCard label="Add New Coupon">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>

          {/* Code */}
          <div style={{ flex: '1 1 160px' }}>
            <Lbl>Code</Lbl>
            <input
              className="input"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="SUMMER25"
              onKeyDown={e => e.key === 'Enter' && add()}
            />
          </div>

          {/* Type */}
          <div style={{ minWidth: '130px' }}>
            <Lbl>Type</Lbl>
            <select className="select" value={type} onChange={e => setType(e.target.value as any)}>
              <option value="percent">Percent %</option>
              <option value="fixed">Fixed €</option>
            </select>
          </div>

          {/* Value */}
          <div style={{ minWidth: '90px' }}>
            <Lbl>Value</Lbl>
            <input className="input" type="number" min={1} value={value} onChange={e => setValue(+e.target.value)} style={{ width: '84px' }} />
          </div>

          {/* Usage limit toggle + field */}
          <div style={{ minWidth: '160px' }}>
            <Lbl>Usage Limit</Lbl>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="limitedToggle"
                checked={limited}
                onChange={e => setLimited(e.target.checked)}
                style={{ width: '15px', height: '15px', accentColor: 'var(--accent)', cursor: 'pointer', flexShrink: 0 }}
              />
              <label htmlFor="limitedToggle" style={{ fontFamily: 'Figtree, sans-serif', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', flexShrink: 0 }}>
                Limit uses
              </label>
              {limited && (
                <input
                  className="input"
                  type="number"
                  min={1}
                  value={maxUses}
                  onChange={e => setMaxUses(+e.target.value)}
                  style={{ width: '70px', marginLeft: '2px' }}
                />
              )}
            </div>
          </div>

          <button className="btn-primary" onClick={add} style={{ gap: '6px' }}>
            <Plus className="w-4 h-4" /> Add Coupon
          </button>
        </div>
      </CollapsibleCard>

      {/* ── Table ── */}
      <CollapsibleCard
        label="All Coupons"
        badge={
          coupons.length > 0 && (
            <span style={{ background: 'var(--accent)', color: '#fff', borderRadius: '999px', fontSize: '10px', fontWeight: 700, padding: '1px 8px', lineHeight: '18px' }}>
              {coupons.length}
            </span>
          )
        }
        style={{ marginBottom: 0 }}
      >
        {coupons.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontFamily: 'Figtree, sans-serif', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 4px' }}>No coupons yet</p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Create a discount code above.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', margin: '-20px' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Usage</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => {
                  const exhausted = !!(c.maxUses && c.used >= c.maxUses);
                  return (
                    <tr key={c.id} style={{ opacity: (!c.active || exhausted) ? 0.55 : 1, transition: 'opacity 200ms' }}>
                      <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600, color: 'var(--text-primary)', fontSize: '13px' }}>
                        {c.code}
                        {exhausted && (
                          <span style={{ marginLeft: '6px', fontFamily: 'IBM Plex Mono, monospace', fontSize: '9px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: '4px', padding: '1px 5px', fontWeight: 700, verticalAlign: 'middle' }}>
                            EXHAUSTED
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center',
                          padding: '3px 9px', borderRadius: '6px',
                          background: 'var(--warning-bg)',
                          color: 'var(--warning)',
                          fontFamily: 'IBM Plex Mono, monospace',
                          fontWeight: 700, fontSize: '12px',
                        }}>
                          {c.discountType === 'percent' ? `${c.value}% OFF` : `€${c.value} OFF`}
                        </span>
                      </td>
                      <td>
                        <UsageBar used={c.used} maxUses={c.maxUses} />
                      </td>
                      <td>
                        <button
                          onClick={() => updateCouponLocal(c.id, { active: !c.active })}
                          className={c.active && !exhausted ? 'badge badge-green' : 'badge badge-slate'}
                          style={{ cursor: exhausted ? 'default' : 'pointer', border: 'none', fontFamily: 'IBM Plex Mono, monospace', transition: 'all 180ms ease' }}
                          disabled={exhausted}
                          title={exhausted ? 'Coupon exhausted — all uses consumed' : undefined}
                        >
                          {exhausted ? '✕ Exhausted' : c.active ? '● Active' : '○ Inactive'}
                        </button>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => removeCoupon(c.id)}
                          title="Delete coupon"
                          aria-label="Delete coupon"
                          style={{ padding: '6px 8px', background: 'var(--danger-bg)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '6px', color: 'var(--danger)', cursor: 'pointer', transition: 'background 180ms ease' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.14)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'var(--danger-bg)')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CollapsibleCard>
    </div>
  );
};

export default CouponsAdmin;
