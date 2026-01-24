import React, { useState, useEffect } from 'react';
import { getMovieGenres, getTVGenres, getVideos, IMAGE_BASE_URL } from '../api/api';

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
                        // Safe navigation for v type
                        const trailer = videos.find(v => v?.site === 'YouTube' && v?.type === 'Trailer') ||
                            videos.find(v => v?.site === 'YouTube' && v?.type === 'Teaser') ||
                            videos.find(v => v?.site === 'YouTube' && v?.type === 'Clip');
                        if (trailer?.key) {
                            // console.log(`Found trailer key: ${trailer.key} for ${item.title || item.name}`);
                            setTrailerKey(trailer.key);
                        } else {
                            // console.log(`No suitable YouTube preview found for ${item.title || item.name}`);
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

export default MediaItem;
