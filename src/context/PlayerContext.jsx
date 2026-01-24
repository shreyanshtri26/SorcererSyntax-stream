import React, { createContext, useState, useContext, useCallback, useRef, useEffect } from 'react';

// Create the context
const PlayerContext = createContext();

// Create a custom hook for easy consumption
export const usePlayer = () => useContext(PlayerContext);

// Create the provider component
export const PlayerProvider = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState(null); // Holds the Spotify track object
    const [playingVideoId, setPlayingVideoId] = useState(null); // Holds the YouTube video ID
    const [isPlaying, setIsPlaying] = useState(false); // Track playing state
    const [isActive, setIsActive] = useState(false); // Whether the player bar should be visible
    const [isMinimized, setIsMinimized] = useState(false); // For mobile expand/collapse
    const [playbackSource, setPlaybackSource] = useState('spotify'); // 'spotify' or 'youtube'
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Queue State
    const [queue, setQueue] = useState(() => {
        try {
            const saved = localStorage.getItem('music_queue');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    // Refs for player instances to allow global control if needed
    const spotifyPlayerRef = useRef(null);
    const youtubePlayerRef = useRef(null);

    // Sync queue with localStorage
    useEffect(() => {
        localStorage.setItem('music_queue', JSON.stringify(queue));
    }, [queue]);

    // Function to start playing a track (receives Spotify track and YouTube videoId)
    const playTrack = useCallback((track, videoId = null) => {
        console.log('[PlayerContext] Play Track:', track?.name, 'Video ID:', videoId);
        setCurrentTrack(track);
        setPlayingVideoId(videoId);
        setIsActive(true);
        setIsPlaying(true);

        // Prioritize youtube for full song playback if videoId is available
        if (videoId || track?.youtubeId) {
            setPlaybackSource('youtube');
        } else if (track?.uri) {
            setPlaybackSource('spotify');
        }
    }, []);

    // Queue Management
    const addToQueue = useCallback((track) => {
        setQueue(prev => [...prev, track]);
    }, []);

    const playNext = useCallback((track) => {
        setQueue(prev => [track, ...prev]);
    }, []);

    const removeFromQueue = useCallback((trackId) => {
        if (trackId === 'all') {
            setQueue([]);
        } else {
            setQueue(prev => prev.filter(t => t.id !== trackId));
        }
    }, []);

    const playNextInQueue = useCallback(() => {
        if (queue.length > 0) {
            const nextTrack = queue[0];
            setQueue(prev => prev.slice(1));
            playTrack(nextTrack, nextTrack.youtubeId);
        } else {
            console.log('[PlayerContext] Queue is empty');
        }
    }, [queue, playTrack]);

    // Function to stop/clear the player
    const clearPlayer = useCallback(() => {
        console.log('[PlayerContext] Clear Player');
        setCurrentTrack(null);
        setPlayingVideoId(null);
        setIsPlaying(false);
        setIsActive(false);
    }, []);

    // Function to toggle play/pause
    const togglePlay = useCallback(() => {
        setIsPlaying(prevState => !prevState);
    }, []);

    const setSource = useCallback((source) => {
        setPlaybackSource(source);
    }, []);

    const setMinimized = useCallback((val) => {
        setIsMinimized(val);
    }, []);

    // Value provided by the context
    const value = {
        currentTrack,
        playingVideoId,
        playTrack,
        clearPlayer,
        togglePlay,
        isPlaying,
        isActive,
        isMinimized,
        setMinimized,
        playbackSource,
        setSource,
        spotifyPlayerRef,
        youtubePlayerRef,
        setIsPlaying,
        queue,
        addToQueue,
        playNext,
        removeFromQueue,
        playNextInQueue,
        currentTime,
        setCurrentTime,
        duration,
        setDuration
    };

    return (
        <PlayerContext.Provider value={value}>
            {children}
        </PlayerContext.Provider>
    );
};
