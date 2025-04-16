// src/contexts/SpotifyPlayer.jsx
import React, { useEffect, useImperativeHandle, forwardRef, useRef, useState } from 'react';
import axios from 'axios';

const LYRICS_API_BASE = 'https://spotify-lyrics-api-ochre.vercel.app/api/lyrics'; // public REST API for lyrics

const SpotifyPlayer = forwardRef(({ uri, startTime = 0 }, ref) => {
  const iframeRef = useRef(null);
  const controllerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const playQueueRef = useRef([]);
  const [lyrics, setLyrics] = useState(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [lyricsError, setLyricsError] = useState(null);

  // Debug: Log when component mounts and uri changes
  useEffect(() => {
    console.log('[SpotifyPlayer] mount, uri:', uri);
  }, [uri]);

  // Utility to extract track ID from Spotify URI
  function getSpotifyTrackId(uri) {
    if (!uri) return '';
    const parts = uri.split(':');
    return parts.length === 3 && parts[1] === 'track' ? parts[2] : '';
  }

  const trackId = getSpotifyTrackId(uri);
  const embedSrc = trackId ? `https://open.spotify.com/embed/track/${trackId}` : '';

  // Fetch lyrics when trackId changes
  useEffect(() => {
    if (!trackId) {
      setLyrics(null);
      setLyricsError(null);
      return;
    }
    setLyricsLoading(true);
    setLyricsError(null);
    setLyrics(null);
    axios.get(`${LYRICS_API_BASE}?trackid=${trackId}`)
      .then(res => {
        if (res.data && res.data.lyrics) {
          setLyrics(res.data.lyrics);
        } else {
          setLyricsError('No lyrics found');
        }
      })
      .catch(() => setLyricsError('Failed to fetch lyrics'))
      .finally(() => setLyricsLoading(false));
  }, [trackId]);

  // Load Spotify iFrame API, create controller
  useEffect(() => {
    console.log('[SpotifyPlayer] useEffect: loading Spotify iFrame API');
    setIsReady(false);
    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      console.log('[SpotifyPlayer] onSpotifyIframeApiReady called');
      if (iframeRef.current) {
        IFrameAPI.createController(iframeRef.current, { uri }, (controller) => {
          controllerRef.current = controller;
          setIsReady(true);
          // Play any queued requests
          playQueueRef.current.forEach(args => controller.loadUri(args.uri));
          playQueueRef.current = [];
          console.log('[SpotifyPlayer] Spotify controller created', controller);
        });
      } else {
        console.warn('[SpotifyPlayer] iframeRef.current not available');
      }
    };
    // ... (load script if needed)
    if (!window.SpotifyEmbedApiLoaded) {
      const apiScript = document.createElement('script');
      apiScript.src = 'https://open.spotify.com/embed/iframe-api/v1';
      apiScript.async = true;
      apiScript.onload = () => {
        window.SpotifyEmbedApiLoaded = true;
        console.log('[SpotifyPlayer] Spotify iFrame API script loaded');
      };
      document.body.appendChild(apiScript);
    }
  }, [uri]);

  // Expose unified API to parent
  useImperativeHandle(ref, () => ({
    start: ({ uri: newUri, startTime = 0 }) => {
      console.log('[SpotifyPlayer] start called', newUri || uri, startTime);
      if (controllerRef.current && isReady) {
        controllerRef.current.loadUri(newUri || uri);
        if (startTime) controllerRef.current.seek(startTime);
        controllerRef.current.play();
      } else {
        console.warn('[SpotifyPlayer] start called but controller not ready, queuing');
        playQueueRef.current.push({ uri: newUri || uri, startTime });
      }
    },
    pause: () => {
      console.log('[SpotifyPlayer] pause called');
      controllerRef.current && controllerRef.current.pause();
    },
    resume: () => {
      console.log('[SpotifyPlayer] resume called');
      controllerRef.current && controllerRef.current.resume();
    },
    seek: (time) => {
      console.log('[SpotifyPlayer] seek called', time);
      controllerRef.current && controllerRef.current.seek(time);
    },
  }));

  return (
    <div style={{ width: '100%', minHeight: 152, background: '#222', borderRadius: 12, margin: '0 auto', maxWidth: 540 }}>
      <iframe
        ref={iframeRef}
        title="Spotify Player"
        width="100%"
        height="152"
        frameBorder="0"
        allow="encrypted-media"
        src={embedSrc}
        style={{ display: embedSrc ? 'block' : 'none', borderRadius: 12, background: '#222' }}
      />
      {!embedSrc && <div style={{ color: '#fff', padding: 24, textAlign: 'center' }}>No Spotify track selected.</div>}
      {trackId && (
        <div style={{ background: '#181818', color: '#fff', borderRadius: 10, margin: '16px 0 0 0', padding: 16, fontSize: 15, minHeight: 60 }}>
          {lyricsLoading ? (
            <span style={{ color: '#bbb' }}>Loading lyrics…</span>
          ) : lyricsError ? (
            <span style={{ color: 'red' }}>{lyricsError}</span>
          ) : lyrics ? (
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit', color: '#fff' }}>{lyrics}</pre>
          ) : null}
        </div>
      )}
    </div>
  );
});

export default SpotifyPlayer;