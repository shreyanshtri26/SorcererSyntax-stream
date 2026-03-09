import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function FlowingParticles({ color = '#ff0000' }) {
  const count = 100;
  const ref = useRef();
  const data = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      // Distribute around a rectangle perimeter (approximate modal shape)
      const side = Math.floor(Math.random() * 4);
      if (side === 0) { pos[i*3] = -3 + Math.random()*6; pos[i*3+1] = 2; }
      else if (side === 1) { pos[i*3] = -3 + Math.random()*6; pos[i*3+1] = -2; }
      else if (side === 2) { pos[i*3] = -3; pos[i*3+1] = -2 + Math.random()*4; }
      else { pos[i*3] = 3; pos[i*3+1] = -2 + Math.random()*4; }
      pos[i*3+2] = (Math.random()-0.5)*0.5;
    }
    return pos;
  }, []);

  useFrame((state) => {
    const pos = ref.current.attributes.position.array;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      pos[i*3]   += Math.sin(t*0.5+i)*0.005;
      pos[i*3+1] += Math.cos(t*0.3+i*0.5)*0.005;
    }
    ref.current.attributes.position.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry ref={ref}>
        <bufferAttribute attach="attributes-position" args={[data, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color={color} transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

const particleColors = { devil: '#ff2200', angel: '#87ceeb', hannibal: '#8b6914' };

const ModalBackdrop = ({ theme = 'devil' }) => {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      zIndex: 0, pointerEvents: 'none', borderRadius: '20px', overflow: 'hidden'
    }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 40 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
        style={{ background: 'transparent', pointerEvents: 'none' }}
        eventSource={undefined}
      >
        <FlowingParticles color={particleColors[theme] || particleColors.devil} />
      </Canvas>
    </div>
  );
};

export default ModalBackdrop;
