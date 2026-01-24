import React, { forwardRef, useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import debounce from 'lodash.debounce';

import ArtistDetailsModal from './ArtistDetailsModal';
import AlbumDetailView from './AlbumDetailView';
import MusicInstantSearchResults from './MusicInstantSearchResults';
import { usePlayer } from '../context/PlayerContext';
import {
  searchMusicVideos,
  getRandomSpotifyTrackByLanguage,
  searchSpotifyAll
} from '../api/api';

import './MusicHub.css';

const MusicHub = forwardRef(({ currentTheme }, ref) => {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const location = useLocation();
  const { playTrack, addToQueue, playNext } = usePlayer();

  // --- State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [instantResults, setInstantResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [randomTrack, setRandomTrack] = useState(null);
  const [isSearchingVideo, setIsSearchingVideo] = useState(false);

  // --- Initialization ---
  useEffect(() => {
    const saved = localStorage.getItem('music_recent_searches');
    if (saved) setRecentSearches(JSON.parse(saved));
    fetchRandomTrack();
  }, []);

  const addToRecent = (query) => {
    if (!query || query.length < 2) return;
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('music_recent_searches', JSON.stringify(updated));
  };

  // --- Search Logic ---
  const performSearch = useCallback(
    debounce(async (query) => {
      if (!query || query.length < 3) return;
      setIsLoading(true);
      setShowResults(true);
      try {
        const results = await searchSpotifyAll(query, 12, 0);
        // Exclude specific artists if needed (previously Weeknd was excluded)
        const filterItems = (items) => (items || []).filter(i =>
          !i.name?.toLowerCase().includes('weeknd') &&
          !(i.artists?.some(a => a.name?.toLowerCase().includes('weeknd')))
        );

        setInstantResults({
          tracks: filterItems(results.tracks),
          artists: filterItems(results.artists),
          albums: filterItems(results.albums),
        });
      } catch (err) {
        console.error("Search Failed:", err);
      } finally {
        setIsLoading(false);
      }
    }, 400),
    []
  );

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.length >= 3) {
      performSearch(val);
      addToRecent(val);
    } else {
      setShowResults(false);
      setInstantResults(null);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowResults(false);
    setInstantResults(null);
  };

  // --- Playback ---
  // --- Playback ---
  const handlePlayRequest = useCallback((track) => {
    if (!track) return;
    playTrack(track); // Context now handles finding the video ID if needed
  }, [playTrack]);

  // --- Navigation Helpers ---
  const viewType = location.pathname.includes('/artist/') ? 'artist' : location.pathname.includes('/album/') ? 'album' : 'home';

  const fetchRandomTrack = async () => {
    try {
      const langs = ['english', 'hindi', 'bhojpuri'];
      const lang = langs[Math.floor(Math.random() * langs.length)];
      const track = await getRandomSpotifyTrackByLanguage(lang);
      if (track) setRandomTrack(track);
    } catch (e) { console.error("Random track error:", e); }
  };

  return (
    <div className={`music-hub-container theme-${currentTheme}`}>
      <div className="music-main-content">

        {/* Search Header */}
        {viewType === 'home' && (
          <div className="music-hub-search-bar">
            <input
              type="text"
              className="music-hub-search-input"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Artists, songs, or albums"
            />
            {isSearchingVideo && <div className="yt-searching-toast">Getting Video Source...</div>}

            {searchQuery === '' && recentSearches.length > 0 && (
              <div className="recent-searches-row">
                {recentSearches.map(s => (
                  <button key={s} className="search-tag" onClick={() => handleSearchChange({ target: { value: s } })}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="music-view-viewport">
          {/* 1. Results Overlay/View */}
          {viewType === 'home' && showResults && (
            <MusicInstantSearchResults
              results={instantResults}
              isLoading={isLoading}
              onBack={clearSearch}
              onSelectArtist={id => { clearSearch(); navigate(`/artist/${id}`); }}
              onSelectAlbum={id => { clearSearch(); navigate(`/album/${id}`); }}
              onSelectTrack={handlePlayRequest}
              currentTheme={currentTheme}
            />
          )}

          {/* 2. Home Dashboard */}
          {viewType === 'home' && !showResults && (
            <div className="music-dashboard-home">
              {randomTrack && (
                <div className="random-track-card">
                  <span className="card-badge">SURPRISE MIX</span>
                  <div className="card-info">
                    <h3>{randomTrack.name}</h3>
                    <p>{randomTrack.artists?.map(a => a.name).join(', ')}</p>
                  </div>
                  <div className="card-actions">
                    <button className="play-pill" onClick={() => handlePlayRequest(randomTrack)}>Play Now</button>
                    <button className="shuffle-icon-btn" onClick={fetchRandomTrack}>Shuffle</button>
                    <button className="secondary-btn" onClick={() => addToQueue(randomTrack)}>Add to Queue</button>
                  </div>
                </div>
              )}

              <div className="music-section-grid">
                <h3>Recently Searched</h3>
                {recentSearches.length > 0 ? (
                  <div className="recent-searches-list">
                    {/* Add more logic here for recent entities if desired */}
                    <div className="empty-state">Continue where you left off.</div>
                  </div>
                ) : (
                  <div className="empty-state">Start searching to see your history.</div>
                )}
              </div>
            </div>
          )}

          {/* 3. Detail Views */}
          {viewType === 'artist' && (
            <ArtistDetailsModal
              artistId={routeId}
              currentTheme={currentTheme}
              onBack={() => navigate('/music')}
              onSelectArtist={id => navigate(`/artist/${id}`)}
              onSelectAlbum={id => navigate(`/album/${id}`)}
              onPlayLocal={handlePlayRequest}
            />
          )}

          {viewType === 'album' && (
            <AlbumDetailView
              albumId={routeId}
              currentTheme={currentTheme}
              onBack={() => navigate(-1)}
              onSelectArtist={id => navigate(`/artist/${id}`)}
              onPlayLocal={handlePlayRequest}
            />
          )}
        </div>
      </div>
    </div>
  );
});

export default MusicHub;
