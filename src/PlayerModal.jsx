import React, { useState, useEffect, useRef } from 'react';
import { getTVShowDetails, getVideos } from './api'; // [EDIT] Removed getVideos import
import './PlayerModal.css';
import { useParams } from 'react-router-dom';
import ReactPlayer from 'react-player/youtube'; // Import a player

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
      // existing fetching logic
    };
    
    fetchTrailer();
  }, [mediaType, id, media, type]);
  
  return { loading, error, trailerKey };
}

const PlayerModal = ({ media, type, onClose, defaultSubtitleLanguage = '', showTrailer = false }) => {
  const [tvDetails, setTvDetails] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [playerError, setPlayerError] = useState(null);
  const [currentDomainIndex, setCurrentDomainIndex] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const iframeRef = useRef(null);
  const { mediaType, id } = useParams(); // Get type and id from URL
  const { loading, error, trailerKey } = useTrailerFetching(mediaType, id, media, type);
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(showTrailer);

  // Available domains to try in order
  const vidsrcDomains = [
    'vidsrc.xyz',
    'vidsrc.in',
    'vidsrc.pm',
    'vidsrc.net'
  ];

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

  const getVideoUrl = (domainIndex = currentDomainIndex) => {
    const domain = vidsrcDomains[domainIndex];
    let baseUrl = '';

    if (type === 'movie') {
      baseUrl = `https://${domain}/embed/movie?tmdb=${media.id}`;
    } else if (type === 'tv') {
      baseUrl = `https://${domain}/embed/tv?tmdb=${media.id}&season=${selectedSeason}&episode=${selectedEpisode}`;
    }

    if (!baseUrl) return '';

    // Append default subtitle language if provided
    if (defaultSubtitleLanguage) {
      baseUrl += `&ds_lang=${defaultSubtitleLanguage}`;
    }

    return baseUrl;
  };

  const handleIframeError = () => {
    // Only handle errors for the main content iframe
    if (currentDomainIndex < vidsrcDomains.length - 1) {
      setCurrentDomainIndex(currentDomainIndex + 1);
    } else {
      setPlayerError('Unable to load video from any available source.');
    }
  };
  
  const handleIframeLoad = () => {
    // Only handle load for the main content iframe
    setVideoLoaded(true);
    setPlayerError(null);
  };

  if (!media) return null;

  const currentSeasonData = tvDetails?.seasons?.find(s => s.season_number === selectedSeason);
  const episodeCount = currentSeasonData?.episode_count || 0;

  const handleSeasonChange = (e) => {
    const seasonNum = parseInt(e.target.value, 10);
    setSelectedSeason(seasonNum);
    setSelectedEpisode(1); // Reset episode to 1 when season changes
  };

  const handleEpisodeChange = (e) => {
    setSelectedEpisode(parseInt(e.target.value, 10));
  };

  const vidSrcUrl = getVideoUrl(); // [EDIT] Simplified vidSrcUrl assignment

  // Toggle between trailer and player
  const toggleTrailer = () => {
    setIsPlayingTrailer(!isPlayingTrailer);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}> 
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2 className="modal-title">{type === 'movie' ? media.title : media.name}</h2>
        
        {/* Add trailer toggle button */}
        {trailerKey && (
          <button 
            className="trailer-modal-btn" 
            onClick={toggleTrailer}
          >
            {isPlayingTrailer ? "Watch Full Content" : "Watch Trailer"}
          </button>
        )}
        
        {/* TV Show Season/Episode Selection */}
        {type === 'tv' && !isPlayingTrailer && (
          <div className="tv-controls">
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

        {/* Conditional rendering based on trailer state */}
        {isPlayingTrailer && trailerKey ? (
          <div className="player-wrapper">
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
        ) : isPlayingTrailer && loading ? (
          <div className="player-wrapper">
            <div className="trailer-loading">Loading trailer...</div>
          </div>
        ) : isPlayingTrailer && error ? (
          <div className="player-wrapper">
            <div className="trailer-error">{error}</div>
          </div>
        ) : (
          /* Original Player Area */
          <div className="player-wrapper">
            {playerError ? (
                <div className="player-message error-message">
                    <p>{playerError}</p>
                </div>
            ) : vidSrcUrl ? (
              <>
                {currentDomainIndex > 0 && !videoLoaded && (
                  <div className="player-message">
                    <p>Trying alternative source ({vidsrcDomains[currentDomainIndex]})...</p>
                  </div>
                )}
                <iframe
                  ref={iframeRef}
                  src={vidSrcUrl}
                  width="100%"
                  height="100%" 
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; encrypted-media"
                  title="Video Player"
                  onError={handleIframeError}
                  onLoad={handleIframeLoad}
                  key={`${type}-${media.id}-${selectedSeason}-${selectedEpisode}-${currentDomainIndex}`}
                ></iframe>
              </>
            ) : (
              <p className="error-text">Could not load player URL.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerModal; 