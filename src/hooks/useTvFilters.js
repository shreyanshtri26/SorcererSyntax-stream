import { useMemo, useDeferredValue } from 'react';
import { getEventDateTime } from '../utils/dateUtils';

export const useTvFilters = ({
  dlhdChannels,
  iptvChannels,
  cinemaChannels,
  damiStreams,
  dlhdSchedule,
  searchQuery,
  selectedCategory,
  selectedLanguage,
}) => {
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const filteredDlhdChannels = useMemo(() => {
    const seenNames = new Set();
    const query = (deferredSearchQuery || '').toLowerCase();
    return dlhdChannels.filter(ch => {
      const name = (ch.channel_name || '').toLowerCase();
      if (seenNames.has(name)) return false;
      seenNames.add(name);
      
      if (query && !name.includes(query)) return false;

      if (selectedCategory !== 'all') {
        let cat = 'general';
        if (name.includes('sport') || name.includes('bein') || name.includes('espn') || name.includes('racing') || name.includes('sky')) cat = 'sports';
        else if (name.includes('news') || name.includes('cnn') || name.includes('bbc')) cat = 'news';
        else if (name.includes('movie') || name.includes('cinema') || name.includes('hbo')) cat = 'movies';
        else if (name.includes('kids') || name.includes('cartoon') || name.includes('disney') || name.includes('boomerang')) cat = 'kids';
        if (cat !== selectedCategory) return false;
      }
      if (selectedLanguage !== 'all') {
        if (!ch.languages || !ch.languages.map(l => (l || '').toLowerCase()).includes(selectedLanguage)) return false;
      }
      return true;
    });
  }, [dlhdChannels, deferredSearchQuery, selectedCategory, selectedLanguage]);

  const filteredIptvChannels = useMemo(() => {
    const seenNames = new Set();
    const query = (deferredSearchQuery || '').toLowerCase();
    return iptvChannels.filter(ch => {
      const name = (ch.name || '').toLowerCase();
      if (seenNames.has(name)) return false;
      seenNames.add(name);
      
      if (query && !name.includes(query)) return false;

      if (selectedCategory !== 'all') {
        if (!ch.categories || !ch.categories.some(cat => (cat || '').toLowerCase().includes(selectedCategory))) return false;
      }
      if (selectedLanguage !== 'all') {
        if (!ch.languages || !ch.languages.map(l => (l || '').toLowerCase()).includes(selectedLanguage)) return false;
      }
      return true;
    });
  }, [iptvChannels, deferredSearchQuery, selectedCategory, selectedLanguage]);

  const filteredCinemaChannels = useMemo(() => {
    const query = (deferredSearchQuery || '').toLowerCase();
    return cinemaChannels.filter(ch => {
      const name = (ch.name || '').toLowerCase();
      
      if (query && !name.includes(query)) return false;

      if (selectedCategory !== 'all') {
        if (!ch.categories || !ch.categories.some(cat => (cat || '').toLowerCase().includes(selectedCategory))) return false;
      }
      return true;
    });
  }, [cinemaChannels, deferredSearchQuery, selectedCategory]);

  const filteredEvents = useMemo(() => {
    let result = [];
    const nowSecs = Math.floor(Date.now() / 1000);
    const minTime = nowSecs - 4 * 3600;
    const maxTime = nowSecs + 20 * 3600;
    const query = (deferredSearchQuery || '').toLowerCase();

    damiStreams.forEach(group => {
      const categoryMatches = selectedCategory === 'all' || (group.category && group.category.toLowerCase() === selectedCategory);
      if (categoryMatches) {
        group.streams.forEach(stream => {
          const startsAt = stream.starts_at;
          const withinTimeRange = startsAt >= minTime && startsAt <= maxTime;
          if (withinTimeRange && (!query || (stream.name || '').toLowerCase().includes(query))) {
            result.push(stream);
          }
        });
      }
    });
    return result;
  }, [damiStreams, deferredSearchQuery, selectedCategory]);

  const filteredSchedule = useMemo(() => {
    const result = {};
    const nowMs = Date.now();
    const minTime = nowMs - 4 * 3600 * 1000;
    const maxTime = nowMs + 20 * 3600 * 1000;
    const query = (deferredSearchQuery || '').toLowerCase();

    Object.keys(dlhdSchedule).forEach(day => {
      if (selectedCategory === 'all' || selectedCategory === day) {
        const categoriesObj = dlhdSchedule[day];
        const dayMatchResult = {};

        Object.keys(categoriesObj).forEach(catName => {
          const events = categoriesObj[catName];
          const matchedEvents = events.filter(evt => {
            const evtDate = getEventDateTime(day, evt.time);
            const evtTimeMs = evtDate.getTime();
            const withinTimeRange = evtTimeMs >= minTime && evtTimeMs <= maxTime;
            return withinTimeRange && (!query || (evt.event || '').toLowerCase().includes(query));
          });

          if (matchedEvents.length > 0) {
            dayMatchResult[catName] = matchedEvents;
          }
        });

        if (Object.keys(dayMatchResult).length > 0) {
          result[day] = dayMatchResult;
        }
      }
    });
    return result;
  }, [dlhdSchedule, deferredSearchQuery, selectedCategory]);

  // Derived category lists
  const channelCategories = useMemo(() => {
    const cats = new Set(['all']);
    dlhdChannels.forEach(ch => {
      const name = (ch.channel_name || '').toLowerCase();
      if (name.includes('sport') || name.includes('bein') || name.includes('espn') || name.includes('racing') || name.includes('sky')) cats.add('sports');
      else if (name.includes('news') || name.includes('cnn') || name.includes('bbc')) cats.add('news');
      else if (name.includes('movie') || name.includes('cinema') || name.includes('hbo')) cats.add('movies');
      else if (name.includes('kids') || name.includes('cartoon') || name.includes('disney') || name.includes('boomerang')) cats.add('kids');
      else cats.add('general');
    });
    return Array.from(cats);
  }, [dlhdChannels]);

  const iptvCategories = useMemo(() => ['all', 'news', 'music', 'religious', 'entertainment', 'movies', 'culture', 'lifestyle', 'business', 'education', 'general', 'kids', 'sports'], []);

  const channelLanguages = useMemo(() => {
    const langs = new Set(['all']);
    dlhdChannels.forEach(ch => {
      if (ch.languages && ch.languages.length) ch.languages.forEach(l => langs.add(l.toLowerCase()));
    });
    iptvChannels.forEach(ch => {
      if (ch.languages && ch.languages.length) ch.languages.forEach(l => langs.add(l.toLowerCase()));
    });
    return Array.from(langs);
  }, [dlhdChannels, iptvChannels]);

  const eventCategories = useMemo(() => {
    const cats = new Set(['all']);
    damiStreams.forEach(group => {
      if (group.category) cats.add((group.category || '').toLowerCase());
    });
    return Array.from(cats);
  }, [damiStreams]);

  const scheduleDays = useMemo(() => ['all', ...Object.keys(dlhdSchedule)], [dlhdSchedule]);

  return {
    filteredDlhdChannels,
    filteredIptvChannels,
    filteredCinemaChannels,
    filteredEvents,
    filteredSchedule,
    channelCategories,
    iptvCategories,
    channelLanguages,
    eventCategories,
    scheduleDays
  };
};
