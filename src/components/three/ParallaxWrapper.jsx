import React, { useRef, useEffect, useState, useCallback } from 'react';

/**
 * Applies a subtle 3D tilt parallax effect based on mouse position.
 * Pure CSS transforms — no Three.js canvas needed.
 */
const ParallaxWrapper = ({ children, intensity = 8, className = '', style = {} }) => {
  const ref = useRef(null);
  const [transform, setTransform] = useState('perspective(800px) rotateX(0deg) rotateY(0deg)');

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setTransform(`perspective(800px) rotateY(${dx * intensity}deg) rotateX(${-dy * intensity}deg)`);
  }, [intensity]);

  const handleMouseLeave = useCallback(() => {
    setTransform('perspective(800px) rotateX(0deg) rotateY(0deg)');
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        transform,
        transition: 'transform 0.15s ease-out',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
};

export default ParallaxWrapper;
