import React, { Suspense } from 'react';
import './LoadingSpinner.css';

const ThreeLoadingScene = React.lazy(() => import('./three/ThreeLoadingScene'));

// CSS fallback spinner
const CSSSpinner = ({ size, message, theme }) => (
  <div className={`loading-spinner-container theme-${theme}`}>
    <div className={`loading-spinner ${size}`}>
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
    </div>
    {message && <p className="loading-message">{message}</p>}
  </div>
);

const LoadingSpinner = ({ size = 'medium', message = 'Loading...', theme = 'devil' }) => {
  return (
    <Suspense fallback={<CSSSpinner size={size} message={message} theme={theme} />}>
      <ThreeLoadingScene theme={theme} message={message} />
    </Suspense>
  );
};

export default LoadingSpinner;
