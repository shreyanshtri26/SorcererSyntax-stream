import React from 'react';
import './MusicSearchBar.css';

const MusicSearchBar = ({ value, onChange, onFocus, onBlur }) => {
  
  return (
    <div className="music-search-bar-instant">
      <input 
        type="text" 
        placeholder="Search Songs, Artists, Albums..." 
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        className="music-search-input"
        aria-label="Search Music"
        autoComplete="off"
      />
    </div>
  );
};

export default MusicSearchBar; 