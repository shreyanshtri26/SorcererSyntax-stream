import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAlbumDetails } from '../api/api';
import { usePlayer } from '../context/PlayerContext';
import './AlbumDetailView.css';

const AlbumTrackItem = ({ track, trackNumber, onPlayLocal, onSelectArtist }) => {
    const { addToQueue, playNext } = usePlayer();
    if (!track || !track.name) return null;

    const handleTrackClick = () => {
        if (track.uri && onPlayLocal) {
            onPlayLocal(track);
        }
    };

    return (
        <div className="album-track-item track-item">
            <span className="track-number">{trackNumber}.</span>
            <div className="track-info" onClick={handleTrackClick}>
                <span className="track-name">{track.name}</span>
                <div className="track-artists-container">
                    {track.artists?.map((artist, index) => (
                        <span key={artist.id} className="track-artist-name clickable" onClick={(e) => { e.stopPropagation(); onSelectArtist(artist.id); }}>
                            {index > 0 && ', '}
                            {artist.name}
                        </span>
                    ))}
                </div>
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

const AlbumDetailView = ({ albumId, onClose, currentTheme, onSelectArtist, onPlayLocal }) => {
    const navigate = useNavigate();
    const [albumData, setAlbumData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!albumId) return;
        setIsLoading(true);
        getAlbumDetails(albumId)
            .then(data => setAlbumData(data))
            .catch(err => setError(err.message || 'Failed to fetch album'))
            .finally(() => setIsLoading(false));
    }, [albumId]);

    if (isLoading) return <div className="loading-text">Loading album...</div>;
    if (error) return <div className="error-text">{error}</div>;
    if (!albumData) return null;

    return (
        <div className={`album-detail-view-container theme-${currentTheme}`}>
            <div className="music-nav-bar">
                <button className="back-button" onClick={() => navigate(-1)} title="Back">
                    <span className="music-nav-back-icon">←</span> Back
                </button>
            </div>
            <div className="album-detail-view">
                <div className="album-header">
                    <img src={albumData.images?.[0]?.url || 'no-poster.jpg'} alt={albumData.name} className="album-cover-image" />
                    <div className="album-text-info">
                        <span className="album-type">{albumData.album_type}</span>
                        <h3 className="album-name">{albumData.name}</h3>
                        <p className="album-artists">
                            By: {albumData.artists?.map(a => a.name).join(', ')}
                        </p>
                        <p className="album-release">{albumData.release_date}</p>
                    </div>
                </div>

                <div className="album-tracks-list">
                    <h4>Tracks</h4>
                    {albumData.tracks?.items?.map((track, index) => (
                        <AlbumTrackItem
                            key={track.id}
                            track={track}
                            trackNumber={index + 1}
                            onPlayLocal={onPlayLocal}
                            onSelectArtist={onSelectArtist}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AlbumDetailView;