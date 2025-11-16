import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { MediaGridSkeleton } from './SkeletonLoader';
import './InfiniteScrollGrid.css';

const InfiniteScrollGrid = ({ 
  items, 
  type, 
  onMediaClick, 
  hasMore, 
  loadMore, 
  currentPage,
  totalPages,
  totalResults,
  MediaItemComponent,
  showLoadMoreButton = true,
  useInfiniteScroll = true
}) => {
  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      loadMore(currentPage + 1);
    }
  };

  if (useInfiniteScroll) {
    return (
      <div className="infinite-scroll-container">
        {totalResults > 0 && (
          <div className="results-count">
            Showing {items.length} of {totalResults} results
          </div>
        )}
        <InfiniteScroll
          dataLength={items.length}
          next={handleLoadMore}
          hasMore={hasMore}
          loader={<MediaGridSkeleton count={4} />}
          endMessage={
            items.length > 0 && (
              <div className="end-message">
                <p>You've reached the end! 🎬</p>
              </div>
            )
          }
        >
          <div className="media-grid">
            {items.map(item => (
              <MediaItemComponent 
                key={item.id} 
                item={item} 
                type={type} 
                onClick={onMediaClick} 
              />
            ))}
          </div>
        </InfiniteScroll>
      </div>
    );
  }

  // Load More Button Mode
  return (
    <div className="load-more-container">
      {totalResults > 0 && (
        <div className="results-count">
          Showing {items.length} of {totalResults} results (Page {currentPage} of {totalPages})
        </div>
      )}
      <div className="media-grid">
        {items.map(item => (
          <MediaItemComponent 
            key={item.id} 
            item={item} 
            type={type} 
            onClick={onMediaClick} 
          />
        ))}
      </div>
      {hasMore && showLoadMoreButton && (
        <div className="load-more-button-container">
          <button 
            className="load-more-button" 
            onClick={handleLoadMore}
            aria-label="Load more results"
          >
            Load More
          </button>
        </div>
      )}
      {!hasMore && items.length > 0 && (
        <div className="end-message">
          <p>You've reached the end! 🎬</p>
        </div>
      )}
    </div>
  );
};

export default InfiniteScrollGrid;
