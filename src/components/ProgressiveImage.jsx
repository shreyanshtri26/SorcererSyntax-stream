import React, { useState, useEffect } from 'react';
import './ProgressiveImage.css';

const ProgressiveImage = ({ 
  src, 
  placeholderSrc, 
  alt, 
  className = '',
  onError,
  loading = 'lazy'
}) => {
  const [imgSrc, setImgSrc] = useState(placeholderSrc || src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.src = src;

    img.onload = () => {
      setImgSrc(src);
      setIsLoading(false);
    };

    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
      if (onError) {
        onError();
      }
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, onError]);

  if (hasError) {
    return (
      <div className={`progressive-image-error ${className}`}>
        <div className="error-placeholder">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
          </svg>
          <span>Image unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={`progressive-image ${isLoading ? 'loading' : 'loaded'} ${className}`}
      loading={loading}
    />
  );
};

export default ProgressiveImage;
