import.meta.env;

// Use the API key directly instead of from environment variables
const API_KEY = "9a5a0e6e93d4b73e87566b319e8cfb95";
const BASE_URL = 'https://api.themoviedb.org/3/';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const DEFAULT_LANGUAGE = 'en-US';

async function fetchFromAPI(endpoint, params = {}, language = DEFAULT_LANGUAGE) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', API_KEY);
  url.searchParams.append('language', language || DEFAULT_LANGUAGE);
  Object.keys(params).forEach(key => {
      if (key === 'query' && params[key]) {
          url.searchParams.append(key, encodeURIComponent(params[key]));
      } else if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key]);
      }
  });
  
  console.log(`Fetching URL: ${url.toString()}`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.results || data;
  } catch (error) {
    console.error("Error fetching from TMDB API:", error);
    return null;
  }
}

export const getTrendingMovies = () => fetchFromAPI('trending/movie/week');
export const getTrendingTVShows = () => fetchFromAPI('trending/tv/week');
export const getTopRatedMovies = () => fetchFromAPI('movie/top_rated');
export const getTopRatedTVShows = () => fetchFromAPI('tv/top_rated');
export const searchMovies = (query, page = 1, language = DEFAULT_LANGUAGE) => fetchFromAPI('search/movie', { query, page }, language);
export const searchTVShows = (query, page = 1, language = DEFAULT_LANGUAGE) => fetchFromAPI('search/tv', { query, page }, language);
export const searchMultiMedia = (query, page = 1, language = DEFAULT_LANGUAGE) => fetchFromAPI('search/multi', { query, page }, language);
export const getLanguages = () => fetchFromAPI('configuration/languages');
export const getTVShowDetails = (tvId, language = DEFAULT_LANGUAGE) => fetchFromAPI(`tv/${tvId}`, {}, language);

export const getVideos = (mediaType, id, language = DEFAULT_LANGUAGE) => {
    if (!mediaType || !id) {
        console.error("Media type and ID are required to fetch videos.");
        return Promise.resolve(null);
    }
    const endpoint = `${mediaType}/${id}/videos`;
    return fetchFromAPI(endpoint, {}, language);
};

export const getMovieGenres = () => fetchFromAPI('genre/movie/list');
export const getTVGenres = () => fetchFromAPI('genre/tv/list');

export const discoverMedia = async (mediaType, filters, page = 1, sortOption = 'popularity.desc') => {
    const params = new URLSearchParams({
        api_key: API_KEY,
        language: (filters.languages && filters.languages.length > 0 ? filters.languages.join('|') : 'en-US'),
        sort_by: sortOption,
        include_adult: false,
        include_video: false,
        page: page,
        'vote_average.gte': filters.rating || 0,
        with_genres: (filters.genres || []).join(','),
    });

    const url = `${BASE_URL}discover/${mediaType}?${params.toString()}`;

    console.log(`Fetching URL: ${url.toString()}`);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error discovering ${mediaType}:`, error);
        console.error("Failed API Request URL:", url.toString());
        return null;
    }
};

export const getPersonDetails = async (personId) => {
    if (!personId) return null;
    const params = new URLSearchParams({
        api_key: API_KEY,
        append_to_response: 'combined_credits', // Get credits along with details
        // language: 'en-US' // Add language if needed
    });
    const url = `${BASE_URL}person/${personId}?${params.toString()}`;
    console.log(`Fetching Person Details URL: ${url}`);
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching person details for ID ${personId}:`, error);
        console.error("Failed API Request URL:", url);
        return null; // Return null on error
    }
};

export { IMAGE_BASE_URL };