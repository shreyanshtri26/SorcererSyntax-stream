import React from 'react';

const ScheduleView = ({ filteredSchedule, handlePlayDlhdChannel }) => {
  return (
    <div className="schedule-container">
      {Object.keys(filteredSchedule).length > 0 ? (
        Object.keys(filteredSchedule).map(day => (
          <div key={day} className="schedule-day-group">
            <h3 className="schedule-day-header">{day}</h3>
            {Object.keys(filteredSchedule[day]).map(category => (
              <div key={category} className="schedule-category-group">
                <h4 className="schedule-category-header">
                  <i className="fa-solid fa-circle-play"></i> {category}
                </h4>
                <div className="schedule-events-list">
                  {filteredSchedule[day][category].map((evt, idx) => (
                    <div key={idx} className="schedule-event-row">
                      <div className="event-time-col">{evt.time}</div>
                      <div className="event-detail-col">
                        <span className="event-title">{evt.event}</span>
                        <div className="event-channels-tags">
                          {evt.channels && evt.channels.map(ch => (
                            <button
                              key={ch.channel_id}
                              className="channel-tag"
                              onClick={() => handlePlayDlhdChannel(ch.channel_id)}
                            >
                              <i className="fa-solid fa-play"></i> {ch.channel_name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))
      ) : (
        <div className="no-results">
          <i className="fa-regular fa-calendar-times"></i>
          <p>No schedule listings found.</p>
        </div>
      )}
    </div>
  );
};

export default React.memo(ScheduleView);
