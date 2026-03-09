import React, { useState, useEffect, useRef } from 'react';
import { getTVShowDetails, getMovieDetails, getVideos, getMovieGenres, getTVGenres, getMovieCredits, getTVSeasonCredits, getTVSeasonVideos, IMAGE_BASE_URL } from '../api/api';
import './PlayerModal.css';
import { useParams, useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player/youtube';
import filterIcon from './assets/filter-icon.svg';
import externalLinkIcon from './assets/external-link.svg';
import devilIcon from './assets/devil-icon.svg';
import angelIcon from './assets/angel-icon.svg';
import hannibalIcon from './assets/hannibal-icon.svg';
import defaultThemeIcon from './assets/default-theme-icon.svg';
import ShareButtons from '../components/ShareButtons';
import ModalBackdrop from '../components/three/ModalBackdrop';
import darkTexture from './assets/dark-texture.png';
// --- REMOVE Theme Icons (assuming they exist) ---
// import devilIcon from './assets/devil-icon.svg'; 
// import angelIcon from './assets/angel-icon.svg';
// import hannibalIcon from './assets/hannibal-icon.svg';
// import defaultThemeIcon from './assets/default-theme-icon.svg'; // Optional: Icon for default state
// -------------------------------------------

// Custom hook approach
function useTrailerFetching(mediaType, id, media, type, season) {
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

        let videos = [];
        // If it's a TV show and we have a season, try to fetch season videos first
        if ((effectiveType === 'tv' || type === 'tv') && season) {
          try {
            const seasonVideos = await getTVSeasonVideos(effectiveId, season);
            if (seasonVideos && seasonVideos.length > 0) {
              videos = seasonVideos;
            }
          } catch (e) {
            console.warn("Failed to fetch season videos, falling back to main videos", e);
          }
        }

        // If no season videos (or not TV), fetch standard videos
        if (!videos || videos.length === 0) {
          videos = await getVideos(effectiveType, effectiveId);
        }

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
  }, [mediaType, id, media, type, season]);

  return { loading, error, trailerKey };
}

const PlayerModal = ({ media, type, onClose, defaultSubtitleLanguage = '', showTrailer = false, currentTheme = 'devil' }) => {
  const [tvDetails, setTvDetails] = useState(null);
  const [movieDetails, setMovieDetails] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [playerError, setPlayerError] = useState(null);
  const [currentDomainIndex, setCurrentDomainIndex] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const iframeRef = useRef(null);
  const { mediaType, id, season: urlSeason, episode: urlEpisode } = useParams(); // Get type, id, season, and episode from URL
  const { loading: trailerLoading, error: trailerError, trailerKey } = useTrailerFetching(mediaType, id, media, type, selectedSeason);
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(showTrailer);
  const [genres, setGenres] = useState([]); // Add state for genres
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false); // New state for collapsible description
  const [watchlistStatus, setWatchlistStatus] = useState(false); // Track if item is in watchlist
  const [userRating, setUserRating] = useState(0); // User's personal rating
  const [selectedPlayerSource, setSelectedPlayerSource] = useState(() => {
    return localStorage.getItem('player_source') || 'vidfast';
  }); // Default player source from cache or 'vidfast'
  const [sourceErrorCount, setSourceErrorCount] = useState({}); // Track errors per source
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  // Add state to detect current theme
  // const [currentTheme, setCurrentTheme] = useState('devil');

  // --- Cast State ---
  const [cast, setCast] = useState([]);
  const [isLoadingCast, setIsLoadingCast] = useState(false);
  // ------------------

  // --- Updated Player Sources ---
  const embeddedPlayerSources = [
    { id: 'autoembed', name: 'AutoEmbed' },
    { id: 'nontongo', name: 'NontonGo' },
    { id: 'vidsrc', name: 'VidSrc' },
    { id: 'moviesapi', name: 'MoviesAPI' },
    { id: 'vidsrcme', name: 'VidSrc.me' },
    { id: 'vidfast', name: 'VidFast' },
    { id: 'vixsrc', name: 'VixSrc' },
    { id: 'vidrock', name: 'VidRock' },
    { id: 'vidsrcxyz', name: 'VidSrc.xyz' },
    { id: '2embedcc', name: '2Embed (Alt)' },
    { id: 'smashy', name: 'Smashy Stream' },
    { id: 'vembed', name: 'Vembed' },
    { id: 'videasy', name: 'Videasy' },
  ];

  const embeddedPlayerInfo = {
    autoembed: { name: 'AutoEmbed', website: 'autoembed.cc', features: ['Embedded Player', 'Multi-Source'] },
    nontongo: { name: 'NontonGo', website: 'nontongo.win', features: ['Embedded Player', 'Alternative'] },
    vidsrc: { name: 'VidSrc', website: 'vidsrc.xyz', features: ['Embedded Player', 'Fast'] },
    vidsrcme: { name: 'VidSrc.me', website: 'vidsrc.me', features: ['Embedded Player', 'Reliable'] },
    moviesapi: { name: 'MoviesAPI', website: 'moviesapi.club', features: ['Embedded Player', 'HD Quality'] },
    vidfast: { name: 'VidFast', website: 'vidfast.pro', features: ['Embedded Player', 'Fast'] },
    vixsrc: { name: 'VixSrc', website: 'vixsrc.to', features: ['Embedded Player', 'New'] },
    vidrock: { name: 'VidRock', website: 'vidrock.net', features: ['Embedded Player', 'HD'] },
    vidsrcxyz: { name: 'VidSrc.xyz', website: 'vidsrc.xyz', features: ['Embedded Player', 'Fast'] },
    smashy: { name: 'Smashy Stream', website: 'player.smashy.stream', features: ['Embedded Player', 'Fast'] },
    '2embedcc': { name: '2Embed (Alt)', website: '2embed.cc', features: ['Embedded Player', 'Alternative'] },
    vembed: { name: 'Vembed', website: 'vembed.click', features: ['Embedded Player', 'New'] },
    videasy: { name: 'Videasy', website: 'videasy.net', features: ['Embedded Player', 'HD'] },
  };

  // VidSrc domains for fallback
  const vidsrcDomains = [
    'vidsrc.xyz',
    'vidsrc.in',
    'vidsrc.pm',
    'vidsrc.net'
  ];
  // -----------------------------

  // --- Fetch Cast Effect ---
  useEffect(() => {
    const fetchCast = async () => {
      if (!media || !media.id) return;

      setIsLoadingCast(true);
      setCast([]);

      try {
        let credits;
        if (type === 'movie') {
          credits = await getMovieCredits(media.id);
        } else if (type === 'tv' && selectedSeason) {
          credits = await getTVSeasonCredits(media.id, selectedSeason);
        }

        if (credits && credits.cast) {
          setCast(credits.cast);
        }
      } catch (error) {
        console.error("Error fetching cast:", error);
      } finally {
        setIsLoadingCast(false);
      }
    };

    fetchCast();
  }, [media, type, selectedSeason]);
  // -----------------------------------

  useEffect(() => {
    if (type === 'movie' && media?.id) {
      getMovieDetails(media.id)
        .then(setMovieDetails)
        .catch(err => console.error("Error fetching movie details:", err));
    } else {
      setMovieDetails(null);
    }
  }, [type, media]);

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

            // Use URL parameters if available, otherwise default to season 1, episode 1
            if (validSeasons.length > 0) {
              const initialSeason = urlSeason ? parseInt(urlSeason, 10) : validSeasons[0].season_number;
              const initialEpisode = urlEpisode ? parseInt(urlEpisode, 10) : 1;

              // Validate that the URL season exists
              const seasonExists = validSeasons.find(s => s.season_number === initialSeason);
              if (seasonExists) {
                setSelectedSeason(initialSeason);
                // Validate episode number against season's episode count
                if (initialEpisode <= seasonExists.episode_count && initialEpisode > 0) {
                  setSelectedEpisode(initialEpisode);
                } else {
                  setSelectedEpisode(1); // Fallback to episode 1 if invalid episode
                }
              } else {
                // Fallback to first available season if URL season doesn't exist
                setSelectedSeason(validSeasons[0].season_number);
                setSelectedEpisode(1);
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
  }, [type, media, urlSeason, urlEpisode]);

  // Reset video loading state and error when changing parameters
  useEffect(() => {
    setVideoLoaded(false);
    setPlayerError(null);
    setCurrentDomainIndex(0);
  }, [selectedSeason, selectedEpisode]); // [EDIT] Removed isPlayingTrailer dependency

  // Add new effect to fetch genres
  useEffect(() => {
    const fetchGenres = async () => {
      if (!media) {
        return;
      }

      try {
        // Check if media has genres directly (from individual API call) or genre_ids (from search/trending)
        if (media.genres && Array.isArray(media.genres)) {
          // Individual movie/TV details API returns genres directly
          setGenres(media.genres);
        } else if (media.genre_ids && media.genre_ids.length > 0) {
          // Search/trending API returns genre_ids that need to be matched
          const genreList = type === 'movie' ? await getMovieGenres() : await getTVGenres();
          if (genreList && genreList.genres) {
            const mediaGenres = genreList.genres.filter(genre =>
              media.genre_ids.includes(genre.id)
            );
            setGenres(mediaGenres);
          }
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

    // NontonGo
    if (sourceId === 'nontongo') {
      return type === 'movie'
        ? `https://www.NontonGo.win/embed/movie/${media.id}`
        : `https://www.NontonGo.win/embed/tv/${media.id}/${selectedSeason}/${selectedEpisode}`;
    }
    // VidSrc
    else if (sourceId === 'vidsrc') {
      const domain = vidsrcDomains[domainIndex];
      let baseUrl = type === 'movie'
        ? `https://${domain}/embed/movie?tmdb=${media.id}`
        : `https://${domain}/embed/tv?tmdb=${media.id}&season=${selectedSeason}&episode=${selectedEpisode}`;
      if (defaultSubtitleLanguage) baseUrl += `&ds_lang=${defaultSubtitleLanguage}`;
      return baseUrl;
    }
    // VidSrc.me
    else if (sourceId === 'vidsrcme') {
      return type === 'movie'
        ? `https://vidsrc.me/embed/movie?tmdb=${media.id}`
        : `https://vidsrc.me/embed/tv?tmdb=${media.id}&s=${selectedSeason}&e=${selectedEpisode}`;
    }
    // MoviesAPI
    else if (sourceId === 'moviesapi') {
      return type === 'movie'
        ? `https://moviesapi.club/movie/${media.id}`
        : `https://moviesapi.club/tv/${media.id}-${selectedSeason}-${selectedEpisode}`;
    }
    // VidSrc.xyz
    else if (sourceId === 'vidsrcxyz') {
      return type === 'movie'
        ? `https://vidsrc.xyz/embed/movie?tmdb=${media.id}`
        : `https://vidsrc.xyz/embed/tv?tmdb=${media.id}&season=${selectedSeason}&episode=${selectedEpisode}`;
    }
    // Smashy Stream
    else if (sourceId === 'smashy') {
      return type === 'movie'
        ? `https://player.smashy.stream/movie/${media.id}`
        : `https://player.smashy.stream/tv/${media.id}?s=${selectedSeason}&e=${selectedEpisode}`;
    }
    // 2Embed (Alt)
    else if (sourceId === '2embedcc') {
      return type === 'movie'
        ? `https://www.2embed.cc/embed/${media.id}`
        : `https://www.2embed.cc/embedtv/${media.id}&s=${selectedSeason}&e=${selectedEpisode}`;
    }
    // Vembed
    else if (sourceId === 'vembed') {
      return type === 'movie'
        ? `https://vembed.click/play/${media.id}`
        : `https://vembed.click/play/${media.id}_s${selectedSeason}_e${selectedEpisode}`;
    }
    // Videasy
    else if (sourceId === 'videasy') {
      return type === 'movie'
        ? `https://player.videasy.net/movie/${media.id}`
        : `https://player.videasy.net/tv/${media.id}/${selectedSeason}/${selectedEpisode}`;
    }
    // AutoEmbed
    else if (sourceId === 'autoembed') {
      return type === 'movie'
        ? `https://test.autoembed.cc/embed/movie/${media.id}`
        : `https://test.autoembed.cc/embed/tv/${media.id}/${selectedSeason}/${selectedEpisode}`;
    }
    // VidFast
    else if (sourceId === 'vidfast') {
      return type === 'movie'
        ? `https://vidfast.pro/movie/${media.id}`
        : `https://vidfast.pro/tv/${media.id}/${selectedSeason}/${selectedEpisode}`;
    }
    // VixSrc
    else if (sourceId === 'vixsrc') {
      return type === 'movie'
        ? `https://vixsrc.to/movie/${media.id}`
        : `https://vixsrc.to/tv/${media.id}/${selectedSeason}/${selectedEpisode}`;
    }
    // VidRock
    else if (sourceId === 'vidrock') {
      return type === 'movie'
        ? `https://vidrock.net/embed/movie/${media.id}`
        : `https://vidrock.net/embed/tv/${media.id}/${selectedSeason}/${selectedEpisode}`;
    }

    return ''; // Fallback
  };
  // --------------------------------------------------

  // --- Share Link Function (updated for new URL structure) ---
  const generateShareLink = () => {
    const baseAppUrl = window.location.origin;
    let shareLink;

    if (type === 'tv') {
      // Use the new TV URL structure with season and episode in path
      shareLink = `${baseAppUrl}/tv/${media.id}/season/${selectedSeason}/episode/${selectedEpisode}`;
    } else {
      // Movie URL structure remains the same
      shareLink = `${baseAppUrl}/movie/${media.id}`;
    }

    // Add query parameters for additional options
    const queryParams = new URLSearchParams();

    // Only include embedded player source in share link if one is selected
    if (embeddedPlayerSources.some(s => s.id === selectedPlayerSource)) {
      queryParams.append('source', selectedPlayerSource);
    }

    // Add query parameters to the URL if any exist
    if (queryParams.toString()) {
      shareLink += `?${queryParams.toString()}`;
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
    localStorage.setItem('player_source', sourceId); // Cache the selection
    // Reset relevant states only if it's an embedded source
    if (embeddedPlayerSources.some(s => s.id === sourceId)) {
      setVideoLoaded(false);
      setPlayerError(null);
      if (sourceId === 'vidsrc') setCurrentDomainIndex(0);
    }
    console.log(`Player source changed to: ${sourceId}`);
  };
  // -----------------------------------

  // --- Cast Member Click Handler ---
  // Optional: Could navigate to a person details page
  const handleCastClick = (personId) => {
    // Navigate to the person details page
    navigate(`/person/${personId}`);
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

        {/* Share Buttons */}
        <div className="share-section">
          <ShareButtons
            url={generateShareLink()}
            title={type === 'movie' ? media.title : media.name}
            currentTheme={currentTheme}
          />
        </div>
      </div>
    );
  };
  // ----------------------------------------

  // --- Render Cast Section ---
  const renderCast = () => {
    if (!cast || cast.length === 0) return null;

    return (
      <div className="cast-section-container">
        <hr className="source-separator" />
        <h4 className="source-section-title">
          Cast
        </h4>

        {isLoadingCast ? (
          <p className="loading-text small">Loading cast...</p>
        ) : (
          <div className="cast-grid">
            {cast.slice(0, 10).map(person => ( // Limit to top 10 for cleaner UI
              <div key={person.id} className="cast-card" onClick={() => handleCastClick(person.id)}>
                <div className="cast-image-wrapper">
                  {person.profile_path ? (
                    <img
                      src={`${IMAGE_BASE_URL}${person.profile_path}`}
                      alt={person.name}
                      className="cast-image"
                    />
                  ) : (
                    <div className="cast-placeholder-image">
                      <span>{person.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className="cast-info">
                  <p className="cast-name">{person.name}</p>
                  <p className="cast-character">{person.character}</p>
                </div>
              </div>
            ))}
          </div>
        )}
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
  // console.log('PlayerModal render:', { media, type, mediaType, id, urlSeason, urlEpisode });

  if (!media) {
    // console.log('PlayerModal: No media provided');
    return null;
  }

  const currentSeasonData = tvDetails?.seasons?.find(s => s.season_number === selectedSeason);
  const episodeCount = currentSeasonData?.episode_count || 0;

  // Add navigate hook
  const navigate = useNavigate();

  const handleSeasonChange = (e) => {
    const newSeason = parseInt(e.target.value, 10);
    setSelectedSeason(newSeason);
    setSelectedEpisode(1);

    // Update URL to reflect the new season and episode
    if (type === 'tv' && media?.id) {
      navigate(`/tv/${media.id}/season/${newSeason}/episode/1`);
    }
  };

  const handleEpisodeChange = (e) => {
    const newEpisode = parseInt(e.target.value, 10);
    setSelectedEpisode(newEpisode);

    // Update URL to reflect the new episode
    if (type === 'tv' && media?.id) {
      navigate(`/tv/${media.id}/season/${selectedSeason}/episode/${newEpisode}`);
    }
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

    const isMovie = type === 'movie';
    const details = isMovie ? movieDetails : tvDetails;

    // Tagline
    const tagline = details?.tagline;

    // Runtime / Status
    let runtime = null;
    let status = details?.status;

    if (isMovie && details?.runtime) {
      const hours = Math.floor(details.runtime / 60);
      const minutes = details.runtime % 60;
      runtime = `${hours}h ${minutes}m`;
    } else if (!isMovie && details?.episode_run_time?.length > 0) {
      // TV shows often have an array of runtimes (min/max)
      const avgRuntime = details.episode_run_time[0];
      const hours = Math.floor(avgRuntime / 60);
      const minutes = avgRuntime % 60;
      runtime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    }

    const mediaOverview = details?.overview || media.overview || 'No description available.';
    const releaseDate = type === 'movie'
      ? (media.release_date && new Date(media.release_date).toLocaleDateString())
      : (media.first_air_date && new Date(media.first_air_date).toLocaleDateString());
    const ratingLabel = "M Rating";
    const ratingValue = media.vote_average ? `${media.vote_average.toFixed(1)}/10` : 'N/A';

    return (
      <>
        <div className="media-details">
          {tagline && <p className="media-tagline">"{tagline}"</p>}
          <div className="media-info-row">
            {releaseDate && <span className="media-info-item"><strong>Released:</strong> {releaseDate}</span>}
            {ratingValue !== 'N/A' && <span className="media-info-item"><strong>{ratingLabel}:</strong> {ratingValue}</span>}
            {runtime && <span className="media-info-item"><strong>Runtime:</strong> {runtime}</span>}
            {status && <span className="media-info-item"><strong>Status:</strong> {status}</span>}
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

        {/* Cast Section after user ratings and additional info */}
        {renderCast()}
      </>
    );
  };

  return (
    <div className={`modal-overlay theme-${currentTheme}-modal`} onClick={onClose}>
      <div
        className={`modal-content theme-${currentTheme}-modal-content`}
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundImage: `url(${darkTexture})`, backgroundRepeat: 'repeat' }}
      >
        {/* 3D particle border backdrop */}
        <ModalBackdrop theme={currentTheme} />

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
                  scrolling="no"
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