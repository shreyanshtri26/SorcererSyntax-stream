import axios from 'axios';
import { apiCache } from './cache';

const CACHE_EXPIRY = 60 * 1000; // 60 seconds

export const fetchStreamedPkMatches = async () => {
  const cacheKey = 'streamed_pk_live';
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get('https://streamed.pk/api/matches/live', { timeout: 8000 });
    if (response.data && Array.isArray(response.data)) {
      apiCache.set(cacheKey, response.data, CACHE_EXPIRY);
      return response.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching Streamed.pk matches:', error);
    return [];
  }
};

export const fetchWatchfootyMatches = async () => {
  const cacheKey = 'watchfooty_live';
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get('https://watchfooty.st/api/v1/matches/all/live', { timeout: 8000 });
    // Assuming response.data is an array of matches or response.data.matches
    const data = response.data.matches || response.data || [];
    if (Array.isArray(data)) {
      apiCache.set(cacheKey, data, CACHE_EXPIRY);
      return data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching Watchfooty matches:', error);
    return [];
  }
};
