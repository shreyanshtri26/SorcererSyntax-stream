import React, { useState, useEffect } from 'react';
import CategoryFilterPills from './CategoryFilterPills';

const TVHeader = ({
  activeTab,
  channelSource,
  selectedCountry,
  countriesList,
  filteredDlhdChannelsCount,
  filteredIptvChannelsCount,
  filteredEventsCount,
  filteredCinemaChannelsCount,
  searchQuery,
  setSearchQuery,
  activeCategoryList,
  selectedCategory,
  setSelectedCategory,
  channelLanguages,
  selectedLanguage,
  setSelectedLanguage
}) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Sync local search when parent clears it
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Debounce the global search update
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery !== localSearch) {
        setSearchQuery(localSearch);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [localSearch, setSearchQuery, searchQuery]);

  return (
    <header className="tv-header">
      <div className="header-title">
        <h2>
          {activeTab === 'channels' && channelSource === 'dlhd' && 'Premium Channels'}
          {activeTab === 'channels' && channelSource === 'iptv' && (
            selectedCountry === 'all'
              ? 'Worldwide TV — All Countries'
              : `${countriesList.find(c => c.code === selectedCountry)?.name || 'Worldwide'} TV`
          )}
          {activeTab === 'channels' && channelSource === 'cinemaos' && 'CinemaOS TV'}
          {activeTab === 'events' && 'Live & Upcoming Sports Events'}
          {activeTab === 'schedule' && 'Live Events Schedule'}
        </h2>
        <p className="subtitle">
          {activeTab === 'channels' && channelSource === 'dlhd' && `${filteredDlhdChannelsCount} networks live`}
          {activeTab === 'channels' && channelSource === 'iptv' && `${filteredIptvChannelsCount} channels loaded`}
          {activeTab === 'channels' && channelSource === 'cinemaos' && `${filteredCinemaChannelsCount} channels loaded`}
          {activeTab === 'events' && `${filteredEventsCount} events scheduled`}
          {activeTab === 'schedule' && 'Click on any channel link to tune in'}
        </p>
      </div>

      <div className="tv-search-wrapper">
        <i className="fa-solid fa-magnifying-glass search-icon"></i>
        <input
          type="text"
          className="tv-search"
          placeholder={`Search ${activeTab === 'channels' ? (channelSource === 'dlhd' ? 'premium channels' : channelSource === 'cinemaos' ? 'cinema channels' : 'worldwide channels') : activeTab}...`}
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
        />
        {localSearch && (
          <button className="clear-search-btn" onClick={() => { setLocalSearch(''); setSearchQuery(''); }}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        )}
      </div>

      {/* Inline Category Filter Pills */}
      <CategoryFilterPills 
        categories={activeCategoryList()}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Inline Language Filter Pills — shown for all tabs */}
      {channelLanguages.length > 1 && (
        <div className="inline-filter-pills lang-filter-pills">
          <span className="filter-pills-label"><i className="fa-solid fa-language"></i></span>
          {channelLanguages.map(lang => (
            <button
              key={lang}
              className={`filter-pill lang-pill ${selectedLanguage === lang ? 'active' : ''}`}
              onClick={() => setSelectedLanguage(lang)}
            >
              {lang === 'all' ? '🌐 All Languages' : lang.charAt(0).toUpperCase() + lang.slice(1)}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};

export default React.memo(TVHeader);
