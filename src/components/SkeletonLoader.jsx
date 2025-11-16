import React from 'react';
import './SkeletonLoader.css';

export const MediaItemSkeleton = () => (
  <div className="media-item skeleton">
    <div className="skeleton-poster"></div>
    <div className="skeleton-info">
      <div className="skeleton-title"></div>
      <div className="skeleton-rating"></div>
    </div>
  </div>
);

export const MediaGridSkeleton = ({ count = 20 }) => (
  <div className="media-grid">
    {Array.from({ length: count }).map((_, index) => (
      <MediaItemSkeleton key={index} />
    ))}
  </div>
);

export const SearchResultSkeleton = () => (
  <div className="search-result-item skeleton">
    <div className="skeleton-search-image"></div>
    <div className="skeleton-search-info">
      <div className="skeleton-search-title"></div>
      <div className="skeleton-search-meta"></div>
    </div>
  </div>
);

export default MediaGridSkeleton;
