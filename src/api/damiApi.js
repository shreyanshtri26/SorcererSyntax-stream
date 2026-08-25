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
        id: "premier/fallback/1",
        name: "Premier League: Match of the Day",
        poster: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=60",
        starts_at: Math.floor(Date.now() / 1000) - 3600,
        ends_at: Math.floor(Date.now() / 1000) + 3600,
        category_name: "football",
        status: "live",
        league: "Premier League",
        teams: { home: { name: "Home" }, away: { name: "Away" } },
        viewers: 1250,
        sources: [{ source: "cinemaos", id: "s1", name: "Server 1", embed: "https://embed.st/embed/admin/admin-willow-cricket/1" }],
        iframe: "https://embed.st/embed/admin/admin-willow-cricket/1",
        embed: "https://embed.st/embed/admin/admin-willow-cricket/1"
      }
    ]
  }
];

export const fetchDamiStreams = async () => {
  const cacheKey = 'dami_streams';
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  let damiResult = [...FALLBACK_STREAMS];

  try {
    const response = await axios.get(BASE_URL, { timeout: 5000 });
    if (response.data && response.data.success && Array.isArray(response.data.streams)) {
      damiResult = response.data.streams;
    }
  } catch (error) {
    console.warn('DAMITV is offline or unreachable, using fallback streams.');
  }

  try {
    const [streamedPkMatches, watchfootyMatches] = await Promise.allSettled([
      fetchStreamedPkMatches(),
      fetchWatchfootyMatches()
    ]);
    // Optionally merge them into damiResult here if they succeed.
  } catch (error) {
    console.error('Error fetching secondary providers:', error.message);
  }

  // Fetch CinemaOS Events
  try {
    const sportsRes = await axios.get('https://cinemaos.live/api/sports?path=sports', { timeout: 5000 });
    let endpoints = ['https://cinemaos.live/api/sports?path=matches%2Flive%2Fpopular'];
    if (sportsRes.data && Array.isArray(sportsRes.data)) {
      sportsRes.data.forEach(sport => endpoints.push(`https://cinemaos.live/api/sports?path=matches%2F${sport.id}%2Fpopular`));
    }

    const responses = await Promise.all(endpoints.map(url => axios.get(url, { timeout: 8000 }).catch(() => null)));
    const processedMatchIds = new Set();
    
    responses.forEach(res => {
      if (res && res.data && Array.isArray(res.data)) {
        res.data.forEach(match => {
          if (processedMatchIds.has(match.id)) return;
          processedMatchIds.add(match.id);
          
          const cat = match.category || 'other';
          let group = damiResult.find(g => g.category.toLowerCase() === cat.toLowerCase());
          if (!group) {
            group = { category: cat, id: cat, streams: [] };
            damiResult.push(group);
          }
          
          const nowSecs = Math.floor(Date.now() / 1000);
          const startsAt = match.date ? Math.floor(match.date / 1000) : nowSecs;
          let status = (startsAt <= nowSecs && nowSecs <= startsAt + 7200) ? 'live' : 'upcoming';
          
          const sources = (match.sources || []).map(src => ({
            source: src.source,
            id: src.id,
            name: `${src.source.toUpperCase()} Server`,
            embed: `https://embed.st/embed/${src.source}/${src.id}/1`
          }));
          
          if (sources.length === 0) {
             sources.push({ source: 'cinemaos', id: match.id, name: 'Main Server', embed: `https://embed.st/embed/admin/${match.id}/1` });
          }

          group.streams.push({
            id: match.id,
            name: match.title,
            poster: 'https://images.unsplash.com/photo-1540747737956-fd63f8df16dd?w=500&q=80',
            starts_at: startsAt,
            ends_at: startsAt + 10800,
            category_name: cat,
            status: status,
            league: "Live Match",
            teams: match.teams || { home: { name: "Home" }, away: { name: "Away" } },
            viewers: match.viewers || 500,
            sources: sources,
            iframe: sources[0].embed,
            embed: sources[0].embed
          });
        });
      }
    });
  } catch (error) {
    console.warn('Error fetching CinemaOS matches:', error.message);
  }

  apiCache.set(cacheKey, damiResult, CACHE_EXPIRY);
  return damiResult;
};
