import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Exercise, ClassCode, Coupon, Level } from '@/lib/langrushi-data';
import * as db from '@/lib/db';
import { useNavigate, useLocation } from 'react-router-dom';

export type Tier = 'guest' | 'registered' | 'paid' | 'course' | 'admin';
export type View = 'marketing' | 'learn' | 'dashboard' | 'admin' | 'courses' | 'pricing' | 'about' | 'contact';

export interface User {
  id: string;
  email: string;
  name: string;
  tier: Tier;
  courseLevel?: Level;
  registeredAt: string;
  attempts: { exerciseId: string; score: number; total: number; date: string }[];
}

interface AppContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  view: View;
  setView: (v: View) => void;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, classCode?: string) => Promise<boolean>;
  logout: () => void;
  loginGoogle: () => Promise<void>;
  upgradeToPaid: (couponCode?: string) => Promise<boolean>;
  applyClassCode: (code: string) => Promise<boolean>;
  exercises: Exercise[];
  refreshExercises: () => Promise<void>;
  addExercise: (ex: Exercise) => Promise<void>;
  updateExercise: (id: string, ex: Partial<Exercise>) => Promise<void>;
  removeExercise: (id: string) => Promise<void>;
  fetchAllAttempts: () => Promise<any[]>;
  classCodes: ClassCode[];
  addClassCode: (c: ClassCode) => Promise<void>;
  updateClassCodeLocal: (id: string, patch: Partial<ClassCode>) => Promise<void>;
  removeClassCode: (id: string) => Promise<void>;
  coupons: Coupon[];
  addCoupon: (c: Coupon) => Promise<void>;
  updateCouponLocal: (id: string, patch: Partial<Coupon>) => Promise<void>;
  removeCoupon: (id: string) => Promise<void>;
  users: any[];
  refreshUsers: () => Promise<void>;
  changeUserTier: (id: string, tier: string) => Promise<void>;
  guestQuota: number;
  registeredQuota: number;
  setGuestQuota: (n: number) => void;
  setRegisteredQuota: (n: number) => void;
  authModal: 'login' | 'register' | 'forgot' | null;
  setAuthModal: (m: 'login' | 'register' | 'forgot' | null) => void;
  forcedModal: boolean;
  setForcedModal: (b: boolean) => void;
  activeExerciseId: string | null;
  setActiveExerciseId: (id: string | null) => void;
  recordAttempt: (exerciseId: string, score: number, total: number) => Promise<void>;
  canAccessExercise: (ex: Exercise) => { allowed: boolean; reason?: string };
  cookieConsent: 'accepted' | 'rejected' | null;
  setCookieConsent: (c: 'accepted' | 'rejected') => void;
}

const AppContext = createContext<AppContextType | null>(null);
export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be inside AppProvider');
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const pathname = location.pathname.replace('/', '') || 'marketing';
  const validViews = ['marketing', 'learn', 'dashboard', 'admin', 'courses', 'pricing', 'about', 'contact'];
  const view = validViews.includes(pathname) ? pathname as View : 'marketing';

  const setView = (v: View) => {
    if (v === 'marketing') navigate('/');
    else navigate(`/${v}`);
  };

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [classCodes, setClassCodes] = useState<ClassCode[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [guestQuota, setGuestQuotaState] = useState(2);
  const [registeredQuota, setRegisteredQuotaState] = useState(10);
  const [authModal, setAuthModal] = useState<'login' | 'register' | 'forgot' | null>(null);
  const [forcedModal, setForcedModal] = useState(false);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [cookieConsent, setCookieConsentState] = useState<'accepted' | 'rejected' | null>(null);

  // Initial load from DB
  useEffect(() => {
    (async () => {
      try {
        const [ex, cc, co, settings] = await Promise.all([
          db.fetchExercises(),
          db.fetchClassCodes(),
          db.fetchCoupons(),
          db.fetchSettings(),
        ]);
        setExercises(ex);
        setClassCodes(cc);
        setCoupons(co);
        setGuestQuotaState(settings.guestQuota);
        setRegisteredQuotaState(settings.registeredQuota);

        const saved = localStorage.getItem('langrushi_cookie_consent');
        if (saved === 'accepted' || saved === 'rejected') setCookieConsentState(saved);

        // Restore session
        const sid = localStorage.getItem('langrushi_user_id');
        if (sid) {
          const profile = await db.fetchAllProfiles().then(list => list.find(p => p.id === sid));
          if (profile) {
            const attempts = await db.fetchAttemptsForUser(profile.id);
            setUser({ ...profile, attempts });
          }
        }
      } catch (e) {
        console.error('Init load failed:', e);
      }
      setTimeout(() => {
        setLoading(false);
      }, 3000);
    })();
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('langrushi_user_id', user.id);
    else localStorage.removeItem('langrushi_user_id');
  }, [user]);

  const setCookieConsent = (c: 'accepted' | 'rejected') => {
    setCookieConsentState(c);
    localStorage.setItem('langrushi_cookie_consent', c);
  };

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  const refreshExercises = async () => setExercises(await db.fetchExercises());
  const refreshUsers = async () => setUsers(await db.fetchAllProfiles());

  const register = async (email: string, password: string, name: string, classCode?: string) => {
    if (!email || !password || !name) {
      toast({ title: 'Missing fields', description: 'Please fill all fields' });
      return false;
    }
    const existing = await db.findProfileByEmail(email);
    if (existing) {
      toast({ title: 'Email already registered', description: 'Try signing in instead' });
      return false;
    }

    let tier: Tier = 'registered';
    let courseLevel: Level | undefined;
    if (classCode) {
      const cc = classCodes.find(c => c.code.toUpperCase() === classCode.toUpperCase() && c.active);
      if (cc && cc.used < cc.maxUses) {
        tier = 'course';
        courseLevel = cc.level;
        await db.updateClassCode(cc.id, { used: cc.used + 1 });
        setClassCodes(prev => prev.map(c => c.id === cc.id ? { ...c, used: c.used + 1 } : c));
      } else {
        toast({ title: 'Invalid class code', description: 'Continuing as free registered user' });
      }
    }

    const id = 'u' + Date.now() + Math.random().toString(36).slice(2, 6);
    const passwordHash = await db.hashPassword(password);
    await db.createProfile({ id, email, passwordHash, name, tier, courseLevel });

    const newUser: User = {
      id, email, name, tier, courseLevel,
      registeredAt: new Date().toISOString(), attempts: [],
    };
    setUser(newUser);
    setAuthModal(null);
    setForcedModal(false);

    fetch('https://famous.ai/api/crm/69f7abee58024ee320e024b5/subscribe', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, source: 'register', tags: ['langrushi', 'registered'] }),
    }).catch(() => {});

    toast({ title: `Welcome, ${name}!`, description: tier === 'course' ? `Enrolled at ${courseLevel} level` : 'Account created' });
    return true;
  };

  const login = async (email: string, password: string) => {
    const profile = await db.authenticate(email, password);
    if (!profile) {
      toast({ title: 'Invalid credentials', description: 'Check email/password or register' });
      return false;
    }
    const attempts = await db.fetchAttemptsForUser(profile.id);
    const u: User = {
      id: profile.id, email: profile.email, name: profile.name,
      tier: profile.tier, courseLevel: profile.course_level || undefined,
      registeredAt: profile.registered_at, attempts,
    };
    setUser(u);
    setAuthModal(null);
    setForcedModal(false);
    if (u.tier === 'admin') setView('admin');
    toast({ title: `Welcome back, ${u.name}` });
    return true;
  };

  const loginGoogle = async () => {
    const email = `google_${Date.now()}@gmail.com`;
    const id = 'g' + Date.now();
    const passwordHash = await db.hashPassword('google_oauth_' + id);
    await db.createProfile({ id, email, passwordHash, name: 'Google User', tier: 'registered' });
    const u: User = { id, email, name: 'Google User', tier: 'registered', registeredAt: new Date().toISOString(), attempts: [] };
    setUser(u);
    setAuthModal(null);
    setForcedModal(false);
    toast({ title: 'Signed in with Google' });
  };

  const logout = () => {
    setUser(null);
    setView('marketing');
    toast({ title: 'Signed out' });
  };

  const upgradeToPaid = async (couponCode?: string) => {
    if (!user) { setAuthModal('register'); return false; }
    if (couponCode) {
      const co = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase() && c.active);
      if (!co) { toast({ title: 'Invalid or inactive coupon code' }); return false; }
      // Reject if usage limit already reached
      if (co.maxUses !== undefined && co.used >= co.maxUses) {
        toast({ title: 'Coupon exhausted', description: 'This code has reached its maximum number of uses.' });
        return false;
      }
      const newUsed = co.used + 1;
      const nowExhausted = co.maxUses !== undefined && newUsed >= co.maxUses;
      // Increment usage; auto-deactivate if limit now reached
      const patch = nowExhausted ? { used: newUsed, active: false } : { used: newUsed };
      await db.updateCoupon(co.id, patch);
      setCoupons(prev => prev.map(c => c.id === co.id ? { ...c, ...patch } : c));
      toast({ title: `Coupon applied: -${co.discountType === 'percent' ? co.value + '%' : '€' + co.value}` });
    }
    await db.updateProfileTier(user.id, 'paid');
    setUser({ ...user, tier: 'paid' });
    setForcedModal(false);
    toast({ title: 'Payment successful!', description: 'Lifetime access unlocked' });
    return true;
  };

  const applyClassCode = async (code: string) => {
    if (!user) return false;
    const cc = classCodes.find(c => c.code.toUpperCase() === code.toUpperCase() && c.active);
    if (!cc || cc.used >= cc.maxUses) {
      toast({ title: 'Invalid or expired class code' });
      return false;
    }
    await db.updateProfileTier(user.id, 'course', cc.level);
    await db.updateClassCode(cc.id, { used: cc.used + 1 });
    setClassCodes(prev => prev.map(c => c.id === cc.id ? { ...c, used: c.used + 1 } : c));
    setUser({ ...user, tier: 'course', courseLevel: cc.level });
    toast({ title: 'Class code accepted!', description: `Enrolled at ${cc.level} level` });
    return true;
  };

  const recordAttempt = async (exerciseId: string, score: number, total: number) => {
    if (!user) {
      const guestAttempts = JSON.parse(localStorage.getItem('langrushi_guest_attempts') || '[]');
      guestAttempts.push({ exerciseId, score, total, date: new Date().toISOString() });
      localStorage.setItem('langrushi_guest_attempts', JSON.stringify(guestAttempts));
      return;
    }
    await db.insertAttempt(user.id, exerciseId, score, total);
    const attempt = { exerciseId, score, total, date: new Date().toISOString() };
    setUser(prev => prev ? { ...prev, attempts: [attempt, ...prev.attempts] } : prev);
  };

  const canAccessExercise = (ex: Exercise) => {
    if (ex.category === 'Grammar' || ex.category === 'Games') return { allowed: true };
    if (ex.access === 'FREE_ALL') {
      if (!user) {
        const guestAttempts = JSON.parse(localStorage.getItem('langrushi_guest_attempts') || '[]');
        const uniqueQuizzes = new Set(guestAttempts.map((a: any) => a.exerciseId));
        if (uniqueQuizzes.size >= guestQuota && !uniqueQuizzes.has(ex.id)) {
          return { allowed: false, reason: 'guest_quota' };
        }
      }
      return { allowed: true };
    }
    if (ex.access === 'FREE_REGISTERED') {
      if (!user) return { allowed: false, reason: 'login_required' };
      if (user.tier === 'registered') {
        const uniqueQuizzes = new Set(user.attempts.map(a => a.exerciseId));
        if (uniqueQuizzes.size >= registeredQuota && !uniqueQuizzes.has(ex.id)) {
          return { allowed: false, reason: 'registered_quota' };
        }
      }
      return { allowed: true };
    }
    if (ex.access === 'PAID') {
      if (!user) return { allowed: false, reason: 'login_required' };
      if (user.tier === 'paid' || user.tier === 'course' || user.tier === 'admin') return { allowed: true };
      return { allowed: false, reason: 'paid_required' };
    }
    return { allowed: true };
  };

  // Admin CRUD wrappers
  const addExercise = async (ex: Exercise) => {
    await db.insertExercise(ex);
    setExercises(prev => [...prev, ex]);
  };
  const updateExerciseCtx = async (id: string, patch: Partial<Exercise>) => {
    await db.updateExercise(id, patch);
    setExercises(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));
  };
  const removeExercise = async (id: string) => {
    await db.deleteExercise(id);
    setExercises(prev => prev.filter(e => e.id !== id));
  };
  const fetchAllAttempts = async () => {
    return await db.fetchAllAttempts();
  };
  const addClassCode = async (c: ClassCode) => {
    await db.insertClassCode(c);
    setClassCodes(prev => [...prev, c]);
  };
  const updateClassCodeLocal = async (id: string, patch: Partial<ClassCode>) => {
    await db.updateClassCode(id, patch);
    setClassCodes(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  };
  const removeClassCode = async (id: string) => {
    await db.deleteClassCode(id);
    setClassCodes(prev => prev.filter(c => c.id !== id));
  };
  const addCoupon = async (c: Coupon) => {
    await db.insertCoupon(c);
    setCoupons(prev => [...prev, c]);
  };
  const updateCouponLocal = async (id: string, patch: Partial<Coupon>) => {
    await db.updateCoupon(id, patch);
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  };
  const removeCoupon = async (id: string) => {
    await db.deleteCoupon(id);
    setCoupons(prev => prev.filter(c => c.id !== id));
  };
  const changeUserTier = async (id: string, tier: string) => {
    await db.updateProfileTier(id, tier);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, tier } : u));
  };

  const setGuestQuota = async (n: number) => {
    setGuestQuotaState(n);
    await db.updateSetting('guest_quota', n.toString());
  };
  const setRegisteredQuota = async (n: number) => {
    setRegisteredQuotaState(n);
    await db.updateSetting('registered_quota', n.toString());
  };

  return (
    <AppContext.Provider value={{
      sidebarOpen, toggleSidebar, view, setView,
      user, loading, login, register, logout, loginGoogle,
      upgradeToPaid, applyClassCode,
      exercises, refreshExercises, addExercise, updateExercise: updateExerciseCtx, removeExercise, fetchAllAttempts,
      classCodes, addClassCode, updateClassCodeLocal, removeClassCode,
      coupons, addCoupon, updateCouponLocal, removeCoupon,
      users, refreshUsers, changeUserTier,
      guestQuota, registeredQuota, setGuestQuota, setRegisteredQuota,
      authModal, setAuthModal, forcedModal, setForcedModal,
      activeExerciseId, setActiveExerciseId, recordAttempt, canAccessExercise,
      cookieConsent, setCookieConsent,
    }}>
      {children}
    </AppContext.Provider>
  );
};
