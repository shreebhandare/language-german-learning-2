import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Award, TrendingUp, BookOpen, ArrowRight, Sparkles, GraduationCap, KeyRound, PlayCircle, Star, CheckCircle, Target } from 'lucide-react';

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

/* ── Skeleton stat card ──────────────────────── */
const SkeletonStat = () => (
  <div className="stat-card">
    <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: '9px', marginBottom: '14px' }} />
    <div className="skeleton" style={{ width: '60px', height: '28px', marginBottom: '6px' }} />
    <div className="skeleton" style={{ width: '90px', height: '13px' }} />
  </div>
);

const Dashboard: React.FC = () => {
  const { user, exercises, setView, setActiveExerciseId, setAuthModal, applyClassCode } = useAppContext();
  const [classCode, setClassCode] = useState('');

  /* ── Not logged in ───────────────────────────── */
  if (!user) {
    return (
      <div style={{ maxWidth: '480px', margin: '80px auto', padding: '0 16px', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--accent-light)', border: '1px solid rgba(37,99,235,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
          <GraduationCap className="w-7 h-7" style={{ color: 'var(--accent)' }} />
        </div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Sign in to your dashboard</h1>
        <p style={{ fontFamily: 'Figtree, sans-serif', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>Track progress, view scores, and access exclusive features.</p>
        <button className="btn-primary" style={{ margin: '0 auto' }} onClick={() => setAuthModal('login')}>Sign In</button>
      </div>
    );
  }

  /* ── Upgrade prompt ──────────────────────────── */
  if (user.tier === 'guest' || user.tier === 'registered') {
    return (
      <div style={{ maxWidth: '640px', margin: '48px auto', padding: '0 16px' }}>
        <div className="card p-8 text-center animate-fade-up">
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--warning-bg)', border: '1px solid rgba(217,119,6,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Sparkles className="w-6 h-6" style={{ color: 'var(--warning)' }} />
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}>Unlock your potential</h1>
          <p style={{ fontFamily: 'Figtree, sans-serif', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '28px', maxWidth: '400px', margin: '0 auto 28px' }}>
            Your profile is ready. Upgrade to track your full learning journey, earn badges, and see detailed analytics.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', textAlign: 'left' }}>
            {/* Class code */}
            <div style={{ background: 'var(--bg-elevated)', borderRadius: '12px', padding: '20px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '6px' }}>
                <KeyRound className="w-4 h-4" style={{ color: 'var(--accent)' }} /> Have a class code?
              </div>
              <p style={{ fontFamily: 'Figtree, sans-serif', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Students from the main portal can enter their code here.</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input className="input" value={classCode} onChange={e => setClassCode(e.target.value)} placeholder="GERMAN-B1-MAY2025" style={{ flex: 1 }} />
                <button className="btn-primary" style={{ padding: '0 14px', flexShrink: 0 }} onClick={() => applyClassCode(classCode)}>Unlock</button>
              </div>
            </div>
            {/* Upgrade */}
            <div style={{ background: 'var(--accent)', borderRadius: '12px', padding: '20px', color: '#fff' }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>Quiz Lifetime Access</div>
              <p style={{ fontFamily: 'Figtree, sans-serif', fontSize: '13px', opacity: 0.85, marginBottom: '14px' }}>Unlock all A1–B2 quizzes forever. One-time payment.</p>
              <button
                onClick={() => setView('pricing')}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', color: '#fff', fontFamily: 'Figtree, sans-serif', fontWeight: 600, fontSize: '13px', cursor: 'pointer', transition: 'background 180ms ease' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.28)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
              >
                Upgrade Now <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Full dashboard ──────────────────────────── */
  const attempts = user.attempts;
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

  const recentAttempts = [...attempts].reverse().slice(0, 5);
  const recommended = exercises.filter(e => !completedIds.has(e.id)).filter(e => user.courseLevel ? e.level === user.courseLevel : e.level === 'A1').slice(0, 3);
  const activeEx = recommended[0];

  const stats = [
    { icon: BookOpen,     label: 'Quizzes Done', value: completedIds.size, suffix: '',  color: 'var(--accent)',   bg: 'var(--accent-light)' },
    { icon: CheckCircle,  label: 'Avg. Score',   value: avgScore,          suffix: '%', color: 'var(--success)',  bg: 'var(--success-bg)' },
    { icon: Target,       label: 'Total Attempts',value: attempts.length,  suffix: '',  color: 'var(--warning)',  bg: 'var(--warning-bg)' },
    { icon: Award,        label: 'Badges Earned', value: badges.length,   suffix: '',  color: 'var(--purple)',   bg: 'var(--purple-bg)' },
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Greeting */}
      <div style={{ marginBottom: '28px' }}>
        <div className="section-label">Your Dashboard</div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>
          Guten Tag, {user?.name?.split(' ')[0] || 'Learner'}!
        </h1>
        <p style={{ fontFamily: 'Figtree, sans-serif', fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>Keep up your streak — you're doing great!</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="stat-card animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
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

      {/* Continue card */}
      {activeEx && (
        <div className="card p-5 mb-6 animate-fade-up" style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
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

      {/* Tier banner */}
      {user.tier === 'course' ? (
        <div className="card p-4 mb-6 animate-fade-up" style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '4px solid var(--purple)' }}>
          <GraduationCap className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--purple)' }} />
          <div>
            <div style={{ fontFamily: 'Figtree, sans-serif', fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>Enrolled in {user.courseLevel} Course</div>
            <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: '13px', color: 'var(--text-secondary)' }}>You have full access to all materials for your level.</div>
          </div>
        </div>
      ) : user.tier !== 'admin' && (
        <div className="card p-4 mb-6 animate-fade-up" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', borderLeft: '4px solid var(--warning)' }}>
          <Star className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--warning)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Figtree, sans-serif', fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>Unlock Premium Quizzes</div>
            <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: '13px', color: 'var(--text-secondary)' }}>Access 200+ quizzes from A1 to C2 — lifetime access.</div>
          </div>
          <button className="btn-primary" style={{ flexShrink: 0 }} onClick={() => setView('pricing')}>Upgrade Now</button>
        </div>
      )}

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Recommended */}
        <div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)', marginBottom: '14px' }}>Recommended for You</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {recommended.length === 0 ? (
              <div className="card p-5" style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
                🎉 No new recommendations — you're all caught up!
              </div>
            ) : recommended.map((ex, i) => (
              <div key={ex.id} onClick={() => { setActiveExerciseId(ex.id); setView('learn'); }}
                className="exercise-card p-5 animate-fade-up"
                style={{ animationDelay: `${i * 60}ms`, cursor: 'pointer' }}>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <span className="badge badge-blue">{ex.level}</span>
                  <span className="badge badge-slate">{ex.category}</span>
                </div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.3 }}>{ex.title}</div>
                <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: '12px', color: 'var(--text-muted)' }}>
                  {ex.type === 'Interactive' ? `${ex.questions?.length || 0} questions` : 'Model answer'}
                </div>
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: 'var(--accent)', fontSize: '12px', fontWeight: 600 }}>
                  Practice <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            ))}
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '12px' }}>Your Badges</div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {badges.map(b => {
                  const Icon = b.icon;
                  return (
                    <div key={b.name} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 14px', borderRadius: '9px', background: b.bg, border: `1px solid ${b.color}22` }}>
                      <Icon className="w-4 h-4" style={{ color: b.color }} />
                      <span style={{ fontFamily: 'Figtree, sans-serif', fontWeight: 600, fontSize: '13px', color: b.color }}>{b.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)', marginBottom: '14px' }}>Recent Activity</div>
          <div className="card" style={{ overflow: 'hidden' }}>
            {recentAttempts.length === 0 ? (
              <div style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic' }}>No activity recorded yet.</div>
            ) : (
              recentAttempts.map((a, i) => {
                const ex = exercises.find(e => e.id === a.exerciseId);
                if (!ex) return null;
                const pct = Math.round((a.score / a.total) * 100);
                const scoreColor = pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--danger)';
                const scoreBg    = pct >= 70 ? 'var(--success-bg)' : pct >= 40 ? 'var(--warning-bg)' : 'var(--danger-bg)';
                return (
                  <div key={i} style={{ padding: '13px 16px', borderBottom: i < recentAttempts.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ fontFamily: 'Figtree, sans-serif', fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.title}</div>
                      <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: '12px', color: scoreColor, background: scoreBg, padding: '2px 7px', borderRadius: '5px', flexShrink: 0 }}>{pct}%</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '3px' }}>
                      <span style={{ fontFamily: 'Figtree, sans-serif', fontSize: '11px', color: 'var(--text-muted)' }}>{ex.category}</span>
                      <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(a.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
