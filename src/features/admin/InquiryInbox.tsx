import { useEffect, useState } from 'react';
import { loadInquiries, updateInquiryStatus, type Inquiry, type InquiryStatus } from '../../services/inquiryService';
import type { MemberProfile } from '../../services/memberStore';
import './inquiryInbox.css';

export function InquiryInbox({ profile }: { profile: MemberProfile; }) {
  const [filter, setFilter] = useState<InquiryStatus|'all'>('new');
  const [items, setItems] = useState<Inquiry[]>([]);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let live = true;
    void loadInquiries(filter).then((loaded) => { if (live) setItems(loaded); }).catch((reason: unknown) => { if (live) setError(reason instanceof Error ? reason.message : 'The inbox could not be loaded.'); });
    return () => { live = false; };
  }, [filter, revision]);
  if (!profile.role || profile.role !== 'admin') return <section className="inquiry-inbox"><p className="eyebrow">AERIS / ADMIN</p><h2>Admin access required</h2><p>This account does not have the admin role.</p></section>;
  const update = async (inquiry: Inquiry, status: InquiryStatus) => {
    setBusyId(inquiry.id); setError('');
    try { await updateInquiryStatus(inquiry.id, status); setRevision((value) => value + 1); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'The inquiry status could not be changed.'); }
    finally { setBusyId(''); }
  };
  return <section className="inquiry-inbox"><p className="eyebrow">AERIS / ADMIN</p><h2>Inquiry inbox</h2><label className="inquiry-inbox__filter">Filter by status<select value={filter} onChange={(event) => { setError(''); setFilter(event.target.value as InquiryStatus|'all'); }}><option value="new">New</option><option value="replied">Replied</option><option value="closed">Closed</option><option value="all">All</option></select></label>
    {error&&<div className="inquiry-inbox__error" role="alert"><p>{error}</p><button onClick={() => { setError(''); setRevision((value) => value + 1); }}>Retry</button></div>}
    {!error&&items.length===0&&<div className="inquiry-inbox__empty"><h3>No {filter==='all'?'':filter+' '}inquiries</h3><p>New messages will appear here.</p></div>}
    <div className="inquiry-inbox__list">{items.map((item) => <article key={item.id}><div className="inquiry-inbox__head"><div><span>{item.inquiry_type} · {item.status}</span><h3>{item.name}</h3><a href={'mailto:'+item.email}>{item.email}</a></div><time dateTime={item.created_at}>{new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.created_at))}</time></div>{item.photo_title&&<p><strong>Photo:</strong> {item.photo_title} ({item.photo_id})</p>}<p><strong>Purpose:</strong> {item.purpose} · <strong>Usage:</strong> {item.usage||'Not specified'}</p><p className="inquiry-inbox__message">{item.message}</p><label>Set status<select value={item.status} disabled={busyId===item.id} onChange={(event) => void update(item, event.target.value as InquiryStatus)}><option value="new">New</option><option value="replied">Replied</option><option value="closed">Closed</option></select></label></article>)}</div>
  </section>;
}
