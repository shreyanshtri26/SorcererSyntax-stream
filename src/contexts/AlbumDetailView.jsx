import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAlbumDetails } from '../api/api';
import { usePlayer } from '../context/PlayerContext';
import './AlbumDetailView.css';

const AlbumDetailView = ({ albumId, onClose, currentTheme, onSelectArtist, onPlayLocal }) => {
    const navigate = useNavigate();
    const { addToQueue, playNext } = usePlayer();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!albumId) return;
        setIsLoading(true);
        getAlbumDetails(albumId)
            .then(res => setData(res))
            .catch(err => console.error("Album Load Error:", err))
            .finally(() => setIsLoading(false));
    }, [albumId]);

    if (isLoading) return <div className="loading-text">Spinning Records...</div>;
    if (!data) return null;

    return (
        <div className={`album-detail-view-container theme-${currentTheme}`}>
            <div className="album-detail-view">
                {/* Nav */}
                <div className="modal-header-nav">
                    <button className="back-button" onClick={() => navigate(-1)}>
                        <span>←</span> Back
                    </button>
                    <button className="close-button-top" onClick={onClose || (() => navigate('/music'))}>&times;</button>
                </div>

                {/* Hero */}
                <div className="album-header">
                    <img src={data.images?.[0]?.url} alt="" className="album-cover-image" />
                    <div className="album-text-info">
                        <span className="album-type">{data.album_type}</span>
                        <h3 className="album-name">{data.name}</h3>
                        <p className="album-artists">
                            {data.artists?.map(a => (
                                <span key={a.id} className="clickable" onClick={() => onSelectArtist(a.id)}>
                                    {a.name}
                                </span>
                            ))}
                        </p>
                        <p className="album-release">{data.release_date} • {data.tracks?.total} songs</p>
                    </div>
                </div>

                {/* Tracks */}
                <div className="album-tracks-list">
                    <h4>Tracklist</h4>
                    {data.tracks?.items?.map((track, idx) => (
                        <div key={track.id} className="track-item" onClick={() => onPlayLocal(track)}>
                            <span className="track-number">{idx + 1}</span>
                            <div className="track-info">
                                <p className="track-name">{track.name}</p>
                                <p className="track-artist-names">{track.artists.map(a => a.name).join(', ')}</p>
                            </div>
                            <div className="track-actions">
                                <button className="yt-play-mini" onClick={(e) => { e.stopPropagation(); onPlayLocal(track); }}>▶</button>
                                <button className="yt-play-mini" onClick={(e) => { e.stopPropagation(); addToQueue(track); }}>+</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AlbumDetailView;