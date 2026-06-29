import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { LEVELS, Level } from '@/lib/langrushi-data';
import { toast } from '@/components/ui/use-toast';
import { Plus, Trash2 } from 'lucide-react';
import CollapsibleCard from './CollapsibleCard';

const ClassCodesAdmin: React.FC = () => {
  const { classCodes, addClassCode, updateClassCodeLocal, removeClassCode } = useAppContext();
  const [code, setCode] = useState('');
  const [level, setLevel] = useState<Level>('A1');
  const [maxUses, setMaxUses] = useState(50);

  const add = async () => {
    if (!code.trim()) { toast({ title: 'Code is required' }); return; }
    await addClassCode({ id: 'cc' + Date.now(), code: code.trim().toUpperCase(), level, maxUses, used: 0, active: true });
    setCode('');
    toast({ title: 'Class code saved' });
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <div className="section-label">Access Management</div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>Class Codes</h2>
      </div>

      {/* Add form */}
      <CollapsibleCard label="Add New Code">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 180px' }}>
            <label style={{ display: 'block', fontFamily: 'Figtree, sans-serif', fontWeight: 600, fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px' }}>Code</label>
            <input className="input" value={code} onChange={e => setCode(e.target.value)} placeholder="GERMAN-B1-2026" onKeyDown={e => e.key === 'Enter' && add()} />
          </div>
          <div style={{ minWidth: '110px' }}>
            <label style={{ display: 'block', fontFamily: 'Figtree, sans-serif', fontWeight: 600, fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px' }}>Level</label>
            <select className="select" value={level} onChange={e => setLevel(e.target.value as Level)}>
              {LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div style={{ minWidth: '110px' }}>
            <label style={{ display: 'block', fontFamily: 'Figtree, sans-serif', fontWeight: 600, fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px' }}>Max uses</label>
            <input className="input" type="number" value={maxUses} onChange={e => setMaxUses(+e.target.value)} style={{ width: '100px' }} />
          </div>
          <button className="btn-primary" onClick={add} style={{ gap: '6px' }}>
            <Plus className="w-4 h-4" /> Add Code
          </button>
        </div>
      </CollapsibleCard>

      {/* Table */}
      <CollapsibleCard
        label="All Class Codes"
        badge={
          classCodes.length > 0 && (
            <span style={{ background: 'var(--accent)', color: '#fff', borderRadius: '999px', fontSize: '10px', fontWeight: 700, padding: '1px 8px', lineHeight: '18px' }}>
              {classCodes.length}
            </span>
          )
        }
        style={{ marginBottom: 0 }}
      >
        {classCodes.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontFamily: 'Figtree, sans-serif', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 4px' }}>No class codes yet</p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Add one above to get started.</p>
          </div>
        ) : (
          <div className="table-container" style={{ margin: '-20px' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Level</th>
                  <th>Usage</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {classCodes.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600, color: 'var(--text-primary)', fontSize: '13px' }}>{c.code}</td>
                    <td><span className="badge badge-blue">{c.level}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, maxWidth: '100px' }}>
                          <div className="progress-track" style={{ marginBottom: '3px' }}>
                            <div className="progress-fill" style={{ width: `${Math.min(100, (c.used / c.maxUses) * 100)}%` }} />
                          </div>
                        </div>
                        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{c.used}/{c.maxUses}</span>
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => updateClassCodeLocal(c.id, { active: !c.active })}
                        className={c.active ? 'badge badge-green' : 'badge badge-slate'}
                        style={{ cursor: 'pointer', border: 'none', fontFamily: 'IBM Plex Mono, monospace', transition: 'all 180ms ease' }}
                      >
                        {c.active ? '● Active' : '○ Inactive'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => removeClassCode(c.id)}
                        title="Delete code"
                        aria-label="Delete code"
                        style={{ padding: '6px 8px', background: 'var(--danger-bg)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '6px', color: 'var(--danger)', cursor: 'pointer', transition: 'background 180ms ease' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.14)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'var(--danger-bg)')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CollapsibleCard>
    </div>
  );
};

export default ClassCodesAdmin;
