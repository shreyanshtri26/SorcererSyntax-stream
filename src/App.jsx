import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import useUrlState from './hooks/useUrlState';

import Header from './contexts/Header';
import PlayerModal from './contexts/PlayerModal';
import PersonDetailsModal from './contexts/PersonDetailsModal';
import PersistentMusicPlayer from './components/PersistentMusicPlayer';

// Pages
import SearchPage from './pages/SearchPage';
import MusicPage from './pages/MusicPage';

import { IMAGE_BASE_URL } from './api/api';
import ChatBot from './components/ChatBot';
import './App.css';

// --- Helper Function for Themed Titles ---
const getThemedTitle = (defaultTitle, theme) => {
  if (theme !== 'hannibal') {
    return defaultTitle;
  }
  const hannibalTitles = {
    "Trending Movies": "Fleeting Appetizers (Movies)",
    "Trending TV Shows": "Serial Distractions (TV)",
    "Top Rated Movies": "Prized Specimens (Movies)",
    "Top Rated TV Shows": "Long-Term Studies (TV)",
    "Filtered Results": "Curated Selection",
  };
  if (defaultTitle.startsWith("Search Results:")) {
    const query = defaultTitle.substring("Search Results: ".length);
    return `The Hunt: ${query}`;
  }
  return hannibalTitles[defaultTitle] || defaultTitle;
};

// --- App Component (Layout & Router) ---
function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { navigateToMedia, navigateToPerson, navigateToHome } = useUrlState();

  const [userPreferences, setUserPreferences] = useLocalStorage('userPreferences', {
    theme: 'devil',
    language: 'en',
    useInfiniteScroll: true,
    autoplayTrailers: typeof window !== 'undefined' && window.innerWidth > 768,
    recentSearches: []
  });

  const [currentTheme, setCurrentTheme] = useState(userPreferences.theme || 'devil');
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedMediaType, setSelectedMediaType] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false); // For modal

  const [isMobile, setIsMobile] = useState(false);
  const VITE_API_KEY = "9a5a0e6e93d4b73e87566b319e8cfb95";

  // MusicHub State (Preserved in App for persistence if we wanted, 
  // but MusicPage holds the state via MusicHub. 
  // Wait, if we unmount MusicHub, music stops. 
  // The structure here unmounts MusicPage when going to Media. 
  // This is acceptable behavior for "switching apps" metaphor.)
  const musicHubRef = useRef(null);
  const [musicNavStackState, setMusicNavStackState] = useState(null);

  // Determine Active Section based on Path
  const isMusicSection = location.pathname.startsWith('/music') || location.pathname.startsWith('/artist') || location.pathname.startsWith('/album');
  const activeSection = isMusicSection ? 'music' : 'media';

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (userPreferences.theme && userPreferences.theme !== currentTheme) {
      setCurrentTheme(userPreferences.theme);
    }
  }, [userPreferences.theme]);

  const handleThemeChange = (themeName) => {
    setCurrentTheme(themeName);
    setUserPreferences(prev => ({ ...prev, theme: themeName }));
    window.scrollTo(0, 0);
  };

  const handleTitleClick = () => {
    navigate('/');
    window.scrollTo(0, 0);
  };

  const handleSectionChange = (section) => {
    if (section === 'music') navigate('/music');
    else navigate('/');
  };

  // Modal Handlers
  const handleMediaClick = (media, type, trailerRequested = false) => {
    // If trailer requested (from hover), open modal with trailer
    if (trailerRequested) {
      setSelectedMedia(media);
      setSelectedMediaType(type);
      setShowTrailer(true);
      setIsPlayerModalOpen(true);
    } else {
      // Navigate to details page
      navigateToMedia(media, type);
    }
  };

  const closeModal = () => {
    setIsPlayerModalOpen(false);
    setIsPersonModalOpen(false);
    setSelectedMedia(null);
    setSelectedPerson(null);
    setShowTrailer(false);
  };

  const handlePersonClick = (person) => {
    navigateToPerson(person);
  };

  const getSectionTitle = (defaultTitle) => getThemedTitle(defaultTitle, currentTheme);

  // Keyboard
  useKeyboardNavigation({
    onEscape: () => {
      if (isPlayerModalOpen || isPersonModalOpen) closeModal();
    }
  }, !isPlayerModalOpen && !isPersonModalOpen);

  // Touch handlers
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && activeSection === 'media') navigate('/music');
    if (isRightSwipe && activeSection === 'music') navigate('/');
  };

  return (
    <div className={`App theme-${currentTheme}`} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <Suspense fallback={<div className="loading-text">Loading Header...</div>}>
        <Header
          onTitleClick={handleTitleClick}
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
        />
      </Suspense>

      {/* Navigator Slider */}
      {!isPlayerModalOpen && !isPersonModalOpen && (
        <div className="section-navigator-container">
          <div className="sliding-tabs-container">
            <div className="sliding-tabs">
              <div
                className="tab-indicator"
                style={{
                  left: activeSection === 'media' ? '2px' : 'calc(50% - 2px)',
                  width: 'calc(50% - 4px)'
                }}
              ></div>
              <button
                className={`tab-button ${activeSection === 'media' ? 'active' : ''}`}
                onClick={() => handleSectionChange('media')}
              >
                Media
              </button>
              <button
                className={`tab-button ${activeSection === 'music' ? 'active' : ''}`}
                onClick={() => handleSectionChange('music')}
              >
                Music
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area with Animated Transitions */}
      <AnimatePresence mode="wait">
        {activeSection === 'media' ? (
          <motion.div
            key="media-section"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
          >
            {/* SearchPage acts as the Media Container (Search + Home) */}
            <SearchPage
              currentTheme={currentTheme}
              userPreferences={userPreferences}
              onMediaClick={handleMediaClick}
              onPersonClick={handlePersonClick}
              getSectionTitle={getSectionTitle}
              VITE_API_KEY={VITE_API_KEY}
            />
          </motion.div>
        ) : (
          <MusicPage
            key="music-section"
            ref={musicHubRef}
            currentTheme={currentTheme}
          />
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {isPlayerModalOpen && selectedMedia && (
          <PlayerModal
            isOpen={isPlayerModalOpen}
            onClose={closeModal}
            mediaType={selectedMediaType}
            mediaId={selectedMedia.id}
            initialTrailer={showTrailer}
            currentTheme={currentTheme}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPersonModalOpen && selectedPerson && (
          <PersonDetailsModal
            isOpen={isPersonModalOpen}
            onClose={closeModal}
            person={selectedPerson}
            imageBaseUrl={IMAGE_BASE_URL}
            currentTheme={currentTheme}
            onKnownForItemClick={(item, type) => {
              closeModal();
              navigateToMedia(item, type);
            }}
          />
        )}
      </AnimatePresence>

      {/* PERSISTENT GLOBAL PLAYER - Now restricted to Music section */}
      {activeSection === 'music' && (
        <PersistentMusicPlayer currentTheme={currentTheme} />
      )}

      {/* Mausi Chatbot */}
      <ChatBot currentTheme={currentTheme} onMediaClick={handleMediaClick} />

    </div>
  );
}

export default App;
