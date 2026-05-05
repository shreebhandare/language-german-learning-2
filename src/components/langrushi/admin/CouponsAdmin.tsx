import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { LEVELS, CATEGORIES, Level, Category, AccessFlag, ExerciseType } from '@/lib/langrushi-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Plus, Trash2, Download, Upload, Settings, Users, Tag, KeyRound, BookOpen, FileText } from 'lucide-react';

const CouponsAdmin: React.FC = () => {
  const { coupons, addCoupon, updateCouponLocal, removeCoupon } = useAppContext();
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percent' | 'fixed'>('percent');
  const [value, setValue] = useState(20);

  const add = async () => {
    if (!code) return;
    await addCoupon({ id: 'co' + Date.now(), code, discountType: type, value, used: 0, active: true });
    setCode('');
    toast({ title: 'Coupon saved to database' });
  };

  return (
    <div>
      <h2 className="font-bold text-xl mb-4">Coupons</h2>
      <div className="bg-white border rounded-xl p-4 mb-4 flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-[150px]"><Label>Code</Label><Input value={code} onChange={e => setCode(e.target.value)} placeholder="SUMMER25" /></div>
        <div><Label>Type</Label><select className="border rounded p-2" value={type} onChange={e => setType(e.target.value as any)}><option value="percent">Percent %</option><option value="fixed">Fixed €</option></select></div>
        <div><Label>Value</Label><Input type="number" value={value} onChange={e => setValue(+e.target.value)} className="w-24" /></div>
        <Button onClick={add} className="bg-[#0a192f]"><Plus className="w-4 h-4 mr-1" /> Add</Button>
      </div>
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left"><tr><th className="p-3">Code</th><th className="p-3">Discount</th><th className="p-3">Used</th><th className="p-3">Active</th><th className="p-3"></th></tr></thead>
          <tbody>
            {coupons.map(c => (
              <tr key={c.id} className="border-t border-slate-100">
                <td className="p-3 font-mono">{c.code}</td>
                <td className="p-3">{c.discountType === 'percent' ? `${c.value}%` : `€${c.value}`}</td>
                <td className="p-3">{c.used}{c.maxUses ? `/${c.maxUses}` : ''}</td>
                <td className="p-3"><button onClick={() => updateCouponLocal(c.id, { active: !c.active })} className={`px-2 py-0.5 text-xs rounded ${c.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-black'}`}>{c.active ? 'Active' : 'Inactive'}</button></td>
                <td className="p-3 text-right"><Button size="sm" variant="ghost" onClick={() => removeCoupon(c.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CouponsAdmin;
