import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ── Devil: pulsing pentagram ── */
function DevilPentagram() {
  const ref = useRef();
  const lineGeo = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const nextAngle = (((i * 2) % 5 + 2) * 2 * Math.PI) / 5 - Math.PI / 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * 1.5, Math.sin(angle) * 1.5, 0));
      pts.push(new THREE.Vector3(Math.cos(nextAngle) * 1.5, Math.sin(nextAngle) * 1.5, 0));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    return geo;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime * 0.3;
      const s = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.15;
      ref.current.scale.set(s, s, s);
    }
  });

  return (
    <group ref={ref}>
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial color="#ff0000" transparent opacity={0.8} linewidth={2} />
      </lineSegments>
      <pointLight color="#ff0000" intensity={2} distance={8} />
    </group>
  );
}

/* ── Devil ember particles ── */
function LoadingEmbers() {
  const count = 80;
  const ref = useRef();
  const posArr = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 1.5 + Math.random() * 2;
      a[i * 3]     = Math.cos(angle) * r;
      a[i * 3 + 1] = Math.sin(angle) * r;
      a[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    return a;
  }, []);

  useFrame((state, delta) => {
    const pos = ref.current.attributes.position.array;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const angle = t * 0.5 + (i / count) * Math.PI * 2;
      const r = 1.5 + Math.sin(t + i) * 0.5;
      pos[i * 3]     = Math.cos(angle) * r;
      pos[i * 3 + 1] = Math.sin(angle) * r;
    }
    ref.current.attributes.position.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry ref={ref}>
        <bufferAttribute attach="attributes-position" args={[posArr, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#ff4400" transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/* ── Angel: floating wings (simple geometry) ── */
function AngelWings() {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime;
      ref.current.rotation.y = Math.sin(t * 0.5) * 0.3;
      ref.current.position.y = Math.sin(t * 0.8) * 0.3;
    }
  });

  return (
    <group ref={ref}>
      {/* Left wing */}
      <mesh position={[-1, 0, 0]} rotation={[0, 0, 0.3]}>
        <coneGeometry args={[1.2, 2, 3]} />
        <meshStandardMaterial color="#87ceeb" transparent opacity={0.4} emissive="#87ceeb" emissiveIntensity={0.3} side={THREE.DoubleSide} wireframe />
      </mesh>
      {/* Right wing */}
      <mesh position={[1, 0, 0]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[1.2, 2, 3]} />
        <meshStandardMaterial color="#87ceeb" transparent opacity={0.4} emissive="#87ceeb" emissiveIntensity={0.3} side={THREE.DoubleSide} wireframe />
      </mesh>
      <pointLight color="#87ceeb" intensity={2} distance={8} />
    </group>
  );
}

/* ── Hannibal: mask silhouette ── */
function HannibalMask() {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.2;
  });

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color="#8b4513" transparent opacity={0.3} emissive="#8b0000" emissiveIntensity={0.2} wireframe />
      </mesh>
      <pointLight color="#8b0000" intensity={1.5} distance={8} />
    </group>
  );
}

const bgColors = { devil: '#0a0000', angel: '#020a14', hannibal: '#080e08' };

const ThreeLoadingScene = ({ theme = 'devil', message = 'Loading...' }) => {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', background: bgColors[theme] || bgColors.devil,
    }}>
      <div style={{ width: '200px', height: '200px' }}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 40 }}
          dpr={[1, 1.5]}
          gl={{ antialias: false, alpha: true }}
          style={{ background: 'transparent', pointerEvents: 'none' }}
          eventSource={undefined}
        >
          <ambientLight intensity={0.3} />
          {theme === 'devil' && <><DevilPentagram /><LoadingEmbers /></>}
          {theme === 'angel' && <AngelWings />}
          {theme === 'hannibal' && <HannibalMask />}
        </Canvas>
      </div>
      <p style={{
        color: theme === 'devil' ? '#ff4444' : theme === 'angel' ? '#87ceeb' : '#d4af37',
        fontSize: '1.1rem', letterSpacing: '2px', marginTop: '1rem',
        fontFamily: theme === 'devil' ? "'Bebas Neue', sans-serif" : theme === 'angel' ? "'Nunito', sans-serif" : "'Cinzel', serif",
        textShadow: `0 0 10px ${theme === 'devil' ? 'rgba(255,0,0,0.5)' : theme === 'angel' ? 'rgba(135,206,250,0.5)' : 'rgba(139,69,19,0.5)'}`,
        animation: 'fadeInUp 0.5s ease-out',
      }}>
        {message}
      </p>
    </div>
  );
};

export default ThreeLoadingScene;
