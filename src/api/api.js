// Use the API key directly instead of from environment variables
const TMDB_API_KEY = "9a5a0e6e93d4b73e87566b319e8cfb95";
const TMDB_BASE_URL = 'https://api.themoviedb.org/3/';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_DEFAULT_LANGUAGE = 'en-US';

async function fetchFromTMDB(endpoint, params = {}, language = TMDB_DEFAULT_LANGUAGE) {
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
    return data.results || data;
  } catch (error) {
    console.error("Error fetching from TMDB API:", error);
    return null;
  }
}

export const getTrendingMovies = () => fetchFromTMDB('trending/movie/week');
export const getTrendingTVShows = () => fetchFromTMDB('trending/tv/week');
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
    if (originalLanguage) {
        params.append('with_original_language', originalLanguage);
    }

    const url = `${TMDB_BASE_URL}discover/${mediaType}?${params.toString()}`;

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
        return data;
    } catch (error) {
        console.error(`[discoverMedia] Error discovering ${mediaType}:`, error);
        console.error("[discoverMedia] Failed API Request URL:", url);
        return null;
    }
};

const SPOTIFY_CLIENT_ID = "509cc13fb5ad4f57ac0a1ba95bcc99c2";
const SPOTIFY_CLIENT_SECRET = "cd797f24dfa448138f04edcd86c57c3f";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

let spotifyAccessToken = null;
let spotifyTokenExpiresAt = 0;

async function fetchSpotifyAccessToken() {
  const creds = btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${creds}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });
  if (!response.ok) throw new Error("Failed to fetch Spotify access token");
  const data = await response.json();
  spotifyAccessToken = data.access_token;
  spotifyTokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000; // refresh 1 min early
}

async function getSpotifyToken() {
  if (!spotifyAccessToken || Date.now() > spotifyTokenExpiresAt) {
    await fetchSpotifyAccessToken();
  }
  return spotifyAccessToken;
}

function getSpotifyHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export async function getPlaylistTracks(playlistId, limit = 50, offset = 0, market) {
  const token = await getSpotifyToken();
  let url = `${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`;
  if (market) {
    url += `&market=${market}`;
  }
  const response = await fetch(url, { headers: getSpotifyHeaders(token) });
  if (!response.ok) {
    let errorMsg = response.statusText;
    try {
      const errJson = await response.json();
      errorMsg = errJson.error?.message || JSON.stringify(errJson);
    } catch {}
    throw new Error(`Spotify API Error: ${errorMsg}`);
  }
  const data = await response.json();
  return data.items;
}

export async function searchSpotifyTracks(query, limit = 20, offset = 0, market) {
  const token = await getSpotifyToken();
  let url = `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}&offset=${offset}`;
  if (market) {
    url += `&market=${market}`;
  }
  const response = await fetch(url, { headers: getSpotifyHeaders(token) });
  if (!response.ok) {
    let errorMsg = response.statusText;
    try {
      const errJson = await response.json();
      errorMsg = errJson.error?.message || JSON.stringify(errJson);
    } catch {}
    throw new Error(`Spotify API Error: ${errorMsg}`);
  }
  const data = await response.json();
  return data.tracks.items;
}

export async function searchSpotifyAlbums(query, limit = 20, offset = 0, market) {
  const token = await getSpotifyToken();
  let url = `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=album&limit=${limit}&offset=${offset}`;
  if (market) {
    url += `&market=${market}`;
  }
  const response = await fetch(url, { headers: getSpotifyHeaders(token) });
  if (!response.ok) {
    let errorMsg = response.statusText;
    try {
      const errJson = await response.json();
      errorMsg = errJson.error?.message || JSON.stringify(errJson);
    } catch {}
    throw new Error(`Spotify API Error: ${errorMsg}`);
  }
  const data = await response.json();
  return data.albums.items;
}

export async function getNewReleasesSpotify(limit = 20, offset = 0, market) {
  const token = await getSpotifyToken();
  let url = `${SPOTIFY_API_BASE}/browse/new-releases?limit=${limit}&offset=${offset}`;
  if (market) {
    url += `&market=${market}`;
  }
  const response = await fetch(url, { headers: getSpotifyHeaders(token) });
  if (!response.ok) {
    let errorMsg = response.statusText;
    try {
      const errJson = await response.json();
      errorMsg = errJson.error?.message || JSON.stringify(errJson);
    } catch {}
    throw new Error(`Spotify API Error: ${errorMsg}`);
  }
  const data = await response.json();
  return data.albums.items;
}

export async function getAlbumDetails(albumId, market) {
  const token = await getSpotifyToken();
  let url = `${SPOTIFY_API_BASE}/albums/${albumId}`;
  if (market) {
    url += `?market=${market}`;
  }
  const response = await fetch(url, { headers: getSpotifyHeaders(token) });
  if (!response.ok) {
    let errorMsg = response.statusText;
    try {
      const errJson = await response.json();
      errorMsg = errJson.error?.message || JSON.stringify(errJson);
    } catch {}
    throw new Error(`Spotify API Error: ${errorMsg}`);
  }
  return await response.json();
}

export async function getArtistDetails(artistId, market) {
  const token = await getSpotifyToken();
  let url = `${SPOTIFY_API_BASE}/artists/${artistId}`;
  if (market) {
    url += `?market=${market}`;
  }
  const response = await fetch(url, { headers: getSpotifyHeaders(token) });
  if (!response.ok) {
    let errorMsg = response.statusText;
    try {
      const errJson = await response.json();
      errorMsg = errJson.error?.message || JSON.stringify(errJson);
    } catch {}
    throw new Error(`Spotify API Error: ${errorMsg}`);
  }
  return await response.json();
}

// --- Unified Spotify Search (tracks, albums, artists) ---
// Uses the /v1/search endpoint with type=track,artist,album
export async function searchSpotifyAll(query, limit = 5, offset = 0, market) {
  const token = await getSpotifyToken();
  let url = `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=track,artist,album&limit=${limit}&offset=${offset}`;
  if (market) {
    url += `&market=${market}`;
  }
  const response = await fetch(url, { headers: getSpotifyHeaders(token) });
  if (!response.ok) {
    let errorMsg = response.statusText;
    try {
      const errJson = await response.json();
      errorMsg = errJson.error?.message || JSON.stringify(errJson);
    } catch {}
    throw new Error(`Spotify API Error: ${errorMsg}`);
  }
  const data = await response.json();
  return {
    tracks: data.tracks?.items || [],
    artists: data.artists?.items || [],
    albums: data.albums?.items || [],
  };
}

// --- Artist Details Helpers ---
export async function getArtistTopTracks(artistId, market = 'IN') {
  const token = await getSpotifyToken();
  let url = `${SPOTIFY_API_BASE}/artists/${artistId}/top-tracks?market=${market}`;
  const response = await fetch(url, { headers: getSpotifyHeaders(token) });
  if (!response.ok) {
    let errorMsg = response.statusText;
    try {
      const errJson = await response.json();
      errorMsg = errJson.error?.message || JSON.stringify(errJson);
    } catch {}
    throw new Error(`Spotify API Error: ${errorMsg}`);
  }
  const data = await response.json();
  return data.tracks || [];
}

export async function getArtistAlbums(artistId, limit = 10, market = 'IN') {
  const token = await getSpotifyToken();
  let url = `${SPOTIFY_API_BASE}/artists/${artistId}/albums?limit=${limit}&market=${market}`;
  const response = await fetch(url, { headers: getSpotifyHeaders(token) });
  if (!response.ok) {
    let errorMsg = response.statusText;
    try {
      const errJson = await response.json();
      errorMsg = errJson.error?.message || JSON.stringify(errJson);
    } catch {}
    throw new Error(`Spotify API Error: ${errorMsg}`);
  }
  const data = await response.json();
  return data.items || [];
}

export async function getRelatedArtists(artistId) {
  const token = await getSpotifyToken();
  let url = `${SPOTIFY_API_BASE}/artists/${artistId}/related-artists`;
  const response = await fetch(url, { headers: getSpotifyHeaders(token) });
  if (!response.ok) {
    let errorMsg = response.statusText;
    try {
      const errJson = await response.json();
      errorMsg = errJson.error?.message || JSON.stringify(errJson);
    } catch {}
    throw new Error(`Spotify API Error: ${errorMsg}`);
  }
  const data = await response.json();
  return data.artists || [];
}

export const getPersonDetails = async (personId) => {
    if (!personId) return null;
    const params = new URLSearchParams({
        api_key: TMDB_API_KEY,
        append_to_response: 'combined_credits', // Get credits along with details
        // language: 'en-US' // Add language if needed
    });
    const url = `${TMDB_BASE_URL}person/${personId}?${params.toString()}`;
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

// --- YouTube API Key (user provided) ---
const YOUTUBE_API_KEY = "AIzaSyBMxxzNxmbowlqERFIjJZjydY2kllv1xI8";

export async function searchMusicVideos(query, maxResults = 3) {
  if (!YOUTUBE_API_KEY) throw new Error("YouTube API key is missing");
  const url =
    `https://www.googleapis.com/youtube/v3/search?` +
    `part=snippet&type=video&videoCategoryId=10&q=${encodeURIComponent(query)}` +
    `&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    let errorMsg = response.statusText;
    try {
      const errJson = await response.json();
      errorMsg = errJson.error?.message || JSON.stringify(errJson);
    } catch {}
    throw new Error(`YouTube API Error: ${errorMsg}`);
  }
  const data = await response.json();
  return data.items.map(item => ({
    id: item.id.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails?.medium?.url,
    channel: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
    description: item.snippet.description
  }));
}

// --- Get a random Spotify track by language/market ---
/**
 * Fetches a random popular Spotify track for a given language (market).
 * @param {'english'|'hindi'|'bhojpuri'} language
 * @returns {Promise<Object>} Spotify track object
 */
export async function getRandomSpotifyTrackByLanguage(language) {
  // Map language to Spotify market code
  let market = 'US';
  let query = 'top hits';
  if (language === 'hindi') {
    market = 'IN';
    query = 'bollywood';
  } else if (language === 'bhojpuri') {
    market = 'IN';
    query = 'bhojpuri';
  }
  const token = await getSpotifyToken();
  // Search for tracks with the query in the right market
  const url = `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=track&market=${market}&limit=30`;
  const response = await fetch(url, { headers: getSpotifyHeaders(token) });
  if (!response.ok) {
    let errorMsg = response.statusText;
    try {
      const errJson = await response.json();
      errorMsg = errJson.error?.message || JSON.stringify(errJson);
    } catch {}
    throw new Error(`Spotify API Error: ${errorMsg}`);
  }
  const data = await response.json();
  const tracks = data.tracks?.items || [];
  if (tracks.length === 0) throw new Error('No tracks found');
  // Pick a random track from the results
  const idx = Math.floor(Math.random() * tracks.length);
  return tracks[idx];
}