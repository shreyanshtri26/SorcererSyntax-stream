import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

// Lazy load components for better performance
const App = React.lazy(() => import('../App'));
const MediaDetails = React.lazy(() => import('../pages/MediaDetails'));
const PersonDetails = React.lazy(() => import('../pages/PersonDetails'));

const AppRouter = () => {
  // Get theme from localStorage for the loading spinner
  const getThemeFromStorage = () => {
    try {
      const stored = window.localStorage.getItem('userPreferences');
      if (stored) {
        const prefs = JSON.parse(stored);
        return prefs.theme || 'devil';
      }
    } catch (error) {
      console.error('Error reading theme from localStorage:', error);
    }
    return 'devil';
  };

  const currentTheme = getThemeFromStorage();

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Suspense fallback={<LoadingSpinner theme={currentTheme} message="Loading..." />}>
          <Routes>
            {/* Main app route */}
            <Route path="/" element={<App />} />

            {/* Media detail routes with IDs */}
            <Route path="/movie/:id" element={<MediaDetails type="movie" />} />
            <Route path="/tv/:id" element={<MediaDetails type="tv" />} />
            <Route path="/tv/:id/season/:season/episode/:episode" element={<MediaDetails type="tv" />} />

            {/* Person detail route */}
            <Route path="/person/:id" element={<PersonDetails />} />

            {/* Search routes */}
            <Route path="/search" element={<App />} />
            <Route path="/search/:query" element={<App />} />

            {/* TV & Sports direct channel routes */}
            <Route path="/tv-sports" element={<App />} />
            <Route path="/channel/:slug" element={<App />} />
            <Route path="/channel" element={<App />} />
            <Route path="/sports/:id" element={<App />} />
            <Route path="/sports" element={<App />} />

            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
    </Router>
  );
};

export default AppRouter;