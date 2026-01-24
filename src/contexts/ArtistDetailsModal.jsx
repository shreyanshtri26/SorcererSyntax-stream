import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getArtistDetails, getArtistTopTracks, getArtistAlbums, getRelatedArtists } from '../api/api';
import { usePlayer } from '../context/PlayerContext';
import './ArtistDetailsModal.css';

const ArtistDetailsModal = ({ artistId, onClose, currentTheme, onSelectArtist, onSelectAlbum, onPlayLocal }) => {
    const navigate = useNavigate();
    const { addToQueue, playNext } = usePlayer();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!artistId) return;
        const fetchAll = async () => {
            setIsLoading(true);
            try {
                const [details, topTracks, albums, related] = await Promise.all([
                    getArtistDetails(artistId),
                    getArtistTopTracks(artistId, 'IN'),
                    getArtistAlbums(artistId, 10, 'IN'),
                    getRelatedArtists(artistId)
                ]);

                setData({
                    ...details,
                    topTracks: (topTracks || []).slice(0, 5),
                    albums: (albums || []).slice(0, 10),
                    related: (related || []).slice(0, 6)
                });
            } catch (e) {
                console.error("Artist Load Error:", e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAll();
    }, [artistId]);

    if (isLoading) return <div className="loading-text">Summoning Artist...</div>;
    if (!data) return null;

    return (
        <div className={`artist-details-modal-container theme-${currentTheme}`}>
            <div className="artist-details-modal">
                {/* Navigation */}
                <div className="modal-header-nav">
                    <button className="back-button" onClick={() => navigate(-1)}>
                        <span>←</span> Back
                    </button>
                    <button className="close-button-top" onClick={onClose || (() => navigate('/music'))}>&times;</button>
                </div>

                {/* Hero Header */}
                <div className="artist-header">
                    <img src={data.images?.[0]?.url} alt="" className="artist-profile-image" />
                    <div className="artist-text-info">
                        <p className="artist-genres">{data.genres?.slice(0, 2).join(' / ')}</p>
                        <h2 className="artist-name">{data.name}</h2>
                        <p className="artist-followers">{data.followers?.total.toLocaleString()} Monthly Listeners</p>
                    </div>
                </div>

                {/* Top Tracks */}
                <div className="artist-section">
                    <h3>Popular Songs</h3>
                    <div className="artist-tracks-list">
                        {data.topTracks.map(track => (
                            <div key={track.id} className="artist-track-item" onClick={() => onPlayLocal(track)}>
                                <img src={track.album?.images?.[0]?.url} alt="" />
                                <div className="track-info">
                                    <span className="track-name">{track.name}</span>
                                    <span className="track-artists">{track.artists.map(a => a.name).join(', ')}</span>
                                </div>
                                <div className="track-actions">
                                    <button className="mini-btn" onClick={(e) => { e.stopPropagation(); playNext(track); }}>Next</button>
                                    <button className="mini-btn" onClick={(e) => { e.stopPropagation(); addToQueue(track); }}>+</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Albums */}
                <div className="artist-section">
                    <h3>Discography</h3>
                    <div className="artist-albums-grid">
                        {data.albums.map(album => (
                            <div key={album.id} className="artist-album-item" onClick={() => onSelectAlbum(album.id)}>
                                <img src={album.images?.[0]?.url} alt="" />
                                <div className="album-info">
                                    <p className="album-name">{album.name}</p>
                                    <p className="album-year">{album.release_date?.split('-')[0]}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Related */}
                <div className="artist-section">
                    <h3>Fans Also Like</h3>
                    <div className="related-artists-grid">
                        {data.related.map(artist => (
                            <div key={artist.id} className="related-artist-item" onClick={() => onSelectArtist(artist.id)}>
                                <img src={artist.images?.[0]?.url} alt="" />
                                <p className="related-artist-name">{artist.name}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ArtistDetailsModal;