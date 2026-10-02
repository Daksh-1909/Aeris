import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('SITE_ORIGIN') ?? '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return reply({ error: 'Method not allowed.' }, 405);

  try {
    const body = await request.json();
    if (typeof body.website === 'string' && body.website.trim()) return reply({ ok: true });
    const name = clean(body.name, 120);
    const email = clean(body.email, 320).toLowerCase();
    const message = clean(body.message, 5000);
    const inquiryType = clean(body.type, 30);
    const photoId = clean(body.photoId, 80) || null;
    const photoTitle = clean(body.photoTitle, 200) || null;
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10) return reply({ error: 'Please provide a valid name, email, and message of at least 10 characters.' }, 400);
    if (!['contact', 'print', 'license', 'commission', 'collaboration'].includes(inquiryType)) return reply({ error: 'Choose a valid inquiry type.' }, 400);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { count } = await supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('email', email).gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());
    if ((count ?? 0) >= 3) return reply({ error: 'Please wait before sending another inquiry.' }, 429);
    const { error } = await supabase.from('inquiries').insert({ name, email, inquiry_type: inquiryType, message, photo_id: photoId, photo_title: photoTitle });
    if (error) throw error;

    const resendKey = Deno.env.get('RESEND_API_KEY');
    const notifyEmail = Deno.env.get('INQUIRY_NOTIFY_EMAIL');
    if (resendKey && notifyEmail) {
      const delivery = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: Deno.env.get('INQUIRY_FROM_EMAIL') ?? 'AERIS <onboarding@resend.dev>', to: [notifyEmail], reply_to: email, subject: `AERIS inquiry: ${inquiryType}`, text: `${name} (${email})\n${photoTitle ? `${photoTitle} (${photoId})\n` : ''}\n${message}` }),
      });
      if (!delivery.ok) return reply({ ok: true, notificationSent: false });
    } else return reply({ ok: true, notificationSent: false });
    return reply({ ok: true, notificationSent: true });
  } catch (error) {
    console.error('Inquiry submission failed', error);
    return reply({ error: 'We could not save your inquiry. Please try again.' }, 500);
  }

  function reply(payload: Record<string, unknown>, status = 200) {
    return new Response(JSON.stringify(payload), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

function clean(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().replace(/[<>]/g, '').slice(0, max) : '';
}
