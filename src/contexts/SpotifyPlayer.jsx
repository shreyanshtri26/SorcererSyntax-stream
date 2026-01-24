import React, { useEffect, useImperativeHandle, forwardRef, useRef, useState } from 'react';
import axios from 'axios';
import { usePlayer } from '../context/PlayerContext';
import './SpotifyPlayer.css';

const LYRICS_API_BASE = 'https://spotify-lyrics-api-ochre.vercel.app/api/lyrics';

const SpotifyPlayer = forwardRef(({ uri }, ref) => {
  const iframeRef = useRef(null);
  const controllerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [lyrics, setLyrics] = useState(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const { setCurrentTime, setDuration } = usePlayer();

  const trackId = uri?.split(':').pop();
  const embedSrc = trackId ? `https://open.spotify.com/embed/track/${trackId}` : '';

  useEffect(() => {
    if (!trackId) {
      setLyrics(null);
      return;
    }
    setLyricsLoading(true);
    axios.get(`${LYRICS_API_BASE}?trackid=${trackId}`)
      .then(res => setLyrics(res.data?.lyrics))
      .catch(() => setLyrics(null))
      .finally(() => setLyricsLoading(false));
  }, [trackId]);

  useEffect(() => {
    if (!uri) return;
    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      if (iframeRef.current) {
        IFrameAPI.createController(iframeRef.current, { uri }, (controller) => {
          controllerRef.current = controller;
          setIsReady(true);
          controller.addListener('playback_update', e => {
            const { position, duration: dur } = e.data;
            setCurrentTime(position / 1000);
            setDuration(dur / 1000);
          });
        });
      }
    };
    if (!window.SpotifyEmbedApiLoaded) {
      const apiScript = document.createElement('script');
      apiScript.src = 'https://open.spotify.com/embed/iframe-api/v1';
      apiScript.async = true;
      apiScript.onload = () => { window.SpotifyEmbedApiLoaded = true; };
      document.body.appendChild(apiScript);
    }
  }, [uri]);

  useImperativeHandle(ref, () => ({
    start: ({ uri: newUri }) => {
      if (controllerRef.current && isReady) {
        controllerRef.current.loadUri(newUri || uri);
        controllerRef.current.play();
      }
    },
    pause: () => controllerRef.current?.pause(),
    resume: () => controllerRef.current?.resume(),
    seek: (time) => controllerRef.current?.seek(time),
  }));

  return (
    <div className="spotify-player-wrapper">
      <iframe
        ref={iframeRef}
        title="Spotify Player"
        width="100%"
        height="152"
        frameBorder="0"
        allow="encrypted-media"
        src={embedSrc}
        className="spotify-iframe"
      />

      {trackId && (
        <div className="lyrics-container">
          {lyricsLoading ? (
            <div className="lyrics-status">Searching for lyrics...</div>
          ) : lyrics ? (
            <pre className="lyrics-text">{lyrics}</pre>
          ) : (
            <div className="lyrics-status inactive">No lyrics available for this track.</div>
          )}
        </div>
      )}
    </div>
  );
});

export default SpotifyPlayer;