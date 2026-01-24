import React, { useImperativeHandle, forwardRef, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import { usePlayer } from '../context/PlayerContext';
import './MusicPlayer.css';

const MusicPlayer = forwardRef(({ videoId, onEnd, onError }, ref) => {
  const playerRef = useRef(null);
  const { setCurrentTime, setDuration, isPlaying } = usePlayer();
  const intervalRef = useRef(null);

  const opts = {
    height: '340',
    width: '100%',
    host: 'https://www.youtube-nocookie.com',
    playerVars: {
      autoplay: 1,
      rel: 0,
      modestbranding: 1,
      controls: 1,
    },
  };

  useEffect(() => {
    if (videoId) console.log("[MusicPlayer] Attempting to play video:", videoId);
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        if (playerRef.current?.getCurrentTime) {
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
    start: ({ videoId: newId }) => {
      if (playerRef.current) {
        if (newId) playerRef.current.loadVideoById(newId);
        else playerRef.current.playVideo();
      }
    },
    pause: () => playerRef.current?.pauseVideo(),
    resume: () => playerRef.current?.playVideo(),
    seek: (time) => playerRef.current?.seekTo(time, true),
  }));

  const handleError = (e) => {
    const code = e.data;
    console.warn(`YouTube Error Code: ${code} - Attempting fallback.`);
    // Error Codes:
    // 2: Invalid param
    // 5: HTML5 error
    // 100: Not found/private
    // 101/150: Embedding not allowed
    // If error occurs, try fallback strategy provided by parent
    if (onError) onError();
    else if (onEnd) onEnd(); // Default to skip if no error handler
  };

  return (
    <div className="youtube-player-wrapper">
      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={e => {
          playerRef.current = e.target;
        }}
        onEnd={onEnd}
        onError={handleError}
        className="youtube-iframe"
      />
      {!videoId && <div className="no-video-msg">Waiting for content selection...</div>}
    </div>
  );
});

export default MusicPlayer;