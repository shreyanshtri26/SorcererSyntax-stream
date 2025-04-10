import React, { useState, useEffect } from 'react';
import {
  getTrendingMovies,
  getTrendingTVShows,
  getTopRatedMovies,
  getTopRatedTVShows,
  searchMovies,
  searchTVShows,
  getLanguages,
  getMovieGenres,
  getTVGenres,
  discoverMedia,
  IMAGE_BASE_URL
} from './api';
import PlayerModal from './PlayerModal';
import './App.css';
import filterIcon from '@assets/filter-icon.svg';

const MediaItem = ({ item, type, onClick }) => {
  const handleTrailerClick = (e) => {
    e.stopPropagation();
    onClick(item, type, true);
  };
  
  return (
    <div className="media-item" onClick={() => onClick(item, type, false)}>
      <img
        src={item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : 'no-poster.jpg'}
        alt={type === 'movie' ? item.title : item.name}
        onError={(e) => { e.target.onerror = null; e.target.src='no-poster.jpg' }}
      />
      <button className="trailer-btn" onClick={handleTrailerClick}>Trailer</button>
      <div className="media-info">
        <h3>{type === 'movie' ? item.title : item.name}</h3>
        <p>{type === 'movie'
          ? (item.release_date ? item.release_date.substring(0, 4) : 'N/A')
          : (item.first_air_date ? item.first_air_date.substring(0, 4) : 'N/A')
        }</p>
        {item.vote_average > 0 && (
          <div className="rating">⭐ {item.vote_average.toFixed(1)}</div>
        )}
        {item.overview && (
          <p className="overview">{item.overview.substring(0, 100)}...</p>
        )}
      </div>
    </div>
  );
};

const MediaGrid = ({ items, type, onMediaClick }) => (
  <div className="media-grid">
    {items && items.length > 0 ? (
      items.map(item => <MediaItem key={item.id} item={item} type={type} onClick={onMediaClick} />)
    ) : (
      <p>No {type === 'movie' ? 'movies' : 'TV shows'} found.</p>
    )}
  </div>
);

function App() {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingTV, setTrendingTV] = useState([]);
  const [topMovies, setTopMovies] = useState([]);
  const [topTV, setTopTV] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('movie'); // 'movie' or 'tv'
  const [languages, setLanguages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedMediaType, setSelectedMediaType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBWMode, setIsBWMode] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [movieGenres, setMovieGenres] = useState([]);
  const [tvGenres, setTvGenres] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    genres: [],
    rating: '',
    language: '',
  });
  const [filteredResults, setFilteredResults] = useState([]);
  const [isFilteredSearch, setIsFilteredSearch] = useState(false);

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

  const handleSearch = async (e) => {
    e.preventDefault();
    // Clear filters when doing a standard search
    setFilters({ genres: [], rating: '', language: '' });
    setFilteredResults([]);
    setIsFilteredSearch(false);
    
    if (searchQuery.length < 3) {
        setSearchResults([]); // Clear results if query is too short
        return;
    }
    setIsLoading(true);
    let results;
    if (searchType === 'movie') {
        results = await searchMovies(searchQuery);
    } else {
        results = await searchTVShows(searchQuery);
    }
    setSearchResults(results || []);
    setIsLoading(false);
  };

  // --- Added Filter Handlers ---
  const handleFilterChange = (e) => {
    const { name, value, options } = e.target;
    if (name === 'genres') {
      // Handle multi-select for genres
      const selectedGenres = Array.from(options)
        .filter(option => option.selected)
        .map(option => option.value);
      setFilters(prev => ({ ...prev, genres: selectedGenres }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleApplyFilters = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSearchQuery(''); // Clear standard search query
    setSearchResults([]); // Clear standard search results
    const results = await discoverMedia(searchType, filters);
    setFilteredResults(results || []);
    setIsFilteredSearch(true); // Indicate that filters are active
    setShowFilters(false); // Optionally close filter popup after applying
    setIsLoading(false);
  };

  const handleClearFilters = () => {
    setFilters({ genres: [], rating: '', language: '' });
    setFilteredResults([]);
    setIsFilteredSearch(false);
    setShowFilters(false); // Hide filters
  };
  // --- End Filter Handlers ---

  const handleMediaClick = (media, type, trailer = false) => {
    setSelectedMedia(media);
    setSelectedMediaType(type);
    setShowTrailer(trailer);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMedia(null);
    setSelectedMediaType(null);
    setShowTrailer(false);
  };

  const toggleBWMode = () => {
    setIsBWMode(!isBWMode);
  };
  
  const handleTitleClick = () => {
    // Reset search and go to home page
    setSearchQuery('');
    setSearchResults([]);
    window.scrollTo(0, 0);
  };

  return (
    <div className={`App ${isBWMode ? 'bw-mode' : 'fire-devil-mode'}`}>
      <button 
        onClick={toggleBWMode} 
        className="bw-toggle-button" 
        aria-label={isBWMode ? 'Switch to Fire Devil Mode' : 'Switch to Black and White Mode'}
        title={isBWMode ? 'Switch to Fire Devil Mode' : 'Switch to Black and White Mode'}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
            <path d="M12 2A10 10 0 1 0 12 22A10 10 0 1 0 12 2zM12 4v16A8 8 0 0 1 12 4z"/>
        </svg>
      </button>

      <h1 className="main-title" onClick={handleTitleClick}>
        <span className="title-icon">⛧</span>
         Room no: 305
        <span className="title-icon">⛧</span>
      </h1>

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            id="search-input"
            placeholder={`Search for ${searchType}s...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="type-select">
            <option value="movie">Movies</option>
            <option value="tv">TV Shows</option>
          </select>
          <button type="submit" className="search-button">Search</button>
          {/* Filter Toggle Button - Now with Icon */}
          <button 
            type="button" 
            onClick={() => setShowFilters(!showFilters)} 
            className={`filter-toggle-button ${showFilters ? 'active' : ''}`}
            aria-label={showFilters ? 'Hide Filters' : 'Show Filters'}
            title={showFilters ? 'Hide Filters' : 'Show Filters'}
          >
            <img src={filterIcon} alt="Filter" />
          </button>
        </form>

        {/* Filter Controls Popup/Section */} 
        {showFilters && (
          <form onSubmit={handleApplyFilters} className="filter-form">
            <div className="filter-controls">
              {/* Genre Select (Multi-select) */}
              <div className="filter-group">
                  <label htmlFor="genres">Genre(s):</label>
                  <select 
                    id="genres"
                    name="genres" 
                    multiple 
                    value={filters.genres} 
                    onChange={handleFilterChange} 
                    size="5" // Show multiple options
                  >
                      {(searchType === 'movie' ? movieGenres : tvGenres).map(genre => (
                          <option key={genre.id} value={genre.id}>{genre.name}</option>
                      ))}
                  </select>
              </div>

              {/* Min Rating Input */}
              <div className="filter-group">
                <label htmlFor="rating">Min Rating (0-10):</label>
                <input
                  type="number"
                  id="rating"
                  name="rating"
                  min="0"
                  max="10"
                  step="0.1"
                  value={filters.rating}
                  onChange={handleFilterChange}
                />
              </div>

              {/* Language Select */}
              <div className="filter-group">
                <label htmlFor="language">Language:</label>
                <select
                  id="language"
                  name="language"
                  value={filters.language}
                  onChange={handleFilterChange}
                >
                  <option value="">Any Language</option>
                  {languages.map(lang => (
                    <option key={lang.iso_639_1} value={lang.iso_639_1}>
                      {lang.english_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="filter-actions">
              <button type="submit" className="apply-filters-button">Apply Filters</button>
              <button type="button" onClick={handleClearFilters} className="clear-filters-button">Clear Filters</button>
            </div>
          </form>
        )}

        {/* Display Loading */}
        {isLoading && <p className="loading-text">Loading results...</p>}
        
        {/* Display Filtered Results */}
        {!isLoading && isFilteredSearch && (
           <div id="filtered-results">
             <h2 className="section-title">Filtered Results</h2>
             {/* Add pagination controls here if needed later */}
             <MediaGrid items={filteredResults} type={searchType} onMediaClick={handleMediaClick} />
           </div>
        )}

        {/* Display Standard Search Results (only if not filtering) */}
        {!isLoading && !isFilteredSearch && searchQuery.length >= 3 && (
          <div id="search-results">
            <h2 className="section-title">Search Results: "{searchQuery}"</h2>
            <MediaGrid items={searchResults} type={searchType} onMediaClick={handleMediaClick} />
          </div>
        )}
      </div>

      {/* Show default sections only if NOT searching AND NOT filtering */} 
      {!searchQuery && !isFilteredSearch && (
        <>
          <div id="trending-movies">
            <h2 className="section-title">Trending Movies</h2>
            <MediaGrid items={trendingMovies} type="movie" onMediaClick={handleMediaClick} />
          </div>

          <div id="trending-tv">
            <h2 className="section-title">Trending TV Shows</h2>
            <MediaGrid items={trendingTV} type="tv" onMediaClick={handleMediaClick} />
          </div>

          <div id="top-movies">
            <h2 className="section-title">Top Rated Movies</h2>
            <MediaGrid items={topMovies} type="movie" onMediaClick={handleMediaClick} />
          </div>

          <div id="top-tv">
            <h2 className="section-title">Top Rated TV Shows</h2>
            <MediaGrid items={topTV} type="tv" onMediaClick={handleMediaClick} />
          </div>
        </>
      )}

      {isModalOpen && (
        <PlayerModal
          media={selectedMedia}
          type={selectedMediaType}
          onClose={closeModal}
          showTrailer={showTrailer}
          defaultSubtitleLanguage={filters.language}
        />
      )}
    </div>
  );
}

export default App;
