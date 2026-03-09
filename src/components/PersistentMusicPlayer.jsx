import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayer } from '../context/PlayerContext';
import MusicPlayer from '../contexts/MusicPlayer';
import SpotifyPlayer from '../contexts/SpotifyPlayer';
import AudioVisualizer from './three/AudioVisualizer';
import './PersistentMusicPlayer.css';

const PersistentMusicPlayer = ({ currentTheme }) => {
    const {
        currentTrack,
        playingVideoId,
        isPlaying,
        togglePlay,
        isActive,
        playbackSource,
        setSource,
        spotifyPlayerRef,
        youtubePlayerRef,
        queue,
        removeFromQueue,
        playNextInQueue,
        playTrack,
        currentTime,
        duration,
        setCurrentTime,
        handlePlaybackError
    } = usePlayer();

    const [isExpanded, setIsExpanded] = useState(false);

    if (!isActive || !currentTrack) return null;

    const handleSeek = (e) => {
        const time = parseFloat(e.target.value);
        setCurrentTime(time);
        if (playbackSource === 'spotify' && spotifyPlayerRef.current) spotifyPlayerRef.current.seek(time);
        else if (youtubePlayerRef.current) youtubePlayerRef.current.seek(time);
    };

    const hasSpotify = !!currentTrack.uri;

    return (
        <AnimatePresence>
            <motion.div
                className={`persistent-player theme-${currentTheme} ${isExpanded ? 'expanded' : 'minimized'}`}
                initial={{ y: 100 }}
                animate={{ y: 0, height: isExpanded ? '100vh' : 'auto' }}
                exit={{ y: 200 }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            >
                {/* 3D Audio Visualizer behind player */}
                <AudioVisualizer theme={currentTheme} isPlaying={isPlaying} />

                <div className="player-content-wrapper">

                    {/* Progress Bar (Global) */}
                    <div className="player-progress-container">
                        <input
                            type="range"
                            className="player-progress-slider"
                            min="0"
                            max={duration || 100}
                            value={currentTime || 0}
                            onChange={handleSeek}
                        />
                        <div className="player-progress-bar" style={{ width: `${(currentTime / (duration || 1)) * 100}%` }} />
                    </div>

                    <div className="player-main-controls">
                        {/* 1. Meta / Art */}
                        <div className="track-info" onClick={() => setIsExpanded(!isExpanded)}>
                            <div className="track-artwork">
                                <img
                                    src={currentTrack.album?.images?.[0]?.url || currentTrack.thumbnail || 'no-poster.jpg'}
                                    alt={currentTrack.name}
                                />
                            </div>
                            <div className="track-details">
                                <span className="track-name">{currentTrack.name}</span>
                                <span className="track-artist">{currentTrack.artists?.map(a => a.name).join(', ') || currentTrack.channel}</span>
                            </div>
                        </div>

                        {/* 2. Central Buttons - REMOVED */}

                        {/* 3. Right Side Actions */}
                        <div className="player-extra">
                            <div className="source-toggle-group">
                                {hasSpotify && (
                                    <button className={`src-btn ${playbackSource === 'spotify' ? 'active' : ''}`} onClick={() => setSource('spotify')}>
                                        Spotify
                                    </button>
                                )}
                                <button className={`src-btn ${playbackSource === 'youtube' ? 'active' : ''}`} onClick={() => setSource('youtube')}>
                                    YouTube
                                </button>
                            </div>
                            <button className="expand-trigger" onClick={() => setIsExpanded(!isExpanded)}>
                                {isExpanded ? '▼' : '▲'}
                            </button>
                        </div>
                    </div>

                    {/* 4. Expanded View */}
                    {isExpanded && (
                        <div className="expanded-view-grid">
                            <div className="player-render-column">
                                <div className="player-render-area">
                                    {playbackSource === 'spotify' ? (
                                        <SpotifyPlayer ref={spotifyPlayerRef} uri={currentTrack.uri} />
                                    ) : (
                                        <MusicPlayer
                                            ref={youtubePlayerRef}
                                            videoId={playingVideoId || currentTrack.youtubeId}
                                            onEnd={playNextInQueue}
                                            onError={handlePlaybackError}
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="queue-column">
                                <div className="queue-header">
                                    <h3>Next in Queue</h3>
                                    <button className="clear-btn" onClick={() => removeFromQueue('all')}>Clear All</button>
                                </div>
                                <div className="queue-list">
                                    {queue.map((t, idx) => (
                                        <div key={`${t.id}-${idx}`} className="queue-item">
                                            <img src={t.thumbnail || (t.album?.images?.[0]?.url)} alt="" />
                                            <div className="q-info">
                                                <p className="q-name">{t.name}</p>
                                                <p className="q-artist">{t.artists?.[0]?.name}</p>
                                            </div>
                                            <button className="q-play" onClick={() => playTrack(t)}>▶</button>
                                        </div>
                                    ))}
                                    {queue.length === 0 && <p className="empty-msg">Queue is empty</p>}
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
