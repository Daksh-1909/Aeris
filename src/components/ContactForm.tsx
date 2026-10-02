import { useState, type FormEvent } from 'react';
import { isSupabaseConfigured, supabase } from '../services/supabaseClient';
import type { Photograph } from '../types/gallery';

export function ContactForm({ photo, requestType = 'contact' }: { photo?: Photograph; requestType?: 'contact'|'print'|'license'|'commission'|'collaboration'; }) {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [formType, setFormType] = useState(requestType);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isSupabaseConfigured || !supabase) { setStatus('Demo mode — message not sent.'); return; }
    setBusy(true); setStatus('');
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const { error, data } = await supabase.functions.invoke('submit-inquiry', { body: { name: form.get('name'), email: form.get('email'), type: photo ? requestType : form.get('type'), message: form.get('message'), website: form.get('website'), photoId: photo?.id, photoTitle: photo?.title, purpose: form.get('purpose'), usage: form.get('usage') } });
    setBusy(false);
    if (error || data?.error) setStatus(typeof data?.error === 'string' ? data.error : 'We could not send your inquiry. Please try again.');
    else setStatus(data?.notificationSent ? 'Your inquiry was delivered. Thank you; we’ll be in touch.' : 'Your inquiry was saved. Email notification is not configured yet.');
    if (!error && !data?.error) formElement.reset();
  };
  return <form id={photo ? 'photo-inquiry' : undefined} className="member-panel contact-form" onSubmit={(event) => void submit(event)}><h2>{photo ? (requestType === 'license' ? 'License this photograph' : 'Request a print') : 'Let’s make something meaningful.'}</h2>{photo&&<p>Request about “{photo.title}” · {photo.location}</p>}<label>Your name<input name="name" autoComplete="name" maxLength={120} required /></label><label>Email<input name="email" type="email" autoComplete="email" maxLength={320} required /></label><label>Inquiry type<select name="type" value={formType} onChange={(event) => setFormType(event.target.value as typeof requestType)} disabled={Boolean(photo)}><option value="contact">General inquiry</option><option value="commission">Photography commission</option><option value="collaboration">Collaboration</option><option value="print">Print request</option><option value="license">License this photo</option></select></label>{photo&&<><label>Purpose<select name="purpose"><option value="personal">Personal</option><option value="commercial">Commercial</option><option value="editorial">Editorial</option><option value="other">Other</option></select></label><label>Size or usage<input name="usage" maxLength={300} placeholder="Print size or intended use" /></label></>}<label>How can we help?<textarea name="message" minLength={10} maxLength={5000} required rows={5} /></label><label className="contact-honeypot" aria-hidden="true">Leave this field empty<input name="website" tabIndex={-1} autoComplete="off" /></label><button className="member-primary" disabled={busy}>{busy ? 'Sending…' : 'Send inquiry'}</button>{status&&<p role="status">{status}</p>}</form>;
}
