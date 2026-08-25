import React from 'react';
import { motion } from 'framer-motion';

const SlidingTabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="sliding-tabs-container">
      <div className="sliding-tabs" role="tablist">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              className={`tab-button ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              {isActive && (
                <motion.div
                  layoutId="sliding-tab-pill"
                  className="tab-indicator"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span className="tab-label">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SlidingTabs;
