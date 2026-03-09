import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ── Devil: fire particles behind header ── */
function DevilFire() {
  const count = 60;
  const ref = useRef();
  const posArr = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      a[i * 3]     = (Math.random() - 0.5) * 8;
      a[i * 3 + 1] = (Math.random() - 0.5) * 2;
      a[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    return a;
  }, []);

  useFrame((_, delta) => {
    const pos = ref.current.attributes.position.array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += delta * (0.5 + Math.random() * 0.3);
      pos[i * 3]     += Math.sin(Date.now() * 0.002 + i) * delta * 0.2;
      if (pos[i * 3 + 1] > 2) { pos[i * 3 + 1] = -1; pos[i * 3] = (Math.random() - 0.5) * 8; }
    }
    ref.current.attributes.position.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry ref={ref}>
        <bufferAttribute attach="attributes-position" args={[posArr, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#ff4500" transparent opacity={0.8} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/* ── Angel: sparkle halo ── */
function AngelHalo() {
  const count = 40;
  const ref = useRef();
  const posArr = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      a[i * 3]     = Math.cos(angle) * 3;
      a[i * 3 + 1] = Math.sin(angle) * 0.5;
      a[i * 3 + 2] = Math.sin(angle) * 1;
    }
    return a;
  }, []);

  useFrame((state) => {
    const pos = ref.current.attributes.position.array;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + t * 0.3;
      pos[i * 3]     = Math.cos(angle) * 3;
      pos[i * 3 + 1] = Math.sin(angle) * 0.5 + Math.sin(t * 2 + i) * 0.1;
      pos[i * 3 + 2] = Math.sin(angle) * 1;
    }
    ref.current.attributes.position.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry ref={ref}>
        <bufferAttribute attach="attributes-position" args={[posArr, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="#ffd700" transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/* ── Hannibal: swirling smoke ── */
function HannibalSmoke() {
  const count = 50;
  const ref = useRef();
  const posArr = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      a[i * 3]     = (Math.random() - 0.5) * 6;
      a[i * 3 + 1] = (Math.random() - 0.5) * 2;
      a[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    return a;
  }, []);

  useFrame((_, delta) => {
    const pos = ref.current.attributes.position.array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += delta * 0.2;
      pos[i * 3]     += Math.sin(Date.now() * 0.0005 + i) * delta * 0.15;
      if (pos[i * 3 + 1] > 2) { pos[i * 3 + 1] = -1; }
    }
    ref.current.attributes.position.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry ref={ref}>
        <bufferAttribute attach="attributes-position" args={[posArr, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.15} color="#8b6914" transparent opacity={0.35} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

const HeaderScene = ({ theme = 'devil' }) => {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      zIndex: 0, pointerEvents: 'none', overflow: 'hidden'
    }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 40 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
        style={{ background: 'transparent', pointerEvents: 'none' }}
        eventSource={undefined}
      >
        <ambientLight intensity={0.1} />
        {theme === 'devil'    && <DevilFire />}
        {theme === 'angel'    && <AngelHalo />}
        {theme === 'hannibal' && <HannibalSmoke />}
      </Canvas>
    </div>
  );
};

export default HeaderScene;
