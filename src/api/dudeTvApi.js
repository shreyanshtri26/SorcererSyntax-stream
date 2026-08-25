import { apiCache } from './cache';
import { fetchLiveSportPluginCatalog, normalizeLspItem } from './liveSportPluginApi';
import { fetchStreamedMatches, normalizeStreamedMatch } from './streamedPkApi';
import { RAJHODEDARA_ALL_CHANNELS } from './rajhodedaraPluginApi';
import { fetchNarlyTvChannels, fetchNarlyTvEvents } from './narlyTvApi';
import { fetchTimStreamsLiveEvents, fetchTimStreamsChannels } from './timStreamsApi';
import {
  FALLBACK_CATEGORIES,
  FALLBACK_SPORTS,
  FALLBACK_EVENTS,
  FALLBACK_CHANNEL_STREAMS
} from './dudeTvFallbackData';

const DUDETV_MIRRORS = [
  'https://cdn.jsdelivr.net/gh/mdjamsad9/dudetvapi@main/public_decrypted',
  'https://fastly.jsdelivr.net/gh/mdjamsad9/dudetvapi@main/public_decrypted',
  'https://raw.githubusercontent.com/mdjamsad9/dudetvapi/main/public_decrypted',
  'https://mdjamsad9.github.io/dudetvapi/public_decrypted'
];

const CACHE_EXPIRY = 60 * 1000; // 1 minute cache

/**
 * Universal fetcher with automatic fallback across multiple global CDNs
 */
async function fetchWithFallback(path) {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  for (const baseUrl of DUDETV_MIRRORS) {
    try {
      const url = cleanPath.startsWith('http') ? cleanPath : `${baseUrl}/${cleanPath}`;
      const res = await fetch(url, { cache: 'no-cache' });
      if (res.ok) {
        const text = await res.text();
        try {
          const json = JSON.parse(text);
          if (json) return json;
        } catch (e) {
          // If response is M3U or text
          if (text) return text;
        }
      }
    } catch (err) {
      console.warn(`Mirror [${baseUrl}/${cleanPath}] failed:`, err.message);
    }
  }

  return null;
}

import { CDX_USA_WORLD_CHANNELS, fetchCdxSportsByRegion, fetchCdxChannels } from './cdxChannelsCatalog';

const VALID_DUDE_CATEGORIES = [
  { id: "cdx_usa", title: "USA Specific HD (CDX)", image: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Flag_of_the_United_States.svg/320px-Flag_of_the_United_States.svg.png", catLink: "cdx_usa" },
  { id: "2", title: "Sports", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Soccer_ball.svg/512px-Soccer_ball.svg.png", catLink: "cats/sports.json" },
  { id: "3", title: "Bangla", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Flag_of_Bangladesh.svg/320px-Flag_of_Bangladesh.svg.png", catLink: "cats/bangla.json" },
  { id: "4", title: "Kolkata", image: "https://static.wikia.nocookie.net/logopedia/images/9/92/Kolkata_TV.svg/revision/latest/scale-to-width-down/220?cb=20200609063455", catLink: "cats/kolkata.json" },
  { id: "5", title: "India", image: "https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/320px-Flag_of_India.svg.png", catLink: "cats/india.json" },
  { id: "6", title: "Pakistan", image: "https://static.vecteezy.com/system/resources/previews/011/571/475/non_2x/circle-flag-of-pakistan-free-png.png", catLink: "cats/pakistan.json" },
  { id: "8", title: "Entertainment", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Sky_Sports_Main_Event_logo_2020.svg/320px-Sky_Sports_Main_Event_logo_2020.svg.png", catLink: "cats/entertainment.json" },
  { id: "10", title: "Kids", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Cartoon_Network_2010_logo.svg/320px-Cartoon_Network_2010_logo.svg.png", catLink: "cats/kids.json" },
  { id: "11", title: "Music", image: "https://cdn-icons-png.flaticon.com/512/3844/3844724.png", catLink: "cats/music.json" },
  { id: "12", title: "Information", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Discovery_Channel_wordmark.svg/320px-Discovery_Channel_wordmark.svg.png", catLink: "cats/information.json" },
  { id: "17", title: "Religion", image: "https://cdn-icons-png.flaticon.com/512/2903/2903565.png", catLink: "cats/religion.json" },
  { id: "69", title: "Arabic", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/BeIN_Sports_1_logo.svg/320px-BeIN_Sports_1_logo.svg.png", catLink: "cats/arabic.json" },
  { id: "9", title: "Cinemas", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/HBO_logo.svg/320px-HBO_logo.svg.png", catLink: "cats/cinemas.json" },
  { id: "7", title: "News", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/ESPN_wordmark.svg/320px-ESPN_wordmark.svg.png", catLink: "cats/news.json" },
  { id: "111", title: "Hoichoi", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Hoichoi_logo.png/320px-Hoichoi_logo.png", catLink: "cats/hoichoi.json" },
  { id: "112", title: "Chorki", image: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f6/Chorki_logo.png/320px-Chorki_logo.png", catLink: "cats/chorki.json" },
  { id: "113", title: "Netflix", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/320px-Netflix_2015_logo.svg.png", catLink: "cats/netflix.json" },
  { id: "narly_all", title: "NarlyTV Global", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Sky_Sports_Main_Event_logo_2020.svg/320px-Sky_Sports_Main_Event_logo_2020.svg.png", catLink: "narly_all" }
];

/**
 * Fetch all categories from DudeTV API, filtering out dead 404 links
 */
export const fetchDudeCategories = async () => {
  const cacheKey = 'dudetv_categories_clean_v3';
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  apiCache.set(cacheKey, VALID_DUDE_CATEGORIES, CACHE_EXPIRY * 10);
  return VALID_DUDE_CATEGORIES;
};

/**
 * Fetch items from a specific category link (e.g. cdx_usa, cats/sports.json, cats/india.json, or narly_all)
 */
export const fetchDudeCategoryItems = async (catLink) => {
  if (!catLink) return [];
  const cacheKey = `dudetv_cat_${catLink}`;
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  if (catLink === 'cdx_usa') {
    apiCache.set(cacheKey, CDX_USA_WORLD_CHANNELS, CACHE_EXPIRY * 10);
    return CDX_USA_WORLD_CHANNELS;
  }

  if (catLink === 'narly_all') {
    const narlyChannels = await fetchNarlyTvChannels();
    apiCache.set(cacheKey, narlyChannels, CACHE_EXPIRY * 5);
    return narlyChannels;
  }

  const data = await fetchWithFallback(catLink);
  if (Array.isArray(data) && data.length > 0) {
    let result = [...data];

    // If it's India category, ensure Sony SAB HD has dedicated streams attached
    if (catLink.includes('india')) {
      result.forEach(item => {
        if (String(item.id) === '81' || (item.title || '').toLowerCase().includes('sony sab')) {
          item.decoded_channels = FALLBACK_CHANNEL_STREAMS['81'];
        }
      });
    }

    // If USA category, merge CDX USA Channels
    if (catLink.includes('usa')) {
      const usaCdx = CDX_USA_WORLD_CHANNELS.filter(c => c.flag === 'us' || c.category === 'USA Entertainment');
      for (const item of usaCdx) {
        if (!result.some(r => (r.title || '').toLowerCase() === item.title.toLowerCase())) {
          result.push(item);
        }
      }
    }

    // If Entertainment category, merge CDX Entertainment
    if (catLink.includes('entertainment')) {
      const entCdx = CDX_USA_WORLD_CHANNELS.filter(c => c.category === 'USA Entertainment');
      for (const item of entCdx) {
        if (!result.some(r => (r.title || '').toLowerCase() === item.title.toLowerCase())) {
          result.push(item);
        }
      }
    }

    // If Cinemas category, merge CDX Movies
    if (catLink.includes('cinemas')) {
      const movieCdx = CDX_USA_WORLD_CHANNELS.filter(c => c.category === 'Premium Movies');
      for (const item of movieCdx) {
        if (!result.some(r => (r.title || '').toLowerCase() === item.title.toLowerCase())) {
          result.push(item);
        }
      }
    }

    apiCache.set(cacheKey, result, CACHE_EXPIRY);
    return result;
  }
  
  // Handle M3U content if returned as text
  if (typeof data === 'string' && data.includes('#EXTM3U')) {
    const parsed = parseM3U(data);
    apiCache.set(cacheKey, parsed, CACHE_EXPIRY);
    return parsed;
  }

  return [];
};

/**
 * Helper to parse M3U format text into structured channel objects
 */
function parseM3U(m3uText) {
  const lines = m3uText.split('\n');
  const items = [];
  let currentItem = null;

  for (let line of lines) {
    line = line.trim();
    if (line.startsWith('#EXTINF:')) {
      const titleMatch = line.match(/,(.+)$/);
      const logoMatch = line.match(/tvg-logo="([^"]+)"/i);
      const groupMatch = line.match(/group-title="([^"]+)"/i);
      currentItem = {
        id: `m3u_${items.length + 1}`,
        title: titleMatch ? titleMatch[1].trim() : `Channel ${items.length + 1}`,
        image: logoMatch ? logoMatch[1] : '',
        cat: groupMatch ? groupMatch[1] : 'Live TV',
        formats: [],
        formatsNew: []
      };
    } else if (line && !line.startsWith('#') && currentItem) {
      currentItem.streamUrl = line;
      currentItem.formats = [currentItem.title];
      currentItem.formatsNew = [{ title: currentItem.title, logo: currentItem.image }];
      currentItem.decoded_channels = [{
        title: currentItem.title,
        link: line,
        api: '',
        type: line.includes('.mpd') ? '1' : '0'
      }];
      items.push(currentItem);
      currentItem = null;
    }
  }
  return items;
}

/**
 * Fetch all sports channels combining Raj Hodedara plugin, NarlyTV M3U8, and DudeTV
 */
export const fetchDudeSports = async () => {
  const cacheKey = 'dudetv_sports_unified';
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  const [dudeRes, narlyRes] = await Promise.allSettled([
    fetchWithFallback('sports.json'),
    fetchNarlyTvChannels()
  ]);

  // Start with CDX Sports channels (106 global sports channels from master catalog)
  const cdxSports = fetchCdxSportsByRegion('all');
  let combined = [...cdxSports];

  // Add Raj Hodedara Indian channels
  for (const item of RAJHODEDARA_ALL_CHANNELS) {
    const alreadyExists = combined.some(c => (c.title || '').toLowerCase() === (item.title || '').toLowerCase() || (c.slug || '').toLowerCase() === (item.id || '').toLowerCase());
    if (!alreadyExists) {
      combined.push(item);
    }
  }

  // 1. Add NarlyTV sports channels (strictly sports networks only)
  if (narlyRes.status === 'fulfilled' && Array.isArray(narlyRes.value)) {
    const isGeneralTv = (title = '', cat = '') => {
      const t = title.toLowerCase();
      const nonSports = [
        'abc', 'a&e', 'adult swim', 'amc', 'bravo', 'cbs', 'nbc', 'cw', 'fx', 'tlc',
        'cartoon network', 'disney', 'nickelodeon', 'hbo', 'cinemax', 'showtime', 'starz',
        'paramount', 'food network', 'hgtv', 'history', 'animal planet', 'discovery channel',
        'hallmark', 'lifetime', 'comedy central', 'e!', 'syfy', 'usa network', 'tbs', 'tnt'
      ];
      return nonSports.some(ns => t === ns || t.startsWith(ns + ' ') || t.endsWith(' ' + ns));
    };

    const isSports = (title = '', cat = '') => {
      const t = title.toLowerCase();
      const c = cat.toLowerCase();
      const sportsKeywords = [
        'sport', 'sports', 'espn', 'ten', 'star sports', 'sports18', 'willow', 'fancode',
        'sky sports', 'tnt sports', 'bein', 'ssc', 'dazn', 'supersport', 'golf', 'tennis',
        'cricket', 'football', 'f1', 'formula', 'nfl', 'nba', 'nhl', 'mlb', 'motogp',
        'racing', 'fight', 'ufc', 'wwe', 'boxing', 'altitude sports', 'acc network', 'big ten',
        'cbs sports', 'fox sports', 'sec network', 'red bull tv', 'fanatiz', 'mavtv'
      ];
      return sportsKeywords.some(sk => t.includes(sk) || c.includes(sk));
    };

    const narlySports = narlyRes.value.filter(ch => {
      const title = ch.title || '';
      const cat = ch.cat || '';
      return isSports(title, cat) && !isGeneralTv(title, cat);
    });

    for (const item of narlySports) {
      const alreadyExists = combined.some(c => (c.title || '').toLowerCase() === (item.title || '').toLowerCase());
      if (!alreadyExists) {
        combined.push({
          ...item,
          cat: 'SPORTS'
        });
      }
    }
  }

  // 2. Add DudeTV channels
  if (dudeRes.status === 'fulfilled' && Array.isArray(dudeRes.value) && dudeRes.value.length > 0) {
    for (const item of dudeRes.value) {
      const alreadyExists = combined.some(c => (c.title || '').toLowerCase() === (item.title || '').toLowerCase());
      if (!alreadyExists) {
        combined.push(item);
      }
    }
  } else {
    for (const item of FALLBACK_SPORTS) {
      const alreadyExists = combined.some(c => (c.title || '').toLowerCase() === (item.title || '').toLowerCase());
      if (!alreadyExists) {
        combined.push(item);
      }
    }
  }

  apiCache.set(cacheKey, combined, CACHE_EXPIRY);
  return combined;
};

/**
 * Fetch live events with decoded direct streams (events_with_channels.json)
 */
export const fetchDudeEventsWithChannels = async () => {
  const cacheKey = 'dudetv_events_with_channels';
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  const data = await fetchWithFallback('events_with_channels.json');
  if (Array.isArray(data) && data.length > 0) {
    apiCache.set(cacheKey, data, CACHE_EXPIRY);
    return data;
  }
  return FALLBACK_EVENTS;
};

/**
 * Fetch sports highlights (highlights.json)
 */
export const fetchDudeHighlights = async () => {
  const cacheKey = 'dudetv_highlights';
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  const data = await fetchWithFallback('highlights.json');
  if (Array.isArray(data) && data.length > 0) {
    apiCache.set(cacheKey, data, CACHE_EXPIRY);
    return data;
  }
  return [];
};

/**
 * Unified Live Events Aggregator
 * Merges DudeTV + LiveSportPlugin + Streamed.pk + NarlyTV M3U8 + TimStreams events
 */
export const fetchUnifiedLiveEvents = async () => {
  const cacheKey = 'unified_live_events';
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  const [dudeEventsRes, lspCatalogRes, streamedPkRes, narlyEventsRes, timEventsRes] = await Promise.allSettled([
    fetchDudeEventsWithChannels(),
    fetchLiveSportPluginCatalog(),
    fetchStreamedMatches(),
    fetchNarlyTvEvents(),
    fetchTimStreamsLiveEvents()
  ]);

  let combined = [];

  // 1. Add DudeTV events
  if (dudeEventsRes.status === 'fulfilled' && Array.isArray(dudeEventsRes.value)) {
    combined.push(...dudeEventsRes.value.map(ev => ({ ...ev, source: 'dudetv' })));
  }

  // 2. Add LiveSportPlugin catalog events
  if (lspCatalogRes.status === 'fulfilled' && Array.isArray(lspCatalogRes.value)) {
    const lspEvents = lspCatalogRes.value.map(normalizeLspItem);
    for (const item of lspEvents) {
      const alreadyExists = combined.some(existing => {
        const name1 = (existing.eventInfo?.eventName || existing.title || '').toLowerCase();
        const name2 = (item.eventInfo?.eventName || item.title || '').toLowerCase();
        return name1 && name2 && (name1.includes(name2) || name2.includes(name1));
      });

      if (!alreadyExists) {
        combined.push(item);
      }
    }
  }

  // 3. Add Streamed.pk & Embed.st matches
  if (streamedPkRes.status === 'fulfilled' && Array.isArray(streamedPkRes.value)) {
    const streamedEvents = streamedPkRes.value.map(normalizeStreamedMatch);
    for (const item of streamedEvents) {
      const existingMatch = combined.find(existing => {
        const name1 = (existing.eventInfo?.eventName || existing.title || '').toLowerCase();
        const name2 = (item.eventInfo?.eventName || item.title || '').toLowerCase();
        return name1 && name2 && (name1.includes(name2) || name2.includes(name1));
      });

      if (existingMatch) {
        const currentDecoded = existingMatch.decoded_channels || [];
        const extraStreams = item.decoded_channels || [];
        extraStreams.forEach(ex => {
          if (!currentDecoded.some(c => c.link === ex.link)) {
            currentDecoded.push(ex);
          }
        });
        existingMatch.decoded_channels = currentDecoded;
        existingMatch.formats = currentDecoded.map(c => c.title);
      } else {
        combined.push(item);
      }
    }
  }

  // 4. Add NarlyTV live M3U8 sports events
  if (narlyEventsRes.status === 'fulfilled' && Array.isArray(narlyEventsRes.value)) {
    for (const item of narlyEventsRes.value) {
      const existingMatch = combined.find(existing => {
        const name1 = (existing.eventInfo?.eventName || existing.title || '').toLowerCase();
        const name2 = (item.eventInfo?.eventName || item.title || '').toLowerCase();
        return name1 && name2 && (name1.includes(name2) || name2.includes(name1));
      });

      if (existingMatch) {
        const currentDecoded = existingMatch.decoded_channels || [];
        const extraStreams = item.decoded_channels || [];
        extraStreams.forEach(ex => {
          if (!currentDecoded.some(c => c.link === ex.link)) {
            currentDecoded.push(ex);
          }
        });
        existingMatch.decoded_channels = currentDecoded;
        existingMatch.formats = currentDecoded.map(c => c.title);
      } else {
        combined.push(item);
      }
    }
  }

  // 5. Add TimStreams live events
  if (timEventsRes.status === 'fulfilled' && Array.isArray(timEventsRes.value)) {
    for (const item of timEventsRes.value) {
      const existingMatch = combined.find(existing => {
        const name1 = (existing.eventInfo?.eventName || existing.title || '').toLowerCase();
        const name2 = (item.eventInfo?.eventName || item.title || '').toLowerCase();
        return name1 && name2 && (name1.includes(name2) || name2.includes(name1));
      });

      if (existingMatch) {
        const currentDecoded = existingMatch.decoded_channels || [];
        const extraStreams = item.decoded_channels || [];
        extraStreams.forEach(ex => {
          if (!currentDecoded.some(c => c.link === ex.link)) {
            currentDecoded.push(ex);
          }
        });
        existingMatch.decoded_channels = currentDecoded;
        existingMatch.formats = currentDecoded.map(c => c.title);
      } else {
        combined.push(item);
      }
    }
  }

  if (combined.length === 0) {
    combined = [...FALLBACK_EVENTS];
  }

  apiCache.set(cacheKey, combined, CACHE_EXPIRY);
  return combined;
};

/**
 * Fetch individual channel decrypted streams by channel id (channels/{id}.json)
 */
export const fetchDudeChannelStreams = async (channelId, title = '') => {
  if (!channelId) return [];
  const cacheKey = `dudetv_channel_streams_${channelId}`;
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  const data = await fetchWithFallback(`channels/${channelId}.json`);
  if (Array.isArray(data) && data.length > 0) {
    apiCache.set(cacheKey, data, CACHE_EXPIRY);
    return data;
  }

  // Check fallback dictionary by ID or by title
  const idKey = String(channelId);
  const titleKey = (title || '').toLowerCase().trim();
  if (FALLBACK_CHANNEL_STREAMS[idKey]) {
    return FALLBACK_CHANNEL_STREAMS[idKey];
  }
  if (titleKey && FALLBACK_CHANNEL_STREAMS[titleKey]) {
    return FALLBACK_CHANNEL_STREAMS[titleKey];
  }

  return [];
};
