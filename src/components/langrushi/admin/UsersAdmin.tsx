import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { toast } from '@/components/ui/use-toast';
import { Download, Trophy, TrendingDown, ChevronDown, ChevronUp, BarChart3, RefreshCw } from 'lucide-react';
import CollapsibleCard from './CollapsibleCard';

interface UserPerf {
  id: string; name: string; email: string; tier: string; registeredAt: string;
  totalAttempts: number; totalScore: number; totalQuestions: number; avgPct: number; quizzesDone: number;
}

const TierBadge: React.FC<{ tier: string }> = ({ tier }) => {
  const map: Record<string, [string, string]> = {
    admin:      ['Admin',    'badge badge-amber'],
    paid:       ['Lifetime', 'badge badge-green'],
    course:     ['Course',   'badge badge-purple'],
    registered: ['Free',     'badge badge-blue'],
    guest:      ['Guest',    'badge badge-slate'],
  };
  const [label, cls] = map[tier] ?? ['—', 'badge badge-slate'];
  return <span className={cls}>{label}</span>;
};

const ScoreColor = (pct: number) => pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--danger)';
const ScoreBg    = (pct: number) => pct >= 70 ? 'var(--success-bg)' : pct >= 40 ? 'var(--warning-bg)' : 'var(--danger-bg)';

/* Skeleton row for table */
const SkeletonUserRow = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
    <div className="skeleton" style={{ width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0 }} />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div className="skeleton" style={{ height: '13px', width: '140px' }} />
      <div className="skeleton" style={{ height: '11px', width: '200px' }} />
    </div>
    <div className="skeleton" style={{ height: '22px', width: '60px', borderRadius: '99px' }} />
    <div className="skeleton" style={{ height: '13px', width: '40px' }} />
    <div className="skeleton" style={{ height: '13px', width: '40px' }} />
    <div className="skeleton" style={{ height: '13px', width: '40px' }} />
  </div>
);

const UsersAdmin: React.FC = () => {
  const { users, refreshUsers, changeUserTier, exercises, fetchAllAttempts } = useAppContext();
  const [allAttempts, setAllAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    await refreshUsers();
    const a = await fetchAllAttempts();
    setAllAttempts(a);
    setLoading(false);
  };

  const userPerf: UserPerf[] = users.map(u => {
    const ua = allAttempts.filter(a => a.userId === u.id);
    const totalScore     = ua.reduce((s, a) => s + a.score, 0);
    const totalQuestions = ua.reduce((s, a) => s + a.total, 0);
    const avgPct         = totalQuestions ? Math.round((totalScore / totalQuestions) * 100) : 0;
    const quizzesDone    = new Set(ua.map(a => a.exerciseId)).size;
    return { id: u.id, name: u.name, email: u.email, tier: u.tier, registeredAt: u.registeredAt, totalAttempts: ua.length, totalScore, totalQuestions, avgPct, quizzesDone };
  });

  const ranked = userPerf.filter(u => u.totalAttempts > 0).sort((a, b) => b.avgPct - a.avgPct);
  const top3   = ranked.slice(0, 3);
  const bot3   = ranked.length > 3 ? ranked.slice(-3).reverse() : [];

  const exportCSV = () => {
    const csv = 'email,name,tier,quizzes_done,avg_score,total_attempts,registeredAt\n' +
      userPerf.map(u => `${u.email},${u.name},${u.tier},${u.quizzesDone},${u.avgPct}%,${u.totalAttempts},${u.registeredAt}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'users_performance.csv'; a.click();
    toast({ title: 'CSV exported' });
  };

  const getUserAttempts = (uid: string) =>
    allAttempts.filter(a => a.userId === uid).map(a => {
      const ex = exercises.find(e => e.id === a.exerciseId);
      return { ...a, exerciseTitle: ex?.title || a.exerciseId, level: ex?.level, category: ex?.category };
    });

  const medals = ['🥇', '🥈', '🥉'];

  /* ── Leaderboard card row ────────────────────── */
  const LeaderRow: React.FC<{ u: UserPerf; rank: string | number; good: boolean }> = ({ u, rank, good }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '11px 14px', borderRadius: '9px',
      background: good ? 'rgba(5,150,105,0.04)' : 'rgba(220,38,38,0.04)',
      border: `1px solid ${good ? 'rgba(5,150,105,0.12)' : 'rgba(220,38,38,0.12)'}`,
    }}>
      <span style={{ fontSize: '18px', flexShrink: 0 }}>{rank}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Figtree, sans-serif', fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
        <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: '17px', color: ScoreColor(u.avgPct) }}>{u.avgPct}%</div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{u.quizzesDone} quizzes</div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="section-label">Performance Intelligence</div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Users
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '13px', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '8px' }}>({users.length} total)</span>
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={loadData} disabled={loading} className="btn-ghost" style={{ gap: '6px', opacity: loading ? 0.6 : 1 }}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button onClick={exportCSV} className="btn-ghost" style={{ gap: '6px' }}>
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Skeleton while loading */}
      {loading && (
        <div className="card" style={{ overflow: 'hidden' }}>
          {Array.from({ length: 4 }).map((_, i) => <SkeletonUserRow key={i} />)}
        </div>
      )}

      {/* Leaderboard */}
      {!loading && ranked.length > 0 && (
        <CollapsibleCard label="Leaderboard">
          <div className="dashboard-grid-equal">
            <div style={{ background: 'var(--bg-elevated)', borderRadius: '10px', padding: '16px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Trophy className="w-4 h-4" style={{ color: '#D97706' }} />
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>Top Performers</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {top3.map((u, i) => <LeaderRow key={u.id} u={u} rank={medals[i]} good={true} />)}
              </div>
            </div>
            <div style={{ background: 'var(--bg-elevated)', borderRadius: '10px', padding: '16px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <TrendingDown className="w-4 h-4" style={{ color: 'var(--danger)' }} />
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>Needs Improvement</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {bot3.length === 0
                  ? <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>Not enough data yet.</div>
                  : bot3.map((u, i) => <LeaderRow key={u.id} u={u} rank={ranked.findIndex(r => r.id === u.id) + 1} good={false} />)
                }
              </div>
            </div>
          </div>
        </CollapsibleCard>
      )}

      {/* Full table */}
      {!loading && (
        <CollapsibleCard
          label="All Users"
          badge={
            users.length > 0 && (
              <span style={{ background: 'var(--accent)', color: '#fff', borderRadius: '999px', fontSize: '10px', fontWeight: 700, padding: '1px 8px', lineHeight: '18px' }}>
                {users.length}
              </span>
            )
          }
          style={{ marginBottom: 0 }}
        >
          {users.length === 0 ? (
            <div className="empty-state">
              <p style={{ fontFamily: 'Figtree, sans-serif', fontSize: '14px', color: 'var(--text-muted)' }}>No users yet.</p>
            </div>
          ) : (
            <div style={{ margin: '-20px', borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
              {userPerf.map(u => {
                const isExp = expanded === u.id;
                const attempts = isExp ? getUserAttempts(u.id) : [];
                return (
                  <div key={u.id}>
                    <button
                      onClick={() => setExpanded(isExp ? null : u.id)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '13px 20px', background: 'none', border: 'none', cursor: 'pointer',
                        borderBottom: '1px solid var(--border)', textAlign: 'left',
                        borderLeft: `3px solid ${isExp ? 'var(--accent)' : 'transparent'}`,
                        transition: 'background 180ms ease',
                      }}
                      onMouseEnter={e => { if (!isExp) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                      onMouseLeave={e => { if (!isExp) e.currentTarget.style.background = 'none'; }}
                    >
                      {/* Avatar */}
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '13px', color: '#fff',
                      }}>
                        {u.name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'Figtree, sans-serif', fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>{u.name}</div>
                        <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: '11px', color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>

                      {/* Tier */}
                      <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <TierBadge tier={u.tier} />
                        {u.tier !== 'admin' && (
                          <select
                            value={u.tier}
                            onChange={e => { e.stopPropagation(); changeUserTier(u.id, e.target.value); }}
                            style={{ padding: '3px 8px', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontFamily: 'Figtree, sans-serif', fontSize: '11px', cursor: 'pointer', outline: 'none' }}
                          >
                            <option value="registered">registered</option>
                            <option value="paid">paid</option>
                            <option value="course">course</option>
                          </select>
                        )}
                      </div>

                      {/* Stats */}
                      {[
                        { val: u.quizzesDone, sub: 'quizzes' },
                        { val: u.totalAttempts > 0 ? `${u.avgPct}%` : '—', sub: 'avg', color: u.totalAttempts > 0 ? ScoreColor(u.avgPct) : undefined },
                        { val: u.totalAttempts, sub: 'attempts' },
                      ].map((s, i) => (
                        <div key={i} style={{ textAlign: 'center', width: '60px', flexShrink: 0 }} className="hidden sm:block">
                          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: '14px', color: s.color ?? 'var(--text-primary)' }}>{s.val}</div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{s.sub}</div>
                        </div>
                      ))}

                      {isExp
                        ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                        : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                      }
                    </button>

                    {/* Expanded attempts */}
                    {isExp && (
                      <div style={{ background: 'var(--bg-elevated)', padding: '0 20px 16px', borderBottom: '1px solid var(--border)' }}>
                        {attempts.length === 0
                          ? <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic' }}>No quiz attempts recorded.</div>
                          : (
                            <div className="table-container" style={{ borderRadius: '9px', border: '1px solid var(--border)', marginTop: '12px', background: 'var(--bg-surface)' }}>
                              <table className="data-table">
                                <thead>
                                  <tr>
                                    <th>Exercise</th><th>Level</th><th>Category</th>
                                    <th style={{ textAlign: 'center' }}>Score</th>
                                    <th style={{ textAlign: 'center' }}>%</th>
                                    <th>Date</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {attempts.slice(0, 20).map((a, i) => {
                                    const pct = a.total > 0 ? Math.round((a.score / a.total) * 100) : 0;
                                    return (
                                      <tr key={i}>
                                        <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{a.exerciseTitle}</td>
                                        <td>{a.level ? <span className="badge badge-blue">{a.level}</span> : '—'}</td>
                                        <td>{a.category || '—'}</td>
                                        <td style={{ textAlign: 'center', fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600 }}>{a.score}/{a.total}</td>
                                        <td style={{ textAlign: 'center' }}>
                                          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, color: ScoreColor(pct), background: ScoreBg(pct), padding: '2px 7px', borderRadius: '4px', fontSize: '11px' }}>
                                            {pct}%
                                          </span>
                                        </td>
                                        <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px' }}>{new Date(a.date).toLocaleDateString()}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                              {attempts.length > 20 && <div style={{ padding: '8px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>Showing 20 of {attempts.length} attempts</div>}
                            </div>
                          )
                        }
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CollapsibleCard>
      )}
    </div>
  );
};

export default UsersAdmin;
