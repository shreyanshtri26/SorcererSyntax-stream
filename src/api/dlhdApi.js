import axios from 'axios';
import { apiCache } from './cache';

// HARDCODED API KEY (Replace with your actual key if available)
const DLHD_API_KEY = 'YOUR_KEY';
const BASE_URL = 'https://dlhd.pk/daddyapi.php';
const CACHE_EXPIRY = 60 * 1000; // 60 seconds

// Curated channels to use as a fallback if the API key is not configured or if the request fails.
const FALLBACK_CHANNELS = [
  {
    channel_id: "1507",
    channel_name: "Sky Sports Main Event",
    logo_url: "https://dlhd.pk/logos/sky_sports_main_event.png"
  },
  {
    channel_id: "491",
    channel_name: "beIN SPORTS Australia 1",
    logo_url: "logos/bein_sports_australia_1.png"
  },
  {
    channel_id: "648",
    channel_name: "Boomerang",
    logo_url: "https://cdn.example.com/logos/boomerang.png"
  },
  {
    channel_id: "401",
    channel_name: "TVO CA",
    logo_url: "logos/tvo_ca.svg"
  },
  {
    channel_id: "302",
    channel_name: "BBC One UK",
    logo_url: "logos/bbc_one.png"
  },
  {
    channel_id: "277",
    channel_name: "TNT Sports 1",
    logo_url: "logos/tnt_sports_1.png"
  },
  {
    channel_id: "261",
    channel_name: "BBFeed 1",
    logo_url: "logos/bbfeed_1.png"
  },
  // ── New Premium Sports Channels ──────────────────────────────────────
  {
    channel_id: "54",
    channel_name: "Sky Sports Action",
    logo_url: "https://dlhd.pk/logos/sky_sports_action.png"
  },
  {
    channel_id: "00",
    channel_name: "Sports Live HD",
    logo_url: "https://dlhd.pk/logos/sports_live.png"
  },
  {
    channel_id: "60",
    channel_name: "Sky Sports Golf",
    logo_url: "https://dlhd.pk/logos/sky_sports_golf.png"
  },
  {
    channel_id: "346",
    channel_name: "beIN Sports 1",
    logo_url: "https://dlhd.pk/logos/bein_sports_1.png"
  },
  {
    channel_id: "370",
    channel_name: "beIN Sports 2",
    logo_url: "https://dlhd.pk/logos/bein_sports_2.png"
  },
  {
    channel_id: "417",
    channel_name: "ESPN Sports HD",
    logo_url: "https://dlhd.pk/logos/espn.png"
  },
  {
    channel_id: "34",
    channel_name: "Sky Sports Football",
    logo_url: "https://dlhd.pk/logos/sky_sports_football.png"
  },
  {
    channel_id: "416",
    channel_name: "ESPN 2",
    logo_url: "https://dlhd.pk/logos/espn2.png"
  },
  {
    channel_id: "38",
    channel_name: "Sky Sports F1",
    logo_url: "https://dlhd.pk/logos/sky_sports_f1.png"
  },
  {
    channel_id: "588",
    channel_name: "Sports Extra HD",
    logo_url: "https://dlhd.pk/logos/sports_extra.png"
  },
  {
    channel_id: "369",
    channel_name: "beIN Sports 3",
    logo_url: "https://dlhd.pk/logos/bein_sports_3.png"
  },
  {
    channel_id: "65",
    channel_name: "Sky Sports Arena",
    logo_url: "https://dlhd.pk/logos/sky_sports_arena.png"
  },
  {
    channel_id: "5026",
    channel_name: "Premium Live 1",
    logo_url: "https://dlhd.pk/logos/premium_live_1.png"
  },
  {
    channel_id: "5022",
    channel_name: "Cast Stream 5022",
    logo_url: "https://dlhd.pk/logos/cast_5022.png",
    iframeUrl: "https://dlhd.pk/cast/stream-5022.php"
  },
  {
    channel_id: "5065",
    channel_name: "Premium Live 2",
    logo_url: "https://dlhd.pk/logos/premium_live_2.png"
  },
  {
    channel_id: "5061",
    channel_name: "Cast Stream 5061",
    logo_url: "https://dlhd.pk/logos/cast_5061.png",
    iframeUrl: "https://dlhd.pk/cast/stream-5061.php"
  },

  // ── User Added Channels ───────────────────────────────────────────────
  {
    channel_id: "willow_cricket_custom",
    channel_name: "Willow Cricket",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Willow_TV_logo.svg/1200px-Willow_TV_logo.svg.png",
    iframeUrl: "https://embed.st/embed/admin/admin-willow-cricket/1"
  },
  {
    channel_id: "premium_custom_stream",
    channel_name: "Premium Stream HD",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Video-icon.svg/240px-Video-icon.svg.png",
    hlsUrls: [
      "https://lb8.strmd.st/secure/cNEeqMNTSHgNdUmQCYSLTsMWdCmTqeKG/rtmp/stream/SGUXAdo5nuj90EH7mPUHOe9hbAvTl0yQZPsRJDUqg5S5vXewNNELJa3la3bfWoBCFxaWmjYstw/1/playlist.m3u8"
    ]
  }
];

// Helper to normalize logo URL
export const getDlhdLogoUrl = (logoUrl) => {
  if (!logoUrl) return null;
  if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
    return logoUrl;
  }
  return `https://dlhd.pk/${logoUrl}`;
};

export const fetchDlhdChannels = async () => {
  const cacheKey = 'dlhd_channels';
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  let baseChannels = [];

  if (!DLHD_API_KEY || DLHD_API_KEY === 'YOUR_KEY') {
    console.warn('DLHD API Key not configured. Using fallback channels.');
    baseChannels = [...FALLBACK_CHANNELS];
  } else {
    try {
      const response = await axios.get(`${BASE_URL}?key=${DLHD_API_KEY}&endpoint=channels`, { timeout: 8000 });
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        baseChannels = response.data.data;
      } else {
        baseChannels = [...FALLBACK_CHANNELS];
      }
    } catch (error) {
      console.error('Error fetching DLHD channels, using fallback:', error);
      baseChannels = [...FALLBACK_CHANNELS];
    }
  }

  // Fetch dynamic channels from CinemaOS
  try {
    const cinemaRes = await axios.get('https://cinemaos.live/api/channels', { timeout: 8000 });
    if (cinemaRes.data && Array.isArray(cinemaRes.data.channels)) {
      const cinemaChannels = cinemaRes.data.channels
        .filter(c => c.playable)
        .map(c => ({
          channel_id: c.id,
          channel_name: c.name,
          logo_url: c.logo_url,
          // Guessing standard embed format based on the previous willow cricket example
          iframeUrl: `https://embed.st/embed/admin/${c.id}/1`
        }));
      baseChannels = [...baseChannels, ...cinemaChannels];
      console.log(`Loaded ${cinemaChannels.length} additional channels from CinemaOS.`);
    }
  } catch (error) {
    console.error('Error fetching CinemaOS channels:', error);
  }

  apiCache.set(cacheKey, baseChannels, CACHE_EXPIRY);
  return baseChannels;
};

const FALLBACK_SCHEDULE = {
  "Today": {
    "Football": [
      {
        time: "15:00",
        event: "Manchester United vs Liverpool",
        channels: [
          { channel_name: "Sky Sports Main Event", channel_id: "1507", logo_url: "https://dlhd.pk/logos/sky_sports_main_event.png" }
        ],
        channels2: []
      },
      {
        time: "20:00",
        event: "Real Madrid vs Barcelona",
        channels: [
          { channel_name: "TNT Sports 1", channel_id: "277", logo_url: "logos/tnt_sports_1.png" }
        ],
        channels2: []
      }
    ],
    "Basketball": [
      {
        time: "19:30",
        event: "Boston Celtics vs Dallas Mavericks",
        channels: [
          { channel_name: "beIN SPORTS Australia 1", channel_id: "491", logo_url: "logos/bein_sports_australia_1.png" }
        ],
        channels2: []
      }
    ]
  },
  "Tomorrow": {
    "Tennis": [
      {
        time: "13:00",
        event: "Wimbledon - Quarter Finals",
        channels: [
          { channel_name: "BBC One UK", channel_id: "302", logo_url: "logos/bbc_one.png" }
        ],
        channels2: []
      }
    ],
    "Motorsport": [
      {
        time: "14:00",
        event: "Formula 1 - British Grand Prix",
        channels: [
          { channel_name: "Sky Sports Main Event", channel_id: "1507", logo_url: "https://dlhd.pk/logos/sky_sports_main_event.png" }
        ],
        channels2: []
      }
    ]
  }
};

export const fetchDlhdSchedule = async () => {
  const cacheKey = 'dlhd_schedule';
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  if (!DLHD_API_KEY || DLHD_API_KEY === 'YOUR_KEY') {
    return FALLBACK_SCHEDULE;
  }

  try {
    const response = await axios.get(`${BASE_URL}?key=${DLHD_API_KEY}&endpoint=schedule`, { timeout: 8000 });
    if (response.data && response.data.success) {
      apiCache.set(cacheKey, response.data.data, CACHE_EXPIRY);
      return response.data.data;
    }
    return FALLBACK_SCHEDULE;
  } catch (error) {
    console.error('Error fetching DLHD schedule:', error);
    return FALLBACK_SCHEDULE;
  }
};
