import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ExercisesAdmin from './ExercisesAdmin';
import UsersAdmin from './UsersAdmin';
import ClassCodesAdmin from './ClassCodesAdmin';
import CouponsAdmin from './CouponsAdmin';
import CSVAdmin from './CSVAdmin';
import SettingsAdmin from './SettingsAdmin';
import { Settings, Users, Tag, KeyRound, BookOpen, FileText } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const ctx = useAppContext();
  if (ctx.user?.tier !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Admin only</h1>
        <p className="text-black mt-2">Sign in with admin@langrushi.com / admin</p>
        <Button className="mt-4" onClick={() => ctx.setAuthModal('login')}>Sign in</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black">Admin Panel</h1>
        <p className="text-black">Manage content, users, codes, and settings.</p>
      </div>

      <Tabs defaultValue="exercises">
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 mb-6">
          <TabsTrigger value="exercises"><BookOpen className="w-4 h-4 mr-1" />Exercises</TabsTrigger>
          <TabsTrigger value="users"><Users className="w-4 h-4 mr-1" />Users</TabsTrigger>
          <TabsTrigger value="classcodes"><KeyRound className="w-4 h-4 mr-1" />Class Codes</TabsTrigger>
          <TabsTrigger value="coupons"><Tag className="w-4 h-4 mr-1" />Coupons</TabsTrigger>
          <TabsTrigger value="csv"><FileText className="w-4 h-4 mr-1" />CSV</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-1" />Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="exercises"><ExercisesAdmin /></TabsContent>
        <TabsContent value="users"><UsersAdmin /></TabsContent>
        <TabsContent value="classcodes"><ClassCodesAdmin /></TabsContent>
        <TabsContent value="coupons"><CouponsAdmin /></TabsContent>
        <TabsContent value="csv"><CSVAdmin /></TabsContent>
        <TabsContent value="settings"><SettingsAdmin /></TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
