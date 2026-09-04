import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import {
  fetchDudeCategories,
  fetchDudeCategoryItems,
  fetchDudeSports,
  fetchUnifiedLiveEvents,
  fetchDudeHighlights,
  fetchDudeChannelStreams
} from '../api/dudeTvApi';
import {
  FALLBACK_CATEGORIES,
  FALLBACK_SPORTS,
  FALLBACK_EVENTS,
  FALLBACK_CHANNEL_STREAMS,
  EVENT_50007_FALLBACK
} from '../api/dudeTvFallbackData';
import { RAJHODEDARA_ALL_CHANNELS } from '../api/rajhodedaraPluginApi';
import { CDX_USA_WORLD_CHANNELS, fetchCdxSportsByRegion } from '../api/cdxChannelsCatalog';
import DudeTvPlayer from '../components/TVSports/DudeTvPlayer';
import SafeImage from '../components/TVSports/SafeImage';
import VoiceSearch from '../components/VoiceSearch';
import './TVSportsPage.css';

const TVSportsPage = ({ currentTheme: propTheme = 'devil' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'tv';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedSportsRegion, setSelectedSportsRegion] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carousel refs for smooth sliding
  const sportsCarouselRef = useRef(null);
  const categoriesCarouselRef = useRef(null);

  // Data sets
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [sportsChannels, setSportsChannels] = useState(FALLBACK_SPORTS);
  const [liveEvents, setLiveEvents] = useState(FALLBACK_EVENTS);
  const [highlights, setHighlights] = useState([]);

  // Category Item selection for Worldwide TV - Defaults to USA Specific HD (CDX)
  const [selectedCategoryLink, setSelectedCategoryLink] = useState('cdx_usa');
  const [categoryItems, setCategoryItems] = useState([]);

  // Active Stream / Player State
  const [activeItem, setActiveItem] = useState(null);
  const [activeStreams, setActiveStreams] = useState([]);
  const [loadingStreams, setLoadingStreams] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSportFilter, setSelectedSportFilter] = useState('all');

  const handleVoiceResult = (transcript) => {
    setSearchQuery(transcript);
  };

  // Intelligent Back Navigation
  const handleGoBack = useCallback(() => {
    if (activeItem) {
      handleClosePlayer();
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  }, [activeItem, navigate]);

  // Global Escape Key Listener for instant player exit
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeItem) {
        handleClosePlayer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeItem]);

  // Carousel Smooth Scroll Helpers
  const scrollCarousel = (ref, offset) => {
    if (ref.current) {
      ref.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleCarouselWheel = (e, ref) => {
    if (ref.current && e.deltaY !== 0) {
      e.preventDefault();
      ref.current.scrollLeft += e.deltaY * 1.3;
    }
  };

  // Active Theme - seamlessly derived from prop and parent container
  const [currentTheme, setCurrentTheme] = useState(propTheme);

  useEffect(() => {
    if (propTheme) {
      setCurrentTheme(propTheme);
    }
  }, [propTheme]);

  useEffect(() => {
    // Detect theme class on body / App wrapper
    const checkTheme = () => {
      const appElem = document.querySelector('.App');
      const appClass = appElem ? appElem.className : '';
      const bodyClass = document.body.className || document.documentElement.className || '';
      const combined = `${appClass} ${bodyClass}`;

      if (combined.includes('theme-hannibal')) setCurrentTheme('hannibal');
      else if (combined.includes('theme-angel')) setCurrentTheme('angel');
      else if (combined.includes('theme-cyberpunk')) setCurrentTheme('cyberpunk');
      else if (combined.includes('theme-luxury')) setCurrentTheme('luxury');
      else if (combined.includes('theme-devil')) setCurrentTheme('devil');
      else if (propTheme) setCurrentTheme(propTheme);
    };

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    const appElem = document.querySelector('.App');
    if (appElem) {
      observer.observe(appElem, { attributes: true, attributeFilter: ['class'] });
    }

    return () => observer.disconnect();
  }, [propTheme]);

  // Primary Data Loader - Runs once on mount
  useEffect(() => {
    let isMounted = true;

    const loadPrimaryData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [catsRes, sportsRes, eventsRes, highRes, ch50007Res] = await Promise.allSettled([
          fetchDudeCategories(),
          fetchDudeSports(),
          fetchUnifiedLiveEvents(),
          fetchDudeHighlights(),
          fetchDudeChannelStreams('50007')
        ]);

        if (!isMounted) return;

        if (catsRes.status === 'fulfilled' && Array.isArray(catsRes.value) && catsRes.value.length > 0) {
          setCategories(catsRes.value);
          const defaultCat = catsRes.value.find(c => c && c.catLink === 'cdx_usa') || catsRes.value[0];
          if (defaultCat && defaultCat.catLink) setSelectedCategoryLink(defaultCat.catLink);
        } else {
          setCategories(FALLBACK_CATEGORIES);
          setSelectedCategoryLink('cdx_usa');
        }

        if (sportsRes.status === 'fulfilled' && Array.isArray(sportsRes.value) && sportsRes.value.length > 0) {
          setSportsChannels(sportsRes.value);
        } else {
          setSportsChannels(FALLBACK_SPORTS);
        }

        let eventsList = [];
        if (eventsRes.status === 'fulfilled' && Array.isArray(eventsRes.value) && eventsRes.value.length > 0) {
          eventsList = [...eventsRes.value];
        } else {
          eventsList = [...FALLBACK_EVENTS];
        }

        // Include 50007 dynamically if streams fetched or fallback
        const ch50007Streams = (ch50007Res.status === 'fulfilled' && Array.isArray(ch50007Res.value) && ch50007Res.value.length > 0)
          ? ch50007Res.value
          : EVENT_50007_FALLBACK.decoded_channels;

        const event50007 = {
          ...EVENT_50007_FALLBACK,
          decoded_channels: ch50007Streams
        };

        const has50007 = eventsList.some(ev => String(ev.id) === '50007');
        if (!has50007) {
          eventsList.unshift(event50007);
        }

        setLiveEvents(eventsList);

        if (highRes.status === 'fulfilled' && Array.isArray(highRes.value)) {
          setHighlights(highRes.value);
        }
      } catch (err) {
        console.warn('Network issue loading directory, using resilient fallback data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPrimaryData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Category Items Loader - Runs when selected category changes
  useEffect(() => {
    let isMounted = true;
    if (!selectedCategoryLink) return;

    const loadCatItems = async () => {
      try {
        const items = await fetchDudeCategoryItems(selectedCategoryLink);
        if (isMounted) setCategoryItems(items);
      } catch (err) {
        console.error('Error fetching category items:', err);
      }
    };

    loadCatItems();

    return () => {
      isMounted = false;
    };
  }, [selectedCategoryLink]);

  // Deep Link Autoplay Handler: watches URL path (/channel/:slug, /sports/:id) and ?channel= / ?play= query params
  useEffect(() => {
    let targetSlug = '';
    const path = window.location.pathname;
    if (path.startsWith('/channel/')) {
      targetSlug = path.replace('/channel/', '').split('/')[0].trim();
    } else if (path.startsWith('/sports/')) {
      targetSlug = path.replace('/sports/', '').split('/')[0].trim();
    }
    if (!targetSlug) {
      targetSlug = searchParams.get('channel') || searchParams.get('play') || '';
    }
    if (!targetSlug || activeItem?.slug === targetSlug || activeItem?.id === targetSlug) return;

    const normalizedTarget = decodeURIComponent(targetSlug).toLowerCase().trim();
    const cleanAlphaTarget = normalizedTarget.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    // Check across all catalogs
    const allCandidates = [
      ...CDX_USA_WORLD_CHANNELS,
      ...liveEvents,
      ...sportsChannels,
      ...categoryItems,
      ...RAJHODEDARA_ALL_CHANNELS
    ];

    const match = allCandidates.find(c => {
      const s = String(c.slug || '').toLowerCase();
      const id = String(c.id || '').toLowerCase();
      const cdx = String(c.cdxSlug || '').toLowerCase();
      const title = (c.title || c.name || '').toLowerCase();
      const alphaTitle = title.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

      return s === normalizedTarget ||
             s === cleanAlphaTarget ||
             id === normalizedTarget ||
             cdx === normalizedTarget ||
             title === normalizedTarget ||
             alphaTitle === cleanAlphaTarget;
    });

    if (match) {
      handlePlayItem(match, false);
    } else if (FALLBACK_CHANNEL_STREAMS[cleanAlphaTarget] || FALLBACK_CHANNEL_STREAMS[normalizedTarget]) {
      const customItem = {
        id: cleanAlphaTarget || normalizedTarget,
        slug: cleanAlphaTarget || normalizedTarget,
        title: (cleanAlphaTarget || normalizedTarget).replace(/[-_]+/g, ' ').toUpperCase(),
        cat: 'TV Channel',
        decoded_channels: FALLBACK_CHANNEL_STREAMS[cleanAlphaTarget] || FALLBACK_CHANNEL_STREAMS[normalizedTarget]
      };
      handlePlayItem(customItem, false);
    } else {
      // Dynamic fallback embed resolver for any shared channel link
      const readableTitle = (cleanAlphaTarget || normalizedTarget).replace(/[-_]+/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const customItem = {
        id: cleanAlphaTarget || normalizedTarget,
        slug: cleanAlphaTarget || normalizedTarget,
        title: readableTitle,
        cat: 'Live Stream',
        decoded_channels: [
          {
            title: `${readableTitle} (Server 1 - Live)`,
            link: `https://embed.st/embed/admin/${cleanAlphaTarget || normalizedTarget}/1`,
            type: '0'
          },
          {
            title: `${readableTitle} (CDX Mirror)`,
            link: `https://epiembeds.online/embed/${cleanAlphaTarget || normalizedTarget}`,
            type: '0'
          }
        ]
      };
      handlePlayItem(customItem, false);
    }
  }, [searchParams, location.pathname, liveEvents, sportsChannels, categoryItems]);

  // Handle browser back button (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const isChannelPath = window.location.pathname.startsWith('/channel/');
      const playId = new URLSearchParams(window.location.search).get('play') || new URLSearchParams(window.location.search).get('channel');
      if (!isChannelPath && !playId && activeItem) {
        setActiveItem(null);
        setActiveStreams([]);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeItem]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      p.set('tab', tab);
      return p;
    });
    if (tab === 'sports') {
      setSelectedSportsRegion('all');
    }
  }, [setSearchParams]);

  // Launch stream playback and update shareable URL route (/channel/:slug or ?play=)
  const handlePlayItem = async (item, updateUrl = true) => {
    setActiveItem(item);
    setActiveStreams([]); // Reset active streams immediately to prevent cross-channel bleed
    setLoadingStreams(true);

    if (updateUrl) {
      if (item.slug) {
        window.history.pushState({}, '', `/channel/${item.slug}`);
      } else {
        setSearchParams({ tab: activeTab, play: String(item.id) });
      }
    }

    if (item.decoded_channels && item.decoded_channels.length > 0) {
      setActiveStreams(item.decoded_channels);
      setLoadingStreams(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      const fetched = await fetchDudeChannelStreams(item.id, item.title || item.name);
      if (fetched && fetched.length > 0) {
        setActiveStreams(fetched);
      } else if (item.formatsNew && item.formatsNew.length > 0 && item.formatsNew[0]?.link) {
        setActiveStreams(item.formatsNew);
      } else {
        const defaultStream = [
          {
            title: `${item.title || item.name} (Server 1 - Live)`,
            link: `https://embed.st/embed/admin/${(item.slug || item.title || 'live').toLowerCase().replace(/[^a-z0-9]+/g, '-')}/1`,
            type: '0'
          }
        ];
        setActiveStreams(defaultStream);
      }
    } catch (e) {
      console.warn('Could not load extra channel streams, using fallback:', e);
      setActiveStreams([]);
    } finally {
      setLoadingStreams(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Close player and cleanly restore URL route
  const handleClosePlayer = () => {
    setActiveItem(null);
    setActiveStreams([]);
    if (window.location.pathname.startsWith('/channel/')) {
      window.history.pushState({}, '', `/tv-sports?tab=${activeTab}`);
    } else {
      setSearchParams({ tab: activeTab });
    }
  };

  // Filtered lists based on search query and sport filter
  const filteredEvents = useMemo(() => {
    let list = liveEvents;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return list.filter(ev => {
        const name = ev.eventInfo?.eventName || ev.title || '';
        const teamA = ev.eventInfo?.teamA || '';
        const teamB = ev.eventInfo?.teamB || '';
        const cat = ev.cat || '';
        return name.toLowerCase().includes(q) || teamA.toLowerCase().includes(q) || teamB.toLowerCase().includes(q) || cat.toLowerCase().includes(q);
      });
    }

    if (selectedSportFilter !== 'all') {
      const sf = selectedSportFilter.toLowerCase();
      list = list.filter(ev => {
        const cat = (ev.cat || '').toLowerCase();
        const name = (ev.eventInfo?.eventName || ev.title || '').toLowerCase();
        if (sf === 'football') return cat.includes('football') || cat.includes('soccer') || cat.includes('ucl') || cat.includes('mls') || name.includes('fc') || name.includes('united') || name.includes('city') || name.includes('madrid') || name.includes('barcelona') || name.includes('arsenal');
        if (sf === 'combat') return cat.includes('ufc') || cat.includes('wwe') || cat.includes('mma') || cat.includes('boxing') || cat.includes('fight') || name.includes('ufc') || name.includes('fight');
        if (sf === 'basketball') return cat.includes('nba') || cat.includes('basketball') || name.includes('celtics') || name.includes('lakers') || name.includes('warriors');
        if (sf === 'cricket') return cat.includes('cricket') || name.includes('cricket') || name.includes('willow') || name.includes('ipl');
        if (sf === 'motorsport') return cat.includes('f1') || cat.includes('motor') || cat.includes('nascar') || name.includes('grand prix');
        if (sf === 'american') return cat.includes('nfl') || cat.includes('mlb') || cat.includes('nhl') || cat.includes('baseball') || name.includes('eagles') || name.includes('ravens');
        return cat.includes(sf) || name.includes(sf);
      });
    }

    return list;
  }, [liveEvents, searchQuery, selectedSportFilter]);

  const filteredSports = useMemo(() => {
    let list = sportsChannels;

    // Apply Sub-Region filter
    if (selectedSportsRegion !== 'all') {
      const reg = selectedSportsRegion;
      if (reg === 'us') {
        list = list.filter(sp => sp.flag === 'us' || sp.region === 'us' || (sp.cat || '').toLowerCase().includes('usa'));
      } else if (reg === 'gb') {
        list = list.filter(sp => sp.flag === 'gb' || sp.region === 'gb' || sp.flag === 'ie' || sp.region === 'ie' || (sp.title || '').toLowerCase().includes('sky') || (sp.title || '').toLowerCase().includes('tnt') || (sp.title || '').toLowerCase().includes('premier'));
      } else if (reg === 'eu') {
        list = list.filter(sp => ['es', 'de', 'it', 'pt', 'pl', 'fr'].includes(sp.flag || sp.region) || (sp.title || '').toLowerCase().includes('dazn') || (sp.title || '').toLowerCase().includes('polsat') || (sp.title || '').toLowerCase().includes('canal+') || (sp.title || '').toLowerCase().includes('movistar') || (sp.title || '').toLowerCase().includes('go3') || (sp.title || '').toLowerCase().includes('eleven'));
      } else if (reg === 'au') {
        list = list.filter(sp => sp.flag === 'au' || sp.region === 'au' || sp.flag === 'nz' || sp.region === 'nz' || (sp.slug || '').includes('501') || (sp.slug || '').includes('502') || (sp.slug || '').includes('503') || (sp.slug || '').includes('504') || (sp.slug || '').includes('505') || (sp.slug || '').includes('506') || (sp.slug || '').includes('507') || (sp.slug || '').includes('nz'));
      } else if (reg === 'combat') {
        list = list.filter(sp => (sp.title || '').toLowerCase().includes('ufc') || (sp.title || '').toLowerCase().includes('fight') || (sp.title || '').toLowerCase().includes('motogp') || (sp.title || '').toLowerCase().includes('racer') || (sp.title || '').toLowerCase().includes('wwe'));
      } else if (reg === 'cricket') {
        list = list.filter(sp => (sp.title || '').toLowerCase().includes('cricket') || (sp.title || '').toLowerCase().includes('willow') || (sp.title || '').toLowerCase().includes('star sports') || (sp.title || '').toLowerCase().includes('sports18') || (sp.title || '').toLowerCase().includes('fancode') || (sp.title || '').toLowerCase().includes('sony sports') || (sp.title || '').toLowerCase().includes('ten'));
      }
    }

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(sp => {
      const title = sp.title || sp.name || '';
      const cat = sp.cat || sp.category || '';
      const slug = sp.slug || '';
      const formats = (sp.formats || []).join(' ');
      return title.toLowerCase().includes(q) || cat.toLowerCase().includes(q) || slug.toLowerCase().includes(q) || formats.toLowerCase().includes(q);
    });
  }, [sportsChannels, searchQuery, selectedSportsRegion]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(c => (c.title || '').toLowerCase().includes(q));
  }, [categories, searchQuery]);

  const filteredCategoryItems = useMemo(() => {
    if (!searchQuery.trim()) return categoryItems;
    const q = searchQuery.toLowerCase();
    return categoryItems.filter(ci => {
      const title = ci.title || '';
      const cat = ci.cat || '';
      return title.toLowerCase().includes(q) || cat.toLowerCase().includes(q);
    });
  }, [categoryItems, searchQuery]);

  const filteredHighlights = useMemo(() => {
    if (!searchQuery.trim()) return highlights;
    const q = searchQuery.toLowerCase();
    return highlights.filter(hi => {
      const title = hi.eventInfo?.eventName || hi.title || '';
      const cat = hi.cat || '';
      return title.toLowerCase().includes(q) || cat.toLowerCase().includes(q);
    });
  }, [highlights, searchQuery]);

  return (
    <div className={`dudetv-page theme-${currentTheme}`}>
      {/* Top Header Banner */}
      <div className="dudetv-header-banner">
        <div className="dudetv-header-left">
          <button
            type="button"
            className="tv-premium-back-btn"
            onClick={handleGoBack}
            title={activeItem ? "Close Player (Esc)" : "Return to Previous Page"}
            aria-label="Go Back"
          >
            <span className="tv-back-arrow">←</span>
            <span className="tv-back-text">{activeItem ? "Close Player" : "Back to Home"}</span>
          </button>

          <div className="dudetv-brand">
            <span className="dude-badge">TV & SPORTS HUB</span>
            <h1 className="dude-page-title">Live TV & Sports Arena</h1>
          </div>
        </div>
      </div>

      {/* Grand Full-Width Search Section (Matching Movies & TV Shows UI) */}
      <div className="tv-search-section">
        <div className="tv-search-controls-container expanded">
          <div className="tv-search-input-container expanded">
            <svg className="tv-search-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              id="tv-search-input"
              placeholder="Search 500+ Live Channels, Sports Networks, Matches, Teams, Countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="tv-search-input"
              autoComplete="off"
            />
            {searchQuery && (
              <button
                type="button"
                className="tv-clear-search-btn"
                onClick={() => setSearchQuery('')}
                title="Clear Search"
              >
                ✕
              </button>
            )}
            <VoiceSearch
              onResult={handleVoiceResult}
              onError={(error) => console.warn('TV Voice search error:', error)}
              currentTheme={currentTheme}
            />
          </div>
        </div>

        {/* Sleek Minimalist Trending Quick Category Bar */}
        <div className="popular-searches-row tv-trending-row">
          <span className="popular-searches-label">Trending:</span>
          {[
            { label: 'All Channels', query: '' },
            { label: 'ESPN', query: 'ESPN' },
            { label: 'Fox Sports', query: 'Fox Sports' },
            { label: 'Cricket', query: 'Cricket' },
            { label: 'Football / Soccer', query: 'Football' },
            { label: 'UFC & Combat', query: 'UFC' },
            { label: 'NBA Basketball', query: 'NBA' },
            { label: 'HBO Movies', query: 'HBO' },
            { label: 'Sky Sports', query: 'Sky Sports' },
            { label: 'DAZN', query: 'DAZN' },
            { label: 'Kids & Cartoons', query: 'Kids' },
            { label: 'News 24/7', query: 'News' }
          ].map(pill => (
            <button
              key={pill.label}
              type="button"
              className={`popular-search-pill ${searchQuery === pill.query ? 'active' : ''}`}
              onClick={() => setSearchQuery(pill.query)}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Global Search Results Summary Banner */}
      {searchQuery.trim() && (
        <div className="search-summary-banner">
          <span className="search-summary-label">Search results for "{searchQuery}":</span>
          <div className="search-pills-row">
            <button
              className={`search-tab-pill ${activeTab === 'events' ? 'active' : ''}`}
              onClick={() => handleTabChange('events')}
            >
              Matches ({filteredEvents.length})
            </button>
            <button
              className={`search-tab-pill ${activeTab === 'sports' ? 'active' : ''}`}
              onClick={() => handleTabChange('sports')}
            >
              Sports TV ({filteredSports.length})
            </button>
            <button
              className={`search-tab-pill ${activeTab === 'tv' ? 'active' : ''}`}
              onClick={() => handleTabChange('tv')}
            >
              Channels ({filteredCategoryItems.length})
            </button>
            <button
              className={`search-tab-pill ${activeTab === 'highlights' ? 'active' : ''}`}
              onClick={() => handleTabChange('highlights')}
            >
              Highlights ({filteredHighlights.length})
            </button>
            <button className="search-clear-chip" onClick={() => setSearchQuery('')}>
              ✕ Reset
            </button>
          </div>
        </div>
      )}

      {/* Main Tab Switcher */}
      <div className="dude-tab-bar">
        <button
          className={`dude-tab-btn ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => handleTabChange('events')}
        >
          Live Matches ({filteredEvents.length})
        </button>
        <button
          className={`dude-tab-btn ${activeTab === 'sports' ? 'active' : ''}`}
          onClick={() => handleTabChange('sports')}
        >
          Sports TV ({filteredSports.length})
        </button>
        <button
          className={`dude-tab-btn ${activeTab === 'tv' ? 'active' : ''}`}
          onClick={() => handleTabChange('tv')}
        >
          Worldwide TV ({filteredCategories.length} Categories)
        </button>
        <button
          className={`dude-tab-btn ${activeTab === 'highlights' ? 'active' : ''}`}
          onClick={() => handleTabChange('highlights')}
        >
          Highlights ({filteredHighlights.length})
        </button>
      </div>

      {/* Embedded Player when an item is active */}
      {activeItem && (
        <DudeTvPlayer
          item={activeItem}
          streams={activeStreams}
          onClose={handleClosePlayer}
          currentTheme={currentTheme}
        />
      )}

      {/* Loading & Error States */}
      {loading && (
        <div className="dude-loading-container">
          <div className="dude-spinner"></div>
          <p>Connecting to Live Sports & TV Feeds...</p>
        </div>
      )}

      {error && !loading && (
        <div className="dude-error-container">
          <p>{error}</p>
          <button className="dude-retry-btn" onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      {/* Tab 1: Live Events & Matches */}
      {!loading && activeTab === 'events' && (
        <section className="dude-section">
          {/* Sport Filter Chips */}
          {!searchQuery.trim() && (
            <div className="dude-categories-carousel sport-filter-carousel">
              {[
                { id: 'all', label: 'All Matches' },
                { id: 'football', label: 'Football / Soccer' },
                { id: 'combat', label: 'Combat / UFC' },
                { id: 'basketball', label: 'Basketball / NBA' },
                { id: 'cricket', label: 'Cricket' },
                { id: 'motorsport', label: 'Motorsport' },
                { id: 'american', label: 'NFL & American Sports' }
              ].map(chip => (
                <button
                  key={chip.id}
                  className={`cat-chip-btn ${selectedSportFilter === chip.id ? 'active' : ''}`}
                  onClick={() => setSelectedSportFilter(chip.id)}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}

          <div className="section-header-row">
            <h2 className="section-heading">
              {searchQuery.trim() ? `Search Matches (${filteredEvents.length})` : 'Active Live Matches & Events'}
            </h2>
            <span className="section-count">{filteredEvents.length} Fixtures</span>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="no-search-results">
              <p>No matches found matching "{searchQuery}".</p>
              <button className="clear-search-cta" onClick={() => setSearchQuery('')}>Clear Search</button>
            </div>
          ) : (
            <div className="events-grid">
              {filteredEvents.map((ev) => {
                const info = ev.eventInfo || {};
                const channelsCount = (ev.decoded_channels || ev.formats || []).length;
                const isHot = info.isHot === '1';
                const isLsp = ev.source === 'live-sport-plugin';

                return (
                  <div key={ev.id} className="event-card" onClick={() => handlePlayItem(ev)}>
                    <div className="event-top-bar">
                      <span className="event-category-badge">{ev.cat || 'Sports'}</span>
                      {isLsp && <span className="lsp-pill">DIRECT FEED</span>}
                      {isHot && <span className="hot-pill">HOT</span>}
                      <span className="live-status-pill">LIVE</span>
                    </div>

                    <div className="event-teams-row">
                      <div className="team-col">
                        <SafeImage
                          src={info.teamAFlag}
                          alt={info.teamA || 'Team A'}
                          className="team-flag"
                          type="flag"
                        />
                        <span className="team-name">{info.teamA || 'Team A'}</span>
                      </div>

                      <div className="vs-badge">VS</div>

                      <div className="team-col">
                        <SafeImage
                          src={info.teamBFlag}
                          alt={info.teamB || 'Team B'}
                          className="team-flag"
                          type="flag"
                        />
                        <span className="team-name">{info.teamB || 'Team B'}</span>
                      </div>
                    </div>

                    <div className="event-card-bottom">
                      <h3 className="event-title">{info.eventName || ev.title}</h3>
                      <div className="event-channels-info">
                        <span className="channels-pill">{channelsCount} Stream Feeds</span>
                        <span className="watch-now-cta">Watch Live ➔</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Tab 2: Sports Channels */}
      {!loading && activeTab === 'sports' && (
        <section className="dude-section">
          {/* Sports Region Filter Carousel */}
          {!searchQuery.trim() && (
            <div className="carousel-slider-wrapper">
              <button
                type="button"
                className="carousel-arrow-btn left"
                onClick={() => scrollCarousel(sportsCarouselRef, -280)}
                aria-label="Scroll Sports Filter Left"
              >
                ‹
              </button>
              <div
                ref={sportsCarouselRef}
                className="dude-categories-carousel sport-filter-carousel grab-to-slide"
                onWheel={(e) => handleCarouselWheel(e, sportsCarouselRef)}
              >
                {[
                  { id: 'all', label: `All Sports (${sportsChannels.length})` },
                  { id: 'us', label: 'USA Networks' },
                  { id: 'gb', label: 'UK & Ireland' },
                  { id: 'eu', label: 'Europe & DAZN' },
                  { id: 'au', label: 'Australia & NZ' },
                  { id: 'cricket', label: 'Cricket & Ten' },
                  { id: 'combat', label: 'Combat & Racing' }
                ].map(chip => (
                  <button
                    key={chip.id}
                    className={`cat-chip-btn ${selectedSportsRegion === chip.id ? 'active' : ''}`}
                    onClick={() => setSelectedSportsRegion(chip.id)}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="carousel-arrow-btn right"
                onClick={() => scrollCarousel(sportsCarouselRef, 280)}
                aria-label="Scroll Sports Filter Right"
              >
                ›
              </button>
            </div>
          )}

          <div className="section-header-row">
            <h2 className="section-heading">
              {searchQuery.trim() ? `Search Sports Networks (${filteredSports.length})` : 'Premium Sports Networks'}
            </h2>
            <span className="section-count">{filteredSports.length} Networks</span>
          </div>

          {filteredSports.length === 0 ? (
            <div className="no-search-results">
              <p>No sports channels found matching "{searchQuery}".</p>
              <button className="clear-search-cta" onClick={() => setSearchQuery('')}>Clear Search</button>
            </div>
          ) : (
            <div className="modern-channels-grid">
              {filteredSports.map((sp) => {
                const title = sp.title || sp.name;
                const slug = sp.slug || sp.id;
                const flag = sp.flag || (sp.region === 'gb' ? 'gb' : sp.region === 'au' ? 'au' : 'us');
                const category = sp.category || sp.cat || 'Sports';
                const viewers = sp.viewers || Math.floor(Math.random() * 4) + 1;

                return (
                  <a
                    key={sp.id || slug}
                    className="channel-modern-card group"
                    href={sp.href || `/channel/${slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePlayItem(sp);
                    }}
                  >
                    <div className="channel-modern-banner">
                      <SafeImage
                        src={sp.image}
                        alt={title}
                        className="channel-modern-img"
                        type="logo"
                      />
                      <div className="channel-modern-overlay" />
                      {flag && (
                        <div className="channel-modern-flag">
                          <img
                            src={`https://flagcdn.com/20x15/${flag.toLowerCase()}.png`}
                            alt={`${flag} flag`}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="channel-modern-info">
                      <div className="channel-modern-header">
                        <h3 className="channel-modern-title">{title}</h3>
                        <span className="channel-modern-free">FREE</span>
                      </div>
                      <p className="channel-modern-desc">Watch endless programming on this 24/7 channel broadcast.</p>
                      <div className="channel-modern-footer">
                        <div className="channel-modern-tags">
                          <span className="channel-modern-pill">{category}</span>
                          <span className="channel-modern-pill">24/7 Stream</span>
                        </div>
                        <div className="channel-modern-live">
                          <span className="pulse-ping-box">
                            <span className="pulse-ping-wave" />
                            <span className="pulse-ping-core" />
                          </span>
                          <span className="channel-modern-viewers">{viewers}</span>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Tab 3: Worldwide TV & Categories */}
      {!loading && activeTab === 'tv' && (
        <section className="dude-section">
          {/* Category Chips Bar with Slide Chevrons */}
          <div className="carousel-slider-wrapper">
            <button
              type="button"
              className="carousel-arrow-btn left"
              onClick={() => scrollCarousel(categoriesCarouselRef, -320)}
              aria-label="Scroll Categories Left"
            >
              ‹
            </button>
            <div
              ref={categoriesCarouselRef}
              className="dude-categories-carousel grab-to-slide"
              onWheel={(e) => handleCarouselWheel(e, categoriesCarouselRef)}
            >
              {filteredCategories.map((cat) => {
                const isActive = selectedCategoryLink === cat.catLink;
                return (
                  <button
                    key={cat.id}
                    className={`cat-chip-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedCategoryLink(cat.catLink)}
                  >
                    <SafeImage
                      src={cat.image}
                      alt={cat.title}
                      className="cat-chip-icon"
                      type="chip"
                    />
                    <span>{cat.title}</span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              className="carousel-arrow-btn right"
              onClick={() => scrollCarousel(categoriesCarouselRef, 320)}
              aria-label="Scroll Categories Right"
            >
              ›
            </button>
          </div>

          <div className="section-header-row">
            <h2 className="section-heading">Channels in Category</h2>
            <span className="section-count">{filteredCategoryItems.length} Channels</span>
          </div>

          {filteredCategoryItems.length === 0 ? (
            <div className="no-search-results">
              <p>No channels found matching "{searchQuery}" in this category.</p>
              <button className="clear-search-cta" onClick={() => setSearchQuery('')}>Clear Search</button>
            </div>
          ) : (
            <div className="modern-channels-grid">
              {filteredCategoryItems.map((ci) => {
                const title = ci.title || ci.name;
                const slug = ci.slug || ci.id;
                const flag = ci.flag || 'us';
                const category = ci.category || ci.cat || 'Entertainment';
                const viewers = ci.viewers || Math.floor(Math.random() * 4) + 1;

                return (
                  <a
                    key={ci.id || slug}
                    className="channel-modern-card group"
                    href={ci.href || `/channel/${slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePlayItem(ci);
                    }}
                  >
                    <div className="channel-modern-banner">
                      <SafeImage
                        src={ci.image}
                        alt={title}
                        className="channel-modern-img"
                        type="logo"
                      />
                      <div className="channel-modern-overlay" />
                      {flag && (
                        <div className="channel-modern-flag">
                          <img
                            src={`https://flagcdn.com/20x15/${flag.toLowerCase()}.png`}
                            alt={`${flag} flag`}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="channel-modern-info">
                      <div className="channel-modern-header">
                        <h3 className="channel-modern-title">{title}</h3>
                        <span className="channel-modern-free">FREE</span>
                      </div>
                      <p className="channel-modern-desc">Watch endless programming on this 24/7 channel broadcast.</p>
                      <div className="channel-modern-footer">
                        <div className="channel-modern-tags">
                          <span className="channel-modern-pill">{category}</span>
                          <span className="channel-modern-pill">24/7 Stream</span>
                        </div>
                        <div className="channel-modern-live">
                          <span className="pulse-ping-box">
                            <span className="pulse-ping-wave" />
                            <span className="pulse-ping-core" />
                          </span>
                          <span className="channel-modern-viewers">{viewers}</span>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Tab 4: Match Highlights */}
      {!loading && activeTab === 'highlights' && (
        <section className="dude-section">
          <div className="section-header-row">
            <h2 className="section-heading">Recent Match Highlights</h2>
            <span className="section-count">{filteredHighlights.length} Highlights</span>
          </div>

          {filteredHighlights.length === 0 ? (
            <div className="no-search-results">
              <p>No highlights found matching "{searchQuery}".</p>
              <button className="clear-search-cta" onClick={() => setSearchQuery('')}>Clear Search</button>
            </div>
          ) : (
            <div className="events-grid">
              {filteredHighlights.map((hi) => {
                const info = hi.eventInfo || {};

                return (
                  <div key={hi.id} className="event-card highlight-card" onClick={() => handlePlayItem(hi)}>
                    {info.eventBanner && (
                      <SafeImage
                        src={info.eventBanner}
                        alt={hi.title}
                        className="highlight-banner"
                        type="logo"
                      />
                    )}

                    <div className="event-top-bar">
                      <span className="event-category-badge">{hi.cat || 'Highlights'}</span>
                      <span className="highlight-pill">REPLAY</span>
                    </div>

                    <div className="event-teams-row">
                      <div className="team-col">
                        <SafeImage
                          src={info.teamAFlag}
                          alt={info.teamA || hi.title}
                          className="team-flag"
                          type="flag"
                        />
                        <span className="team-name">{info.teamA || hi.title}</span>
                      </div>

                      {info.teamB && <div className="vs-badge">VS</div>}

                      {info.teamB && (
                        <div className="team-col">
                          <SafeImage
                            src={info.teamBFlag}
                            alt={info.teamB}
                            className="team-flag"
                            type="flag"
                          />
                          <span className="team-name">{info.teamB}</span>
                        </div>
                      )}
                    </div>

                    <div className="event-card-bottom">
                      <h3 className="event-title">{info.eventName || hi.title}</h3>
                      <div className="event-channels-info">
                        <span className="channels-pill">Full Extended Replay</span>
                        <span className="watch-now-cta">Watch Replay ➔</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default TVSportsPage;
