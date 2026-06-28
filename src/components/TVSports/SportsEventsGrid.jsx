import React, { useState, useEffect, useRef } from 'react';
import { TVGridSkeleton } from '../SkeletonLoader';

const SportsEventsGrid = ({ 
  filteredEvents, 
  handlePlayEvent, 
  searchQuery, 
  formatEventTime, 
  getEventStatusDisplay,
  isLoading,
  currentTheme = 'devil'
}) => {
  const [visibleCount, setVisibleCount] = useState(50);
  const loaderRef = useRef(null);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(50);
  }, [filteredEvents, searchQuery]);

  // Intersection Observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filteredEvents.length) {
          setVisibleCount((prev) => prev + 50);
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [visibleCount, filteredEvents.length]);

  return (
    <div className="channels-grid-container">
      {isLoading && filteredEvents.length === 0 && (
        <div style={{ marginTop: '20px', width: '100%' }}>
          <TVGridSkeleton count={20} theme={currentTheme} />
        </div>
      )}
      <div className="events-grid">
        {filteredEvents.length > 0 ? (
          filteredEvents.slice(0, visibleCount).map((evt, idx) => (
            <div
              key={evt.id || idx}
              className="event-card"
              onClick={() => handlePlayEvent(evt.id)}
            >
              <div className="event-poster-container">
                <img src={evt.poster} alt={evt.name} onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=60';
                }} />
                <div className="event-status">
                  {evt.status === 'live' ? (
                    <span className="badge-live"><span className="live-dot"></span> LIVE</span>
                  ) : (
                    <span className="badge-upcoming">UPCOMING</span>
                  )}
                </div>
                {evt.viewers > 0 && (
                  <div className="event-viewers">
                    <i className="fa-solid fa-eye"></i> {evt.viewers} watching
                  </div>
                )}
              </div>

              <div className="event-info">
                <span className="event-league">{evt.league || evt.category_name?.toUpperCase()}</span>
                <h4 className="event-title">{evt.name}</h4>

                <div className="event-teams">
                  {evt.teams && (
                    <>
                      <span className="team">{evt.teams.home.name}</span>
                      <span className="vs">VS</span>
                      <span className="team">{evt.teams.away.name}</span>
                    </>
                  )}
                </div>

                <div className="event-time">
                  <i className="fa-regular fa-clock"></i>{' '}
                  {new Date(evt.starts_at * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <i className="fa-regular fa-calendar-minus"></i>
            <p>No active/upcoming events found.</p>
          </div>
        )}
      </div>

      {/* Invisible loader element at the bottom of the grid */}
      {visibleCount < filteredEvents.length && (
        <div ref={loaderRef} style={{ height: '20px', width: '100%', marginTop: '20px' }} />
      )}
    </div>
  );
};

export default React.memo(SportsEventsGrid);
