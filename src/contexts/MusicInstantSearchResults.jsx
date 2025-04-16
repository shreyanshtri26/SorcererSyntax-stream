// MusicInstantSearchResults redesign inspired by InstantSearchResults.jsx
import React from "react";
import './MusicHub.css';
import MusicPlayer from './MusicPlayer';
import AlbumDetailView from './AlbumDetailView';
import ArtistDetailsModal from './ArtistDetailsModal';

export default function MusicInstantSearchResults({ results, isLoading, onSelect, currentTheme, onSelectArtist, onSelectAlbum, onSelectTrack, navStack, onBack }) {
  if (isLoading) {
    return (
      <div className="instant-search-results music-instant loading">
        <p>Loading...</p>
      </div>
    );
  }

  // Defensive checks for grouped Spotify results
  const hasTracks = results?.tracks?.length > 0;
  const hasArtists = results?.artists?.length > 0;
  const hasAlbums = results?.albums?.length > 0;

  // === THEME ENHANCEMENTS FOR MUSIC INSTANT SEARCH RESULTS ===
  // (Apply theme classes to root container)

  // --- Mini Card Renderer ---
  const renderMiniCard = (item, type) => {
    let title = item.name || '';
    let detail = '';
    let imageUrl = '';
    let onClick = undefined;
    if (type === 'track') {
      title = item.name;
      detail = item.artists?.map(a => a.name).join(', ') || '';
      imageUrl = item.album?.images?.[0]?.url || 'no-poster.jpg';
      onClick = () => onSelectTrack ? onSelectTrack(item) : onSelect?.(item, 'track');
    } else if (type === 'artist') {
      title = item.name;
      detail = item.genres?.join(', ') || '';
      imageUrl = item.images?.[0]?.url || 'no-poster.jpg';
      onClick = () => onSelectArtist && onSelectArtist(item.id);
    } else if (type === 'album') {
      title = item.name;
      detail = item.artists?.map(a => a.name).join(', ') || '';
      imageUrl = item.images?.[0]?.url || 'no-poster.jpg';
      onClick = () => onSelectAlbum && onSelectAlbum(item.id);
    }
    return (
      <div
        key={item.id}
        className={`music-card media-type-${type} theme-${currentTheme}`}
        tabIndex={0}
        onMouseDown={onClick}
        onKeyDown={e => (e.key === 'Enter' ? onClick() : undefined)}
        role="button"
        aria-label={`${title} (${type})`}
      >
        <img
          className="music-card-img"
          src={imageUrl}
          alt={title}
          onError={e => { e.target.onerror = null; e.target.src = 'no-poster.jpg'; }}
        />
        <div className="music-card-content">
          <div className="music-card-title">{title}</div>
          <div className="music-card-sub">{detail}</div>
        </div>
      </div>
    );
  };

  // --- Navigation Bar UI ---
  const renderNavBar = () => (
    <div className="music-nav-bar">
      <button
        className="back-button"
        onClick={onBack}
        disabled={!navStack || navStack.length <= 1}
        title="Back"
        aria-label="Back"
      >
        {/* SVG left arrow icon for modern look and scaling */}
        <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true"><path d="M15.5 19a1 1 0 0 1-.7-1.71l-5.09-5.29a1 1 0 0 1 0-1.42l5.09-5.29A1 1 0 1 1 16.91 7.7l-4.38 4.54 4.38 4.54A1 1 0 0 1 15.5 19z"/></svg>
        Back
      </button>
      <span className="music-nav-label">
        {navStack && navStack.map((item, idx) => (
          <span key={idx}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            {item.id ? `: ${item.id}` : ''}
            {idx < navStack.length - 1 ? ' > ' : ''}
          </span>
        ))}
      </span>
    </div>
  );

  // --- Main Render ---
  return (
    <div className={`instant-search-results music-instant-search-results theme-${currentTheme}`}>
      {renderNavBar()}
      <div className="music-instant-search-scrollable">
        {(!hasTracks && !hasArtists && !hasAlbums) && (
          <div className="no-results">No results found.</div>
        )}
        {hasTracks && (
          <div className="result-category">
            <h4 className="category-title">Tracks</h4>
            <div className="music-section-cards">
              {results.tracks.map(item => renderMiniCard(item, 'track'))}
            </div>
          </div>
        )}
        {hasArtists && (
          <div className="result-category">
            <h4 className="category-title">Artists</h4>
            <div className="music-section-cards">
              {results.artists.map(item => renderMiniCard(item, 'artist'))}
            </div>
          </div>
        )}
        {hasAlbums && (
          <div className="result-category">
            <h4 className="category-title">Albums</h4>
            <div className="music-section-cards">
              {results.albums.map(item => renderMiniCard(item, 'album'))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}