import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { LEVELS, CATEGORIES, Level, Category, AccessFlag, ExerciseType, Exercise } from '@/lib/langrushi-data';
import { toast } from '@/components/ui/use-toast';
import { Plus, Trash2, Edit2, X, Save, Search, Clock } from 'lucide-react';
import CollapsibleCard from './CollapsibleCard';

/* ── Form primitives ─────────────────────────── */
const Label: React.FC<{ children: React.ReactNode; optional?: boolean }> = ({ children, optional }) => (
  <label style={{ display: 'block', fontFamily: 'Figtree, sans-serif', fontWeight: 600, fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px', letterSpacing: '0.01em' }}>
    {children}
    {optional && <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: '4px' }}>(optional)</span>}
  </label>
);

const Inp = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`input ${props.className ?? ''}`} />
);

const Sel = ({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...props} className="select">{children}</select>
);

const Txt = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...props} className="textarea" />
);

/* ── Access & level badges ───────────────────── */
const AccessBadge: React.FC<{ access: string }> = ({ access }) => {
  const map: Record<string, [string, string]> = {
    FREE_ALL:        ['Free for All',  'badge badge-green'],
    FREE_REGISTERED: ['Registered',    'badge badge-blue'],
    PAID:            ['Paid Only',     'badge badge-purple'],
  };
  const [label, cls] = map[access] ?? [access, 'badge badge-slate'];
  return <span className={cls}>{label}</span>;
};

const LevelBadge: React.FC<{ level: string }> = ({ level }) => {
  const map: Record<string, string> = { A1: 'badge badge-green', A2: 'badge badge-blue', B1: 'badge badge-purple', B2: 'badge badge-amber' };
  return <span className={map[level] ?? 'badge badge-slate'}>{level}</span>;
};

/* ── Empty form ──────────────────────────────── */
interface FormState {
  title: string; level: Level; category: Category; subPart: string;
  type: ExerciseType; access: AccessFlag; mediaUrl: string; transcript: string;
  prompt: string; modelAnswer: string; questions: any[]; guidance: string[];
  answerDisplayMode: 'instant' | 'end' | 'none' | ''; allowSkip: boolean;
}

const emptyForm = (): FormState => ({
  title: '', level: 'A1', category: 'Listening', subPart: 'Teil 1',
  type: 'Interactive', access: 'FREE_ALL', mediaUrl: '', transcript: '',
  prompt: '', modelAnswer: '', questions: [], guidance: [],
  answerDisplayMode: '', allowSkip: true,
});

/* ── Skeleton row ────────────────────────────── */
const SkeletonRow = () => (
  <tr>
    {[280, 50, 90, 70, 50, 90, 80].map((w, i) => (
      <td key={i} style={{ padding: '13px 14px', borderBottom: '1px solid var(--border)' }}>
        <div className="skeleton" style={{ height: '14px', width: `${w}px`, maxWidth: '100%' }} />
      </td>
    ))}
  </tr>
);

/* ────────────────────────────────────────────── */
const ExercisesAdmin: React.FC = () => {
  const { exercises, addExercise, updateExercise, removeExercise } = useAppContext();
  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editId, setEditId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [filter, setFilter] = useState({ level: '', category: '', search: '' });
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<string>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter.level, filter.category, filter.search, pageSize]);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder(key === 'updatedAt' ? 'desc' : 'asc');
    }
  };

  const startAdd = () => { setForm(emptyForm()); setEditId(null); setMode('add'); };
  const startEdit = (ex: Exercise) => {
    setForm({
      title: ex.title, level: ex.level, category: ex.category, subPart: ex.subPart,
      type: ex.type, access: ex.access, mediaUrl: ex.mediaUrl || '',
      transcript: ex.transcript || '', prompt: ex.prompt || '',
      modelAnswer: ex.modelAnswer || '', questions: ex.questions || [],
      guidance: ex.guidance || [], answerDisplayMode: ex.answerDisplayMode || '',
      allowSkip: ex.allowSkip !== false,
    });
    setEditId(ex.id); setMode('edit');
  };
  const cancel = () => { setMode('list'); setEditId(null); setForm(emptyForm()); setActiveQuestionId(null); };

  const handleSave = async () => {
    if (!form.title) { toast({ title: 'Title is required' }); return; }
    setBusy(true);
    try {
      if (mode === 'add') {
        await addExercise({ id: 'e' + Date.now(), ...form,
          questions: form.type === 'Interactive' ? form.questions : undefined,
          guidance: form.type === 'Passive' ? form.guidance : undefined });
        toast({ title: 'Exercise created' });
      } else if (mode === 'edit' && editId) {
        await updateExercise(editId, { ...form,
          questions: form.type === 'Interactive' ? form.questions : undefined,
          guidance: form.type === 'Passive' ? form.guidance : undefined });
        toast({ title: 'Exercise updated' });
      }
      cancel();
    } catch (e: any) { toast({ title: 'Failed to save', description: e?.message }); }
    setBusy(false);
  };

  const deleteEx = async (id: string) => {
    if (!confirm('Delete this exercise?')) return;
    await removeExercise(id);
    toast({ title: 'Deleted' });
  };

  const addQ = () => setForm({ ...form, questions: [...form.questions, { id: 'q' + Date.now(), text: '', type: 'MCQ', options: ['', '', '', ''], correctAnswer: '', hint: '', explanation: '' }] });
  const updQ = (i: number, p: any) => { const qs = [...form.questions]; qs[i] = { ...qs[i], ...p }; setForm({ ...form, questions: qs }); };
  const delQ = (i: number) => setForm({ ...form, questions: form.questions.filter((_, j) => j !== i) });

  const filtered = exercises.filter(e => {
    if (filter.level && e.level !== filter.level) return false;
    if (filter.category && e.category !== filter.category) return false;
    if (filter.search && !e.title.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  const sortedExercises = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      let aVal: any = (a as any)[sortKey];
      let bVal: any = (b as any)[sortKey];

      if (sortKey === 'updatedAt') {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      } else if (sortKey === 'questions') {
        aVal = a.type === 'Interactive' ? (a.questions?.length || 0) : 0;
        bVal = b.type === 'Interactive' ? (b.questions?.length || 0) : 0;
      }

      if (typeof aVal === 'string') {
        const comp = aVal.localeCompare(bVal || '');
        return sortOrder === 'asc' ? comp : -comp;
      }

      const comp = (aVal || 0) - (bVal || 0);
      return sortOrder === 'asc' ? comp : -comp;
    });
    return list;
  }, [filtered, sortKey, sortOrder]);

  const paginatedExercises = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedExercises.slice(start, start + pageSize);
  }, [sortedExercises, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedExercises.length / pageSize) || 1;

  /* ── Form view ─────────────────────────────── */


  if (mode !== 'list') {
    return (
      <div>
        {/* Form header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div className="section-label">{mode === 'add' ? 'New Exercise' : 'Edit Exercise'}</div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {mode === 'add' ? 'Create Exercise' : (form.title || 'Untitled')}
            </h2>
          </div>
          <button className="btn-ghost" onClick={cancel} style={{ gap: '6px' }}>
            <X className="w-4 h-4" /> Cancel
          </button>
        </div>

        {/* Card 1: Exercise Details */}
        <CollapsibleCard cardKey="details" label="Exercise Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>Title</Label><Inp value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Am Bahnhof" /></div>
            <div><Label>Sub-part</Label><Inp value={form.subPart} onChange={e => setForm({ ...form, subPart: e.target.value })} placeholder="e.g. Teil 1" /></div>
            <div><Label>Level</Label><Sel value={form.level} onChange={e => setForm({ ...form, level: e.target.value as Level })}>{LEVELS.map(l => <option key={l}>{l}</option>)}</Sel></div>
            <div><Label>Category</Label><Sel value={form.category} onChange={e => setForm({ ...form, category: e.target.value as Category })}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</Sel></div>
            <div><Label>Type</Label><Sel value={form.type} onChange={e => setForm({ ...form, type: e.target.value as ExerciseType })}><option>Interactive</option><option>Passive</option></Sel></div>
            <div><Label>Access</Label>
              <Sel value={form.access} onChange={e => setForm({ ...form, access: e.target.value as AccessFlag })}>
                <option value="FREE_ALL">Free for all</option>
                <option value="FREE_REGISTERED">Free for registered</option>
                <option value="PAID">Paid only</option>
              </Sel>
            </div>
          </div>
        </CollapsibleCard>

        {form.type === 'Interactive' ? (
          <>
            {/* Card 2: Media & Settings */}
            <CollapsibleCard cardKey="media" label="Media & Settings">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label optional>Media URL</Label>
                  <Inp value={form.mediaUrl} onChange={e => setForm({ ...form, mediaUrl: e.target.value })} placeholder="https://..." />
                </div>
                <div>
                  <Label>Answer Display</Label>
                  <Sel value={form.answerDisplayMode} onChange={e => setForm({ ...form, answerDisplayMode: e.target.value as 'instant' | 'end' | 'none' | '' })}>
                    <option value="">Default (Use global setting)</option>
                    <option value="instant">Show instantly</option>
                    <option value="end">Show at end</option>
                    <option value="none">Don't show</option>
                  </Sel>
                </div>
                <div className="md:col-span-2">
                  <Label optional>{form.category === 'Reading' ? 'Reading Passage' : 'Transcript (shown as sidebar during exercise)'}</Label>
                  <Txt rows={4} value={form.transcript} onChange={e => setForm({ ...form, transcript: e.target.value })} placeholder={form.category === 'Reading' ? 'Enter the reading passage paragraph...' : 'Paste the audio transcript here...'} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" id="allowSkip" checked={form.allowSkip} onChange={e => setForm({ ...form, allowSkip: e.target.checked })}
                    style={{ width: '15px', height: '15px', accentColor: 'var(--accent)', cursor: 'pointer' }} />
                  <label htmlFor="allowSkip" style={{ fontFamily: 'Figtree, sans-serif', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>Allow Skip</label>
                </div>
              </div>
            </CollapsibleCard>

            {/* Card 3: Questions */}
            <CollapsibleCard
              cardKey="questions"
              label="Questions"
              badge={
                <span style={{
                  background: 'var(--accent)', color: '#fff', borderRadius: '999px',
                  fontSize: '10px', fontWeight: 700, padding: '1px 8px', lineHeight: '18px',
                }}>{form.questions.length}</span>
              }
            >
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                <button className="btn-ghost" onClick={addQ} style={{ fontSize: '12px', padding: '7px 14px', gap: '5px' }}>
                  <Plus className="w-3.5 h-3.5" /> Add Question
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {form.questions.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '28px', background: 'var(--bg-elevated)', borderRadius: '10px', color: 'var(--text-muted)', fontSize: '13px', border: '1px dashed var(--border-strong)' }}>
                    No questions yet — click "Add Question" to start.
                  </div>
                )}
                {form.questions.map((q, i) => {
                  const isActive = q.id === activeQuestionId;
                  return (
                    <div
                      key={q.id}
                      onClick={() => setActiveQuestionId(q.id)}
                      onFocusCapture={() => setActiveQuestionId(q.id)}
                      style={{
                        background: isActive ? 'rgba(53, 99, 233, 0.02)' : 'var(--bg-elevated)',
                        borderRadius: '10px',
                        padding: '16px',
                        border: isActive ? '2px solid #3563E9' : '1px solid var(--border)',
                        position: 'relative',
                        transition: 'all 200ms ease',
                        boxShadow: isActive ? '0 4px 12px rgba(53, 99, 233, 0.08)' : 'none',
                      }}
                    >
                      <button onClick={(e) => { e.stopPropagation(); delQ(i); }} style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--danger-bg)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '6px', padding: '4px 6px', cursor: 'pointer', color: 'var(--danger)' }} title="Remove question">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="grid gap-3">
                        <div><Label>Question {i + 1}</Label><Inp value={q.text} onChange={e => updQ(i, { text: e.target.value })} placeholder="Enter question text..." /></div>
                        <div className="grid grid-cols-2 gap-3">
                          <div><Label>Type</Label>
                            <Sel value={q.type} onChange={e => updQ(i, { type: e.target.value })}>
                              <option value="MCQ">Multiple Choice</option>
                              <option value="FILL_BLANK">Fill in Blank</option>
                              <option value="TRUE_FALSE">True/False</option>
                            </Sel>
                          </div>
                          <div>
                            <Label>Correct Answer</Label>
                            <Inp value={q.correctAnswer} onChange={e => updQ(i, { correctAnswer: e.target.value })} />
                            {q.type === 'FILL_BLANK' && (
                              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                                For multiple blanks, separate answers with a pipe (e.g. <code>habe|bin</code>).
                              </span>
                            )}
                          </div>
                        </div>
                        {q.type === 'MCQ' && (
                          <div className="grid grid-cols-2 gap-2">
                            {(q.options || ['', '', '', '']).map((opt: string, oi: number) => (
                              <div key={oi}>
                                <Label>Option {oi + 1}</Label>
                                <Inp value={opt} style={{ height: '36px', fontSize: '13px' }} onChange={e => {
                                  const o = [...(q.options || ['', '', '', ''])]; o[oi] = e.target.value; updQ(i, { options: o });
                                }} />
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                          <div><Label optional>Hint</Label><Inp value={q.hint || ''} onChange={e => updQ(i, { hint: e.target.value })} placeholder="A helpful hint..." /></div>
                          <div><Label optional>Explanation</Label><Inp value={q.explanation || ''} onChange={e => updQ(i, { explanation: e.target.value })} placeholder="Why this is correct..." /></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Add Question Button */}
              {form.questions.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button className="btn-ghost" onClick={addQ} style={{ fontSize: '12px', padding: '7px 14px', gap: '5px' }}>
                    <Plus className="w-3.5 h-3.5" /> Add Question
                  </button>
                </div>
              )}
            </CollapsibleCard>
          </>
        ) : (
          /* Card 4: Writing Prompt */
          <CollapsibleCard cardKey="writing" label="Writing Prompt">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><Label>Prompt</Label><Inp value={form.prompt} onChange={e => setForm({ ...form, prompt: e.target.value })} placeholder="Write a short email about..." /></div>
              <div><Label>Model Answer</Label><Txt rows={6} value={form.modelAnswer} onChange={e => setForm({ ...form, modelAnswer: e.target.value })} /></div>
              <div><Label optional>Guidance Points (one per line)</Label><Txt rows={3} value={form.guidance.join('\n')} onChange={e => setForm({ ...form, guidance: e.target.value.split('\n').filter(l => l.trim()) })} placeholder={"Point 1\nPoint 2..."} /></div>
            </div>
          </CollapsibleCard>
        )}

        {/* Global Save / Cancel Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button className="btn-ghost" onClick={cancel}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={busy} style={{ minWidth: '150px', opacity: busy ? 0.6 : 1 }}>
            <Save className="w-4 h-4" />
            {busy ? 'Saving...' : mode === 'add' ? 'Publish Exercise' : 'Save Changes'}
          </button>
        </div>
      </div>
    );
  }

  /* ── List view ─────────────────────────────── */
  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="section-label">Content Management</div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Exercises
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '13px', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '8px' }}>
              ({filtered.length} / {exercises.length})
            </span>
          </h2>
        </div>
        <button className="btn-primary" onClick={startAdd}>
          <Plus className="w-4 h-4" /> New Exercise
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-5" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
        <div style={{ flex: '1 1 180px', position: 'relative' }}>
          <Search className="w-4 h-4" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <Inp value={filter.search} onChange={e => setFilter({ ...filter, search: e.target.value })} placeholder="Search by title..." style={{ paddingLeft: '34px' }} />
        </div>
        <div style={{ minWidth: '120px' }}>
          <Sel value={filter.level} onChange={e => setFilter({ ...filter, level: e.target.value })}>
            <option value="">All Levels</option>
            {LEVELS.map(l => <option key={l}>{l}</option>)}
          </Sel>
        </div>
        <div style={{ minWidth: '150px' }}>
          <Sel value={filter.category} onChange={e => setFilter({ ...filter, category: e.target.value })}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </Sel>
        </div>
        {(filter.search || filter.level || filter.category) && (
          <button onClick={() => setFilter({ level: '', category: '', search: '' })} className="btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }}>
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '32%', cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort('title')}>Title {sortKey === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
              <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort('level')}>Level {sortKey === 'level' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
              <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort('category')}>Category {sortKey === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
              <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort('type')}>Type {sortKey === 'type' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
              <th style={{ textAlign: 'center', cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort('questions')}>Questions {sortKey === 'questions' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
              <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort('access')}>Access {sortKey === 'access' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
              <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort('updatedAt')}>Last Updated {sortKey === 'updatedAt' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && filtered === exercises ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="empty-state">
                    <div className="empty-state-icon"><Search className="w-5 h-5" style={{ color: 'var(--text-muted)' }} /></div>
                    <p style={{ fontFamily: 'Figtree, sans-serif', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 4px' }}>No exercises found</p>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Try adjusting your search or filters.</p>
                  </div>
                </td>
              </tr>
            ) : paginatedExercises.map(e => (
              <tr key={e.id}>
                <td style={{ color: 'var(--text-primary)', fontWeight: 600, maxWidth: '280px' }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
                </td>
                <td><LevelBadge level={e.level} /></td>
                <td>{e.category}</td>
                <td>
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }}>{e.type}</span>
                </td>
                <td style={{ textAlign: 'center', fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {e.type === 'Interactive' ? (e.questions?.length || 0) : '—'}
                </td>
                <td><AccessBadge access={e.access} /></td>
                <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {e.updatedAt ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock className="w-3 h-3" style={{ flexShrink: 0 }} />
                      {new Date(e.updatedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}
                    </span>
                  ) : '—'}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => startEdit(e)}
                      title="Edit"
                      aria-label="Edit exercise"
                      style={{ padding: '6px 8px', background: 'var(--accent-light)', border: '1px solid rgba(37,99,235,0.15)', borderRadius: '6px', color: 'var(--accent)', cursor: 'pointer', transition: 'background 180ms ease' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-mid)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent-light)')}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteEx(e.id)}
                      title="Delete"
                      aria-label="Delete exercise"
                      style={{ padding: '6px 8px', background: 'var(--danger-bg)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '6px', color: 'var(--danger)', cursor: 'pointer', transition: 'background 180ms ease' }}
                      onMouseEnter={ev => (ev.currentTarget.style.background = 'rgba(220,38,38,0.14)')}
                      onMouseLeave={ev => (ev.currentTarget.style.background = 'var(--danger-bg)')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-card)',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <span>Show</span>
            <select
              value={pageSize}
              onChange={e => setPageSize(Number(e.target.value))}
              className="select"
              style={{ width: '75px', padding: '4px 6px', height: 'auto', fontSize: '13px' }}
            >
              {[10, 25, 50, 100].map(sz => (
                <option key={sz} value={sz}>{sz}</option>
              ))}
            </select>
            <span>entries</span>
          </div>

          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Showing {sortedExercises.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, sortedExercises.length)} of {sortedExercises.length} entries
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn-ghost"
              style={{ padding: '6px 12px', fontSize: '12px', opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              if (totalPages > 5 && Math.abs(currentPage - pageNum) > 1 && pageNum !== 1 && pageNum !== totalPages) {
                if (pageNum === 2 || pageNum === totalPages - 1) {
                  return <span key={pageNum} style={{ padding: '0 4px', color: 'var(--text-muted)' }}>...</span>;
                }
                return null;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={currentPage === pageNum ? "btn-primary" : "btn-ghost"}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    minWidth: '32px',
                    height: '32px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '6px',
                    fontWeight: currentPage === pageNum ? 700 : 400
                  }}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="btn-ghost"
              style={{ padding: '6px 12px', fontSize: '12px', opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExercisesAdmin;
