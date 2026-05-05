import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Award, TrendingUp, BookOpen, ArrowRight, Sparkles, GraduationCap, KeyRound, PlayCircle, Star, CheckCircle, Target } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, exercises, setView, setActiveExerciseId, setAuthModal, applyClassCode } = useAppContext();
  const [classCode, setClassCode] = useState('');

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-4">
          <GraduationCap className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Sign in to access your dashboard</h1>
        <p className="text-black mb-6">Track progress, view scores, and access exclusive features.</p>
        <Button className="bg-[#0a192f] hover:bg-[#020c1b]" onClick={() => setAuthModal('login')}>Sign in</Button>
      </div>
    );
  }

  // Dashboard calculations
  const attempts = user.attempts;
  const completedIds = new Set(attempts.map(a => a.exerciseId));
  const totalScore = attempts.reduce((s, a) => s + a.score, 0);
  const totalQuestions = attempts.reduce((s, a) => s + a.total, 0);
  const avgScore = totalQuestions ? Math.round((totalScore / totalQuestions) * 100) : 0;

  // Badge Logic
  const badges = [];
  if (completedIds.size >= 1) badges.push({ name: 'Newcomer', icon: Sparkles, color: 'text-blue-500' });
  if (completedIds.size >= 10) badges.push({ name: 'Specialist', icon: Award, color: 'text-orange-500' });
  if (avgScore >= 80 && completedIds.size >= 5) badges.push({ name: 'High Flyer', icon: TrendingUp, color: 'text-green-500' });
  if (exercises.filter(e => e.level === 'A1' && completedIds.has(e.id)).length >= 5) badges.push({ name: 'A1 Explorer', icon: GraduationCap, color: 'text-purple-500' });

  const recentAttempts = [...attempts].reverse().slice(0, 5);
  const recommended = exercises
    .filter(e => !completedIds.has(e.id))
    .filter(e => user.courseLevel ? e.level === user.courseLevel : e.level === 'A1')
    .slice(0, 3);

  const activeEx = recommended[0]; // For continue card

  const stats = [
    { icon: <BookOpen className="w-5 h-5" />, label: 'Quizzes Done', value: completedIds.size.toString(), color: 'bg-blue-50 text-blue-600' },
    { icon: <CheckCircle className="w-5 h-5" />, label: 'Avg. Score', value: `${avgScore}%`, color: 'bg-green-50 text-green-600' },
    { icon: <Target className="w-5 h-5" />, label: 'Attempts', value: attempts.length.toString(), color: 'bg-orange-50 text-orange-600' },
    { icon: <Award className="w-5 h-5" />, label: 'Badges', value: badges.length.toString(), color: 'bg-purple-50 text-purple-600' },
  ];

  if (user.tier === 'guest' || user.tier === 'registered') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-full bg-orange-100 flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold mb-3 text-black font-serif">Unlock your potential</h1>
          <p className="text-slate-500 mb-8 max-w-lg mx-auto">Your basic profile is ready! Upgrade to track your full learning journey, earn badges, and see detailed analytics.</p>

          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h3 className="font-bold text-black mb-2 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-red-600" /> Have a class code?
              </h3>
              <p className="text-sm text-slate-500 mb-4">Students from the main portal can enter their code here.</p>
              <div className="flex gap-2">
                <Input
                  value={classCode}
                  onChange={e => setClassCode(e.target.value)}
                  placeholder="GERMAN-B1-MAY2025"
                  className="bg-white"
                />
                <Button className="bg-[#0a192f] hover:bg-[#020c1b]" onClick={() => applyClassCode(classCode)}>Unlock</Button>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#1D4ED8] to-[#2563EB] rounded-xl p-6 text-white shadow-lg shadow-blue-200/50">
              <h3 className="font-bold mb-2">Quiz Lifetime Access</h3>
              <p className="text-sm text-blue-100 mb-4">Unlock all A1–B2 quizzes forever. One-time payment.</p>
              <Button className="w-full bg-[#0a192f] hover:bg-[#020c1b] border-none" onClick={() => setView('pricing')}>
                Upgrade Now <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-black mb-2 font-serif">
          Guten Tag, {user?.name?.split(' ')[0] || 'Learner'}!
        </h2>
        <p className="text-slate-500 mb-8">Keep up your streak — you're doing great!</p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
                {s.icon}
              </div>
              <div className="text-3xl font-bold text-black font-serif">{s.value}</div>
              <div className="text-sm text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Continue Card */}
        {activeEx && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8 flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <PlayCircle className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1">Continue where you left off</div>
              <div className="text-xl font-bold text-black mb-2">{activeEx.title}</div>
              <div className="h-2 bg-blue-200 rounded-full overflow-hidden w-full max-w-sm">
                <div className="h-full bg-blue-600" style={{ width: '40%' }}></div>
              </div>
              <div className="text-xs text-blue-700 mt-2">Start practice to complete this category</div>
            </div>
            <Button size="lg" className="bg-[#0a192f] hover:bg-[#020c1b] w-full md:w-auto text-white" onClick={() => { setActiveExerciseId(activeEx.id); setView('learn'); }}>
              Resume <ArrowRight className="w-4 h-4 ml-2 text-white" />
            </Button>
          </div>
        )}

        {/* Upgrade Banner (if course tier, show a different message) */}
        {user.tier === 'course' ? (
          <div className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col md:flex-row items-center gap-4 mb-10">
            <GraduationCap className="w-6 h-6 text-purple-500 shrink-0" />
            <div className="flex-1">
              <div className="font-bold text-black">Enrolled in {user.courseLevel} Course</div>
              <div className="text-sm text-slate-500">You have full access to all materials for your level.</div>
            </div>
          </div>
        ) : user.tier !== 'admin' && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col md:flex-row items-center gap-4 mb-10">
            <Star className="w-6 h-6 text-amber-500 shrink-0" />
            <div className="flex-1">
              <div className="font-bold text-black">Unlock Premium Quizzes</div>
              <div className="text-sm text-slate-500">Access 200+ quizzes from A1 to C2 — lifetime access.</div>
            </div>
            <Button className="bg-[#0a192f] text-white hover:bg-[#020c1b] border-none w-full md:w-auto" onClick={() => setView('pricing')}>
              Upgrade Now
            </Button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Recommended for You */}
            <h3 className="text-2xl font-bold text-black mb-4 font-serif">Recommended for You</h3>
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {recommended.map(ex => (
                <div key={ex.id} onClick={() => { setActiveExerciseId(ex.id); setView('learn'); }} className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all group">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase">{ex.level}</span>
                    <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded uppercase">{ex.category}</span>
                  </div>
                  <div className="font-bold text-black mb-1 group-hover:text-blue-600 transition-colors">{ex.title}</div>
                  <div className="text-xs text-slate-500">{ex.type === 'Interactive' ? `${ex.questions?.length || 0} questions` : 'Passive Practice'}</div>
                </div>
              ))}
              {recommended.length === 0 && <div className="col-span-2 text-slate-500">No new recommendations available. Great job!</div>}
            </div>
          </div>

          <div>
            {/* Recent Activity */}
            <h3 className="text-xl font-bold text-black mb-4 font-serif">Recent Activity</h3>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {recentAttempts.length === 0 ? (
                <div className="p-6 text-center text-slate-400 italic text-sm">No activity recorded yet.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentAttempts.map((a, i) => {
                    const ex = exercises.find(e => e.id === a.exerciseId);
                    if (!ex) return null;
                    const pct = Math.round((a.score / a.total) * 100);
                    return (
                      <div key={i} className="p-4 flex flex-col gap-2 hover:bg-slate-50">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-black line-clamp-1">{ex.title}</div>
                          <div className={`text-sm font-bold ${pct >= 70 ? 'text-green-600' : 'text-orange-600'}`}>{pct}%</div>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center justify-between">
                          <span>{ex.category}</span>
                          <span>{new Date(a.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
