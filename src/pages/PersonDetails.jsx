import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PersonDetailsModal from '../contexts/PersonDetailsModal';
import Header from '../contexts/Header';
import { IMAGE_BASE_URL } from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLocalStorage } from '../hooks/useLocalStorage';

const PersonDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [person, setPerson] = useState(null);
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

  useEffect(() => {
    const fetchPersonDetails = async () => {
      if (!id) {
        setError('No person ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // For now, we'll create a mock person object
        // In a real app, you'd fetch from TMDB person endpoint
        const mockPerson = {
          id: parseInt(id),
          name: `Person ${id}`,
          profile_path: null,
          known_for_department: 'Acting',
          popularity: 85.5,
          known_for: []
        };
        
        setPerson(mockPerson);
      } catch (err) {
        console.error('Error fetching person details:', err);
        setError('Failed to load person details');
      } finally {
        setLoading(false);
      }
    };

    fetchPersonDetails();
  }, [id]);

  const handleClose = () => {
    navigate('/');
  };

  const handleThemeChange = (theme) => {
    setUserPreferences(prev => ({ ...prev, theme }));
  };

  const handleKnownItemClick = (item, mediaType) => {
    // Navigate to the media details page
    navigate(`/${mediaType}/${item.id}`);
  };

  if (loading) {
    return <LoadingSpinner message="Loading person details..." theme={currentTheme} />;
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

  if (!person) {
    return (
      <div className={`App theme-${currentTheme}`}>
        <Header
          onTitleClick={() => navigate('/')}
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
        />
        <div className="error-container">
          <h2>Person Not Found</h2>
          <p>The requested person could not be found.</p>
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
      
      <PersonDetailsModal
        person={person}
        imageBaseUrl={IMAGE_BASE_URL}
        onClose={handleClose}
        currentTheme={currentTheme}
        onKnownForItemClick={handleKnownItemClick}
      />
    </div>
  );
};

export default PersonDetails;