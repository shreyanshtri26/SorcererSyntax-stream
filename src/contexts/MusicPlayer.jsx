import React, { useImperativeHandle, forwardRef, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import { usePlayer } from '../context/PlayerContext';

const MusicPlayer = forwardRef(({ videoId, startTime = 0, onEnd }, ref) => {
  const playerRef = useRef(null);
  const { setCurrentTime, setDuration, isPlaying } = usePlayer();
  const intervalRef = useRef(null);

  const opts = {
    height: '340',
    width: '100%',
    playerVars: {
      autoplay: 1, // Change to autoplay=1 for queue advance
      start: startTime,
      rel: 0,
      modestbranding: 1,
      controls: 1
    },
  };

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          setCurrentTime(playerRef.current.getCurrentTime());
          setDuration(playerRef.current.getDuration());
        }
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, setCurrentTime, setDuration]);

  useImperativeHandle(ref, () => ({
    start: ({ videoId: newId, startTime = 0 }) => {
      if (playerRef.current) {
        if (newId)
          playerRef.current.loadVideoById({ videoId: newId, startSeconds: startTime });
        else {
          playerRef.current.seekTo(startTime, true);
          playerRef.current.playVideo();
        }
      }
    },
    pause: () => playerRef.current && playerRef.current.pauseVideo(),
    resume: () => playerRef.current && playerRef.current.playVideo(),
    seek: (time) => playerRef.current && playerRef.current.seekTo(time, true),
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
        onEnd={onEnd}
        style={{ borderRadius: 12 }}
      />
      {!videoId && <div style={{ color: '#fff', padding: 24, textAlign: 'center' }}>No YouTube video selected.</div>}
    </div>
  );
});

export default MusicPlayer;