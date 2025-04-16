import React, { useState, useEffect, useRef } from 'react';
import { getTVShowDetails, getVideos, getMovieGenres, getTVGenres } from '../api/api'; // Add genre functions
import './PlayerModal.css';
import { useParams } from 'react-router-dom';
import ReactPlayer from 'react-player/youtube'; // Import a player
import filterIcon from './assets/filter-icon.svg'; // Import filter icon for sources
import externalLinkIcon from './assets/external-link.svg'; // ADD: Icon for external links
import devilIcon from './assets/devil-icon.svg'; // Re-add theme icons
import angelIcon from './assets/angel-icon.svg';
import hannibalIcon from './assets/hannibal-icon.svg';
import defaultThemeIcon from './assets/default-theme-icon.svg';
// --- REMOVE Theme Icons (assuming they exist) ---
// import devilIcon from './assets/devil-icon.svg'; 
// import angelIcon from './assets/angel-icon.svg';
// import hannibalIcon from './assets/hannibal-icon.svg';
// import defaultThemeIcon from './assets/default-theme-icon.svg'; // Optional: Icon for default state
// -------------------------------------------

// Custom hook approach
function useTrailerFetching(mediaType, id, media, type) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trailerKey, setTrailerKey] = useState(null);
  
  useEffect(() => {
    const effectiveType = mediaType || type;
    const effectiveId = id || media?.id;
    
    if (!effectiveType || !effectiveId) return;
    
    const fetchTrailer = async () => {
      try {
        setLoading(true);
        setError('');
        
        const videos = await getVideos(effectiveType, effectiveId);
        
        if (!videos || !videos.length) {
          setError('No trailer available');
          setLoading(false);
          return;
        }
        
        // First try to find official trailers
        let trailer = videos.find(video => 
          video.type.toLowerCase() === 'trailer' && 
          video.site.toLowerCase() === 'youtube' &&
          video.official === true
        );
        
        // If no official trailer, try any trailer
        if (!trailer) {
          trailer = videos.find(video => 
            video.type.toLowerCase() === 'trailer' && 
            video.site.toLowerCase() === 'youtube'
          );
        }
        
        // If still no trailer, try teasers
        if (!trailer) {
          trailer = videos.find(video => 
            video.type.toLowerCase() === 'teaser' && 
            video.site.toLowerCase() === 'youtube'
          );
        }
        
        // If still nothing, use any YouTube video
        if (!trailer) {
          trailer = videos.find(video => 
            video.site.toLowerCase() === 'youtube'
          );
        }
        
        if (trailer) {
          setTrailerKey(trailer.key);
        } else {
          setError('No suitable trailer found');
        }
        
      } catch (err) {
        console.error("Error fetching trailer:", err);
        setError('Failed to load trailer');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrailer();
  }, [mediaType, id, media, type]);
  
  return { loading, error, trailerKey };
}

const PlayerModal = ({ media, type, onClose, defaultSubtitleLanguage = '', showTrailer = false, currentTheme = 'devil' }) => {
  const [tvDetails, setTvDetails] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [playerError, setPlayerError] = useState(null);
  const [currentDomainIndex, setCurrentDomainIndex] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const iframeRef = useRef(null);
  const { mediaType, id } = useParams(); // Get type and id from URL
  const { loading: trailerLoading, error: trailerError, trailerKey } = useTrailerFetching(mediaType, id, media, type);
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(showTrailer);
  const [genres, setGenres] = useState([]); // Add state for genres
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false); // New state for collapsible description
  const [watchlistStatus, setWatchlistStatus] = useState(false); // Track if item is in watchlist
  const [userRating, setUserRating] = useState(0); // User's personal rating
  const [selectedPlayerSource, setSelectedPlayerSource] = useState('nontongo'); // Default player source
  const [sourceErrorCount, setSourceErrorCount] = useState({}); // Track errors per source
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  // Add state to detect current theme
  // const [currentTheme, setCurrentTheme] = useState('devil');
  
  // --- WatchMode API Integration ---
  const [watchModeSources, setWatchModeSources] = useState([]);
  const [isLoadingWatchMode, setIsLoadingWatchMode] = useState(false);
  const [watchModeError, setWatchModeError] = useState(null);
  const WATCHMODE_API_KEY = 'UmYrr7vHxc4hue3yPSedJYDqoeNH0L2MpnDfVMWo'; // Use the provided key
  const WATCHMODE_BASE_URL = 'https://api.watchmode.com/v1/';
  // --------------------------------

  // --- Updated Player Sources ---
  // Keep only the original embedded sources
  const embeddedPlayerSources = [
    { id: 'nontongo', name: 'NontonGo' },
    { id: 'vidsrc', name: 'VidSrc' },
    { id: 'vidsrcme', name: 'VidSrc.me' },
    { id: '2embed', name: '2embed.cc' },
    { id: 'godriveplayer', name: 'GoDrivePlayer' },
    { id: 'proxyapi', name: 'Community Proxy' },
  ];

  const embeddedPlayerInfo = {
    vidsrc: { name: 'VidSrc', website: 'vidsrc.xyz', features: ['Embedded Player', 'Fast'] },
    vidsrcme: { name: 'VidSrc.me', website: 'vidsrc.me', features: ['Embedded Player', 'Reliable'] },
    '2embed': { name: '2embed.cc', website: '2embed.cc', features: ['Embedded Player', 'Alternative'] },
    nontongo: { name: 'NontonGo', website: 'nontongo.win', features: ['Embedded Player', 'Alternative'] },
    godriveplayer: { name: 'GoDrivePlayer', website: 'godriveplayer.com', features: ['Embedded Player', 'IMDB/TMDB'] },
    proxyapi: { name: 'Community Proxy', website: 'proxy-api.example.com', features: ['Embedded Player', 'Multi-Source'] },
  };
  
  // VidSrc domains for fallback
  const vidsrcDomains = [
    'vidsrc.xyz',
    'vidsrc.in',
    'vidsrc.pm',
    'vidsrc.net'
  ];
  // -----------------------------

  // --- Fetch WatchMode Sources Effect ---
  useEffect(() => {
    const getWatchModeStreamingSources = async (titleName) => {
      if (!titleName) return;
      
      setIsLoadingWatchMode(true);
      setWatchModeError(null);
      setWatchModeSources([]);

      try {
        // 1. Search for the title by name (using TMDB ID might be more reliable if available)
        // Using name search as per the provided example
        const searchUrl = new URL('search/', WATCHMODE_BASE_URL);
        searchUrl.search = new URLSearchParams({
          search_field: 'name',
          search_value: titleName,
          apiKey: WATCHMODE_API_KEY,
          types: type === 'movie' ? 'movie' : 'tv_series' // Specify result type
        });

        const searchResponse = await fetch(searchUrl);
        if (!searchResponse.ok) throw new Error(`WatchMode Search API Error: ${searchResponse.statusText}`);
        const searchResults = await searchResponse.json();
        
        const potentialTitles = searchResults.title_results;
        if (!potentialTitles || potentialTitles.length === 0) {
          throw new Error('Title not found on WatchMode.');
        }

        // Heuristic: Find the best match (e.g., based on year if available)
        // For now, just take the first result ID
        const titleId = potentialTitles[0].id;

        // 3. Get streaming sources for the found WatchMode ID
        const sourcesUrl = new URL(`title/${titleId}/sources/`, WATCHMODE_BASE_URL);
        sourcesUrl.search = new URLSearchParams({ apiKey: WATCHMODE_API_KEY });

        const sourcesResponse = await fetch(sourcesUrl);
        if (!sourcesResponse.ok) throw new Error(`WatchMode Sources API Error: ${sourcesResponse.statusText}`);
        const sourcesData = await sourcesResponse.json();

        // Filter to include relevant types (sub, free, rent, buy, addon)
        const relevantSourceTypes = ['sub', 'free', 'rent', 'buy', 'addon'];
        const streamingPlayers = sourcesData.filter(source => 
           relevantSourceTypes.includes(source.type)
        ).map(source => ({ // Simplify the structure
          id: source.source_id,
          name: source.name,
          type: source.type,
          web_url: source.web_url,
          price: source.price,
          format: source.format // e.g., HD, SD, 4K
        }));

        setWatchModeSources(streamingPlayers);

      } catch (error) {
        console.error('WatchMode API Error:', error);
        setWatchModeError(error.message || 'Failed to fetch streaming options.');
      } finally {
        setIsLoadingWatchMode(false);
      }
    };

    if (media && (media.title || media.name)) {
      getWatchModeStreamingSources(type === 'movie' ? media.title : media.name);
    }

  }, [media, type]); // Re-fetch when media or type changes
  // -----------------------------------

  useEffect(() => {
    setIsPlayingTrailer(showTrailer);
  }, [showTrailer]);

  useEffect(() => {
    if (type === 'tv' && media?.id) {
      setIsLoadingDetails(true);
      setPlayerError(null);
      getTVShowDetails(media.id)
        .then(details => {
          if (details && details.seasons) {
            // Filter out "Specials" (season 0) if present
            const validSeasons = details.seasons.filter(s => s.season_number > 0);
            setTvDetails({ ...details, seasons: validSeasons });
            // Default to season 1, episode 1 if available
            if (validSeasons.length > 0) {
                setSelectedSeason(validSeasons[0].season_number);
                // Attempt to find episode count for season 1, default to 1 if not found
                const season1 = validSeasons.find(s => s.season_number === 1);
                if (season1 && season1.episode_count > 0) {
                    setSelectedEpisode(1);
                } else {
                    setSelectedEpisode(1); // Fallback if season 1 has 0 episodes or is missing
                }
            } else {
                setSelectedSeason(1); // Fallback if no valid seasons
                setSelectedEpisode(1);
            }
          } else {
             setPlayerError('Could not load TV show details.');
          }
          setIsLoadingDetails(false);
        })
        .catch(err => {
          console.error("Error fetching TV details:", err);
          setPlayerError('Failed to fetch TV show details.');
          setIsLoadingDetails(false);
        });
    }
  }, [type, media]);
  
  // Reset video loading state and error when changing parameters
  useEffect(() => {
    setVideoLoaded(false);
    setPlayerError(null);
    setCurrentDomainIndex(0);
  }, [selectedSeason, selectedEpisode]); // [EDIT] Removed isPlayingTrailer dependency

  // Add new effect to fetch genres
  useEffect(() => {
    const fetchGenres = async () => {
      if (!media || !media.genre_ids || media.genre_ids.length === 0) {
        return;
      }
      
      try {
        const genreList = type === 'movie' ? await getMovieGenres() : await getTVGenres();
        if (genreList && genreList.genres) {
          // Match genre IDs with genre names
          const mediaGenres = genreList.genres.filter(genre => 
            media.genre_ids.includes(genre.id)
          );
          setGenres(mediaGenres);
        }
      } catch (err) {
        console.error("Error fetching genres:", err);
      }
    };
    
    fetchGenres();
  }, [media, type]);

  // Reset video loading state and error when changing embedded player parameters
  useEffect(() => {
    if (embeddedPlayerSources.some(s => s.id === selectedPlayerSource)) {
      setVideoLoaded(false);
      setPlayerError(null);
      setCurrentDomainIndex(0);
    }
  }, [selectedSeason, selectedEpisode, selectedPlayerSource]);

  // --- Updated getVideoUrl for Embedded Sources Only ---
  const getVideoUrl = (sourceId = selectedPlayerSource, domainIndex = currentDomainIndex) => {
    if (!embeddedPlayerSources.some(s => s.id === sourceId)) return ''; // Only handle embedded sources

    // VidSrc
    if (sourceId === 'vidsrc') {
      const domain = vidsrcDomains[domainIndex];
      let baseUrl = type === 'movie' 
        ? `https://${domain}/embed/movie?tmdb=${media.id}` 
        : `https://${domain}/embed/tv?tmdb=${media.id}&season=${selectedSeason}&episode=${selectedEpisode}`;
      if (defaultSubtitleLanguage) baseUrl += `&ds_lang=${defaultSubtitleLanguage}`;
      return baseUrl;
    }
    // VidSrc.me (updated from examples)
    else if (sourceId === 'vidsrcme') {
      return type === 'movie' 
        ? `https://vidsrc.me/embed/movie?tmdb=${media.id}` 
        : `https://vidsrc.me/embed/tv?tmdb=${media.id}&s=${selectedSeason}&e=${selectedEpisode}`;
    }
    // 2embed.cc (updated from examples)
    else if (sourceId === '2embed') {
      return type === 'movie' 
        ? `https://2embed.cc/embed/movie/tmdb/${media.id}` 
        : `https://2embed.cc/embed/series/tmdb/${media.id}/${selectedSeason}/${selectedEpisode}`;
    }
    // NontonGo
    else if (sourceId === 'nontongo') {
      return type === 'movie' 
        ? `https://www.NontonGo.win/embed/movie/${media.id}` 
        : `https://www.NontonGo.win/embed/tv/${media.id}/${selectedSeason}/${selectedEpisode}`;
    }
    // GoDrivePlayer (updated from examples)
    else if (sourceId === 'godriveplayer') {
      return type === 'movie' 
        ? `https://goplayer.pro/player/movie/tmdb/${media.id}` 
        : `https://goplayer.pro/player/tv/tmdb/${media.id}/${selectedSeason}/${selectedEpisode}`;
    }
    // Community Proxy API (new from examples)
    else if (sourceId === 'proxyapi') {
      return type === 'movie' 
        ? `https://proxy-api.example.com/embed/tmdb/${media.id}` 
        : `https://proxy-api.example.com/embed/tmdb/${media.id}/tv/${selectedSeason}/${selectedEpisode}`;
    }
    
    return ''; // Fallback
  };
  // --------------------------------------------------

  // --- Share Link Function (no changes needed) ---
  const generateShareLink = () => {
    const baseAppUrl = window.location.origin;
    let shareLink = `${baseAppUrl}/share?id=${media.id}&type=${type}`;
    
    // Only include embedded player source in share link if one is selected
    if (embeddedPlayerSources.some(s => s.id === selectedPlayerSource)) {
       shareLink += `&source=${selectedPlayerSource}`;
    }
    
    if (type === 'tv') {
      shareLink += `&season=${selectedSeason}&episode=${selectedEpisode}`;
    }
    return shareLink;
  };

  const handleShareClick = () => {
    const link = generateShareLink();
    navigator.clipboard.writeText(link)
      .then(() => {
        setShowShareTooltip(true);
        setTimeout(() => setShowShareTooltip(false), 2000);
      })
      .catch(err => console.error('Failed to copy: ', err));
  };
  // ----------------------------------------------

  // --- Player Source Change Handler ---
  const handlePlayerSourceChange = (sourceId) => {
    setSelectedPlayerSource(sourceId);
    // Reset relevant states only if it's an embedded source
    if (embeddedPlayerSources.some(s => s.id === sourceId)) {
      setVideoLoaded(false);
      setPlayerError(null);
      if (sourceId === 'vidsrc') setCurrentDomainIndex(0);
    }
    console.log(`Player source changed to: ${sourceId}`);
  };
  // -----------------------------------
  
  // --- WatchMode Source Click Handler ---
  const handleWatchModeSourceClick = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };
  // -------------------------------------

  // --- Auto-switch for Embedded Sources ---
  useEffect(() => {
    const currentErrorCount = sourceErrorCount[selectedPlayerSource] || 0;
    
    // Only auto-switch if the failed source is an embedded one
    if (embeddedPlayerSources.some(s => s.id === selectedPlayerSource) && currentErrorCount >= 3 && !isPlayingTrailer) {
      const currentIndex = embeddedPlayerSources.findIndex(s => s.id === selectedPlayerSource);
      const nextIndex = (currentIndex + 1) % embeddedPlayerSources.length;
      const nextSourceId = embeddedPlayerSources[nextIndex].id;
      
      handlePlayerSourceChange(nextSourceId);
      setPlayerError(`Auto-switched to ${embeddedPlayerInfo[nextSourceId]?.name || 'next source'} after failures.`);
    }
  }, [sourceErrorCount, selectedPlayerSource, isPlayingTrailer]); // Add isPlayingTrailer dependency
  // -----------------------------------------

  // --- Render Source Selector (Redesigned) ---
  const renderPlayerSourceSelector = () => {
    // Determine if an embedded player is currently selected
    const isEmbeddedPlayerSelected = embeddedPlayerSources.some(s => s.id === selectedPlayerSource);
    const currentSourceInfo = isEmbeddedPlayerSelected ? embeddedPlayerInfo[selectedPlayerSource] : null;

    return (
      <div className="source-selector-container">
        {/* Section 1: Embedded Players */}
        <div className="source-section embedded-players">
          <h4 className="source-section-title">
             <img src={filterIcon} alt="" className="source-title-icon" /> 
             Embedded Players
          </h4>
          <div className="source-options-grid">
            {embeddedPlayerSources.map(source => (
              <button
                key={source.id}
                className={`source-button embedded ${selectedPlayerSource === source.id ? 'active' : ''} ${sourceErrorCount[source.id] >= 3 ? 'failed' : ''}`}
                onClick={() => handlePlayerSourceChange(source.id)}
                title={`Watch using ${source.name} (Embedded)`}
              >
                {/* Optionally add icons here if available */} 
                {source.name}
              </button>
            ))}
          </div>
          {/* Display features only if an embedded player is selected */} 
          {isEmbeddedPlayerSelected && currentSourceInfo && (
             <div className="player-attribution compact">
                <span className="attribution-powered">Using: {currentSourceInfo.name}</span>
                <div className="attribution-features">
                  {currentSourceInfo.features.map((feature, index) => (
                    <span key={index} className="feature-tag compact">{feature}</span>
                  ))}
                </div>
              </div>
          )}
        </div>

        {/* Global Share Button */} 
        <div className="share-button-container global-share">
          <button 
            className="share-button compact"
            onClick={handleShareClick} 
            title="Copy shareable link (includes selected embedded player if active)"
          >
            Share
          </button>
          {showShareTooltip && (
            <div className="share-tooltip">Link copied!</div>
          )}
        </div>
      </div>
    );
  };
  // ----------------------------------------

  // WatchMode Streaming Services section - separated from source selector
  const renderStreamingServices = () => {
    return (
      <div className="streaming-services-container">
        <hr className="source-separator" />
        
        {/* WatchMode Streaming Options */}
        <div className="source-section watchmode-players">
          <h4 className="source-section-title">
            <img src={externalLinkIcon} alt="" className="source-title-icon" /> 
            Find on Streaming Services
          </h4>
          {isLoadingWatchMode && <p className="loading-text small">Searching options...</p>}
          {watchModeError && !isLoadingWatchMode && <p className="error-text small">{watchModeError}</p>}
          {!isLoadingWatchMode && !watchModeError && watchModeSources.length === 0 && (
            <p className="info-text small">No streaming options found via WatchMode.</p>
          )}
          {!isLoadingWatchMode && watchModeSources.length > 0 && (
            <div className="source-options-grid">
              {watchModeSources.map(source => (
                <button
                  key={`${source.id}-${source.type}-${source.web_url}`}
                  className="source-button watchmode"
                  onClick={() => handleWatchModeSourceClick(source.web_url)}
                  title={`Watch on ${source.name} (${source.type}) - Opens external site`}
                >
                  {source.name}
                  <span className="source-type-badge">{source.type}{source.price ? ` ($${source.price})` : ''}</span>
                  {source.format && <span className="quality-badge small">{source.format}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- Iframe Error/Load Handlers ---
  const handleIframeError = () => {
    // Only handle errors for embedded players
    if (!embeddedPlayerSources.some(s => s.id === selectedPlayerSource)) return;

    // VidSrc Fallback Logic
    if (selectedPlayerSource === 'vidsrc') {
    if (currentDomainIndex < vidsrcDomains.length - 1) {
        setCurrentDomainIndex(prev => prev + 1);
    } else {
        setPlayerError(`VidSrc failed on all domains. Try another source.`);
        setSourceErrorCount(prev => ({ ...prev, vidsrc: (prev.vidsrc || 0) + 1 }));
      }
    } 
    // General Embedded Source Error
    else {
      const sourceName = embeddedPlayerInfo[selectedPlayerSource]?.name || 'Selected source';
      setPlayerError(`Failed to load from ${sourceName}. Try another embedded source.`);
      setSourceErrorCount(prev => ({
        ...prev,
        [selectedPlayerSource]: (prev[selectedPlayerSource] || 0) + 1
      }));
    }
    setVideoLoaded(false); // Ensure loading indicator might reappear if needed
  };
  
  const handleIframeLoad = () => {
    // Only mark as loaded if an embedded source is selected
    if (embeddedPlayerSources.some(s => s.id === selectedPlayerSource)) {
    setVideoLoaded(true);
    setPlayerError(null);
      // Reset error count for the *successfully loaded* source
      setSourceErrorCount(prev => ({ ...prev, [selectedPlayerSource]: 0 }));
    }
  };
  // --------------------------------

  // --- Component Return Structure ---
  if (!media) return null;

  const currentSeasonData = tvDetails?.seasons?.find(s => s.season_number === selectedSeason);
  const episodeCount = currentSeasonData?.episode_count || 0;

  const handleSeasonChange = (e) => {
    setSelectedSeason(parseInt(e.target.value, 10));
    setSelectedEpisode(1);
  };

  const handleEpisodeChange = (e) => {
    setSelectedEpisode(parseInt(e.target.value, 10));
  };

  // Get URL only if an embedded player is selected
  const currentVideoUrl = embeddedPlayerSources.some(s => s.id === selectedPlayerSource) ? getVideoUrl() : null;

  const toggleTrailer = () => setIsPlayingTrailer(!isPlayingTrailer);
  const toggleDescription = () => setIsDescriptionExpanded(!isDescriptionExpanded);
  const toggleWatchlist = (e) => {
    e.stopPropagation();
    setWatchlistStatus(!watchlistStatus);
  };
  const handleRatingClick = (rating) => setUserRating(rating);

  const renderStarRating = () => {
    return (
      <div className="user-rating">
        <p className="rating-title">Your Rating:</p>
        <div className="stars-container">
          {[1, 2, 3, 4, 5].map(star => (
            <span 
              key={star} 
              className={`star ${star <= userRating ? 'filled' : ''}`}
              onClick={() => handleRatingClick(star)}
            >
              
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderMediaDetails = () => {
    if (!media) return null;
    
    const mediaOverview = media.overview || (tvDetails && tvDetails.overview) || 'No description available.';
    const releaseDate = type === 'movie' 
      ? (media.release_date && new Date(media.release_date).toLocaleDateString()) 
      : (media.first_air_date && new Date(media.first_air_date).toLocaleDateString());
    const ratingLabel = "M Rating";
    const ratingValue = media.vote_average ? `${media.vote_average.toFixed(1)}/10` : 'N/A';
    
    return (
      <>
        <div className="media-details">
          <div className="media-info-row">
            {releaseDate && <span className="media-info-item"><strong>Released:</strong> {releaseDate}</span>}
            {ratingValue !== 'N/A' && <span className="media-info-item"><strong>{ratingLabel}:</strong> {ratingValue}</span>}
            <button 
              className={`watchlist-button ${watchlistStatus ? 'in-watchlist' : ''}`}
              onClick={toggleWatchlist}
              title={watchlistStatus ? "Remove from Watchlist" : "Add to Watchlist"}
            >
              {watchlistStatus ? " In Watchlist" : " Add to Watchlist"}
            </button>
          </div>
          
          {genres.length > 0 && (
            <div className="media-genres">
              {genres.map(genre => (
                <span key={genre.id} className="genre-tag">{genre.name}</span>
              ))}
            </div>
          )}
          
          <h3>Overview</h3>
          <div className="media-description-container">
            <p className={`media-description ${isDescriptionExpanded ? 'expanded' : 'collapsed'}`}>
              {mediaOverview}
            </p>
            {mediaOverview.length > 150 && (
              <button 
                className={`description-toggle ${isDescriptionExpanded ? 'expanded' : ''}`}
                onClick={toggleDescription}
              >
                {isDescriptionExpanded ? "Show Less" : "Show More"}
              </button>
            )}
          </div>
          
          {/* User rating feature */}
          {renderStarRating()}
          
          {/* Additional info section for TV shows */}
          {type === 'tv' && tvDetails && (
            <div className="additional-info">
              <h3>Show Info</h3>
              {tvDetails.number_of_seasons && (
                <div className="info-item">
                  <span className="info-label">Seasons:</span> 
                  <span className="info-value">{tvDetails.number_of_seasons}</span>
                </div>
              )}
              {tvDetails.status && (
                <div className="info-item">
                  <span className="info-label">Status:</span> 
                  <span className="info-value">{tvDetails.status}</span>
                </div>
              )}
              {tvDetails.networks && tvDetails.networks.length > 0 && (
                <div className="info-item">
                  <span className="info-label">Network:</span> 
                  <span className="info-value">{tvDetails.networks[0].name}</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Streaming Services after user ratings and additional info */}
        {renderStreamingServices()}
      </>
    );
  };

  return (
    <div className={`modal-overlay theme-${currentTheme}-modal`} onClick={onClose}>
      <div className={`modal-content theme-${currentTheme}-modal-content`} onClick={(e) => e.stopPropagation()}>
        
        <button className="close-button" onClick={onClose}>&times;</button>
        
        <h2 className="modal-title">{type === 'movie' ? media.title : media.name}</h2>
        
        {/* TV Show Season/Episode Selection (if applicable) */} 
        {type === 'tv' && !isPlayingTrailer && (
          <div className={`tv-controls simple theme-${currentTheme}-controls`}>
            {isLoadingDetails && <p className="loading-text">Loading season data...</p>}
            {playerError && !isLoadingDetails && <p className="error-text">{playerError}</p>} {/* Show TV details error if applicable */}
            {!isLoadingDetails && !playerError && tvDetails && tvDetails.seasons.length > 0 && (
              <>
                <div className="select-wrapper">
                  <label htmlFor="season-select">Season:</label>
                  <select id="season-select" value={selectedSeason} onChange={handleSeasonChange}>
                    {tvDetails.seasons.map(season => (
                      <option key={season.id} value={season.season_number}>
                        Season {season.season_number} ({season.episode_count} Episodes)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="select-wrapper">
                  <label htmlFor="episode-select">Episode:</label>
                  <select id="episode-select" value={selectedEpisode} onChange={handleEpisodeChange} disabled={episodeCount === 0}>
                    {Array.from({ length: episodeCount }, (_, i) => i + 1).map(epNum => (
                      <option key={epNum} value={epNum}>
                        Episode {epNum}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            {!isLoadingDetails && !playerError && tvDetails && tvDetails.seasons.length === 0 && (
                <p className="info-text">No season data available for this show.</p>
            )}
          </div>
        )}

        {/* Trailer Toggle Button */} 
        {trailerKey && (
          <button className={`trailer-modal-btn theme-${currentTheme}-btn`} onClick={toggleTrailer}>
            {isPlayingTrailer ? "Back to Content" : "Watch Trailer"}
          </button>
        )}

        {/* Main Content Area: Player or Sources */} 
        <div className={`main-content-area theme-${currentTheme}-content-area`}>
          {/* Player Area (Trailer or Embedded Player) */} 
          <div className={`player-container ${isPlayingTrailer || currentVideoUrl ? 'visible' : 'hidden'}`}>
        {isPlayingTrailer && trailerKey ? (
               <div className="player-wrapper trailer-active">
            <ReactPlayer
              url={`https://www.youtube.com/watch?v=${trailerKey}`}
              controls={true}
              width="100%"
              height="100%"
              style={{ position: 'absolute', top: 0, left: 0 }}
              playing={true}
              className="react-player"
              onError={() => setError('Failed to play trailer. Please try again.')}
            />
          </div>
             ) : isPlayingTrailer && trailerLoading ? (
               <div className="player-wrapper loading"><div className="trailer-loading">Loading trailer...</div></div>
             ) : isPlayingTrailer && trailerError ? (
               <div className="player-wrapper error"><div className="trailer-error">{trailerError}</div></div>
             ) : currentVideoUrl ? ( // Show embedded player if URL exists
               <div className="player-wrapper embedded-active">
                  {playerError && (
                    <div className="player-message error-message"><p>{playerError}</p></div>
                  )}
                  {/* VidSrc trying alternative message */} 
                  {selectedPlayerSource === 'vidsrc' && currentDomainIndex > 0 && !videoLoaded && !playerError && (
                     <div className="player-message"><p>Trying alternative source...</p></div>
                )}
                <iframe
                  ref={iframeRef}
                    src={currentVideoUrl}
                    key={`${selectedPlayerSource}-${type}-${media.id}-${selectedSeason}-${selectedEpisode}-${currentDomainIndex}`}
                  width="100%"
                  height="100%" 
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; encrypted-media"
                  title="Video Player"
                  onError={handleIframeError}
                  onLoad={handleIframeLoad}
                ></iframe>
               </div>
             ) : ( // Message when no embedded player is selected/active
                 <div className="player-wrapper placeholder">
                     <p>Select an embedded player above or choose a streaming service.</p>
                 </div>
            )}
          </div>
          
          {/* Source Selector Area - Now excludes streaming services */} 
          {!isPlayingTrailer && renderPlayerSourceSelector()}
        </div>
        
        {/* Media Details Area including Streaming Services */} 
        {!isPlayingTrailer && (
          <div className={`media-details-container theme-${currentTheme}-details`}>
            {renderMediaDetails()}
          </div>
        )}
        
      </div>
    </div>
  );
};

export default PlayerModal; 