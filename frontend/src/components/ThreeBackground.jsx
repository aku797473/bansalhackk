import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, Float } from '@react-three/drei';
import { useState, useRef, Suspense } from 'react';
import * as THREE from 'three';

function Scene() {
  const { mouse } = useThree();
  const meshRef = useRef();
  const gridRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (meshRef.current) {
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, mouse.y * 0.4, 0.05);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, mouse.x * 0.4, 0.05);
    }

    if (gridRef.current) {
      gridRef.current.position.z = (time * 0.4) % 2;
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#6366f1" />
      <spotLight position={[-10, 10, 10]} angle={0.2} penumbra={1} intensity={2} color="#818cf8" />

      {/* Simplified Centerpiece Octahedron for Stability */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh ref={meshRef}>
          <octahedronGeometry args={[2.5, 1]} />
          <meshStandardMaterial
            color="#6366f1"
            wireframe
            transparent
            opacity={0.2}
            emissive="#6366f1"
            emissiveIntensity={0.5}
          />
        </mesh>
      </Float>

      {/* Stable Perspective Grid */}
      <group position={[0, -4, 0]}>
        <gridHelper
          ref={gridRef}
          args={[100, 40, '#6366f1', '#1e293b']}
          rotation={[0, 0, 0]}
        />
      </group>

      <Particles count={1500} />
    </>
  );
}

function Particles({ count }) {
  const points = useRef();
  const [positions] = useState(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 25;
    }
    return pos;
  });

  useFrame((state) => {
    points.current.rotation.y = state.clock.getElapsedTime() * 0.03;
  });

  return (
    <Points ref={points} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#818cf8"
        size={0.04}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-slate-50 dark:bg-[#020617] overflow-hidden">
      <Canvas 
        camera={{ position: [0, 0, 10], fov: 50 }}
        dpr={[1, 2]} // Performance optimization
        gl={{ alpha: true, antialias: true }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      {/* Visual Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-indigo-500/5 dark:from-black/40 dark:to-indigo-950/20 pointer-events-none" />
    </div>
  );
}
