import React, { useState, useEffect, useMemo, useDeferredValue, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchDlhdChannels, fetchDlhdSchedule, getDlhdLogoUrl } from '../api/dlhdApi';
import { fetchDamiStreams } from '../api/damiApi';
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

  // Tabs: 'channels' | 'events' | 'schedule'
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'channels');

  // Channels Source: 'dlhd' (Premium) | 'iptv' (Worldwide)
  const [channelSource, setChannelSource] = useState(searchParams.get('source') || 'iptv');

  // DLHD Data states
  const [dlhdChannels, setDlhdChannels] = useState([]);
  const [cinemaChannels, setCinemaChannels] = useState([]);
  const [damiStreams, setDamiStreams] = useState([]);
  const [dlhdSchedule, setDlhdSchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Worldwide IPTV Data states
  const [countriesList, setCountriesList] = useState([]);
  // 'all' = All Countries (aggregated); '' = not yet loaded; otherwise a country code
  const [selectedCountry, setSelectedCountry] = useState(searchParams.get('country') || 'all');
  const [iptvChannels, setIptvChannels] = useState([]);
  const [loadingIptvChannels, setLoadingIptvChannels] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');

  // Sync react states with URL search parameters on browser back/forward
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) setActiveTab(tab);

    const source = searchParams.get('source');
    if (source && source !== channelSource) setChannelSource(source);

    const country = searchParams.get('country') || 'all';
    if (country !== selectedCountry) setSelectedCountry(country);
  }, [searchParams]);

  // Load base data on mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        const [channels, streams, schedule] = await Promise.all([
          fetchDlhdChannels(),
          fetchDamiStreams(),
          fetchDlhdSchedule()
        ]);
        setDlhdChannels(channels || []);
        setDamiStreams(streams || []);
        setDlhdSchedule(schedule || {});

        // Fetch IPTV countries index list
        const indexRes = await fetch('/data/iptv/index.json');
        if (indexRes.ok) {
          const indexData = await indexRes.json();
          setCountriesList(indexData);

          // If URL has a specific country, honour it; otherwise default to 'all'
          const urlCountry = searchParams.get('country');
          setSelectedCountry(urlCountry || 'all');
          
          // Background fetch all IPTV channels
          const cacheKey = 'iptv_all_countries_v2';
          const cacheTime = sessionStorage.getItem(cacheKey + '_time');
          if (!cacheTime || (Date.now() - parseInt(cacheTime)) >= 3600 * 1000) {
            (async () => {
              try {
                let bgData = [];
                // Process in chunks to prevent network blocking
                const chunkArray = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));
                const chunks = chunkArray(indexData, 15);
                for (const chunk of chunks) {
                  const promises = chunk.map(c => fetch(`/data/iptv/countries/${c.code}.json`).then(r => r.ok ? r.json() : []).catch(() => []));
                  const results = await Promise.all(promises);
                  bgData = bgData.concat(results.flat());
                }

                sessionStorage.setItem(cacheKey, JSON.stringify(bgData));
                sessionStorage.setItem(cacheKey + '_time', Date.now().toString());
                console.log('Background fetch completed for all IPTV channels');
              } catch (e) {
                console.error("Background fetch failed", e);
              }
            })();
          }
        }
        
        // Fetch CinemaOS Channels
        try {
          const cinemaRes = await fetch('/api/cinemaos');
          if (cinemaRes.ok) {
            const cinemaData = await cinemaRes.json();
            if (cinemaData && Array.isArray(cinemaData.channels)) {
              const mappedCinemaChannels = cinemaData.channels
                .filter(c => c.playable)
                .map(c => ({
                  id: c.id,
                  name: c.name,
                  logo: c.logo_url,
                  categories: [(c.category || 'general').toLowerCase()],
                  languages: ['all'],
                  countries: ['all'],
                  iframeUrl: `https://embed.st/embed/admin/${c.id}/1`
                }));
              setCinemaChannels(mappedCinemaChannels);
            }
          }
        } catch (e) {
          console.error('Failed to fetch CinemaOS channels', e);
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to load streaming data:', err);
        setError('Could not load channels. Please try again.');
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  // Fetch channels for chosen country (supports "all" = aggregate all countries)
  useEffect(() => {
    if (activeTab === 'channels' && channelSource === 'iptv') {
      const loadIptvChannels = async () => {
        try {
          setLoadingIptvChannels(true);
          let data = [];

          if (selectedCountry === 'all') {
            const cacheKey = 'iptv_all_countries_v2';
            const cacheTime = sessionStorage.getItem(cacheKey + '_time');
            const cachedData = sessionStorage.getItem(cacheKey);
            
            if (cachedData && cacheTime && (Date.now() - parseInt(cacheTime)) < 3600 * 1000) {
              data = JSON.parse(cachedData);
            } else {
              // Fetch using Promise.all to load them concurrently
              const idxRes = await fetch('/data/iptv/index.json');
              const idx = idxRes.ok ? await idxRes.json() : [];
              
              // Process in chunks
              const chunkArray = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));
              const chunks = chunkArray(idx, 15);
              for (const chunk of chunks) {
                const promises = chunk.map(c => fetch(`/data/iptv/countries/${c.code}.json`).then(r => r.ok ? r.json() : []).catch(() => []));
                const results = await Promise.all(promises);
                data = data.concat(results.flat());
              }

              sessionStorage.setItem(cacheKey, JSON.stringify(data));
              sessionStorage.setItem(cacheKey + '_time', Date.now().toString());
            }
          } else if (selectedCountry) {
            const res = await fetch(`/data/iptv/countries/${selectedCountry}.json`);
            if (res.ok) data = await res.json();
          }

          setIptvChannels(data);
          console.log('Loaded total IPTV channels:', data.length);
        } catch (err) {
          console.error('Error loading IPTV channels:', err);
        } finally {
          setLoadingIptvChannels(false);
        }
      };
      loadIptvChannels();
    }
  }, [activeTab, channelSource, selectedCountry]);

  // Handle Tab Navigation Changes & update query parameters
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

  // Handle Source Toggle Changes & update query parameters
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

  // Handle Country Selection Dropdown Changes & update query parameters
  const handleCountryChange = useCallback((countryCode) => {
    // Show loader while new country data loads
    setLoadingIptvChannels(true);
    setSelectedCountry(countryCode);
    setSelectedCategory('all');
    setSelectedLanguage('all');
    setSearchQuery('');

    const params = { tab: 'channels', source: 'iptv' };
    if (countryCode !== 'all') {
      params.country = countryCode;
    }
    setSearchParams(params);
  }, [setSearchParams]);

  // Reset category & language filters when active tab or channel source changes
  useEffect(() => {
    setSelectedCategory('all');
    setSelectedLanguage('all');
    setSearchQuery('');
  }, [activeTab, channelSource]);

  // Dynamically categorize DLHD channels based on keywords in name
  const channelCategories = useMemo(() => {
    const cats = new Set(['all']);
    dlhdChannels.forEach(ch => {
      const name = (ch.channel_name || '').toLowerCase();
      if (name.includes('sport') || name.includes('bein') || name.includes('espn') || name.includes('racing') || name.includes('sky')) {
        cats.add('sports');
      } else if (name.includes('news') || name.includes('cnn') || name.includes('bbc')) {
        cats.add('news');
      } else if (name.includes('movie') || name.includes('cinema') || name.includes('hbo')) {
        cats.add('movies');
      } else if (name.includes('kids') || name.includes('cartoon') || name.includes('disney') || name.includes('boomerang')) {
        cats.add('kids');
      } else {
        cats.add('general');
      }
    });
    return Array.from(cats);
  }, [dlhdChannels]);

  // Dynamically categorize IPTV channels
  const iptvCategories = useMemo(() => {
    return ['all', 'news', 'music', 'religious', 'entertainment', 'movies', 'culture', 'lifestyle', 'business', 'education', 'general', 'kids', 'sports'];
  }, []);

  // Languages memo for both DLHD and IPTV
  const channelLanguages = useMemo(() => {
    const langs = new Set(['all']);
    dlhdChannels.forEach(ch => {
      if (ch.languages && ch.languages.length) {
        ch.languages.forEach(l => langs.add(l.toLowerCase()));
      }
    });
    iptvChannels.forEach(ch => {
      if (ch.languages && ch.languages.length) {
        ch.languages.forEach(l => langs.add(l.toLowerCase()));
      }
    });
    return Array.from(langs);
  }, [dlhdChannels, iptvChannels]);

  // Extract categories for DAMITV live events
  const eventCategories = useMemo(() => {
    const cats = new Set(['all']);
    damiStreams.forEach(group => {
      if (group.category) {
        cats.add((group.category || '').toLowerCase());
      }
    });
    return Array.from(cats);
  }, [damiStreams]);

  // Extract schedule days
  const scheduleDays = useMemo(() => {
    return ['all', ...Object.keys(dlhdSchedule)];
  }, [dlhdSchedule]);

  // Handle stream play requests & update URL
  const handlePlayDlhdChannel = (channelId) => {
    setSearchParams({
      tab: activeTab,
      source: channelSource,
      play: channelId
    });
  };

  const handlePlayEvent = (eventId) => {
    setSearchParams({
      tab: 'events',
      play: eventId
    });
  };

  const handlePlayHlsChannel = (channel) => {
    const params = {
      tab: 'channels',
      source: channelSource,
      play: channel.id
    };
    if (channelSource === 'iptv' && selectedCountry !== 'all') {
      params.country = selectedCountry;
    }
    setSearchParams(params);
  };

  // Close player screen and clear play query parameter
  const handleClosePlayer = () => {
    const params = { tab: activeTab };
    if (activeTab === 'channels') {
      params.source = channelSource;
      if (channelSource === 'iptv' && selectedCountry && selectedCountry !== 'all') {
        params.country = selectedCountry;
      }
    }
    setSearchParams(params);
  };

  // Helper to parse day and time string into a Date object
  const getEventDateTime = (dayStr, timeStr) => {
    const now = new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);
    const target = new Date(now);
    target.setHours(hours, minutes, 0, 0);

    const dayLower = dayStr.toLowerCase();
    if (dayLower.includes('today')) {
      // Keep today
    } else if (dayLower.includes('tomorrow')) {
      target.setDate(target.getDate() + 1);
    } else {
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const targetDayIndex = daysOfWeek.findIndex(d => dayLower.includes(d));
      if (targetDayIndex !== -1) {
        const currentDayIndex = now.getDay();
        let diff = targetDayIndex - currentDayIndex;
        if (diff < 0) diff += 7;
        target.setDate(target.getDate() + diff);
      } else {
        const cleanDayStr = dayStr.replace(/^[a-zA-Z]+/, '').trim();
        const currentYear = now.getFullYear();
        const parsedDate = new Date(`${cleanDayStr} ${currentYear}`);
        if (!isNaN(parsedDate.getTime())) {
          target.setDate(parsedDate.getDate());
          target.setMonth(parsedDate.getMonth());
        }
      }
    }
    return target;
  };

  // Filtered DLHD Channels
  const filteredDlhdChannels = useMemo(() => {
    const seenNames = new Set();
    const query = (deferredSearchQuery || '').toLowerCase();
    return dlhdChannels.filter(ch => {
      const name = (ch.channel_name || '').toLowerCase();
      if (seenNames.has(name)) return false;
      seenNames.add(name);
      
      if (query && !name.includes(query)) return false;

      if (selectedCategory !== 'all') {
        let cat = 'general';
        if (name.includes('sport') || name.includes('bein') || name.includes('espn') || name.includes('racing') || name.includes('sky')) cat = 'sports';
        else if (name.includes('news') || name.includes('cnn') || name.includes('bbc')) cat = 'news';
        else if (name.includes('movie') || name.includes('cinema') || name.includes('hbo')) cat = 'movies';
        else if (name.includes('kids') || name.includes('cartoon') || name.includes('disney') || name.includes('boomerang')) cat = 'kids';
        if (cat !== selectedCategory) return false;
      }
      if (selectedLanguage !== 'all') {
        if (!ch.languages || !ch.languages.map(l => (l || '').toLowerCase()).includes(selectedLanguage)) return false;
      }
      return true;
    });
  }, [dlhdChannels, deferredSearchQuery, selectedCategory, selectedLanguage]);

  // Filtered IPTV Channels
  const filteredIptvChannels = useMemo(() => {
    const seenNames = new Set();
    const query = (deferredSearchQuery || '').toLowerCase();
    return iptvChannels.filter(ch => {
      const name = (ch.name || '').toLowerCase();
      if (seenNames.has(name)) return false;
      seenNames.add(name);
      
      if (query && !name.includes(query)) return false;

      if (selectedCategory !== 'all') {
        if (!ch.categories || !ch.categories.some(cat => (cat || '').toLowerCase().includes(selectedCategory))) return false;
      }
      if (selectedLanguage !== 'all') {
        if (!ch.languages || !ch.languages.map(l => (l || '').toLowerCase()).includes(selectedLanguage)) return false;
      }
      return true;
    });
  }, [iptvChannels, deferredSearchQuery, selectedCategory, selectedLanguage]);

  // Filtered CinemaOS Channels
  const filteredCinemaChannels = useMemo(() => {
    const query = (deferredSearchQuery || '').toLowerCase();
    return cinemaChannels.filter(ch => {
      const name = (ch.name || '').toLowerCase();
      
      if (query && !name.includes(query)) return false;

      if (selectedCategory !== 'all') {
        if (!ch.categories || !ch.categories.some(cat => (cat || '').toLowerCase().includes(selectedCategory))) return false;
      }
      return true;
    });
  }, [cinemaChannels, deferredSearchQuery, selectedCategory]);

  // Filtered DAMITV Streams (Events)
  const filteredEvents = useMemo(() => {
    let result = [];
    const nowSecs = Math.floor(Date.now() / 1000);
    const minTime = nowSecs - 4 * 3600;
    const maxTime = nowSecs + 20 * 3600;
    const query = (deferredSearchQuery || '').toLowerCase();

    damiStreams.forEach(group => {
      const categoryMatches = selectedCategory === 'all' || (group.category && group.category.toLowerCase() === selectedCategory);
      if (categoryMatches) {
        group.streams.forEach(stream => {
          const startsAt = stream.starts_at;
          const withinTimeRange = startsAt >= minTime && startsAt <= maxTime;
          if (withinTimeRange && (!query || (stream.name || '').toLowerCase().includes(query))) {
            result.push(stream);
          }
        });
      }
    });
    return result;
  }, [damiStreams, deferredSearchQuery, selectedCategory]);

  // Filtered Schedule Events
  const filteredSchedule = useMemo(() => {
    const result = {};
    const nowMs = Date.now();
    const minTime = nowMs - 4 * 3600 * 1000;
    const maxTime = nowMs + 20 * 3600 * 1000;
    const query = (deferredSearchQuery || '').toLowerCase();

    Object.keys(dlhdSchedule).forEach(day => {
      if (selectedCategory === 'all' || selectedCategory === day) {
        const categoriesObj = dlhdSchedule[day];
        const dayMatchResult = {};

        Object.keys(categoriesObj).forEach(catName => {
          const events = categoriesObj[catName];
          const matchedEvents = events.filter(evt => {
            const evtDate = getEventDateTime(day, evt.time);
            const evtTimeMs = evtDate.getTime();
            const withinTimeRange = evtTimeMs >= minTime && evtTimeMs <= maxTime;
            return withinTimeRange && (!query || (evt.event || '').toLowerCase().includes(query));
          });

          if (matchedEvents.length > 0) {
            dayMatchResult[catName] = matchedEvents;
          }
        });

        if (Object.keys(dayMatchResult).length > 0) {
          result[day] = dayMatchResult;
        }
      }
    });
    return result;
  }, [dlhdSchedule, deferredSearchQuery, selectedCategory]);

  // Fallback initial/placeholder generator
  const getChannelInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

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

  // Determine which categories to show in the filter sidebar
  const activeCategoryList = () => {
    if (activeTab === 'events') return eventCategories;
    if (activeTab === 'schedule') return scheduleDays;
    if (activeTab === 'channels' && channelSource === 'dlhd') return channelCategories;
    if (activeTab === 'channels' && channelSource === 'cinemaos') return iptvCategories.slice(0, 20);
    if (activeTab === 'channels' && channelSource === 'iptv') return iptvCategories.slice(0, 20);
    return ['all'];
  };

  const categoryLabel = activeTab === 'schedule' ? 'Days' : 'Categories';  return (
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
        {/* Mobile-only: Country Selector row (shown when IPTV + mobile) */}
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
          filteredDlhdChannelsCount={filteredDlhdChannels.length}
          filteredIptvChannelsCount={filteredIptvChannels.length}
          filteredCinemaChannelsCount={filteredCinemaChannels.length}
          filteredEventsCount={filteredEvents.length}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeCategoryList={activeCategoryList}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          channelLanguages={channelLanguages}
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
        />

        <div className="tv-viewport" data-lenis-prevent>
          {activeTab === 'channels' && channelSource === 'dlhd' && (
            <PremiumChannelsGrid
              isLoading={loading}
              currentTheme={currentTheme}
              filteredDlhdChannels={filteredDlhdChannels}
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
              filteredIptvChannels={filteredIptvChannels}
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
              filteredIptvChannels={filteredCinemaChannels}
              handlePlayHlsChannel={handlePlayHlsChannel}
              searchQuery={searchQuery}
              getChannelInitial={getChannelInitial}
            />
          )}

          {activeTab === 'events' && (
            <SportsEventsGrid
              isLoading={loading}
              currentTheme={currentTheme}
              filteredEvents={filteredEvents}
              handlePlayEvent={handlePlayEvent}
            />
          )}

          {activeTab === 'schedule' && (
            <ScheduleView
              filteredSchedule={filteredSchedule}
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
