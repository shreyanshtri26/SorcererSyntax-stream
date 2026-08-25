import { useState, useEffect, useCallback } from 'react';

const CONTINUE_WATCHING_KEY = 'room305_continue_watching';

export const useContinueWatching = () => {
  const [continueWatchingList, setContinueWatchingList] = useState(() => {
    try {
      const saved = localStorage.getItem(CONTINUE_WATCHING_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error loading continue watching from localStorage:', e);
      return [];
    }
  });

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === CONTINUE_WATCHING_KEY) {
        try {
          setContinueWatchingList(e.newValue ? JSON.parse(e.newValue) : []);
        } catch (err) {
          console.error(err);
        }
      }
    };

    const handleCustomEvent = () => {
      try {
        const saved = localStorage.getItem(CONTINUE_WATCHING_KEY);
        setContinueWatchingList(saved ? JSON.parse(saved) : []);
      } catch (err) {
        console.error(err);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('room305_continue_watching_updated', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('room305_continue_watching_updated', handleCustomEvent);
    };
  }, []);

  const saveList = useCallback((newList) => {
    setContinueWatchingList(newList);
    try {
      localStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(newList));
      window.dispatchEvent(new Event('room305_continue_watching_updated'));
    } catch (e) {
      console.error('Error saving continue watching to localStorage:', e);
    }
  }, []);

  const updateProgress = useCallback((item, progressPercent = 35, season = null, episode = null) => {
    if (!item || !item.id) return;
    const cleanItem = {
      id: item.id,
      title: item.title || item.name,
      name: item.name || item.title,
      poster_path: item.poster_path,
      backdrop_path: item.backdrop_path,
      media_type: item.media_type || (item.name ? 'tv' : 'movie'),
      vote_average: item.vote_average || 0,
      release_date: item.release_date || item.first_air_date || '',
      first_air_date: item.first_air_date || item.release_date || '',
      overview: item.overview || '',
      progress: Math.min(95, Math.max(10, progressPercent)),
      season: season,
      episode: episode,
      updatedAt: Date.now()
    };

    const filtered = continueWatchingList.filter(i => String(i.id) !== String(item.id));
    saveList([cleanItem, ...filtered].slice(0, 15)); // Keep latest 15
  }, [continueWatchingList, saveList]);

  const getItemProgress = useCallback((id) => {
    if (!id) return 0;
    const found = continueWatchingList.find(i => String(i.id) === String(id));
    return found ? found.progress : 0;
  }, [continueWatchingList]);

  const removeFromContinueWatching = useCallback((id) => {
    if (!id) return;
    saveList(continueWatchingList.filter(item => String(item.id) !== String(id)));
  }, [continueWatchingList, saveList]);

  return {
    continueWatchingList,
    updateProgress,
    getItemProgress,
    removeFromContinueWatching
  };
};

export default useContinueWatching;
