import './SkeletonLoader.css';

export const MediaItemSkeleton = ({ theme = 'devil' }) => (
  <div className={`media-item skeleton theme-${theme}`}>
    <div className="skeleton-poster"></div>
    <div className="skeleton-info">
      <div className="skeleton-title"></div>
      <div className="skeleton-rating"></div>
    </div>
  </div>
);

export const MediaGridSkeleton = ({ count = 20, theme = 'devil' }) => (
  <div className="media-grid">
    {Array.from({ length: count }).map((_, index) => (
      <MediaItemSkeleton key={index} theme={theme} />
    ))}
  </div>
);

export const SearchResultSkeleton = ({ theme = 'devil' }) => (
  <div className={`search-result-item skeleton theme-${theme}`}>
    <div className="skeleton-search-image"></div>
    <div className="skeleton-search-info">
      <div className="skeleton-search-title"></div>
      <div className="skeleton-search-meta"></div>
    </div>
  </div>
);

export const TVChannelSkeleton = ({ theme = 'devil' }) => (
  <div className={`channel-card skeleton theme-${theme}`}>
    <div className="skeleton-tv-logo"></div>
    <div className="channel-info">
      <div className="skeleton-tv-title"></div>
      <div className="skeleton-tv-meta"></div>
    </div>
  </div>
);

export const TVGridSkeleton = ({ count = 12, theme = 'devil' }) => (
  <div className="channels-grid">
    {Array.from({ length: count }).map((_, index) => (
      <TVChannelSkeleton key={index} theme={theme} />
    ))}
  </div>
);

export default MediaGridSkeleton;
