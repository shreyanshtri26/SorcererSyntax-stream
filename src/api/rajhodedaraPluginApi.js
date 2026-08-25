import { apiCache } from './cache';

const RAJHODEDARA_MIRRORS = [
  'https://cdn.jsdelivr.net/gh/rajhodedara/live-sport-plugin@main',
  'https://fastly.jsdelivr.net/gh/rajhodedara/live-sport-plugin@main',
  'https://raw.githubusercontent.com/rajhodedara/live-sport-plugin/main'
];

export const PROXY_WORKER_URL = 'https://nuvio-proxy.odedararaj456.workers.dev';
const CACHE_EXPIRY = 60 * 1000;

/**
 * Multi-CDN Fetcher for Raj Hodedara Live Sport Plugin
 */
async function fetchRajHodedara(endpoint) {
  for (const base of RAJHODEDARA_MIRRORS) {
    try {
      const res = await fetch(`${base}/${endpoint}`, { cache: 'no-cache' });
      if (res.ok) {
        const data = await res.json();
        if (data) return data;
      }
    } catch (err) {
      console.warn(`[RajHodedaraPlugin] Mirror ${base}/${endpoint} failed, trying next...`);
    }
  }
  return null;
}

/**
 * 1. Comprehensive Master Catalog of All Premium Sports TV Channels
 * Organized by provider source (EmbedIndia, BeinArabic, TimStreams, CdnLive, StreamSports, SuperSport)
 */
export const RAJHODEDARA_ALL_CHANNELS = [
  // ─── 1. SONY SPORTS NETWORK (EmbedIndia / SonyLIV) ───
  {
    id: "sony_ten_1",
    title: "Sony Sports Ten 1 HD",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Sony_Sports_Ten_1_logo.svg/320px-Sony_Sports_Ten_1_logo.svg.png",
    cat: "India & Cricket",
    region: "India",
    formats: ["1080p FHD", "720p HD", "HLS Live"],
    decoded_channels: [
      { title: "Sony Ten 1 HD (Server 1)", link: `${PROXY_WORKER_URL}/?action=streamfree&streamId=sony-ten-1-hd&embedUrl=https://streamfree.top/embed/sports/sony-ten-1`, type: "0" },
      { title: "Sony Ten 1 HD (Server 2)", link: "https://embed.st/embed/admin/sony-ten-1-hd/1", type: "0" }
    ]
  },
  {
    id: "sony_ten_2",
    title: "Sony Sports Ten 2 HD",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Sony_Sports_Ten_2_logo.svg/320px-Sony_Sports_Ten_2_logo.svg.png",
    cat: "Football & UCL",
    region: "India",
    formats: ["1080p FHD", "720p HD"],
    decoded_channels: [
      { title: "Sony Ten 2 HD (Server 1)", link: `${PROXY_WORKER_URL}/?action=streamfree&streamId=sony-ten-2-hd&embedUrl=https://streamfree.top/embed/sports/sony-ten-2`, type: "0" },
      { title: "Sony Ten 2 HD (Server 2)", link: "https://embed.st/embed/admin/sony-ten-2-hd/1", type: "0" }
    ]
  },
  {
    id: "sony_ten_3",
    title: "Sony Sports Ten 3 HD (Hindi)",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Sony_Sports_Ten_3_logo.svg/320px-Sony_Sports_Ten_3_logo.svg.png",
    cat: "Hindi Sports",
    region: "India",
    formats: ["1080p FHD", "720p HD"],
    decoded_channels: [
      { title: "Sony Ten 3 Hindi (Server 1)", link: `${PROXY_WORKER_URL}/?action=streamfree&streamId=sony-ten-3-hd&embedUrl=https://streamfree.top/embed/sports/sony-ten-3`, type: "0" },
      { title: "Sony Ten 3 Hindi (Server 2)", link: "https://embed.st/embed/admin/sony-ten-3-hd/1", type: "0" }
    ]
  },
  {
    id: "sony_ten_4",
    title: "Sony Sports Ten 4 HD (Tamil/Telugu)",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Sony_Sports_Ten_4_logo.svg/320px-Sony_Sports_Ten_4_logo.svg.png",
    cat: "Regional Sports",
    region: "India",
    formats: ["1080p FHD", "720p HD"],
    decoded_channels: [
      { title: "Sony Ten 4 HD (Server 1)", link: `${PROXY_WORKER_URL}/?action=streamfree&streamId=sony-ten-4-hd&embedUrl=https://streamfree.top/embed/sports/sony-ten-4`, type: "0" }
    ]
  },
  {
    id: "sony_ten_5",
    title: "Sony Sports Ten 5 HD",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Sony_Sports_Ten_5_logo.svg/320px-Sony_Sports_Ten_5_logo.svg.png",
    cat: "Combat & UFC",
    region: "India",
    formats: ["1080p FHD", "720p HD"],
    decoded_channels: [
      { title: "Sony Ten 5 HD (Server 1)", link: `${PROXY_WORKER_URL}/?action=streamfree&streamId=sony-ten-5-hd&embedUrl=https://streamfree.top/embed/sports/sony-ten-5`, type: "0" },
      { title: "Sony Ten 5 HD (Server 2)", link: "https://embed.st/embed/admin/sony-ten-5-hd/1", type: "0" }
    ]
  },

  // ─── 2. STAR SPORTS NETWORK (Disney+ Hotstar / Cricket) ───
  {
    id: "star_sports_1",
    title: "Star Sports 1 HD (English)",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Star_Sports_1_logo.svg/320px-Star_Sports_1_logo.svg.png",
    cat: "Cricket & IPL",
    region: "India",
    formats: ["1080p FHD", "720p HD"],
    decoded_channels: [
      { title: "Star Sports 1 HD (Server 1)", link: `${PROXY_WORKER_URL}/?action=streamfree&streamId=star-sports-1-hd&embedUrl=https://streamfree.top/embed/sports/star-sports-1`, type: "0" },
      { title: "Star Sports 1 HD (Server 2)", link: "https://embed.st/embed/admin/star-sports-1-hd/1", type: "0" }
    ]
  },
  {
    id: "star_sports_1_hindi",
    title: "Star Sports 1 Hindi HD",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Star_Sports_1_Hindi_logo.svg/320px-Star_Sports_1_Hindi_logo.svg.png",
    cat: "Hindi Cricket",
    region: "India",
    formats: ["1080p FHD", "720p HD"],
    decoded_channels: [
      { title: "Star Sports Hindi (Server 1)", link: `${PROXY_WORKER_URL}/?action=streamfree&streamId=star-sports-1-hindi&embedUrl=https://streamfree.top/embed/sports/star-sports-1-hindi`, type: "0" },
      { title: "Star Sports Hindi (Server 2)", link: "https://embed.st/embed/admin/star-sports-1-hindi/1", type: "0" }
    ]
  },
  {
    id: "star_sports_2",
    title: "Star Sports 2 HD",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Star_Sports_2_logo.svg/320px-Star_Sports_2_logo.svg.png",
    cat: "Cricket & F1",
    region: "India",
    formats: ["1080p FHD", "720p HD"],
    decoded_channels: [
      { title: "Star Sports 2 HD (Server 1)", link: `${PROXY_WORKER_URL}/?action=streamfree&streamId=star-sports-2-hd&embedUrl=https://streamfree.top/embed/sports/star-sports-2`, type: "0" }
    ]
  },
  {
    id: "star_sports_select_1",
    title: "Star Sports Select 1 HD (Premier League)",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Star_Sports_Select_1_logo.svg/320px-Star_Sports_Select_1_logo.svg.png",
    cat: "Premier League",
    region: "India",
    formats: ["1080p FHD", "720p HD"],
    decoded_channels: [
      { title: "Star Select 1 (Server 1)", link: `${PROXY_WORKER_URL}/?action=streamfree&streamId=star-sports-select-1-hd&embedUrl=https://streamfree.top/embed/sports/star-sports-select-1`, type: "0" }
    ]
  },
  {
    id: "star_sports_select_2",
    title: "Star Sports Select 2 HD (Tennis & F1)",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Star_Sports_Select_2_logo.svg/320px-Star_Sports_Select_2_logo.svg.png",
    cat: "Grand Slam & F1",
    region: "India",
    formats: ["1080p FHD", "720p HD"],
    decoded_channels: [
      { title: "Star Select 2 (Server 1)", link: `${PROXY_WORKER_URL}/?action=streamfree&streamId=star-sports-select-2-hd&embedUrl=https://streamfree.top/embed/sports/star-sports-select-2`, type: "0" }
    ]
  },

  // ─── 3. SPORTS18 & WILLOW CRICKET & FANCODE ───
  {
    id: "sports18_1",
    title: "Sports18 1 HD (JioCinema / ISL)",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Sports18_1_logo.svg/320px-Sports18_1_logo.svg.png",
    cat: "Indian Sports",
    region: "India",
    formats: ["1080p FHD", "720p HD"],
    decoded_channels: [
      { title: "Sports18 1 HD (Server 1)", link: `${PROXY_WORKER_URL}/?action=streamfree&streamId=sports18-1-hd&embedUrl=https://streamfree.top/embed/sports/sports18-1`, type: "0" },
      { title: "Sports18 1 HD (Server 2)", link: "https://embed.st/embed/admin/sports18-1-hd/1", type: "0" }
    ]
  },
  {
    id: "willow_cricket_hd",
    title: "Willow Cricket HD (Channel 50007)",
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Willow_Cricket_logo.svg/320px-Willow_Cricket_logo.svg.png",
    cat: "Cricket 24/7",
    region: "USA / UK",
    formats: ["ClearKey DRM 4K", "Tapmad HLS", "Embed.st HD"],
    decoded_channels: [
      {
        title: "Willow Cricket FHD [ClearKey DRM]",
        link: "https://otte.cache.aiv-cdn.net/iad-nitro/live/clients/dash/enc/w8zomj92q0/out/v1/a020966f91754020a1cb05f69ce83d69/cenc.mpd",
        api: "f3b91297bf1b32f957b9ad9df063cccf:1dffa592b7bbeeda714ac1ba3b70f04b",
        type: "1"
      },
      {
        title: "Tapmad Live Sports [HLS]",
        link: "https://tapmad.akamaized.net/live/master.m3u8",
        type: "0"
      },
      {
        title: "Willow Cricket [Embed Mirror]",
        link: "https://embed.st/embed/admin/willow-cricket/1",
        type: "0"
      }
    ]
  },
  {
    id: "fancode_live_1",
    title: "FanCode Live Sports HD",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/FanCode_Logo.png/320px-FanCode_Logo.png",
    cat: "Live Cricket & Football",
    region: "India",
    formats: ["1080p FHD", "720p HD"],
    decoded_channels: [
      { title: "FanCode HD (Server 1)", link: `${PROXY_WORKER_URL}/?action=streamfree&streamId=fancode-live-1&embedUrl=https://streamfree.top/embed/sports/fancode-1`, type: "0" }
    ]
  },

  // ─── 4. SKY SPORTS UK NETWORK (TimStreams / CdnLive) ───
  {
    id: "sky_sports_main_event",
    title: "Sky Sports Main Event UHD",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Sky_Sports_Main_Event_logo_2020.svg/320px-Sky_Sports_Main_Event_logo_2020.svg.png",
    cat: "Premier League & F1",
    region: "UK",
    formats: ["4K UHD", "1080p FHD", "720p HD"],
    decoded_channels: [
      { title: "Sky Main Event [FHD 1]", link: "https://embed.st/embed/admin/sky-sports-main-event/1", type: "0" },
      { title: "Sky Main Event [FHD 2]", link: `${PROXY_WORKER_URL}/?action=streamfree&streamId=sky-sports-main-event&embedUrl=https://streamfree.top/embed/sports/sky-sports-main-event`, type: "0" }
    ]
  },
  {
    id: "sky_sports_premier_league",
    title: "Sky Sports Premier League HD",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Sky_Sports_Premier_League_logo_2020.svg/320px-Sky_Sports_Premier_League_logo_2020.svg.png",
    cat: "Premier League",
    region: "UK",
    formats: ["1080p FHD", "720p HD"],
    decoded_channels: [
      { title: "Sky Premier League [FHD 1]", link: "https://embed.st/embed/admin/sky-sports-premier-league/1", type: "0" },
      { title: "Sky Premier League [FHD 2]", link: `${PROXY_WORKER_URL}/?action=streamfree&streamId=sky-sports-premier-league&embedUrl=https://streamfree.top/embed/sports/sky-sports-premier-league`, type: "0" }
    ]
  },
  {
    id: "sky_sports_football",
    title: "Sky Sports Football HD",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Sky_Sports_Football_logo_2020.svg/320px-Sky_Sports_Football_logo_2020.svg.png",
    cat: "EFL & Bundesliga",
    region: "UK",
    formats: ["1080p FHD", "720p HD"],
    decoded_channels: [
      { title: "Sky Football [FHD 1]", link: "https://embed.st/embed/admin/sky-sports-football/1", type: "0" }
    ]
  },
  {
    id: "sky_sports_f1",
    title: "Sky Sports F1 HD (Formula 1 Live)",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Sky_Sports_F1_logo_2020.svg/320px-Sky_Sports_F1_logo_2020.svg.png",
    cat: "Formula 1",
    region: "UK",
    formats: ["1080p 50FPS", "720p HD"],
    decoded_channels: [
      { title: "Sky F1 [50FPS HD 1]", link: "https://embed.st/embed/admin/sky-sports-f1/1", type: "0" },
      { title: "Sky F1 [50FPS HD 2]", link: `${PROXY_WORKER_URL}/?action=streamfree&streamId=sky-sports-f1&embedUrl=https://streamfree.top/embed/sports/sky-sports-f1`, type: "0" }
    ]
  },
  {
    id: "sky_sports_cricket",
    title: "Sky Sports Cricket HD",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Sky_Sports_Cricket_logo_2020.svg/320px-Sky_Sports_Cricket_logo_2020.svg.png",
    cat: "Test & The Hundred",
    region: "UK",
    formats: ["1080p FHD", "720p HD"],
    decoded_channels: [
      { title: "Sky Cricket [FHD 1]", link: "https://embed.st/embed/admin/sky-sports-cricket/1", type: "0" }
    ]
  },

  // ─── 5. TNT SPORTS UK NETWORK ───
  {
    id: "tnt_sports_1",
    title: "TNT Sports 1 HD (UCL / Premier League)",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/TNT_Sports_1_logo.svg/320px-TNT_Sports_1_logo.svg.png",
    cat: "UEFA Champions League",
    region: "UK",
    formats: ["1080p FHD", "720p HD"],
    decoded_channels: [
      { title: "TNT Sports 1 [FHD 1]", link: "https://embed.st/embed/admin/tnt-sports-1/1", type: "0" },
      { title: "TNT Sports 1 [FHD 2]", link: `${PROXY_WORKER_URL}/?action=streamfree&streamId=tnt-sports-1&embedUrl=https://streamfree.top/embed/sports/tnt-sports-1`, type: "0" }
    ]
  },
  {
    id: "tnt_sports_2",
    title: "TNT Sports 2 HD (Serie A & MotoGP)",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/TNT_Sports_2_logo.svg/320px-TNT_Sports_2_logo.svg.png",
    cat: "MotoGP & Serie A",
    region: "UK",
    formats: ["1080p FHD", "720p HD"],
    decoded_channels: [
      { title: "TNT Sports 2 [FHD 1]", link: "https://embed.st/embed/admin/tnt-sports-2/1", type: "0" }
    ]
  },
  {
    id: "tnt_sports_ultimate",
    title: "TNT Sports Ultimate 4K",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/TNT_Sports_Ultimate_logo.svg/320px-TNT_Sports_Ultimate_logo.svg.png",
    cat: "4K HDR Sports",
    region: "UK",
    formats: ["4K HDR", "1080p 50FPS"],
    decoded_channels: [
      { title: "TNT Ultimate 4K [Feed 1]", link: "https://embed.st/embed/admin/tnt-sports-ultimate/1", type: "0" }
    ]
  },

  // ─── 6. BEIN SPORTS ARABIC & ENGLISH (BeinArabicProvider) ───
  {
    id: "bein_sports_1",
    title: "beIN Sports 1 HD (Premier League / UCL)",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/BeIN_Sports_1_logo.svg/320px-BeIN_Sports_1_logo.svg.png",
    cat: "Arabic & English UCL",
    region: "MENA",
    formats: ["1080p FHD", "720p HD"],
    decoded_channels: [
      { title: "beIN Sports 1 [Server 1]", link: "https://embed.st/embed/admin/bein-sports-1/1", type: "0" },
      { title: "beIN Sports 1 [Server 2]", link: `${PROXY_WORKER_URL}/?action=streamfree&streamId=bein-sports-1-hd&embedUrl=https://streamfree.top/embed/sports/bein-sports-1`, type: "0" }
    ]
  },
  {
    id: "bein_sports_2",
    title: "beIN Sports 2 HD (La Liga / Real Madrid / Barça)",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/BeIN_Sports_2_logo.svg/320px-BeIN_Sports_2_logo.svg.png",
    cat: "La Liga",
    region: "MENA",
    formats: ["1080p FHD", "720p HD"],
    decoded_channels: [
      { title: "beIN Sports 2 [Server 1]", link: "https://embed.st/embed/admin/bein-sports-2/1", type: "0" }
    ]
  },
  {
    id: "bein_sports_3",
    title: "beIN Sports 3 HD (Ligue 1 / PSG)",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/BeIN_Sports_3_logo.svg/320px-BeIN_Sports_3_logo.svg.png",
    cat: "Ligue 1",
    region: "MENA",
    formats: ["1080p FHD", "720p HD"],
    decoded_channels: [
      { title: "beIN Sports 3 [Server 1]", link: "https://embed.st/embed/admin/bein-sports-3/1", type: "0" }
    ]
  },
  {
    id: "bein_sports_4k",
    title: "beIN Sports 4K UHD",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/BeIN_Sports_4K_logo.svg/320px-BeIN_Sports_4K_logo.svg.png",
    cat: "4K Live Broadcast",
    region: "MENA",
    formats: ["4K UHD", "1080p FHD"],
    decoded_channels: [
      { title: "beIN 4K [Direct Feed]", link: "https://embed.st/embed/admin/bein-sports-4k/1", type: "0" }
    ]
  },

  // ─── 7. SSC SAUDI SPORTS (Saudi Pro League / AFC) ───
  {
    id: "ssc_1_hd",
    title: "SSC 1 HD (Al Nassr / Ronaldo / SPL)",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/SSC_Channel_1.png/320px-SSC_Channel_1.png",
    cat: "Saudi Pro League",
    region: "Saudi Arabia",
    formats: ["1080p FHD", "720p HD"],
    decoded_channels: [
      { title: "SSC 1 HD [Server 1]", link: "https://embed.st/embed/admin/ssc-1-hd/1", type: "0" },
      { title: "SSC 1 HD [Server 2]", link: `${PROXY_WORKER_URL}/?action=streamfree&streamId=ssc-1-hd&embedUrl=https://streamfree.top/embed/sports/ssc-1`, type: "0" }
    ]
  },

  // ─── 8. USA & AMERICAS NETWORKS (ESPN / FOX / DAZN / SUPERSPORT) ───
  {
    id: "espn_usa",
    title: "ESPN HD (USA / NBA / NFL)",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/ESPN_wordmark.svg/320px-ESPN_wordmark.svg.png",
    cat: "NBA & NFL",
    region: "USA",
    formats: ["1080p FHD", "720p HD"],
    decoded_channels: [
      { title: "ESPN HD [Server 1]", link: "https://embed.st/embed/admin/espn/1", type: "0" },
      { title: "ESPN HD [Server 2]", link: `${PROXY_WORKER_URL}/?action=streamfree&streamId=espn-usa&embedUrl=https://streamfree.top/embed/sports/espn`, type: "0" }
    ]
  },
  {
    id: "dazn_1_hd",
    title: "DAZN 1 HD (European Football & Boxing)",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/DAZN_Logo_Master.svg/320px-DAZN_Logo_Master.svg.png",
    cat: "Boxing & Serie A",
    region: "Europe",
    formats: ["1080p FHD", "720p HD"],
    decoded_channels: [
      { title: "DAZN 1 [Server 1]", link: "https://embed.st/embed/admin/dazn-1/1", type: "0" },
      { title: "DAZN 1 [Server 2]", link: `${PROXY_WORKER_URL}/?action=streamfree&streamId=dazn-1-de&embedUrl=https://streamfree.top/embed/sports/dazn-1`, type: "0" }
    ]
  },
  {
    id: "supersport_premier_league",
    title: "SuperSport Premier League HD",
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/6/6b/SuperSport_logo_2020.svg/320px-SuperSport_logo_2020.svg.png",
    cat: "Premier League 24/7",
    region: "South Africa",
    formats: ["1080p FHD", "720p HD"],
    decoded_channels: [
      { title: "SuperSport PL [Feed 1]", link: "https://embed.st/embed/admin/supersport-premier-league/1", type: "0" }
    ]
  }
];

/**
 * Fetch all curated sports networks combining Raj Hodedara Plugin providers
 */
export const fetchRajHodedaraSportsChannels = async () => {
  const cacheKey = 'rajhodedara_sports_channels';
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  apiCache.set(cacheKey, RAJHODEDARA_ALL_CHANNELS, CACHE_EXPIRY * 5);
  return RAJHODEDARA_ALL_CHANNELS;
};
