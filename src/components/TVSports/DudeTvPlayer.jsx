import React, { useState, useEffect, useRef, useCallback } from 'react';
import shaka from 'shaka-player';
import SafeImage from './SafeImage';
import ShareButtons from '../ShareButtons';
import './DudeTvPlayer.css';

/**
 * Fast network probe to benchmark server latency (ping in ms)
 */
const probeStreamLatency = async (stream) => {
  if (!stream || !stream.link) {
    return { ...stream, ping: 9999, isOnline: false };
  }

  const cleanUrl = stream.link.split('|')[0].trim();
  const startTime = performance.now();

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2200); // 2.2s timeout

    await fetch(cleanUrl, {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal,
      cache: 'no-cache'
    });

    clearTimeout(timer);
    const latency = Math.round(performance.now() - startTime);
    return { ...stream, ping: latency, isOnline: true };
  } catch (e) {
    const latency = Math.round(performance.now() - startTime);
    const isOnline = latency < 2100;
    return { ...stream, ping: isOnline ? latency : 9999, isOnline };
  }
};

const DudeTvPlayer = ({ item, streams = [], onClose, currentTheme = 'devil' }) => {
  const rawStreams = streams.length > 0 ? streams : (item?.decoded_channels || item?.formatsNew || []);
  const [rankedStreams, setRankedStreams] = useState(rawStreams);
  const [selectedStreamIndex, setSelectedStreamIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPinging, setIsPinging] = useState(true);
  const [playerError, setPlayerError] = useState(null);
  const [isIframe, setIsIframe] = useState(false);
  const [embedSrc, setEmbedSrc] = useState('');
  const [autoFailoverNotice, setAutoFailoverNotice] = useState(null);

  const videoRef = useRef(null);
  const shakaPlayerRef = useRef(null);
  const watchdogTimerRef = useRef(null);
  const stallTimerRef = useRef(null);
  const lastTimeRef = useRef(0);
  const isSwitchingRef = useRef(false);
  const failedServersRef = useRef(new Set());
  const [failedServerIndexes, setFailedServerIndexes] = useState(new Set());

  const activeStream = rankedStreams[selectedStreamIndex] || rankedStreams[0] || null;

  // 1. Initial Ping Benchmark & Priority Ranking
  useEffect(() => {
    let isMounted = true;
    setIsPinging(true);
    failedServersRef.current = new Set();
    setFailedServerIndexes(new Set());
    setPlayerError(null);
    isSwitchingRef.current = false;
    setRankedStreams(rawStreams);
    setSelectedStreamIndex(0);

    const benchmarkAndRank = async () => {
      if (!rawStreams || rawStreams.length === 0) {
        if (isMounted) setIsPinging(false);
        return;
      }

      // If streams are iframe embeds (CDX / embed.st), preserve exact server order with Server 1 as primary
      const hasEmbed = rawStreams.some(s => s.link && (s.link.includes('embed') || s.link.includes('iframe')));
      if (hasEmbed) {
        if (isMounted) {
          setRankedStreams(rawStreams.map(s => ({ ...s, ping: s.ping || 45, isOnline: true })));
          setSelectedStreamIndex(0);
          setIsPinging(false);
        }
        return;
      }

      try {
        const probedResults = await Promise.all(rawStreams.map(probeStreamLatency));
        if (!isMounted) return;

        // Sort by lowest latency (fastest first), keeping reachable ones on top
        const sorted = [...probedResults].sort((a, b) => {
          if (a.isOnline && !b.isOnline) return -1;
          if (!a.isOnline && b.isOnline) return 1;
          return a.ping - b.ping;
        });

        setRankedStreams(sorted);
        setSelectedStreamIndex(0);
      } catch (e) {
        console.warn('[DudeTvPlayer] Ping benchmark error, using default stream order:', e);
        if (isMounted) setRankedStreams(rawStreams);
      } finally {
        if (isMounted) setIsPinging(false);
      }
    };

    benchmarkAndRank();

    return () => {
      isMounted = false;
    };
  }, [item?.id, streams]);

  useEffect(() => {
    // Install Shaka Player polyfills
    shaka.polyfill.installAll();
  }, []);

  // Keyboard Escape listener to close player
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // 2. High-Reliability Auto-Failover Engine
  const triggerAutoFailover = useCallback((reason = 'Stream error') => {
    if (isSwitchingRef.current) return;
    isSwitchingRef.current = true;

    // Record failed server in ref & state
    failedServersRef.current.add(selectedStreamIndex);
    setFailedServerIndexes(new Set(failedServersRef.current));

    if (rankedStreams.length <= 1) {
      setPlayerError(reason || 'Stream unavailable. No backup servers found.');
      setIsLoading(false);
      isSwitchingRef.current = false;
      return;
    }

    // Find next untried server
    let nextIndex = -1;
    for (let i = 1; i <= rankedStreams.length; i++) {
      const candidate = (selectedStreamIndex + i) % rankedStreams.length;
      if (!failedServersRef.current.has(candidate)) {
        nextIndex = candidate;
        break;
      }
    }

    // If all servers have been tried, reset failed set to allow infinite retry loop
    if (nextIndex === -1) {
      failedServersRef.current.clear();
      failedServersRef.current.add(selectedStreamIndex);
      setFailedServerIndexes(new Set(failedServersRef.current));
      nextIndex = (selectedStreamIndex + 1) % rankedStreams.length;
    }

    const currentName = activeStream?.title || `Server ${selectedStreamIndex + 1}`;
    const nextName = rankedStreams[nextIndex]?.title || `Server ${nextIndex + 1}`;

    setAutoFailoverNotice(`Server ${currentName} issue. Auto-switching to ${nextName}...`);
    setIsLoading(true);
    setPlayerError(null);

    setTimeout(() => {
      setSelectedStreamIndex(nextIndex);
      isSwitchingRef.current = false;
      setTimeout(() => setAutoFailoverNotice(null), 4000);
    }, 450);
  }, [selectedStreamIndex, rankedStreams, activeStream]);

  // 3. Playback Initializer & Stall Watchdog
  useEffect(() => {
    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = null;
    }
    if (stallTimerRef.current) {
      clearInterval(stallTimerRef.current);
      stallTimerRef.current = null;
    }

    if (!activeStream || !activeStream.link) {
      if (!isPinging) triggerAutoFailover('No valid stream link available');
      return;
    }

    let streamUrl = activeStream.link.trim();
    const drmKey = activeStream.api ? activeStream.api.trim() : '';

    const isEmbed = streamUrl.includes('embed') || 
                    streamUrl.includes('iframe') || 
                    (!streamUrl.includes('.mpd') && !streamUrl.includes('.m3u8') && !streamUrl.includes('load-playlist'));

    if (isEmbed) {
      let finalEmbedUrl = streamUrl;
      if (!finalEmbedUrl.includes('autoplay')) {
        finalEmbedUrl += (finalEmbedUrl.includes('?') ? '&autoplay=1' : '?autoplay=1');
      }
      setIsIframe(true);
      setEmbedSrc(finalEmbedUrl);
      setIsLoading(false);
      setPlayerError(null);

      watchdogTimerRef.current = setTimeout(() => {
        setIsLoading(false);
      }, 2000);

      return;
    }

    setIsIframe(false);
    setPlayerError(null);
    setIsLoading(true);

    let cleanUrl = streamUrl;
    if (cleanUrl.includes('|')) {
      cleanUrl = cleanUrl.split('|')[0];
    }

    watchdogTimerRef.current = setTimeout(() => {
      console.warn(`[DudeTvPlayer] Connection watchdog timeout on Server ${selectedStreamIndex + 1}, auto-switching...`);
      triggerAutoFailover('Server response timed out (7s watchdog)');
    }, 7000);

    const initPlayer = async () => {
      const videoElement = videoRef.current;
      if (!videoElement) return;

      if (shakaPlayerRef.current) {
        try {
          await shakaPlayerRef.current.destroy();
        } catch (e) {
          console.warn('[DudeTvPlayer] Error destroying shaka player:', e);
        }
        shakaPlayerRef.current = null;
      }

      if (!shaka.Player.isBrowserSupported()) {
        triggerAutoFailover('Browser does not support adaptive DRM video playback.');
        return;
      }

      const player = new shaka.Player(videoElement);
      shakaPlayerRef.current = player;

      if (drmKey && drmKey.includes(':')) {
        const [keyId, key] = drmKey.split(':');
        player.configure({
          drm: {
            clearKeys: {
              [keyId.trim()]: key.trim()
            }
          }
        });
      }

      player.configure({
        streaming: {
          bufferingGoal: 12,
          rebufferingGoal: 2,
          bufferBehind: 15,
          lowLatencyMode: true,
          jumpLargeGaps: true,
          retryParameters: {
            maxAttempts: 2,
            baseDelay: 500,
            backoffFactor: 1.5,
            fuzzFactor: 0.2,
            timeout: 5000
          }
        }
      });

      player.addEventListener('error', (event) => {
        const errorDetail = event.detail || {};
        const code = errorDetail.code;
        console.error('[DudeTvPlayer] Shaka Error Code:', code, errorDetail);

        if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
        
        let friendlyReason = 'Server stream error';
        if (code === 3016 || code === 3014 || code === 3015) {
          friendlyReason = 'Stream manifest format error';
        } else if (code === 1002 || code === 1001) {
          friendlyReason = 'Network connection failed on server';
        } else if (code === 6001 || code === 6002) {
          friendlyReason = 'DRM decryption failed on server';
        }

        // Attempt direct native fallback if HLS
        if (cleanUrl.includes('.m3u8') && videoElement.canPlayType('application/vnd.apple.mpegurl')) {
          videoElement.src = cleanUrl;
          videoElement.play().catch(() => {});
          setIsLoading(false);
        } else {
          triggerAutoFailover(friendlyReason);
        }
      });

      try {
        await player.load(cleanUrl);
        if (watchdogTimerRef.current) {
          clearTimeout(watchdogTimerRef.current);
          watchdogTimerRef.current = null;
        }
        setIsLoading(false);

        videoElement.play().catch(() => {});

        lastTimeRef.current = videoElement.currentTime;
        stallTimerRef.current = setInterval(() => {
          if (!videoElement || videoElement.paused || videoElement.ended) return;
          if (videoElement.readyState >= 2) {
            const cur = videoElement.currentTime;
            if (cur === lastTimeRef.current && videoElement.readyState < 3) {
              console.warn('[DudeTvPlayer] Stream playback stalled, auto-switching...');
              triggerAutoFailover('Playback stalled on server');
            }
            lastTimeRef.current = cur;
          }
        }, 6000);

      } catch (err) {
        console.error('[DudeTvPlayer] Shaka load error:', err);
        if (cleanUrl.includes('.m3u8') && videoElement.canPlayType('application/vnd.apple.mpegurl')) {
          videoElement.src = cleanUrl;
          videoElement.play().catch(() => {});
          if (watchdogTimerRef.current) {
            clearTimeout(watchdogTimerRef.current);
            watchdogTimerRef.current = null;
          }
          setIsLoading(false);
        } else {
          if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
          const errCode = err?.code;
          const msg = errCode === 3016 ? 'Manifest format issue' : (err.message || 'Stream connection failed');
          triggerAutoFailover(msg);
        }
      }
    };

    initPlayer();

    return () => {
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current);
        watchdogTimerRef.current = null;
      }
      if (stallTimerRef.current) {
        clearInterval(stallTimerRef.current);
        stallTimerRef.current = null;
      }
      if (shakaPlayerRef.current) {
        shakaPlayerRef.current.destroy().catch(() => {});
        shakaPlayerRef.current = null;
      }
    };
  }, [activeStream, selectedStreamIndex, triggerAutoFailover, isPinging]);

  const handleManualServerSelect = (idx) => {
    isSwitchingRef.current = false;
    setSelectedStreamIndex(idx);
    setPlayerError(null);
    setAutoFailoverNotice(null);
  };

  const handleResetAndRetry = () => {
    isSwitchingRef.current = false;
    failedServersRef.current.clear();
    setFailedServerIndexes(new Set());
    setSelectedStreamIndex(0);
    setPlayerError(null);
    setAutoFailoverNotice('Retrying all prioritized stream servers...');
    setTimeout(() => setAutoFailoverNotice(null), 3000);
  };

  const eventInfo = item?.eventInfo;
  const isMatch = !!eventInfo && (eventInfo.teamA || eventInfo.eventName);
  const displayName = eventInfo?.eventName || item?.title || 'Live Broadcast';
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className={`dudetv-player-container theme-${currentTheme}`}>
      {/* Auto-Failover Notification Banner */}
      {autoFailoverNotice && (
        <div className="auto-failover-toast">
          <span className="failover-pulse"></span>
          <span>{autoFailoverNotice}</span>
        </div>
      )}

      {/* Top Bar / Header */}
      <div className="dudetv-player-header">
        <div className="player-meta-left">
          <button className="back-btn" onClick={onClose} aria-label="Close Player and return to catalog" title="Back to Channels (Esc)">
            <span className="back-arrow">←</span> Back
          </button>
          
          <div className="stream-badge-info">
            <span className="live-pulse-dot"></span>
            <span className="live-label">LIVE FEED</span>
            <span className="stream-type-tag">
              {activeStream?.type === '1' ? '4K/FHD DRM' : 'HD HLS'}
            </span>
            <span className="auto-switch-badge">AUTO-FAILOVER ON</span>
          </div>
        </div>

        {isMatch && (
          <div className="player-match-preview">
            <SafeImage
              src={eventInfo.teamAFlag}
              alt={eventInfo.teamA || 'Team A'}
              className="match-flag"
              type="flag"
            />
            <span className="match-names">
              {eventInfo.teamA || 'Team A'} vs {eventInfo.teamB || 'Team B'}
            </span>
            <SafeImage
              src={eventInfo.teamBFlag}
              alt={eventInfo.teamB || 'Team B'}
              className="match-flag"
              type="flag"
            />
          </div>
        )}

        <div className="player-header-actions">
          {/* Complete 4-in-1 Share Buttons: Copy, WhatsApp, Twitter, Facebook */}
          <ShareButtons
            url={shareUrl}
            title={displayName}
            currentTheme={currentTheme}
          />

          {/* Close Button */}
          <button className="close-btn" onClick={onClose} title="Close Player (Esc)">✕</button>
        </div>
      </div>

      {/* Screen Frame */}
      <div className="dudetv-screen-wrapper">
        {isLoading && (
          <div className="player-loading-overlay">
            <div className="spinner"></div>
            <p>Connecting to {activeStream?.title || 'Stream Server'}...</p>
            {activeStream?.ping && activeStream.ping < 9999 && (
              <span className="ping-connecting-tag">Latency: {activeStream.ping}ms</span>
            )}
            {rankedStreams.length > 1 && (
              <span className="switching-hint">Auto-failover enabled across {rankedStreams.length} mirror servers</span>
            )}
          </div>
        )}

        {playerError && (
          <div className="player-error-overlay">
            <div className="error-icon">Notice</div>
            <h3>Stream Connection Issue</h3>
            <p>{playerError}</p>
            <div className="error-actions-row">
              <button className="retry-all-servers-btn" onClick={handleResetAndRetry}>
                Retry All Servers
              </button>
              {rankedStreams.length > 1 && (
                <button
                  className="next-server-btn"
                  onClick={() => handleManualServerSelect((selectedStreamIndex + 1) % rankedStreams.length)}
                >
                  Try Next Server (Rank #{(selectedStreamIndex + 1) % rankedStreams.length + 1})
                </button>
              )}
            </div>
          </div>
        )}

        {isIframe ? (
          <iframe
            src={embedSrc}
            title={activeStream?.title || item?.title || 'Live Stream'}
            className="dudetv-iframe"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture; accelerometer; gyroscope; clipboard-write; web-share"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
          />
        ) : (
          <video
            ref={videoRef}
            className="dudetv-video"
            controls
            autoPlay
            playsInline
            onError={() => triggerAutoFailover('Video playback error')}
          />
        )}
      </div>

      {/* Channel Meta & Format / Server Selector */}
      <div className="dudetv-controls-footer">
        <div className="channel-title-row">
          <div className="channel-id-info">
            <SafeImage
              src={item?.image}
              alt={item?.title || 'Channel Logo'}
              className="footer-channel-logo"
              type="logo"
            />
            <div>
              <h2 className="footer-title">{displayName}</h2>
              <span className="footer-cat-badge">{item?.cat || 'Live Sports & TV'}</span>
            </div>
          </div>

          <div className="footer-actions-row">
            {/* Quick manual server cycle button */}
            {rankedStreams.length > 1 && (
              <button
                className="quick-switch-server-btn"
                onClick={() => handleManualServerSelect((selectedStreamIndex + 1) % rankedStreams.length)}
                title="Switch to next server mirror"
              >
                Switch Server (Rank #{(selectedStreamIndex + 1) % rankedStreams.length + 1})
              </button>
            )}

            {/* Footer Share Buttons */}
            <ShareButtons
              url={shareUrl}
              title={displayName}
              currentTheme={currentTheme}
            />
          </div>
        </div>

        {/* Server / Stream Format Switcher */}
        {rankedStreams.length > 0 && (
          <div className="stream-servers-section">
            <div className="servers-header-row">
              <span className="servers-label">
                Server Feeds Ranked by Speed ({rankedStreams.length})
              </span>
              <span className="servers-subhint">
                {isPinging ? 'Testing server latencies...' : 'Prioritized by lowest ping response with auto-failover'}
              </span>
            </div>
            <div className="servers-pill-list">
              {rankedStreams.map((st, idx) => {
                const isSelected = selectedStreamIndex === idx;
                const isFailed = failedServerIndexes.has(idx);
                const isDrm = st.type === '1';
                const hasPing = st.ping && st.ping < 9999;
                const pingClass = st.ping < 250 ? 'fast' : st.ping < 650 ? 'medium' : 'slow';

                return (
                  <button
                    key={idx}
                    className={`server-pill-btn ${isSelected ? 'active' : ''} ${isFailed ? 'failed' : ''}`}
                    onClick={() => handleManualServerSelect(idx)}
                    title={st.link}
                  >
                    <span className="server-rank-badge">#{idx + 1}</span>
                    <span className="server-name">{st.title || `Server ${idx + 1}`}</span>
                    {isDrm && <span className="server-drm-badge">DRM</span>}
                    {hasPing && (
                      <span className={`server-ping-badge ${pingClass}`}>
                        {st.ping}ms
                      </span>
                    )}
                    {isFailed && <span className="server-status-tag failed">Unreachable</span>}
                    {isSelected && !isFailed && <span className="server-status-tag playing">Playing</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DudeTvPlayer;
