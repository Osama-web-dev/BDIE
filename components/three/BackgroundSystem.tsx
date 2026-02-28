'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '@/store/useAppStore';

// Pull risk score OUT of React via getState() inside useFrame — no re-renders from animation loop
function NeuralField() {
  const ref = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);

  // Reduced from 3000 → 800 points — 73% less GPU work, still looks great
  const positions = useMemo(() => {
    const count = 800;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
    }
    return pos;
  }, []);

  // Throttle: only update color every 3rd frame
  const frameCount = useRef(0);
  useFrame((_, delta: number) => {
    if (!ref.current) return;
    ref.current.rotation.x -= delta / 25;
    ref.current.rotation.y -= delta / 35;

    frameCount.current++;
    if (frameCount.current % 3 === 0 && materialRef.current) {
      const score = useAppStore.getState().globalRiskScore;
      const t = score / 100;
      if (score > 50) {
        materialRef.current.color.setRGB(0.8 + t * 0.2, 0.2, 0.4);
      } else {
        materialRef.current.color.setRGB(0.2, 0.8 - t * 0.3, 0.5);
      }
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          ref={materialRef}
          transparent
          color="#00ff9d"
          size={0.06}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
}

export function BackgroundSystem() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-35" style={{ willChange: 'auto' }}>
      <Canvas
        camera={{ position: [0, 0, 5] }}
        gl={{ antialias: false, powerPreference: 'low-power', alpha: true }}
        dpr={[1, 1]} // Lock to 1x DPR — no retina oversampling for background
        frameloop="always"
      >
        <NeuralField />
      </Canvas>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050505_100%)]" />
    </div>
  );
}
