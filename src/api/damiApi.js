
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

  // Fetch CinemaOS Events (Dynamic across all sports)
  try {
    let endpoints = ['https://cinemaos.live/api/sports?path=matches%2Flive%2Fpopular'];
    
    try {
      const sportsRes = await axios.get('https://cinemaos.live/api/sports?path=sports', { timeout: 5000 });
      if (sportsRes.data && Array.isArray(sportsRes.data)) {
        sportsRes.data.forEach(sport => {
          endpoints.push(`https://cinemaos.live/api/sports?path=matches%2F${sport.id}%2Fpopular`);
        });
      }
    } catch (e) {
      console.warn("Failed to fetch sports list, falling back to defaults", e);
      endpoints.push('https://cinemaos.live/api/sports?path=matches%2Fbasketball%2Fpopular');
      endpoints.push('https://cinemaos.live/api/sports?path=matches%2Ffootball%2Fpopular');
      endpoints.push('https://cinemaos.live/api/sports?path=matches%2Fcricket%2Fpopular');
    }

    const responses = await Promise.all(
      endpoints.map(url => axios.get(url, { timeout: 8000 }).catch(() => null))
    );
    
    const processedMatchIds = new Set();
    
    responses.forEach(res => {
      if (res && res.data && Array.isArray(res.data)) {
        res.data.forEach(match => {
          if (processedMatchIds.has(match.id)) return;
          processedMatchIds.add(match.id);

          const cat = match.category || 'other';
          
          // Find or create group
          let group = damiResult.find(g => g.category.toLowerCase() === cat.toLowerCase());
          if (!group) {
            group = { category: cat, id: cat, streams: [] };
            damiResult.push(group);
          }
          
          const nowSecs = Math.floor(Date.now() / 1000);
          const startsAt = match.date ? Math.floor(match.date / 1000) : nowSecs;
          // Determine if live based on typical match duration (e.g. 2 hours)
          let status = (startsAt <= nowSecs && nowSecs <= startsAt + 7200) ? 'live' : 'upcoming';
          
          const sources = (match.sources || []).map(src => ({
            source: src.source,
            id: src.id,
            name: `${src.source.toUpperCase()} Server`,
            embed: `https://embed.st/embed/${src.source}/${src.id}/1`
          }));
          
          if (sources.length === 0) {
             sources.push({
               source: 'cinemaos',
               id: match.id,
               name: 'Main Server',
               embed: `https://embed.st/embed/admin/${match.id}/1`
             });
          }

          // The cinemaos.live image proxy blocks connections, so we assign beautiful category-specific fallbacks
          const categoryImages = {
            basketball: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=500&q=80',
            football: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&q=80',
            'american-football': 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=500&q=80',
            hockey: 'https://images.unsplash.com/photo-1515703407324-5f753eedffde?w=500&q=80',
            baseball: 'https://images.unsplash.com/photo-1508344928928-7137b67de192?w=500&q=80',
            tennis: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=500&q=80',
            rugby: 'https://images.unsplash.com/photo-1583416750470-965b2707b355?w=500&q=80',
            cricket: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=500&q=80',
            'motor-sports': 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=500&q=80',
            fight: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=500&q=80',
            golf: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=500&q=80',
            darts: 'https://images.unsplash.com/photo-1615598685160-592b5b3a323a?w=500&q=80',
            billiards: 'https://images.unsplash.com/photo-1533630654593-b222d5d44449?w=500&q=80',
            afl: 'https://images.unsplash.com/photo-1628892408619-a1d82136e9ff?w=500&q=80',
            other: 'https://images.unsplash.com/photo-1540747737956-fd63f8df16dd?w=500&q=80'
          };
          
          let posterUrl = categoryImages[cat.toLowerCase()] || categoryImages['other'];

          group.streams.push({
            id: match.id,
            name: match.title,
            poster: posterUrl,
            starts_at: startsAt,
            ends_at: startsAt + 10800, // 3 hours
            category_name: cat,
            status: status,
            league: "CinemaOS Live",
            teams: match.teams || { home: { name: "Home" }, away: { name: "Away" } },
            viewers: match.viewers || Math.floor(Math.random() * 500) + 100,
            sources: sources,
            iframe: sources[0].embed,
            embed: sources[0].embed
          });
        });
      }
    });
  } catch (error) {
    console.error('Error fetching CinemaOS matches:', error);
  }

  // Also fetch 24/7 Channels from api/channels and add them to Sports Events
  try {
    const channelsRes = await axios.get('https://cinemaos.live/api/channels', { timeout: 5000 });
    if (channelsRes.data && Array.isArray(channelsRes.data.channels)) {
      const twentyFourSeven = channelsRes.data.channels.filter(c => c.playable && (c.name || '').toLowerCase().includes('24/7'));
      
      if (twentyFourSeven.length > 0) {
        let group = damiResult.find(g => g.category.toLowerCase() === '24/7');
        if (!group) {
          group = { category: '24/7', id: '24/7', streams: [] };
          damiResult.push(group);
        }
        
        const nowSecs = Math.floor(Date.now() / 1000);
        twentyFourSeven.forEach(ch => {
          group.streams.push({
            id: ch.id,
            name: ch.name,
            poster: ch.logo_url || 'https://images.unsplash.com/photo-1540747737956-fd63f8df16dd?w=500&q=80',
            starts_at: nowSecs - 3600,
            ends_at: nowSecs + 86400,
            category_name: '24/7',
            status: 'live',
            league: "24/7 Channels",
            teams: null,
            viewers: Math.floor(Math.random() * 500) + 100,
            sources: [{
               source: 'admin',
               id: ch.id,
               name: 'Main Server',
               embed: `https://embed.st/embed/admin/${ch.id}/1`
            }],
            iframe: `https://embed.st/embed/admin/${ch.id}/1`,
            embed: `https://embed.st/embed/admin/${ch.id}/1`
          });
        });
      }
    }
  } catch (error) {
    console.error('Error fetching 24/7 channels:', error);
  }

  apiCache.set(cacheKey, damiResult, CACHE_EXPIRY);
  return damiResult;
};
