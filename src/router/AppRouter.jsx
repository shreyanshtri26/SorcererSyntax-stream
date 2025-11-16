import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PlayerProvider } from '../context/PlayerContext';
import LoadingSpinner from '../components/LoadingSpinner';

// Lazy load components for better performance
const App = React.lazy(() => import('../App'));
const MediaDetails = React.lazy(() => import('../pages/MediaDetails'));
const PersonDetails = React.lazy(() => import('../pages/PersonDetails'));

const AppRouter = () => {
  return (
    <Router>
      <PlayerProvider>
        <Suspense fallback={<LoadingSpinner />}>
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

            {/* Music routes */}
            <Route path="/music" element={<App />} />
            <Route path="/artist/:id" element={<App />} />
            <Route path="/album/:id" element={<App />} />

            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </PlayerProvider>
    </Router>
  );
};

export default AppRouter;