import React from 'react';
import './InstantSearchResults.css'; // Make sure this CSS file is created/imported

const InstantSearchResults = ({ results, isLoading, onSelectItem, imageBaseUrl }) => {
  if (isLoading) {
    return (
      <div className="instant-search-results loading">
        <p>Loading...</p>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="instant-search-results empty">
        <p>No results found.</p>
      </div>
    );
  }

  // Group results by media_type
  const groupedResults = results.reduce((acc, item) => {
    const type = item.media_type || 'unknown';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(item);
    return acc;
  }, {});

  const renderMiniCard = (item) => {
    const mediaType = item.media_type;
    let title = item.title || item.name || 'Unknown';
    let detail = '';
    let imageUrl = 'no-poster.jpg'; // Default placeholder

    if (mediaType === 'movie') {
      detail = item.release_date ? item.release_date.substring(0, 4) : '';
      if (item.poster_path) {
        imageUrl = `${imageBaseUrl}${item.poster_path}`;
      }
    } else if (mediaType === 'tv') {
      detail = item.first_air_date ? item.first_air_date.substring(0, 4) : '';
      if (item.poster_path) {
        imageUrl = `${imageBaseUrl}${item.poster_path}`;
      }
    } else if (mediaType === 'person') {
      detail = item.known_for_department || '';
      if (item.profile_path) {
        imageUrl = `${imageBaseUrl}${item.profile_path}`;
      }
    }

    return (
      <div 
        key={item.id}
        className={`mini-card media-type-${mediaType}`}
        onClick={() => onSelectItem(item)}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectItem(item)}
      >
        <img 
          src={imageUrl} 
          alt={title} 
          className="mini-card-img" 
          onError={(e) => { e.target.onerror = null; e.target.src='no-poster.jpg'; }}
        />
        <div className="mini-card-info">
          <span className="mini-card-title">{title}</span>
          {detail && <span className="mini-card-detail">{detail}</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="instant-search-results has-results">
      {/* Optional: Render category headers */} 
      {groupedResults.movie && groupedResults.movie.length > 0 && (
        <div className="result-category">
          <h4 className="category-title">Movies</h4>
          <div className="mini-card-grid">
            {groupedResults.movie.map(renderMiniCard)}
          </div>
        </div>
      )}
      {groupedResults.tv && groupedResults.tv.length > 0 && (
        <div className="result-category">
          <h4 className="category-title">TV Shows</h4>
          <div className="mini-card-grid">
            {groupedResults.tv.map(renderMiniCard)}
          </div>
        </div>
      )}
      {groupedResults.person && groupedResults.person.length > 0 && (
        <div className="result-category">
          <h4 className="category-title">People</h4>
          <div className="mini-card-grid">
            {groupedResults.person.map(renderMiniCard)}
          </div>
        </div>
      )}
      {/* Fallback for ungrouped or unknown types, though unlikely with current filtering */}
      {groupedResults.unknown && groupedResults.unknown.length > 0 && (
        <div className="result-category">
          <h4 className="category-title">Other</h4>
          <div className="mini-card-grid">
            {groupedResults.unknown.map(renderMiniCard)}
          </div>
        </div>
      )}
    </div>
  );
};

export default InstantSearchResults; 