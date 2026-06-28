// Use the API key directly instead of from environment variables
const TMDB_API_KEY = "9a5a0e6e93d4b73e87566b319e8cfb95";
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3/';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_DEFAULT_LANGUAGE = 'en-US';
import { apiCache } from './cache';

async function fetchFromTMDB(endpoint, params = {}, language = TMDB_DEFAULT_LANGUAGE) {
  // Generate cache key
  const cacheKey = `tmdb:${endpoint}:${JSON.stringify(params)}:${language}`;

  // Check cache first
  const cachedData = apiCache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  url.searchParams.append('language', language || TMDB_DEFAULT_LANGUAGE);
  Object.keys(params).forEach(key => {
    if (key === 'query' && params[key]) {
      url.searchParams.append(key, encodeURIComponent(params[key]));
    } else if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key]);
    }
  });
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const result = data.results || data;

    // Store in cache
    apiCache.set(cacheKey, result);

    return result;
  } catch (error) {
    console.error("Error fetching from TMDB API:", error);
    return null;
  }
}

export const getTrendingMovies = (timeWindow = 'week') => fetchFromTMDB(`trending/movie/${timeWindow}`);
export const getTrendingTVShows = (timeWindow = 'week') => fetchFromTMDB(`trending/tv/${timeWindow}`);
export const getTopRatedMovies = () => fetchFromTMDB('movie/top_rated');
export const getTopRatedTVShows = () => fetchFromTMDB('tv/top_rated');
export const searchMovies = (query, page = 1, language = TMDB_DEFAULT_LANGUAGE) => fetchFromTMDB('search/movie', { query, page }, language);
export const searchTVShows = (query, page = 1, language = TMDB_DEFAULT_LANGUAGE) => fetchFromTMDB('search/tv', { query, page }, language);
export const searchMultiMedia = (query, page = 1, language = TMDB_DEFAULT_LANGUAGE) => fetchFromTMDB('search/multi', { query, page }, language);
export const getLanguages = () => fetchFromTMDB('configuration/languages');
export const getTVShowDetails = (tvId, language = TMDB_DEFAULT_LANGUAGE) => fetchFromTMDB(`tv/${tvId}`, {}, language);
export const getMovieDetails = (movieId, language = TMDB_DEFAULT_LANGUAGE) => fetchFromTMDB(`movie/${movieId}`, {}, language);
export const getVideos = (mediaType, id, language = TMDB_DEFAULT_LANGUAGE) => {
  if (!mediaType || !id) {
    console.error("Media type and ID are required to fetch videos.");
    return Promise.resolve(null);
  }
  const endpoint = `${mediaType}/${id}/videos`;
  return fetchFromTMDB(endpoint, {}, language);
};
export const getMovieGenres = () => fetchFromTMDB('genre/movie/list');
export const getTVGenres = () => fetchFromTMDB('genre/tv/list');
export const getMovieCredits = (movieId, language = TMDB_DEFAULT_LANGUAGE) => fetchFromTMDB(`movie/${movieId}/credits`, {}, language);
export const getTVSeasonCredits = (tvId, seasonNumber, language = TMDB_DEFAULT_LANGUAGE) => fetchFromTMDB(`tv/${tvId}/season/${seasonNumber}/credits`, {}, language);
export const getTVSeasonVideos = (tvId, seasonNumber, language = TMDB_DEFAULT_LANGUAGE) => fetchFromTMDB(`tv/${tvId}/season/${seasonNumber}/videos`, {}, language);
export const getMovieRecommendations = (movieId, language = TMDB_DEFAULT_LANGUAGE) => fetchFromTMDB(`movie/${movieId}/recommendations`, {}, language);
export const getTVRecommendations = (tvId, language = TMDB_DEFAULT_LANGUAGE) => fetchFromTMDB(`tv/${tvId}/recommendations`, {}, language);

export const discoverMedia = async (mediaType, filters, page = 1, sortOption = 'popularity.desc') => {
  // Determine the UI language (for metadata) and original language (for filtering)
  const uiLanguage = 'en-US'; // Always use English for metadata (or change as needed)
  let originalLanguage = undefined;
  if (filters.languages && filters.languages.length === 1) {
    originalLanguage = filters.languages[0];
  }
  const params = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: uiLanguage,
    sort_by: sortOption,
    include_adult: false,
    include_video: false,
    page: page,
    'vote_average.gte': filters.rating || 0,
    with_genres: (filters.genres || []).join(','),
  });

  // --- Advanced Filters ---
  if (filters.runtime_lte) params.append('with_runtime.lte', filters.runtime_lte);
  if (filters.region) {
    params.append('region', filters.region);
    // Also likely want original language if region is specified to find content FROM there
    // but sometimes region is just for release availability. 
    // For "Korean Dramas", usually we want with_original_language='ko'.
  }
  if (filters.primary_release_year) params.append('primary_release_year', filters.primary_release_year);
  if (filters.vote_count_gte) params.append('vote_count.gte', filters.vote_count_gte);
  if (filters.with_original_language) params.append('with_original_language', filters.with_original_language);
  // ------------------------

  if (originalLanguage) {
    params.append('with_original_language', originalLanguage);
  }

  const url = `${TMDB_BASE_URL}discover/${mediaType}?${params.toString()}`;
  const cacheKey = `discover:${mediaType}:${params.toString()}`;

  // Check cache
  const cachedData = apiCache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }


  // Enhanced logging for debugging
  console.log(`[discoverMedia] Fetching URL: ${url}`);
  console.log('[discoverMedia] Params:', Object.fromEntries(params.entries()));

  try {
    const response = await fetch(url);
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseErr) {
      console.error("[discoverMedia] Failed to parse JSON:", parseErr, "Raw response:", text);
      return null;
    }
    if (!response.ok) {
      console.error(`[discoverMedia] HTTP error! status: ${response.status}`, data);
      return null;
    }
    if (!data || typeof data !== 'object') {
      console.error("[discoverMedia] No data or invalid data object returned:", data);
      return null;
    }
    if (Array.isArray(data.results) && data.results.length === 0) {
      console.warn("[discoverMedia] Empty results array returned for:", url);
    }
    // Cache the result
    apiCache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`[discoverMedia] Error discovering ${mediaType}:`, error);
    console.error("[discoverMedia] Failed API Request URL:", url);
    return null;
  }
};



export const getPersonDetails = async (personId) => {
  if (!personId) return null;
  return fetchFromTMDB(`person/${personId}`, { append_to_response: 'combined_credits' });
};


