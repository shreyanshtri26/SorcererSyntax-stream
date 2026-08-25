import { useState, useEffect, useCallback } from 'react';

const WATCHLIST_KEY = 'room305_watchlist';

export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem(WATCHLIST_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error loading watchlist from localStorage:', e);
      return [];
    }
  });

  // Keep state in sync with localStorage and other tabs/components
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === WATCHLIST_KEY) {
        try {
          setWatchlist(e.newValue ? JSON.parse(e.newValue) : []);
        } catch (err) {
          console.error(err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    const handleCustomEvent = () => {
      try {
        const saved = localStorage.getItem(WATCHLIST_KEY);
        setWatchlist(saved ? JSON.parse(saved) : []);
      } catch (err) {
        console.error(err);
      }
    };

    window.addEventListener('room305_watchlist_updated', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('room305_watchlist_updated', handleCustomEvent);
    };
  }, []);

  const saveWatchlist = useCallback((newList) => {
    setWatchlist(newList);
    try {
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(newList));
      window.dispatchEvent(new Event('room305_watchlist_updated'));
    } catch (e) {
      console.error('Error saving watchlist to localStorage:', e);
    }
  }, []);

  const isInWatchlist = useCallback((id) => {
    if (!id) return false;
    return watchlist.some(item => String(item.id) === String(id));
  }, [watchlist]);

  const addToWatchlist = useCallback((item, mediaType = 'movie') => {
    if (!item || !item.id) return;
    const type = item.media_type || mediaType || 'movie';
    const cleanItem = {
      id: item.id,
      title: item.title || item.name,
      name: item.name || item.title,
      poster_path: item.poster_path,
      backdrop_path: item.backdrop_path,
      media_type: type,
      vote_average: item.vote_average || 0,
      release_date: item.release_date || item.first_air_date || '',
      first_air_date: item.first_air_date || item.release_date || '',
      overview: item.overview || '',
      addedAt: Date.now()
    };

    saveWatchlist([cleanItem, ...watchlist.filter(i => String(i.id) !== String(item.id))]);
  }, [watchlist, saveWatchlist]);

  const removeFromWatchlist = useCallback((id) => {
    if (!id) return;
    saveWatchlist(watchlist.filter(item => String(item.id) !== String(id)));
  }, [watchlist, saveWatchlist]);

  const toggleWatchlist = useCallback((item, mediaType = 'movie') => {
    if (!item || !item.id) return;
    if (isInWatchlist(item.id)) {
      removeFromWatchlist(item.id);
      return false;
    } else {
      addToWatchlist(item, mediaType);
      return true;
    }
  }, [isInWatchlist, removeFromWatchlist, addToWatchlist]);

  return {
    watchlist,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist
  };
};

export default useWatchlist;
