import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, MeshDistortMaterial } from '@react-three/drei';
import { useState, useRef, Suspense } from 'react';
import * as THREE from 'three';

function CyberGrid() {
  const meshRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.z = time * 0.05;
    meshRef.current.position.y = Math.sin(time * 0.5) * 0.2;
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[20, 20, 40, 40]} />
      <meshStandardMaterial
        color="#6366f1"
        wireframe
        transparent
        opacity={0.15}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function FloatingParticles({ count = 1000 }) {
  const points = useRef();
  const [positions] = useState(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return pos;
  });

  useFrame((state) => {
    points.current.rotation.y = state.clock.getElapsedTime() * 0.05;
  });

  return (
    <Points ref={points} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#818cf8"
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-slate-50 dark:bg-[#0B1120]">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <CyberGrid />
          <FloatingParticles />
        </Suspense>
      </Canvas>
      {/* Overlay to ensure readability */}
      <div className="absolute inset-0 bg-white/40 dark:bg-[#0B1120]/40 backdrop-blur-[2px]" />
    </div>
  );
}
