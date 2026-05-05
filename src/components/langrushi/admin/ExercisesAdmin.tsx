import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { LEVELS, CATEGORIES, Level, Category, AccessFlag, ExerciseType, Exercise } from '@/lib/langrushi-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Plus, Trash2, Edit2, X, Save } from 'lucide-react';

const emptyForm = (): FormState => ({
  title: '', level: 'A1' as Level, category: 'Listening' as Category, subPart: 'Teil 1',
  type: 'Interactive' as ExerciseType, access: 'FREE_ALL' as AccessFlag,
  mediaUrl: '', prompt: '', modelAnswer: '', questions: [], guidance: [],
  answerDisplayMode: 'instant', allowSkip: true,
});

interface FormState {
  title: string; level: Level; category: Category; subPart: string;
  type: ExerciseType; access: AccessFlag; mediaUrl: string;
  prompt: string; modelAnswer: string; questions: any[]; guidance: string[];
  answerDisplayMode: string; allowSkip: boolean;
}

const ExercisesAdmin: React.FC = () => {
  const { exercises, addExercise, updateExercise, removeExercise } = useAppContext();
  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editId, setEditId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [filter, setFilter] = useState({ level: '', category: '', search: '' });

  const startAdd = () => { setForm(emptyForm()); setEditId(null); setMode('add'); };
  const startEdit = (ex: Exercise) => {
    setForm({
      title: ex.title, level: ex.level, category: ex.category, subPart: ex.subPart,
      type: ex.type, access: ex.access, mediaUrl: ex.mediaUrl || '',
      prompt: ex.prompt || '', modelAnswer: ex.modelAnswer || '',
      questions: ex.questions || [], guidance: ex.guidance || [],
      answerDisplayMode: ex.answerDisplayMode || 'instant',
      allowSkip: ex.allowSkip !== false,
    });
    setEditId(ex.id);
    setMode('edit');
  };
  const cancelForm = () => { setMode('list'); setEditId(null); setForm(emptyForm()); };

  const handleSave = async () => {
    if (!form.title) { toast({ title: 'Title required' }); return; }
    setBusy(true);
    try {
      if (mode === 'add') {
        await addExercise({
          id: 'e' + Date.now(), ...form,
          questions: form.type === 'Interactive' ? form.questions : undefined,
          guidance: form.type === 'Passive' ? form.guidance : undefined,
        });
        toast({ title: 'Exercise created' });
      } else if (mode === 'edit' && editId) {
        await updateExercise(editId, {
          ...form,
          questions: form.type === 'Interactive' ? form.questions : undefined,
          guidance: form.type === 'Passive' ? form.guidance : undefined,
        });
        toast({ title: 'Exercise updated' });
      }
      cancelForm();
    } catch (e: any) {
      toast({ title: 'Failed to save', description: e?.message });
    }
    setBusy(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this exercise and all its questions?')) return;
    await removeExercise(id);
    toast({ title: 'Deleted' });
  };

  const addQuestion = () => {
    const newQ = { id: 'q' + Date.now(), text: '', type: 'MCQ', options: ['', '', '', ''], correctAnswer: '', hint: '', explanation: '' };
    setForm({ ...form, questions: [...form.questions, newQ] });
  };
  const updateQuestion = (index: number, patch: any) => {
    const qs = [...form.questions];
    qs[index] = { ...qs[index], ...patch };
    setForm({ ...form, questions: qs });
  };
  const removeQuestion = (index: number) => {
    setForm({ ...form, questions: form.questions.filter((_, i) => i !== index) });
  };

  // Filter exercises
  const filtered = exercises.filter(e => {
    if (filter.level && e.level !== filter.level) return false;
    if (filter.category && e.category !== filter.category) return false;
    if (filter.search && !e.title.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  if (mode !== 'list') {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-xl text-black">{mode === 'add' ? 'New Exercise' : `Edit: ${form.title || 'Untitled'}`}</h2>
          <Button variant="ghost" onClick={cancelForm}><X className="w-4 h-4 mr-1" /> Cancel</Button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4 text-red-600">Exercise Details</h3>
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Am Bahnhof" /></div>
            <div><Label>Sub-part</Label><Input value={form.subPart} onChange={e => setForm({ ...form, subPart: e.target.value })} placeholder="e.g. Teil 1" /></div>
            <div>
              <Label>Level</Label>
              <select className="w-full mt-1 border rounded-md p-2 text-sm" value={form.level} onChange={e => setForm({ ...form, level: e.target.value as Level })}>
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <Label>Category</Label>
              <select className="w-full mt-1 border rounded-md p-2 text-sm" value={form.category} onChange={e => setForm({ ...form, category: e.target.value as Category })}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label>Type</Label>
              <select className="w-full mt-1 border rounded-md p-2 text-sm" value={form.type} onChange={e => setForm({ ...form, type: e.target.value as ExerciseType })}>
                <option>Interactive</option><option>Passive</option>
              </select>
            </div>
            <div>
              <Label>Access</Label>
              <select className="w-full mt-1 border rounded-md p-2 text-sm" value={form.access} onChange={e => setForm({ ...form, access: e.target.value as AccessFlag })}>
                <option value="FREE_ALL">Free for all</option>
                <option value="FREE_REGISTERED">Free for registered</option>
                <option value="PAID">Paid only</option>
              </select>
            </div>
          </div>

          {form.type === 'Interactive' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <Label>Media URL (Audio/Video)</Label>
                  <Input value={form.mediaUrl} onChange={e => setForm({ ...form, mediaUrl: e.target.value })} placeholder="https://..." className="mt-1" />
                </div>
                <div className="bg-slate-50 p-4 rounded-lg grid grid-cols-2 gap-4">
                  <div>
                    <Label>Answer Display Mode</Label>
                    <select className="w-full mt-1 border rounded p-1.5 text-sm" value={form.answerDisplayMode} onChange={e => setForm({ ...form, answerDisplayMode: e.target.value })}>
                      <option value="instant">Show instantly</option>
                      <option value="end">Show at the end</option>
                      <option value="none">Don't show</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 mt-6">
                    <input type="checkbox" id="allowSkip" checked={form.allowSkip} onChange={e => setForm({ ...form, allowSkip: e.target.checked })} className="w-4 h-4 rounded" />
                    <Label htmlFor="allowSkip">Allow Skip</Label>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold">Questions ({form.questions.length})</h4>
                  <Button size="sm" variant="outline" onClick={addQuestion}><Plus className="w-4 h-4 mr-1" /> Add Question</Button>
                </div>

                <div className="space-y-4">
                  {form.questions.map((q, i) => (
                    <div key={q.id} className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm relative">
                      <Button size="sm" variant="ghost" className="absolute top-2 right-2 text-red-500" onClick={() => removeQuestion(i)}><Trash2 className="w-4 h-4" /></Button>
                      <div className="grid gap-3">
                        <div><Label>Question Text</Label><Input value={q.text} onChange={e => updateQuestion(i, { text: e.target.value })} /></div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Type</Label>
                            <select className="w-full mt-1 border rounded p-1.5 text-sm" value={q.type} onChange={e => updateQuestion(i, { type: e.target.value })}>
                              <option value="MCQ">Multiple Choice</option>
                              <option value="FILL_BLANK">Fill in Blank</option>
                              <option value="TRUE_FALSE">True/False</option>
                            </select>
                          </div>
                          <div><Label>Correct Answer</Label><Input value={q.correctAnswer} onChange={e => updateQuestion(i, { correctAnswer: e.target.value })} /></div>
                        </div>
                        {q.type === 'MCQ' && (
                          <div className="grid grid-cols-2 gap-2">
                            {(q.options || ['', '', '', '']).map((opt: string, optIdx: number) => (
                              <div key={optIdx}><Label className="text-[10px] text-slate-400">Option {optIdx + 1}</Label><Input value={opt} onChange={e => {
                                const newOpts = [...(q.options || ['', '', '', ''])];
                                newOpts[optIdx] = e.target.value;
                                updateQuestion(i, { options: newOpts });
                              }} className="h-8 text-xs" /></div>
                            ))}
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                          <div><Label>Hint <span className="text-slate-400 text-[10px]">(optional)</span></Label><Input value={q.hint || ''} onChange={e => updateQuestion(i, { hint: e.target.value })} placeholder="A helpful hint..." /></div>
                          <div><Label>Explanation <span className="text-slate-400 text-[10px]">(optional)</span></Label><Input value={q.explanation || ''} onChange={e => updateQuestion(i, { explanation: e.target.value })} placeholder="Why this is correct..." /></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div><Label>Prompt</Label><Input value={form.prompt} onChange={e => setForm({ ...form, prompt: e.target.value })} placeholder="Write a short email..." /></div>
              <div><Label>Model Answer</Label><textarea className="w-full border rounded-md p-2 mt-1 text-sm" rows={5} value={form.modelAnswer} onChange={e => setForm({ ...form, modelAnswer: e.target.value })} /></div>
              <div>
                <Label>Guidance Points (one per line)</Label>
                <textarea
                  className="w-full border rounded-md p-2 mt-1 text-sm"
                  rows={3}
                  value={form.guidance.join('\n')}
                  onChange={e => setForm({ ...form, guidance: e.target.value.split('\n').filter(l => l.trim()) })}
                  placeholder={"Point 1\nPoint 2..."}
                />
              </div>
            </div>
          )}

          <div className="mt-8 pt-4 border-t flex justify-end gap-3">
            <Button variant="outline" onClick={cancelForm}>Cancel</Button>
            <Button onClick={handleSave} disabled={busy} className="bg-[#0a192f] min-w-[140px]">
              <Save className="w-4 h-4 mr-1" />
              {busy ? 'Saving...' : mode === 'add' ? 'Publish Exercise' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h2 className="font-bold text-xl">Exercises ({exercises.length})</h2>
        <Button onClick={startAdd} className="bg-[#0a192f] hover:bg-[#020c1b]">
          <Plus className="w-4 h-4 mr-1" /> New Exercise
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[150px]">
          <Label className="text-xs">Search</Label>
          <Input value={filter.search} onChange={e => setFilter({ ...filter, search: e.target.value })} placeholder="Search by title..." className="h-9" />
        </div>
        <div>
          <Label className="text-xs">Level</Label>
          <select className="border rounded p-1.5 text-sm" value={filter.level} onChange={e => setFilter({ ...filter, level: e.target.value })}>
            <option value="">All</option>
            {LEVELS.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <Label className="text-xs">Category</Label>
          <select className="border rounded p-1.5 text-sm" value={filter.category} onChange={e => setFilter({ ...filter, category: e.target.value })}>
            <option value="">All</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Level</th>
              <th className="p-4">Category</th>
              <th className="p-4">Type</th>
              <th className="p-4">Questions</th>
              <th className="p-4">Access</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-4 font-medium text-black">{e.title}</td>
                <td className="p-4"><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold">{e.level}</span></td>
                <td className="p-4 text-slate-600">{e.category}</td>
                <td className="p-4 text-slate-600 text-xs">{e.type}</td>
                <td className="p-4 text-center font-bold text-black">{e.type === 'Interactive' ? (e.questions?.length || 0) : '—'}</td>
                <td className="p-4">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    e.access === 'FREE_ALL' ? 'bg-green-100 text-green-700' :
                    e.access === 'FREE_REGISTERED' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {e.access.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex gap-1 justify-end">
                    <Button size="sm" variant="ghost" className="hover:bg-blue-50 hover:text-blue-600" onClick={() => startEdit(e)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(e.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-slate-400">No exercises match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExercisesAdmin;
