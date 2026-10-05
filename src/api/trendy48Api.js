import { apiCache } from './cache';

const API_BASE = 'https://trendy48.online/api';
const SITE = 'https://trendy48.online';
const CACHE_EXPIRY = 60 * 1000; // feed cache only turns over once a minute

async function get(path) {
  const cacheKey = `trendy48_${path}`;
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;
  const res = await fetch(`${API_BASE}${path}`, { credentials: 'omit' });
  if (!res.ok) return null;
  const data = await res.json();
  apiCache.set(cacheKey, data, CACHE_EXPIRY);
  return data;
}

/** Embed URL for any trendy48 or streamed.pk match id (trendy48 resolves both server-side). */
export const trendy48EventUrl = (id, source, stream) => {
  const q = new URLSearchParams();
  if (source) q.set('source', source);
  if (stream) q.set('stream', stream);
  const qs = q.toString();
  return `${SITE}/event/${encodeURIComponent(id)}${qs ? `?${qs}` : ''}`;
};

/** Board day key: Eastern time, day starts at 1am (same rule as trendy48's board). */
const etFormat = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' });
export const etDayKey = (ts = Date.now()) => etFormat.format(new Date(ts - 3600000));

/** Same-game check ported from the trendy48 board: team sides match (either order), same "(Game N)", kickoffs within 3h. */
const sidesCache = new Map();
const sides = (title) => {
  if (sidesCache.has(title)) return sidesCache.get(title);
  const result = parseSides(title);
  sidesCache.set(title, result);
  return result;
};
const parseSides = (title) => {
  let t = (title || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/['’]/g, '');
  const g = t.match(/\([^)]*\bgame\s*(\d+)[^)]*\)/);
  t = t.replace(/\([^)]*\bgame\s*\d+[^)]*\)/g, ' ');
  const p = t.split(/\s+(?:vs\.?|v\.?|@|at|-|–|—)\s+/);
  if (p.length !== 2) return null;
  const a = p[0].replace(/[^a-z0-9]+/g, ' ').trim().split(' ');
  const b = p[1].replace(/[^a-z0-9]+/g, ' ').trim().split(' ');
  if (!a[0] || !b[0]) return null;
  return { s: [a, b], game: g ? g[1] : '' };
};
// Spelling variants like "turkey"/"turkiye": shared prefix of 4+ letters, at most 2 letters differ after it
const nearSpelling = (w, v) => {
  let i = 0;
  while (i < w.length && i < v.length && w[i] === v[i]) i++;
  return i >= 4 && i >= Math.min(w.length, v.length) - 2;
};
const covers = (x, y) => {
  const [s, l] = x.length <= y.length ? [x, y] : [y, x];
  return s.every(w => l.some(v => v === w || (w.length >= 3 && v.startsWith(w)) || (v.length >= 3 && w.startsWith(v)) || nearSpelling(w, v)));
};
export const isSameGame = (titleA, startA, titleB, startB) => {
  const x = sides(titleA), y = sides(titleB);
  if (!x || !y || (x.game && y.game && x.game !== y.game)) return false;
  if (startA > 0 && startB > 0 && Math.abs(startA - startB) > 3 * 3600000) return false;
  return (covers(x.s[0], y.s[0]) && covers(x.s[1], y.s[1])) || (covers(x.s[0], y.s[1]) && covers(x.s[1], y.s[0]));
};

/** Feeds send 0 or junk (negative / 1970) for always-on rows; anything before 2001 means "no kickoff". */
export const validKickoff = (ts) => (ts > 1e12 ? ts : 0);

/**
 * Same event across sources: same underlying match id (streamed_x / trendy48_x), same game by teams,
 * or an identical title (emoji/punctuation ignored) for team-less events like "WWE Monday Night RAW".
 */
const plainCache = new Map();
const plainTitle = (t = '') => {
  if (!plainCache.has(t)) plainCache.set(t, t.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, ''));
  return plainCache.get(t);
};
export const isSameEvent = (a, b) => {
  const matchId = (id) => (/^(streamed|trendy48)_./.test(id) ? id.replace(/^(streamed|trendy48)_/, '') : null);
  const idA = matchId(String(a.id || '')), idB = matchId(String(b.id || ''));
  if (idA && idA === idB) return true;
  const titleA = a.eventInfo?.eventName || a.title, titleB = b.eventInfo?.eventName || b.title;
  if (isSameGame(titleA, a.kickoff, titleB, b.kickoff)) return true;
  const pA = plainTitle(titleA);
  if (pA.length < 10 || pA !== plainTitle(titleB)) return false;
  return !(a.kickoff > 0 && b.kickoff > 0 && Math.abs(a.kickoff - b.kickoff) > 3 * 3600000);
};

/** Convert a trendy48 match row into the app's LiveEvent shape. */
export const normalizeTrendy48Match = (m) => {
  const kickoff = validKickoff(m.date);
  const title = m.title || 'Live Match';
  const parts = title.split(/\s+(?:vs\.?|v|@|at)\s+|\s+-\s+/);
  const [teamA, teamB] = parts.length === 2 ? parts.map(s => s.trim()) : [title, ''];
  const label = m.manual ? 'Trendy48' : 'Trendy48 Feed';
  const sources = m.sources || [];
  const decoded = [{ title: `${title} (${label} HD)`, link: m.watch_url || trendy48EventUrl(m.id), type: '0', api: '' }];
  if (sources.length > 1) {
    sources.forEach(s => decoded.push({ title: `${title} (Trendy48 ${String(s.source).toUpperCase()})`, link: trendy48EventUrl(m.id, s.source), type: '0', api: '' }));
  }
  return {
    id: `trendy48_${m.id}`,
    title,
    image: '',
    cat: (m.category || 'Live Sports').toUpperCase(),
    t48Cat: m.category || '',
    dayKey: etDayKey(kickoff || Date.now()),
    kickoff,
    manual: !!m.manual,
    eventInfo: {
      teamA: teamA || title,
      teamB: teamB || '',
      eventName: title,
      isHot: m.popular ? '1' : '0',
      startTime: kickoff ? new Date(kickoff).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'LIVE 24/7',
      endTime: 'LIVE'
    },
    formats: decoded.map(c => c.title),
    decoded_channels: decoded,
    source: 'trendy48'
  };
};

/** Everything in the trendy48 cache from yesterday (ET) onwards, normalized. */
export const fetchTrendy48Matches = async () => {
  try {
    const rows = await get('/matches/all');
    if (!Array.isArray(rows)) return [];
    const yesterday = etDayKey(Date.now() - 86400000);
    return rows.filter(m => !validKickoff(m.date) || etDayKey(m.date) >= yesterday).map(normalizeTrendy48Match);
  } catch (err) {
    console.warn('[Trendy48] matches fetch failed:', err.message);
    return [];
  }
};

/** One row by id (trendy48 or streamed.pk id); null on 404 or failure. */
export const fetchTrendy48Match = async (id) => {
  try {
    return await get(`/match/${encodeURIComponent(id)}`);
  } catch {
    return null;
  }
};

/** true when the feed's warmer reports ok. */
export const fetchTrendy48Healthy = async () => {
  try {
    const res = await fetch(`${API_BASE}/health`, { credentials: 'omit' });
    return res.ok && (await res.json()).status === 'ok';
  } catch {
    return false;
  }
};
