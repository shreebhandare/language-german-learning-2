import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SettingsAdmin: React.FC = () => {
  const { guestQuota, registeredQuota, setGuestQuota, setRegisteredQuota } = useAppContext();
  return (
    <div className="max-w-xl">
      <h2 className="font-bold text-xl mb-4">Quiz Access Settings</h2>
      <div className="bg-white border rounded-xl p-5 space-y-4">
        <div>
          <Label>Guest free quizzes</Label>
          <Input type="number" value={guestQuota} onChange={e => setGuestQuota(+e.target.value)} />
          <p className="text-xs text-black mt-1">Number of quizzes a guest can attempt before being prompted to register. Saved to database automatically.</p>
        </div>
        <div>
          <Label>Registered free quizzes</Label>
          <Input type="number" value={registeredQuota} onChange={e => setRegisteredQuota(+e.target.value)} />
          <p className="text-xs text-black mt-1">Number of quizzes a registered (free) user can attempt before upgrade prompt.</p>
        </div>

        <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded p-2">✓ Settings persist across sessions and devices.</p>
      </div>
    </div>
  );
};

export default SettingsAdmin;
