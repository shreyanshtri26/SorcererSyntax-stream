import axios from 'axios';
import { apiCache } from './cache';

// HARDCODED API KEY (Replace with your actual key if available)
const DLHD_API_KEY = 'YOUR_KEY';
const BASE_URL = 'https://dlhd.pk/daddyapi.php';
const CACHE_EXPIRY = 60 * 1000; // 60 seconds

const FALLBACK_CHANNELS = [
  { channel_id: "1507", channel_name: "Sky Sports Main Event", logo_url: "https://dlhd.pk/logos/sky_sports_main_event.png" },
  { channel_id: "491", channel_name: "beIN SPORTS Australia 1", logo_url: "https://dlhd.pk/logos/bein_sports_australia_1.png" },
  { channel_id: "277", channel_name: "TNT Sports 1", logo_url: "https://dlhd.pk/logos/tnt_sports_1.png" },
  { channel_id: "54", channel_name: "Sky Sports Action", logo_url: "https://dlhd.pk/logos/sky_sports_action.png" },
  { channel_id: "60", channel_name: "Sky Sports Golf", logo_url: "https://dlhd.pk/logos/sky_sports_golf.png" },
  { channel_id: "346", channel_name: "beIN Sports 1", logo_url: "https://dlhd.pk/logos/bein_sports_1.png" },
  { channel_id: "417", channel_name: "ESPN Sports HD", logo_url: "https://dlhd.pk/logos/espn.png" },
  { channel_id: "willow_cricket_custom", channel_name: "Willow Cricket", logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Willow_TV_logo.svg/1200px-Willow_TV_logo.svg.png", iframeUrl: "https://embed.st/embed/admin/admin-willow-cricket/1" }
];

export const getDlhdLogoUrl = (logoUrl) => {
  if (!logoUrl) return null;
  if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) return logoUrl;
  return `https://dlhd.pk/${logoUrl}`;
};

export const fetchDlhdChannels = async () => {
  const cacheKey = 'dlhd_channels';
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  let baseChannels = [...FALLBACK_CHANNELS];

  if (DLHD_API_KEY && DLHD_API_KEY !== 'YOUR_KEY') {
    try {
      const response = await axios.get(`${BASE_URL}?key=${DLHD_API_KEY}&endpoint=channels`, { timeout: 8000 });
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        baseChannels = response.data.data;
      }
    } catch (error) {
      console.warn('Error fetching DLHD channels, using fallback:', error.message);
    }
  }

  apiCache.set(cacheKey, baseChannels, CACHE_EXPIRY);
  return baseChannels;
};

const FALLBACK_SCHEDULE = {
  "Today": {
    "Football": [
      { time: "15:00", event: "Manchester United vs Liverpool", channels: [{ channel_name: "Sky Sports Main Event", channel_id: "1507" }] }
    ],
    "Basketball": [
      { time: "19:30", event: "Celtics vs Mavericks", channels: [{ channel_name: "beIN SPORTS Australia 1", channel_id: "491" }] }
    ]
  },
  "Tomorrow": {
    "Tennis": [
      { time: "13:00", event: "Wimbledon", channels: [{ channel_name: "BBC One UK", channel_id: "302" }] }
    ]
  }
};

export const fetchDlhdSchedule = async () => {
  const cacheKey = 'dlhd_schedule';
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  let schedule = FALLBACK_SCHEDULE;

  if (DLHD_API_KEY && DLHD_API_KEY !== 'YOUR_KEY') {
    try {
      const response = await axios.get(`${BASE_URL}?key=${DLHD_API_KEY}&endpoint=schedule`, { timeout: 8000 });
      if (response.data && response.data.success) {
        schedule = response.data.data;
      }
    } catch (error) {
      console.warn('Error fetching DLHD schedule:', error.message);
    }
  }
  
  apiCache.set(cacheKey, schedule, CACHE_EXPIRY);
  return schedule;
};
