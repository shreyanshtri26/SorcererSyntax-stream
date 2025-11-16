import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback } from 'react';

export const useUrlState = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Navigate to media details with ID (and optional season/episode for TV)
  const navigateToMedia = useCallback((media, type, season = null, episode = null) => {
    if (media && media.id && type) {
      if (type === 'tv' && season && episode) {
        navigate(`/tv/${media.id}/season/${season}/episode/${episode}`);
      } else {
        navigate(`/${type}/${media.id}`);
      }
    }
  }, [navigate]);

  // Navigate to person details with ID
  const navigateToPerson = useCallback((person) => {
    if (person && person.id) {
      navigate(`/person/${person.id}`);
    }
  }, [navigate]);

  // Navigate to specific TV episode
  const navigateToTVEpisode = useCallback((tvId, season, episode) => {
    if (tvId && season && episode) {
      navigate(`/tv/${tvId}/season/${season}/episode/${episode}`);
    }
  }, [navigate]);

  // Navigate to search with query
  const navigateToSearch = useCallback((query) => {
    if (query) {
      navigate(`/search/${encodeURIComponent(query)}`);
    } else {
      navigate('/search');
    }
  }, [navigate]);

  // Navigate back to home
  const navigateToHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  // Get current route info
  const getCurrentRoute = useCallback(() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    return {
      path: location.pathname,
      type: pathParts[0],
      id: pathParts[1],
      query: pathParts[1] && pathParts[0] === 'search' ? decodeURIComponent(pathParts[1]) : null
    };
  }, [location]);

  return {
    navigateToMedia,
    navigateToPerson,
    navigateToSearch,
    navigateToHome,
    navigateToTVEpisode,
    getCurrentRoute,
    currentPath: location.pathname
  };
};

export default useUrlState;