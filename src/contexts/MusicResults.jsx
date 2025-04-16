import React from 'react';

const MusicResultItem = ({ item, onPlayRequest }) => {
  // Extract snippet and videoId from the item
  const snippet = item?.snippet;
  const videoId = item?.id?.videoId;

  if (!snippet || !videoId) {
    return null; // Don't render if essential data is missing
  }

  const thumbnailUrl = snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || 'no-poster.jpg';

  const handlePlayClick = () => {
    onPlayRequest({ type: 'SpotifyPlayer', videoId });
  };

  return (
    <div
      key={item.id?.videoId || item.etag}
      className="music-card"
      tabIndex={0}
      onClick={handlePlayClick}
      onKeyDown={e => (e.key === 'Enter' ? handlePlayClick() : undefined)}
    >
      <img
        className="music-card-img"
        src={thumbnailUrl}
        alt={snippet.title}
        onError={(e) => { e.target.onerror = null; e.target.src='no-poster.jpg' }}
      />
      <div className="music-card-content">
        <div className="music-card-title">{snippet.title}</div>
        <div className="music-card-sub">{snippet.channelTitle}</div>
        <div className="music-card-actions">
          <button className="music-card-btn" tabIndex={-1} onClick={handlePlayClick}>Play</button>
        </div>
      </div>
    </div>
  );
};

const MusicResults = ({ results, isLoading, error, onPlayRequest }) => {
  
  if (isLoading) {
    return <p className="loading-text">Loading music results...</p>;
  }

  if (error) {
    return <p className="error-text">Error loading music: {error}</p>;
  }

  if (!results || results.length === 0) {
    return <div className="music-hub-empty">No results found.</div>;
  }

  return (
    <div className="music-section-cards">
      {results.map(item => (
        <MusicResultItem 
          item={item} 
          onPlayRequest={onPlayRequest} 
        />
      ))}
    </div>
  );
};

export default MusicResults; 