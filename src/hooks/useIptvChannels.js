import { useState, useEffect } from 'react';

export const useIptvChannels = (activeTab, channelSource, selectedCountry) => {
  const [iptvChannels, setIptvChannels] = useState([]);
  const [loadingIptvChannels, setLoadingIptvChannels] = useState(false);
  const [countriesList, setCountriesList] = useState([]);

  // Fetch the index list of countries on mount
  useEffect(() => {
    let isMounted = true;
    const fetchIndex = async () => {
      try {
        const res = await fetch('/data/iptv/index.json');
        if (res.ok && isMounted) {
          const indexData = await res.json();
          setCountriesList(indexData);
        }
      } catch (e) {
        console.error('Failed to load IPTV index', e);
      }
    };
    fetchIndex();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadIptvChannels = async () => {
      if (activeTab !== 'channels' || channelSource !== 'iptv') return;
      
      try {
        setLoadingIptvChannels(true);
        let data = [];

        if (selectedCountry === 'all') {
          const cacheKey = 'iptv_all_countries_v2';
          const cacheTime = sessionStorage.getItem(cacheKey + '_time');
          const cachedData = sessionStorage.getItem(cacheKey);
          
          if (cachedData && cacheTime && (Date.now() - parseInt(cacheTime)) < 3600 * 1000) {
            data = JSON.parse(cachedData);
          } else {
            const idxRes = await fetch('/data/iptv/index.json');
            const idx = idxRes.ok ? await idxRes.json() : [];
            
            // To prevent blocking, we might load only a few chunks first or process them sequentially
            const chunkArray = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));
            const chunks = chunkArray(idx, 10); // slightly smaller chunk
            
            for (const chunk of chunks) {
              if (!isMounted) return;
              const promises = chunk.map(c => fetch(`/data/iptv/countries/${c.code}.json`).then(r => r.ok ? r.json() : []).catch(() => []));
              const results = await Promise.all(promises);
              data = data.concat(results.flat());
            }

            if (isMounted) {
              try {
                // Clear old caches first
                Object.keys(sessionStorage).forEach(k => {
                  if (k.startsWith('iptv_all_countries') && k !== cacheKey) {
                    sessionStorage.removeItem(k);
                  }
                });
                sessionStorage.setItem(cacheKey, JSON.stringify(data));
                sessionStorage.setItem(cacheKey + '_time', Date.now().toString());
              } catch (cacheErr) {
                console.warn('Failed to cache IPTV data (quota exceeded)', cacheErr);
              }
            }
          }
        } else if (selectedCountry) {
          const res = await fetch(`/data/iptv/countries/${selectedCountry}.json`);
          if (res.ok) data = await res.json();
        }

        if (isMounted) {
          setIptvChannels(data);
          setLoadingIptvChannels(false);
        }
      } catch (err) {
        console.error('Error loading IPTV channels:', err);
        if (isMounted) setLoadingIptvChannels(false);
      }
    };

    loadIptvChannels();

    return () => {
      isMounted = false;
    };
  }, [activeTab, channelSource, selectedCountry]);

  return { iptvChannels, setIptvChannels, loadingIptvChannels, setLoadingIptvChannels, countriesList };
};
