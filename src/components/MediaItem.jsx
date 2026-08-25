import React, { useState, useEffect } from 'react';
import { getMovieGenres, getTVGenres, getVideos, IMAGE_BASE_URL } from '../api/api';
import useWatchlist from '../hooks/useWatchlist';
import useContinueWatching from '../hooks/useContinueWatching';

const MediaItem = ({ item, type, onClick, currentTheme = 'devil' }) => {
    // Get actual type from item.media_type (from multi-search) or fall back to passed type
    const mediaType = item.media_type || type;
    const [genres, setGenres] = useState([]);
    const [isHovered, setIsHovered] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [trailerKey, setTrailerKey] = useState(null);
    const [isLoadingTrailer, setIsLoadingTrailer] = useState(false);
    const { isInWatchlist, toggleWatchlist } = useWatchlist();
    const { getItemProgress } = useContinueWatching();

    const isBookmarked = isInWatchlist(item?.id);
    const progress = getItemProgress(item?.id);

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
        let isMounted = true;
        if (isHovered && item && item.id && mediaType !== 'person') {
            setIsLoadingTrailer(true);
            setTrailerKey(null);
            getVideos(mediaType, item.id)
                .then(videos => {
                    if (isMounted && videos && Array.isArray(videos)) {
                        const trailer = videos.find(v => v?.site === 'YouTube' && v?.type === 'Trailer') ||
                            videos.find(v => v?.site === 'YouTube' && v?.type === 'Teaser') ||
                            videos.find(v => v?.site === 'YouTube' && v?.type === 'Clip');
                        if (trailer?.key) {
                            setTrailerKey(trailer.key);
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
            isMounted = false;
        };
    }, [isHovered, item, mediaType]);

    const handleClick = (e) => {
        if (e.target.closest('.hover-buttons button') || e.target.closest('.card-watchlist-btn')) {
            return;
        }
        onClick(item, mediaType, false);
    };

    const handlePlayClick = (e) => {
        e.stopPropagation();
        onClick(item, mediaType, false);
    };

    const handleTrailerClick = (e) => {
        e.stopPropagation();
        onClick(item, mediaType, true);
    };

    const handleBookmarkClick = (e) => {
        e.stopPropagation();
        toggleWatchlist(item, mediaType);
    };

    const handleLikeClick = (e) => {
        e.stopPropagation();
        setIsLiked(!isLiked);
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    const isFromSearch = item.media_type !== undefined;
    const matchScore = item.vote_average ? Math.min(99, Math.max(70, Math.round(item.vote_average * 10 + 8))) : 95;

    // Person-specific rendering
    if (mediaType === 'person') {
        return (
            <div className="media-item person-item" onClick={handleClick}>
                <div className="person-image-wrapper">
                    <img
                        src={item.profile_path ? `${IMAGE_BASE_URL}${item.profile_path}` : 'no-profile.jpg'}
                        alt={item.name}
                        onError={(e) => { e.target.onerror = null; e.target.src = 'no-poster.jpg'; }}
                        loading="lazy"
                    />
                    <div className="person-ambient-glow"></div>
                </div>
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

    // Render Theme-Authentic Brand Ribbon Badges
    const renderBrandBadge = () => {
        if (currentTheme === 'devil') {
            return (
                <div className="theme-brand-badge devil-badge" title="Top 10 Worldwide">
                    <span className="badge-ribbon-red">TOP 10</span>
                </div>
            );
        } else if (currentTheme === 'angel') {
            return (
                <div className="theme-brand-badge angel-badge" title="Cinema VIP Selection">
                    <span className="badge-prime-text">★ VIP</span>
                </div>
            );
        } else if (currentTheme === 'hannibal') {
            return (
                <div className="theme-brand-badge hannibal-badge" title="Cinema Exclusive Original">
                    <span className="badge-hulu-text">ORIGINAL</span>
                </div>
            );
        }
        return null;
    };

    // Enhanced Luxury Media Card (Netflix, Prime & Hulu Signature Detail)
    return (
        <div
            className={`media-item ${isHovered ? 'hovered' : ''} theme-card-${currentTheme}`}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Dynamic Card Ambient Glow */}
            <div className="media-item-ambilight"></div>

            <div className="poster-container">
                {/* Brand Ribbon Badge (TOP 10 / Prime / Hulu) */}
                {renderBrandBadge()}

                {/* Quality & Rating Corner Badges */}
                <div className="card-top-badges">
                    <span className="badge-4k">4K</span>
                    {item.vote_average >= 7.5 && (
                        <span className="badge-featured">★ {item.vote_average.toFixed(1)}</span>
                    )}
                </div>

                {/* Quick 1-Click Bookmark Icon */}
                <button
                    className={`card-watchlist-btn ${isBookmarked ? 'active' : ''}`}
                    onClick={handleBookmarkClick}
                    title={isBookmarked ? 'Remove from My List' : 'Add to My List'}
                    aria-label="Toggle Watchlist"
                >
                    {isBookmarked ? '★' : '☆'}
                </button>

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
                        />
                    </div>
                ) : (
                    <img
                        src={item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : 'no-poster.jpg'}
                        alt={mediaType === 'movie' ? item.title : item.name}
                        onError={(e) => { e.target.onerror = null; e.target.src = 'no-poster.jpg'; }}
                        loading="lazy"
                    />
                )}

                {/* Netflix Continue Watching Progress Bar */}
                {progress > 0 && (
                    <div className="card-continue-progress-bar" title={`${progress}% watched`}>
                        <div className="continue-progress-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                )}

                {isHovered && isLoadingTrailer && !trailerKey && (
                    <div className="trailer-loading-indicator">
                        <span className="mini-spinner"></span>
                        Loading 4K Preview...
                    </div>
                )}

                {/* Expanded Netflix/Prime-style hover popup overlay */}
                <div className="netflix-hover-content">
                    <div className="hover-top-content">
                        <h3>{mediaType === 'movie' ? item.title : item.name}</h3>
                        
                        {/* Signature Action Buttons Row (Play, Add, Like, More) */}
                        <div className="hover-buttons">
                            <button className="play-btn" onClick={handlePlayClick} aria-label="Play" title="Stream in 4K">
                                <span>▶</span>
                            </button>
                            <button 
                                className={`card-hover-bookmark ${isBookmarked ? 'bookmarked' : ''}`}
                                onClick={handleBookmarkClick}
                                aria-label="My List"
                                title={isBookmarked ? "Remove from List" : "Add to My List"}
                            >
                                <span>{isBookmarked ? '✓' : '＋'}</span>
                            </button>
                            <button 
                                className={`card-hover-like ${isLiked ? 'liked' : ''}`}
                                onClick={handleLikeClick}
                                aria-label="Like"
                                title={isLiked ? "Liked" : "I like this"}
                            >
                                <span>{isLiked ? '👍' : '👍'}</span>
                            </button>
                            <button className="trailer-btn" onClick={handleTrailerClick} aria-label="Trailer" title="Watch Trailer">
                                <span>🎬</span>
                            </button>
                        </div>
                    </div>

                    <div className="hover-bottom-content">
                        <div className="meta-info">
                            <span className="match-score">{matchScore}% Match</span>
                            <span className="age-rating">16+</span>
                            <span className="year">{mediaType === 'movie'
                                ? (item.release_date ? item.release_date.substring(0, 4) : '2024')
                                : (item.first_air_date ? item.first_air_date.substring(0, 4) : '2024')
                            }</span>
                            <span className="quality-pill-mini">4K Ultra HD</span>
                            <span className="audio-tag">Dolby 5.1</span>
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
                <div className="media-info-bottom">
                    {item.vote_average > 0 && (
                        <div className="rating">★ {item.vote_average.toFixed(1)}</div>
                    )}
                    <span className="media-year-badge">
                        {mediaType === 'movie' 
                            ? (item.release_date ? item.release_date.substring(0, 4) : '') 
                            : (item.first_air_date ? item.first_air_date.substring(0, 4) : '')}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default MediaItem;
