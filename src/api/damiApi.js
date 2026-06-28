import axios from 'axios';
import { apiCache } from './cache';
import { fetchStreamedPkMatches, fetchWatchfootyMatches } from './streamProvidersApi';

const BASE_URL = 'https://dami-tv.pro/papi/api/streams';
const CACHE_EXPIRY = 60 * 1000; // 60 seconds

const FALLBACK_STREAMS = [
  {
    category: "football",
    id: 1,
    streams: [
      {
        id: "wc/2026-06-16/fra-sen",
        name: "France vs. Senegal",
        poster: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=60",
        starts_at: Math.floor(Date.now() / 1000) - 3600, // started 1 hour ago
        ends_at: Math.floor(Date.now() / 1000) + 3600,
        category_name: "football",
        status: "live",
        league: "FIFA World Cup 2026",
        teams: {
          home: { name: "France", badge: "" },
          away: { name: "Senegal", badge: "" }
        },
        viewers: 1250,
        sources: [
          { source: "hls", id: "s1", name: "Server 1", embed: "https://dami-tv.pro/embed/?id=wc/2026-06-16/fra-sen" }
        ],
        iframe: "https://dami-tv.pro/embed/?id=wc/2026-06-16/fra-sen",
        embed: "https://dami-tv.pro/embed/?id=wc/2026-06-16/fra-sen"
      },
      {
        id: "premier/2026-06-28/ars-che",
        name: "Arsenal vs. Chelsea",
        poster: "https://images.unsplash.com/photo-1540747737956-fd63f8df16dd?w=500&auto=format&fit=crop&q=60",
        starts_at: Math.floor(Date.now() / 1000) + 7200, // starting in 2 hours
        ends_at: Math.floor(Date.now() / 1000) + 14400,
        category_name: "football",
        status: "upcoming",
        league: "Premier League",
        teams: {
          home: { name: "Arsenal", badge: "" },
          away: { name: "Chelsea", badge: "" }
        },
        viewers: 0,
        sources: [
          { source: "hls", id: "s1", name: "Main Server", embed: "https://dami-tv.pro/embed/?id=premier/2026-06-28/ars-che" }
        ],
        iframe: "https://dami-tv.pro/embed/?id=premier/2026-06-28/ars-che",
        embed: "https://dami-tv.pro/embed/?id=premier/2026-06-28/ars-che"
      }
    ]
  },
  {
    category: "basketball",
    id: 2,
    streams: [
      {
        id: "nba/2026-06-28/lal-bos",
        name: "LA Lakers vs. Boston Celtics",
        poster: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&auto=format&fit=crop&q=60",
        starts_at: Math.floor(Date.now() / 1000) - 1800, // started 30 mins ago
        ends_at: Math.floor(Date.now() / 1000) + 7200,
        category_name: "basketball",
        status: "live",
        league: "NBA Playoffs",
        teams: {
          home: { name: "LA Lakers", badge: "" },
          away: { name: "Boston Celtics", badge: "" }
        },
        viewers: 3420,
        sources: [
          { source: "hls", id: "s1", name: "NBA Feed", embed: "https://dami-tv.pro/embed/?id=nba/2026-06-28/lal-bos" }
        ],
        iframe: "https://dami-tv.pro/embed/?id=nba/2026-06-28/lal-bos",
        embed: "https://dami-tv.pro/embed/?id=nba/2026-06-28/lal-bos"
      }
    ]
  }
];

export const fetchDamiStreams = async () => {
  const cacheKey = 'dami_streams';
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  let damiResult = FALLBACK_STREAMS;

  try {
    const response = await axios.get(BASE_URL, { timeout: 8000 });
    if (response.data && response.data.success && Array.isArray(response.data.streams)) {
      damiResult = response.data.streams;
    }
  } catch (error) {
    console.error('Error fetching DAMITV streams, using fallback:', error);
  }

  try {
    const [streamedPkMatches, watchfootyMatches] = await Promise.all([
      fetchStreamedPkMatches(),
      fetchWatchfootyMatches()
    ]);

    // Helper to normalize names for matching
    const normalizeName = (name) => (name || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    // Merge fallback sources into Dami streams
    damiResult = damiResult.map(group => {
      const updatedStreams = group.streams.map(stream => {
        const streamSources = [...(stream.sources || [])];
        const damiNameNorm = normalizeName(stream.name);

        // Match with Streamed.pk
        streamedPkMatches.forEach(spkMatch => {
          if (normalizeName(spkMatch.title).includes(damiNameNorm) || damiNameNorm.includes(normalizeName(spkMatch.title))) {
            (spkMatch.sources || []).forEach(src => {
              streamSources.push({
                source: 'streamed_pk',
                id: src.id,
                name: `Streamed.pk (${src.source})`,
                embed: `https://streamed.pk/embed/${src.source}/${src.id}`
              });
            });
          }
        });

        // Match with Watchfooty
        watchfootyMatches.forEach(wfMatch => {
          const wfNameNorm = normalizeName(wfMatch.title || wfMatch.name);
          if (wfNameNorm.includes(damiNameNorm) || damiNameNorm.includes(wfNameNorm)) {
            streamSources.push({
              source: 'watchfooty',
              id: wfMatch.id,
              name: 'Watchfooty Stream',
              embed: `https://watchfooty.st/embed/${wfMatch.id}`
            });
          }
        });

        return { ...stream, sources: streamSources };
      });
      return { ...group, streams: updatedStreams };
    });

  } catch (error) {
    console.error('Error merging fallback streams:', error);
  }

  apiCache.set(cacheKey, damiResult, CACHE_EXPIRY);
  return damiResult;
};
