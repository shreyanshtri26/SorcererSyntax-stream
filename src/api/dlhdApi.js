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
  // ── Unite8 Sports (HLS) ───────────────────────────────────────────────
  {
    channel_id: "unite8sports1",
    channel_name: "Unite8 Sports 1",
    logo_url: "https://upload.wikimedia.org/wikipedia/en/thumb/4/4d/Unite8_Sports_1_logo.jpg/250px-Unite8_Sports_1_logo.jpg",
    hlsUrls: [
      "https://livepk.zeeindia.com/unite8sports1/index.m3u8",
      "https://d35j504z0x2vu2.cloudfront.net/v1/master/0bc8e8376bd8417a1b6761138aa41c26c7309312/unite8-sports-1/master.m3u8",
      "https://mumt01.tangotv.in/UNITE8SPORTS1/index.m3u8",
      "https://cdn-1.pishow.tv/live/unite8sports1/master.m3u8"
    ]
  },
  {
    channel_id: "unite8sports2",
    channel_name: "Unite8 Sports 2",
    logo_url: "https://upload.wikimedia.org/wikipedia/en/thumb/4/4d/Unite8_Sports_1_logo.jpg/250px-Unite8_Sports_1_logo.jpg",
    hlsUrls: [
      "https://livepk.zeeindia.com/unite8sports2/index.m3u8",
      "https://d35j504z0x2vu2.cloudfront.net/v1/master/0bc8e8376bd8417a1b6761138aa41c26c7309312/unite8-sports-2/master.m3u8",
      "https://mumt01.tangotv.in/UNITE8SPORTS2/index.m3u8",
      "https://cdn-1.pishow.tv/live/unite8sports2/master.m3u8"
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

  if (!DLHD_API_KEY || DLHD_API_KEY === 'YOUR_KEY') {
    console.warn('DLHD API Key not configured. Using fallback channels.');
    return FALLBACK_CHANNELS;
  }

  try {
    const response = await axios.get(`${BASE_URL}?key=${DLHD_API_KEY}&endpoint=channels`, { timeout: 8000 });
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      apiCache.set(cacheKey, response.data.data, CACHE_EXPIRY);
      return response.data.data;
    }
    // If API responded but not successful, fallback
    console.warn('DLHD API endpoint returned error:', response.data);
    return FALLBACK_CHANNELS;
  } catch (error) {
    console.error('Error fetching DLHD channels, using fallback:', error);
    return FALLBACK_CHANNELS;
  }
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
