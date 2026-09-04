// Fallback static datasets in case external mirrors are temporarily unreachable
export const FALLBACK_CATEGORIES = [
  { "id": "cdx_usa", "title": "USA Specific HD (CDX)", "image": "https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Flag_of_the_United_States.svg/320px-Flag_of_the_United_States.svg.png", "catLink": "cdx_usa" },
  { "id": "1", "title": "Sports", "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Soccer_ball.svg/512px-Soccer_ball.svg.png", "catLink": "cats/sports.json" },
  { "id": "2", "title": "India", "image": "https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/320px-Flag_of_India.svg.png", "catLink": "cats/india.json" },
  { "id": "3", "title": "Bangla", "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Flag_of_Bangladesh.svg/320px-Flag_of_Bangladesh.svg.png", "catLink": "cats/bangla.json" },
  { "id": "4", "title": "Entertainment", "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Sky_Sports_Main_Event_logo_2020.svg/320px-Sky_Sports_Main_Event_logo_2020.svg.png", "catLink": "cats/entertainment.json" },
  { "id": "5", "title": "News", "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/ESPN_wordmark.svg/320px-ESPN_wordmark.svg.png", "catLink": "cats/news.json" }
];

export const FALLBACK_SPORTS = [
  {
    "id": "50007",
    "title": "Willow Cricket HD (Channel 50007)",
    "image": "https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Willow_Cricket_logo.svg/320px-Willow_Cricket_logo.svg.png",
    "cat": "CRICKET",
    "formats": ["Willow Cricket FHD (ClearKey DRM)", "Tapmad Live Sports (HLS)"],
    "decoded_channels": [
      {
        "title": "Willow Cricket FHD [DRM DASH]",
        "link": "https://otte.cache.aiv-cdn.net/iad-nitro/live/clients/dash/enc/w8zomj92q0/out/v1/a020966f91754020a1cb05f69ce83d69/cenc.mpd",
        "api": "f3b91297bf1b32f957b9ad9df063cccf:1dffa592b7bbeeda714ac1ba3b70f04b",
        "type": "1"
      },
      {
        "title": "Tapmad Live Sports [HLS]",
        "link": "https://tapmad.akamaized.net/live/master.m3u8",
        "api": "",
        "type": "0"
      }
    ]
  },
  {
    "id": "1",
    "title": "Sky Sports Main Event UHD",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Sky_Sports_Main_Event_logo_2020.svg/320px-Sky_Sports_Main_Event_logo_2020.svg.png",
    "cat": "UK SPORTS",
    "formats": ["4K UHD", "1080p FHD", "720p HD"],
    "decoded_channels": [
      { "title": "Sky Main Event [FHD 1]", "link": "https://embed.st/embed/admin/sky-sports-main-event/1", "type": "0" }
    ]
  },
  {
    "id": "2",
    "title": "TNT Sports 1 HD",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/TNT_Sports_1_logo.svg/320px-TNT_Sports_1_logo.svg.png",
    "cat": "UK SPORTS",
    "formats": ["1080p FHD", "720p HD"],
    "decoded_channels": [
      { "title": "TNT Sports 1 [FHD 1]", "link": "https://embed.st/embed/admin/tnt-sports-1/1", "type": "0" }
    ]
  },
  {
    "id": "3",
    "title": "beIN Sports 1 HD",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/BeIN_Sports_1_logo.svg/320px-BeIN_Sports_1_logo.svg.png",
    "cat": "ARABIC & MENA",
    "formats": ["1080p FHD", "720p HD"],
    "decoded_channels": [
      { "title": "beIN Sports 1 [Server 1]", "link": "https://embed.st/embed/admin/bein-sports-1/1", "type": "0" }
    ]
  },
  {
    "id": "4",
    "title": "ESPN HD (USA)",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/ESPN_wordmark.svg/320px-ESPN_wordmark.svg.png",
    "cat": "USA SPORTS",
    "formats": ["1080p FHD", "720p HD"],
    "decoded_channels": [
      { "title": "ESPN HD [Server 1]", "link": "https://embed.st/embed/admin/espn/1", "type": "0" }
    ]
  }
];

export const FALLBACK_EVENTS = [
  {
    "id": 50007,
    "title": "Willow Cricket HD & Tapmad Live",
    "image": "https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Willow_Cricket_logo.svg/320px-Willow_Cricket_logo.svg.png",
    "cat": "CRICKET",
    "eventInfo": {
      "teamA": "Willow Cricket",
      "teamB": "Tapmad Live",
      "teamAFlag": "https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Willow_Cricket_logo.svg/320px-Willow_Cricket_logo.svg.png",
      "teamBFlag": "https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Willow_Cricket_logo.svg/320px-Willow_Cricket_logo.svg.png",
      "eventName": "Willow Cricket Live (Channel 50007)",
      "isHot": "1",
      "startTime": "LIVE NOW",
      "endTime": "LIVE"
    },
    "formats": ["WILLOW - FHD", "TAPMAD - FHD", "WILLOW - ALT"],
    "decoded_channels": [
      {
        "api": "f3b91297bf1b32f957b9ad9df063cccf:1dffa592b7bbeeda714ac1ba3b70f04b",
        "link": "https://otte.cache.aiv-cdn.net/iad-nitro/live/clients/dash/enc/wm7nvzuo81/out/v1/4be515e8c9c3450c9d73b2d2d8c25d46/cenc.mpd",
        "title": "WILLOW - FHD",
        "type": "1"
      },
      {
        "api": "",
        "link": "https://saseries.akamaized.net/hls/live/2110097/2356jkiL-tapmad/master.m3u8",
        "title": "TAPMAD - FHD",
        "type": "0"
      }
    ],
    "source": "dudetv"
  },
  {
    "id": 50004,
    "title": "UFC Fight Night Live",
    "image": "https://www.thesportsdb.com/images/media/event/fanart/7mdowm1786776083.jpg",
    "cat": "UFC",
    "eventInfo": {
      "teamA": "Main Card Fight",
      "teamB": "Championship Prelims",
      "eventName": "UFC Fight Night Live",
      "isHot": "1",
      "startTime": "LIVE NOW",
      "endTime": "LIVE"
    },
    "formats": ["UFC 1080p FHD", "UFC 720p HD"],
    "decoded_channels": [
      {
        "title": "UFC Live [FHD]",
        "link": "https://embed.st/embed/admin/ufc-fight-night/1",
        "type": "0"
      }
    ],
    "source": "dudetv"
  },
  {
    "id": 50027,
    "title": "Real Betis vs Real Madrid",
    "image": "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/320px-Real_Madrid_CF.svg.png",
    "cat": "LaLiga 🇪🇸",
    "eventInfo": {
      "teamA": "Real Betis",
      "teamB": "Real Madrid",
      "teamAFlag": "https://upload.wikimedia.org/wikipedia/en/thumb/1/13/Real_betis_logo.svg/320px-Real_betis_logo.svg.png",
      "teamBFlag": "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/320px-Real_Madrid_CF.svg.png",
      "eventName": "Real Betis vs Real Madrid",
      "competition": "LaLiga EA Sports",
      "isHot": "1",
      "kickoffIST": "9:00 PM IST",
      "kickoffHour": 21,
      "kickoffMinute": 0,
      "startTime": "9:00 PM IST",
      "endTime": "11:00 PM IST"
    },
    "formats": ["DAZN LALIGA (BEST Ultra HD)", "LALIGA - FHD", "DAZN 1 HD"],
    "decoded_channels": [
      {
        "title": "DAZN LaLiga (BEST Ultra HD)",
        "link": "https://epiembeds.online/embed/daznlaliga-es",
        "type": "0"
      },
      {
        "title": "DAZN LaLiga [Server 2]",
        "link": "https://embed.st/embed/admin/dazn-laliga/1",
        "type": "0"
      }
    ],
    "source": "dudetv"
  },
  {
    "id": 50030,
    "title": "Real Madrid vs FC Barcelona (El Clásico)",
    "image": "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/320px-Real_Madrid_CF.svg.png",
    "cat": "LaLiga 🇪🇸",
    "eventInfo": {
      "teamA": "Real Madrid",
      "teamB": "FC Barcelona",
      "teamAFlag": "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/320px-Real_Madrid_CF.svg.png",
      "teamBFlag": "https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/320px-FC_Barcelona_%28crest%29.svg.png",
      "eventName": "Real Madrid vs FC Barcelona (El Clásico)",
      "competition": "LaLiga EA Sports",
      "isHot": "1",
      "kickoffIST": "12:30 AM IST",
      "kickoffHour": 0,
      "kickoffMinute": 30,
      "startTime": "12:30 AM IST",
      "endTime": "2:30 AM IST"
    },
    "formats": ["DAZN LALIGA (BEST Ultra HD)", "Sky Sports Football (BEST Ultra HD)", "Fox Soccer Plus (BEST Ultra HD)"],
    "decoded_channels": [
      {
        "title": "DAZN LaLiga (BEST Ultra HD)",
        "link": "https://epiembeds.online/embed/daznlaliga-es",
        "type": "0"
      }
    ],
    "source": "dudetv"
  },
  {
    "id": 50028,
    "title": "Manchester City vs Liverpool FC",
    "image": "https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/320px-Manchester_City_FC_badge.svg.png",
    "cat": "EPL 🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    "eventInfo": {
      "teamA": "Manchester City",
      "teamB": "Liverpool FC",
      "teamAFlag": "https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/320px-Manchester_City_FC_badge.svg.png",
      "teamBFlag": "https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/320px-Liverpool_FC.svg.png",
      "eventName": "Manchester City vs Liverpool FC",
      "competition": "Premier League",
      "isHot": "1",
      "kickoffIST": "9:00 PM IST",
      "kickoffHour": 21,
      "kickoffMinute": 0,
      "startTime": "9:00 PM IST",
      "endTime": "11:00 PM IST"
    },
    "formats": ["Sky Sports Football (BEST Ultra HD)", "TNT Sports 1 HD", "Sky Premier League"],
    "decoded_channels": [
      {
        "title": "Sky Sports Football (BEST Ultra HD)",
        "link": "https://epiembeds.online/embed/skysportsfootball-uk",
        "type": "0"
      },
      {
        "title": "Sky Sports Football [Server 2]",
        "link": "https://embed.st/embed/admin/sky-sports-football/1",
        "type": "0"
      }
    ],
    "source": "dudetv"
  },
  {
    "id": 50006,
    "title": "WWE Monday Night RAW Live",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/WWE_Raw_logo.svg/320px-WWE_Raw_logo.svg.png",
    "cat": "WWE",
    "eventInfo": {
      "teamA": "WWE Superstars",
      "teamB": "Monday Night RAW",
      "eventName": "🥊 WWE Monday Night RAW Live",
      "competition": "WWE",
      "isHot": "1",
      "kickoffIST": "5:30 AM IST",
      "kickoffHour": 5,
      "kickoffMinute": 30,
      "startTime": "5:30 AM IST",
      "endTime": "8:30 AM IST"
    },
    "formats": ["USA Network (BEST Ultra HD)", "Sony Sports Ten 1 HD", "TNT Sports 1 HD"],
    "decoded_channels": [
      {
        "title": "USA Network (BEST Ultra HD)",
        "link": "https://epiembeds.online/embed/usanetwork-usa",
        "type": "0"
      },
      {
        "title": "USA Network [Server 2]",
        "link": "https://embed.st/embed/admin/usa-network/1",
        "type": "0"
      }
    ],
    "source": "dudetv"
  },
  {
    "id": 50029,
    "title": "India vs Sri Lanka Live T20",
    "image": "https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/320px-Flag_of_India.svg.png",
    "cat": "CRICKET",
    "eventInfo": {
      "teamA": "India",
      "teamB": "Sri Lanka",
      "teamAFlag": "https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/320px-Flag_of_India.svg.png",
      "teamBFlag": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Flag_of_Sri_Lanka.svg/320px-Flag_of_Sri_Lanka.svg.png",
      "eventName": "India vs Sri Lanka T20 Trophy Live",
      "competition": "International Cricket T20",
      "isHot": "1",
      "kickoffIST": "7:00 PM IST",
      "kickoffHour": 19,
      "kickoffMinute": 0,
      "startTime": "7:00 PM IST",
      "endTime": "10:30 PM IST"
    },
    "formats": ["Willow Cricket (BEST Ultra HD)", "Willow Cricket 2 (BEST Ultra HD)", "Sky Sports Cricket (BEST Ultra HD)", "Star Sports 1 HD"],
    "decoded_channels": [
      {
        "title": "Willow Cricket (BEST Ultra HD)",
        "link": "https://epiembeds.online/embed/willowcricket-usa",
        "type": "0"
      },
      {
        "title": "Willow Cricket 2 (BEST Ultra HD)",
        "link": "https://epiembeds.online/embed/willowcricket2-usa",
        "type": "0"
      },
      {
        "title": "Sky Sports Cricket (BEST Ultra HD)",
        "link": "https://epiembeds.online/embed/skysportscricket-uk",
        "type": "0"
      },
      {
        "title": "Star Sports 1 HD",
        "link": "https://embed.st/embed/admin/star-sports-1-hd/1",
        "type": "0"
      }
    ],
    "source": "dudetv"
  }
];

export const EVENT_50007_FALLBACK = {
  "id": 50007,
  "title": "Willow Cricket & Tapmad Live FHD",
  "image": "https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Willow_Cricket_logo.svg/320px-Willow_Cricket_logo.svg.png",
  "cat": "CRICKET",
  "eventInfo": {
    "teamA": "Willow Cricket FHD",
    "teamB": "Tapmad Live Sports",
    "teamAFlag": "https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Willow_Cricket_logo.svg/320px-Willow_Cricket_logo.svg.png",
    "teamBFlag": "https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Willow_Cricket_logo.svg/320px-Willow_Cricket_logo.svg.png",
    "eventName": "Willow Cricket Live HD (Channel 50007)",
    "isHot": "1",
    "startTime": "LIVE 24/7",
    "endTime": "LIVE"
  },
  "formats": ["Willow Cricket FHD (ClearKey DRM)", "Tapmad Live Sports (HLS)"],
  "decoded_channels": [
    {
      "title": "Willow Cricket FHD [DRM DASH]",
      "link": "https://otte.cache.aiv-cdn.net/iad-nitro/live/clients/dash/enc/w8zomj92q0/out/v1/a020966f91754020a1cb05f69ce83d69/cenc.mpd",
      "api": "f3b91297bf1b32f957b9ad9df063cccf:1dffa592b7bbeeda714ac1ba3b70f04b",
      "type": "1"
    },
    {
      "title": "Tapmad Live Sports [HLS]",
      "link": "https://tapmad.akamaized.net/live/master.m3u8",
      "api": "",
      "type": "0"
    }
  ],
  "source": "dudetv"
};

/**
 * Dedicated stream mappings for channels that 404 in DudeTV API (e.g. Sony SAB HD 81, Sony Max, etc.)
 */
export const FALLBACK_CHANNEL_STREAMS = {
  // Sony SAB HD
  "81": [
    {
      "title": "Sony SAB HD (Server 1)",
      "link": "https://dudetvtvapk.online/sony.m3u8?id=1000009247",
      "api": "",
      "type": "0"
    },
    {
      "title": "Sony SAB HD [ClearKey DRM]",
      "link": "https://d1g8wgjurz8via.cloudfront.net/bpk-tv/Sony_Sab_HD/default/manifest.mpd",
      "api": "4a085ee58129486c99ec98813a48e653:49603f90b4ad6ca8a05c6d328b975850",
      "type": "1"
    },
    {
      "title": "Sony SAB HD (Server 3 - Live)",
      "link": "https://embed.st/embed/admin/sony-sab-hd/1",
      "api": "",
      "type": "0"
    }
  ],
  "sony sab hd": [
    {
      "title": "Sony SAB HD (Server 1)",
      "link": "https://dudetvtvapk.online/sony.m3u8?id=1000009247",
      "api": "",
      "type": "0"
    },
    {
      "title": "Sony SAB HD [ClearKey DRM]",
      "link": "https://d1g8wgjurz8via.cloudfront.net/bpk-tv/Sony_Sab_HD/default/manifest.mpd",
      "api": "4a085ee58129486c99ec98813a48e653:49603f90b4ad6ca8a05c6d328b975850",
      "type": "1"
    },
    {
      "title": "Sony SAB HD (Server 3 - Live)",
      "link": "https://embed.st/embed/admin/sony-sab-hd/1",
      "api": "",
      "type": "0"
    }
  ]
};
