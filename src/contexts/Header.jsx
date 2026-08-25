import React from 'react';
import './Header.css';
import HeaderScene from '../components/three/HeaderScene';
import ParallaxWrapper from '../components/three/ParallaxWrapper';

// Import theme icons
import devilIcon from './assets/devil-icon.svg';
import angelIcon from './assets/angel-icon.svg';
import hannibalIcon from './assets/hannibal-icon.svg';

const Header = ({ onTitleClick, currentTheme, onThemeChange }) => {

  // Function to get the appropriate icon character for the title
  const getTitleIcon = () => {
    switch (currentTheme) {
      case 'devil': return '⛧';
      case 'angel': return '✨';
      case 'hannibal': return '🌿';
      default: return '⛧';
    }
  };

  // Single button that cycles through themes
  const cycleTheme = () => {
    const themes = ['devil', 'hannibal', 'angel'];
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    onThemeChange(themes[nextIndex]);
  };

  // Render the current theme icon in the single button
  const renderThemeButton = () => {
    let iconSrc;
    let themeTitle;
    
    switch (currentTheme) {
      case 'devil':
        iconSrc = devilIcon;
        themeTitle = 'Devil Theme';
        break;
      case 'angel':
        iconSrc = angelIcon;
        themeTitle = 'Angel Theme';
        break;
      case 'hannibal':
        iconSrc = hannibalIcon;
        themeTitle = 'Hannibal Theme';
        break;
      default:
        iconSrc = devilIcon;
        themeTitle = 'Devil Theme';
    }

    return (
      <div className="theme-switcher">
        <button 
          className="theme-button theme-cycle-button active"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            cycleTheme();
          }}
          type="button"
          aria-label="Change Theme"
          title={`Current: ${themeTitle} - Click to change theme`}
        >
          <img src={iconSrc} alt={themeTitle} className="theme-icon" style={{ pointerEvents: 'none' }} />
        </button>
      </div>
    );
  };

  // Render bong and joint elements with smoke (only for Hannibal theme)
  const renderSmokeElements = () => {
    if (currentTheme !== 'hannibal') return null;
    
    return (
      <>
        {/* Bong with smoke particles */}
        <div className="bong-smoke-elements">
          <div className="bong-smoke-particle1"></div>
          <div className="bong-smoke-particle2"></div>
          <div className="bong-smoke-particle3"></div>
        </div>
        
        {/* Joint with smoke particles */}
        <div className="joint-smoke-elements">
          <div className="joint"></div>
          <div className="joint-smoke-particle1"></div>
          <div className="joint-smoke-particle2"></div>
          <div className="joint-smoke-particle3"></div>
        </div>
      </>
    );
  };

  return (
    <header className="app-header">
      {/* 3D effects behind header */}
      <HeaderScene theme={currentTheme} />

      {/* Symmetrical Left Spacer to guarantee true centering against theme button */}
      <div className="header-left-spacer" aria-hidden="true"></div>

      <ParallaxWrapper intensity={3} style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'center', width: 'auto', maxWidth: '100%', overflow: 'visible' }}>
        <h1 className={`main-title ${currentTheme}-title`} onClick={onTitleClick}>
          <span className="title-icon">{getTitleIcon()}</span>
          Room no: 305
          <span className="title-icon">{getTitleIcon()}</span>
        </h1>
      </ParallaxWrapper>
      
      {renderSmokeElements()}
      {renderThemeButton()}
      <div className="full-page-smoke"></div>
    </header>
  );
};

export default Header;
