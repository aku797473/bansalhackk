import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, MeshDistortMaterial, Float, PerspectiveCamera } from '@react-three/drei';
import { useState, useRef, Suspense } from 'react';
import * as THREE from 'three';

function Scene() {
  const { mouse } = useThree();
  const meshRef = useRef();
  const gridRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Mouse interaction for the main crystal
    if (meshRef.current) {
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, mouse.y * 0.5, 0.1);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, mouse.x * 0.5, 0.1);
    }

    // Grid movement
    if (gridRef.current) {
      gridRef.current.position.z = (time * 0.5) % 2;
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#6366f1" />
      <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#818cf8" />

      {/* Centerpiece Crystal */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh ref={meshRef}>
          <octahedronGeometry args={[2, 0]} />
          <MeshDistortMaterial
            color="#6366f1"
            speed={2}
            distort={0.3}
            radius={1}
            wireframe
            transparent
            opacity={0.4}
          />
        </mesh>
      </Float>

      {/* Perspective Grid */}
      <group position={[0, -4, 0]}>
        <gridHelper
          ref={gridRef}
          args={[100, 50, '#6366f1', '#1e293b']}
          rotation={[0, 0, 0]}
        />
      </group>

      {/* Floating Particles */}
      <Particles count={2000} />
    </>
  );
}

function Particles({ count }) {
  const points = useRef();
  const [positions] = useState(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
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
        color="#818cf8"
        size={0.03}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-slate-50 dark:bg-[#020617]">
      <Canvas>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-indigo-500/5 dark:from-black/60 dark:to-indigo-900/10 pointer-events-none" />
    </div>
  );
}
