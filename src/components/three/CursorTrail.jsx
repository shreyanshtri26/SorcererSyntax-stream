import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const TRAIL_COUNT = 28;
const trailColors = { devil: '#ff4400', angel: '#aaddff', hannibal: '#6b8e23' };

function Trail({ theme }) {
  const ref = useRef();
  const mouse = useRef(new THREE.Vector2(0, 0));
  const { viewport } = useThree();

  const positions = useMemo(() => {
    const a = new Float32Array(TRAIL_COUNT * 3);
    return a; // all zeroed
  }, []);

  const sizes = useMemo(() => {
    const s = new Float32Array(TRAIL_COUNT);
    for (let i = 0; i < TRAIL_COUNT; i++) s[i] = 0.06 * (1 - i / TRAIL_COUNT);
    return s;
  }, []);

  useEffect(() => {
    const handleMove = (e) => {
      mouse.current.x = ((e.clientX / window.innerWidth) * 2 - 1) * viewport.width * 0.5;
      mouse.current.y = (-(e.clientY / window.innerHeight) * 2 + 1) * viewport.height * 0.5;
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, [viewport]);

  useFrame(() => {
    const geo = ref.current;
    if (!geo) return;
    const pos = geo.attributes.position.array;

    // Lead particle follows mouse
    pos[0] = mouse.current.x;
    pos[1] = mouse.current.y;
    pos[2] = 0;

    // Trailing particles follow the one in front
    for (let i = 1; i < TRAIL_COUNT; i++) {
      const idx = i * 3;
      const pidx = (i - 1) * 3;
      pos[idx]     += (pos[pidx]     - pos[idx])     * 0.25;
      pos[idx + 1] += (pos[pidx + 1] - pos[idx + 1]) * 0.25;
      pos[idx + 2] = 0;
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry ref={ref}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color={trailColors[theme] || trailColors.devil}
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

const CursorTrail = ({ theme = 'devil' }) => {
  // hide on touch devices
  const [isTouch, setIsTouch] = React.useState(false);
  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  if (isTouch) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
        style={{ background: 'transparent', pointerEvents: 'none' }}
        eventSource={undefined}
      >
        <Trail theme={theme} />
      </Canvas>
    </div>
  );
};

export default CursorTrail;
