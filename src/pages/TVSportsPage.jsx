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
import { etDayKey, fetchTrendy48Match, normalizeTrendy48Match, trendy48EventUrl, fetchTrendy48Healthy } from '../api/trendy48Api';
import DudeTvPlayer from '../components/TVSports/DudeTvPlayer';
import SafeImage from '../components/TVSports/SafeImage';
import VoiceSearch from '../components/VoiceSearch';
import '../components/LoadingSpinner.css';
import './TVSportsPage.css';

// Sport chips mirror the trendy48 board categories
const SPORT_CHIPS = [
  { id: 'all', label: 'All' },
  { id: 'fight', label: 'Fight' },
  { id: 'american-football', label: 'NFL' },
  { id: 'football', label: 'Soccer' },
  { id: 'basketball', label: 'NBA' },
  { id: 'hockey', label: 'NHL' },
  { id: 'baseball', label: 'MLB' },
  { id: 'motor-sports', label: 'Motorsports' },
  { id: 'cricket', label: 'Cricket' },
  { id: 'tennis', label: 'Tennis' },
  { id: 'rugby', label: 'Rugby' },
  { id: 'golf', label: 'Golf' }
];
const BOARD_CATEGORIES = new Set(SPORT_CHIPS.map(c => c.id));

// Exact category when the source uses board categories (trendy48 / streamed.pk), keyword match otherwise
const matchesSport = (ev, sf) => {
  const cat = (ev.t48Cat || ev.cat || '').toLowerCase();
  if (BOARD_CATEGORIES.has(cat)) return cat === sf;
  const name = (ev.eventInfo?.eventName || ev.title || '').toLowerCase();
  if (sf === 'football') return cat.includes('football') || cat.includes('soccer') || cat.includes('ucl') || cat.includes('mls') || name.includes('fc') || name.includes('united') || name.includes('city') || name.includes('madrid') || name.includes('barcelona') || name.includes('arsenal');
  if (sf === 'fight') return cat.includes('ufc') || cat.includes('wwe') || cat.includes('mma') || cat.includes('boxing') || cat.includes('fight') || name.includes('ufc') || name.includes('fight');
  if (sf === 'basketball') return cat.includes('nba') || cat.includes('basketball') || name.includes('celtics') || name.includes('lakers') || name.includes('warriors');
  if (sf === 'cricket') return cat.includes('cricket') || name.includes('cricket') || name.includes('willow') || name.includes('ipl');
  if (sf === 'motor-sports') return cat.includes('f1') || cat.includes('motor') || cat.includes('nascar') || name.includes('grand prix');
  if (sf === 'american-football') return cat.includes('nfl') || cat.includes('american') || name.includes('eagles') || name.includes('ravens');
  if (sf === 'hockey') return cat.includes('nhl') || cat.includes('hockey');
  if (sf === 'baseball') return cat.includes('mlb') || cat.includes('baseball');
  return cat.includes(sf) || name.includes(sf);
};

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
  const playerRef = useRef(null);

  // Bring the player into view after the next paint (it may have just mounted, or the card clicked was far down),
  // stopping just below the sticky site header so the player's top bar isn't hidden under it
  const scrollToPlayer = () => {
    requestAnimationFrame(() => {
      if (!playerRef.current) return;
      const header = document.querySelector('.app-header');
      // CSS says sticky on every size, but on mobile a parent breaks it and the header scrolls away;
      // count it only when it is actually pinned to the top of the viewport right now
      const rect = header?.getBoundingClientRect();
      const headerSticks = header && ['sticky', 'fixed'].includes(getComputedStyle(header).position) &&
        (window.scrollY === 0 || (rect.top <= 1 && rect.bottom > 0));
      const headerHeight = headerSticks ? header.offsetHeight : 0;
      const top = playerRef.current.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    });
  };

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
  const [selectedDate, setSelectedDate] = useState(() => etDayKey());
  const [matchFeedDown, setMatchFeedDown] = useState(false);

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
    } else if (path.startsWith('/sports/') || /^(trendy48|streamed)_/.test(normalizedTarget)) {
      // Unlisted match id (old share, later fixture, or a streamed.pk id trendy48 drops from its list):
      // look it up, and on a 404 still play trendy48's event page since it resolves those ids server-side
      if (loading) return; // wait for the merged event list first
      const rawId = normalizedTarget.replace(/^(trendy48|streamed)_/, '');
      let cancelled = false;
      fetchTrendy48Match(rawId).then(row => {
        if (cancelled) return;
        const item = row ? normalizeTrendy48Match(row) : {
          title: rawId.replace(/[-_]+/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          cat: 'Live Sports',
          decoded_channels: [{ title: 'Trendy48 HD', link: trendy48EventUrl(rawId), type: '0' }]
        };
        handlePlayItem({ ...item, id: targetSlug }, false);
      });
      return () => { cancelled = true; };
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
            link: `https://trendy48.online/live-tv?ch=${cleanAlphaTarget || normalizedTarget}`,
            type: '0'
          }
        ]
      };
      handlePlayItem(customItem, false);
    }
  }, [searchParams, location.pathname, liveEvents, sportsChannels, categoryItems, loading]);

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
      scrollToPlayer();
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
      scrollToPlayer();
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

  // Events on the chosen calendar day (sources without a kickoff date count as today)
  const eventsOnSelectedDay = useMemo(() => {
    const today = etDayKey();
    return liveEvents.filter(ev => (ev.dayKey || today) === selectedDate);
  }, [liveEvents, selectedDate]);

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

    list = eventsOnSelectedDay;
    if (selectedSportFilter !== 'all') {
      list = list.filter(ev => matchesSport(ev, selectedSportFilter));
    }

    return list;
  }, [liveEvents, eventsOnSelectedDay, searchQuery, selectedSportFilter]);

  // Sport chip counts for the chosen day
  const sportCounts = useMemo(() => {
    const counts = { all: eventsOnSelectedDay.length };
    for (const chip of SPORT_CHIPS) {
      if (chip.id !== 'all') counts[chip.id] = eventsOnSelectedDay.filter(ev => matchesSport(ev, chip.id)).length;
    }
    return counts;
  }, [eventsOnSelectedDay]);

  // Calendar bounds: yesterday .. last day the feeds have fixtures for
  const dateBounds = useMemo(() => {
    const days = liveEvents.map(ev => ev.dayKey).filter(Boolean);
    const today = etDayKey();
    return { min: etDayKey(Date.now() - 86400000), max: days.reduce((a, b) => (b > a ? b : a), today) };
  }, [liveEvents]);

  // Only ask the health endpoint when the chosen day comes back empty
  useEffect(() => {
    if (activeTab !== 'events' || filteredEvents.length > 0 || searchQuery.trim()) return;
    let cancelled = false;
    fetchTrendy48Healthy().then(ok => { if (!cancelled) setMatchFeedDown(!ok); });
    return () => { cancelled = true; };
  }, [activeTab, filteredEvents.length, searchQuery]);

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
            <span className="tv-back-text">{activeItem ? "Close Player" : ""}</span>
          </button>

          <div className="dudetv-brand">
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

        {/* Quick Category Bar */}
        <div className="popular-searches-row tv-trending-row">
          {[
            { label: 'Cricket', query: 'Cricket' },
            { label: 'Football', query: 'Football' },
            { label: 'Tennis', query: 'Tennis' },
            { label: 'UFC & Combat', query: 'UFC' },
            { label: 'News', query: 'News' },
            { label: 'Movies', query: 'Movies' },
            { label: 'TV Shows', query: 'TV Shows' },
            { label: 'Wildlife & Documentaries', query: 'Wildlife' }
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
          🔴 Live Matches ({filteredEvents.length})
        </button>
        <button
          className={`dude-tab-btn ${activeTab === 'sports' ? 'active' : ''}`}
          onClick={() => handleTabChange('sports')}
        >
          ⚽ Sports TV ({filteredSports.length})
        </button>
        <button
          className={`dude-tab-btn ${activeTab === 'tv' ? 'active' : ''}`}
          onClick={() => handleTabChange('tv')}
        >
          🌍 Worldwide TV ({filteredCategories.length} Categories)
        </button>
        <button
          className={`dude-tab-btn ${activeTab === 'highlights' ? 'active' : ''}`}
          onClick={() => handleTabChange('highlights')}
        >
          ⭐ Highlights ({filteredHighlights.length})
        </button>
      </div>

      {/* Embedded Player when an item is active */}
      {activeItem && (
        <div ref={playerRef} className="dude-player-anchor">
          <DudeTvPlayer
            item={activeItem}
            streams={activeStreams}
            onClose={handleClosePlayer}
            currentTheme={currentTheme}
          />
        </div>
      )}

      {/* Loading & Error States */}
      {loading && (
        <div className="dude-loading-container">
          <div className="loading-spinner medium">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <p className="dude-loading-text">Connecting to Live Sports & TV Feeds...</p>
          <div className="events-grid dude-skeleton-grid" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="event-card dude-skeleton-card">
                <div className="sk sk-bar sk-short"></div>
                <div className="sk-teams">
                  <div className="sk sk-circle"></div>
                  <div className="sk sk-bar sk-tiny"></div>
                  <div className="sk sk-circle"></div>
                </div>
                <div className="sk sk-bar"></div>
                <div className="sk sk-bar sk-half"></div>
              </div>
            ))}
          </div>
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
          {/* Match day (calendar) + sport filter chips */}
          {!searchQuery.trim() && (
            <>
              <div className="match-date-row">
                <label className="match-date-label" htmlFor="match-date">Match day</label>
                <input
                  id="match-date"
                  type="date"
                  className="match-date-input"
                  value={selectedDate}
                  min={dateBounds.min}
                  max={dateBounds.max}
                  onChange={(e) => setSelectedDate(e.target.value || etDayKey())}
                />
                {selectedDate !== etDayKey() && (
                  <button type="button" className="cat-chip-btn" onClick={() => setSelectedDate(etDayKey())}>Today</button>
                )}
              </div>
              <div className="dude-categories-carousel sport-filter-carousel">
                {SPORT_CHIPS.filter(chip => chip.id === 'all' || sportCounts[chip.id] > 0).map(chip => (
                  <button
                    key={chip.id}
                    className={`cat-chip-btn ${selectedSportFilter === chip.id ? 'active' : ''}`}
                    onClick={() => setSelectedSportFilter(chip.id)}
                  >
                    {chip.label} ({sportCounts[chip.id] || 0})
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="section-header-row">
            <h2 className="section-heading">
              {searchQuery.trim() ? `Search Matches (${filteredEvents.length})` : (selectedDate === etDayKey() ? 'Today\x27s Live Matches & Events' : `Matches on ${new Date(selectedDate + 'T12:00:00').toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })}`)}
            </h2>
            <span className="section-count">{filteredEvents.length} Fixtures</span>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="no-search-results">
              {searchQuery.trim() ? (
                <>
                  <p>No matches found matching "{searchQuery}".</p>
                  <button className="clear-search-cta" onClick={() => setSearchQuery('')}>Clear Search</button>
                </>
              ) : (
                <p>{matchFeedDown ? 'The match feed is temporarily unavailable. Try again in a minute.' : 'No matches scheduled for this day and sport.'}</p>
              )}
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
                      {ev.kickoff > Date.now()
                        ? <span className="live-status-pill upcoming">{new Date(ev.kickoff).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                        : <span className="live-status-pill">{ev.source === 'trendy48' && !ev.kickoff ? '24/7' : 'LIVE'}</span>}
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
                const firstLetter = cat.title.charAt(0).toUpperCase();
                return (
                  <button
                    key={cat.id}
                    className={`cat-chip-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedCategoryLink(cat.catLink)}
                  >
                    <span className="cat-letter-icon">{firstLetter}</span>
                    <span className="cat-title-text">{cat.title}</span>
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
