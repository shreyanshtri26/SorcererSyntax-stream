import React, { createContext, useState, useContext, useCallback, useRef, useEffect } from 'react';
import { searchMusicVideos } from '../api/api';

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
    const [playbackSource, setPlaybackSource] = useState('youtube'); // Only 'youtube' now
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const [videoCandidates, setVideoCandidates] = useState([]); // Array of fallback video IDs

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
    const playTrack = useCallback(async (track, videoId = null) => {
        console.log('[PlayerContext] Play Track:', track?.name, 'Video ID:', videoId);
        setCurrentTrack(track);
        setIsActive(true);
        setIsPlaying(true);

        // Default Source Logic
        if (track?.uri) {
            setPlaybackSource('spotify');
        } else {
            setPlaybackSource('youtube');
        }

        // Setup YouTube ID (for toggle option or default playback)
        if (videoId) {
            setPlayingVideoId(videoId);
            setVideoCandidates([]);
        } else if (track?.youtubeId) {
            setPlayingVideoId(track.youtubeId);
            setVideoCandidates([]);
        } else {
            // Background search to ensure YouTube option is available
            setPlayingVideoId(null);
            setVideoCandidates([]);
            try {
                const query = `${track.name} ${track.artists?.map(a => a.name).join(' ')} audio`;
                const videos = await searchMusicVideos(query, 5);
                if (videos && videos.length > 0) {
                    setPlayingVideoId(videos[0].id);
                    setVideoCandidates(videos.map(v => v.id));
                }
            } catch (err) {
                console.error("[PlayerContext] Background video search failed:", err);
            }
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

    const playNextInQueue = useCallback(async () => {
        if (queue.length > 0) {
            const nextTrack = queue[0];
            setQueue(prev => prev.slice(1));

            let vidId = nextTrack.youtubeId;
            if (!vidId) {
                // If no ID, search for it
                try {
                    const query = `${nextTrack.name} ${nextTrack.artists?.map(a => a.name).join(' ')}`;
                    console.log("[PlayerContext] Auto-searching for next track:", query);
                    const videos = await searchMusicVideos(query);
                    vidId = videos?.[0]?.id;
                } catch (err) {
                    console.error("[PlayerContext] Failed to find video for next track:", err);
                }
            }
            // Even if vidId is null, we play the track (PersistentMusicPlayer handles ID-less state if needed, or we might want to skip?)
            // For now, playing it will trigger the "Waiting..." or attempt load
            playTrack(nextTrack, vidId);
        } else {
            console.log('[PlayerContext] Queue is empty');
        }
    }, [queue, playTrack]);

    // Handle Playback Error - Try next candidate
    const handlePlaybackError = useCallback(() => {
        console.warn("[PlayerContext] Playback Error. Candidates left:", videoCandidates.length - 1);

        // Find current index
        const currentIndex = videoCandidates.indexOf(playingVideoId);

        if (currentIndex !== -1 && currentIndex < videoCandidates.length - 1) {
            // Try next candidate
            const nextId = videoCandidates[currentIndex + 1];
            console.log("[PlayerContext] Falling back to next candidate:", nextId);
            setPlayingVideoId(nextId);
        } else {
            // No more candidates, skip track
            console.warn("[PlayerContext] All candidates failed. Skipping track.");
            playNextInQueue();
        }
    }, [playingVideoId, videoCandidates, playNextInQueue]);

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
        setDuration,
        handlePlaybackError
    };

    return (
        <PlayerContext.Provider value={value}>
            {children}
        </PlayerContext.Provider>
    );
};
