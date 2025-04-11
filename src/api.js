import.meta.env;

// Use the API key directly instead of from environment variables
const API_KEY = "9a5a0e6e93d4b73e87566b319e8cfb95";
const BASE_URL = 'https://api.themoviedb.org/3/';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const DEFAULT_LANGUAGE = 'en-US';

async function fetchFromAPI(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', API_KEY);
  url.searchParams.append('language', DEFAULT_LANGUAGE);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.results || data; // Return results array or the full data object if no results key
  } catch (error) {
    console.error("Error fetching from TMDB API:", error);
    return null; // Return null or appropriate error handling
  }
}

export const getTrendingMovies = () => fetchFromAPI('trending/movie/week');
export const getTrendingTVShows = () => fetchFromAPI('trending/tv/week');
export const getTopRatedMovies = () => fetchFromAPI('movie/top_rated');
export const getTopRatedTVShows = () => fetchFromAPI('tv/top_rated');
export const searchMovies = (query) => fetchFromAPI('search/movie', { query: encodeURIComponent(query) });
export const searchTVShows = (query) => fetchFromAPI('search/tv', { query: encodeURIComponent(query) });
export const getLanguages = () => fetchFromAPI('configuration/languages');
export const getTVShowDetails = (tvId) => fetchFromAPI(`tv/${tvId}`);

// Function to get videos (trailers, teasers, etc.) for a movie or TV show
export const getVideos = (mediaType, id) => {
    if (!mediaType || !id) {
        console.error("Media type and ID are required to fetch videos.");
        return Promise.resolve(null); // Return a resolved promise with null
    }
    // Use the correct endpoint based on mediaType ('movie' or 'tv')
    const endpoint = `${mediaType}/${id}/videos`;
    return fetchFromAPI(endpoint);
};

// --- Added functions for filtering ---
export const getMovieGenres = () => fetchFromAPI('genre/movie/list');
export const getTVGenres = () => fetchFromAPI('genre/tv/list');

export const discoverMedia = (type, filters) => {
    const params = {};
    
    // Set translation language - default or based on filter
    let translationLanguage = filters.language ? filters.language : DEFAULT_LANGUAGE;

    if (filters.genres && filters.genres.length > 0) {
        params.with_genres = filters.genres.join(',');
    }
    if (filters.rating) {
        params['vote_average.gte'] = filters.rating;
    }
    if (filters.language) {
        // Filter by original language - THIS IS THE ACTUAL FILTER PARAMETER
        params.with_original_language = filters.language;
        // The translation language is already set above
    }
    if (filters.page) {
        params.page = filters.page;
    }

    const endpoint = `discover/${type}`;
    const url = new URL(`${BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', API_KEY);
    
    // Append the single, correct translation language parameter
    url.searchParams.append('language', translationLanguage);
    
    // Append all other filter parameters (like with_genres, vote_average.gte, with_original_language)
    Object.keys(params).forEach(key => {
        if (params[key]) { // Ensure value exists before appending
             url.searchParams.append(key, params[key]);
        }
    });

    // Use fetch directly
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                 console.error("API Request URL:", url.toString()); // Log URL on error
                throw new Error(`HTTP error! status: ${response.status} for URL: ${url.toString()}`);
            }
            return response.json();
        })
        .then(data => data.results || []) // Return results or empty array
        .catch(error => {
            console.error(`Error discovering ${type}:`, error);
             console.error("Failed API Request URL:", url.toString()); // Log URL on error
            return []; // Return empty array on error
        });
};

export { IMAGE_BASE_URL };