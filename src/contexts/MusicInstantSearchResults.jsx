import React from "react";
import { usePlayer } from '../context/PlayerContext';

const MusicInstantSearchResults = ({ results, isLoading, onBack, onSelectArtist, onSelectAlbum, onSelectTrack, currentTheme }) => {
  const { addToQueue, playNext } = usePlayer();

  if (isLoading) return <div className="music-hub-loading">Searching the void...</div>;

  const hasResults = results && (results.tracks?.length || results.artists?.length || results.albums?.length);

  const renderCard = (item, type) => {
    const isTrack = type === 'track';
    const imageUrl = isTrack ? item.album?.images?.[0]?.url : item.images?.[0]?.url;
    const subtitle = isTrack ? item.artists?.map(a => a.name).join(', ') : (item.genres?.slice(0, 2).join(', ') || 'Artist');

    return (
      <div key={item.id} className={`music-card-mini theme-${currentTheme}`} onClick={() => {
        if (isTrack) onSelectTrack(item);
        else if (type === 'artist') onSelectArtist(item.id);
        else onSelectAlbum(item.id);
      }}>
        <img src={imageUrl || 'no-poster.jpg'} alt="" className="mini-card-img" />
        <div className="mini-card-details">
          <p className="mini-card-title">{item.name}</p>
          <p className="mini-card-sub">{subtitle}</p>
        </div>
        {isTrack && (
          <div className="mini-card-actions" onClick={e => e.stopPropagation()}>
            <button onClick={() => playNext(item)}>Next</button>
            <button onClick={() => addToQueue(item)}>+</button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`music-instant-results-container theme-${currentTheme}`}>
      <div className="modal-header-nav">
        <button className="back-button" onClick={onBack}>
          <span>←</span> Back to Explore
        </button>
        <h3 className="search-stats">
          {hasResults ? 'Results match your search' : 'No matches found'}
        </h3>
      </div>

      <div className="results-scroll-area">
        {results?.tracks?.length > 0 && (
          <div className="result-category">
            <h4>Tracks</h4>
            <div className="mini-grid">
              {results.tracks.map(t => renderCard(t, 'track'))}
            </div>
          </div>
        )}

        {results?.artists?.length > 0 && (
          <div className="result-category">
            <h4>Artists</h4>
            <div className="mini-grid">
              {results.artists.map(a => renderCard(a, 'artist'))}
            </div>
          </div>
        )}

        {results?.albums?.length > 0 && (
          <div className="result-category">
            <h4>Albums</h4>
            <div className="mini-grid">
              {results.albums.map(al => renderCard(al, 'album'))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicInstantSearchResults;