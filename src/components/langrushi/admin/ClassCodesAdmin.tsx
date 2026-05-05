import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { LEVELS, CATEGORIES, Level, Category, AccessFlag, ExerciseType } from '@/lib/langrushi-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Plus, Trash2, Download, Upload, Settings, Users, Tag, KeyRound, BookOpen, FileText } from 'lucide-react';

const ClassCodesAdmin: React.FC = () => {
  const { classCodes, addClassCode, updateClassCodeLocal, removeClassCode } = useAppContext();
  const [code, setCode] = useState('');
  const [level, setLevel] = useState<Level>('A1');
  const [maxUses, setMaxUses] = useState(50);

  const add = async () => {
    if (!code) return;
    await addClassCode({ id: 'cc' + Date.now(), code, level, maxUses, used: 0, active: true });
    setCode('');
    toast({ title: 'Class code saved to database' });
  };

  return (
    <div>
      <h2 className="font-bold text-xl mb-4">Class Codes</h2>
      <div className="bg-white border rounded-xl p-4 mb-4 flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-[150px]"><Label>Code</Label><Input value={code} onChange={e => setCode(e.target.value)} placeholder="GERMAN-X-2025" /></div>
        <div><Label>Level</Label><select className="border rounded p-2" value={level} onChange={e => setLevel(e.target.value as Level)}>{LEVELS.map(l => <option key={l}>{l}</option>)}</select></div>
        <div><Label>Max uses</Label><Input type="number" value={maxUses} onChange={e => setMaxUses(+e.target.value)} className="w-24" /></div>
        <Button onClick={add} className="bg-[#0a192f]"><Plus className="w-4 h-4 mr-1" /> Add</Button>
      </div>
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left"><tr><th className="p-3">Code</th><th className="p-3">Level</th><th className="p-3">Used</th><th className="p-3">Active</th><th className="p-3"></th></tr></thead>
          <tbody>
            {classCodes.map(c => (
              <tr key={c.id} className="border-t border-slate-100">
                <td className="p-3 font-mono">{c.code}</td>
                <td className="p-3">{c.level}</td>
                <td className="p-3">{c.used}/{c.maxUses}</td>
                <td className="p-3"><button onClick={() => updateClassCodeLocal(c.id, { active: !c.active })} className={`px-2 py-0.5 text-xs rounded ${c.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-black'}`}>{c.active ? 'Active' : 'Inactive'}</button></td>
                <td className="p-3 text-right"><Button size="sm" variant="ghost" onClick={() => removeClassCode(c.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClassCodesAdmin;
