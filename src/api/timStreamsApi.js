import { apiCache } from './cache';

const FIREBASE_RTDB_URL = 'https://cloudstreampluginhelper-default-rtdb.firebaseio.com/.json';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch dynamic live provider domains from Firebase Realtime Database
 * (Mirrors FirebaseDomainHelper.kt from KSHITIJ8473/raghav)
 */
export const fetchFirebaseDomains = async () => {
  const cacheKey = 'firebase_live_domains';
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(FIREBASE_RTDB_URL, { cache: 'no-cache' });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        apiCache.set(cacheKey, data, CACHE_TTL_MS);
        return data;
      }
    }
  } catch (err) {
    console.warn('[FirebaseDomainHelper] Failed to fetch live domains, using defaults:', err.message);
  }

  const fallback = {
    timstreams_url: 'https://timstreams.st',
    streamedpk_url: 'https://streamed.pk',
    bintv_url: 'https://www.bintv.cc',
    damitv_url: 'https://ondemand.st/'
  };

  apiCache.set(cacheKey, fallback, CACHE_TTL_MS);
  return fallback;
};

/**
 * Fetch live upcoming events from TimStreams API
 * (Mirrors TimStreamsProvider.kt fetchLiveUpcoming())
 */
export const fetchTimStreamsLiveEvents = async () => {
  const cacheKey = 'timstreams_live_events';
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  try {
    const domains = await fetchFirebaseDomains();
    const base = (domains.timstreams_url || 'https://timstreams.st').replace(/\/$/, '');
    const res = await fetch(`${base}/api/live-upcoming`, { cache: 'no-cache' });
    if (res.ok) {
      const data = await res.json();
      const events = Array.isArray(data) ? data : (data.events || []);

      const normalized = events.map((ev, idx) => {
        const title = ev.name || 'Live Event';
        let teamA = title;
        let teamB = '';

        if (title.includes(' vs ')) {
          const parts = title.split(' vs ');
          teamA = parts[0].trim();
          teamB = parts[1].trim();
        } else if (title.includes(' @ ')) {
          const parts = title.split(' @ ');
          teamA = parts[0].trim();
          teamB = parts[1].trim();
        } else if (title.includes(' - ')) {
          const parts = title.split(' - ');
          teamA = parts[0].trim();
          teamB = parts[1].trim();
        }

        const streams = (ev.streams || []).map((st, sIdx) => ({
          title: st.name ? `${st.name} (Server ${sIdx + 1})` : `Server ${sIdx + 1}`,
          link: st.url || '',
          type: (st.url || '').includes('.mpd') ? '1' : '0'
        })).filter(s => !!s.link);

        return {
          id: `tim_ev_${ev.url || idx + 1}`,
          title: title,
          image: ev.logo || '',
          cat: ev.time ? `LIVE - ${ev.time}` : 'LIVE MATCH',
          eventInfo: {
            teamA,
            teamB,
            teamAFlag: ev.logo || '',
            teamBFlag: ev.logo || '',
            eventName: title,
            isHot: ev.featured ? '1' : '0',
            startTime: ev.time || 'LIVE NOW',
            endTime: 'LIVE'
          },
          formats: streams.map(s => s.title),
          decoded_channels: streams,
          source: 'TimStreams'
        };
      });

      if (normalized.length > 0) {
        apiCache.set(cacheKey, normalized, 60 * 1000);
        return normalized;
      }
    }
  } catch (err) {
    console.warn('[TimStreams] Error fetching live events:', err.message);
  }

  return [];
};

/**
 * Fetch 24/7 Live Channels from TimStreams API
 * (Mirrors TimStreamsProvider.kt fetchChannels())
 */
export const fetchTimStreamsChannels = async () => {
  const cacheKey = 'timstreams_channels';
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  try {
    const domains = await fetchFirebaseDomains();
    const base = (domains.timstreams_url || 'https://timstreams.st').replace(/\/$/, '');
    const res = await fetch(`${base}/api/channels`, { cache: 'no-cache' });
    if (res.ok) {
      const data = await res.json();
      const channels = Array.isArray(data) ? data : (data.channels || []);

      const normalized = channels.map((ch, idx) => {
        const streams = (ch.streams || []).map((st, sIdx) => ({
          title: st.name ? `${st.name} (Server ${sIdx + 1})` : `Server ${sIdx + 1}`,
          link: st.url || '',
          type: (st.url || '').includes('.mpd') ? '1' : '0'
        })).filter(s => !!s.link);

        return {
          id: `tim_ch_${ch.url || idx + 1}`,
          title: ch.name || `Channel ${idx + 1}`,
          image: ch.logo || '',
          cat: ch.flag ? ch.flag.toUpperCase() : 'WORLDWIDE TV',
          formats: streams.map(s => s.title),
          decoded_channels: streams,
          source: 'TimStreams'
        };
      });

      if (normalized.length > 0) {
        apiCache.set(cacheKey, normalized, 3 * 60 * 1000);
        return normalized;
      }
    }
  } catch (err) {
    console.warn('[TimStreams] Error fetching channels:', err.message);
  }

  return [];
};
