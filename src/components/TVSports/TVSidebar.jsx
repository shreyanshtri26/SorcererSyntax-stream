import React from 'react';

const TVSidebar = ({
  activeTab,
  handleTabChange,
  channelSource,
  handleSourceChange,
  countriesList,
  selectedCountry,
  handleCountryChange
}) => {
  return (
    <aside className="tv-sidebar" data-lenis-prevent>
      {/* Browse By */}
      <div className="sidebar-section">
        <h3>Browse By</h3>
        <ul className="sidebar-menu">
          <li
            className={activeTab === 'channels' ? 'active' : ''}
            onClick={() => handleTabChange('channels')}
          >
            <i className="fa-solid fa-tv"></i> Live TV
          </li>
          <li
            className={activeTab === 'events' ? 'active' : ''}
            onClick={() => handleTabChange('events')}
          >
            <i className="fa-solid fa-trophy"></i> Sports Events
          </li>
        </ul>
      </div>

      {/* TV Source Toggle */}
      {activeTab === 'channels' && (
        <div className="sidebar-section">
          <h3>TV Source</h3>
          <ul className="source-menu">
            <li
              className={channelSource === 'dlhd' ? 'active' : ''}
              onClick={() => handleSourceChange('dlhd')}
            >
              <i className="fa-solid fa-star"></i> Premium Channels
            </li>
            <li
              className={channelSource === 'iptv' ? 'active' : ''}
              onClick={() => handleSourceChange('iptv')}
            >
              <i className="fa-solid fa-globe"></i> Worldwide TV
            </li>
            <li
              className={channelSource === 'cinemaos' ? 'active' : ''}
              onClick={() => handleSourceChange('cinemaos')}
            >
              <i className="fa-solid fa-film"></i> CinemaOS TV
            </li>
          </ul>
        </div>
      )}

      {/* Country Selector for Worldwide IPTV */}
      {activeTab === 'channels' && channelSource === 'iptv' && countriesList.length > 0 && (
        <div className="sidebar-section country-section">
          <h3>Select Country</h3>
          <div className="country-selector-wrapper">
            <select
              value={selectedCountry}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="country-dropdown"
            >
              <option value="all">🌍 All Countries</option>
              {countriesList.map(c => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.count})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </aside>
  );
};

export default TVSidebar;
