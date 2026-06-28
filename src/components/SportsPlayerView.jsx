import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import ShareButtons from './ShareButtons';
import './SportsPlayerView.css';

/**
 * SportsPlayerView – full screen sports player view.
 * Displays live TV or events streams, has social share buttons,
 * folder toggles for premium channels, and navigation controls.
 */
const SportsPlayerView = ({
  playId,
  tab,
  source,
  dlhdChannels,
  iptvChannels,
  cinemaChannels,
  damiStreams,
  countriesList,
  selectedCountry,
  onClose,
  currentTheme = 'devil'
}) => {
  const [currentFolder, setCurrentFolder] = useState('stream');
  const [channelDetails, setChannelDetails] = useState(null);
  const [videoError, setVideoError] = useState(false);

  const folders = ['stream', 'cast', 'watch', 'plus', 'casting', 'player'];

  // Resolve channel / stream details on mount and whenever parameters change
  useEffect(() => {
    setVideoError(false);
    
    if (tab === 'channels' && source === 'dlhd') {
      const match = dlhdChannels.find(c => c.channel_id === playId);
      if (match) {
        if (match.hlsUrls && match.hlsUrls.length > 0) {
          // HLS-based Premium channel (e.g. Unite8 Sports)
          setChannelDetails({
            name: match.channel_name,
            type: 'Premium Channel',
            logo: match.logo_url,
            streamId: null,
            iframeUrl: null,
            hlsUrls: match.hlsUrls,
            activeStream: match.hlsUrls[0]
          });
        } else {
          // Iframe-based Premium channel (dlhd.pk streams)
          setChannelDetails({
            name: match.channel_name,
            type: 'Premium Channel',
            logo: match.logo_url,
            streamId: match.iframeUrl ? null : playId,
            iframeUrl: match.iframeUrl || null
          });
        }
      }
    } else if (tab === 'channels' && source === 'iptv') {
      const match = iptvChannels.find(c => c.id === playId);
      if (match) {
        setChannelDetails({
          name: match.name,
          type: `IPTV Channel (${countriesList.find(c => c.code === selectedCountry)?.name || 'Worldwide'})`,
          logo: match.logo,
          hlsUrls: match.streams,
          activeStream: match.streams && match.streams.length > 0 ? match.streams[0] : null,
          iframeUrl: match.iframeUrl || null
        });
      }
    } else if (tab === 'channels' && source === 'cinemaos') {
      const match = cinemaChannels?.find(c => c.id === playId);
      if (match) {
        setChannelDetails({
          name: match.name,
          type: 'CinemaOS TV',
          logo: match.logo,
          iframeUrl: match.iframeUrl
        });
      }
    } else if (tab === 'events') {
      let match = null;
      damiStreams.forEach(group => {
        const found = group.streams.find(s => s.id === playId);
        if (found) match = found;
      });
      if (match) {
        const defaultUrl = match.iframe || match.embed || (match.sources && match.sources.length > 0 ? match.sources[0].embed : '');
        setChannelDetails({
          name: match.name,
          type: `Live Event (${match.league || 'Sports'})`,
          logo: match.poster,
          streamId: null,
          iframeUrl: defaultUrl,
          sources: match.sources || [],
          activeSourceId: 'default'
        });
      }
    } else if (tab === 'schedule') {
      // In schedule, playId corresponds to a DLHD channel_id
      const match = dlhdChannels.find(c => c.channel_id === playId);
      if (match) {
        setChannelDetails({
          name: match.channel_name,
          type: 'Premium Channel (Scheduled)',
          logo: match.logo_url,
          streamId: playId,
          iframeUrl: null
        });
      }
    }
  }, [playId, tab, source, dlhdChannels, iptvChannels, cinemaChannels, damiStreams, countriesList, selectedCountry]);

  if (!channelDetails) {
    return (
      <div className="sports-player-view-loading">
        <div className="spinner"></div>
        <p>Loading stream details...</p>
      </div>
    );
  }

  // Compute stream URL
  const isIframe = channelDetails.iframeUrl || channelDetails.streamId;
  const iframeSrc = channelDetails.iframeUrl || (channelDetails.streamId && 
    (channelDetails.streamId.toString().startsWith('http') 
      ? channelDetails.streamId 
      : `https://dlhd.pk/${currentFolder}/stream-${channelDetails.streamId}.php`
    ));

  return (
    <div className="sports-player-view animate-fade-in">
      {/* Header Bar */}
      <header className="player-view-header">
        <button className="back-btn" onClick={onClose} aria-label="Go Back" title="Back to TV & Sports">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="back-arrow-svg">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span className="back-btn-text">Back</span>
        </button>
        <div className="header-meta">
          <span className="badge-live-stream">
            <span className="live-dot"></span> LIVE
          </span>
          <span className="channel-type-tag">{channelDetails.type}</span>
        </div>
      </header>

      {/* Main Grid: Player on left/top, Metadata & Shares on right/bottom */}
      <div className="player-view-body">
        
        {/* Left Side: Dynamic Video Player Box */}
        <div className="player-left-col">
          <div className="sports-player-container">
            {isIframe ? (
              <div className="iframe-wrapper">
                <iframe
                  src={iframeSrc}
                  title={channelDetails.name}
                  width="100%"
                  height="100%"
                  allowFullScreen
                  allow="autoplay; fullscreen; picture-in-picture"
                  referrerPolicy="no-referrer"
                  key={`${currentFolder}-${playId}`}
                />
              </div>
            ) : channelDetails.activeStream && !videoError ? (
              <div className="react-player-wrapper">
                <ReactPlayer
                  url={channelDetails.activeStream}
                  className="react-player-instance"
                  playing
                  controls
                  width="100%"
                  height="100%"
                  config={{
                    file: {
                      forceHLS: true,
                    }
                  }}
                  onError={() => setVideoError(true)}
                />
              </div>
            ) : (
              <div className="player-error-fallback">
                <i className="fa-solid fa-circle-exclamation"></i>
                <p>Failed to load HLS stream feed.</p>
                {channelDetails.hlsUrls && channelDetails.hlsUrls.length > 1 && (
                  <p className="subtext">Try switching to an alternative feed below.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Channel details, Share button, Folder Toggles */}
        <div className="player-right-col">
          <div className="details-card">
            
            {/* Header info */}
            <div className="details-header">
              {channelDetails.logo && (
                <div className="channel-view-logo">
                  <img 
                    src={channelDetails.logo.startsWith('http') ? channelDetails.logo : `https://dlhd.pk/${channelDetails.logo}`} 
                    alt={channelDetails.name} 
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
              <div className="title-section">
                <h2>{channelDetails.name}</h2>
                <p className="subtitle">{channelDetails.type}</p>
              </div>
            </div>

            <hr className="details-separator" />

            {/* DLHD Folder Source Selectors */}
            {channelDetails.streamId && (
              <div className="control-section folders-section">
                <h4><i className="fa-solid fa-server"></i> Choose Player Mirror</h4>
                <p className="help-text">If the screen is black or blocked, try toggling alternative player folders:</p>
                <div className="folders-grid">
                  {folders.map(f => (
                    <button
                      key={f}
                      className={`folder-btn-item ${currentFolder === f ? 'active' : ''}`}
                      onClick={() => setCurrentFolder(f)}
                    >
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>
                
                <a 
                  href={iframeSrc} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="direct-launch-link"
                >
                  <i className="fa-solid fa-arrow-up-right-from-square"></i> Open Stream in New Tab
                </a>
              </div>
            )}

            {/* Alternative Feeds for Worldwide HLS Streams */}
            {channelDetails.hlsUrls && channelDetails.hlsUrls.length > 1 && (
              <div className="control-section alternative-feeds">
                <h4><i className="fa-solid fa-list"></i> Alternative Stream Feeds</h4>
                <div className="feeds-grid">
                  {channelDetails.hlsUrls.map((url, index) => (
                    <button
                      key={index}
                      className={`feed-btn-item ${channelDetails.activeStream === url ? 'active' : ''}`}
                      onClick={() => {
                        setVideoError(false);
                        setChannelDetails({ ...channelDetails, activeStream: url });
                      }}
                    >
                      Feed #{index + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Alternative Feeds for Live Events (Fallbacks) */}
            {channelDetails.sources && channelDetails.sources.length > 1 && (
              <div className="control-section alternative-feeds">
                <h4><i className="fa-solid fa-server"></i> Alternative Event Feeds</h4>
                <div className="feeds-grid">
                  {channelDetails.sources.map((sourceObj, index) => (
                    <button
                      key={index}
                      className={`feed-btn-item ${channelDetails.iframeUrl === sourceObj.embed ? 'active' : ''}`}
                      onClick={() => {
                        setChannelDetails({ 
                          ...channelDetails, 
                          iframeUrl: sourceObj.embed,
                          activeSourceId: sourceObj.id
                        });
                      }}
                      title={sourceObj.name}
                    >
                      {sourceObj.name || `Source ${index + 1}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Share via Social Media Section */}
            <div className="control-section share-section">
              <h4><i className="fa-solid fa-share-nodes"></i> Share Live Stream</h4>
              <p className="help-text">Send this link to friends so they can watch this channel live with you!</p>
              <ShareButtons
                url={window.location.href}
                title={channelDetails.name}
                currentTheme={currentTheme}
              />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default SportsPlayerView;
