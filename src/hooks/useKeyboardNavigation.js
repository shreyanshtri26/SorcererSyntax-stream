import { useEffect } from 'react';

/**
 * Custom hook for keyboard navigation
 * @param {Object} handlers - Object with key handlers
 * @param {boolean} enabled - Whether keyboard navigation is enabled
 */
export const useKeyboardNavigation = (handlers = {}, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      
      // Escape key
      if (key === 'escape' && handlers.onEscape) {
        e.preventDefault();
        handlers.onEscape();
      }
      
      // Enter key
      if (key === 'enter' && handlers.onEnter) {
        e.preventDefault();
        handlers.onEnter();
      }
      
      // Arrow keys
      if (key === 'arrowup' && handlers.onArrowUp) {
        e.preventDefault();
        handlers.onArrowUp();
      }
      
      if (key === 'arrowdown' && handlers.onArrowDown) {
        e.preventDefault();
        handlers.onArrowDown();
      }
      
      if (key === 'arrowleft' && handlers.onArrowLeft) {
        e.preventDefault();
        handlers.onArrowLeft();
      }
      
      if (key === 'arrowright' && handlers.onArrowRight) {
        e.preventDefault();
        handlers.onArrowRight();
      }
      
      // Tab key
      if (key === 'tab' && handlers.onTab) {
        handlers.onTab(e);
      }
      
      // Custom keys
      if (handlers.onKey) {
        handlers.onKey(e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlers, enabled]);
};

export default useKeyboardNavigation;
