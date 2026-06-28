import React from 'react';

const MobileBottomNav = ({ activeTab, channelSource, handleTabChange, handleSourceChange }) => {
  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      <button
        className={`mobile-nav-item ${activeTab === 'channels' && channelSource === 'dlhd' ? 'active' : ''}`}
        onClick={() => { handleTabChange('channels'); handleSourceChange('dlhd'); }}
      >
        <i className="fa-solid fa-star"></i>
        <span>Premium</span>
      </button>
      <button
        className={`mobile-nav-item ${activeTab === 'channels' && channelSource === 'iptv' ? 'active' : ''}`}
        onClick={() => { handleTabChange('channels'); handleSourceChange('iptv'); }}
      >
        <i className="fa-solid fa-globe"></i>
        <span>Worldwide</span>
      </button>
      <button
        className={`mobile-nav-item ${activeTab === 'channels' && channelSource === 'cinemaos' ? 'active' : ''}`}
        onClick={() => { handleTabChange('channels'); handleSourceChange('cinemaos'); }}
      >
        <i className="fa-solid fa-film"></i>
        <span>CinemaOS</span>
      </button>
      <button
        className={`mobile-nav-item ${activeTab === 'events' ? 'active' : ''}`}
        onClick={() => handleTabChange('events')}
      >
        <i className="fa-solid fa-trophy"></i>
        <span>Events</span>
      </button>
    </nav>
  );
};

export default MobileBottomNav;
