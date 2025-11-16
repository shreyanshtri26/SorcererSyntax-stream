import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import PlayerModal from '../contexts/PlayerModal';
import Header from '../contexts/Header';
import { getMovieDetails, getTVShowDetails } from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLocalStorage } from '../hooks/useLocalStorage';

const MediaDetails = ({ type: propType }) => {
  const { id, season, episode } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use shared theme from localStorage
  const [userPreferences, setUserPreferences] = useLocalStorage('userPreferences', {
    theme: 'devil',
    language: 'en',
    useInfiniteScroll: true,
    autoplayTrailers: typeof window !== 'undefined' && window.innerWidth > 768,
    recentSearches: []
  });
  
  const currentTheme = userPreferences.theme;

  // Get type from props or URL params
  const mediaType = propType || searchParams.get('type') || 'movie';

  useEffect(() => {
    const fetchMediaDetails = async () => {
      if (!id) {
        setError('No media ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch media details using the proper API endpoint
        console.log('Fetching media details for:', { id, mediaType, season, episode });
        const mediaDetails = mediaType === 'movie' 
          ? await getMovieDetails(id) 
          : await getTVShowDetails(id);
        
        console.log('Received media details:', mediaDetails);
        
        if (mediaDetails) {
          setMedia(mediaDetails);
        } else {
          setError(`${mediaType === 'movie' ? 'Movie' : 'TV Show'} not found`);
        }
      } catch (err) {
        console.error('Error fetching media details:', err);
        setError('Failed to load media details');
      } finally {
        setLoading(false);
      }
    };

    fetchMediaDetails();
  }, [id, mediaType]);

  const handleClose = () => {
    navigate('/');
  };

  // Debug logging
  console.log('MediaDetails render:', { id, season, episode, mediaType, media, loading, error });

  const handleThemeChange = (theme) => {
    setUserPreferences(prev => ({ ...prev, theme }));
  };

  if (loading) {
    return <LoadingSpinner message={`Loading ${mediaType === 'movie' ? 'movie' : 'TV show'} details...`} theme={currentTheme} />;
  }

  if (error) {
    return (
      <div className={`App theme-${currentTheme}`}>
        <Header
          onTitleClick={() => navigate('/')}
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
        />
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="back-button">
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  if (!media) {
    return (
      <div className={`App theme-${currentTheme}`}>
        <Header
          onTitleClick={() => navigate('/')}
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
        />
        <div className="error-container">
          <h2>Media Not Found</h2>
          <p>The requested {mediaType === 'movie' ? 'movie' : 'TV show'} could not be found.</p>
          <button onClick={() => navigate('/')} className="back-button">
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`App theme-${currentTheme}`}>
      <Header
        onTitleClick={() => navigate('/')}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
      />
      
      <PlayerModal
        media={media}
        type={mediaType}
        onClose={handleClose}
        currentTheme={currentTheme}
      />
    </div>
  );
};

export default MediaDetails;