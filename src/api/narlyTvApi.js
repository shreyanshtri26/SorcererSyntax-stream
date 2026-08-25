import { apiCache } from './cache';

const NARLY_COMMIT = 'a27debc27deaf7339be7070548ab3a0d59aa664e';
const NARLY_MIRRORS = [
  `https://cdn.jsdelivr.net/gh/NarlyTV/iptv@${NARLY_COMMIT}/M3U8`,
  `https://fastly.jsdelivr.net/gh/NarlyTV/iptv@${NARLY_COMMIT}/M3U8`,
  `https://raw.githubusercontent.com/NarlyTV/iptv/${NARLY_COMMIT}/M3U8`
];

const PROXY_URL = 'https://nuvio-proxy.odedararaj456.workers.dev';
const CACHE_EXPIRY = 60 * 1000; // 1 minute

/**
 * Universal fetcher for NarlyTV M3U8 files with multi-CDN failover
 */
async function fetchNarlyFile(filename) {
  for (const base of NARLY_MIRRORS) {
    try {
      const res = await fetch(`${base}/${filename}`, { cache: 'no-cache' });
      if (res.ok) {
        const text = await res.text();
        if (text && text.includes('#EXTM3U')) {
          return text;
        }
      }
    } catch (err) {
      console.warn(`[NarlyTV] Mirror ${base}/${filename} failed, trying next...`);
    }
  }
  return null;
}

/**
 * Parse M3U8 string into rich structured channel/event objects
 */
function parseNarlyM3u(m3uText, isEvent = false) {
  if (!m3uText) return [];
  const lines = m3uText.split('\n');
  const results = [];
  let currentItem = null;
  let headers = {};

  for (let rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      const nameMatch = line.match(/tvg-name="([^"]+)"/) || line.match(/,(.+)$/);
      const logoMatch = line.match(/tvg-logo="([^"]+)"/);
      const groupMatch = line.match(/group-title="([^"]+)"/);
      const chnoMatch = line.match(/tvg-chno="([^"]+)"/);

      const title = nameMatch ? nameMatch[1].trim() : (isEvent ? 'Live Match' : 'TV Channel');
      const logo = logoMatch ? logoMatch[1].trim() : '';
      const group = groupMatch ? groupMatch[1].trim() : (isEvent ? 'Live Events' : 'Worldwide TV');
      const idStr = chnoMatch ? chnoMatch[1] : String(results.length + 1);

      currentItem = {
        id: isEvent ? `narly_ev_${idStr}` : `narly_tv_${idStr}`,
        title: title,
        image: logo,
        cat: group.toUpperCase(),
        formats: [title],
        decoded_channels: [],
        source: 'NarlyTV'
      };

      if (isEvent) {
        let teamA = title;
        let teamB = '';
        let cleanName = title.replace(/^\[.*?\]\s*/, ''); // Remove "[American Football] " prefix
        
        if (cleanName.includes(' at ')) {
          const parts = cleanName.split(' at ');
          teamA = parts[0].trim();
          teamB = parts[1].trim();
        } else if (cleanName.includes(' vs ')) {
          const parts = cleanName.split(' vs ');
          teamA = parts[0].trim();
          teamB = parts[1].trim();
        } else if (cleanName.includes(' - ')) {
          const parts = cleanName.split(' - ');
          teamA = parts[0].trim();
          teamB = parts[1].trim();
        }

        currentItem.eventInfo = {
          teamA: teamA,
          teamB: teamB,
          teamAFlag: logo,
          teamBFlag: logo,
          eventName: title,
          isHot: '1',
          startTime: 'LIVE NOW',
          endTime: 'LIVE'
        };
      }

      headers = {};
    } else if (line.startsWith('#EXTVLCOPT:')) {
      if (line.includes('http-referrer=')) headers.referer = line.split('http-referrer=')[1].trim();
      if (line.includes('http-origin=')) headers.origin = line.split('http-origin=')[1].trim();
      if (line.includes('http-user-agent=')) headers.ua = line.split('http-user-agent=')[1].trim();
    } else if (!line.startsWith('#') && currentItem) {
      const streamUrl = line;

      // 1. Direct Stream Server
      currentItem.decoded_channels.push({
        title: `${currentItem.title} (Server 1 - Direct)`,
        link: streamUrl,
        api: '',
        type: streamUrl.includes('.mpd') ? '1' : '0'
      });

      // 2. Proxied Stream Server (Bypasses Referrer / Origin blocking)
      if (headers.referer || headers.origin) {
        const proxiedUrl = `${PROXY_URL}/?action=proxy&url=${encodeURIComponent(streamUrl)}${headers.referer ? `&referer=${encodeURIComponent(headers.referer)}` : ''}${headers.origin ? `&origin=${encodeURIComponent(headers.origin)}` : ''}`;
        currentItem.decoded_channels.push({
          title: `${currentItem.title} (Server 2 - Proxy)`,
          link: proxiedUrl,
          api: '',
          type: '0'
        });
      }

      results.push(currentItem);
      currentItem = null;
    }
  }

  return results;
}

/**
 * Fetch all TV channels from NarlyTV (TV.m3u8)
 */
export const fetchNarlyTvChannels = async () => {
  const cacheKey = 'narlytv_channels_all';
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  try {
    const m3uText = await fetchNarlyFile('TV.m3u8');
    if (m3uText) {
      const parsed = parseNarlyM3u(m3uText, false);
      if (parsed.length > 0) {
        apiCache.set(cacheKey, parsed, CACHE_EXPIRY * 3);
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading NarlyTV TV.m3u8:', err.message);
  }

  return [];
};

/**
 * Fetch live matches and events from NarlyTV (events.m3u8)
 */
export const fetchNarlyTvEvents = async () => {
  const cacheKey = 'narlytv_events_all';
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  try {
    const m3uText = await fetchNarlyFile('events.m3u8');
    if (m3uText) {
      const parsed = parseNarlyM3u(m3uText, true);
      if (parsed.length > 0) {
        apiCache.set(cacheKey, parsed, CACHE_EXPIRY);
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading NarlyTV events.m3u8:', err.message);
  }

  return [];
};

/**
 * Fetch base channels from NarlyTV (base.m3u8)
 */
export const fetchNarlyTvBase = async () => {
  const cacheKey = 'narlytv_base_all';
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  try {
    const m3uText = await fetchNarlyFile('base.m3u8');
    if (m3uText) {
      const parsed = parseNarlyM3u(m3uText, false);
      if (parsed.length > 0) {
        apiCache.set(cacheKey, parsed, CACHE_EXPIRY * 3);
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading NarlyTV base.m3u8:', err.message);
  }

  return [];
};
