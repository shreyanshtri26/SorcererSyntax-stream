import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTvData } from '../hooks/useTvData';
import { useIptvChannels } from '../hooks/useIptvChannels';
import { useTvFilters } from '../hooks/useTvFilters';
import SportsPlayerView from '../components/SportsPlayerView';
import TVSidebar from '../components/TVSports/TVSidebar';
import TVHeader from '../components/TVSports/TVHeader';
import PremiumChannelsGrid from '../components/TVSports/PremiumChannelsGrid';
import WorldwideTVGrid from '../components/TVSports/WorldwideTVGrid';
import SportsEventsGrid from '../components/TVSports/SportsEventsGrid';
import ScheduleView from '../components/TVSports/ScheduleView';
import MobileBottomNav from '../components/TVSports/MobileBottomNav';
import './TVSportsPage.css';

const TVSportsPage = ({ currentTheme }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'channels');
  const [channelSource, setChannelSource] = useState(searchParams.get('source') || 'iptv');
  const [selectedCountry, setSelectedCountry] = useState(searchParams.get('country') || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');

  useEffect(() => {
    const tab = searchParams.get('tab') || 'channels';
    setActiveTab(prev => (prev !== tab ? tab : prev));
    const source = searchParams.get('source') || 'iptv';
    setChannelSource(prev => (prev !== source ? source : prev));
    const country = searchParams.get('country') || 'all';
    setSelectedCountry(prev => (prev !== country ? country : prev));
  }, [searchParams]);

  const { dlhdChannels, cinemaChannels, damiStreams, dlhdSchedule, loading, error } = useTvData();
  const { iptvChannels, setIptvChannels, loadingIptvChannels, setLoadingIptvChannels, countriesList } = useIptvChannels(activeTab, channelSource, selectedCountry);

  const filters = useTvFilters({
    dlhdChannels,
    iptvChannels,
    cinemaChannels,
    damiStreams,
    dlhdSchedule,
    searchQuery,
    selectedCategory,
    selectedLanguage
  });

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setSelectedCategory('all');
    setSearchQuery('');
    const params = { tab };
    if (tab === 'channels') {
      params.source = channelSource;
      if (channelSource === 'iptv' && selectedCountry && selectedCountry !== 'all') {
        params.country = selectedCountry;
      }
    }
    setSearchParams(params);
  }, [channelSource, selectedCountry, setSearchParams]);

  const handleSourceChange = useCallback((src) => {
    setChannelSource(src);
    setSelectedCategory('all');
    setSearchQuery('');
    const params = { tab: 'channels', source: src };
    if (src === 'iptv' && selectedCountry && selectedCountry !== 'all') {
      params.country = selectedCountry;
    }
    setSearchParams(params);
  }, [selectedCountry, setSearchParams]);

  const handleCountryChange = useCallback((countryCode) => {
    setLoadingIptvChannels(true);
    setIptvChannels([]);
    setSelectedCountry(countryCode);
    setSelectedCategory('all');
    setSelectedLanguage('all');
    setSearchQuery('');

    const params = { tab: 'channels', source: 'iptv' };
    if (countryCode !== 'all') {
      params.country = countryCode;
    }
    setSearchParams(params);
  }, [setSearchParams, setLoadingIptvChannels, setIptvChannels]);

  useEffect(() => {
    setSelectedCategory('all');
    setSelectedLanguage('all');
    setSearchQuery('');
  }, [activeTab, channelSource]);

  const handlePlayDlhdChannel = (channelId) => setSearchParams({ tab: activeTab, source: channelSource, play: channelId });
  const handlePlayEvent = (eventId) => setSearchParams({ tab: 'events', play: eventId });
  const handlePlayHlsChannel = (channel) => {
    const params = { tab: 'channels', source: channelSource, play: channel.id };
    if (channelSource === 'iptv' && selectedCountry !== 'all') params.country = selectedCountry;
    setSearchParams(params);
  };
  const handleClosePlayer = () => {
    const params = { tab: activeTab };
    if (activeTab === 'channels') {
      params.source = channelSource;
      if (channelSource === 'iptv' && selectedCountry && selectedCountry !== 'all') params.country = selectedCountry;
    }
    setSearchParams(params);
  };

  const getChannelInitial = (name) => name ? name.charAt(0).toUpperCase() : '?';

  const playId = searchParams.get('play');

  if (error) {
    return (
      <div className="tv-sports-page-error">
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-btn">Retry</button>
      </div>
    );
  }

  if (playId) {
    return (
      <SportsPlayerView
        playId={playId}
        tab={activeTab}
        source={channelSource}
        dlhdChannels={dlhdChannels}
        iptvChannels={iptvChannels}
        cinemaChannels={cinemaChannels}
        damiStreams={damiStreams}
        countriesList={countriesList}
        selectedCountry={selectedCountry}
        onClose={handleClosePlayer}
        currentTheme={currentTheme}
      />
    );
  }

  const activeCategoryList = () => {
    if (activeTab === 'events') return filters.eventCategories;
    if (activeTab === 'schedule') return filters.scheduleDays;
    if (activeTab === 'channels' && channelSource === 'dlhd') return filters.channelCategories;
    if (activeTab === 'channels' && (channelSource === 'cinemaos' || channelSource === 'iptv')) return filters.iptvCategories.slice(0, 20);
    return ['all'];
  };

  return (
    <div className="tv-sports-page">
      <TVSidebar
        activeTab={activeTab}
        handleTabChange={handleTabChange}
        channelSource={channelSource}
        handleSourceChange={handleSourceChange}
        countriesList={countriesList}
        selectedCountry={selectedCountry}
        handleCountryChange={handleCountryChange}
      />

      <main className="tv-content">
        {activeTab === 'channels' && channelSource === 'iptv' && countriesList.length > 0 && (
          <div className="mobile-country-row">
            <i className="fa-solid fa-flag" style={{ color: 'var(--text-muted, #a4b0be)', fontSize: '0.9rem' }}></i>
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
        )}

        <TVHeader
          activeTab={activeTab}
          channelSource={channelSource}
          selectedCountry={selectedCountry}
          countriesList={countriesList}
          filteredDlhdChannelsCount={filters.filteredDlhdChannels.length}
          filteredIptvChannelsCount={filters.filteredIptvChannels.length}
          filteredCinemaChannelsCount={filters.filteredCinemaChannels.length}
          filteredEventsCount={filters.filteredEvents.length}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeCategoryList={activeCategoryList}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          channelLanguages={filters.channelLanguages}
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
        />

        <div className="tv-viewport" data-lenis-prevent>
          {activeTab === 'channels' && channelSource === 'dlhd' && (
            <PremiumChannelsGrid
              isLoading={loading}
              currentTheme={currentTheme}
              filteredDlhdChannels={filters.filteredDlhdChannels}
              handlePlayDlhdChannel={handlePlayDlhdChannel}
              searchQuery={searchQuery}
              getChannelInitial={getChannelInitial}
            />
          )}

          {activeTab === 'channels' && channelSource === 'iptv' && (
            <WorldwideTVGrid
              isIptvLoading={loadingIptvChannels}
              currentTheme={currentTheme}
              selectedCountry={selectedCountry}
              filteredIptvChannels={filters.filteredIptvChannels}
              handlePlayHlsChannel={handlePlayHlsChannel}
              searchQuery={searchQuery}
              getChannelInitial={getChannelInitial}
            />
          )}

          {activeTab === 'channels' && channelSource === 'cinemaos' && (
            <WorldwideTVGrid
              isIptvLoading={loading}
              currentTheme={currentTheme}
              selectedCountry="all"
              filteredIptvChannels={filters.filteredCinemaChannels}
              handlePlayHlsChannel={handlePlayHlsChannel}
              searchQuery={searchQuery}
              getChannelInitial={getChannelInitial}
            />
          )}

          {activeTab === 'events' && (
            <SportsEventsGrid
              isLoading={loading}
              currentTheme={currentTheme}
              filteredEvents={filters.filteredEvents}
              handlePlayEvent={handlePlayEvent}
            />
          )}

          {activeTab === 'schedule' && (
            <ScheduleView
              filteredSchedule={filters.filteredSchedule}
              handlePlayDlhdChannel={handlePlayDlhdChannel}
            />
          )}
        </div>
      </main>

      <MobileBottomNav
        activeTab={activeTab}
        channelSource={channelSource}
        handleTabChange={handleTabChange}
        handleSourceChange={handleSourceChange}
      />
    </div>
  );
};

export default TVSportsPage;
