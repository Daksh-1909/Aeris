import { useState, type FormEvent } from 'react';
import { isSupabaseConfigured, supabase } from '../services/supabaseClient';

export function ContactForm() {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isSupabaseConfigured || !supabase) { setStatus('Demo mode — message not sent.'); return; }
    setBusy(true); setStatus('');
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const { error, data } = await supabase.functions.invoke('submit-inquiry', { body: { name: form.get('name'), email: form.get('email'), type: form.get('type'), message: form.get('message'), website: form.get('website') } });
    setBusy(false);
    if (error || data?.error) setStatus(typeof data?.error === 'string' ? data.error : 'We could not send your inquiry. Please try again.');
    else setStatus(data?.notificationSent ? 'Your inquiry was delivered. Thank you; we’ll be in touch.' : 'Your inquiry was saved. Email notification is not configured yet.');
    if (!error && !data?.error) formElement.reset();
  };
  return <form className="member-panel contact-form" onSubmit={(event) => void submit(event)}><h2>Let’s make something meaningful.</h2><label>Your name<input name="name" autoComplete="name" maxLength={120} required /></label><label>Email<input name="email" type="email" autoComplete="email" maxLength={320} required /></label><label>Inquiry type<select name="type"><option value="contact">General inquiry</option><option value="commission">Photography commission</option><option value="collaboration">Collaboration</option><option value="license">Print licensing</option></select></label><label>How can we help?<textarea name="message" minLength={10} maxLength={5000} required rows={5} /></label><label className="contact-honeypot" aria-hidden="true">Leave this field empty<input name="website" tabIndex={-1} autoComplete="off" /></label><button className="member-primary" disabled={busy}>{busy ? 'Sending…' : 'Send inquiry'}</button>{status&&<p role="status">{status}</p>}</form>;
}
