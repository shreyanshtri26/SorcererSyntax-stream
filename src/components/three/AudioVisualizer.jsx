import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const BAR_COUNT = 64;
const barColors = { devil: '#ff3300', angel: '#87ceeb', hannibal: '#6b8e23' };

function WaveformBars({ color, isPlaying }) {
  const ref = useRef();
  const posArr = useMemo(() => {
    const v = [];
    for (let i = 0; i < BAR_COUNT; i++) {
      const x = ((i / BAR_COUNT) - 0.5) * 10;
      // Each bar is a thin box approximated by 2 triangles (6 vertices)
      v.push(x, 0, 0);
      v.push(x + 0.1, 0, 0);
      v.push(x, 1, 0);
      v.push(x + 0.1, 0, 0);
      v.push(x + 0.1, 1, 0);
      v.push(x, 1, 0);
    }
    return new Float32Array(v);
  }, []);

  useFrame((state) => {
    const pos = ref.current.attributes.position.array;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < BAR_COUNT; i++) {
      const base = i * 18; // 6 vertices * 3
      const h = isPlaying
        ? 0.3 + Math.abs(Math.sin(t * 3 + i * 0.4)) * 0.8 + Math.abs(Math.cos(t * 5 + i * 0.7)) * 0.4
        : 0.1 + Math.sin(t * 0.5 + i * 0.3) * 0.05;
      // Update y of top vertices (indices 2,4,5 of each group)
      pos[base + 7]  = h; // vertex 2 y
      pos[base + 13] = h; // vertex 4 y
      pos[base + 16] = h; // vertex 5 y
    }
    ref.current.attributes.position.needsUpdate = true;
  });

  return (
    <mesh>
      <bufferGeometry ref={ref}>
        <bufferAttribute attach="attributes-position" args={[posArr, 3]} />
      </bufferGeometry>
      <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
    </mesh>
  );
}

const AudioVisualizer = ({ theme = 'devil', isPlaying = false }) => {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, width: '100%', height: '40px',
      zIndex: 0, pointerEvents: 'none', overflow: 'hidden'
    }}>
      <Canvas
        camera={{ position: [0, 0.5, 3], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
        style={{ background: 'transparent', pointerEvents: 'none' }}
        eventSource={undefined}
      >
        <WaveformBars color={barColors[theme] || barColors.devil} isPlaying={isPlaying} />
      </Canvas>
    </div>
  );
};

export default AudioVisualizer;
