import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayer } from '../context/PlayerContext';
import SpotifyPlayer from '../contexts/SpotifyPlayer';
import MusicPlayer from '../contexts/MusicPlayer';
import './PersistentMusicPlayer.css';

const PersistentMusicPlayer = ({ currentTheme }) => {
    const {
        currentTrack,
        playingVideoId,
        isPlaying,
        togglePlay,
        isActive,
        isMinimized,
        setMinimized,
        playbackSource,
        setSource,
        spotifyPlayerRef,
        youtubePlayerRef,
        queue,
        removeFromQueue,
        playNextInQueue,
        playTrack,
        currentTime,
        setCurrentTime,
        duration,
        setDuration,
    } = usePlayer();

    const [isExpanded, setIsExpanded] = useState(false);

    // Auto-expand on new track if on mobile (optional UX)
    useEffect(() => {
        if (isActive && window.innerWidth <= 768) {
            // setIsExpanded(true);
        }
    }, [currentTrack, isActive]);

    if (!isActive || !currentTrack) return null;

    const hasSpotify = !!currentTrack?.uri;
    const hasYouTube = !!(playingVideoId || currentTrack?.youtubeId);

    const handleNext = () => {
        playNextInQueue();
    };

    const handleSeek = (e) => {
        const time = parseFloat(e.target.value);
        setCurrentTime(time);
        if (playbackSource === 'spotify' && spotifyPlayerRef.current) {
            spotifyPlayerRef.current.seek(time);
        } else if (playbackSource === 'youtube' && youtubePlayerRef.current) {
            youtubePlayerRef.current.seek(time);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                className={`persistent-player theme-${currentTheme} ${isExpanded ? 'expanded' : 'collapsed'}`}
                initial={{ y: 100, opacity: 0 }}
                animate={{
                    y: 0,
                    opacity: 1,
                    height: isExpanded ? '100vh' : 'auto',
                    bottom: isExpanded ? 0 : 0
                }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            >
                {isExpanded && (
                    <button className="close-expanded-btn" onClick={() => setIsExpanded(false)}>
                        <svg viewBox="0 0 24 24" width="32" height="32"><path fill="currentColor" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" /></svg>
                    </button>
                )}

                <div className="player-content-wrapper">
                    {/* Progress Bar */}
                    <div className="player-progress-container">
                        <input
                            type="range"
                            className="player-progress-slider"
                            min="0"
                            max={duration || 100}
                            value={currentTime || 0}
                            onChange={handleSeek}
                        />
                        <div className="player-progress-bar" style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}></div>
                    </div>

                    <div className="player-main-controls">
                        {/* Track Info */}
                        <div className="track-info" onClick={() => setIsExpanded(!isExpanded)}>
                            <div className="track-artwork">
                                <img
                                    src={currentTrack.album?.images?.[0]?.url || currentTrack.thumbnail || 'https://via.placeholder.com/50'}
                                    alt={currentTrack.name}
                                />
                            </div>
                            <div className="track-details">
                                <span className="track-name">{currentTrack.name}</span>
                                <span className="track-artist">
                                    {currentTrack.artists?.map(a => a.name).join(', ') || currentTrack.channel}
                                </span>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="player-controls">
                            <button className="control-btn prev" aria-label="Previous">
                                <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M6 6h2v12H6zm3.5 6L18 18V6z" /></svg>
                            </button>
                            <button className="control-btn play-pause" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
                                {isPlaying ? (
                                    <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M8 5v14l11-7z" /></svg>
                                )}
                            </button>
                            <button className="control-btn next" onClick={handleNext} aria-label="Next">
                                <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
                            </button>
                        </div>

                        {/* Source Toggle & Extra */}
                        <div className="player-extra">
                            <div className="source-toggle-group">
                                {hasSpotify && (
                                    <button
                                        className={`source-btn spotify ${playbackSource === 'spotify' ? 'active' : ''}`}
                                        onClick={() => setSource('spotify')}
                                        title="Switch to Spotify"
                                    >
                                        <i className="fab fa-spotify"></i>
                                    </button>
                                )}
                                {hasYouTube && (
                                    <button
                                        className={`source-btn youtube ${playbackSource === 'youtube' ? 'active' : ''}`}
                                        onClick={() => setSource('youtube')}
                                        title="Switch to YouTube"
                                    >
                                        <i className="fab fa-youtube"></i>
                                    </button>
                                )}
                            </div>

                            <button className="expand-btn" onClick={() => setIsExpanded(!isExpanded)}>
                                <svg viewBox="0 0 24 24" width="24" height="24" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
                                    <path fill="currentColor" d="M7 14l5-5 5 5z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Expanded View Content */}
                    {isExpanded && (
                        <div className="expanded-view-grid">
                            <div className="player-rendering-panel">
                                <div className="player-render-area">
                                    {playbackSource === 'spotify' && hasSpotify ? (
                                        <SpotifyPlayer
                                            ref={spotifyPlayerRef}
                                            uri={currentTrack.uri}
                                            key={`spotify-${currentTrack.id}`}
                                        />
                                    ) : (
                                        <MusicPlayer
                                            ref={youtubePlayerRef}
                                            videoId={playingVideoId || currentTrack.youtubeId}
                                            key={`youtube-${playingVideoId || currentTrack.id}`}
                                            onEnd={playNextInQueue}
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="queue-panel">
                                <div className="queue-header">
                                    <h3>Up Next</h3>
                                    <button className="clear-queue-btn" onClick={() => removeFromQueue('all')}>Clear All</button>
                                </div>
                                <div className="queue-list">
                                    {queue.length > 0 ? (
                                        queue.map((track, index) => (
                                            <div key={`${track.id}-${index}`} className="queue-item">
                                                <img src={track.album?.images?.[2]?.url || track.thumbnail} alt="" />
                                                <div className="item-info">
                                                    <span className="name">{track.name}</span>
                                                    <span className="artist">{track.artists?.map(a => a.name).join(', ')}</span>
                                                </div>
                                                <div className="item-actions">
                                                    <button className="queue-action-btn play" onClick={() => playTrack(track, track.youtubeId)} title="Play Now">
                                                        <i className="fas fa-play"></i>
                                                    </button>
                                                    <button className="queue-action-btn remove" onClick={() => removeFromQueue(track.id)} title="Remove from Queue">
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-queue">Queue is empty</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PersistentMusicPlayer;
