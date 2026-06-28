import axios from 'axios';

const BASE_URL = 'https://iptv-org.github.io/api';

let cachedChannels = null;
let cachedCategories = null;

export const fetchCategories = async () => {
  if (cachedCategories) return cachedCategories;
  try {
    const { data } = await axios.get(`${BASE_URL}/categories.json`);
    cachedCategories = data;
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const fetchChannelsWithStreams = async () => {
  if (cachedChannels) return cachedChannels;
  
  try {
    const [channelsRes, streamsRes] = await Promise.all([
      axios.get(`${BASE_URL}/channels.json`),
      axios.get(`${BASE_URL}/streams.json`),
    ]);

    const channels = channelsRes.data;
    const streams = streamsRes.data;

    // Create a map of channel id to its streams
    const streamMap = {};
    streams.forEach(stream => {
      if (stream.channel) {
        if (!streamMap[stream.channel]) {
          streamMap[stream.channel] = [];
        }
        streamMap[stream.channel].push(stream);
      }
    });

    // Merge and filter channels that have streams
    const validChannels = channels
      .filter(c => !c.is_nsfw) // Exclude NSFW channels
      .map(c => ({
        ...c,
        streams: streamMap[c.id] || []
      }))
      .filter(c => c.streams.length > 0);

    cachedChannels = validChannels;
    return validChannels;
  } catch (error) {
    console.error('Error fetching channels and streams:', error);
    return [];
  }
};
