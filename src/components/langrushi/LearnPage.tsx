import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { LEVELS, CATEGORIES, Level, Category, Exercise } from '@/lib/langrushi-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Lock, Headphones, PenTool, BookOpen, Gamepad2, Bell, CheckCircle2, Play, Book } from 'lucide-react';
import QuizPlayer from './QuizPlayer';

const categoryIcons: Record<Category, any> = {
  Listening: Headphones, Writing: PenTool, Reading: Book, Grammar: BookOpen, Games: Gamepad2,
};

const LearnPage: React.FC = () => {
  const { exercises, user, loading, canAccessExercise, setForcedModal, setAuthModal, activeExerciseId, setActiveExerciseId } = useAppContext();
  const [selectedLevel, setSelectedLevel] = useState<Level | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return exercises.filter(e => {
      if (selectedLevel !== 'all' && e.level !== selectedLevel) return false;
      if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
      if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [exercises, selectedLevel, selectedCategory, search]);

  const activeExercise = exercises.find(e => e.id === activeExerciseId);

  const handleStart = (ex: Exercise) => {
    const access = canAccessExercise(ex);
    if (!access.allowed) {
      if (access.reason === 'login_required') { setAuthModal('register'); return; }
      if (access.reason === 'paid_required' || access.reason === 'registered_quota') { setForcedModal(true); return; }
      if (access.reason === 'guest_quota') { setForcedModal(true); return; }
    }
    setActiveExerciseId(ex.id);
  };

  if (activeExercise) {
    return <QuizPlayer exercise={activeExercise} onClose={() => setActiveExerciseId(null)} />;
  }

  const completedIds = new Set(user?.attempts.map(a => a.exerciseId) || []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="relative rounded-3xl overflow-hidden mb-10 bg-gradient-to-r from-[#0f172a] to-[#1e293b] text-white p-8 md:p-12 shadow-xl border border-slate-800">
        {/* Subtle background abstract shapes/glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-red-600/5 rounded-full blur-[60px] pointer-events-none" />
        
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20 uppercase tracking-wider mb-4">
            🇩🇪 Willkommen bei Langrushi
          </span>
          <h1 className="text-4xl md:text-5xl font-black font-serif tracking-tight leading-tight mb-4 text-white">
            Master German through <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">interactive practice</span>.
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-xl">
            Practice native-quality exercises from A1 to B2. Improve your grammar, writing, listening, and reading skills with instant feedback.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 space-y-6 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
          <Input className="pl-11 h-11 bg-slate-50 border-slate-200 rounded-xl" placeholder="Search by title..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Filter by Level</div>
            <div className="flex flex-wrap gap-2">
              <FilterChip active={selectedLevel === 'all'} onClick={() => setSelectedLevel('all')}>All</FilterChip>
              {LEVELS.map(l => (
                <FilterChip key={l} active={selectedLevel === l} onClick={() => setSelectedLevel(l)}>{l}</FilterChip>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Filter by Category</div>
            <div className="flex flex-wrap gap-2">
              <FilterChip active={selectedCategory === 'all'} onClick={() => setSelectedCategory('all')}>All</FilterChip>
              {CATEGORIES.map(c => {
                const Icon = categoryIcons[c];
                return (
                  <FilterChip key={c} active={selectedCategory === c} onClick={() => setSelectedCategory(c)}>
                    <Icon className="w-3.5 h-3.5 mr-1 inline" />{c}
                  </FilterChip>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          <div className="text-sm font-medium text-black mb-6 flex justify-between items-center px-1">
            <span>Showing {filtered.length} matching exercises</span>
            {filtered.length < exercises.length && <button onClick={() => { setSelectedLevel('all'); setSelectedCategory('all'); setSearch(''); }} className="text-red-600 hover:underline text-xs">Clear all</button>}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(ex => {
              const access = canAccessExercise(ex);
              const locked = !access.allowed;
              const completed = completedIds.has(ex.id);
              const Icon = categoryIcons[ex.category];
              const courseMatch = user?.tier === 'course' && user.courseLevel === ex.level;
              const isFree = ex.category === 'Grammar' || ex.category === 'Games' || ex.access === 'FREE_ALL';

              return (
                <div key={ex.id} className={`relative bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col ${locked ? '' : 'cursor-pointer hover:-translate-y-1'}`} onClick={() => handleStart(ex)}>
                  {locked && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-10 flex items-center justify-center p-6">
                      <div className="text-center bg-white p-6 rounded-2xl border border-slate-100 shadow-xl scale-95 animate-in fade-in zoom-in duration-300">
                        <div className="w-12 h-12 mx-auto rounded-xl bg-slate-900 flex items-center justify-center mb-3">
                          <Lock className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-sm font-bold text-black mb-1">
                          {access.reason === 'login_required' ? 'Registration Required' :
                           access.reason === 'paid_required' ? 'Premium Content' :
                           'Daily Limit Reached'}
                        </div>
                        <p className="text-[11px] text-black mb-4 px-2">Unlock this exercise and track your progress.</p>
                        <Button size="sm" className="w-full bg-[#0a192f] hover:bg-[#020c1b]" onClick={e => { e.stopPropagation(); handleStart(ex); }}>Unlock Now</Button>
                      </div>
                    </div>
                  )}
                  <div className={`h-24 relative overflow-hidden transition-all group-hover:h-28 ${
                    ex.level === 'A1' ? 'bg-gradient-to-br from-[#10B981] to-[#059669]' :
                    ex.level === 'A2' ? 'bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8]' :
                    ex.level === 'B1' ? 'bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9]' :
                    'bg-gradient-to-br from-[#F59E0B] to-[#D97706]'
                  }`}>
                    <div className="absolute inset-0 flex items-center justify-between px-6 opacity-40 mix-blend-overlay">
                      <Icon className="w-24 h-24 -ml-4" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-between px-6">
                      <Icon className="w-10 h-10 text-white/90" />
                      <span className="text-4xl font-black text-white/90 italic tracking-tighter">{ex.level}</span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span className="text-[10px] font-bold bg-slate-100 text-black px-2 py-0.5 rounded uppercase tracking-wider">{ex.category}</span>
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{ex.subPart}</span>
                      {isFree && <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded uppercase">FREE</span>}
                      {completed && <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto" />}
                    </div>
                    <h3 className="font-bold text-lg text-black group-hover:text-red-600 transition-colors">{ex.title}</h3>
                    
                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="text-xs font-medium text-black">
                        {ex.type === 'Interactive' ? `${ex.questions?.length || 0} Questions` : 'Model Answer Included'}
                      </div>
                      <div className="text-red-600 font-bold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Practice <Play className="w-3 h-3 fill-current" />
                      </div>
                    </div>

                    {courseMatch && (
                      <div className="mt-4 p-2 bg-purple-50 text-purple-700 rounded-lg flex items-center gap-2 text-[11px] font-bold animate-pulse">
                        <Bell className="w-3.5 h-3.5" /> Course Match
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-black">Keine Übung gefunden</h3>
          <p className="text-black mt-1">Try adjusting your filters or search term.</p>
          <Button variant="outline" className="mt-6" onClick={() => { setSelectedLevel('all'); setSelectedCategory('all'); setSearch(''); }}>Clear all filters</Button>
        </div>
      )}
    </div>
  );
};

const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
    <div className="h-24 bg-slate-200"></div>
    <div className="p-6 space-y-4">
      <div className="flex gap-2">
        <div className="h-4 w-12 bg-slate-100 rounded"></div>
        <div className="h-4 w-20 bg-slate-100 rounded"></div>
      </div>
      <div className="h-6 w-3/4 bg-slate-100 rounded"></div>
      <div className="h-10 w-full bg-slate-100 rounded"></div>
    </div>
  </div>
);

const FilterChip: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
      active ? 'bg-[#0a192f] text-white' : 'bg-slate-100 text-black hover:bg-slate-200'
    }`}
  >{children}</button>
);

export default LearnPage;
