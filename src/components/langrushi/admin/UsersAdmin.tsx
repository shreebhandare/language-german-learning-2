import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Download, Trophy, TrendingDown, Users, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';

interface UserPerf {
  id: string;
  name: string;
  email: string;
  tier: string;
  registeredAt: string;
  totalAttempts: number;
  totalScore: number;
  totalQuestions: number;
  avgPct: number;
  quizzesDone: number;
}

const UsersAdmin: React.FC = () => {
  const { users, refreshUsers, changeUserTier, exercises, fetchAllAttempts } = useAppContext();
  const [allAttempts, setAllAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await refreshUsers();
    const attempts = await fetchAllAttempts();
    setAllAttempts(attempts);
    setLoading(false);
  };

  // Build per-user performance
  const userPerf: UserPerf[] = users.map(u => {
    const ua = allAttempts.filter(a => a.userId === u.id);
    const totalScore = ua.reduce((s, a) => s + a.score, 0);
    const totalQuestions = ua.reduce((s, a) => s + a.total, 0);
    const avgPct = totalQuestions ? Math.round((totalScore / totalQuestions) * 100) : 0;
    const quizzesDone = new Set(ua.map(a => a.exerciseId)).size;
    return {
      id: u.id, name: u.name, email: u.email, tier: u.tier,
      registeredAt: u.registeredAt,
      totalAttempts: ua.length, totalScore, totalQuestions, avgPct, quizzesDone,
    };
  });

  // Only rank users who have at least 1 attempt
  const ranked = userPerf.filter(u => u.totalAttempts > 0).sort((a, b) => b.avgPct - a.avgPct);
  const top3 = ranked.slice(0, 3);
  const bottom3 = ranked.length > 3 ? ranked.slice(-3).reverse() : [];

  const exportEmails = () => {
    const csv = 'email,name,tier,quizzes_done,avg_score,total_attempts,registeredAt\n' +
      userPerf.map(u => `${u.email},${u.name},${u.tier},${u.quizzesDone},${u.avgPct}%,${u.totalAttempts},${u.registeredAt}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'users_performance.csv'; a.click();
    toast({ title: 'CSV exported with performance data' });
  };

  const getUserAttempts = (userId: string) => {
    return allAttempts.filter(a => a.userId === userId).map(a => {
      const ex = exercises.find(e => e.id === a.exerciseId);
      return { ...a, exerciseTitle: ex?.title || a.exerciseId, level: ex?.level, category: ex?.category };
    });
  };

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-xl text-black flex items-center gap-2">
          <Users className="w-5 h-5" /> Users & Performance ({users.length})
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button variant="outline" onClick={exportEmails}>
            <Download className="w-4 h-4 mr-1" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Leaderboard: Top 3 & Bottom 3 */}
      {ranked.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Top 3 Winners */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
            <h3 className="font-bold text-lg text-green-800 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" /> Top 3 Performers
            </h3>
            <div className="space-y-3">
              {top3.map((u, i) => (
                <div key={u.id} className="bg-white rounded-xl p-4 border border-green-100 flex items-center gap-4 shadow-sm">
                  <span className="text-2xl">{medals[i]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-black truncate">{u.name}</div>
                    <div className="text-xs text-slate-500 truncate">{u.email}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-bold text-green-600">{u.avgPct}%</div>
                    <div className="text-xs text-slate-500">{u.quizzesDone} quizzes</div>
                  </div>
                </div>
              ))}
              {top3.length === 0 && <p className="text-sm text-slate-500 italic">No quiz attempts yet.</p>}
            </div>
          </div>

          {/* Bottom 3 Losers */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6">
            <h3 className="font-bold text-lg text-red-800 mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-500" /> Needs Improvement
            </h3>
            <div className="space-y-3">
              {bottom3.map((u, i) => (
                <div key={u.id} className="bg-white rounded-xl p-4 border border-red-100 flex items-center gap-4 shadow-sm">
                  <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-600 shrink-0">
                    {ranked.length - 2 + i}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-black truncate">{u.name}</div>
                    <div className="text-xs text-slate-500 truncate">{u.email}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-bold text-red-500">{u.avgPct}%</div>
                    <div className="text-xs text-slate-500">{u.quizzesDone} quizzes</div>
                  </div>
                </div>
              ))}
              {bottom3.length === 0 && <p className="text-sm text-slate-500 italic">Not enough data for bottom rankings.</p>}
            </div>
          </div>
        </div>
      )}

      {/* Full User Table with expandable performance */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-black flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" /> All Users Performance
          </h3>
        </div>
        {users.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No users yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {userPerf.map(u => {
              const isExpanded = expandedUser === u.id;
              const attempts = isExpanded ? getUserAttempts(u.id) : [];
              return (
                <div key={u.id}>
                  <button
                    onClick={() => setExpandedUser(isExpanded ? null : u.id)}
                    className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-black">{u.name}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </div>
                    <div className="hidden sm:block">
                      <select
                        value={u.tier}
                        onChange={e => { e.stopPropagation(); changeUserTier(u.id, e.target.value); }}
                        onClick={e => e.stopPropagation()}
                        className="border rounded p-1 text-xs bg-white"
                        disabled={u.tier === 'admin'}
                      >
                        <option value="registered">registered</option>
                        <option value="paid">paid</option>
                        <option value="course">course</option>
                        {u.tier === 'admin' && <option value="admin">admin</option>}
                      </select>
                    </div>
                    <div className="text-center shrink-0 w-16">
                      <div className="text-sm font-bold text-black">{u.quizzesDone}</div>
                      <div className="text-[10px] text-slate-400">quizzes</div>
                    </div>
                    <div className="text-center shrink-0 w-16">
                      <div className={`text-sm font-bold ${u.avgPct >= 70 ? 'text-green-600' : u.avgPct >= 40 ? 'text-orange-500' : 'text-red-500'}`}>
                        {u.totalAttempts > 0 ? `${u.avgPct}%` : '—'}
                      </div>
                      <div className="text-[10px] text-slate-400">avg</div>
                    </div>
                    <div className="text-center shrink-0 w-16">
                      <div className="text-sm font-bold text-black">{u.totalAttempts}</div>
                      <div className="text-[10px] text-slate-400">attempts</div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                  </button>

                  {/* Expanded: individual attempt history */}
                  {isExpanded && (
                    <div className="bg-slate-50 px-4 pb-4">
                      {attempts.length === 0 ? (
                        <p className="text-sm text-slate-400 py-4 text-center italic">No quiz attempts recorded.</p>
                      ) : (
                        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                          <table className="w-full text-xs">
                            <thead className="bg-slate-100 text-left">
                              <tr>
                                <th className="p-2.5 font-semibold">Exercise</th>
                                <th className="p-2.5 font-semibold">Level</th>
                                <th className="p-2.5 font-semibold">Category</th>
                                <th className="p-2.5 font-semibold text-center">Score</th>
                                <th className="p-2.5 font-semibold text-center">%</th>
                                <th className="p-2.5 font-semibold">Date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {attempts.slice(0, 20).map((a, i) => {
                                const pct = a.total > 0 ? Math.round((a.score / a.total) * 100) : 0;
                                return (
                                  <tr key={i} className="hover:bg-slate-50">
                                    <td className="p-2.5 font-medium">{a.exerciseTitle}</td>
                                    <td className="p-2.5"><span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold">{a.level || '—'}</span></td>
                                    <td className="p-2.5 text-slate-600">{a.category || '—'}</td>
                                    <td className="p-2.5 text-center font-bold">{a.score}/{a.total}</td>
                                    <td className="p-2.5 text-center">
                                      <span className={`font-bold ${pct >= 70 ? 'text-green-600' : pct >= 40 ? 'text-orange-500' : 'text-red-500'}`}>{pct}%</span>
                                    </td>
                                    <td className="p-2.5 text-slate-500">{new Date(a.date).toLocaleDateString()}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                          {attempts.length > 20 && <div className="p-2 text-center text-xs text-slate-400">Showing 20 of {attempts.length} attempts</div>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersAdmin;
