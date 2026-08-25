import { useState, useEffect } from 'react';
import { fetchDlhdChannels, fetchDlhdSchedule } from '../api/dlhdApi';
import { fetchDamiStreams } from '../api/damiApi';

export const useTvData = () => {
  const [dlhdChannels, setDlhdChannels] = useState([]);
  const [cinemaChannels, setCinemaChannels] = useState([]);
  const [damiStreams, setDamiStreams] = useState([]);
  const [dlhdSchedule, setDlhdSchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadAllData = async () => {
      try {
        setLoading(true);
        const [channels, streams, schedule] = await Promise.all([
          fetchDlhdChannels(),
          fetchDamiStreams(),
          fetchDlhdSchedule()
        ]);

        if (isMounted) {
          setDlhdChannels(channels || []);
          setDamiStreams(streams || []);
          setDlhdSchedule(schedule || {});
        }

        // Fetch CinemaOS Channels
        try {
          const cinemaRes = await fetch('/api/cinemaos');
          if (cinemaRes.ok) {
            const cinemaData = await cinemaRes.json();
            if (cinemaData && Array.isArray(cinemaData.channels) && isMounted) {
              const mappedCinemaChannels = cinemaData.channels
                .filter(c => c.playable)
                .map(c => ({
                  id: c.id,
                  name: c.name,
                  logo: c.logo_url,
                  categories: [(c.category || 'general').toLowerCase()],
                  languages: ['all'],
                  countries: ['all'],
                  iframeUrl: `https://embed.st/embed/admin/${c.id}/1`
                }));
              setCinemaChannels(mappedCinemaChannels);
            }
          }
        } catch (e) {
          console.error('Failed to fetch CinemaOS channels', e);
        }

        if (isMounted) setLoading(false);
      } catch (err) {
        console.error('Failed to load streaming data:', err);
        if (isMounted) {
          setError('Could not load channels. Please try again.');
          setLoading(false);
        }
      }
    };

    loadAllData();

    return () => {
      isMounted = false;
    };
  }, []);

  return { dlhdChannels, cinemaChannels, damiStreams, dlhdSchedule, loading, error };
};
