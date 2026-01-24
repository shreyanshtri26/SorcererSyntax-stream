import React, { forwardRef, useState, useEffect, useCallback, useRef } from 'react';
import ArtistDetailsModal from './ArtistDetailsModal';
import AlbumDetailView from './AlbumDetailView';
import MusicInstantSearchResults from './MusicInstantSearchResults';
import { usePlayer } from '../context/PlayerContext';
import {
  searchSpotifyTracks,
  searchMusicVideos,
  getRandomSpotifyTrackByLanguage,
  getPlaylistTracks,
  searchSpotifyAll,
  searchSpotifyAlbums,
  getNewReleasesSpotify
} from '../api/api';
import debounce from 'lodash.debounce';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

// --- Spotify Playlist IDs and Music Queries ---
const HOMEPAGE_PLAYLIST_IDS = [
  "37i9dQZF1DXcBWIGoYBM5M", // Today's Top Hits (global, public)
  "37i9dQZF1DX5Ejj0EkURtP", // All Out 2020s (public)
  "37i9dQZF1DWXRqgorJj26U", // Global Top 50 (fallback, public)
];
const HOMEPAGE_ITEM_LIMIT = 12;

const MusicHub = forwardRef(({ currentTheme }, ref) => {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const location = useLocation();

  const { playTrack, addToQueue, playNext } = usePlayer();
  const [musicSearchQuery, setMusicSearchQuery] = useState('');
  const [musicInstantResults, setMusicInstantResults] = useState(null);
  const [isMusicInstantLoading, setIsMusicInstantLoading] = useState(false);
  const [showMusicInstantResults, setShowMusicInstantResults] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [hotHitsIndiaTracks, setHotHitsIndiaTracks] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isHomepageLoading, setIsHomepageLoading] = useState(true);

  // Load recent searches on mount
  useEffect(() => {
    const saved = localStorage.getItem('music_recent_searches');
    if (saved) setRecentSearches(JSON.parse(saved));

    // Simulate initial loading for UX feel
    setTimeout(() => setIsHomepageLoading(false), 800);
  }, []);

  const addToRecentSearches = (query) => {
    if (!query || query.length < 2) return;
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('music_recent_searches', JSON.stringify(updated));
  };
  const [fatalError, setFatalError] = useState(null);
  const [isYouTubeLoading, setIsYouTubeLoading] = useState(false);

  // Determine view based on URL
  const getViewType = () => {
    if (location.pathname.includes('/artist/')) return 'artist';
    if (location.pathname.includes('/album/')) return 'album';
    return 'search';
  };

  const currentView = { type: getViewType(), id: routeId };

  const navigateTo = (view) => {
    if (view.type === 'artist') navigate(`/artist/${view.id}`);
    else if (view.type === 'album') navigate(`/album/${view.id}`);
    else navigate('/music');
  };

  const goBack = () => navigate(-1);

  // --- Instant Search ---
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
      try {
        const spotifyResults = await searchSpotifyAll(query, 5, 0);
        // Remove "The Weeknd" from results
        const filterFn = (items) => (items || []).filter(i =>
          !i.name?.toLowerCase().includes('weeknd') &&
          !(i.artists?.some(a => a.name?.toLowerCase().includes('weeknd')))
        );
        const filtered = {
          tracks: filterFn(spotifyResults.tracks),
          artists: filterFn(spotifyResults.artists),
          albums: filterFn(spotifyResults.albums),
        };
        setIsMusicInstantLoading(false);
        setMusicInstantResults(filtered);
      } catch (error) {
        console.error("Instant music search error:", error);
        setApiError(error.message || "Failed to fetch results");
        setIsMusicInstantLoading(false);
        setMusicInstantResults(null);
      }
    }, 350),
    []
  );

  const handleMusicSearchChange = (e) => {
    const query = e.target.value;
    setMusicSearchQuery(query);
    if (query.length >= 3) {
      fetchMusicInstantResults(query);
      addToRecentSearches(query);
    } else {
      setMusicInstantResults(null);
      setShowMusicInstantResults(false);
      setIsMusicInstantLoading(false);
      fetchMusicInstantResults.cancel?.();
    }
  };

  // --- Global Play Handler ---
  const handlePlayTrackRequest = useCallback(async (track, forcedVideoId = null) => {
    console.log('[MusicHub] Playing track via global player', track, 'Forced ID:', forcedVideoId);
    if (!track || !track.id) return;

    let youtubeId = forcedVideoId || track.youtubeId;
    if (!youtubeId && track.name && track.artists) {
      setIsYouTubeLoading(true);
      try {
        const query = `${track.name} ${track.artists.map(a => a.name).join(' ')}`;
        const videos = await searchMusicVideos(query);
        if (videos?.[0]?.id) {
          youtubeId = videos[0].id;
        }
      } catch (err) {
        console.error('[MusicHub] YouTube search error:', err);
      }
      setIsYouTubeLoading(false);
    }

    playTrack(track, youtubeId);
  }, [playTrack]);

  const handleMusicInstantResultSelect = (item, type) => {
    if (type === 'track') {
      handlePlayTrackRequest(item);
    } else if (type === 'artist') {
      navigateTo({ type: 'artist', id: item.id });
    } else if (type === 'album') {
      navigateTo({ type: 'album', id: item.id });
    }
  };

  // --- Random Shuffle Logic ---
  const [randomTrack, setRandomTrack] = useState(null);
  const [randomTrackLoading, setRandomTrackLoading] = useState(false);

  async function fetchAndSetRandomTrack() {
    setRandomTrackLoading(true);
    try {
      const langs = ['english', 'hindi', 'bhojpuri'];
      const lang = langs[Math.floor(Math.random() * langs.length)];
      let track = await getRandomSpotifyTrackByLanguage(lang);
      // Ensure no "The Weeknd" in random picks
      while (track && track.artists?.some(a => a.name?.toLowerCase().includes('weeknd'))) {
        track = await getRandomSpotifyTrackByLanguage(lang);
      }
      setRandomTrack(track);
    } catch (e) {
      console.error('Shuffle error:', e);
    } finally {
      setRandomTrackLoading(false);
    }
  }

  useEffect(() => {
    fetchAndSetRandomTrack();
  }, []);

  if (fatalError) return <div className="music-hub-error">Error loading Music Hub</div>;

  return (
    <div className="music-hub-container">
      <div className="music-hub-layout full-width">
        <div className="music-main-content">
          {/* --- Search Bar --- */}
          <div className="music-hub-search-bar">
            <input
              className="music-hub-search-input"
              type="text"
              value={musicSearchQuery}
              onChange={handleMusicSearchChange}
              placeholder="Search music, albums, artists..."
              aria-label="Search music"
            />
            {isYouTubeLoading && <div className="yt-searching-toast">Finding Video Source...</div>}
          </div>

          {/* Recent Searches */}
          {musicSearchQuery.length === 0 && recentSearches.length > 0 && currentView.type === 'search' && (
            <div className="recent-searches-row">
              <span className="label">Recent:</span>
              {recentSearches.map(s => (
                <button key={s} className="search-tag" onClick={() => handleMusicSearchChange({ target: { value: s } })}>
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="music-view-viewport">
            {/* --- Instant Search Results --- */}
            {showMusicInstantResults && (
              <MusicInstantSearchResults
                results={musicInstantResults}
                onSelect={handleMusicInstantResultSelect}
                onSelectArtist={artistId => navigateTo({ type: 'artist', id: artistId })}
                onSelectAlbum={albumId => navigateTo({ type: 'album', id: albumId })}
                onSelectTrack={handlePlayTrackRequest}
                onBack={goBack}
                currentTheme={currentTheme}
              />
            )}

            {/* --- Random Shuffle Song --- */}
            {musicSearchQuery.length === 0 && currentView.type === 'search' && (
              <div className="music-dashboard-home">
                <div className="random-track-card">
                  {randomTrack && !randomTrackLoading ? (
                    <>
                      <div className="card-badge">RANDOM PICK</div>
                      <div className="card-info">
                        <h3>{randomTrack.name}</h3>
                        <p>{randomTrack.artists?.map(a => a.name).join(', ')}</p>
                      </div>
                      <div className="card-actions">
                        <button className="play-pill" onClick={() => handlePlayTrackRequest(randomTrack)}>Play Now</button>
                        <button className="secondary-btn" onClick={() => playNext(randomTrack)}>Play Next</button>
                        <button className="secondary-btn" onClick={() => addToQueue(randomTrack)}>Add to Queue</button>
                        <button className="shuffle-icon-btn" onClick={fetchAndSetRandomTrack}>Shuffle</button>
                      </div>
                    </>
                  ) : <div className="skeleton-line"></div>}
                </div>

                <div className="music-section-grid">
                  {/* Future Sections: New Releases, Trending, etc */}
                  <h3>Explore More</h3>
                  <div className="empty-state">Coming Soon: Your Library & Favorites</div>
                </div>
              </div>
            )}

            {/* Artist Details Modal */}
            {currentView.type === 'artist' && (
              <ArtistDetailsModal
                artistId={currentView.id}
                onSelectAlbum={albumId => navigateTo({ type: 'album', id: albumId })}
                onSelectArtist={artistId => navigateTo({ type: 'artist', id: artistId })}
                onBack={goBack}
                currentTheme={currentTheme}
                onPlayLocal={handlePlayTrackRequest}
              />
            )}

            {/* Album Detail View */}
            {currentView.type === 'album' && (
              <AlbumDetailView
                albumId={currentView.id}
                onSelectArtist={artistId => navigateTo({ type: 'artist', id: artistId })}
                onBack={goBack}
                currentTheme={currentTheme}
                onPlayLocal={handlePlayTrackRequest}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default MusicHub;
