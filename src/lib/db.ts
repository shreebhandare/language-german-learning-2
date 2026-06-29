import { supabase } from './supabase';
import { Exercise, ClassCode, Coupon } from './langrushi-data';

// Simple SHA-256 hashing for demo (production should use bcrypt/Argon2 server-side)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'langrushi_salt_v1');
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// === Exercises ===
export async function fetchExercises(): Promise<Exercise[]> {
  const { data, error } = await supabase.from('app_exercises').select('*').order('id');
  if (error) { console.error(error); return []; }
  return (data || []).map((r: any) => ({
    id: r.id,
    title: r.title,
    level: r.level,
    category: r.category,
    subPart: r.sub_part,
    type: r.type,
    access: r.access,
    mediaUrl: r.media_url || undefined,
    transcript: r.transcript || undefined,
    questions: r.questions || undefined,
    answerDisplayMode: r.answer_display_mode || '',
    allowSkip: r.allow_skip !== false,
    prompt: r.prompt || undefined,
    guidance: r.guidance || undefined,
    modelAnswer: r.model_answer || undefined,
    updatedAt: r.updated_at || undefined,
  }));
}

export async function insertExercise(ex: Exercise): Promise<void> {
  await supabase.from('app_exercises').insert({
    id: ex.id, title: ex.title, level: ex.level, category: ex.category,
    sub_part: ex.subPart, type: ex.type, access: ex.access,
    media_url: ex.mediaUrl || null, transcript: ex.transcript || null,
    questions: ex.questions || null,
    answer_display_mode: ex.answerDisplayMode || null,
    allow_skip: ex.allowSkip !== false,
    prompt: ex.prompt || null, guidance: ex.guidance || null, model_answer: ex.modelAnswer || null,
    updated_at: new Date().toISOString(),
  });
}

export async function updateExercise(id: string, ex: Partial<Exercise>): Promise<void> {
  const patch: any = {};
  if (ex.title !== undefined) patch.title = ex.title;
  if (ex.level !== undefined) patch.level = ex.level;
  if (ex.category !== undefined) patch.category = ex.category;
  if (ex.subPart !== undefined) patch.sub_part = ex.subPart;
  if (ex.type !== undefined) patch.type = ex.type;
  if (ex.access !== undefined) patch.access = ex.access;
  if (ex.mediaUrl !== undefined) patch.media_url = ex.mediaUrl || null;
  if (ex.transcript !== undefined) patch.transcript = ex.transcript || null;
  if (ex.questions !== undefined) patch.questions = ex.questions || null;
  if (ex.answerDisplayMode !== undefined) patch.answer_display_mode = ex.answerDisplayMode || null;
  if (ex.allowSkip !== undefined) patch.allow_skip = ex.allowSkip;
  if (ex.prompt !== undefined) patch.prompt = ex.prompt || null;
  if (ex.guidance !== undefined) patch.guidance = ex.guidance || null;
  if (ex.modelAnswer !== undefined) patch.model_answer = ex.modelAnswer || null;
  patch.updated_at = new Date().toISOString();
  const { error } = await supabase.from('app_exercises').update(patch).eq('id', id);
  if (error) console.error('[db] updateExercise failed:', error);
}

export async function deleteExercise(id: string): Promise<void> {
  await supabase.from('app_exercises').delete().eq('id', id);
}

// === Profiles ===
export async function fetchAllProfiles(): Promise<any[]> {
  const { data } = await supabase.from('shared_profiles').select('*').order('registered_at', { ascending: false });
  return (data || []).map((r: any) => ({
    id: r.id, email: r.email, name: r.name, tier: r.tier,
    courseLevel: r.course_level || undefined,
    registeredAt: r.registered_at,
  }));
}

export async function fetchProfileById(id: string): Promise<any | null> {
  console.log('[db] fetchProfileById called with id:', id);
  const { data, error } = await supabase.from('shared_profiles').select('*').eq('id', id).maybeSingle();
  if (error) {
    console.error('[db] fetchProfileById error:', error.message, error.code, error.details);
    return null;
  }
  if (!data) {
    console.warn('[db] fetchProfileById: no profile row found for id:', id);
    return null;
  }
  console.log('[db] fetchProfileById result:', { id: data.id, email: data.email, tier: data.tier });
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    tier: data.tier,
    courseLevel: data.course_level || undefined,
    registeredAt: data.registered_at,
  };
}

export async function updateProfileTier(id: string, tier: string, courseLevel?: string): Promise<void> {
  await supabase.from('shared_profiles').update({ tier, course_level: courseLevel || null }).eq('id', id);
}

// === Attempts ===
export async function fetchAttemptsForUser(userId: string): Promise<any[]> {
  const { data } = await supabase.from('app_attempts').select('*').eq('user_id', userId).order('date', { ascending: false });
  return (data || []).map((a: any) => ({
    exerciseId: a.exercise_id, score: a.score, total: a.total, date: a.date,
  }));
}

export async function insertAttempt(userId: string, exerciseId: string, score: number, total: number): Promise<void> {
  await supabase.from('app_attempts').insert({
    id: 'a' + Date.now() + Math.random().toString(36).slice(2, 6),
    user_id: userId, exercise_id: exerciseId, score, total,
  });
}

export async function fetchAllAttempts(): Promise<any[]> {
  const { data } = await supabase.from('app_attempts').select('*').order('date', { ascending: false });
  return (data || []).map((a: any) => ({
    userId: a.user_id, exerciseId: a.exercise_id, score: a.score, total: a.total, date: a.date,
  }));
}

// === Class Codes ===
export async function fetchClassCodes(): Promise<ClassCode[]> {
  const { data } = await supabase.from('app_class_codes').select('*').order('code');
  return (data || []).map((r: any) => ({
    id: r.id, code: r.code, level: r.level, maxUses: r.max_uses,
    used: r.used, expiry: r.expiry || undefined, active: r.active,
  }));
}

export async function insertClassCode(c: ClassCode): Promise<void> {
  await supabase.from('app_class_codes').insert({
    id: c.id, code: c.code, level: c.level, max_uses: c.maxUses,
    used: c.used, expiry: c.expiry || null, active: c.active,
  });
}

export async function updateClassCode(id: string, patch: Partial<ClassCode>): Promise<void> {
  const dbPatch: any = {};
  if ('used' in patch) dbPatch.used = patch.used;
  if ('active' in patch) dbPatch.active = patch.active;
  if ('maxUses' in patch) dbPatch.max_uses = patch.maxUses;
  await supabase.from('app_class_codes').update(dbPatch).eq('id', id);
}

export async function deleteClassCode(id: string): Promise<void> {
  await supabase.from('app_class_codes').delete().eq('id', id);
}

// === Coupons ===
export async function fetchCoupons(): Promise<Coupon[]> {
  const { data } = await supabase.from('app_coupons').select('*').order('code');
  return (data || []).map((r: any) => ({
    id: r.id, code: r.code, discountType: r.discount_type, value: r.value,
    maxUses: r.max_uses || undefined, used: r.used,
    expiry: r.expiry || undefined, active: r.active,
  }));
}

export async function insertCoupon(c: Coupon): Promise<void> {
  await supabase.from('app_coupons').insert({
    id: c.id, code: c.code, discount_type: c.discountType, value: c.value,
    max_uses: c.maxUses || null, used: c.used, expiry: c.expiry || null, active: c.active,
  });
}

export async function updateCoupon(id: string, patch: Partial<Coupon>): Promise<void> {
  const dbPatch: any = {};
  if ('used' in patch) dbPatch.used = patch.used;
  if ('active' in patch) dbPatch.active = patch.active;
  await supabase.from('app_coupons').update(dbPatch).eq('id', id);
}

export async function deleteCoupon(id: string): Promise<void> {
  await supabase.from('app_coupons').delete().eq('id', id);
}

// === Settings ===
export async function fetchSettings(): Promise<{
  guestQuota: number;
  registeredQuota: number;
  answerDisplayMode: string;
  priceLifetime: number;
  priceCourseA1: number;
  priceCourseA2: number;
  priceCourseB1: number;
  priceCourseB2: number;
}> {
  const { data } = await supabase.from('app_settings').select('*');
  const map: any = {};
  (data || []).forEach((r: any) => { map[r.key] = r.value; });
  return {
    guestQuota: parseInt(map.guest_quota || '2'),
    registeredQuota: parseInt(map.registered_quota || '10'),
    answerDisplayMode: map.answer_display_mode || 'instant',
    priceLifetime: parseInt(map.price_lifetime || '49'),
    priceCourseA1: parseInt(map.price_course_a1 || '199'),
    priceCourseA2: parseInt(map.price_course_a2 || '249'),
    priceCourseB1: parseInt(map.price_course_b1 || '299'),
    priceCourseB2: parseInt(map.price_course_b2 || '349'),
  };
}

export async function updateSetting(key: string, value: string): Promise<void> {
  const { error } = await supabase
    .from('app_settings')
    .upsert({ key, value }, { onConflict: 'key' });
  if (error) console.error('[db] updateSetting failed:', key, error);
}

export async function insertAnalytics(visitorId: string, email: string | null, actionType: string, details: string): Promise<void> {
  const id = 'l_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
  await supabase.from('app_analytics').insert({
    id,
    visitor_id: visitorId,
    user_email: email || null,
    action_type: actionType,
    details,
  });
}

export async function fetchAnalytics(): Promise<any[]> {
  const { data, error } = await supabase.from('app_analytics').select('*').order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return (data || []).map((r: any) => ({
    id: r.id,
    visitorId: r.visitor_id,
    userEmail: r.user_email,
    actionType: r.action_type,
    details: r.details,
    createdAt: r.created_at,
  }));
}
