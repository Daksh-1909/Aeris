import type { User } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import type { MemberData, MemberProfile } from './memberStore';

const cachedProfileKey='aeris:supabase-profile-cache';

function mapProfile(user: User, row?: { username?: string; display_name?: string; is_public?: boolean; theme?: 'dark'|'light'; notifications_enabled?: boolean; created_at?: string; avatar_path?: string|null; }): MemberProfile {
  const displayName=row?.display_name||user.user_metadata.name||user.email?.split('@')[0]||'AERIS member';
  return {
    email: user.email??'',
    name: displayName,
    username: row?.username??user.user_metadata.username??'observer',
    joinedAt: row?.created_at??user.created_at,
    verified: Boolean(user.email_confirmed_at),
    following: [],
    notifications: row?.notifications_enabled??true,
    theme: row?.theme??'dark',
    privacy: row?.is_public? 'public':'private',
  };
}

export async function loadSupabaseProfile(): Promise<MemberProfile|null> {
  if (!supabase) return null;
  const { data: sessionData, error: sessionError }=await supabase.auth.getSession();
  if (sessionError||!sessionData.session?.user) {
    localStorage.removeItem(cachedProfileKey);
    localStorage.removeItem('aeris:session');
    return null;
  }
  const user=sessionData.session.user;
  const { data: profile }=await supabase.from('profiles').select('username,display_name,is_public,theme,notifications_enabled,created_at,avatar_path').eq('id', user.id).maybeSingle();
  const mapped=mapProfile(user, profile??undefined);
  localStorage.setItem(cachedProfileKey, JSON.stringify(mapped));
  localStorage.setItem('aeris:session', mapped.email);
  return mapped;
}

export function cachedSupabaseProfile(): MemberProfile|null {
  try { const value=localStorage.getItem(cachedProfileKey); return value? JSON.parse(value) as MemberProfile:null; } catch { return null; }
}

export async function signUpWithSupabase(name: string, email: string, password: string) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const username=email.trim().toLowerCase().split('@')[0].replace(/[^a-z0-9_]/g, '').slice(0, 30);
  const { data, error }=await supabase.auth.signUp({ email: email.trim().toLowerCase(), password, options: { data: { name: name.trim(), username }, emailRedirectTo: `${location.origin}/verify-email` } });
  if (error) throw error;
  return { authenticated: Boolean(data.session), email: data.user?.email??email };
}

export async function signInWithSupabase(email: string, password: string): Promise<MemberProfile> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error }=await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
  if (error) throw error;
  const { data: profile }=await supabase.from('profiles').select('username,display_name,is_public,theme,notifications_enabled,created_at,avatar_path').eq('id', data.user.id).maybeSingle();
  const mapped=mapProfile(data.user, profile??undefined);
  localStorage.setItem(cachedProfileKey, JSON.stringify(mapped));
  localStorage.setItem('aeris:session', mapped.email);
  return mapped;
}

export async function signOutSupabase() {
  if (!supabase) return;
  const { error }=await supabase.auth.signOut({ scope: 'local' });
  if (error) throw error;
  localStorage.removeItem(cachedProfileKey);
  localStorage.removeItem('aeris:session');
}

export async function requestSupabasePasswordReset(email: string) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { error }=await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: `${location.origin}/reset-password` });
  if (error) throw error;
}

export async function updateSupabasePassword(password: string) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { error }=await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export async function syncSupabaseProfile() {
  if (!supabase) return;
  const profile=await loadSupabaseProfile();
  window.dispatchEvent(new CustomEvent('aeris:cloud-auth', { detail: profile }));
}

export async function loadSupabaseMemberData(): Promise<{ email: string; data: MemberData; }|null> {
  if (!supabase) return null;
  const { data: sessionData, error: sessionError }=await supabase.auth.getSession();
  const user=sessionData.session?.user;
  if (sessionError||!user?.email) return null;
  const [favorites, history, collections, notifications]=await Promise.all([
    supabase.from('favorites').select('photo_id'),
    supabase.from('view_history').select('photo_id').order('viewed_at', { ascending: false }).limit(30),
    supabase.from('collections').select('id,title,is_public,created_at,collection_photos(photo_id)').order('updated_at', { ascending: false }),
    supabase.from('notifications').select('kind,payload').order('created_at', { ascending: false }).limit(20),
  ]);
  const failure=favorites.error??history.error??collections.error??notifications.error;
  if (failure) throw failure;
  return {
    email: user.email,
    data: {
      favorites: (favorites.data??[]).map((item) => item.photo_id),
      viewed: [...new Set((history.data??[]).map((item) => item.photo_id))],
      collections: (collections.data??[]).map((item) => ({
        id: item.id,
        name: item.title,
        photoIds: item.collection_photos.map((photo) => photo.photo_id),
        isPublic: item.is_public,
        createdAt: item.created_at,
      })),
      notices: (notifications.data??[]).map((item) => typeof item.payload.message==='string'? item.payload.message:item.kind.replaceAll('_', ' ')),
    },
  };
}
