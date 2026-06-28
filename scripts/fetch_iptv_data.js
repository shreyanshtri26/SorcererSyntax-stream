import fs from 'fs';
import path from 'path';
import axios from 'axios';

const DATA_DIR = path.join(process.cwd(), 'public', 'data', 'iptv');
const COUNTRIES_DIR = path.join(DATA_DIR, 'countries');

// Create output directories if they don't exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(COUNTRIES_DIR)) {
  fs.mkdirSync(COUNTRIES_DIR, { recursive: true });
}

const run = async () => {
  try {
    console.log('Fetching IPTV-org data...');
    
    const [channelsRes, streamsRes, countriesRes] = await Promise.all([
      axios.get('https://iptv-org.github.io/api/channels.json'),
      axios.get('https://iptv-org.github.io/api/streams.json'),
      axios.get('https://iptv-org.github.io/api/countries.json')
    ]);

    const channels = channelsRes.data;
    const streams = streamsRes.data;
    const countries = countriesRes.data;

    console.log(`Loaded ${channels.length} channels, ${streams.length} streams, and ${countries.length} countries.`);

    // Map country code (uppercase) to name
    const countryMap = {};
    countries.forEach(c => {
      countryMap[c.code.toUpperCase()] = c.name;
    });

    // Create a map of channel id to its stream URLs
    const streamMap = {};
    streams.forEach(s => {
      if (s.channel && s.url) {
        if (!streamMap[s.channel]) {
          streamMap[s.channel] = [];
        }
        streamMap[s.channel].push(s.url);
      }
    });

    // Match channels with streams and filter out NSFW
    const validChannels = channels
      .filter(c => !c.is_nsfw)
      .map(c => ({
        id: c.id,
        name: c.name,
        logo: c.logo,
        categories: c.categories || [],
        languages: c.languages || [],
        country: c.country ? c.country.toUpperCase() : null,
        streams: streamMap[c.id] || []
      }))
      .filter(c => c.streams.length > 0);

    console.log(`Found ${validChannels.length} valid channels with active streams.`);

    // Group channels by country
    const channelsByCountry = {};
    validChannels.forEach(c => {
      const countryCode = c.country || 'GLOBAL';
      if (!channelsByCountry[countryCode]) {
        channelsByCountry[countryCode] = [];
      }
      channelsByCountry[countryCode].push({
        id: c.id,
        name: c.name,
        logo: c.logo,
        categories: c.categories,
        languages: c.languages,
        streams: c.streams
      });
    });

    // Write individual country files and build index list
    const countryIndex = [];

    Object.keys(channelsByCountry).forEach(code => {
      const countryChannels = channelsByCountry[code];
      const countryName = countryMap[code] || (code === 'GLOBAL' ? 'Global / International' : code);

      // Write file for the country
      const filePath = path.join(COUNTRIES_DIR, `${code.toLowerCase()}.json`);
      fs.writeFileSync(filePath, JSON.stringify(countryChannels, null, 2));

      countryIndex.push({
        code: code.toLowerCase(),
        name: countryName,
        count: countryChannels.length
      });
    });

    // Sort index: Global first, then others by channel count descending
    countryIndex.sort((a, b) => {
      if (a.code === 'global') return -1;
      if (b.code === 'global') return 1;
      return b.count - a.count;
    });

    // Write index file
    fs.writeFileSync(path.join(DATA_DIR, 'index.json'), JSON.stringify(countryIndex, null, 2));
    
    console.log('IPTV data generated successfully!');
    console.log(`Saved ${countryIndex.length} country files to public/data/iptv/countries/`);
  } catch (error) {
    console.error('Failed to generate IPTV files:', error);
  }
};

run();
