import React, { createContext, useState, useContext, useCallback } from 'react';

// Create the context
const PlayerContext = createContext();

// Create a custom hook for easy consumption
export const usePlayer = () => useContext(PlayerContext);

// Create the provider component
export const PlayerProvider = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState(null); // Holds the Spotify track object
    const [playingVideoId, setPlayingVideoId] = useState(null); // Holds the YouTube video ID
    const [isPlaying, setIsPlaying] = useState(false); // Track playing state
    // Add more state later if needed (e.g., isPlaying, playerInstance)

    // Function to start playing a track (receives Spotify track and YouTube videoId)
    const playTrack = useCallback((track, videoId) => {
        console.log('[PlayerContext] Play Track:', track?.name, 'Video ID:', videoId);
        setCurrentTrack(track);
        setPlayingVideoId(videoId);
        setIsPlaying(true);
        // TODO: Interact with player instance if needed later
    }, []);

    // Function to stop/clear the player
    const clearPlayer = useCallback(() => {
        console.log('[PlayerContext] Clear Player');
        setCurrentTrack(null);
        setPlayingVideoId(null);
        setIsPlaying(false);
        // TODO: Stop player instance if needed later
    }, []);

    // Function to toggle play/pause
    const togglePlay = useCallback(() => {
        console.log('[PlayerContext] Toggle Play/Pause');
        setIsPlaying(prevState => !prevState);
        // TODO: Interact with player instance if needed later
    }, []);

    // Value provided by the context
    const value = {
        currentTrack,
        playingVideoId,
        playTrack,
        clearPlayer,
        togglePlay,
        isPlaying
    };

    return (
        <PlayerContext.Provider value={value}>
            {children}
        </PlayerContext.Provider>
    );
}; 