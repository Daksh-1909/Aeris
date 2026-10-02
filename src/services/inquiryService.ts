import { supabase } from './supabaseClient';

export type InquiryStatus = 'new'|'replied'|'closed';
export interface Inquiry {
  id: string;
  name: string;
  email: string;
  inquiry_type: string;
  message: string;
  photo_id: string|null;
  photo_title: string|null;
  purpose: string;
  usage: string;
  status: InquiryStatus;
  created_at: string;
}

export async function loadInquiries(status: InquiryStatus|'all'): Promise<Inquiry[]> {
  if (!supabase) throw new Error('The inquiry inbox requires Supabase.');
  let query = supabase.from('inquiries').select('*').order('created_at', { ascending: false });
  if (status !== 'all') query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Inquiry[];
}
export async function updateInquiryStatus(id: string, status: InquiryStatus) {
  if (!supabase) throw new Error('The inquiry inbox requires Supabase.');
  const { error } = await supabase.from('inquiries').update({ status }).eq('id', id);
  if (error) throw error;
}
