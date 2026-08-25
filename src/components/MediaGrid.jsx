import React from 'react';
import MediaItem from './MediaItem';

const MediaGrid = ({ items, type, onMediaClick, currentTheme = 'devil' }) => (
    <div className="media-grid">
        {items.length > 0 ? (
            items.map(item => (
                <MediaItem
                    key={item.id}
                    item={item}
                    type={type}
                    onClick={onMediaClick}
                    currentTheme={currentTheme}
                />
            ))
        ) : (
            <p className="no-results-message">No results found. Try adjusting your search criteria.</p>
        )}
    </div>
);

export default MediaGrid;
