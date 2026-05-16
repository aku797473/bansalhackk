import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, Stars } from '@react-three/drei';
import { useState, useRef, Suspense } from 'react';
import * as THREE from 'three';

function Scene() {
  const { mouse } = useThree();
  const gridRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (gridRef.current) {
      gridRef.current.position.z = (time * 0.5) % 2;
      gridRef.current.rotation.x = -Math.PI / 2 + (mouse.y * 0.1);
      gridRef.current.rotation.y = mouse.x * 0.1;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#4f46e5" />
      
      <group position={[0, -2, 0]}>
        <gridHelper
          ref={gridRef}
          args={[100, 40, '#4f46e5', '#e2e8f0']}
        />
      </group>

      <Particles count={1000} />
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
    </>
  );
}

function Particles({ count }) {
  const points = useRef();
  const [positions] = useState(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  });

  useFrame((state) => {
    points.current.rotation.y = state.clock.getElapsedTime() * 0.05;
  });

  return (
    <Points ref={points} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#4f46e5"
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Canvas camera={{ position: [0, 2, 10], fov: 45 }}>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      <div className="absolute inset-0 bg-white/20 dark:bg-black/20 pointer-events-none" />
    </div>
  );
}
