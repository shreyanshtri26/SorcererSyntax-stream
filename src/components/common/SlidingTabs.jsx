import React from 'react';

const SlidingTabs = ({ tabs, activeTab, onTabChange }) => {
  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
  const tabWidth = 100 / tabs.length;
  const leftPosition = activeIndex * tabWidth;

  return (
    <div className="sliding-tabs-container">
      <div className="sliding-tabs">
        <div
          className="tab-indicator"
          style={{
            left: `calc(${leftPosition}% + 2px)`,
            width: `calc(${tabWidth}% - 4px)`
          }}
        ></div>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SlidingTabs;
