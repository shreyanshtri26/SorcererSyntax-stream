import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ── Devil: rising embers ── */
function DevilParticles() {
  const count = 220;
  const ref = useRef();
  const posArr = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      a[i * 3]     = (Math.random() - 0.5) * 20;
      a[i * 3 + 1] = (Math.random() - 0.5) * 20;
      a[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return a;
  }, []);

  useFrame((_, delta) => {
    const geo = ref.current;
    const pos = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += delta * (0.3 + Math.random() * 0.15);
      pos[i * 3]     += Math.sin(Date.now() * 0.001 + i) * delta * 0.15;
      if (pos[i * 3 + 1] > 10) { pos[i * 3 + 1] = -10; pos[i * 3] = (Math.random() - 0.5) * 20; }
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry ref={ref}>
        <bufferAttribute attach="attributes-position" args={[posArr, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#ff3300" transparent opacity={0.7} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/* ── Angel: soft floating orbs ── */
function AngelParticles() {
  const count = 160;
  const ref = useRef();
  const posArr = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      a[i * 3]     = (Math.random() - 0.5) * 20;
      a[i * 3 + 1] = (Math.random() - 0.5) * 20;
      a[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return a;
  }, []);

  useFrame((_, delta) => {
    const geo = ref.current;
    const pos = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += Math.sin(Date.now() * 0.0005 + i * 0.5) * delta * 0.2;
      pos[i * 3]     += Math.cos(Date.now() * 0.0003 + i) * delta * 0.1;
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry ref={ref}>
        <bufferAttribute attach="attributes-position" args={[posArr, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.12} color="#87ceeb" transparent opacity={0.5} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/* ── Hannibal: fog spores ── */
function HannibalParticles() {
  const count = 180;
  const ref = useRef();
  const posArr = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      a[i * 3]     = (Math.random() - 0.5) * 20;
      a[i * 3 + 1] = (Math.random() - 0.5) * 20;
      a[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return a;
  }, []);

  useFrame((_, delta) => {
    const geo = ref.current;
    const pos = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      pos[i * 3]     += Math.sin(Date.now() * 0.0002 + i) * delta * 0.12;
      pos[i * 3 + 1] += Math.cos(Date.now() * 0.0004 + i * 0.3) * delta * 0.08;
      pos[i * 3 + 2] += Math.sin(Date.now() * 0.0003 + i * 0.7) * delta * 0.06;
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry ref={ref}>
        <bufferAttribute attach="attributes-position" args={[posArr, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="#6b8e23" transparent opacity={0.45} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/* ── Ambient pulsing glow light ── */
function PulsingLight({ color }) {
  const ref = useRef();
  useFrame(() => { if (ref.current) ref.current.intensity = 1.2 + Math.sin(Date.now() * 0.001) * 0.6; });
  return <pointLight ref={ref} position={[0, 0, 4]} color={color} intensity={1.2} distance={30} />;
}

/* ── fog colors per theme ── */
const fogColors = { devil: '#120000', angel: '#040a18', hannibal: '#0a150e' };
const glowColors = { devil: '#ff1a00', angel: '#87ceeb', hannibal: '#8b0000' };

const ThreeBackground = ({ theme = 'devil' }) => {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
        style={{ background: fogColors[theme] || fogColors.devil, pointerEvents: 'none' }}
        eventSource={undefined}
      >
        <fog attach="fog" args={[fogColors[theme] || fogColors.devil, 5, 25]} />
        <ambientLight intensity={0.15} />
        <PulsingLight color={glowColors[theme] || glowColors.devil} />

        {theme === 'devil'    && <DevilParticles />}
        {theme === 'angel'    && <AngelParticles />}
        {theme === 'hannibal' && <HannibalParticles />}
      </Canvas>
    </div>
  );
};

export default ThreeBackground;
