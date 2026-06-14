import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Exercise, ClassCode, Coupon, Level } from '@/lib/langrushi-data';
import * as db from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';

export type Tier = 'guest' | 'registered' | 'paid' | 'course' | 'admin';
export type View = 'learn' | 'dashboard' | 'admin';

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
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (password: string) => Promise<boolean>;
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
  authModal: 'login' | 'register' | 'forgot' | 'reset-password' | null;
  setAuthModal: (m: 'login' | 'register' | 'forgot' | 'reset-password' | null) => void;
  forcedModal: boolean;
  setForcedModal: (b: boolean) => void;
  activeExerciseId: string | null;
  setActiveExerciseId: (id: string | null) => void;
  recordAttempt: (exerciseId: string, score: number, total: number) => Promise<void>;
  canAccessExercise: (ex: Exercise) => { allowed: boolean; reason?: string };
  cookieConsent: 'accepted' | 'rejected' | null;
  setCookieConsent: (c: 'accepted' | 'rejected') => void;
  answerDisplayMode: 'instant' | 'end' | 'none';
  setAnswerDisplayMode: (mode: 'instant' | 'end' | 'none') => Promise<void>;
  priceLifetime: number;
  setPriceLifetime: (p: number) => Promise<void>;
  priceCourseA1: number;
  setPriceCourseA1: (p: number) => Promise<void>;
  priceCourseA2: number;
  setPriceCourseA2: (p: number) => Promise<void>;
  priceCourseB1: number;
  setPriceCourseB1: (p: number) => Promise<void>;
  priceCourseB2: number;
  setPriceCourseB2: (p: number) => Promise<void>;
  logActivity: (action: string, details: string) => Promise<void>;
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
  
  const pathname = location.pathname.replace('/', '') || 'learn';
  const validViews = ['learn', 'dashboard', 'admin'];
  const view = validViews.includes(pathname) ? pathname as View : 'learn';

  const setView = (v: View) => {
    if (v === 'learn') navigate('/');
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
  const [answerDisplayMode, setAnswerDisplayModeState] = useState<'instant' | 'end' | 'none'>('instant');
  const [priceLifetime, setPriceLifetimeState] = useState(49);
  const [priceCourseA1, setPriceCourseA1State] = useState(199);
  const [priceCourseA2, setPriceCourseA2State] = useState(249);
  const [priceCourseB1, setPriceCourseB1State] = useState(299);
  const [priceCourseB2, setPriceCourseB2State] = useState(349);
  const [authModal, setAuthModal] = useState<'login' | 'register' | 'forgot' | 'reset-password' | null>(null);
  const [forcedModal, setForcedModal] = useState(false);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [cookieConsent, setCookieConsentState] = useState<'accepted' | 'rejected' | null>(null);


  // Initial load from DB + Auth session
  useEffect(() => {
    // Fail-safe timeout to prevent the UI from blocking indefinitely (e.g. if Supabase is paused/offline)
    const timeoutId = setTimeout(() => {
      setLoading(false);
      console.warn("Initialization took too long. Proceeding with loading disabled to prevent blocking.");
    }, 6000);

    // Check if the URL indicates we are in password recovery flow
    if (
      window.location.hash.includes('type=recovery') ||
      window.location.search.includes('type=recovery') ||
      window.location.href.includes('type=recovery')
    ) {
      setAuthModal('reset-password');
    }

    // ⚠️ CRITICAL: Do NOT make any supabase.from() or supabase.auth.getSession() calls
    // directly inside this callback. Supabase v2 holds an internal navigator.locks auth
    // lock for the full async duration of this callback. Any DB call inside the callback
    // internally calls getSession(), which waits on the same lock → DEADLOCK.
    //
    // Fix:
    //  1. Skip INITIAL_SESSION — the IIFE below handles the initial data load.
    //  2. For all subsequent events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.),
    //     use setTimeout(0) to escape the lock context before making any DB calls.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setAuthModal('reset-password');
        return;
      }

      // INITIAL_SESSION is handled by the IIFE below — skip it here to avoid deadlock
      if (event === 'INITIAL_SESSION') return;

      // For subsequent auth events (SIGNED_IN, SIGNED_OUT, USER_UPDATED, TOKEN_REFRESHED…)
      // escape the auth lock via setTimeout before making any Supabase calls
      setTimeout(async () => {
        if (session?.user) {
          const profile = await db.fetchProfileById(session.user.id);
          if (profile) {
            const attempts = await db.fetchAttemptsForUser(profile.id);
            setUser({ ...profile, attempts });
            if (profile.tier === 'admin') {
              setView('admin');
            }
          } else {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              tier: 'registered',
              attempts: [],
              registeredAt: session.user.created_at || new Date().toISOString(),
            });
          }
        } else {
          setUser(null);
          setView('learn');
          setForcedModal(false);
        }
      }, 0);
    });

    const authListener = subscription;

    // IIFE: loads all initial data and checks session independently of the auth listener
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
        setAnswerDisplayModeState((settings.answerDisplayMode as any) || 'instant');
        setPriceLifetimeState(settings.priceLifetime);
        setPriceCourseA1State(settings.priceCourseA1);
        setPriceCourseA2State(settings.priceCourseA2);
        setPriceCourseB1State(settings.priceCourseB1);
        setPriceCourseB2State(settings.priceCourseB2);

        const saved = localStorage.getItem('langrushi_cookie_consent');
        if (saved === 'accepted' || saved === 'rejected') setCookieConsentState(saved);

        // Check active session — safe to call here because we are OUTSIDE the auth lock
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await db.fetchProfileById(session.user.id);
          if (profile) {
            const attempts = await db.fetchAttemptsForUser(profile.id);
            setUser({ ...profile, attempts });
            if (profile.tier === 'admin') {
              setView('admin');
            }
          } else {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              tier: 'registered',
              attempts: [],
              registeredAt: session.user.created_at || new Date().toISOString(),
            });
          }
        }
      } catch (e) {
        console.error('Init load failed:', e);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      clearTimeout(timeoutId);
      if (authListener) authListener.unsubscribe();
    };
  }, []);



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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: name,
        }
      }
    });

    if (error) {
      toast({ title: 'Registration failed', description: error.message, variant: 'destructive' });
      return false;
    }

    if (!data.user) return false;

    // Apply class code upgrade if present
    let tier: Tier = 'registered';
    let courseLevel: Level | undefined;
    if (classCode) {
      const cc = classCodes.find(c => c.code.toUpperCase() === classCode.toUpperCase() && c.active);
      if (cc && cc.used < cc.maxUses) {
        tier = 'course';
        courseLevel = cc.level;
        await db.updateClassCode(cc.id, { used: cc.used + 1 });
        setClassCodes(prev => prev.map(c => c.id === cc.id ? { ...c, used: c.used + 1 } : c));
        // Update profile in DB directly since the handle_new_user trigger inserts it asynchronously
        await db.updateProfileTier(data.user.id, 'course', courseLevel);
      } else {
        toast({ title: 'Invalid class code', description: 'Continuing as free registered user' });
      }
    }

    fetch('https://famous.ai/api/crm/69f7abee58024ee320e024b5/subscribe', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, source: 'register', tags: ['langrushi', 'registered'] }),
    }).catch(() => {});

    // If confirmation is required, session won't be active immediately
    toast({ title: 'Registration successful', description: 'Please check your email to confirm your account.' });
    setAuthModal(null);
    return true;
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({ title: 'Login failed', description: error.message, variant: 'destructive' });
      return false;
    }

    if (data.user) {
      const profile = await db.fetchProfileById(data.user.id);
      if (profile && profile.tier === 'admin') {
        setView('admin');
      }
    }

    setAuthModal(null);
    setForcedModal(false);
    toast({ title: 'Signed in successfully' });
    return true;
  };

  const loginGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth/callback',
      }
    });

    if (error) {
      toast({ title: 'Google sign-in failed', description: error.message, variant: 'destructive' });
    }
  };

  const forgotPassword = async (email: string) => {
    if (!email) {
      toast({ title: 'Missing email', description: 'Please enter your email address' });
      return false;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) {
      toast({ title: 'Password reset failed', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Reset link sent', description: 'Check your email inbox for a link to reset your password.' });
    return true;
  };

  const resetPassword = async (password: string) => {
    if (!password) {
      toast({ title: 'Missing password', description: 'Please enter your new password' });
      return false;
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast({ title: 'Password update failed', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Password updated successfully', description: 'Your password has been changed.' });
    setAuthModal(null);
    return true;
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase signOut error:', error);
      }
    } catch (e) {
      console.error('Supabase signOut exception:', e);
    }
    // Always clear local state
    setUser(null);
    setView('learn');
    setForcedModal(false);
    toast({ title: 'Signed out successfully' });
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
      toast({ title: `Coupon applied: -${co.discountType === 'percent' ? co.value + '%' : '₹' + co.value}` });
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
    } else {
      await db.insertAttempt(user.id, exerciseId, score, total);
      const attempt = { exerciseId, score, total, date: new Date().toISOString() };
      setUser(prev => prev ? { ...prev, attempts: [attempt, ...prev.attempts] } : prev);
    }
    logActivity('exercise_complete', `Exercise ID: ${exerciseId}, Score: ${score}/${total}`);
  };

  const canAccessExercise = (ex: Exercise) => {
    if (ex.category === 'Grammar' || ex.category === 'Games') return { allowed: true };
    if (ex.access === 'FREE_ALL') {
      if (!user) {
        const guestAttempts = JSON.parse(localStorage.getItem('langrushi_guest_attempts') || '[]');
        const uniqueQuizzes = new Set(
          guestAttempts
            .filter((a: any) => {
              const foundEx = exercises.find(e => e.id === a.exerciseId);
              return foundEx && foundEx.category !== 'Grammar' && foundEx.category !== 'Games';
            })
            .map((a: any) => a.exerciseId)
        );
        if (uniqueQuizzes.size >= guestQuota && !uniqueQuizzes.has(ex.id)) {
          return { allowed: false, reason: 'guest_quota' };
        }
      }
      return { allowed: true };
    }
    if (ex.access === 'FREE_REGISTERED') {
      if (!user) return { allowed: false, reason: 'login_required' };
      if (user.tier === 'registered') {
        const uniqueQuizzes = new Set(
          user.attempts
            .filter(a => {
              const foundEx = exercises.find(e => e.id === a.exerciseId);
              return foundEx && foundEx.category !== 'Grammar' && foundEx.category !== 'Games';
            })
            .map(a => a.exerciseId)
        );
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

  const setAnswerDisplayMode = async (mode: 'instant' | 'end' | 'none') => {
    setAnswerDisplayModeState(mode);
    await db.updateSetting('answer_display_mode', mode);
  };
  const setPriceLifetime = async (p: number) => {
    setPriceLifetimeState(p);
    await db.updateSetting('price_lifetime', p.toString());
  };
  const setPriceCourseA1 = async (p: number) => {
    setPriceCourseA1State(p);
    await db.updateSetting('price_course_a1', p.toString());
  };
  const setPriceCourseA2 = async (p: number) => {
    setPriceCourseA2State(p);
    await db.updateSetting('price_course_a2', p.toString());
  };
  const setPriceCourseB1 = async (p: number) => {
    setPriceCourseB1State(p);
    await db.updateSetting('price_course_b1', p.toString());
  };
  const setPriceCourseB2 = async (p: number) => {
    setPriceCourseB2State(p);
    await db.updateSetting('price_course_b2', p.toString());
  };

  const logActivity = async (action: string, details: string) => {
    const consent = localStorage.getItem('langrushi_cookie_consent');
    if (consent !== 'accepted') return; // GDPR compliance: only log if accepted
    
    let vid = localStorage.getItem('langrushi_visitor_id');
    if (!vid) {
      vid = 'vid_' + Date.now() + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('langrushi_visitor_id', vid);
    }
    
    try {
      await db.insertAnalytics(vid, user?.email || null, action, details);
    } catch (e) {
      console.error('Failed to log activity:', e);
    }
  };

  // GDPR Activity logging page views - defined after logActivity to avoid reference issues
  useEffect(() => {
    logActivity('page_view', location.pathname);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, user?.email, cookieConsent]);

  return (
    <AppContext.Provider value={{
      sidebarOpen, toggleSidebar, view, setView,
      user, loading, login, register, logout, loginGoogle,
      forgotPassword, resetPassword, upgradeToPaid, applyClassCode,
      exercises, refreshExercises, addExercise, updateExercise: updateExerciseCtx, removeExercise, fetchAllAttempts,
      classCodes, addClassCode, updateClassCodeLocal, removeClassCode,
      coupons, addCoupon, updateCouponLocal, removeCoupon,
      users, refreshUsers, changeUserTier,
      guestQuota, registeredQuota, setGuestQuota, setRegisteredQuota,
      authModal, setAuthModal, forcedModal, setForcedModal,
      activeExerciseId, setActiveExerciseId, recordAttempt, canAccessExercise,
      cookieConsent, setCookieConsent,
      answerDisplayMode, setAnswerDisplayMode,
      priceLifetime, setPriceLifetime,
      priceCourseA1, setPriceCourseA1,
      priceCourseA2, setPriceCourseA2,
      priceCourseB1, setPriceCourseB1,
      priceCourseB2, setPriceCourseB2,
      logActivity,
    }}>
      {children}
    </AppContext.Provider>
  );
};
