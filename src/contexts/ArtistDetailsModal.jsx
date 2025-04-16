import React, { useState, useEffect, useRef } from 'react';
import { getArtistDetails, getArtistTopTracks, getArtistAlbums, getRelatedArtists, searchMusicVideos } from '../api/api';
import './TrackButtons.css';
import './ArtistDetailsModal.css';

// --- Helper Component for Top Track Item --- 
const ArtistTrackItem = ({ track, onPlayLocal, onSelectAlbum }) => {
    if (!track || !track.name) return null;

    const imageUrl = track.album?.images?.[0]?.url || 'no-poster.jpg';
    const artistsString = track.artists?.map(a => a.name).join(', ');
    const hasAlbum = track.album && track.album.id;

    // Play track in global player when track-info is clicked
    const handleTrackClick = () => {
        if (track.uri && onPlayLocal) {
            onPlayLocal(track);
        } else {
            console.warn("Track has no URI or handler for global play");
        }
    };

    // Navigate to album when album art or album name is clicked
    const handleAlbumClick = (e) => {
        e.stopPropagation();
        if (hasAlbum && onSelectAlbum) {
            onSelectAlbum(track.album.id);
        }
    };

    return (
        <div className="artist-track-item track-item">
            <img 
                src={imageUrl} 
                alt={`Album art for ${track.name}`} 
                onError={(e) => { e.target.onerror = null; e.target.src='no-poster.jpg' }} 
                onClick={hasAlbum && onSelectAlbum ? handleAlbumClick : undefined}
                className={hasAlbum && onSelectAlbum ? "clickable-album-art" : ""}
                title={hasAlbum && onSelectAlbum ? `View album: ${track.album.name}` : ""}
            />
            <div 
                className="track-info" 
                onClick={handleTrackClick}
                title={`Play ${track.name}`}
            >
                <span className="track-name" title={track.name}>{track.name}</span>
                <span className="track-artists" title={artistsString}>{artistsString}</span>
                {track.album && (
                    <span 
                        className={hasAlbum && onSelectAlbum ? "track-album-name clickable-album-name" : "track-album-name"} 
                        title={track.album.name}
                        onClick={hasAlbum && onSelectAlbum ? handleAlbumClick : undefined}
                    >
                        {track.album.name}
                    </span>
                )}
            </div>
        </div>
    );
}

// --- NEW: Helper Component for Album Item --- 
const ArtistAlbumItem = ({ album, onSelectAlbum }) => {
    if (!album || !album.name) return null;
    const imageUrl = album.images?.[0]?.url || 'no-poster.jpg';
    const releaseYear = album.release_date?.substring(0, 4);
    const type = album.album_type?.charAt(0).toUpperCase() + album.album_type?.slice(1);

    return (
        <div className="artist-album-item" onClick={() => onSelectAlbum(album.id)}>
            <img 
                src={imageUrl} 
                alt={`${type}: ${album.name}`} 
                onError={(e) => { e.target.onerror = null; e.target.src='no-poster.jpg' }}
            />
            <div className="album-info">
                <span className="album-name" title={album.name}>{album.name}</span>
                <div className="album-meta">
                   {releaseYear && <span className="album-year">{releaseYear}</span>}
                   {releaseYear && type && <span className="meta-separator">•</span>}
                   {type && <span className="album-type">{type}</span>}
                </div>
            </div>
        </div>
    );
}

// --- Helper Component for Related Artist Item --- 
const RelatedArtistItem = ({ artist, onSelectArtist }) => {
    if (!artist || !artist.name) return null;
    const imageUrl = artist.images?.[0]?.url || 'no-profile.jpg';

    return (
        <div className="related-artist-item" onClick={() => onSelectArtist(artist.id)}>
            <img 
                src={imageUrl} 
                alt={artist.name} 
                onError={(e) => { e.target.onerror = null; e.target.src='no-profile.jpg' }}
            />
            <span className="related-artist-name">{artist.name}</span>
        </div>
    );
}

// --- Main Modal Component --- 
const ArtistDetailsModal = ({ artistId, onClose, currentTheme, onSelectArtist, onSelectAlbum, navStack, onBack, onPlayLocal }) => {
    const [artistData, setArtistData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!artistId) return;
        setIsLoading(true);
        setError(null);
        setArtistData(null);
        console.log(`Fetching details for artist ID: ${artistId}`);
        const fetchDetails = async () => {
            try {
                // Always fetch artist details first
                const artist = await getArtistDetails(artistId);
                let topTracks = [];
                let albums = [];
                let relatedArtists = [];
                try {
                    topTracks = await getArtistTopTracks(artistId, 'IN');
                } catch (e) {
                    console.warn('Failed to fetch top tracks:', e);
                }
                try {
                    albums = await getArtistAlbums(artistId, 10, 'IN');
                } catch (e) {
                    console.warn('Failed to fetch albums:', e);
                }
                try {
                    relatedArtists = await getRelatedArtists(artistId);
                } catch (e) {
                    console.warn('Failed to fetch related artists:', e);
                }
                const data = {
                    ...artist,
                    topTracks,
                    albums,
                    relatedArtists
                };
                console.log("Artist Data Received (with tracks, albums, related):", data);
                setArtistData(data);
            } catch (err) {
                console.error("Error in ArtistDetailsModal fetch:", err);
                setError(err.message || 'Failed to fetch artist details.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
    }, [artistId]);

    const handlePlayLocal = (track) => {
        if (track && onPlayLocal) {
            onPlayLocal(track);
        } else {
            console.warn("No global onPlayLocal handler or invalid track");
        }
    };

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
        return num?.toString() || '0';
    };

    const details = artistData;
    const topTracks = artistData?.topTracks || [];
    const albums = artistData?.albums || [];
    const relatedArtists = artistData?.relatedArtists || [];
    const profileUrl = details?.images?.[0]?.url || 'no-profile.jpg';
    const genres = details?.genres?.slice(0, 3).join(', ') || 'N/A';
    const followers = details?.followers?.total;

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
        <div className={`artist-details-modal-container theme-${currentTheme}`}> 
            {renderNavBar()}
            <div className="artist-details-modal">
                {/* Keep only the close button and navbar back button. Remove any other back/close buttons if present. */}
                <button className="close-button" onClick={onClose}>&times;</button>
                {isLoading && <p className="loading-text">Loading artist details...</p>}
                {error && <p className="error-text">Error: {error}</p>}
                
                {!isLoading && !error && details && (
                    <div className="artist-details-container">
                        <div className="artist-header">
                            <img 
                               src={profileUrl} 
                               alt={details.name} 
                               className="artist-profile-image" 
                               onError={(e) => { e.target.onerror = null; e.target.src='no-profile.jpg'; }}
                            />
                            <div className="artist-info-and-player">
                                <div className="artist-text-info">
                                    <h2 className="artist-name">{details.name}</h2>
                                    <p className="artist-genres">Genres: {genres}</p>
                                    {followers !== undefined && (
                                        <p className="artist-followers">{formatNumber(followers)} Followers</p>
                                    )}
                                </div>
                                <div className="local-player-idle-placeholder">
                                    <i className="fas fa-headphones"></i> 
                                    <span>Click a track below to play</span>
                                </div>
                            </div>
                        </div>

                        {topTracks.length > 0 && (
                            <div className="artist-section">
                                <h3>Top Tracks</h3>
                                <div className="artist-tracks-list">
                                    {topTracks.map((track) => (
                                        <ArtistTrackItem 
                                            key={track.id} 
                                            track={track} 
                                            onSelectAlbum={onSelectAlbum}
                                            onPlayLocal={handlePlayLocal}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {albums.length > 0 && (
                            <div className="artist-section">
                                <h3>Discography</h3>
                                <div className="artist-albums-grid">
                                    {albums.map((album) => (
                                        <ArtistAlbumItem 
                                            key={album.id} 
                                            album={album} 
                                            onSelectAlbum={onSelectAlbum} 
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {relatedArtists.length > 0 && (
                             <div className="artist-section">
                                <h3>Related Artists</h3>
                                <div className="related-artists-grid">
                                    {relatedArtists.map((artist) => (
                                        <RelatedArtistItem 
                                            key={artist.id} 
                                            artist={artist} 
                                            onSelectArtist={onSelectArtist} 
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {!isLoading && !error && !details && (
                    <p className="error-text">Artist details could not be loaded.</p>
                )}
            </div>
        </div>
    );
};

export default ArtistDetailsModal; 