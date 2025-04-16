import React, { forwardRef, useState, useEffect, useCallback, useRef } from 'react';
import SpotifyPlayer from './SpotifyPlayer';
import MusicPlayer from './MusicPlayer';
import ArtistDetailsModal from './ArtistDetailsModal';
import AlbumDetailView from './AlbumDetailView';
import MusicInstantSearchResults from './MusicInstantSearchResults';
import { searchSpotifyTracks, searchMusicVideos, getRandomSpotifyTrackByLanguage } from '../api/api';
import debounce from 'lodash.debounce';
import {
  getPlaylistTracks,
  searchSpotifyAll,
  searchSpotifyAlbums,
  getNewReleasesSpotify
} from '../api/api';

// --- Spotify Playlist IDs and Music Queries ---
const HOMEPAGE_PLAYLIST_IDS = [
  "37i9dQZF1DXcBWIGoYBM5M", // Today's Top Hits (global, public)
  "37i9dQZF1DX5Ejj0EkURtP", // All Out 2020s (public)
  "37i9dQZF1DWXRqgorJj26U", // Global Top 50 (fallback, public)
];
const HINDI_ALBUM_QUERY = "Hindi";
const ENGLISH_POP_ALBUM_QUERY = "English Pop";
const BHOJPURI_ALBUM_QUERY = "Bhojpuri";
const HOMEPAGE_ITEM_LIMIT = 12;
const TOP_TRACK_LIMIT = 10;
const ENGLISH_TRACK_QUERY = "Top English";
const HINDI_TRACK_QUERY = "Top Hindi";
const BHOJPURI_TRACK_QUERY = "Top Bhojpuri";

// Try multiple playlist IDs in order, return first that works, else throw
async function fetchWithFallbackPlaylist(limit, offset) {
  let lastError = null;
  for (const playlistId of HOMEPAGE_PLAYLIST_IDS) {
    try {
      return await getPlaylistTracks(playlistId, limit, offset);
    } catch (error) {
      lastError = error;
      // If not a 404, break immediately
      if (!error.message || !error.message.includes('404')) break;
    }
  }
  throw new Error(
    `All homepage playlists failed: ` + (lastError?.message || 'Unknown error')
  );
}

const MusicHub = forwardRef(({ currentTheme, navStackState, setNavStackState }, ref) => {
  const [musicSearchQuery, setMusicSearchQuery] = useState('');
  const [musicInstantResults, setMusicInstantResults] = useState(null);
  const [isMusicInstantLoading, setIsMusicInstantLoading] = useState(false);
  const [showMusicInstantResults, setShowMusicInstantResults] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [hotHitsIndiaTracks, setHotHitsIndiaTracks] = useState([]);
  const [hindiAlbums, setHindiAlbums] = useState([]);
  const [englishAlbums, setEnglishAlbums] = useState([]);
  const [bhojpuriAlbums, setBhojpuriAlbums] = useState([]);
  const [newReleasesIndia, setNewReleasesIndia] = useState([]);
  const [topEnglishTracks, setTopEnglishTracks] = useState([]);
  const [topHindiTracks, setTopHindiTracks] = useState([]);
  const [topBhojpuriTracks, setTopBhojpuriTracks] = useState([]);
  const [isHomepageLoading, setIsHomepageLoading] = useState(true);
  const [fatalError, setFatalError] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null);
  const [isYouTubeLoading, setIsYouTubeLoading] = useState(false);
  const spotifyPlayerRef = useRef(null);
  const youtubePlayerRef = useRef(null);
  const heldStartRef = useRef(null);

  // Centralized navigation stack with preservation
  let initialNavStack = [{ type: 'search' }];
  if (navStackState && Array.isArray(navStackState) && navStackState.length > 0) {
    initialNavStack = navStackState;
  } else if (navStackState && Array.isArray(navStackState) && navStackState.length === 0) {
    initialNavStack = [{ type: 'search' }];
  }
  const [navStack, setNavStack] = useState(initialNavStack);

  // Debug logging (must come after navStack is declared)
  useEffect(() => {
    console.log('[MusicHub] navStackState:', navStackState);
    console.log('[MusicHub] navStack:', navStack);
    console.log('[MusicHub] fatalError:', fatalError);
  }, [navStackState, navStack, fatalError]);

  // Keep navStackState in sync with parent (App)
  useEffect(() => {
    setNavStackState(navStack);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navStack]);

  const navigateTo = (view) => setNavStack(prev => [...prev, view]);
  const goBack = () => setNavStack(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
  const currentView = navStack[navStack.length - 1];

  // --- Error Boundary ---
  if (fatalError) {
    return (
      <div style={{ color: 'red', padding: '2em', background: '#222' }}>
        <h2>MusicHub Error</h2>
        <pre>{fatalError && fatalError.toString ? fatalError.toString() : JSON.stringify(fatalError)}</pre>
        <pre>navStackState: {JSON.stringify(navStackState)}</pre>
        <pre>navStack: {JSON.stringify(navStack)}</pre>
      </div>
    );
  }

  // --- Instant Search (Spotify API v1 compliant) ---
  const fetchMusicInstantResults = useCallback(
    debounce(async (query) => {
      if (!query || query.length < 3) {
        setMusicInstantResults(null);
        setShowMusicInstantResults(false);
        setIsMusicInstantLoading(false);
        return;
      }
      setIsMusicInstantLoading(true);
      setApiError(null);
      setShowMusicInstantResults(true);
      setMusicInstantResults(null);
      try {
        // Use the new unified search
        const spotifyResults = await searchSpotifyAll(query, 5, 0);
        setIsMusicInstantLoading(false);
        setMusicInstantResults(spotifyResults);
      } catch (error) {
        console.error("Instant music search error:", error);
        setApiError(error.message || "Failed to fetch results");
        setIsMusicInstantLoading(false);
        setMusicInstantResults(null);
        setShowMusicInstantResults(true);
      }
    }, 350),
    []
  );

  // --- Music SearchBar Focus Handler (no-op for now, but needed for input)
  const handleMusicSearchFocus = () => {};

  // --- Music SearchBar Blur Handler (no-op for now, but needed for input)
  const handleMusicSearchBlur = () => {};

  const handleMusicSearchChange = (e) => {
    const query = e.target.value;
    setMusicSearchQuery(query);
    if (query.length >= 3) {
      fetchMusicInstantResults(query);
    } else {
      setMusicInstantResults(null);
      setShowMusicInstantResults(false);
      setIsMusicInstantLoading(false);
      fetchMusicInstantResults.cancel?.();
    }
    // Always reset to search view
    setNavStack([{ type: 'search' }]);
  };

  // --- Handler to play a track from anywhere (search, artist, album) ---
  const handlePlayTrackRequest = useCallback(async (track) => {
    console.log('[MusicHub] handlePlayTrackRequest called', track);
    if (!track || !track.id || (!track.uri && !track.youtubeId)) {
      setApiError("Track is not available for playback (missing Spotify URI and YouTube ID).");
      return;
    }
    // If youtubeId is missing, search for it
    if (!track.youtubeId && track.name && track.artists) {
      setIsYouTubeLoading(true);
      try {
        const query = `${track.name} ${track.artists.map(a => a.name).join(' ')}`;
        const videos = await searchMusicVideos(query);
        if (videos && videos[0] && videos[0].id) {
          track = { ...track, youtubeId: videos[0].id };
          console.log('[MusicHub] Attached youtubeId to track:', track.youtubeId);
        } else {
          console.warn('[MusicHub] No YouTube video found for', query);
        }
      } catch (err) {
        console.error('[MusicHub] Error searching YouTube for track:', err);
      }
      setIsYouTubeLoading(false);
    }
    // Always navigate with a new object to ensure re-render
    navigateTo({ type: 'track', track: { ...track } });
    setTimeout(() => {
      const playerContainer = document.querySelector('.music-player-container, .spotify-player-container');
      if (playerContainer) {
        playerContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        console.log('[MusicHub] Scrolled to player container');
      }
    }, 100);
  }, []);

  const handleMusicInstantResultSelect = (item, type) => {
    if (type === 'track') {
      handlePlayTrackRequest(item);
    } else if (type === 'artist') {
      navigateTo({ type: 'artist', id: item.id });
    } else if (type === 'album') {
      navigateTo({ type: 'album', id: item.id });
    }
  };

  useEffect(() => {
    if (currentView.type === 'track' && currentView.track) {
      if (currentView.track.uri) setSelectedSource('spotify');
      else if (currentView.track.youtubeId) setSelectedSource('youtube');
      else setSelectedSource(null);
    }
  }, [currentView]);

  // --- Debug: Log navigation and currentView changes ---
  useEffect(() => {
    console.log('[MusicHub] navStack:', navStack);
    console.log('[MusicHub] currentView:', currentView);
  }, [navStack, currentView]);

  // --- Debug: Log when player is mounted and props received ---
  useEffect(() => {
    if (currentView.type === 'track' && currentView.track) {
      console.log('[MusicHub] Rendering player for track:', currentView.track);
    }
  }, [currentView]);

  // --- HELD START: When track changes, auto-play ---
  useEffect(() => {
    if (currentView.type === 'track') {
      const track = currentView.track;
      if (!track) return;
      if (selectedSource === 'spotify' && track.uri) {
        heldStartRef.current = () => {
          console.log('[MusicHub] heldStart: calling spotifyPlayerRef.start', track.uri);
          spotifyPlayerRef.current?.start({ uri: track.uri, startTime: 0 });
        };
        setTimeout(() => heldStartRef.current?.(), 200);
      } else if (selectedSource === 'youtube' && track.youtubeId) {
        heldStartRef.current = () => {
          console.log('[MusicHub] heldStart: calling youtubePlayerRef.start', track.youtubeId);
          youtubePlayerRef.current?.start({ videoId: track.youtubeId, startTime: 0 });
        };
        setTimeout(() => heldStartRef.current?.(), 200);
      }
    }
  }, [currentView, selectedSource]);

  // --- Helper to get a random language ---
  function getRandomLanguage() {
    const langs = ['english', 'hindi', 'bhojpuri'];
    return langs[Math.floor(Math.random() * langs.length)];
  }

  // --- State for current random track and loading/error ---
  const [randomTrack, setRandomTrack] = useState(null);
  const [randomTrackLoading, setRandomTrackLoading] = useState(false);
  const [randomTrackError, setRandomTrackError] = useState(null);

  // --- Fetch random track (dynamic, from API) ---
  async function fetchAndSetRandomTrack() {
    setRandomTrackLoading(true);
    setRandomTrackError(null);
    try {
      const lang = getRandomLanguage();
      const track = await getRandomSpotifyTrackByLanguage(lang);
      setRandomTrack(track);
    } catch (e) {
      setRandomTrackError(e.message || 'Failed to fetch random song');
    } finally {
      setRandomTrackLoading(false);
    }
  }

  // --- On mount, fetch a random track ---
  useEffect(() => {
    fetchAndSetRandomTrack();
    // eslint-disable-next-line
  }, []);

  // --- Shuffle handler ---
  function handleShuffle() {
    fetchAndSetRandomTrack();
  }

  return (
    <div className="music-hub-container">
      {/* --- Search Bar --- */}
      <div className="music-hub-search-bar">
        <input
          className="music-hub-search-input"
          type="text"
          value={musicSearchQuery}
          onChange={handleMusicSearchChange}
          placeholder="Search music, albums, artists..."
          aria-label="Search music"
          style={{ height: 60 }}
        />
      </div>
      {/* --- Instant Search Results --- */}
      {showMusicInstantResults && (
        <MusicInstantSearchResults
          results={musicInstantResults}
          onSelect={handleMusicInstantResultSelect}
          onSelectArtist={artistId => navigateTo({ type: 'artist', id: artistId })}
          onSelectAlbum={albumId => navigateTo({ type: 'album', id: albumId })}
          onSelectTrack={handlePlayTrackRequest}
          navStack={navStack}
          onBack={goBack}
          currentTheme={currentTheme}
        />
      )}
      {/* --- Random Shuffle Song (HIDE when searching) --- */}
      {musicSearchQuery.length === 0 && (
        <div className="random-track-container">
          {randomTrack && !randomTrackLoading ? (
            <>
              <div className="random-track-title">Random Shuffle Song</div>
              <div className="random-track-details">
                <span>{randomTrack.name}</span> by <span>{randomTrack.artists?.map(a => a.name).join(', ')}</span>
              </div>
              <button
                className="shuffle-btn"
                onClick={handleShuffle}
                disabled={randomTrackLoading}
              >
                Shuffle Again
              </button>
              <button
                className="play-btn"
                onClick={() => handlePlayTrackRequest(randomTrack)}
                disabled={randomTrackLoading}
              >
                Play
              </button>
            </>
          ) : randomTrackLoading ? (
            <div style={{ color: '#bbb', marginTop: 18 }}>Loading random song…</div>
          ) : null}
        </div>
      )}
      {apiError && <div className="music-hub-error">{apiError}</div>}
      {isHomepageLoading ? (
        <div className="music-hub-loading"></div>
      ) : hotHitsIndiaTracks.length === 0 ? (
        <div className="music-hub-error">No playlists available right now. Try again later or check your Spotify connection!</div>
      ) : null}
      {currentView.type === 'track' && (
        (() => {
          const track = currentView.track;
          const hasSpotify = !!track?.uri;
          const hasYouTube = !!track?.youtubeId;
          const canToggle = hasSpotify && hasYouTube;
          const isSpotify = selectedSource === 'spotify' && hasSpotify;
          const isYouTube = selectedSource === 'youtube' && hasYouTube;

          return (
            <div className={isSpotify ? 'spotify-player-container' : 'music-player-container'} style={{ position: 'relative' }}>
              {/* Dropdown Source Selector */}
              {(hasSpotify || hasYouTube) && (
                <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 30 }}>
                  <select
                    className={`player-source-dropdown theme-${currentTheme}-btn`}
                    value={selectedSource || ''}
                    onChange={e => setSelectedSource(e.target.value)}
                    style={{ padding: '8px 16px', borderRadius: 24, fontWeight: 'bold', fontSize: 16 }}
                    disabled={isYouTubeLoading}
                  >
                    {hasSpotify && <option value="spotify">Spotify</option>}
                    {hasYouTube && <option value="youtube">YouTube</option>}
                  </select>
                  {isYouTubeLoading && <span style={{ marginLeft: 10, color: '#888', fontSize: 14 }}>Loading YouTube…</span>}
                </div>
              )}
              {isSpotify ? (
                <SpotifyPlayer
                  ref={spotifyPlayerRef}
                  uri={track.uri}
                  startTime={0}
                  key={`spotify-${track.id}`}
                />
              ) : isYouTube ? (
                <MusicPlayer
                  ref={youtubePlayerRef}
                  videoId={track.youtubeId}
                  startTime={0}
                  key={`youtube-${track.id}`}
                />
              ) : (
                <div className="music-hub-error">No player available for this track.</div>
              )}
            </div>
          );
        })()
      )}
      {/* Artist Details Modal with fallback UI and debug info */}
      {currentView.type === 'artist' && (
        currentView.id ? (
          <ArtistDetailsModal
            artistId={currentView.id}
            onSelectAlbum={albumId => navigateTo({ type: 'album', id: albumId })}
            onSelectArtist={artistId => navigateTo({ type: 'artist', id: artistId })}
            onBack={goBack}
            navStack={navStack}
            currentTheme={currentTheme}
            key={currentView.id || 'unknown-artist'}
            onPlayLocal={handlePlayTrackRequest}
          />
        ) : (
          <div className="music-hub-error">No artist selected. Debug: {JSON.stringify(currentView)}</div>
        )
      )}
      {/* Album Detail View with fallback UI and debug info */}
      {currentView.type === 'album' && (
        currentView.id ? (
          <AlbumDetailView
            albumId={currentView.id}
            onSelectArtist={artistId => navigateTo({ type: 'artist', id: artistId })}
            onBack={goBack}
            navStack={navStack}
            currentTheme={currentTheme}
            key={currentView.id || 'unknown-album'}
            onPlayLocal={handlePlayTrackRequest}
          />
        ) : (
          <div className="music-hub-error">No album selected. Debug: {JSON.stringify(currentView)}</div>
        )
      )}
    </div>
  );
});

export default MusicHub;