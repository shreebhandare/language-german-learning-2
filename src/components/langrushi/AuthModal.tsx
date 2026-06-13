import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Mail, Lock, User as UserIcon, KeyRound } from 'lucide-react';

const AuthModal: React.FC = () => {
  const { authModal, setAuthModal, login, register, loginGoogle, forgotPassword, resetPassword } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!authModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (authModal === 'login') {
        await login(email, password);
      } else if (authModal === 'register') {
        await register(email, password, name, classCode || undefined);
      } else if (authModal === 'forgot') {
        const success = await forgotPassword(email);
        if (success) setAuthModal('login');
      } else if (authModal === 'reset-password') {
        const success = await resetPassword(password);
        if (success) {
          setPassword('');
          setAuthModal(null);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={!!authModal} onOpenChange={() => setAuthModal(null)}>
      <DialogContent className="sm:max-w-md z-[110]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {authModal === 'login' 
              ? 'Welcome back' 
              : authModal === 'register' 
              ? 'Create your account' 
              : authModal === 'forgot'
              ? 'Reset password'
              : 'Choose a new password'}
          </DialogTitle>
        </DialogHeader>

        {authModal !== 'forgot' && authModal !== 'reset-password' && (
          <Button variant="outline" className="w-full" onClick={loginGoogle}>
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </Button>
        )}

        {authModal !== 'forgot' && authModal !== 'reset-password' && (
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200"></span></div>
            <div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-black">or continue with email</span></div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {authModal === 'register' && (
            <div>
              <Label>Full name</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <Input className="pl-9" value={name} onChange={e => setName(e.target.value)} placeholder="Anna Schmidt" required />
              </div>
            </div>
          )}
          {authModal !== 'reset-password' && (
            <div>
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <Input type="email" className="pl-9" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
            </div>
          )}
          {authModal !== 'forgot' && (
            <div>
              <Label>{authModal === 'reset-password' ? 'New Password' : 'Password'}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <Input type="password" className="pl-9" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>
            </div>
          )}

          <Button type="submit" disabled={submitting} className="w-full bg-[#0a192f] hover:bg-[#020c1b]">
            {submitting ? 'Please wait...' : authModal === 'login' ? 'Sign in' : authModal === 'register' ? 'Create account' : authModal === 'forgot' ? 'Send reset link' : 'Update password'}
          </Button>
        </form>

        <div className="text-center text-sm text-black space-y-2">
          {authModal === 'login' && (
            <>
              <button onClick={() => setAuthModal('forgot')} className="text-red-600 hover:underline block w-full">Forgot password?</button>
              <p>No account? <button onClick={() => setAuthModal('register')} className="text-red-600 font-medium hover:underline">Sign up</button></p>
            </>
          )}
          {authModal === 'register' && <p>Have an account? <button onClick={() => setAuthModal('login')} className="text-red-600 font-medium hover:underline">Sign in</button></p>}
          {authModal === 'forgot' && <button onClick={() => setAuthModal('login')} className="text-red-600 hover:underline">Back to sign in</button>}
          {authModal === 'reset-password' && <button onClick={() => setAuthModal(null)} className="text-slate-600 hover:underline">Cancel</button>}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
