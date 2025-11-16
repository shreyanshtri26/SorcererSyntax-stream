import React, { useState, useEffect, useCallback, useRef, lazy, Suspense, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  getTrendingMovies,
  getTrendingTVShows,
  getTopRatedMovies,
  getTopRatedTVShows,
  searchMultiMedia,
  getLanguages,
  getMovieGenres,
  getTVGenres,
  discoverMedia,
  getVideos,
  IMAGE_BASE_URL
} from './api/api';
import PlayerModal from './contexts/PlayerModal';
import Header from './contexts/Header';
import InstantSearchResults from './context/InstantSearchResults';
import PersonDetailsModal from './contexts/PersonDetailsModal';
import './App.css';
import filterIcon from './contexts/assets/filter-icon.svg';
import devilIcon from './contexts/assets/devil-icon.svg';
import angelIcon from './contexts/assets/angel-icon.svg';
import hannibalIcon from './contexts/assets/hannibal-icon.svg';
import { AnimatePresence, motion } from 'framer-motion';
import MusicHub from './contexts/MusicHub';
import { usePlayer } from './context/PlayerContext';
import useUrlState from './hooks/useUrlState';
// NEW IMPORTS - Custom Hooks & Components
import { useDebounce } from './hooks/useDebounce';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import VoiceSearch from './components/VoiceSearch';
import { MediaGridSkeleton } from './components/SkeletonLoader';
import InfiniteScrollGrid from './components/InfiniteScrollGrid';
import JumpToPage from './components/JumpToPage';

// --- Helper Function for Themed Titles ---
const getThemedTitle = (defaultTitle, theme) => {
  if (theme !== 'hannibal') {
    return defaultTitle;
  }

  // Mapping for "The Harvest" theme
  const hannibalTitles = {
    "Trending Movies": "Fleeting Appetizers (Movies)",
    "Trending TV Shows": "Serial Distractions (TV)",
    "Top Rated Movies": "Prized Specimens (Movies)",
    "Top Rated TV Shows": "Long-Term Studies (TV)",
    "Filtered Results": "Curated Selection",
    // Search results need special handling due to the dynamic query
  };

  // Handle search results title specifically
  if (defaultTitle.startsWith("Search Results:")) {
    const query = defaultTitle.substring("Search Results: ".length);
    return `The Hunt: ${query}`;
  }

  return hannibalTitles[defaultTitle] || defaultTitle; // Fallback to default if no mapping exists
};

const MediaItem = ({ item, type, onClick }) => {
  // Get actual type from item.media_type (from multi-search) or fall back to passed type
  const mediaType = item.media_type || type;
  const [genres, setGenres] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  const [isLoadingTrailer, setIsLoadingTrailer] = useState(false);

  // Fetch genres when the component mounts or when item changes
  useEffect(() => {
    const fetchGenres = async () => {
      if (!item || !item.genre_ids || item.genre_ids.length === 0) {
        return;
      }

      try {
        const genreList = mediaType === 'movie' ? await getMovieGenres() : await getTVGenres();
        if (genreList && genreList.genres) {
          // Match genre IDs with genre names (limit to first 3)
          const itemGenres = genreList.genres
            .filter(genre => item.genre_ids.includes(genre.id))
            .slice(0, 3);
          setGenres(itemGenres);
        }
      } catch (err) {
        console.error("Error fetching genres:", err);
      }
    };

    fetchGenres();
  }, [item, mediaType]);

  // Fetch trailer on hover
  useEffect(() => {
    let isMounted = true; // Prevent state update on unmounted component
    if (isHovered && item && item.id && mediaType !== 'person') {
      setIsLoadingTrailer(true);
      setTrailerKey(null); // Reset previous key
      getVideos(mediaType, item.id)
        .then(videos => {
          if (isMounted && videos && Array.isArray(videos)) {
            // Prioritize Trailer > Teaser > Clip
            const trailer = videos.find(v => v?.site === 'YouTube' && v?.type === 'Trailer') ||
              videos.find(v => v?.site === 'YouTube' && v?.type === 'Teaser') ||
              videos.find(v => v?.site === 'YouTube' && v?.type === 'Clip');
            if (trailer?.key) {
              console.log(`Found trailer key: ${trailer.key} for ${item.title || item.name}`);
              setTrailerKey(trailer.key);
            } else {
              console.log(`No suitable YouTube preview found for ${item.title || item.name}`);
            }
          }
        })
        .catch(err => {
          if (isMounted) console.error('Error fetching preview:', err);
        })
        .finally(() => {
          if (isMounted) setIsLoadingTrailer(false);
        });
    }

    return () => {
      isMounted = false; // Cleanup on unmount or hover change
    };
  }, [isHovered, item, mediaType]); // Re-run if hover state or item changes

  const handleClick = (e) => {
    // Prevent triggering click when clicking buttons inside hover content
    if (e.target.closest('.hover-buttons button')) {
      return;
    }
    onClick(item, mediaType, false); // Open details modal
  };

  const handlePlayClick = (e) => {
    e.stopPropagation();
    onClick(item, mediaType, false); // Open details modal (which has play button)
  };

  const handleTrailerClick = (e) => {
    e.stopPropagation();
    onClick(item, mediaType, true); // Request trailer in modal
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    // Optionally reset trailer key on mouse leave to stop playback immediately
    // setTrailerKey(null);
  };

  // Determine if this is from a search/filter result
  const isFromSearch = item.media_type !== undefined; // Multi-search results include media_type

  // Person-specific rendering
  if (mediaType === 'person') {
    return (
      <div className={`media-item person-item`} onClick={handleClick}>
        <img
          src={item.profile_path ? `${IMAGE_BASE_URL}${item.profile_path}` : 'no-profile.jpg'}
          alt={item.name}
          onError={(e) => { e.target.onerror = null; e.target.src = 'no-poster.jpg' }}
        />
        <div className="media-info">
          <h3>{item.name}</h3>
          {item.known_for_department && (
            <p className="department">{item.known_for_department}</p>
          )}
          {item.popularity > 0 && (
            <div className="popularity">⭐ {item.popularity.toFixed(1)}</div>
          )}
          {item.known_for && item.known_for.length > 0 && (
            <p className="known-for">
              Known for: {item.known_for.map(work =>
                work.title || work.name).slice(0, 2).join(', ')}
              {item.known_for.length > 2 ? '...' : ''}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Enhanced rendering for movies and TV shows
  return (
    <div
      className={`media-item ${isHovered ? 'hovered' : ''}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="poster-container">
        {/* Conditionally render trailer or poster */}
        {(isHovered && trailerKey) ? (
          <div className="video-preview-wrapper">
            <iframe
              className="video-preview-iframe"
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerKey}&modestbranding=1&showinfo=0&rel=0`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={`${item.title || item.name} Trailer Preview`}
            ></iframe>
            {/* Fallback image might be needed if iframe fails */}
          </div>
        ) : (
          <img
            src={item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : 'no-poster.jpg'}
            alt={mediaType === 'movie' ? item.title : item.name}
            onError={(e) => { e.target.onerror = null; e.target.src = 'no-poster.jpg' }}
            loading="lazy" // Add lazy loading
          />
        )}
        {isHovered && isLoadingTrailer && !trailerKey && (
          <div className="trailer-loading-indicator">Loading Preview...</div>
        )}

        {/* Netflix-like expanded content that appears on hover */}
        <div className="netflix-hover-content">
          {/* Top hover content: title, details, play options */}
          <div className="hover-top-content">
            <h3>{mediaType === 'movie' ? item.title : item.name}</h3>
            <div className="hover-buttons">
              <button className="play-btn" onClick={handlePlayClick} aria-label="View Details">
                <span>▶</span>
              </button>
              <button className="trailer-btn" onClick={handleTrailerClick} aria-label="Watch Trailer">
                <span>Trailer</span>
              </button>
            </div>
          </div>

          {/* Bottom hover content: metadata, genre, description */}
          <div className="hover-bottom-content">
            <div className="meta-info">
              {/* Only show match score for regular content, NOT for search/filtered results */}
              {!isFromSearch && item.vote_average > 0 && (
                <span className="match-score">{Math.round(item.vote_average * 10)}% Match</span>
              )}
              <span className="year">{mediaType === 'movie'
                ? (item.release_date ? item.release_date.substring(0, 4) : 'N/A')
                : (item.first_air_date ? item.first_air_date.substring(0, 4) : 'N/A')
              }</span>
              {mediaType === 'tv' && item.number_of_seasons && (
                <span className="seasons">{item.number_of_seasons} Season{item.number_of_seasons !== 1 ? 's' : ''}</span>
              )}
            </div>

            {/* Genre tags */}
            <div className="genre-tags">
              {genres.map((genre, index) => (
                <span key={genre.id} className="genre-tag">
                  {genre.name}{index < genres.length - 1 ? ' • ' : ''}
                </span>
              ))}
            </div>

            {/* Overview/description section removed as requested */}
          </div>
        </div>
      </div>

      {/* Basic info visible without hover */}
      <div className="media-info">
        <h3>{mediaType === 'movie' ? item.title : item.name}</h3>
        {item.vote_average > 0 && (
          <div className="rating">⭐ {item.vote_average.toFixed(1)}</div>
        )}
      </div>
    </div>
  );
};

const MediaGrid = ({ items, type, onMediaClick }) => (
  <div className="media-grid">
    {items.length > 0 ? (
      items.map(item => (
        <MediaItem key={item.id} item={item} type={type} onClick={onMediaClick} />
      ))
    ) : (
      <p className="no-results-message">No results found. Try adjusting your search criteria.</p>
    )}
  </div>
);

// --- Pagination Component (Updated Logic) ---
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  const maxPageButtons = 5; // Max number buttons shown (e.g., 1 ... 4 5 6 ... 10)

  // Always show Previous button
  pageNumbers.push({ type: 'prev', number: currentPage - 1, disabled: currentPage === 1 });

  if (totalPages <= maxPageButtons) {
    // Show all page numbers if total pages are few
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push({ type: 'page', number: i });
    }
  } else {
    // Logic for many pages with ellipses
    const leftEllipsisThreshold = 3; // Show ellipsis if current page is > 3
    const rightEllipsisThreshold = totalPages - 2; // Show ellipsis if current page is < Total - 2

    // Always show page 1
    pageNumbers.push({ type: 'page', number: 1 });

    // Show left ellipsis if needed
    if (currentPage > leftEllipsisThreshold + 1) { // Ellipsis needed if current page is 5 or more
      pageNumbers.push({ type: 'ellipsis' });
    }

    // Determine middle page numbers
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);

    // Adjust range if near the beginning
    if (currentPage <= leftEllipsisThreshold) {
      startPage = 2;
      endPage = Math.min(maxPageButtons - 1, totalPages - 1); // e.g. show 2, 3, 4
    }
    // Adjust range if near the end
    else if (currentPage >= rightEllipsisThreshold) {
      startPage = Math.max(2, totalPages - (maxPageButtons - 2)); // e.g. show 110, 111
      endPage = totalPages - 1;
    }

    // Add the middle page numbers
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push({ type: 'page', number: i });
    }

    // Show right ellipsis if needed
    if (currentPage < rightEllipsisThreshold - 1) { // Ellipsis needed if current page is less than 110
      pageNumbers.push({ type: 'ellipsis' });
    }

    // Always show last page
    pageNumbers.push({ type: 'page', number: totalPages });
  }

  // Always show Next button
  pageNumbers.push({ type: 'next', number: currentPage + 1, disabled: currentPage === totalPages });

  return (
    <nav className="pagination-nav">
      <ul className="pagination">
        {pageNumbers.map((item, index) => (
          <li key={index} className={`page-item ${item.number === currentPage && item.type === 'page' ? 'active' : ''} ${item.disabled ? 'disabled' : ''} ${item.type === 'ellipsis' ? 'ellipsis disabled' : ''}`}>
            {item.type === 'prev' && (
              <button className="page-link" onClick={() => onPageChange(item.number)} disabled={item.disabled}>
                &laquo; Prev
              </button>
            )}
            {item.type === 'next' && (
              <button className="page-link" onClick={() => onPageChange(item.number)} disabled={item.disabled}>
                Next &raquo;
              </button>
            )}
            {item.type === 'ellipsis' && (
              <span className="page-link">...</span>
            )}
            {item.type === 'page' && (
              <button className="page-link" onClick={() => onPageChange(item.number)}>
                {item.number}
              </button>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

// --- Component Functions (moved outside App function) ---
const MediaCarousel = ({ title, mediaList, currentTheme }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (current) {
      const scrollAmount = direction === 'left' ? -current.offsetWidth * 0.75 : current.offsetWidth * 0.75;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className={`media-row theme-${currentTheme}-row`}>
      <h2 className="row-title">{title}</h2>
      <div className="carousel-navigation">
        <button className="nav-button left" onClick={() => scroll('left')}>‹</button>
        <div className="carousel-container" ref={scrollRef}>
          {mediaList && mediaList.map(item => (
            <div className="media-card" key={item.id}>
              <div className="poster-wrapper">
                <img
                  src={item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : 'no-poster.jpg'}
                  alt={item.title || item.name || 'Media'}
                  className="poster-image"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'no-poster.jpg' }}
                />
                <div className="hover-overlay">
                  <h3>{item.title || item.name || 'Unknown Title'}</h3>
                  <button className="quick-play">▶</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="nav-button right" onClick={() => scroll('right')}>›</button>
      </div>
    </div>
  );
};

const MediaCard = ({ item, currentTheme }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);

  useEffect(() => {
    if (isHovered && item && item.id) {
      // Fetch trailer for preview
      getVideos(item.media_type || 'movie', item.id)
        .then(videos => {
          if (videos && Array.isArray(videos)) {
            const trailer = videos.find(v => v && v.type === 'Trailer' && v.site === 'YouTube');
            if (trailer && trailer.key) setTrailerKey(trailer.key);
          }
        })
        .catch(err => console.error('Error fetching preview:', err));
    }
  }, [isHovered, item]);

  return (
    <div
      className={`media-card theme-${currentTheme}-card`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && trailerKey ? (
        <div className="video-preview">
          <iframe
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerKey}`}
            frameBorder="0"
            allow="autoplay; encrypted-media"
          ></iframe>
        </div>
      ) : (
        <img
          src={item && item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : 'no-poster.jpg'}
          alt={(item && (item.title || item.name)) || 'Media'}
          onError={(e) => { e.target.onerror = null; e.target.src = 'no-poster.jpg' }}
        />
      )}
      <div className="info-overlay">
        <h3>{item && (item.title || item.name || 'Unknown Title')}</h3>
        <div className="actions">
          <button><span>▶</span></button>
          <button><span>+</span></button>
        </div>
      </div>
    </div>
  );
};

const NavBar = ({ currentTheme, setCurrentTheme }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar theme-${currentTheme}-navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-left">
        {/* All navigation elements removed */}
      </div>
      <div className="nav-right">
        {/* Search icon and theme selectors removed */}
      </div>
    </nav>
  );
};

function App() {
  // Add routing hooks
  const navigate = useNavigate();
  const location = useLocation();
  const { navigateToMedia, navigateToPerson, navigateToHome } = useUrlState();

  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingTV, setTrendingTV] = useState([]);
  const [topMovies, setTopMovies] = useState([]);
  const [topTV, setTopTV] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('movie');
  const [instantResults, setInstantResults] = useState([]);
  const [showInstantResults, setShowInstantResults] = useState(false);
  const [isInstantLoading, setIsInstantLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [languages, setLanguages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedMediaType, setSelectedMediaType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [movieGenres, setMovieGenres] = useState([]);
  const [tvGenres, setTvGenres] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ genres: [], rating: '', languages: [] });
  const [isFilteredSearch, setIsFilteredSearch] = useState(false);
  const [genreSearch, setGenreSearch] = useState('');
  const [languageSearch, setLanguageSearch] = useState('');
  const [filterCurrentPage, setFilterCurrentPage] = useState(1);
  const [filterTotalPages, setFilterTotalPages] = useState(1);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const VITE_API_KEY = "9a5a0e6e93d4b73e87566b319e8cfb95";
  const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

  const currentLanguage = filters.languages.length > 0 ? filters.languages[0] : '';

  // *** NEW/MODIFIED State for Tabs & Sorting ***
  const [sortOption, setSortOption] = useState('popularity.desc');
  const [activeFilterTab, setActiveFilterTab] = useState('movie');

  // CONSOLIDATED Filtered Results State (replaces old duplicate states)
  const [filteredResults, setFilteredResults] = useState({
    movie: { items: [], allItems: [], page: 1, totalPages: 1, totalResults: 0 },
    tv: { items: [], allItems: [], page: 1, totalPages: 1, totalResults: 0 }
  });

  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);

  // --- NEW: State for Active Section (Media vs Music) ---
  const [activeSection, setActiveSection] = useState('media');

  // Reference to the MusicHub component for accessing its methods
  const musicHubRef = useRef(null);

  // --- MusicHub navigation stack preservation state ---
  const [musicNavStackState, setMusicNavStackState] = useState(null);

  // NEW: User Preferences with localStorage
  const [userPreferences, setUserPreferences] = useLocalStorage('userPreferences', {
    theme: 'devil',
    language: 'en',
    useInfiniteScroll: true,
    autoplayTrailers: typeof window !== 'undefined' && window.innerWidth > 768,
    recentSearches: []
  });

  // Initialize currentTheme from cached preferences
  const [currentTheme, setCurrentTheme] = useState(userPreferences.theme || 'devil');

  // NEW: Mobile Detection
  const [isMobile, setIsMobile] = useState(false);

  // NEW: Touch Gestures State
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  const handleThemeChange = (themeName) => {
    setCurrentTheme(themeName);
    setUserPreferences(prev => ({ ...prev, theme: themeName }));
    console.log(`Global theme changed to: ${themeName} (cached to localStorage)`);
    setLanguageSearch('');
    setIsPersonModalOpen(false);
    setSelectedPerson(null);
    window.scrollTo(0, 0);
  };

  // Sync theme with preferences if they change externally
  useEffect(() => {
    if (userPreferences.theme && userPreferences.theme !== currentTheme) {
      setCurrentTheme(userPreferences.theme);
      console.log(`Theme synced from cache: ${userPreferences.theme}`);
    }
  }, [userPreferences.theme]);

  // Mobile Detection Effect
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [
        trendMovies,
        trendTV,
        topRatedMovies,
        topRatedTV,
        langData,
        movGenres,
        tvGen
      ] = await Promise.all([
        getTrendingMovies(),
        getTrendingTVShows(),
        getTopRatedMovies(),
        getTopRatedTVShows(),
        getLanguages(),
        getMovieGenres(),
        getTVGenres()
      ]);
      setTrendingMovies(trendMovies || []);
      setTrendingTV(trendTV || []);
      setTopMovies(topRatedMovies || []);
      setTopTV(topRatedTV || []);
      setLanguages(langData || []);
      setMovieGenres(movGenres?.genres || []);
      setTvGenres(tvGen?.genres || []);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  // Touch Gesture Handlers
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isFilteredSearch) {
      if (isLeftSwipe && activeFilterTab === 'movie') {
        setActiveFilterTab('tv');
      }
      if (isRightSwipe && activeFilterTab === 'tv') {
        setActiveFilterTab('movie');
      }
    }
    
    if (isLeftSwipe && activeSection === 'media') {
      setActiveSection('music');
    }
    if (isRightSwipe && activeSection === 'music') {
      setActiveSection('media');
    }
  };

  // Keyboard Navigation
  useKeyboardNavigation({
    onEscape: () => {
      if (isPlayerModalOpen || isPersonModalOpen) {
        closeModal();
      } else if (showInstantResults) {
        setShowInstantResults(false);
        setSearchQuery('');
      } else if (showFilters) {
        setShowFilters(false);
      }
    },
    onEnter: () => {
      if (showInstantResults && instantResults.length > 0) {
        handleInstantResultClick(instantResults[0]);
      }
    }
  }, !isPlayerModalOpen && !isPersonModalOpen);

  // --- Debounced Function for Instant Search ---
  const debouncedQuery = useDebounce(searchQuery, 200);
  
  useEffect(() => {
    const fetchInstantResults = async (query, lang) => {
      if (!query || query.length < 3) {
        setInstantResults([]);
        setShowInstantResults(false);
        setIsInstantLoading(false);
        return;
      }

      console.log(`[DIRECT FETCH START] Fetching instant results for: "${query}"`);
      setIsInstantLoading(true);
      setShowInstantResults(true);

      // --- Direct TMDB API Call --- 
      const apiKey = VITE_API_KEY; // Use the key from Vite environment
      // ** IMPORTANT: Ensure VITE_API_KEY is correctly set in your .env file! **
      if (!apiKey) {
        console.error("[CONFIG ERROR] TMDB API Key (VITE_API_KEY) is missing!");
        setInstantResults([]);
        setIsInstantLoading(false);
        setShowInstantResults(true); // Keep dropdown open to show potential error
        return;
      }

      const searchUrl = `${TMDB_BASE_URL}/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=${lang}&page=1&include_adult=false`;
      console.log("[DIRECT FETCH URL]:", searchUrl);

      try {
        const response = await fetch(searchUrl);
        console.log('[DIRECT FETCH RESPONSE STATUS]:', response.status, response.statusText);

        if (!response.ok) {
          // Log the response body if available for error details
          let errorBody = 'Could not read error body';
          try {
            errorBody = await response.text();
            console.error('[DIRECT FETCH ERROR BODY]:', errorBody);
          } catch (e) { /* Ignore error reading body */ }
          throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
        }

        const resultsData = await response.json();
        console.log('[DIRECT FETCH RESPONSE JSON]:', resultsData);

        // --- Processing (same as before, now using direct fetch results) --- 
        const rawResultsArray = resultsData?.results;
        console.log('[DIRECT FETCH] resultsData.results:', rawResultsArray);

        if (!Array.isArray(rawResultsArray)) {
          console.error("[DATA ERROR] Direct fetch did not return a results array.");
          setInstantResults([]);
          setIsInstantLoading(false);
          return; // Exit processing
        }

        const allResults = rawResultsArray.filter(item => {
          return item.media_type === 'movie' || item.media_type === 'tv' || item.media_type === 'person';
        });
        console.log('[DIRECT FILTERED RESULTS]:', allResults);

        const limitedResults = allResults.slice(0, 15);
        console.log('[DIRECT LIMITED RESULTS]:', limitedResults);

        setInstantResults(limitedResults);

      } catch (error) {
        console.error("[DIRECT FETCH ERROR]:", error);
        setInstantResults([]);
      } finally {
        console.log('[DIRECT FETCH END] Setting isLoading to false.');
        setIsInstantLoading(false);
      }
    };

    if (debouncedQuery && debouncedQuery.length >= 3) {
      fetchInstantResults(debouncedQuery, currentLanguage);
    } else {
      setInstantResults([]);
      setShowInstantResults(false);
      setIsInstantLoading(false);
    }
  }, [debouncedQuery, currentLanguage, VITE_API_KEY]);

  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length >= 3) {
      fetchInstantResults(query, currentLanguage);
    } else {
      setInstantResults([]);
      setShowInstantResults(false);
      setIsInstantLoading(false);
      fetchInstantResults.cancel?.();
    }
  };

  const handleSearchFocus = () => {
    if (searchQuery.length >= 3 && instantResults.length > 0) {
      setShowInstantResults(true);
    }
    setSearchFocused(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      setShowInstantResults(false);
      setSearchFocused(false);
    }, 150);
  };

  const handleFilterChange = (e) => {
    const { name, value, options, type } = e.target;

    if (name === 'genreSearch') {
      setGenreSearch(value);
      return;
    }
    if (name === 'languageSearch') {
      setLanguageSearch(value);
      return;
    }

    if (name === 'genres' || name === 'languages') {
      const selectedValues = Array.from(options)
        .filter(option => option.selected)
        .map(option => option.value);
      setFilters(prev => ({ ...prev, [name]: selectedValues }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  const removeGenreFilter = (genreIdToRemove) => {
    setFilters(prev => ({
      ...prev,
      genres: prev.genres.filter(id => id !== genreIdToRemove.toString())
    }));
  };

  // *** MODIFIED: Fetch Filtered Results on Page Change (for pagination mode only) ***
  useEffect(() => {
    // Skip if using infinite scroll mode
    if (userPreferences.useInfiniteScroll) return;
    
    const mediaType = activeFilterTab;
    const currentPage = filteredResults[mediaType].page;
    
    if (!isFilteredSearch || currentPage === 0 || currentPage === 1) return;

    const fetchFilteredPage = async () => {
      console.log(`[useEffect Filtered Fetch] Starting fetch for ${mediaType} page ${currentPage}...`);
      setIsFilterLoading(true);
      
      try {
        const selectedGenreIds = filters.genres || [];
        let apiGenres = [];
        
        if (mediaType === 'movie') {
          const validMovieGenreIds = movieGenres.map(g => g.id.toString());
          apiGenres = selectedGenreIds.filter(id => validMovieGenreIds.includes(id));
        } else {
          const validTvGenreIds = tvGenres.map(g => g.id.toString());
          apiGenres = selectedGenreIds.filter(id => validTvGenreIds.includes(id));
        }
        
        const apiFilters = { ...filters, genres: apiGenres };
        const resultsData = await discoverMedia(mediaType, apiFilters, currentPage, sortOption);
        const results = resultsData?.results || [];
        
        setFilteredResults(prev => ({
          ...prev,
          [mediaType]: {
            ...prev[mediaType],
            items: results,
            totalPages: resultsData?.total_pages || 1,
            totalResults: resultsData?.total_results || 0
          }
        }));
      } catch (error) {
        console.error(`[useEffect Filtered Fetch] Failed to fetch ${mediaType} results:`, error);
        setFilteredResults(prev => ({
          ...prev,
          [mediaType]: { ...prev[mediaType], items: [] }
        }));
      } finally {
        setIsFilterLoading(false);
        window.scrollTo(0, 0);
      }
    };

    fetchFilteredPage();
  }, [isFilteredSearch, activeFilterTab, filteredResults.movie.page, filteredResults.tv.page, filters, sortOption, movieGenres, tvGenres, userPreferences.useInfiniteScroll]);

  // *** MODIFIED: Apply Filters Handler ***
  const handleApplyFilters = async (e) => {
    e.preventDefault();
    console.log("Applying filters:", filters, "Sort by:", sortOption);
    setIsFilterLoading(true);
    setSearchQuery('');
    setInstantResults([]);
    setShowInstantResults(false);
    setActiveFilterTab('movie');

    try {
      // *** Filter genres for each API call ***
      const selectedGenreIds = filters.genres || [];

      const validMovieGenreIds = movieGenres.map(g => g.id.toString());
      const movieSpecificGenres = selectedGenreIds.filter(id => validMovieGenreIds.includes(id));
      const movieApiFilters = { ...filters, genres: movieSpecificGenres };
      console.log("Movie API Filters:", movieApiFilters);

      const validTvGenreIds = tvGenres.map(g => g.id.toString());
      const tvSpecificGenres = selectedGenreIds.filter(id => validTvGenreIds.includes(id));
      const tvApiFilters = { ...filters, genres: tvSpecificGenres };
      console.log("TV API Filters:", tvApiFilters);
      // ****************************************

      // Fetch both movie and TV results for page 1 simultaneously
      const [movieData, tvData] = await Promise.all([
        discoverMedia('movie', movieApiFilters, 1, sortOption), // Use movie specific filters
        discoverMedia('tv', tvApiFilters, 1, sortOption)      // Use tv specific filters
      ]);

      console.log("Movie results page 1:", movieData);
      console.log("TV results page 1:", tvData);

      const movieResults = movieData?.results || [];
      const tvResults = tvData?.results || [];

      setFilteredResults({
        movie: {
          items: movieResults,
          allItems: movieResults,
          page: 1,
          totalPages: movieData?.total_pages || 1,
          totalResults: movieData?.total_results || 0
        },
        tv: {
          items: tvResults,
          allItems: tvResults,
          page: 1,
          totalPages: tvData?.total_pages || 1,
          totalResults: tvData?.total_results || 0
        }
      });

      setIsFilteredSearch(true);
      setShowFilters(false);
    } catch (error) {
      console.error("Failed to apply filters:", error);
      setFilteredResults({
        movie: { items: [], allItems: [], page: 1, totalPages: 1, totalResults: 0 },
        tv: { items: [], allItems: [], page: 1, totalPages: 1, totalResults: 0 }
      });
      setIsFilteredSearch(true);
    } finally {
      setIsFilterLoading(false);
    }
  };

  // *** MODIFIED: Clear Filters Handler ***
  const handleClearFilters = () => {
    setFilters({ genres: [], rating: '', languages: [] });
    setIsFilteredSearch(false);
    setShowFilters(false);
    setGenreSearch('');
    setLanguageSearch('');
    setIsFilterLoading(false);
    setSortOption('popularity.desc');
    setActiveFilterTab('movie');
    
    // Reset with new consolidated structure
    setFilteredResults({
      movie: { items: [], allItems: [], page: 1, totalPages: 1, totalResults: 0 },
      tv: { items: [], allItems: [], page: 1, totalPages: 1, totalResults: 0 }
    });
  };

  const handleMediaClick = (media, type) => {
    // Navigate to the media details page with ID in URL
    navigateToMedia(media, type);
  };

  const closeModal = () => {
    // Close both modals and clear related state
    setIsPlayerModalOpen(false);
    setIsPersonModalOpen(false);
    setSelectedMedia(null);
    setSelectedPerson(null);
    // Clear older state vars too, just in case
    setIsModalOpen(false);
    setSelectedMediaType(null);
    setShowTrailer(false);
  };

  const handleTitleClick = () => {
    setSearchQuery('');
    setInstantResults([]);
    setShowInstantResults(false);
    setIsInstantLoading(false);
    setFilteredResults([]);
    setIsFilteredSearch(false);
    setFilterCurrentPage(1);
    setFilterTotalPages(1);
    setFilters({ genres: [], rating: '', languages: [] });
    setGenreSearch('');
    setLanguageSearch('');
    setIsPersonModalOpen(false);
    setSelectedPerson(null);
    window.scrollTo(0, 0);
    // Also reset section to media when title is clicked
    setActiveSection('media');
    // Navigate to home
    navigateToHome();
  };

  const handleInstantResultClick = (item) => {
    console.log("Instant result selected:", item);
    
    // Save to recent searches
    const searchTerm = item.title || item.name;
    setUserPreferences(prev => {
      const recentSearches = [
        searchTerm,
        ...prev.recentSearches.filter(s => s !== searchTerm)
      ].slice(0, 5);
      
      return { ...prev, recentSearches };
    });
    
    // Clear search and hide dropdown immediately
    setSearchQuery('');
    setInstantResults([]);
    setShowInstantResults(false);
    setIsInstantLoading(false);

    if (item && (item.media_type === 'movie' || item.media_type === 'tv')) {
      navigateToMedia(item, item.media_type);
    } else if (item && item.media_type === 'person') {
      navigateToPerson(item);
    } else {
      console.error("Selected item is missing or has unexpected media_type:", item);
    }
  };

  const getSectionTitle = (defaultTitle) => getThemedTitle(defaultTitle, currentTheme);

  // *** Person-related handlers ***
  const closePersonModal = () => {
    setIsPersonModalOpen(false);
    setSelectedPerson(null);
  };

  const handlePersonClick = (person) => {
    navigateToPerson(person);
  };

  const handleKnownItemClick = (item, mediaType) => {
    console.log("Clicked Known For Item:", item, mediaType);
    navigateToMedia(item, mediaType);
  };

  // Updated Filter Handlers
  const handleFilterInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleGenreSearchChange = (e) => {
    setGenreSearch(e.target.value);
  };

  const handleLanguageSearchChange = (e) => {
    setLanguageSearch(e.target.value);
  };

  const handleGenreToggle = (genreId) => {
    setFilters(prev => {
      const currentGenres = prev.genres || [];
      const stringId = genreId.toString();
      const newGenres = currentGenres.includes(stringId)
        ? currentGenres.filter(id => id !== stringId) // Remove if present
        : [...currentGenres, stringId]; // Add if not present
      return { ...prev, genres: newGenres };
    });
  };

  const handleLanguageToggle = (langIsoCode) => {
    setFilters(prev => {
      const currentLanguages = prev.languages || [];
      const newLanguages = currentLanguages.includes(langIsoCode)
        ? currentLanguages.filter(code => code !== langIsoCode) // Remove
        : [...currentLanguages, langIsoCode]; // Add
      return { ...prev, languages: newLanguages };
    });
  };

  // *** MODIFIED: Filter Page Change Handler ***
  const handleFilterPageChange = (pageNumber) => {
    const mediaType = activeFilterTab;
    if (pageNumber > 0 && pageNumber <= filteredResults[mediaType].totalPages) {
      console.log(`[Pagination] Setting ${mediaType} page to: ${pageNumber}`);
      setFilteredResults(prev => ({
        ...prev,
        [mediaType]: { ...prev[mediaType], page: pageNumber }
      }));
    }
  };

  // NEW: Load More Results Handler for Infinite Scroll
  const handleLoadMoreResults = async (mediaType, page) => {
    console.log(`[handleLoadMoreResults] Called for ${mediaType}, page ${page}`);
    console.log(`[handleLoadMoreResults] Current state:`, filteredResults[mediaType]);
    
    if (page > filteredResults[mediaType].totalPages) {
      console.log(`[handleLoadMoreResults] Page ${page} exceeds total pages ${filteredResults[mediaType].totalPages}`);
      return;
    }
    
    setIsFilterLoading(true);
    
    try {
      const selectedGenreIds = filters.genres || [];
      let apiGenres = [];
      
      if (mediaType === 'movie') {
        const validMovieGenreIds = movieGenres.map(g => g.id.toString());
        apiGenres = selectedGenreIds.filter(id => validMovieGenreIds.includes(id));
      } else {
        const validTvGenreIds = tvGenres.map(g => g.id.toString());
        apiGenres = selectedGenreIds.filter(id => validTvGenreIds.includes(id));
      }
      
      const apiFilters = { ...filters, genres: apiGenres };
      console.log(`[handleLoadMoreResults] Fetching ${mediaType} page ${page} with filters:`, apiFilters);
      
      const resultsData = await discoverMedia(mediaType, apiFilters, page, sortOption);
      const newItems = resultsData?.results || [];
      
      console.log(`[handleLoadMoreResults] Received ${newItems.length} new items`);
      
      setFilteredResults(prev => ({
        ...prev,
        [mediaType]: {
          ...prev[mediaType],
          items: newItems,
          allItems: [...prev[mediaType].allItems, ...newItems],
          page: page,
          totalPages: resultsData?.total_pages || 1,
          totalResults: resultsData?.total_results || 0
        }
      }));
      
      console.log(`[handleLoadMoreResults] Updated state, now have ${filteredResults[mediaType].allItems.length + newItems.length} total items`);
    } catch (error) {
      console.error(`[handleLoadMoreResults] Failed to load more ${mediaType} results:`, error);
    } finally {
      setIsFilterLoading(false);
    }
  };

  // *** NEW: Filter Tab Change Handler *** - RENAME? This is for filter results (Movies/TV)
  // Let's keep the name handleTabChange for now, but note its purpose
  const handleTabChange = (tab) => {
    setActiveFilterTab(tab);
    // Reset the page number of the *other* tab when switching?
    // Or just let the useEffect fetch the current page of the selected tab
  };

  // *** MODIFIED: Sort Option Handler ***
  const handleSortChange = (e) => {
    const newSortOption = e.target.value;
    console.log(`[Sort Change] New sort option selected: ${newSortOption}`);
    setSortOption(newSortOption);

    // Reset the current page of the ACTIVE tab to 1 to trigger re-fetch
    setFilteredResults(prev => ({
      ...prev,
      [activeFilterTab]: {
        ...prev[activeFilterTab],
        page: 1,
        items: [],
        allItems: []
      }
    }));
    setIsFilterLoading(true);
  };

  // --- Filtering Logic for Genre/Language Lists (Memoized) --- 
  const displayedGenres = useMemo(() => {
    return (activeFilterTab === 'movie' ? movieGenres : tvGenres)
      .filter(genre => genre.name.toLowerCase().includes(genreSearch.toLowerCase()));
  }, [activeFilterTab, movieGenres, tvGenres, genreSearch]);

  const displayedLanguages = useMemo(() => {
    return languages
      .sort((a, b) => {
        if (a.iso_639_1 === 'en') return -1;
        if (b.iso_639_1 === 'en') return 1;
        if (a.iso_639_1 === 'hi') return -1;
        if (b.iso_639_1 === 'hi') return 1;
        return a.english_name.localeCompare(b.english_name);
      })
      .filter(lang =>
        lang.english_name.toLowerCase().includes(languageSearch.toLowerCase()) ||
        (lang.name && lang.name.toLowerCase().includes(languageSearch.toLowerCase()))
      );
  }, [languages, languageSearch]);

  // Add these handlers to the App component
  const handleRatingIncrement = () => {
    const currentRating = parseFloat(filters.rating) || 0;
    if (currentRating < 10) {
      const newRating = Math.min(10, Math.round((currentRating + 0.1) * 10) / 10);
      setFilters(prev => ({ ...prev, rating: newRating.toString() }));
    }
  };

  const handleRatingDecrement = () => {
    const currentRating = parseFloat(filters.rating) || 0;
    if (currentRating > 0) {
      const newRating = Math.max(0, Math.round((currentRating - 0.1) * 10) / 10);
      setFilters(prev => ({ ...prev, rating: newRating.toString() }));
    }
  };

  // --- NEW: Handler for Section Change ---
  const handleSectionChange = (section) => {
    setActiveSection(section);
    // Optional: Reset states when switching sections if needed
    // e.g., clear search, filters, close modals etc.
    setSearchQuery('');
    setInstantResults([]);
    setShowInstantResults(false);
    setIsFilteredSearch(false);
    closeModal(); // Close any open media/person modals
  };

  return (
    <div className={`App theme-${currentTheme}`}>
      <Suspense fallback={<div className="loading-text">Loading Header...</div>}>
        <Header
          onTitleClick={handleTitleClick}
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
        />
      </Suspense>

      {/* --- NEW: Section Navigation Slider --- */}
      {!isPlayerModalOpen && !isPersonModalOpen && ( // Only show navigator when no modal is open
        <div className="section-navigator-container"> {/* Optional container for spacing */}
          <div className="sliding-tabs-container">
            <div className="sliding-tabs">
              <div
                className="tab-indicator"
                style={{
                  left: activeSection === 'media' ? '2px' : 'calc(50% - 2px)',
                  width: 'calc(50% - 4px)'
                }}
              ></div>
              <button
                className={`tab-button ${activeSection === 'media' ? 'active' : ''}`}
                onClick={() => handleSectionChange('media')}
              >
                Media
              </button>
              <button
                className={`tab-button ${activeSection === 'music' ? 'active' : ''}`}
                onClick={() => handleSectionChange('music')}
              >
                Music
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Conditionally Render MEDIA Section --- */}
      {activeSection === 'media' && !isPlayerModalOpen && !isPersonModalOpen && (
        <>
          {/* Conditionally render the search section only when no modal is open */}
          {/* MODIFIED: Moved condition inside this block */}
          {/* {!isPlayerModalOpen && !isPersonModalOpen && ( */}
          <div className="search-section">
            {/* --- Container for Search Input and Filter Button --- */}
            <div className={`search-controls-container${searchFocused ? ' expanded' : ''}`}>
              {/* Instant Search Input Area */}
              <div className={`search-input-container${searchFocused ? ' expanded' : ''}`}>
                <input
                  type="text"
                  id="search-input"
                  placeholder="Search Movies, TV Shows, People..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  autoComplete="off"
                  aria-label="Search for movies, TV shows, or people"
                  role="searchbox"
                  aria-autocomplete="list"
                  aria-controls="instant-search-results"
                  aria-expanded={showInstantResults}
                />
                <VoiceSearch 
                  onResult={(transcript) => {
                    setSearchQuery(transcript);
                  }}
                  onError={(error) => console.error('Voice search error:', error)}
                  currentTheme={currentTheme}
                />
                {/* Recent Searches */}
                {searchQuery.length === 0 && 
                 userPreferences.recentSearches.length > 0 && 
                 searchFocused && (
                  <div className="recent-searches">
                    <h4>Recent Searches</h4>
                    <div className="recent-searches-list">
                      {userPreferences.recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => setSearchQuery(search)}
                          className="recent-search-item"
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" className="history-icon">
                            <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
                          </svg>
                          {search}
                        </button>
                      ))}
                      <button
                        className="clear-recent-searches"
                        onClick={() => setUserPreferences(prev => ({ ...prev, recentSearches: [] }))}
                      >
                        Clear History
                      </button>
                    </div>
                  </div>
                )}
                {/* Instant Search Results */}
                {showInstantResults && (
                  <Suspense fallback={<div className="loading-text instant-loading">Loading results...</div>}>
                    <InstantSearchResults
                      results={instantResults}
                      isLoading={isInstantLoading}
                      onSelectItem={handleInstantResultClick}
                      imageBaseUrl={IMAGE_BASE_URL}
                    />
                  </Suspense>
                )}
              </div>
              {/* InstantSearchResults is no longer a sibling */}

              {/* Filter Toggle Button */}
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`filter-toggle-button ${showFilters ? 'active' : ''}`}
                aria-label={showFilters ? 'Hide filters' : 'Show filters'}
                aria-pressed={showFilters}
                aria-controls="filter-form"
                title={showFilters ? 'Hide Filters' : 'Show Filters'}
              >
                <img src={filterIcon} alt="Filter" />
              </button>
            </div> {/* End search-controls-container */}

            {/* --- Updated Filter Form --- */}
            {showFilters && (
              <form onSubmit={handleApplyFilters} className="filter-form">
                <div className="filter-controls">
                  <div className="filter-group filter-group-scrollable">
                    <label htmlFor="genre-search">Genre(s):</label>
                    <input
                      type="text"
                      id="genre-search"
                      name="genreSearch"
                      placeholder="Search genres..."
                      value={genreSearch}
                      onChange={handleGenreSearchChange}
                      className="filter-search-input"
                    />
                    <ul className="clickable-filter-list genre-list">
                      {displayedGenres.map(genre => {
                        const isSelected = filters.genres.includes(genre.id.toString());
                        return (
                          <li key={genre.id}>
                            <button
                              type="button"
                              className={`filter-tag-button ${isSelected ? 'selected' : ''}`}
                              onClick={() => handleGenreToggle(genre.id)}
                            >
                              {genre.name}
                            </button>
                          </li>
                        );
                      })}
                      {displayedGenres.length === 0 && <li className="no-results-message">No matching genres</li>}
                    </ul>
                  </div>

                  <div className="filter-group">
                    <label htmlFor="rating">Min Rating (0-10):</label>
                    <div className="rating-input-container">
                      <input
                        type="number"
                        id="rating"
                        name="rating"
                        min="0"
                        max="10"
                        step="0.1"
                        value={filters.rating}
                        onChange={handleFilterInputChange}
                        className="rating-number-input"
                      />
                      <div className="rating-arrows">
                        <button
                          type="button"
                          className="rating-arrow up"
                          onClick={handleRatingIncrement}
                          aria-label="Increase rating by 0.1"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          className="rating-arrow down"
                          onClick={handleRatingDecrement}
                          aria-label="Decrease rating by 0.1"
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="filter-group filter-group-scrollable">
                    <label htmlFor="language-search">Language(s):</label>
                    <input
                      type="text"
                      id="language-search"
                      name="languageSearch"
                      placeholder="Search languages..."
                      value={languageSearch}
                      onChange={handleLanguageSearchChange}
                      className="filter-search-input"
                    />
                    <ul className="clickable-filter-list language-list">
                      {displayedLanguages.map(lang => {
                        const isSelected = filters.languages.includes(lang.iso_639_1);
                        return (
                          <li key={lang.iso_639_1}>
                            <button
                              type="button"
                              className={`filter-tag-button ${isSelected ? 'selected' : ''}`}
                              onClick={() => handleLanguageToggle(lang.iso_639_1)}
                            >
                              {lang.english_name}
                            </button>
                          </li>
                        );
                      })}
                      {displayedLanguages.length === 0 && <li className="no-results-message">No matching languages</li>}
                    </ul>
                  </div>
                </div>
                <div className="filter-actions">
                  <button type="submit" className="apply-filters-button">Apply Filters</button>
                  <button type="button" onClick={handleClearFilters} className="clear-filters-button">Clear Filters</button>
                </div>
              </form>
            )}

            {/* Loading Indicator */}
            {isFilterLoading && <MediaGridSkeleton count={8} />}

            {/* Filtered Results Area */}
            {!isFilterLoading && isFilteredSearch && (
              <div id="filtered-results" className="discovery-results-container">
                <div className="filtered-header">
                  <h2 className="section-title">{getSectionTitle("Filtered Results")}</h2>

                  {/* Active Filter Tags */}
                  <div className="filter-active-indicators">
                    {filters.genres.length > 0 && (
                      <>
                        <span className="filter-tag-title">Genres:</span>
                        {filters.genres.map(genreId => {
                          const genre = (activeFilterTab === 'movie' ? movieGenres : tvGenres)
                            .find(g => g.id.toString() === genreId);
                          return genre && (
                            <div className="filter-tag" key={`genre-${genreId}`}>
                              {genre.name}
                              <button
                                className="remove-tag"
                                onClick={() => removeGenreFilter(genreId)}
                                aria-label={`Remove ${genre.name} filter`}
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </>
                    )}

                    {filters.rating && (
                      <div className="filter-tag">
                        <span className="filter-tag-title">Min Rating:</span>
                        {filters.rating}
                        <button
                          className="remove-tag"
                          onClick={() => setFilters(prev => ({ ...prev, rating: '' }))}
                          aria-label="Remove rating filter"
                        >
                          ×
                        </button>
                      </div>
                    )}

                    {filters.languages.length > 0 && (
                      <>
                        <span className="filter-tag-title">Languages:</span>
                        {filters.languages.map(langCode => {
                          const language = languages.find(l => l.iso_639_1 === langCode);
                          return language && (
                            <div className="filter-tag" key={`lang-${langCode}`}>
                              {language.english_name}
                              <button
                                className="remove-tag"
                                onClick={() => setFilters(prev => ({
                                  ...prev,
                                  languages: prev.languages.filter(code => code !== langCode)
                                }))}
                                aria-label={`Remove ${language.english_name} filter`}
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                </div>

                {/* Controls Bar with Sorting and Tabs */}
                <div className="controls-bar">
                  {/* Sort Dropdown */}
                  <div className="sort-control">
                    <label htmlFor="sort-by">Sort By:</label>
                    <select
                      id="sort-by"
                      name="sortOption"
                      value={sortOption}
                      onChange={handleSortChange}
                      className="sort-select"
                    >
                      <option value="popularity.desc">Popularity</option>
                      <option value="vote_average.desc">Rating</option>
                      <option value="release_date.desc">Latest</option>
                    </select>
                  </div>

                  {/* Tab Navigation */}
                  <div className="sliding-tabs-container">
                    <div 
                      className="sliding-tabs"
                      onTouchStart={onTouchStart}
                      onTouchMove={onTouchMove}
                      onTouchEnd={onTouchEnd}
                    >
                      <div
                        className="tab-indicator"
                        style={{
                          left: activeFilterTab === 'movie' ? '2px' : 'calc(50% - 2px)',
                          width: 'calc(50% - 4px)'
                        }}
                      ></div>
                      <button
                        className={`tab-button ${activeFilterTab === 'movie' ? 'active' : ''}`}
                        onClick={() => handleTabChange('movie')}
                      >
                        Movies
                      </button>
                      <button
                        className={`tab-button ${activeFilterTab === 'tv' ? 'active' : ''}`}
                        onClick={() => handleTabChange('tv')}
                      >
                        TV Shows
                      </button>
                    </div>
                  </div>
                </div> {/* End controls-bar */}

                {/* Content based on active tab */}
                <div className="tab-content">
                  {activeFilterTab === 'movie' && (
                    <>
                      {userPreferences.useInfiniteScroll ? (
                        <InfiniteScrollGrid
                          items={filteredResults.movie.allItems}
                          type="movie"
                          onMediaClick={handleMediaClick}
                          hasMore={filteredResults.movie.page < filteredResults.movie.totalPages}
                          loadMore={(page) => handleLoadMoreResults('movie', page)}
                          currentPage={filteredResults.movie.page}
                          totalPages={filteredResults.movie.totalPages}
                          totalResults={filteredResults.movie.totalResults}
                          MediaItemComponent={MediaItem}
                          useInfiniteScroll={true}
                        />
                      ) : (
                        <>
                          <MediaGrid
                            items={filteredResults.movie.items}
                            type="movie"
                            onMediaClick={handleMediaClick}
                          />
                          {filteredResults.movie.items.length > 0 && (
                            <>
                              <Pagination
                                currentPage={filteredResults.movie.page}
                                totalPages={filteredResults.movie.totalPages}
                                onPageChange={handleFilterPageChange}
                              />
                              <JumpToPage
                                currentPage={filteredResults.movie.page}
                                totalPages={filteredResults.movie.totalPages}
                                onPageChange={handleFilterPageChange}
                                currentTheme={currentTheme}
                              />
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}
                  {activeFilterTab === 'tv' && (
                    <>
                      {userPreferences.useInfiniteScroll ? (
                        <InfiniteScrollGrid
                          items={filteredResults.tv.allItems}
                          type="tv"
                          onMediaClick={handleMediaClick}
                          hasMore={filteredResults.tv.page < filteredResults.tv.totalPages}
                          loadMore={(page) => handleLoadMoreResults('tv', page)}
                          currentPage={filteredResults.tv.page}
                          totalPages={filteredResults.tv.totalPages}
                          totalResults={filteredResults.tv.totalResults}
                          MediaItemComponent={MediaItem}
                          useInfiniteScroll={true}
                        />
                      ) : (
                        <>
                          <MediaGrid
                            items={filteredResults.tv.items}
                            type="tv"
                            onMediaClick={handleMediaClick}
                          />
                          {filteredResults.tv.items.length > 0 && (
                            <>
                              <Pagination
                                currentPage={filteredResults.tv.page}
                                totalPages={filteredResults.tv.totalPages}
                                onPageChange={handleFilterPageChange}
                              />
                              <JumpToPage
                                currentPage={filteredResults.tv.page}
                                totalPages={filteredResults.tv.totalPages}
                                onPageChange={handleFilterPageChange}
                                currentTheme={currentTheme}
                              />
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          {/* )} */} {/* End of original conditional rendering for search section */}
          {/* End of conditional rendering for search section */}

          {/* Default Media Grids (Trending/Top Rated) - Show only if NOT searching/filtering */}
          {!searchQuery && !isFilteredSearch && !isPlayerModalOpen && !isPersonModalOpen && (
            <>
              {isLoading ? (
                <>
                  <div id="trending-movies">
                    <h2 className="section-title">{getSectionTitle("Trending Movies")}</h2>
                    <MediaGridSkeleton count={20} />
                  </div>
                  <div id="trending-tv">
                    <h2 className="section-title">{getSectionTitle("Trending TV Shows")}</h2>
                    <MediaGridSkeleton count={20} />
                  </div>
                </>
              ) : (
                <>
                  <div id="trending-movies">
                    <h2 className="section-title">{getSectionTitle("Trending Movies")}</h2>
                    <MediaGrid items={trendingMovies} type="movie" onMediaClick={handleMediaClick} />
                  </div>

                  <div id="trending-tv">
                    <h2 className="section-title">{getSectionTitle("Trending TV Shows")}</h2>
                    <MediaGrid items={trendingTV} type="tv" onMediaClick={handleMediaClick} />
                  </div>

                  <div id="top-movies">
                    <h2 className="section-title">{getSectionTitle("Top Rated Movies")}</h2>
                    <MediaGrid items={topMovies} type="movie" onMediaClick={handleMediaClick} />
                  </div>

                  <div id="top-tv">
                    <h2 className="section-title">{getSectionTitle("Top Rated TV Shows")}</h2>
                    <MediaGrid items={topTV} type="tv" onMediaClick={handleMediaClick} />
                  </div>
                </>
              )}
            </>
          )}
        </>
      )} {/* End of activeSection === 'media' */}

      {/* --- Conditionally Render MUSIC Section (Placeholder) --- */}
      {activeSection === 'music' && !isPlayerModalOpen && !isPersonModalOpen && (
        <Suspense fallback={<div className="loading-text">Loading Music Hub...</div>}>
          <MusicHub
            currentTheme={currentTheme}
            ref={musicHubRef}
            navStackState={musicNavStackState}
            setNavStackState={setMusicNavStackState}
          />
        </Suspense>
      )}

      {/* Player Modal (Conditional) - Stays outside section logic */}
      {isPlayerModalOpen && selectedMedia && (
        <Suspense fallback={<div className="loading-text">Loading Player...</div>}>
          <PlayerModal
            media={selectedMedia.media}
            type={selectedMedia.type}
            onClose={closeModal}
            currentTheme={currentTheme}
          />
        </Suspense>
      )}

      {/* *** NEW: Person Details Modal (Conditional) *** - Stays outside section logic */}
      {isPersonModalOpen && selectedPerson && (
        <Suspense fallback={<div className="loading-text">Loading Details...</div>}>
          <PersonDetailsModal
            person={selectedPerson}
            imageBaseUrl={IMAGE_BASE_URL}
            onClose={closePersonModal}
            currentTheme={currentTheme}
            onKnownForItemClick={handleKnownItemClick}
          // If ArtistDetailsModal is triggered from here, wrap it too
          />
        </Suspense>
      )}

      {/* NavBar might not need lazy loading as it's small */}
      <NavBar currentTheme={currentTheme} setCurrentTheme={setCurrentTheme} />

      {/* Screen Reader Live Region */}
      <div 
        className="sr-only" 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {isFilterLoading && "Loading filtered results"}
        {filteredResults.movie.totalResults > 0 && 
          `Found ${filteredResults.movie.totalResults} movie results`}
        {filteredResults.tv.totalResults > 0 && 
          `Found ${filteredResults.tv.totalResults} TV show results`}
      </div>

    </div>
  );
}

export default App;
