import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getVideos, IMAGE_BASE_URL } from '../api/api';
import useWatchlist from '../hooks/useWatchlist';
import './HeroBillboard.css';

const ORIGINAL_BACKDROP_URL = 'https://image.tmdb.org/t/p/original';

const HeroBillboard = ({ items = [], onMediaClick, currentTheme = 'devil' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  const [showTrailerPreview, setShowTrailerPreview] = useState(false);
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const autoPlayTimerRef = useRef(null);

  const featuredItems = items.filter(item => item.backdrop_path).slice(0, 6);
  const currentItem = featuredItems[currentIndex] || featuredItems[0];
  const mediaType = currentItem?.media_type || (currentItem?.first_air_date ? 'tv' : 'movie');

  // Auto-rotate slides
  useEffect(() => {
    if (featuredItems.length <= 1 || isPaused || showTrailerPreview) return;

    autoPlayTimerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredItems.length);
    }, 7500);

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [featuredItems.length, isPaused, showTrailerPreview, currentIndex]);

  // Reset trailer on slide change
  useEffect(() => {
    setTrailerKey(null);
    setShowTrailerPreview(false);
  }, [currentIndex]);

  const handlePrevSlide = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + featuredItems.length) % featuredItems.length);
  };

  const handleNextSlide = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % featuredItems.length);
  };

  const handlePlayClick = () => {
    if (currentItem) {
      onMediaClick(currentItem, mediaType, false);
    }
  };

  const handleTrailerClick = async (e) => {
    e.stopPropagation();
    if (!currentItem) return;

    if (trailerKey) {
      setShowTrailerPreview(!showTrailerPreview);
      return;
    }

    try {
      const videos = await getVideos(mediaType, currentItem.id);
      if (videos && Array.isArray(videos)) {
        const trailer = videos.find(v => v?.site === 'YouTube' && v?.type === 'Trailer') ||
                        videos.find(v => v?.site === 'YouTube' && v?.type === 'Teaser') ||
                        videos.find(v => v?.site === 'YouTube');
        if (trailer?.key) {
          setTrailerKey(trailer.key);
          setShowTrailerPreview(true);
        } else {
          onMediaClick(currentItem, mediaType, true);
        }
      } else {
        onMediaClick(currentItem, mediaType, true);
      }
    } catch (err) {
      console.error('Error fetching billboard trailer:', err);
      onMediaClick(currentItem, mediaType, true);
    }
  };

  const handleWatchlistToggle = (e) => {
    e.stopPropagation();
    if (currentItem) {
      toggleWatchlist(currentItem, mediaType);
    }
  };

  if (!currentItem) return null;

  const title = currentItem.title || currentItem.name;
  const year = currentItem.release_date?.substring(0, 4) || currentItem.first_air_date?.substring(0, 4) || '';
  const rating = currentItem.vote_average ? currentItem.vote_average.toFixed(1) : '8.5';
  const isBookmarked = isInWatchlist(currentItem.id);

  return (
    <div 
      className={`hero-billboard theme-${currentTheme}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Visuals with Smooth Transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`billboard-bg-${currentItem.id}`}
          className="billboard-backdrop-container"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          {showTrailerPreview && trailerKey ? (
            <div className="billboard-trailer-wrapper">
              <iframe
                className="billboard-trailer-iframe"
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=0&controls=1&loop=1&playlist=${trailerKey}&modestbranding=1&rel=0`}
                title={`${title} Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <button 
                className="close-trailer-preview-btn"
                onClick={() => setShowTrailerPreview(false)}
                title="Close Trailer"
              >
                ✕
              </button>
            </div>
          ) : (
            <img
              src={`${ORIGINAL_BACKDROP_URL}${currentItem.backdrop_path}`}
              alt={title}
              className="billboard-backdrop-image"
            />
          )}

          {/* Luxury Cinematic Gradient Overlays */}
          <div className="billboard-gradient-left"></div>
          <div className="billboard-gradient-bottom"></div>
          <div className="billboard-gradient-top"></div>
          <div className="billboard-ambient-glow"></div>
        </motion.div>
      </AnimatePresence>

      {/* Content Container */}
      <div className="billboard-content-wrapper">
        <motion.div
          key={`billboard-info-${currentItem.id}`}
          className="billboard-info"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Top VIP Badges */}
          <div className="billboard-badge-row">
            <span className="billboard-pill vip-pill">
              <span className="pulse-dot"></span>
              ROOM 305 SPOTLIGHT
            </span>
            <span className="billboard-pill quality-pill">4K ULTRA HD</span>
            <span className="billboard-pill atmos-pill">DOLBY ATMOS</span>
            {currentIndex === 0 && (
              <span className="billboard-pill top-rank-pill">🔥 #1 TRENDING TODAY</span>
            )}
          </div>

          {/* Title */}
          <h1 className="billboard-title">{title}</h1>

          {/* Metadata Row */}
          <div className="billboard-meta-row">
            <span className="billboard-rating">
              <span className="star-icon">★</span> {rating}
            </span>
            {year && <span className="billboard-year">{year}</span>}
            <span className="billboard-type-tag">
              {mediaType === 'tv' ? 'TV SERIES' : 'MOVIE'}
            </span>
            <span className="billboard-age-badge">18+</span>
            <span className="billboard-audio-badge">5.1 SURROUND</span>
          </div>

          {/* Overview / Synopsis */}
          <p className="billboard-overview">
            {currentItem.overview || 'Immerse yourself in stunning 4K cinema and ultra-high bitrate streaming directly from Room 305.'}
          </p>

          {/* Action Buttons */}
          <div className="billboard-actions">
            <button className="billboard-btn play-btn" onClick={handlePlayClick}>
              <span className="btn-icon">▶</span>
              <span className="btn-text">Stream in 4K</span>
            </button>

            <button className="billboard-btn trailer-btn" onClick={handleTrailerClick}>
              <span className="btn-icon">{showTrailerPreview ? '⏸' : '🎬'}</span>
              <span className="btn-text">{showTrailerPreview ? 'Close Preview' : 'Watch Trailer'}</span>
            </button>

            <button 
              className={`billboard-btn watchlist-btn ${isBookmarked ? 'in-watchlist' : ''}`}
              onClick={handleWatchlistToggle}
              title={isBookmarked ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              <span className="btn-icon">{isBookmarked ? '✓' : '＋'}</span>
              <span className="btn-text">{isBookmarked ? 'In Watchlist' : 'My List'}</span>
            </button>
          </div>
        </motion.div>

        {/* Carousel Navigation Controls */}
        <div className="billboard-carousel-controls">
          <button className="carousel-nav-btn prev-btn" onClick={handlePrevSlide} title="Previous">
            ‹
          </button>
          
          <div className="carousel-dots">
            {featuredItems.map((item, idx) => (
              <button
                key={item.id}
                className={`carousel-dot ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
                title={item.title || item.name}
              >
                {idx === currentIndex && <span className="dot-progress-bar"></span>}
              </button>
            ))}
          </div>

          <button className="carousel-nav-btn next-btn" onClick={handleNextSlide} title="Next">
            ›
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroBillboard;
