import React, { useState } from 'react';

/**
 * Generate a clean 1-2 letter abbreviation for fallback avatars
 */
const getInitials = (text = '') => {
  if (!text) return 'TV';
  const clean = text.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase() || 'TV';
};

/**
 * Generate a consistent background gradient based on the text hash
 */
const getGradientForText = (text = '') => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    'linear-gradient(135deg, #8A2387 0%, #E94057 50%, #F27121 100%)',
    'linear-gradient(135deg, #134E5E 0%, #71B280 100%)',
    'linear-gradient(135deg, #4b134f 0%, #c94b4b 100%)',
    'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
    'linear-gradient(135deg, #16222A 0%, #3A6073 100%)',
    'linear-gradient(135deg, #e50914 0%, #800000 100%)'
  ];
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

/**
 * Safe Image component that never shows broken icons or blank gaps
 */
export const SafeImage = ({ src, alt = '', className = '', fallbackClass = '', type = 'flag' }) => {
  const [hasError, setHasError] = useState(!src || src.includes('undefined') || src.includes('null'));

  if (hasError || !src) {
    const initials = getInitials(alt);
    const gradient = getGradientForText(alt);

    if (type === 'logo') {
      return (
        <div
          className={`safe-fallback-logo ${fallbackClass}`}
          style={{ background: gradient }}
          title={alt}
        >
          <span>{initials}</span>
        </div>
      );
    }

    if (type === 'chip') {
      return (
        <span
          className={`safe-fallback-chip ${fallbackClass}`}
          style={{ background: gradient }}
        >
          {initials[0]}
        </span>
      );
    }

    // Default: flag / avatar
    return (
      <div
        className={`safe-fallback-flag ${fallbackClass}`}
        style={{ background: gradient }}
        title={alt}
      >
        <span>{initials}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
};

export default SafeImage;
