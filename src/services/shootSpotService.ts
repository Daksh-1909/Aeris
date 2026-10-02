import { isSupabaseConfigured, supabase } from './supabaseClient';

export interface ShootSpot {
  id: string;
  userId: string;
  name: string;
  lat: number;
  lng: number;
  timezone: string;
  notes: string;
  reminderEnabled: boolean;
  createdAt: string;
}

const localKey = (userId: string) => `aeris:shoot-spots:${userId}`;

export async function loadShootSpots(userId: string): Promise<ShootSpot[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('shoot_spots').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => ({ id: row.id, userId: row.user_id, name: row.name, lat: row.latitude, lng: row.longitude, timezone: row.timezone, notes: row.notes, reminderEnabled: row.reminder_enabled, createdAt: row.created_at }));
  }
  try { return JSON.parse(localStorage.getItem(localKey(userId)) ?? '[]') as ShootSpot[]; } catch { return []; }
}

export async function saveShootSpot(userId: string, spot: Omit<ShootSpot, 'id'|'createdAt'|'userId'>): Promise<ShootSpot> {
  if (isSupabaseConfigured && supabase) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Sign in to save shoot spots.');
    const { data, error } = await supabase.from('shoot_spots').insert({ user_id: user.id, name: spot.name, latitude: spot.lat, longitude: spot.lng, timezone: spot.timezone, notes: spot.notes, reminder_enabled: spot.reminderEnabled }).select().single();
    if (error) throw error;
    return { id: data.id, userId: data.user_id, name: data.name, lat: data.latitude, lng: data.longitude, timezone: data.timezone, notes: data.notes, reminderEnabled: data.reminder_enabled, createdAt: data.created_at };
  }
  const saved: ShootSpot = { ...spot, userId, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  localStorage.setItem(localKey(userId), JSON.stringify([saved, ...(await loadShootSpots(userId))]));
  return saved;
}

export async function updateShootSpot(userId: string, spot: ShootSpot): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Sign in to update shoot spots.');
    const { error } = await supabase.from('shoot_spots').update({ reminder_enabled: spot.reminderEnabled, name: spot.name, notes: spot.notes }).eq('id', spot.id).eq('user_id', user.id);
    if (error) throw error;
    return;
  }
  const spots = await loadShootSpots(userId);
  localStorage.setItem(localKey(userId), JSON.stringify(spots.map((item) => item.id === spot.id ? spot : item)));
}

export async function deleteShootSpot(userId: string, id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Sign in to remove shoot spots.');
    const { error } = await supabase.from('shoot_spots').delete().eq('id', id).eq('user_id', user.id);
    if (error) throw error;
    return;
  }
  localStorage.setItem(localKey(userId), JSON.stringify((await loadShootSpots(userId)).filter((item) => item.id !== id)));
}
