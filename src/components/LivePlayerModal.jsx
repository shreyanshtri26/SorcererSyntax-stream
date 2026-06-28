import React from 'react';
import ReactPlayer from 'react-player';
import './LivePlayerModal.css';

const LivePlayerModal = ({ isOpen, onClose, channel }) => {
  if (!isOpen || !channel) return null;

  // Prefer 720p or 1080p stream if available, otherwise just pick the first one
  const preferredStream = channel.streams.find(s => s.quality === '1080p' || s.quality === '720p') || channel.streams[0];

  return (
    <div className="live-player-overlay" onClick={onClose}>
      <div className="live-player-content" onClick={e => e.stopPropagation()}>
        <div className="live-player-header">
          <div className="live-player-info">
            <h3>{channel.name}</h3>
            {channel.country && <span className="channel-country">{channel.country.toUpperCase()}</span>}
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="player-wrapper">
          {preferredStream ? (
            <ReactPlayer
              url={preferredStream.url}
              className="react-player"
              playing
              controls
              width="100%"
              height="100%"
              config={{
                file: {
                  forceHLS: true,
                }
              }}
            />
          ) : (
            <div className="no-stream-error">
              <p>Stream not available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LivePlayerModal;
