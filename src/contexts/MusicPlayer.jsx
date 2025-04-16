// src/contexts/MusicPlayer.jsx
import React, { useImperativeHandle, forwardRef, useRef } from 'react';
import YouTube from 'react-youtube';

const MusicPlayer = forwardRef(({ videoId, startTime = 0 }, ref) => {
  const playerRef = useRef(null);

  const opts = {
    height: '340',
    width: '100%',
    playerVars: {
      autoplay: 0,
      start: startTime,
      rel: 0,
      modestbranding: 1,
      controls: 1
    },
  };

  useImperativeHandle(ref, () => ({
    start: ({ videoId: newId, startTime = 0 }) => {
      if (playerRef.current) {
        if (newId && playerRef.current.internalPlayer.loadVideoById)
          playerRef.current.internalPlayer.loadVideoById({ videoId: newId, startSeconds: startTime });
        else {
          playerRef.current.internalPlayer.seekTo(startTime, true);
          playerRef.current.internalPlayer.playVideo();
        }
      }
    },
    pause: () => playerRef.current && playerRef.current.internalPlayer.pauseVideo(),
    resume: () => playerRef.current && playerRef.current.internalPlayer.playVideo(),
    seek: (time) => playerRef.current && playerRef.current.internalPlayer.seekTo(time, true),
  }));

  return (
    <div style={{ width: '100%', minHeight: 340, background: '#111', borderRadius: 12, margin: '0 auto', maxWidth: 540 }}>
      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={e => {
          playerRef.current = e.target;
          if (startTime) e.target.seekTo(startTime, true);
        }}
        style={{ borderRadius: 12 }}
      />
      {!videoId && <div style={{ color: '#fff', padding: 24, textAlign: 'center' }}>No YouTube video selected.</div>}
    </div>
  );
});

export default MusicPlayer;