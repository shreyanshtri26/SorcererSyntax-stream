import { apiCache } from './cache';

const LSP_MIRRORS = [
  'https://cdn.jsdelivr.net/gh/ManuelLG92/live-sport-plugin@main',
  'https://fastly.jsdelivr.net/gh/ManuelLG92/live-sport-plugin@main',
  'https://raw.githubusercontent.com/ManuelLG92/live-sport-plugin/main'
];

const PROXY_WORKER_URL = 'https://nuvio-proxy.odedararaj456.workers.dev';
const CACHE_EXPIRY = 60 * 1000; // 60 seconds

async function fetchLspWithFallback(filename) {
  for (const baseUrl of LSP_MIRRORS) {
    try {
      const res = await fetch(`${baseUrl}/${filename}`, { cache: 'no-cache' });
      if (res.ok) {
        const data = await res.json();
        if (data) return data;
      }
    } catch (err) {
      console.warn(`LSP Mirror ${baseUrl}/${filename} failed, trying next...`);
    }
  }
  return null;
}

/**
 * Fetch catalog matches from ManuelLG92/live-sport-plugin
 */
export const fetchLiveSportPluginCatalog = async () => {
  const cacheKey = 'lsp_catalog';
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  try {
    const data = await fetchLspWithFallback('catalog.json');
    if (data && Array.isArray(data.metas)) {
      apiCache.set(cacheKey, data.metas, CACHE_EXPIRY);
      return data.metas;
    }
  } catch (err) {
    console.error('Error fetching LiveSportPlugin catalog:', err.message);
  }
  return [];
};

/**
 * Fetch CDN Events from live-sport-plugin
 */
export const fetchLiveSportPluginCdnEvents = async () => {
  const cacheKey = 'lsp_cdn_events';
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  try {
    const data = await fetchLspWithFallback('cdn_events.json');
    if (data && (Array.isArray(data.events) || Array.isArray(data))) {
      const list = Array.isArray(data.events) ? data.events : data;
      apiCache.set(cacheKey, list, CACHE_EXPIRY);
      return list;
    }
  } catch (err) {
    console.error('Error fetching LiveSportPlugin CDN events:', err.message);
  }
  return [];
};

/**
 * Fetch StreamFree / generic streams from live-sport-plugin
 */
export const fetchLiveSportPluginStreams = async () => {
  const cacheKey = 'lsp_sf_streams';
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  try {
    const data = await fetchLspWithFallback('sf_streams.json');
    if (data && Array.isArray(data.streams)) {
      apiCache.set(cacheKey, data.streams, CACHE_EXPIRY);
      return data.streams;
    }
  } catch (err) {
    console.error('Error fetching LiveSportPlugin streams:', err.message);
  }
  return [];
};

/**
 * Convert LiveSportPlugin catalog items into normalized Event format
 */
export const normalizeLspItem = (item) => {
  const name = (item.name || '').replace('🔴 LIVE: ', '').trim();
  let teamA = name;
  let teamB = '';

  if (name.includes(' vs ')) {
    const parts = name.split(' vs ');
    teamA = parts[0].trim();
    teamB = parts[1].trim();
  } else if (name.includes(' @ ')) {
    const parts = name.split(' @ ');
    teamA = parts[0].trim();
    teamB = parts[1].trim();
  } else if (name.includes(' v ')) {
    const parts = name.split(' v ');
    teamA = parts[0].trim();
    teamB = parts[1].trim();
  }

  const category = (item.genres && item.genres.length > 0 && item.genres[0] !== 'OBJECTOBJECT')
    ? item.genres[0]
    : 'Live Sports';

  // Construct streams with Cloudflare proxy if needed
  const streamId = item.id ? item.id.replace('nuvio_sport_ts_', '') : '';
  const proxiedStreamUrl = `${PROXY_WORKER_URL}/?action=streamfree&streamId=${encodeURIComponent(streamId)}&ext=.m3u8`;

  return {
    id: item.id || `lsp_${Date.now()}_${Math.random()}`,
    title: name,
    image: item.poster || item.background || '',
    cat: category,
    eventInfo: {
      teamA: teamA || name,
      teamB: teamB || '',
      teamAFlag: item.poster || '',
      teamBFlag: item.poster || '',
      eventName: name,
      isHot: '1',
      startTime: item.releaseInfo || 'LIVE NOW',
      endTime: 'LIVE'
    },
    formats: ['StreamFree HD', 'CDN Live Mirror', 'Worker Proxy'],
    decoded_channels: [
      {
        title: 'StreamFree HD (Proxy)',
        link: proxiedStreamUrl,
        api: '',
        type: '0'
      },
      {
        title: 'CDN Live Mirror',
        link: `https://streamfree.top/embed/sport/${encodeURIComponent(streamId)}`,
        api: '',
        type: '0'
      }
    ],
    source: 'live-sport-plugin'
  };
};
