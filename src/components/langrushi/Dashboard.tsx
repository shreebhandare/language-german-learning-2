import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import {
  Award, TrendingUp, BookOpen, ArrowRight, Sparkles, GraduationCap,
  KeyRound, PlayCircle, Star, CheckCircle, Target, LayoutDashboard,
  ChevronRight, BarChart3, Lock, LogOut, ArrowLeft, CreditCard
} from 'lucide-react';
import CollapsibleCard from './admin/CollapsibleCard';

/* ── Animated counter ────────────────────────── */
const Counter: React.FC<{ to: number; suffix?: string; duration?: number }> = ({ to, suffix = '', duration = 900 }) => {
  const [val, setVal] = useState(0);
  const rafRef = useRef<number>();
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setVal(Math.round(t * to));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [to, duration]);
  return <>{val}{suffix}</>;
};

type DashboardTab = 'overview' | 'practice' | 'analytics' | 'codes' | 'premium';

const Dashboard: React.FC = () => {
  const { user, exercises, setView, setActiveExerciseId, setAuthModal, applyClassCode, logout, upgradeToPaid, priceLifetime } = useAppContext();
  const [classCode, setClassCode] = useState('');
  const [tab, setTab] = useState<DashboardTab>('overview');
  const [couponCode, setCouponCode] = useState('');


  /* ── Not logged in ───────────────────────────── */
  if (!user) {
    return (
      <div className="admin-panel min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="card p-10 text-center animate-fade-up" style={{ maxWidth: '440px', width: '100%', margin: '40px auto' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--accent-light)', border: '1px solid rgba(37,99,235,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <GraduationCap className="w-7 h-7" style={{ color: 'var(--accent)' }} />
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>Sign in to your dashboard</h1>
          <p style={{ fontFamily: 'Figtree, sans-serif', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>Track progress, view scores, and access exclusive features.</p>
          <button className="btn-primary" style={{ margin: '0 auto' }} onClick={() => setAuthModal('login')}>Sign In</button>
        </div>
      </div>
    );
  }

  const attempts = user.attempts || [];
  const completedIds = new Set(attempts.map(a => a.exerciseId));
  const totalScore = attempts.reduce((s, a) => s + a.score, 0);
  const totalQuestions = attempts.reduce((s, a) => s + a.total, 0);
  const avgScore = totalQuestions ? Math.round((totalScore / totalQuestions) * 100) : 0;

  const badges = [
    completedIds.size >= 1 ? { name: 'Newcomer',   icon: Sparkles,    color: 'var(--accent)', bg: 'var(--accent-light)' } : null,
    completedIds.size >= 10 ? { name: 'Specialist', icon: Award,       color: '#D97706', bg: 'var(--warning-bg)' } : null,
    avgScore >= 80 && completedIds.size >= 5 ? { name: 'High Flyer', icon: TrendingUp, color: 'var(--success)', bg: 'var(--success-bg)' } : null,
    exercises.filter(e => e.level === 'A1' && completedIds.has(e.id)).length >= 5 ? { name: 'A1 Explorer', icon: GraduationCap, color: 'var(--purple)', bg: 'var(--purple-bg)' } : null,
  ].filter(Boolean) as { name: string; icon: any; color: string; bg: string }[];

  const recommended = exercises.filter(e => !completedIds.has(e.id)).filter(e => user.courseLevel ? e.level === user.courseLevel : e.level === 'A1').slice(0, 4);
  const activeEx = recommended[0];

  const stats = [
    { icon: BookOpen,     label: 'Quizzes Done', value: completedIds.size, suffix: '',  color: 'var(--accent)',   bg: 'var(--accent-light)' },
    { icon: CheckCircle,  label: 'Avg. Score',   value: avgScore,          suffix: '%', color: 'var(--success)',  bg: 'var(--success-bg)' },
    { icon: Target,       label: 'Total Attempts',value: attempts.length,  suffix: '',  color: 'var(--warning)',  bg: 'var(--warning-bg)' },
    { icon: Award,        label: 'Badges Earned', value: badges.length,   suffix: '',  color: 'var(--purple)',   bg: 'var(--purple-bg)' },
  ];

  const NAV_ITEMS: { key: DashboardTab; label: string; icon: React.FC<any>; desc: string }[] = [
    { key: 'overview',  label: 'Overview',      icon: LayoutDashboard, desc: 'Your progress at a glance' },
    { key: 'practice',  label: 'Practice Mode', icon: BookOpen,        desc: 'Recommended exercises' },
    { key: 'analytics', label: 'My Analytics',  icon: Award,           desc: 'Completed quizzes & scores' },
    { key: 'codes',     label: 'Enrolment / Codes', icon: KeyRound,    desc: 'Apply course access codes' },
    { key: 'premium',   label: 'Premium Upgrade',icon: CreditCard,     desc: 'Lifetime plans & checkout' },
  ];

  const activeNav = NAV_ITEMS.find(n => n.key === tab)!;
  const ActiveIcon = activeNav.icon;

  /* ── Tab Renderers ─────────────────────────── */

  const renderOverview = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="stat-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <Icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: '26px', color: 'var(--text-primary)', lineHeight: 1 }}>
                <Counter to={s.value} suffix={s.suffix} />
              </div>
              <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '5px' }}>{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Continue Card */}
      {activeEx && (
        <div className="card p-5" style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'var(--accent-light)', border: '1px solid rgba(37,99,235,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <PlayCircle className="w-7 h-7" style={{ color: 'var(--accent)' }} />
          </div>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: '4px' }}>Continue where you left off</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '10px' }}>{activeEx.title}</div>
            <div className="progress-track" style={{ maxWidth: '240px' }}>
              <div className="progress-fill" style={{ width: '40%' }} />
            </div>
          </div>
          <button className="btn-primary" style={{ gap: '7px', flexShrink: 0 }} onClick={() => { setActiveExerciseId(activeEx.id); setView('learn'); }}>
            Resume <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tier Banners */}
      {renderTierBanner()}

      {/* Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Recommended list mini */}
        <div className="card p-5">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>Recommended Practice</div>
            <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => setTab('practice')}>View All</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recommended.slice(0, 3).map(ex => (
              <div key={ex.id} onClick={() => { setActiveExerciseId(ex.id); setView('learn'); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px',
                  border: '1px solid var(--border)', background: 'var(--bg-hover)', cursor: 'pointer', transition: 'border-color 150ms'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div>
                  <div style={{ fontFamily: 'Figtree, sans-serif', fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>{ex.title}</div>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '3px' }}>
                    <span className="badge badge-blue">{ex.level}</span>
                    <span className="badge badge-slate">{ex.category}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Badges showcase */}
        <div className="card p-5">
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '14px' }}>My Badges</div>
          {badges.length === 0 ? (
            <p style={{ fontFamily: 'Figtree, sans-serif', fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '14px 0' }}>Complete quizzes to earn badges!</p>
          ) : (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {badges.map(b => {
                const Icon = b.icon;
                return (
                  <div key={b.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', background: b.bg, border: `1px solid ${b.color}22` }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: b.color }} />
                    <span style={{ fontFamily: 'Figtree, sans-serif', fontWeight: 600, fontSize: '12px', color: b.color }}>{b.name}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTierBanner = () => {
    if (user.tier === 'course') {
      return (
        <div className="card p-4 animate-fade-up" style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '4px solid var(--purple)' }}>
          <GraduationCap className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--purple)' }} />
          <div>
            <div style={{ fontFamily: 'Figtree, sans-serif', fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>Enrolled in {user.courseLevel} Course</div>
            <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: '13px', color: 'var(--text-secondary)' }}>You have full access to all materials for your level.</div>
          </div>
        </div>
      );
    }
    if (user.tier === 'paid') {
      return (
        <div className="card p-4 animate-fade-up" style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '4px solid var(--success)' }}>
          <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--success)' }} />
          <div>
            <div style={{ fontFamily: 'Figtree, sans-serif', fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>Lifetime Access Active</div>
            <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: '13px', color: 'var(--text-secondary)' }}>You have full access to all A1–B2 quizzes.</div>
          </div>
        </div>
      );
    }
    return (
      <div className="card p-4 animate-fade-up" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', borderLeft: '4px solid var(--warning)' }}>
        <KeyRound className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--warning)' }} />
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ fontFamily: 'Figtree, sans-serif', fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>Have a class code or want full access?</div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
            <input className="input" value={classCode} onChange={e => setClassCode(e.target.value)} placeholder="Enter class code…" style={{ flex: 1, minWidth: '160px', height: '34px', fontSize: '13px' }} />
            <button className="btn-ghost" style={{ padding: '0 12px', height: '34px', fontSize: '13px', flexShrink: 0 }} onClick={() => applyClassCode(classCode)}>Apply</button>
          </div>
        </div>
        <button className="btn-primary" style={{ flexShrink: 0 }} onClick={() => setView('pricing')}>Upgrade Now</button>
      </div>
    );
  };

  const renderPractice = () => {
    const levels = ['A1', 'A2', 'B1', 'B2'];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        <div>
          <div className="section-label">Interactive Practice</div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>All Recommended Exercises</h2>
        </div>

        {levels.map(level => {
          const levelEx = exercises.filter(e => e.level === level);
          if (levelEx.length === 0) return null;

          return (
            <CollapsibleCard key={level} label={`${level} LEVEL QUIZZES`} badge={
              <span className={`badge ${level === 'A1' ? 'badge-green' : level === 'A2' ? 'badge-blue' : level === 'B1' ? 'badge-purple' : 'badge-amber'}`}>
                {levelEx.length} available
              </span>
            }>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                {levelEx.map(ex => {
                  const done = completedIds.has(ex.id);
                  return (
                    <div
                      key={ex.id}
                      onClick={() => { setActiveExerciseId(ex.id); setView('learn'); }}
                      className="card p-5"
                      style={{
                        cursor: 'pointer', position: 'relative', borderLeft: `4px solid ${done ? 'var(--success)' : 'var(--accent)'}`,
                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px', marginBottom: '8px' }}>
                          <span className="badge badge-slate">{ex.category}</span>
                          {done && <span className="badge badge-green">✓ Completed</span>}
                        </div>
                        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                          {ex.title}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                        <span>{ex.type === 'Interactive' ? `${ex.questions?.length || 0} Questions` : 'Passive Practice'}</span>
                        <span style={{ color: 'var(--accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          Start <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CollapsibleCard>
          );
        })}
      </div>
    );
  };

  const renderAnalytics = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <div>
        <div className="section-label">Academic History</div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>Performance & Badges</h2>
      </div>

      <CollapsibleCard label="Badges Collection">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
          {[
            { name: 'Newcomer',   desc: 'Complete at least 1 quiz', req: completedIds.size >= 1,   icon: Sparkles,    color: 'var(--accent)', bg: 'var(--accent-light)' },
            { name: 'Specialist', desc: 'Complete 10 or more quizzes', req: completedIds.size >= 10, icon: Award,       color: '#D97706', bg: 'var(--warning-bg)' },
            { name: 'High Flyer', desc: 'Maintain 80%+ average on 5+ quizzes', req: avgScore >= 80 && completedIds.size >= 5, icon: TrendingUp, color: 'var(--success)', bg: 'var(--success-bg)' },
            { name: 'A1 Explorer', desc: 'Complete 5 or more A1 quizzes', req: exercises.filter(e => e.level === 'A1' && completedIds.has(e.id)).length >= 5, icon: GraduationCap, color: 'var(--purple)', bg: 'var(--purple-bg)' },
          ].map(b => {
            const Icon = b.icon;
            return (
              <div key={b.name} className="card p-4" style={{
                display: 'flex', flexDirection: 'column', gap: '8px', opacity: b.req ? 1 : 0.55,
                background: b.req ? b.bg : 'var(--bg-elevated)', border: `1px solid ${b.req ? b.color + '33' : 'var(--border)'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon className="w-5 h-5" style={{ color: b.req ? b.color : 'var(--text-muted)' }} />
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: b.req ? 'var(--text-primary)' : 'var(--text-muted)' }}>{b.name}</span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>{b.desc}</p>
                {b.req ? (
                  <span className="badge badge-green" style={{ width: 'fit-content', marginTop: '4px' }}>UNLOCKED</span>
                ) : (
                  <span className="badge badge-slate" style={{ width: 'fit-content', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Lock className="w-2.5 h-2.5" /> LOCKED
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </CollapsibleCard>

      <CollapsibleCard label="All Quiz Attempts" badge={
        <span className="badge badge-blue">{attempts.length} attempts</span>
      }>
        {attempts.length === 0 ? (
          <p style={{ fontFamily: 'Figtree, sans-serif', fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>No quiz attempts recorded yet. Start practicing!</p>
        ) : (
          <div style={{ margin: '-20px', borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Exercise</th>
                  <th>Level</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'center' }}>Score</th>
                  <th style={{ textAlign: 'center' }}>Percentage</th>
                  <th>Completion Date</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a, i) => {
                  const ex = exercises.find(e => e.id === a.exerciseId);
                  const pct = a.total > 0 ? Math.round((a.score / a.total) * 100) : 0;
                  const scoreColor = pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--danger)';
                  const scoreBg    = pct >= 70 ? 'var(--success-bg)' : pct >= 40 ? 'var(--warning-bg)' : 'var(--danger-bg)';
                  return (
                    <tr key={i}>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{ex?.title || a.exerciseId}</td>
                      <td><span className="badge badge-blue">{ex?.level || 'A1'}</span></td>
                      <td><span className="badge badge-slate">{ex?.category || 'General'}</span></td>
                      <td style={{ textAlign: 'center', fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600 }}>{a.score} / {a.total}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, color: scoreColor, background: scoreBg, padding: '3px 8px', borderRadius: '4px', fontSize: '11px' }}>
                          {pct}%
                        </span>
                      </td>
                      <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px' }}>{new Date(a.date).toLocaleDateString()}</td>
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

  const renderCodes = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <div>
        <div className="section-label">Account Enrolment</div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>Access & Class Codes</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Class Code Activation */}
        <div className="card p-5">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <KeyRound className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>Have a class code?</span>
          </div>
          <p style={{ fontFamily: 'Figtree, sans-serif', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            If your teacher has provided a class code, enter it below to instantly unlock lessons and track performance.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input className="input" value={classCode} onChange={e => setClassCode(e.target.value)} placeholder="e.g. GERMAN-B1-MAY2025" style={{ flex: 1 }} />
            <button className="btn-primary" onClick={() => applyClassCode(classCode)}>Unlock Course</button>
          </div>
        </div>

        {/* Current status details */}
        <div className="card p-5">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Sparkles className="w-5 h-5" style={{ color: 'var(--warning)' }} />
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>Account Plan Status</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Current Plan Tier</span>
              <span className={`badge ${user.tier === 'paid' ? 'badge-green' : user.tier === 'course' ? 'badge-purple' : user.tier === 'admin' ? 'badge-amber' : 'badge-blue'}`}>
                {user.tier.toUpperCase()}
              </span>
            </div>
            {user.tier === 'course' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Enrolled Course Level</span>
                <span className="badge badge-slate">{user.courseLevel || 'N/A'}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Registered Email</span>
              <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontFamily: 'IBM Plex Mono, monospace' }}>{user.email}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPremium = () => {
    const isAlreadyPaid = user.tier === 'paid' || user.tier === 'admin';
    const isCourse = user.tier === 'course';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        <div>
          <div className="section-label">Upgrade Plans</div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>Premium Access & Billing</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', alignItems: 'start' }}>
          {/* Checkout Card */}
          <div className="card p-6" style={{
            position: 'relative',
            borderTop: '5px solid var(--accent)',
            background: 'var(--bg-surface)'
          }}>
            <span className="badge badge-amber" style={{ position: 'absolute', top: '16px', right: '16px' }}>50% OFF SALE</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>₹{priceLifetime}</span>
              <span style={{ fontSize: '18px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>₹{Math.round(priceLifetime * 2)}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>one-time fee</span>
            </div>
            <p style={{ fontFamily: 'Figtree, sans-serif', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Get lifetime access to our entire hand-crafted quiz library. No monthly subscriptions, ever.
            </p>

            <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', padding: 0 }}>
              {[
                'Unlimited practice quiz attempts',
                'All A1, A2, B1, and B2 exercise categories',
                'Native speaker audio listening drills',
                'Self-grading writing tasks with model answers',
                'Full dashboard analytics & badge tracking',
                'Free updates & new exercise additions forever'
              ].map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" style={{ color: 'var(--success)' }} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            {/* Coupon Application */}
            {!isAlreadyPaid && !isCourse && (
              <div style={{ background: 'var(--bg-elevated)', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px', border: '1px solid var(--border)' }}>
                <label style={{ fontFamily: 'Figtree, sans-serif', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Coupon Code</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input className="input" value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="WELCOME20" style={{ height: '34px', fontSize: '13px' }} />
                </div>
              </div>
            )}

            <button
              className="btn-primary w-full"
              disabled={isAlreadyPaid || isCourse}
              onClick={() => upgradeToPaid(couponCode || undefined)}
              style={{ padding: '12px', fontSize: '14px', height: '44px' }}
            >
              {isAlreadyPaid ? 'Already Lifetime Premium Active ✓' : isCourse ? 'Course Enrolment Active ✓' : 'Get Lifetime Access'}
            </button>
          </div>

          {/* Cohorts & Support Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card p-5">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <GraduationCap className="w-5 h-5" style={{ color: 'var(--purple)' }} />
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>Live cohort courses</span>
              </div>
              <p style={{ fontFamily: 'Figtree, sans-serif', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '10px' }}>
                Looking for structured live group classes? Our cohorts are Goethe-exam prep certified, run for 8–14 weeks, and automatically include free lifetime platform access.
              </p>
              <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
                Email cohort queries to: <span style={{ color: 'var(--accent-text)' }}>info@langrushi.com</span>
              </div>
            </div>

            <div className="card p-5">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Lock className="w-4 h-4" style={{ color: 'var(--success)' }} />
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>Payment Guarantee</span>
              </div>
              <p style={{ fontFamily: 'Figtree, sans-serif', fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                SSL Encrypted Checkout. We support local cards, Stripe, PayPal, and UPI. All purchases are backed by our transparent 14-day refund policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="admin-panel flex" style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: '220px', flexShrink: 0,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: '0',
        height: '100vh',
      }}>
        {/* Brand Header */}
        <div style={{ padding: '18px 16px 12px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '8px',
              background: 'var(--accent-light)', border: '1px solid rgba(37,99,235,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <GraduationCap className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>Learner Center</div>
              <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Student Dashboard</div>
            </div>
          </div>
        </div>

        {/* Study Portal Back Button */}
        <div style={{ padding: '10px 8px 8px', borderBottom: '1px solid var(--border)' }}>
          <button
            onClick={() => setView('learn')}
            className="btn-primary w-full animate-pulse-subtle"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', fontSize: '13px', padding: '8px 12px' }}
          >
            <ArrowLeft className="w-4 h-4" /> Study Portal
          </button>
        </div>

        {/* Sidebar Nav links */}
        <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={`nav-item${active ? ' active' : ''}`}
                title={item.desc}
                aria-label={item.label}
                style={{ marginBottom: '2px' }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span style={{ flex: 1 }}>{item.label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />}
              </button>
            );
          })}
        </nav>

        {/* Sidebar bottom Profile Card */}
        <div style={{ padding: '10px 8px 12px', borderTop: '1px solid var(--border)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '9px',
            padding: '9px 10px', borderRadius: '10px', background: 'var(--bg-elevated)',
          }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '12px', color: '#fff',
            }}>
              {user.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Figtree, sans-serif', fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </div>
              <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '9px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{user.tier}</div>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              aria-label="Sign out"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '3px', borderRadius: '5px', transition: 'color 180ms ease' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>


      {/* ── Main content pane ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Sub Header top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '0 28px', height: '56px', flexShrink: 0,
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '9px',
            background: 'var(--accent-light)', border: '1px solid rgba(37,99,235,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <ActiveIcon className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>{activeNav.label}</div>
            <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: '12px', color: 'var(--text-muted)' }}>{activeNav.desc}</div>
          </div>

          {/* Breadcrumb path */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
            <LayoutDashboard className="w-3 h-3" />
            <span>Learner</span>
            <ChevronRight className="w-3 h-3" />
            <span style={{ color: 'var(--accent-text)', fontWeight: 600 }}>{activeNav.label}</span>
          </div>
        </div>

        {/* Inner page content */}
        <div style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
          <div key={tab} className="animate-fade-up">
            {tab === 'overview' && renderOverview()}
            {tab === 'practice' && renderPractice()}
            {tab === 'analytics' && renderAnalytics()}
            {tab === 'codes' && renderCodes()}
            {tab === 'premium' && renderPremium()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
