'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '@/store/useAppStore';

function TwinSphere() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state: any) => {
    if (!ref.current) return;
    const speed = 1 + useAppStore.getState().globalRiskScore / 80;
    ref.current.rotation.x = state.clock.elapsedTime * 0.2 * speed;
    ref.current.rotation.y = state.clock.elapsedTime * 0.3 * speed;
  });

  // useMemo so color string doesn't recreate on parent renders  
  const initialRisk = useAppStore.getState().globalRiskScore;
  const color = initialRisk > 75 ? '#ff3366' : initialRisk > 50 ? '#ffb800' : '#00ff9d';

  return (
    <group>
      {/* Wireframe baseline — simplified from 64 segments to 32 */}
      <Sphere args={[1.5, 32, 32]}>
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.04} />
      </Sphere>

      {/* Dynamic sphere — segments reduced from 128x128 → 48x48 */}
      <Sphere ref={ref} args={[1.4, 48, 48]}>
        <MeshDistortMaterial
          color={color}
          clearcoat={0.6}
          metalness={0.7}
          roughness={0.3}
          distort={Math.min(Math.max(initialRisk / 100, 0.1), 0.8)}
          speed={1 + initialRisk / 60}
          transparent
          opacity={0.85}
        />
      </Sphere>
    </group>
  );
}

export function DigitalTwin() {
  return (
    <div className="w-full h-full min-h-[300px] relative">
      <Canvas
        camera={{ position: [0, 0, 4] }}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]} // cap at 1.5x — good quality without full retina cost
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={0.9} />
        <directionalLight position={[-10, -10, -5]} intensity={0.4} color="#00ff9d" />
        <TwinSphere />
      </Canvas>

      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-bdie-text-secondary">Profile ID</span>
          <span className="font-mono text-sm text-white">USR-78291A</span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] uppercase tracking-widest text-bdie-text-secondary">Status</span>
          <span className="font-mono text-sm text-bdie-accent">Monitoring</span>
        </div>
      </div>
    </div>
  );
}
