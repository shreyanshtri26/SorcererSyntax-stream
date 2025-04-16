import React, { useState, useEffect, useRef } from 'react';
import { getAlbumDetails, searchMusicVideos } from '../api/api';
import './AlbumDetailView.css'; // Import the CSS

// --- Reusable Track Item (or import if identical to ArtistDetailsModal's) ---
const AlbumTrackItem = ({ track, trackNumber, onPlayLocal, onSelectArtist }) => {
    if (!track || !track.name) return null;

    const artistsString = track.artists?.map(a => a.name).join(', ') || 'Unknown Artist';

    // Play track in global player when track-info is clicked
    const handleTrackClick = () => {
        if (track.uri && onPlayLocal) {
            onPlayLocal(track);
        } else {
            console.warn("Track has no URI or handler for local play");
        }
    };

    // Handler to navigate to the first artist of the track
    const handleSelectArtistClick = (e, artistId) => {
        e.stopPropagation(); // Prevent track play
        if (onSelectArtist && artistId) {
            onSelectArtist(artistId);
        }
    };

    return (
        <div className="album-track-item track-item">
            <span className="track-number">{trackNumber}.</span>
            <div 
                className="track-info" 
                onClick={handleTrackClick} // Trigger global play
                title={`Play ${track.name}`}
            >
                <span className="track-name" title={track.name}>{track.name}</span>
                {track.artists && track.artists.length > 0 ? (
                    <div className="track-artists-container">
                        {track.artists.map((artist, index) => (
                            <React.Fragment key={artist.id || index}>
                                {index > 0 && <span>, </span>}
                                <span 
                                    className="track-artist-name clickable" 
                                    onClick={(e) => handleSelectArtistClick(e, artist.id)}
                                    title={`View artist: ${artist.name}`}
                                >
                                    {artist.name}
                                </span>
                            </React.Fragment>
                        ))}
                    </div>
                ) : (
                    <span className="track-artists">Unknown Artist</span>
                )}
            </div>
        </div>
    );
}

// --- Main Album Detail View Component ---
const AlbumDetailView = ({ albumId, onClose, currentTheme, onSelectArtist, navStack, onBack, onPlayLocal }) => {
    const [albumData, setAlbumData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!albumId) return;
        const fetchAlbum = async () => {
            setIsLoading(true);
            setError(null);
            setAlbumData(null);
            console.log(`Fetching details for album ID: ${albumId}`);
            try {
                const data = await getAlbumDetails(albumId);
                if (data.error) {
                    throw new Error(data.error);
                }
                console.log("Album Data Received:", data);
                setAlbumData(data);
            } catch (err) {
                console.error("Error in AlbumDetailView fetch:", err);
                setError(err.message || 'Failed to fetch album details.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAlbum();
    }, [albumId]);

    const imageUrl = albumData?.images?.[0]?.url || 'no-poster.jpg';
    const albumName = albumData?.name || 'Unknown Album';
    const artists = albumData?.artists || [];
    const releaseDate = albumData?.release_date;
    const tracks = albumData?.tracks?.items || [];
    
    // Instead, just call the parent's onPlayLocal handler (which triggers global navigation)
    const handlePlayLocal = (track) => {
        if (track && onPlayLocal) {
            onPlayLocal(track);
        } else {
            console.warn("No global onPlayLocal handler or invalid track");
        }
    };

    // Handler for artist selection
    const handleArtistClick = (artistId) => {
        if (onSelectArtist && artistId) {
            onSelectArtist(artistId);
        }
    };

    // --- Navigation Bar UI ---
    const renderNavBar = () => (
        <div className="music-nav-bar">
            <button
                className="back-button"
                onClick={onBack}
                disabled={!navStack || navStack.length <= 1}
                title="Back"
            >
                <span className="music-nav-back-icon" aria-hidden="true">&#8592;</span> Back
            </button>
            <span className="music-nav-label">
                {navStack && navStack.map((item, idx) => (
                    <span key={idx}>
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        {item.id ? `: ${item.id}` : ''}
                        {idx < navStack.length - 1 ? ' > ' : ''}
                    </span>
                ))}
            </span>
        </div>
    );

    return (
        <div className={`album-detail-view-container theme-${currentTheme}`}> 
            {renderNavBar()}
            <div className="album-detail-view">
                {isLoading && <p className="loading-text">Loading album details...</p>}
                {error && <p className="error-text">Error: {error}</p>}

                {!isLoading && !error && albumData && (
                    <>
                        <div className="album-header">
                            <img 
                                src={imageUrl} 
                                alt={`Cover for ${albumName}`} 
                                className="album-cover-image"
                                onError={(e) => { e.target.onerror = null; e.target.src='no-poster.jpg' }} 
                            />
                            <div className="album-info-and-player">
                                <div className="album-text-info">
                                    <span className="album-type">{albumData.album_type?.charAt(0).toUpperCase() + albumData.album_type?.slice(1) || 'Album'}</span>
                                    <h3 className="album-name">{albumName}</h3>
                                    {artists.length > 0 ? (
                                        <p className="album-artists">
                                            By: {artists.map((artist, index) => (
                                                <React.Fragment key={artist.id || index}>
                                                    {index > 0 && ', '}
                                                    <span 
                                                        className="album-artist-name clickable" 
                                                        onClick={() => handleArtistClick(artist.id)}
                                                        title={`View artist: ${artist.name}`}
                                                    >
                                                        {artist.name}
                                                    </span>
                                                </React.Fragment>
                                            ))}
                                        </p>
                                    ) : (
                                        <p className="album-artists">By: Unknown Artist</p>
                                    )}
                                    {releaseDate && <p className="album-release">Released: {releaseDate}</p>}
                                    <p className="album-total-tracks">{albumData.total_tracks} tracks</p>
                                    
                                    {/* Artist navigation buttons */}
                                    {artists.length > 0 && (
                                        <div className="album-artist-buttons">
                                            {artists.map(artist => (
                                                <button 
                                                    key={artist.id}
                                                    className={`track-button artist-button theme-${currentTheme}-button`}
                                                    onClick={() => handleArtistClick(artist.id)}
                                                    title={`View artist: ${artist.name}`}
                                                >
                                                    <i className="icon-artist">👤</i> {artist.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="local-player-idle-placeholder">
                                    <i className="fas fa-headphones"></i> 
                                    <span>Click a track below to play</span>
                                </div>
                            </div>
                        </div>

                        <div className="album-tracks-list">
                            <h4>Tracks</h4>
                            {tracks.map((track, index) => (
                                <AlbumTrackItem 
                                    key={track.id || index} 
                                    track={track} 
                                    trackNumber={index + 1}
                                    onPlayLocal={handlePlayLocal}
                                    onSelectArtist={onSelectArtist}
                                />
                            ))}
                        </div>
                    </>
                )}
                 {!isLoading && !error && !albumData && (
                     <p className="error-text">Album details could not be loaded.</p>
                )}
            </div>
        </div>
    );
};

export default AlbumDetailView; 