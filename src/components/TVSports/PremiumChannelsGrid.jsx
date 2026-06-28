import React, { useState, useEffect, useRef } from 'react';
import { getDlhdLogoUrl } from '../../api/dlhdApi';
import { TVGridSkeleton } from '../SkeletonLoader';

const PremiumChannelsGrid = ({ 
  filteredDlhdChannels, 
  handlePlayDlhdChannel, 
  searchQuery, 
  getChannelInitial,
  isLoading,
  currentTheme = 'devil'
}) => {
  const [visibleCount, setVisibleCount] = useState(50);
  const loaderRef = useRef(null);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(50);
  }, [filteredDlhdChannels, searchQuery]);

  // Intersection Observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filteredDlhdChannels.length) {
          setVisibleCount((prev) => prev + 50);
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [visibleCount, filteredDlhdChannels.length]);

  return (
    <div className="channels-grid-container">
      {isLoading && filteredDlhdChannels.length === 0 && (
        <div style={{ marginTop: '20px', width: '100%' }}>
          <TVGridSkeleton count={20} theme={currentTheme} />
        </div>
      )}
      <div className="channels-grid">
        {filteredDlhdChannels.length > 0 ? (
          filteredDlhdChannels.slice(0, visibleCount).map(ch => (
            <div
              key={ch.channel_id}
              className="channel-card"
              onClick={() => handlePlayDlhdChannel(ch.channel_id)}
            >
              <div className="logo-container">
                {ch.logo_url ? (
                  <img
                    src={getDlhdLogoUrl(ch.logo_url)}
                    alt={ch.channel_name}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="channel-logo-fallback"
                  style={{ 
                    display: ch.logo_url ? 'none' : 'flex',
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1540747737956-fd63f8df16dd?w=300&q=80&sig=${ch.channel_name.length}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    width: '100%',
                    height: '100%',
                    borderRadius: '0'
                  }}
                >
                  {getChannelInitial(ch.channel_name)}
                </div>
              </div>
              <div className="channel-info">
                <h4 className="channel-name" title={ch.channel_name}>{ch.channel_name}</h4>
                <span className="live-pill">
                  <span className="live-dot"></span> LIVE
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <i className="fa-regular fa-folder-open"></i>
            <p>No premium channels matching "{searchQuery}" found.</p>
          </div>
        )}
      </div>
      
      {/* Invisible loader element at the bottom of the grid */}
      {visibleCount < filteredDlhdChannels.length && (
        <div ref={loaderRef} style={{ height: '20px', width: '100%', marginTop: '20px' }} />
      )}
    </div>
  );
};

export default React.memo(PremiumChannelsGrid);
