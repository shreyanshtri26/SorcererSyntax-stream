import { apiCache } from './cache';

const STREAMED_BASE_URL = 'https://streamed.pk';
const PROXY_URL = 'https://nuvio-proxy.odedararaj456.workers.dev';
const CACHE_EXPIRY = 60 * 1000; // 1 minute

/**
 * Fetch matches from Streamed.pk with CORS proxy failover
 */
export const fetchStreamedMatches = async () => {
  const cacheKey = 'streamed_pk_matches';
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  const endpoints = [
    `${STREAMED_BASE_URL}/api/matches/live`,
    `${STREAMED_BASE_URL}/api/matches/all-today`,
    `${PROXY_URL}/?action=streamed&endpoint=matches/live`,
    `${PROXY_URL}/?action=streamed&endpoint=matches/all-today`
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          apiCache.set(cacheKey, data, CACHE_EXPIRY);
          return data;
        }
      }
    } catch (err) {
      console.warn(`[Streamed.pk] Fetch failed on ${url}:`, err.message);
    }
  }

  return [];
};

/**
 * Fetch streams for a specific match source (or construct direct embed.st links)
 * @param {string} source - e.g. "admin", "alpha", "bravo"
 * @param {string} id - e.g. "ppv-sabah-fk-vs-hapoel-be-er"
 */
export const fetchStreamedMatchStreams = async (source, id) => {
  if (!source || !id) return [];
  const cacheKey = `streamed_pk_stream_${source}_${id}`;
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  const directEmbedUrl1 = `https://embed.st/embed/${source}/${id}/1`;
  const directEmbedUrl2 = `https://embed.st/embed/${source}/${id}/2`;

  const fallbackStreams = [
    {
      id: `stream_${source}_${id}_1`,
      title: `Embed.st Stream 1 (${source.toUpperCase()})`,
      link: directEmbedUrl1,
      embedUrl: directEmbedUrl1,
      source: source,
      hd: true,
      type: '0'
    },
    {
      id: `stream_${source}_${id}_2`,
      title: `Embed.st Stream 2 (${source.toUpperCase()})`,
      link: directEmbedUrl2,
      embedUrl: directEmbedUrl2,
      source: source,
      hd: true,
      type: '0'
    }
  ];

  try {
    const res = await fetch(`${STREAMED_BASE_URL}/api/stream/${source}/${id}`, { cache: 'no-cache' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const formatted = data.map((st, idx) => ({
          id: st.id || `stream_${source}_${id}_${idx + 1}`,
          title: `Embed.st Stream ${st.streamNo || idx + 1} (${st.language || 'HD'})`,
          link: st.embedUrl || `https://embed.st/embed/${source}/${id}/${st.streamNo || idx + 1}`,
          embedUrl: st.embedUrl || `https://embed.st/embed/${source}/${id}/${st.streamNo || idx + 1}`,
          source: st.source || source,
          hd: !!st.hd,
          type: '0'
        }));
        apiCache.set(cacheKey, formatted, CACHE_EXPIRY);
        return formatted;
      }
    }
  } catch (err) {
    console.warn(`[Streamed.pk] Stream API fetch failed for ${source}/${id}, using direct embed.st partner link:`, err.message);
  }

  apiCache.set(cacheKey, fallbackStreams, CACHE_EXPIRY);
  return fallbackStreams;
};

/**
 * Normalize a Streamed.pk match into the standard LiveEvent format
 */
export const normalizeStreamedMatch = (match) => {
  const title = match.title || 'Live Match';
  let teamA = title;
  let teamB = '';

  if (title.includes(' vs ')) {
    const p = title.split(' vs ');
    teamA = p[0].trim();
    teamB = p[1].trim();
  } else if (title.includes(' - ')) {
    const p = title.split(' - ');
    teamA = p[0].trim();
    teamB = p[1].trim();
  }

  let posterUrl = match.poster || '';
  if (posterUrl && posterUrl.startsWith('/')) {
    posterUrl = `${STREAMED_BASE_URL}${posterUrl}`;
  }

  const sources = match.sources || [];
  const decodedChannels = [];

  sources.forEach((src) => {
    const sName = src.source || 'admin';
    const sId = src.id || match.id;
    decodedChannels.push({
      title: `Embed.st HD 1 (${sName.toUpperCase()})`,
      link: `https://embed.st/embed/${sName}/${sId}/1`,
      embedUrl: `https://embed.st/embed/${sName}/${sId}/1`,
      type: '0',
      api: ''
    });
    decodedChannels.push({
      title: `Embed.st HD 2 (${sName.toUpperCase()})`,
      link: `https://embed.st/embed/${sName}/${sId}/2`,
      embedUrl: `https://embed.st/embed/${sName}/${sId}/2`,
      type: '0',
      api: ''
    });
  });

  return {
    id: `streamed_${match.id || Date.now()}`,
    title: title,
    image: posterUrl,
    cat: (match.category || 'Live Sports').toUpperCase(),
    eventInfo: {
      teamA: teamA || title,
      teamB: teamB || '',
      teamAFlag: posterUrl,
      teamBFlag: posterUrl,
      eventName: title,
      isHot: match.popular ? '1' : '0',
      startTime: match.date ? new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'LIVE NOW',
      endTime: 'LIVE'
    },
    formats: decodedChannels.map(c => c.title),
    decoded_channels: decodedChannels,
    sources: sources,
    source: 'streamed.pk'
  };
};
