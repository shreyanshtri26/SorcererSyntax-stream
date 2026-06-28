import React, { useState, useEffect, useRef } from 'react';
import { TVGridSkeleton } from '../SkeletonLoader';

const WorldwideTVGrid = ({
  filteredIptvChannels,
  handlePlayHlsChannel,
  searchQuery,
  getChannelInitial,
  isIptvLoading,
  currentTheme = 'devil'
}) => {
  const [visibleCount, setVisibleCount] = useState(50);
  const loaderRef = useRef(null);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(50);
  }, [filteredIptvChannels, searchQuery]);

  // Intersection Observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filteredIptvChannels.length) {
          setVisibleCount((prev) => prev + 50);
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [visibleCount, filteredIptvChannels.length]);

  return (
    <div className="channels-grid-container">
      {isIptvLoading && filteredIptvChannels.length === 0 && (
        <div style={{ marginTop: '20px', width: '100%' }}>
          <TVGridSkeleton count={20} theme={currentTheme} />
        </div>
      )}

      <div className="channels-grid">
        {filteredIptvChannels.length > 0 ? (
          filteredIptvChannels.slice(0, visibleCount).map((ch, idx) => (
            <div
              key={ch.id || idx}
              className="channel-card"
              onClick={() => handlePlayHlsChannel(ch)}
            >
              <div className="logo-container">
                {ch.logo ? (
                  <img
                    src={ch.logo}
                    alt={ch.name}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="channel-logo-fallback"
                  style={{ 
                    display: ch.logo ? 'none' : 'flex',
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1540747737956-fd63f8df16dd?w=300&q=80&sig=${ch.name.length}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    width: '100%',
                    height: '100%',
                    borderRadius: '0'
                  }}
                >
                  {getChannelInitial(ch.name)}
                </div>
              </div>
              <div className="channel-info">
                <h4 className="channel-name" title={ch.name}>{ch.name}</h4>
                <span className="live-pill">
                  <span className="live-dot"></span> LIVE
                </span>
              </div>
            </div>
          ))
        ) : (
          !isIptvLoading && (
            <div className="no-results">
              <i className="fa-regular fa-folder-open"></i>
              <p>No worldwide channels matching "{searchQuery}" found.</p>
            </div>
          )
        )}
      </div>
      
      {/* Invisible loader element at the bottom of the grid */}
      {visibleCount < filteredIptvChannels.length && (
        <div ref={loaderRef} style={{ height: '20px', width: '100%', marginTop: '20px' }} />
      )}
    </div>
  );
};

export default React.memo(WorldwideTVGrid);
