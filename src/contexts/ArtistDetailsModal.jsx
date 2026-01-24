import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getArtistDetails, getArtistTopTracks, getArtistAlbums, getRelatedArtists } from '../api/api';
import { usePlayer } from '../context/PlayerContext';
import './TrackButtons.css';
import './ArtistDetailsModal.css';

// --- Helper Component for Top Track Item --- 
const ArtistTrackItem = ({ track, onPlayLocal, onSelectAlbum }) => {
    const { addToQueue, playNext } = usePlayer();
    if (!track || !track.name) return null;

    const imageUrl = track.album?.images?.[0]?.url || 'no-poster.jpg';
    const artistsString = track.artists?.map(a => a.name).join(', ');
    const hasAlbum = track.album && track.album.id;

    const handleTrackClick = () => {
        if (track.uri && onPlayLocal) {
            onPlayLocal(track);
        }
    };

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
                alt={track.name}
                className={hasAlbum ? "clickable-album-art" : ""}
                onClick={hasAlbum ? handleAlbumClick : undefined}
                onError={(e) => { e.target.onerror = null; e.target.src = 'no-poster.jpg' }}
            />
            <div className="track-info" onClick={handleTrackClick}>
                <span className="track-name">{track.name}</span>
                <span className="track-artists">{artistsString}</span>
                {track.album && (
                    <span
                        className="track-album-name clickable-album-name"
                        onClick={handleAlbumClick}
                    >
                        {track.album.name}
                    </span>
                )}
            </div>
            <div className="track-actions-buttons">
                <button
                    className="yt-play-mini"
                    onClick={(e) => { e.stopPropagation(); onPlayLocal(track, track.youtubeId); }}
                    title="Play on YouTube"
                >
                    <i className="fab fa-youtube"></i>
                </button>
                <button className="mini-btn" onClick={() => playNext(track)} title="Play Next">
                    <i className="fas fa-step-forward"></i>
                </button>
                <button className="mini-btn" onClick={() => addToQueue(track)} title="Add to Queue">
                    <i className="fas fa-list-ul"></i>
                </button>
            </div>
        </div>
    );
};

// --- Helper Component for Album Item --- 
const ArtistAlbumItem = ({ album, onSelectAlbum }) => {
    if (!album || !album.name) return null;
    const imageUrl = album.images?.[0]?.url || 'no-poster.jpg';
    return (
        <div className="artist-album-item" onClick={() => onSelectAlbum(album.id)}>
            <img src={imageUrl} alt={album.name} onError={(e) => { e.target.onerror = null; e.target.src = 'no-poster.jpg' }} />
            <div className="album-info">
                <span className="album-name">{album.name}</span>
                <span className="album-year">{album.release_date?.substring(0, 4)}</span>
            </div>
        </div>
    );
};

// --- Helper Component for Related Artist Item --- 
const RelatedArtistItem = ({ artist, onSelectArtist }) => {
    if (!artist || !artist.name) return null;
    const imageUrl = artist.images?.[0]?.url || 'no-profile.jpg';
    return (
        <div className="related-artist-item" onClick={() => onSelectArtist(artist.id)}>
            <img src={imageUrl} alt={artist.name} onError={(e) => { e.target.onerror = null; e.target.src = 'no-profile.jpg' }} />
            <span className="related-artist-name">{artist.name}</span>
        </div>
    );
};

// --- Main Modal Component --- 
const ArtistDetailsModal = ({ artistId, onClose, currentTheme, onSelectArtist, onSelectAlbum, onPlayLocal }) => {
    const navigate = useNavigate();
    const [artistData, setArtistData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!artistId) return;
        setIsLoading(true);
        const fetchDetails = async () => {
            try {
                const artist = await getArtistDetails(artistId);
                const topTracks = await getArtistTopTracks(artistId, 'IN').catch(() => []);
                const albums = await getArtistAlbums(artistId, 10, 'IN').catch(() => []);
                const relatedArtistsRaw = await getRelatedArtists(artistId).catch(() => []);
                const relatedArtists = relatedArtistsRaw.filter(a => !a.name?.toLowerCase().includes('weeknd'));
                setArtistData({ ...artist, topTracks, albums, relatedArtists });
            } catch (err) {
                setError(err.message || 'Failed to fetch artist details');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetails();
    }, [artistId]);

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
        return num?.toString() || '0';
    };

    if (isLoading) return <div className="loading-text">Loading artist...</div>;
    if (error) return <div className="error-text">{error}</div>;
    if (!artistData) return null;

    return (
        <div className={`artist-details-modal-container theme-${currentTheme}`}>
            <div className="music-nav-bar">
                <button className="back-button" onClick={() => navigate(-1)} title="Back">
                    <span className="music-nav-back-icon">←</span> Back
                </button>
            </div>
            <div className="artist-details-modal">
                <button className="close-button" onClick={onClose}>&times;</button>
                <div className="artist-header">
                    <img src={artistData.images?.[0]?.url || 'no-profile.jpg'} alt={artistData.name} className="artist-profile-image" />
                    <div className="artist-text-info">
                        <h2 className="artist-name">{artistData.name}</h2>
                        <p className="artist-genres">{artistData.genres?.slice(0, 3).join(', ')}</p>
                        <p className="artist-followers">{formatNumber(artistData.followers?.total)} Followers</p>
                    </div>
                </div>

                <div className="artist-section">
                    <h3>Top Tracks</h3>
                    <div className="artist-tracks-list">
                        {artistData.topTracks.map(track => (
                            <ArtistTrackItem
                                key={track.id}
                                track={track}
                                onSelectAlbum={onSelectAlbum}
                                onPlayLocal={onPlayLocal}
                            />
                        ))}
                    </div>
                </div>

                <div className="artist-section">
                    <h3>Discography</h3>
                    <div className="artist-albums-grid">
                        {artistData.albums.map(album => (
                            <ArtistAlbumItem key={album.id} album={album} onSelectAlbum={onSelectAlbum} />
                        ))}
                    </div>
                </div>

                <div className="artist-section">
                    <h3>Related Artists</h3>
                    <div className="related-artists-grid">
                        {artistData.relatedArtists.map(artist => (
                            <RelatedArtistItem key={artist.id} artist={artist} onSelectArtist={onSelectArtist} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArtistDetailsModal;