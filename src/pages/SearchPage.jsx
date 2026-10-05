import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    getLanguages,
    getMovieGenres,
    getTVGenres,
    discoverMedia,
    getTrendingMovies,
    getTrendingTVShows,
    TMDB_BASE_URL,
    IMAGE_BASE_URL
} from '../api/api';
import VoiceSearch from '../components/VoiceSearch';
import InfiniteScrollGrid from '../components/InfiniteScrollGrid';
import MediaGrid from '../components/MediaGrid';
import MediaItem from '../components/MediaItem';
import Pagination from '../components/Pagination';
import JumpToPage from '../components/JumpToPage';
import filterIcon from '../contexts/assets/filter-icon.svg';
import { MediaGridSkeleton } from '../components/SkeletonLoader';
import { useDebounce } from '../hooks/useDebounce';
import HomePage from './HomePage';
import SlidingTabs from '../components/common/SlidingTabs';

// Pre-mapped popular genres for both Movie and TV Show discovery
const QUICK_GENRES = [
    { label: 'Action', movieGenreId: 28, tvGenreId: 10759 },
    { label: 'Sci-Fi', movieGenreId: 878, tvGenreId: 10765 },
    { label: 'Comedy', movieGenreId: 35, tvGenreId: 35 },
    { label: 'Drama', movieGenreId: 18, tvGenreId: 18 },
    { label: 'Thriller', movieGenreId: 53, tvGenreId: 9648 },
    { label: 'Horror', movieGenreId: 27, tvGenreId: 9648 }
];

const SearchPage = ({
    currentTheme,
    userPreferences,
    onMediaClick,
    onPersonClick,
    getSectionTitle,
    VITE_API_KEY
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchPanel, setShowSearchPanel] = useState(false);
    const [movieGenres, setMovieGenres] = useState([]);
    const [tvGenres, setTvGenres] = useState([]);
    const [languages, setLanguages] = useState([]);
    const [filters, setFilters] = useState({ genres: [], rating: '7.0', languages: [] });
    const [isFilteredSearch, setIsFilteredSearch] = useState(false);
    const [genreSearch, setGenreSearch] = useState('');
    const [languageSearch, setLanguageSearch] = useState('');
    const [isFilterLoading, setIsFilterLoading] = useState(false);
    const [sortOption, setSortOption] = useState('popularity.desc');
    const [activeFilterTab, setActiveFilterTab] = useState('movie');
    const [isShowingTrending, setIsShowingTrending] = useState(false);
    const [filteredResults, setFilteredResults] = useState({
        movie: { items: [], allItems: [], page: 1, totalPages: 1, totalResults: 0 },
        tv: { items: [], allItems: [], page: 1, totalPages: 1, totalResults: 0 },
        people: { items: [], allItems: [], page: 1, totalPages: 1, totalResults: 0 }
    });

    const debouncedQuery = useDebounce(searchQuery, 800);
    const currentLanguage = filters.languages.length > 0 ? filters.languages[0] : '';

    useEffect(() => {
        const fetchMetadata = async () => {
            const [movGenres, tvGen, langData] = await Promise.all([
                getMovieGenres(),
                getTVGenres(),
                getLanguages()
            ]);
            setMovieGenres(movGenres?.genres || []);
            setTvGenres(tvGen?.genres || []);
            setLanguages(langData || []);
        };
        fetchMetadata();
    }, []);

    const performSearch = useCallback(async (queryOverride = null, filtersOverride = null) => {
        const query = queryOverride !== null ? queryOverride : searchQuery;
        const currentActiveFilters = filtersOverride !== null ? filtersOverride : filters;
        setIsFilterLoading(true);
        setFilteredResults(prev => ({
            movie: { ...prev.movie, items: [], page: 1 },
            tv: { ...prev.tv, items: [], page: 1 }
        }));
        setActiveFilterTab('movie');

        try {
            if (query && query.length >= 2) {
                const apiKey = VITE_API_KEY || "9a5a0e6e93d4b73e87566b319e8cfb95";
                const searchUrl = `${TMDB_BASE_URL}search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=${currentLanguage}&page=1&include_adult=false`;

                const response = await fetch(searchUrl);
                const data = await response.json();
                const results = data.results || [];

                const movies = results.filter(i => i.media_type === 'movie');
                const tvs = results.filter(i => i.media_type === 'tv');
                const people = results.filter(i => i.media_type === 'person');

                setFilteredResults({
                    movie: {
                        items: movies,
                        allItems: movies,
                        page: 1,
                        totalPages: data.total_pages || 1,
                        totalResults: movies.length
                    },
                    tv: {
                        items: tvs,
                        allItems: tvs,
                        page: 1,
                        totalPages: data.total_pages || 1,
                        totalResults: tvs.length
                    },
                    people: {
                        items: people,
                        allItems: people,
                        page: 1,
                        totalPages: data.total_pages || 1,
                        totalResults: people.length
                    }
                });
                setIsFilteredSearch(true);
            } else {
                const selectedGenreIds = currentActiveFilters.genres || [];
                const validMovieGenreIds = movieGenres.map(g => g.id.toString());
                const movieApiGenres = selectedGenreIds.filter(id => validMovieGenreIds.includes(id));
                const movieApiFilters = { ...currentActiveFilters, genres: movieApiGenres };

                const validTvGenreIds = tvGenres.map(g => g.id.toString());
                const tvApiGenres = selectedGenreIds.filter(id => validTvGenreIds.includes(id));
                const tvApiFilters = { ...currentActiveFilters, genres: tvApiGenres };

                const [movieData, tvData] = await Promise.all([
                    discoverMedia('movie', movieApiFilters, 1, sortOption),
                    discoverMedia('tv', tvApiFilters, 1, sortOption)
                ]);

                setFilteredResults({
                    movie: {
                        items: movieData?.results || [],
                        allItems: movieData?.results || [],
                        page: 1,
                        totalPages: movieData?.total_pages || 1,
                        totalResults: movieData?.total_results || 0
                    },
                    tv: {
                        items: tvData?.results || [],
                        allItems: tvData?.results || [],
                        page: 1,
                        totalPages: tvData?.total_pages || 1,
                        totalResults: tvData?.total_results || 0
                    },
                    people: { items: [], allItems: [], page: 1, totalPages: 1, totalResults: 0 }
                });
                setIsFilteredSearch(true);
            }
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsFilterLoading(false);
        }
    }, [searchQuery, filters, sortOption, currentLanguage, movieGenres, tvGenres, VITE_API_KEY]);

    useEffect(() => {
        if (!isShowingTrending && (isFilteredSearch || (debouncedQuery && debouncedQuery.length >= 2))) {
            performSearch(debouncedQuery);
        }
    }, [debouncedQuery, isShowingTrending]);

    const handleVoiceResult = (transcript) => {
        setSearchQuery(transcript);
        performSearch(transcript);
    };

    const handleTrendingClick = async (mediaType) => {
        console.log('handleTrendingClick called with:', mediaType);
        setSearchQuery('');
        setActiveFilterTab(mediaType); // Switch to the correct tab
        setIsShowingTrending(true); // Prevent automatic search
        setIsFilterLoading(true);
        
        // Clear current results
        setFilteredResults(prev => ({
            ...prev,
            [mediaType]: { items: [], allItems: [], page: 1, totalPages: 1, totalResults: 0 }
        }));

        try {
            console.log('Fetching trending for:', mediaType);
            const results = mediaType === 'movie' 
                ? await getTrendingMovies('week', 1)
                : await getTrendingTVShows('week', 1);
            
            console.log('Trending results:', results);

            if (results && results.results && results.results.length > 0) {
                const processedItems = results.results.map(item => ({
                    ...item,
                    media_type: mediaType
                }));

                console.log('Processed items:', processedItems.length, 'items');

                setFilteredResults(prev => ({
                    ...prev,
                    [mediaType]: {
                        items: processedItems,
                        allItems: processedItems,
                        page: 1,
                        totalPages: results.total_pages || 1,
                        totalResults: results.total_results || processedItems.length
                    }
                }));
            } else {
                console.log('No results found or invalid response');
                setFilteredResults(prev => ({
                    ...prev,
                    [mediaType]: { items: [], allItems: [], page: 1, totalPages: 1, totalResults: 0 }
                }));
            }
        } catch (error) {
            console.error('Error fetching trending content:', error);
            setFilteredResults(prev => ({
                ...prev,
                [mediaType]: { items: [], allItems: [], page: 1, totalPages: 1, totalResults: 0 }
            }));
        } finally {
            setIsFilterLoading(false);
        }
    };

    const handleGenreClick = (pill) => {
        // Clear text query so TMDB Discover runs by genre instead of keyword search
        setSearchQuery('');
        setIsShowingTrending(false);

        const movieGenreStr = pill.movieGenreId ? pill.movieGenreId.toString() : '';
        const tvGenreStr = pill.tvGenreId ? pill.tvGenreId.toString() : '';
        const targetIds = [movieGenreStr, tvGenreStr].filter(Boolean);

        // Check if currently selected
        const isAlreadySelected = targetIds.some(id => filters.genres.includes(id));

        let updatedGenres = [];
        if (isAlreadySelected) {
            // Deselect / toggle off
            updatedGenres = filters.genres.filter(id => !targetIds.includes(id));
        } else {
            // Select this genre
            updatedGenres = targetIds;
        }

        const newFilters = { ...filters, genres: updatedGenres };
        setFilters(newFilters);

        if (updatedGenres.length > 0) {
            setIsFilteredSearch(true);
            performSearch('', newFilters);
        } else {
            // If cleared, reset search to show home page trending feeds
            setIsFilteredSearch(false);
            setFilteredResults({
                movie: { items: [], allItems: [], page: 1, totalPages: 1, totalResults: 0 },
                tv: { items: [], allItems: [], page: 1, totalPages: 1, totalResults: 0 },
                people: { items: [], allItems: [], page: 1, totalPages: 1, totalResults: 0 }
            });
        }
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setIsShowingTrending(false); // Reset trending flag
        setFilters({ genres: [], rating: '7.0', languages: [] });
        setIsFilteredSearch(false);
        setShowSearchPanel(false);
        setFilteredResults({
            movie: { items: [], allItems: [], page: 1, totalPages: 1, totalResults: 0 },
            tv: { items: [], allItems: [], page: 1, totalPages: 1, totalResults: 0 },
            people: { items: [], allItems: [], page: 1, totalPages: 1, totalResults: 0 }
        });
    };

    const handleFilterPageChange = (pageNumber) => {
        const mediaType = activeFilterTab;
        if (pageNumber > 0 && pageNumber <= filteredResults[mediaType].totalPages) {
            setFilteredResults(prev => ({
                ...prev,
                [mediaType]: { ...prev[mediaType], page: pageNumber }
            }));
        }
    };

    const handleLoadMoreResults = async (mediaType, page) => {
        if (page > filteredResults[mediaType].totalPages) return;

        try {
            if (searchQuery && searchQuery.length >= 2) {
                const apiKey = VITE_API_KEY || "9a5a0e6e93d4b73e87566b319e8cfb95";
                const searchUrl = `${TMDB_BASE_URL}search/multi?api_key=${apiKey}&query=${encodeURIComponent(searchQuery)}&language=${currentLanguage}&page=${page}&include_adult=false`;
                const response = await fetch(searchUrl);
                const data = await response.json();
                const newResults = data.results || [];
                const typedNewResults = newResults.filter(i => i.media_type === mediaType);

                setFilteredResults(prev => {
                    const existingIds = new Set(prev[mediaType].allItems.map(i => i.id));
                    const uniqueNewItems = typedNewResults.filter(i => !existingIds.has(i.id));
                    return {
                        ...prev,
                        [mediaType]: {
                            ...prev[mediaType],
                            items: typedNewResults,
                            allItems: [...prev[mediaType].allItems, ...uniqueNewItems],
                            page: page,
                            totalPages: data.total_pages || 1,
                            totalResults: typedNewResults.length
                        }
                    };
                });
            } else {
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
                const resultsData = await discoverMedia(mediaType, apiFilters, page, sortOption);
                const newItems = resultsData?.results || [];

                setFilteredResults(prev => {
                    const existingIds = new Set(prev[mediaType].allItems.map(i => i.id));
                    const uniqueNewItems = newItems.filter(i => !existingIds.has(i.id));
                    return {
                        ...prev,
                        [mediaType]: {
                            ...prev[mediaType],
                            items: newItems,
                            allItems: [...prev[mediaType].allItems, ...uniqueNewItems],
                            page: page,
                            totalPages: resultsData?.total_pages || 1,
                            totalResults: resultsData?.total_results || 0
                        }
                    };
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleTabChange = (tab) => setActiveFilterTab(tab);

    const handleSortChange = (e) => {
        setSortOption(e.target.value);
        setFilteredResults(prev => ({
            ...prev,
            [activeFilterTab]: {
                ...prev[activeFilterTab],
                page: 1,
                items: [],
                allItems: []
            }
        }));
        setTimeout(() => performSearch(), 100);
    };

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

    const activeGenreTitle = useMemo(() => {
        if (searchQuery) return `Search Results: ${searchQuery}`;
        if (filters.genres && filters.genres.length > 0) {
            const allGenres = [...movieGenres, ...tvGenres];
            const names = filters.genres
                .map(id => allGenres.find(g => g.id.toString() === id.toString())?.name)
                .filter(Boolean);
            const uniqueNames = [...new Set(names)];
            if (uniqueNames.length > 0) {
                return `Genre: ${uniqueNames.join(', ')}`;
            }
        }
        return "Filtered Results";
    }, [searchQuery, filters.genres, movieGenres, tvGenres]);

    const toggleGenre = (id) => {
        setFilters(prev => {
            const g = prev.genres.includes(id.toString())
                ? prev.genres.filter(i => i !== id.toString())
                : [...prev.genres, id.toString()];
            return { ...prev, genres: g };
        });
    };

    const toggleLanguage = (code) => {
        setFilters(prev => {
            const l = prev.languages.includes(code)
                ? prev.languages.filter(c => c !== code)
                : [...prev.languages, code];
            return { ...prev, languages: l };
        });
    };

    const incrementRating = () => setFilters(prev => ({ ...prev, rating: Math.min(10, (parseFloat(prev.rating || 0) + 0.1)).toFixed(1) }));
    const decrementRating = () => setFilters(prev => ({ ...prev, rating: Math.max(0, (parseFloat(prev.rating || 0) - 0.1)).toFixed(1) }));

    const pageVariants = {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0, transition: { duration: 0.4 } },
        exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
    };

    return (
        <motion.div
            className="search-page"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div className="search-section">
                {/* Search Controls */}
                <div className={`search-controls-container expanded`}>
                    <div className={`search-input-container expanded`}>
                        <input
                            type="text"
                            id="search-input"
                            placeholder="Search Movies, TV Shows, People, Genres..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setIsShowingTrending(false); // Reset trending flag when user types
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    performSearch();
                                }
                            }}
                            autoComplete="off"
                        />
                        <VoiceSearch
                            onResult={handleVoiceResult}
                            onError={(error) => console.error('Voice search error:', error)}
                            currentTheme={currentTheme}
                        />
                        <button
                            type="button"
                            onClick={() => setShowSearchPanel(!showSearchPanel)}
                            className={`filter-toggle-button ${showSearchPanel ? 'active' : ''}`}
                        >
                            <img src={filterIcon} alt="Filter" />
                        </button>
                    </div>
                </div>

                {/* Sleek Minimalist Quick Category Bar */}
                <div className="popular-searches-row">
                    <span className="popular-searches-label">Genre:</span>
                    {QUICK_GENRES.map(pill => {
                        const isSelected = filters.genres.includes(pill.movieGenreId.toString()) ||
                            (pill.tvGenreId && filters.genres.includes(pill.tvGenreId.toString()));
                        return (
                            <button
                                key={pill.label}
                                type="button"
                                className={`popular-search-pill ${isSelected ? 'active' : ''}`}
                                onClick={() => handleGenreClick(pill)}
                            >
                                {isSelected && <span className="chip-check">✓ </span>}
                                {pill.label}
                            </button>
                        );
                    })}
                </div>

                {/* Filters */}
                <AnimatePresence>
                    {showSearchPanel && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div className="filter-form">
                                <div className="filter-header-bar">
                                    <span className="filter-header-title">Advanced Content Filters</span>
                                    <span className="filter-header-subtitle">Filter by Genre, Rating & Audio/Language</span>
                                </div>
                                <div className="filter-controls">
                                    {/* 1. Genres Section */}
                                    <div className="filter-group filter-group-full">
                                        <div className="filter-label-row">
                                            <label>Genre(s):</label>
                                            <input
                                                type="text"
                                                value={genreSearch}
                                                onChange={(e) => setGenreSearch(e.target.value)}
                                                placeholder="Quick filter genres..."
                                                className="filter-search-input"
                                            />
                                        </div>
                                        <div className="filter-chips-container">
                                            {displayedGenres.map(g => {
                                                const isSelected = filters.genres.includes(g.id.toString());
                                                return (
                                                    <button
                                                        key={g.id}
                                                        type="button"
                                                        className={`filter-chip-pill ${isSelected ? 'selected' : ''}`}
                                                        onClick={() => toggleGenre(g.id)}
                                                    >
                                                        {isSelected && <span className="chip-check">✓</span>}
                                                        {g.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* 2. Rating Section */}
                                    <div className="filter-group">
                                        <label>Minimum Rating:</label>
                                        <div className="rating-slider-row">
                                            <input
                                                type="range"
                                                min="0"
                                                max="10"
                                                step="0.1"
                                                value={filters.rating === '' ? 0 : parseFloat(filters.rating)}
                                                onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value === '0' ? '' : e.target.value }))}
                                                className="rating-slider"
                                                style={{ '--range-percent': `${((filters.rating === '' ? 0 : parseFloat(filters.rating)) / 10) * 100}%` }}
                                                aria-label="Minimum rating slider"
                                            />
                                            <span className="rating-slider-value">
                                                {filters.rating === '' ? 'Any' : `★ ${parseFloat(filters.rating).toFixed(1)}+`}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 3. Language Section */}
                                    <div className="filter-group filter-group-full">
                                        <div className="filter-label-row">
                                            <label> Audio / Language(s):</label>
                                            <input
                                                type="text"
                                                value={languageSearch}
                                                onChange={(e) => setLanguageSearch(e.target.value)}
                                                placeholder="Search languages..."
                                                className="filter-search-input"
                                            />
                                        </div>
                                        <div className="filter-chips-container">
                                            {displayedLanguages.slice(0, 18).map(l => {
                                                const isSelected = filters.languages.includes(l.iso_639_1);
                                                return (
                                                    <button
                                                        key={l.iso_639_1}
                                                        type="button"
                                                        className={`filter-chip-pill ${isSelected ? 'selected' : ''}`}
                                                        onClick={() => toggleLanguage(l.iso_639_1)}
                                                    >
                                                        {isSelected && <span className="chip-check">✓</span>}
                                                        {l.english_name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div className="filter-actions">
                                    <button type="button" onClick={() => performSearch()} className="apply-filters-button">
                                        <span>🔍 Apply Filters</span>
                                    </button>
                                    <button type="button" onClick={handleClearSearch} className="clear-filters-button">
                                        <span>✕ Reset All</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results */}
                {isFilterLoading && <MediaGridSkeleton count={8} />}

                {!isFilterLoading && isFilteredSearch && (
                    <div id="filtered-results" className="discovery-results-container">
                        <div className="filtered-header">
                            <h2 className="section-title">{getSectionTitle(activeGenreTitle)}</h2>
                        </div>

                        <div className="controls-bar">
                            <div className="sort-control">
                                <label htmlFor="sort-by">Sort By:</label>
                                <select id="sort-by" value={sortOption} onChange={handleSortChange} className="sort-select">
                                    <option value="popularity.desc">Popularity</option>
                                    <option value="vote_average.desc">Rating</option>
                                    <option value="release_date.desc">Latest</option>
                                </select>
                            </div>
                            <SlidingTabs 
                                tabs={[
                                    {id: 'movie', label: 'Movies'},
                                    {id: 'tv', label: 'TV Shows'},
                                    {id: 'people', label: 'People'}
                                ]}
                                activeTab={activeFilterTab}
                                onTabChange={handleTabChange}
                                layoutId="search-filter-tab"
                                className="search-filter-tabs"
                            />
                        </div>

                        <div className="tab-content">
                            {activeFilterTab === 'movie' && (
                                userPreferences.useInfiniteScroll ? (
                                    <InfiniteScrollGrid
                                        items={filteredResults.movie.allItems}
                                        type="movie"
                                        onMediaClick={onMediaClick}
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
                                        <MediaGrid items={filteredResults.movie.items} type="movie" onMediaClick={onMediaClick} />
                                        <Pagination currentPage={filteredResults.movie.page} totalPages={filteredResults.movie.totalPages} onPageChange={handleFilterPageChange} />
                                        <JumpToPage currentPage={filteredResults.movie.page} totalPages={filteredResults.movie.totalPages} onPageChange={handleFilterPageChange} currentTheme={currentTheme} />
                                    </>
                                )
                            )}
                            {activeFilterTab === 'tv' && (
                                userPreferences.useInfiniteScroll ? (
                                    <InfiniteScrollGrid
                                        items={filteredResults.tv.allItems}
                                        type="tv"
                                        onMediaClick={onMediaClick}
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
                                        <MediaGrid items={filteredResults.tv.items} type="tv" onMediaClick={onMediaClick} />
                                        <Pagination currentPage={filteredResults.tv.page} totalPages={filteredResults.tv.totalPages} onPageChange={handleFilterPageChange} />
                                        <JumpToPage currentPage={filteredResults.tv.page} totalPages={filteredResults.tv.totalPages} onPageChange={handleFilterPageChange} currentTheme={currentTheme} />
                                    </>
                                )
                            )}
                            {activeFilterTab === 'people' && (
                                <>
                                    <MediaGrid items={filteredResults.people.items} type="person" onMediaClick={onPersonClick} />
                                    <Pagination currentPage={filteredResults.people.page} totalPages={filteredResults.people.totalPages} onPageChange={handleFilterPageChange} />
                                </>
                            )}
                        </div>
                    </div>
                )}

                {!isFilterLoading && !isFilteredSearch && !searchQuery && (
                    <HomePage onMediaClick={onMediaClick} getSectionTitle={getSectionTitle} currentTheme={currentTheme} />
                )}
            </div>
        </motion.div>
    );
};

export default SearchPage;
