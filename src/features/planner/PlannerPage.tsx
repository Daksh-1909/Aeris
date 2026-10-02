import { useEffect, useMemo, useState, type FormEvent } from 'react';
import * as SunCalc from 'suncalc';
import { addNotice, type MemberProfile } from '../../services/memberStore';
import { deleteShootSpot, loadShootSpots, saveShootSpot, updateShootSpot, type ShootSpot } from '../../services/shootSpotService';
import './planner.css';

interface Place { name: string; country: string; admin1?: string; latitude: number; longitude: number; timezone: string; }
interface GeocodeResponse { results?: Place[]; }
interface Position { name: string; latitude: number; longitude: number; timezone: string; }

function offsetMinutes(timezone: string): number {
  const label = new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'longOffset' }).formatToParts(new Date()).find((part) => part.type === 'timeZoneName')?.value ?? 'GMT+00:00';
  const match = label.match(/GMT([+-])(\d{2}):(\d{2})/);
  return match ? (match[1] === '-' ? -1 : 1) * (Number(match[2]) * 60 + Number(match[3])) : 0;
}
function localTime(date: Date | null | undefined, timezone: string): string {
  return !date || !Number.isFinite(date.getTime()) ? 'No event today' : new Intl.DateTimeFormat(undefined, { timeZone: timezone, hour: 'numeric', minute: '2-digit' }).format(date);
}
function localMinutes(date: Date | null, timezone: string): number | null {
  if (!date || !Number.isFinite(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date);
  return Number(parts.find((part) => part.type === 'hour')?.value ?? 0) * 60 + Number(parts.find((part) => part.type === 'minute')?.value ?? 0);
}
function timeLabel(phase: number) {
  if (phase < 0.03 || phase > 0.97) return 'New moon';
  if (phase < 0.22) return 'Waxing crescent';
  if (phase < 0.28) return 'First quarter';
  if (phase < 0.47) return 'Waxing gibbous';
  if (phase < 0.53) return 'Full moon';
  if (phase < 0.72) return 'Waning gibbous';
  if (phase < 0.78) return 'Last quarter';
  return 'Waning crescent';
}
function scheduleSpotReminder(spot: ShootSpot) {
  const now = Date.now();
  let starts = SunCalc.getTimes(new Date(now), spot.lat, spot.lng, 0, offsetMinutes(spot.timezone)).goldenHour;
  if (!starts || starts.getTime() - 3600000 <= now) starts = SunCalc.getTimes(new Date(now + 86400000), spot.lat, spot.lng, 0, offsetMinutes(spot.timezone)).goldenHour;
  if (starts && Number.isFinite(starts.getTime())) window.setTimeout(() => addNotice('Golden hour at ' + spot.name + ' starts soon.'), Math.max(0, starts.getTime() - now - 3600000));
}
function DayTimeline({ position }: { position: Position; }) {
  const times = SunCalc.getTimes(new Date(), position.latitude, position.longitude, 0, offsetMinutes(position.timezone));
  const boundaries = [0, localMinutes(times.dawn, position.timezone), localMinutes(times.sunrise, position.timezone), localMinutes(times.goldenHourEnd, position.timezone), localMinutes(times.goldenHour, position.timezone), localMinutes(times.sunset, position.timezone), localMinutes(times.dusk, position.timezone), 1440]
    .filter((value): value is number => value !== null);
  const zones = ['night', 'blue', 'golden', 'day', 'golden', 'blue', 'night'];
  return <div className="day-timeline" role="img" aria-label="Timeline of local night, blue hour, golden hour and daylight">{boundaries.slice(0, -1).map((start, index) => {
    const end = boundaries[index + 1] ?? start;
    return <span key={index} className={'day-timeline__zone day-timeline__zone--' + (zones[index] ?? 'night')} style={{ left: (start / 14.4) + '%', width: (Math.max(0, end - start) / 14.4) + '%' }} />;
  })}</div>;
}
function SpotTimes({ spot, onRemove, onReminder }: { spot: ShootSpot; onRemove: () => void; onReminder: (enabled: boolean) => void; }) {
  const times = SunCalc.getTimes(new Date(), spot.lat, spot.lng, 0, offsetMinutes(spot.timezone));
  return <article className="planner-spot"><div><span>{spot.timezone}</span><h3>{spot.name}</h3><small>{spot.lat.toFixed(3)}, {spot.lng.toFixed(3)}</small>{spot.notes&&<p>{spot.notes}</p>}</div><p><strong>Golden hour</strong><br />{localTime(times.goldenHour, spot.timezone)} – {localTime(times.sunset, spot.timezone)}</p><label className="planner-reminder"><input type="checkbox" checked={spot.reminderEnabled} onChange={(event) => onReminder(event.target.checked)} /> Remind me one hour before</label><button type="button" onClick={onRemove}>Remove spot</button></article>;
}
export function PlannerPage({ profile }: { profile: MemberProfile|null; }) {
  const ownerId = profile?.email ?? '';
  const [query, setQuery] = useState(profile?.homeLocation ?? '');
  const [results, setResults] = useState<Place[]>([]);
  const [position, setPosition] = useState<Position|null>(null);
  const [spots, setSpots] = useState<ShootSpot[]>([]);
  const [spotName, setSpotName] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (!ownerId) return;
    let mounted = true;
    void loadShootSpots(ownerId).then((loaded) => { if (mounted) setSpots(loaded); }).catch(() => { if (mounted) setMessage('Saved spots could not be loaded. Try refreshing.'); });
    return () => { mounted = false; };
  }, [ownerId]);
  const todayTimes = useMemo(() => position ? SunCalc.getTimes(new Date(), position.latitude, position.longitude, 0, offsetMinutes(position.timezone)) : null, [position]);
  const moon = useMemo(() => position ? SunCalc.getMoonIllumination(new Date()) : null, [position]);
  const moonTimes = useMemo(() => position ? SunCalc.getMoonTimes(new Date(), position.latitude, position.longitude, offsetMinutes(position.timezone)) : null, [position]);
  const searchCity = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setMessage(''); setResults([]);
    try {
      const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
      url.search = new URLSearchParams({ name: query.trim(), count: '5', language: 'en', format: 'json' }).toString();
      const response = await fetch(url);
      if (!response.ok) throw new Error('Location search is unavailable. Try current location.');
      const data = await response.json() as GeocodeResponse;
      setResults(data.results ?? []);
      if (!data.results?.length) setMessage('No places found. Try adding a country name.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not search for that place.'); }
    finally { setBusy(false); }
  };
  const selectPlace = (place: Place) => { setPosition({ name: place.name + (place.country ? ', ' + place.country : ''), latitude: place.latitude, longitude: place.longitude, timezone: place.timezone }); setSpotName(place.name); setResults([]); setMessage(''); };
  const useCurrentLocation = () => {
    if (!navigator.geolocation) { setMessage('Location is unavailable in this browser. Search for a city instead.'); return; }
    setBusy(true); setMessage('');
    navigator.geolocation.getCurrentPosition((result) => {
      const { latitude, longitude } = result.coords;
      void fetch('https://api.open-meteo.com/v1/forecast?latitude=' + latitude + '&longitude=' + longitude + '&current=temperature_2m&timezone=auto&forecast_days=1')
        .then((response) => response.ok ? response.json() as Promise<{ timezone?: string }> : Promise.reject(new Error('Timezone lookup unavailable')))
        .then((data) => setPosition({ name: 'Current location', latitude, longitude, timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' }))
        .catch(() => { setPosition({ name: 'Current location', latitude, longitude, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' }); setMessage('Using this device’s timezone because location timezone lookup failed.'); })
        .finally(() => { setSpotName('My shoot spot'); setBusy(false); });
    }, () => { setMessage('Location permission was denied. Search for a city to continue.'); setBusy(false); }, { timeout: 10000, maximumAge: 300000 });
  };
  const saveSpot = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!ownerId) { history.pushState({}, '', '/login?next=planner'); window.dispatchEvent(new PopStateEvent('popstate')); return; }
    if (!position) return;
    try { const saved = await saveShootSpot(ownerId, { name: spotName.trim(), lat: position.latitude, lng: position.longitude, timezone: position.timezone, notes: notes.trim(), reminderEnabled: false }); setSpots((current) => [saved, ...current]); setMessage('Shoot spot saved.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Could not save this spot.'); }
  };
  const removeSpot = async (spot: ShootSpot) => {
    try { await deleteShootSpot(ownerId, spot.id); setSpots((current) => current.filter((item) => item.id !== spot.id)); }
    catch { setMessage('Could not remove this shoot spot.'); }
  };
  const toggleReminder = async (spot: ShootSpot, enabled: boolean) => {
    const updated = { ...spot, reminderEnabled: enabled };
    try {
      await updateShootSpot(ownerId, updated); setSpots((current) => current.map((item) => item.id === spot.id ? updated : item));
      if (enabled) scheduleSpotReminder(spot);
    } catch { setMessage('Could not update this reminder.'); }
  };
  return <section className="planner"><p className="eyebrow">AERIS / GO MAKE A PHOTOGRAPH</p><h2>Golden Hour Planner</h2><p className="planner__lede">Find today’s changing light for a place you care about. Sun and moon times are calculated on this device.</p>
    <div className="planner-location"><form onSubmit={(event) => void searchCity(event)}><label htmlFor="planner-city">Search for a city</label><div><input id="planner-city" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="City, country" minLength={2} required /><button disabled={busy}>{busy ? 'Searching…' : 'Search'}</button></div></form><button type="button" className="planner-secondary" onClick={useCurrentLocation} disabled={busy}>Use my current location</button></div>
    {results.length > 0&&<ul className="planner-results" aria-label="Location search results">{results.map((place) => <li key={place.latitude + '-' + place.longitude}><button type="button" onClick={() => selectPlace(place)}>{place.name}{place.admin1 ? ', ' + place.admin1 : ''}{place.country ? ', ' + place.country : ''} <small>{place.timezone}</small></button></li>)}</ul>}
    {message&&<p role="status" className="planner-message">{message}</p>}
    {position&&todayTimes&&<div className="planner-current"><p className="eyebrow">TODAY AT {position.name.toUpperCase()} · {position.timezone}</p><DayTimeline position={position} /><div className="planner-events"><Event label="Sunrise" value={localTime(todayTimes.sunrise, position.timezone)} /><Event label="Morning golden hour" value={localTime(todayTimes.sunrise, position.timezone) + ' – ' + localTime(todayTimes.goldenHourEnd, position.timezone)} /><Event label="Evening golden hour" value={localTime(todayTimes.goldenHour, position.timezone) + ' – ' + localTime(todayTimes.sunset, position.timezone)} /><Event label="Blue hour" value={localTime(todayTimes.dawn, position.timezone) + ' / ' + localTime(todayTimes.dusk, position.timezone)} /><Event label="Sunset" value={localTime(todayTimes.sunset, position.timezone)} /><Event label="Solar noon" value={localTime(todayTimes.solarNoon, position.timezone)} /><Event label="Moon" value={moon ? timeLabel(moon.phase) + ' · ' + Math.round(moon.fraction * 100) + '% lit' : ''} /><Event label="Moonrise / set" value={localTime(moonTimes?.rise, position.timezone) + ' / ' + localTime(moonTimes?.set, position.timezone)} /></div><form className="planner-save" onSubmit={(event) => void saveSpot(event)}><h3>Save this shoot spot</h3><label>Spot name<input value={spotName} onChange={(event) => setSpotName(event.target.value)} required maxLength={100} /></label><label>Notes <textarea value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={1000} rows={2} /></label><button>{ownerId ? 'Save shoot spot' : 'Sign in to save spots'}</button>{!ownerId&&<small>Viewing times works without an account. Sign in to save spots.</small>}</form></div>}
    {spots.length > 0&&<section className="planner-saved"><h3>Your saved shoot spots</h3>{spots.map((spot) => <SpotTimes key={spot.id} spot={spot} onRemove={() => void removeSpot(spot)} onReminder={(enabled) => void toggleReminder(spot, enabled)} />)}</section>}
    <p className="planner-attribution">City search data: GeoNames via Open-Meteo. Astronomical times are calculated locally with SunCalc.</p>
  </section>;
}
function Event({ label, value }: { label: string; value: string; }) { return <div className="planner-event"><span>{label}</span><strong>{value}</strong></div>; }
