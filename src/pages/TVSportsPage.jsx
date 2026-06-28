import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchDlhdChannels, fetchDlhdSchedule, getDlhdLogoUrl } from '../api/dlhdApi';
import { fetchDamiStreams } from '../api/damiApi';
import SportsPlayerView from '../components/SportsPlayerView';
import './TVSportsPage.css';

const TVSportsPage = ({ currentTheme }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Tabs: 'channels' | 'events' | 'schedule'
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'channels');

  // Channels Source: 'dlhd' (Premium) | 'iptv' (Worldwide)
  const [channelSource, setChannelSource] = useState(searchParams.get('source') || 'iptv');

  // DLHD Data states
  const [dlhdChannels, setDlhdChannels] = useState([]);
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
            // Get list of all country codes
            const idxRes = await fetch('/data/iptv/index.json');
            const idx = idxRes.ok ? await idxRes.json() : [];
            console.log('Aggregating IPTV channels from', idx.length, 'countries');
            // Fetch each country's JSON sequentially to avoid overwhelming the network
            for (const c of idx) {
              try {
                const res = await fetch(`/data/iptv/countries/${c.code}.json`);
                if (res.ok) {
                  const arr = await res.json();
                  if (Array.isArray(arr)) data = data.concat(arr);
                }
              } catch (e) {
                console.error('Failed to load country', c.code, e);
              }
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
  const handleTabChange = (tab) => {
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
  };

  // Handle Source Toggle Changes & update query parameters
  const handleSourceChange = (src) => {
    setChannelSource(src);
    setSelectedCategory('all');
    setSearchQuery('');

    const params = { tab: 'channels', source: src };
    if (src === 'iptv' && selectedCountry && selectedCountry !== 'all') {
      params.country = selectedCountry;
    }
    setSearchParams(params);
  };

  // Handle Country Selection Dropdown Changes & update query parameters
  const handleCountryChange = (countryCode) => {
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
  };

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
      const name = ch.channel_name.toLowerCase();
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
    const cats = new Set(['all']);
    iptvChannels.forEach(ch => {
      if (ch.categories && ch.categories.length > 0) {
        ch.categories.forEach(cat => cats.add(cat.toLowerCase()));
      }
    });
    return Array.from(cats);
  }, [iptvChannels]);

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
        cats.add(group.category.toLowerCase());
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
      source: 'iptv',
      play: channel.id
    };
    if (selectedCountry !== 'all') {
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
    return dlhdChannels.filter(ch => {
      const name = ch.channel_name.toLowerCase();
      const matchesSearch = name.includes(searchQuery.toLowerCase());
      if (selectedCategory !== 'all') {
        let cat = 'general';
        if (name.includes('sport') || name.includes('bein') || name.includes('espn') || name.includes('racing') || name.includes('sky')) cat = 'sports';
        else if (name.includes('news') || name.includes('cnn') || name.includes('bbc')) cat = 'news';
        else if (name.includes('movie') || name.includes('cinema') || name.includes('hbo')) cat = 'movies';
        else if (name.includes('kids') || name.includes('cartoon') || name.includes('disney') || name.includes('boomerang')) cat = 'kids';
        if (cat !== selectedCategory) return false;
      }
      if (selectedLanguage !== 'all') {
        if (!ch.languages || !ch.languages.map(l => l.toLowerCase()).includes(selectedLanguage)) return false;
      }
      return matchesSearch;
    });
  }, [dlhdChannels, searchQuery, selectedCategory, selectedLanguage]);

  // Filtered IPTV Channels
  const filteredIptvChannels = useMemo(() => {
    return iptvChannels.filter(ch => {
      const matchesSearch = ch.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (selectedCategory !== 'all') {
        if (!ch.categories || !ch.categories.some(cat => cat.toLowerCase() === selectedCategory)) return false;
      }
      if (selectedLanguage !== 'all') {
        if (!ch.languages || !ch.languages.map(l => l.toLowerCase()).includes(selectedLanguage)) return false;
      }
      return matchesSearch;
    });
  }, [iptvChannels, searchQuery, selectedCategory, selectedLanguage]);

  // Filtered DAMITV Streams (Events)
  const filteredEvents = useMemo(() => {
    let result = [];
    const nowSecs = Math.floor(Date.now() / 1000);
    const minTime = nowSecs - 4 * 3600;
    const maxTime = nowSecs + 20 * 3600;

    damiStreams.forEach(group => {
      const categoryMatches = selectedCategory === 'all' || group.category.toLowerCase() === selectedCategory;
      if (categoryMatches) {
        group.streams.forEach(stream => {
          const startsAt = stream.starts_at;
          const withinTimeRange = startsAt >= minTime && startsAt <= maxTime;
          if (withinTimeRange && stream.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            result.push(stream);
          }
        });
      }
    });
    return result;
  }, [damiStreams, searchQuery, selectedCategory]);

  // Filtered Schedule Events
  const filteredSchedule = useMemo(() => {
    const result = {};
    const nowMs = Date.now();
    const minTime = nowMs - 4 * 3600 * 1000;
    const maxTime = nowMs + 20 * 3600 * 1000;

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
            return withinTimeRange && evt.event.toLowerCase().includes(searchQuery.toLowerCase());
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
  }, [dlhdSchedule, searchQuery, selectedCategory]);

  // Fallback initial/placeholder generator
  const getChannelInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const playId = searchParams.get('play');

  if (loading) {
    return (
      <div className="tv-sports-page-loading">
        <div className="spinner"></div>
        <p>Loading live broadcasts and event schedules...</p>
      </div>
    );
  }

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
    if (activeTab === 'channels' && channelSource === 'iptv') return iptvCategories.slice(0, 20);
    return ['all'];
  };

  const categoryLabel = activeTab === 'schedule' ? 'Days' : 'Categories';

  return (
    <div className="tv-sports-page">
      {/* Sidebar */}
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
                <i className="fa-solid fa-star"></i> Premium Sports
              </li>
              <li
                className={channelSource === 'iptv' ? 'active' : ''}
                onClick={() => handleSourceChange('iptv')}
              >
                <i className="fa-solid fa-globe"></i> Worldwide TV
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

      {/* Main Content Area */}
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
        <header className="tv-header">
          <div className="header-title">
            <h2>
              {activeTab === 'channels' && channelSource === 'dlhd' && 'Premium Sports Channels'}
              {activeTab === 'channels' && channelSource === 'iptv' && (
                selectedCountry === 'all'
                  ? 'Worldwide TV — All Countries'
                  : `${countriesList.find(c => c.code === selectedCountry)?.name || 'Worldwide'} TV`
              )}
              {activeTab === 'events' && 'Live & Upcoming Sports Events'}
              {activeTab === 'schedule' && 'Live Events Schedule'}
            </h2>
            <p className="subtitle">
              {activeTab === 'channels' && channelSource === 'dlhd' && `${filteredDlhdChannels.length} networks live`}
              {activeTab === 'channels' && channelSource === 'iptv' && `${filteredIptvChannels.length} channels loaded`}
              {activeTab === 'events' && `${filteredEvents.length} events scheduled`}
              {activeTab === 'schedule' && 'Click on any channel link to tune in'}
            </p>
          </div>

          <div className="tv-search-wrapper">
            <i className="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              type="text"
              className="tv-search"
              placeholder={`Search ${activeTab === 'channels' ? (channelSource === 'dlhd' ? 'premium channels' : 'worldwide channels') : activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>

          {/* Inline Category Filter Pills */}
          {activeTab === 'channels' && (
            <div className="inline-filter-pills">
              {(channelSource === 'dlhd' ? channelCategories : iptvCategories.slice(0, 12)).map(cat => (
                <button
                  key={cat}
                  className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === 'all' ? '⭐ All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          )}
          {activeTab === 'events' && (
            <div className="inline-filter-pills">
              {eventCategories.map(cat => (
                <button
                  key={cat}
                  className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === 'all' ? '⭐ All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          )}

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


        {/* Dynamic Display area based on tabs */}
        <div className="tv-viewport" data-lenis-prevent>

          {/* TAB 1: Premium DLHD Channels */}
          {activeTab === 'channels' && channelSource === 'dlhd' && (
            <div className="channels-grid">
              {filteredDlhdChannels.length > 0 ? (
                filteredDlhdChannels.map(ch => (
                  <div
                    key={ch.channel_id}
                    className="channel-card"
                    onClick={() => handlePlayDlhdChannel(ch.channel_id)}
                  >
                    <div className="logo-container">
                      {ch.logo_url ? (
                        <img
                          src={getDlhdLogoUrl(ch.logo_url)}
                          alt={ch.channel_name}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="channel-logo-fallback"
                        style={{ display: ch.logo_url ? 'none' : 'flex' }}
                      >
                        {getChannelInitial(ch.channel_name)}
                      </div>
                    </div>
                    <div className="channel-info">
                      <h4 className="channel-name" title={ch.channel_name}>{ch.channel_name}</h4>
                      <span className="live-pill">
                        <span className="live-dot"></span> LIVE
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results">
                  <i className="fa-regular fa-folder-open"></i>
                  <p>No premium channels matching "{searchQuery}" found.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 1b: Worldwide IPTV Channels */}
          {activeTab === 'channels' && channelSource === 'iptv' && (
            loadingIptvChannels ? (
              <div className="tv-sports-page-loading">
                <div className="spinner"></div>
                <p>{selectedCountry === 'all' ? 'Aggregating all country channels...' : 'Fetching country channels...'}</p>
              </div>
            ) : (
              <div className="channels-grid">
                {filteredIptvChannels.length > 0 ? (
                  filteredIptvChannels.map(ch => (
                    <div
                      key={ch.id}
                      className="channel-card"
                      onClick={() => handlePlayHlsChannel(ch)}
                    >
                      <div className="logo-container">
                        {ch.logo ? (
                          <img
                            src={ch.logo}
                            alt={ch.name}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className="channel-logo-fallback"
                          style={{ display: ch.logo ? 'none' : 'flex' }}
                        >
                          {getChannelInitial(ch.name)}
                        </div>
                      </div>
                      <div className="channel-info">
                        <h4 className="channel-name" title={ch.name}>{ch.name}</h4>
                        <span className="live-pill">
                          <span className="live-dot"></span> HLS STREAM
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-results">
                    <i className="fa-regular fa-folder-open"></i>
                    <p>No channels found{searchQuery ? ` matching "${searchQuery}"` : ''}.</p>
                  </div>
                )}
              </div>
            )
          )}

          {/* TAB 2: Sports Events Grid */}
          {activeTab === 'events' && (
            <div className="events-grid">
              {filteredEvents.length > 0 ? (
                filteredEvents.map(evt => (
                  <div
                    key={evt.id}
                    className="event-card"
                    onClick={() => handlePlayEvent(evt.id)}
                  >
                    <div className="event-poster-container">
                      <img src={evt.poster} alt={evt.name} onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=60';
                      }} />
                      <div className="event-status">
                        {evt.status === 'live' ? (
                          <span className="badge-live"><span className="live-dot"></span> LIVE</span>
                        ) : (
                          <span className="badge-upcoming">UPCOMING</span>
                        )}
                      </div>
                      {evt.viewers > 0 && (
                        <div className="event-viewers">
                          <i className="fa-solid fa-eye"></i> {evt.viewers} watching
                        </div>
                      )}
                    </div>

                    <div className="event-info">
                      <span className="event-league">{evt.league || evt.category_name?.toUpperCase()}</span>
                      <h4 className="event-title">{evt.name}</h4>

                      <div className="event-teams">
                        {evt.teams && (
                          <>
                            <span className="team">{evt.teams.home.name}</span>
                            <span className="vs">VS</span>
                            <span className="team">{evt.teams.away.name}</span>
                          </>
                        )}
                      </div>

                      <div className="event-time">
                        <i className="fa-regular fa-clock"></i>{' '}
                        {new Date(evt.starts_at * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results">
                  <i className="fa-regular fa-calendar-minus"></i>
                  <p>No active/upcoming events found.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Schedule View */}
          {activeTab === 'schedule' && (
            <div className="schedule-container">
              {Object.keys(filteredSchedule).length > 0 ? (
                Object.keys(filteredSchedule).map(day => (
                  <div key={day} className="schedule-day-group">
                    <h3 className="schedule-day-header">{day}</h3>
                    {Object.keys(filteredSchedule[day]).map(category => (
                      <div key={category} className="schedule-category-group">
                        <h4 className="schedule-category-header">
                          <i className="fa-solid fa-circle-play"></i> {category}
                        </h4>
                        <div className="schedule-events-list">
                          {filteredSchedule[day][category].map((evt, idx) => (
                            <div key={idx} className="schedule-event-row">
                              <div className="event-time-col">{evt.time}</div>
                              <div className="event-detail-col">
                                <span className="event-title">{evt.event}</span>
                                <div className="event-channels-tags">
                                  {evt.channels && evt.channels.map(ch => (
                                    <button
                                      key={ch.channel_id}
                                      className="channel-tag"
                                      onClick={() => handlePlayDlhdChannel(ch.channel_id)}
                                    >
                                      <i className="fa-solid fa-play"></i> {ch.channel_name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div className="no-results">
                  <i className="fa-regular fa-calendar-times"></i>
                  <p>No schedule listings found.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* Mobile Bottom Navigation Bar — shown only on ≤ 480px via CSS */}
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        <button
          className={`mobile-nav-item ${activeTab === 'channels' && channelSource === 'dlhd' ? 'active' : ''}`}
          onClick={() => { handleTabChange('channels'); handleSourceChange('dlhd'); }}
        >
          <i className="fa-solid fa-star"></i>
          <span>Sports</span>
        </button>
        <button
          className={`mobile-nav-item ${activeTab === 'channels' && channelSource === 'iptv' ? 'active' : ''}`}
          onClick={() => { handleTabChange('channels'); handleSourceChange('iptv'); }}
        >
          <i className="fa-solid fa-globe"></i>
          <span>Worldwide</span>
        </button>
        <button
          className={`mobile-nav-item ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => handleTabChange('events')}
        >
          <i className="fa-solid fa-trophy"></i>
          <span>Events</span>
        </button>
      </nav>
    </div>
  );
};

export default TVSportsPage;
