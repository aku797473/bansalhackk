import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Stars } from '@react-three/drei';
import { useRef, Suspense } from 'react';
import * as THREE from 'three';

function Grid() {
  const gridRef = useRef();
  useFrame((state) => {
    gridRef.current.position.z = (state.clock.getElapsedTime() * 0.5) % 2;
  });

  return (
    <gridHelper
      ref={gridRef}
      args={[40, 40, '#6366f1', '#1e293b']}
      position={[0, -2, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

function FloatingSphere() {
  const meshRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.x = time * 0.2;
    meshRef.current.rotation.y = time * 0.3;
    meshRef.current.position.y = Math.sin(time) * 0.5;
  });

  return (
    <mesh ref={meshRef} position={[2, 1, -5]}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial
        color="#6366f1"
        roughness={0.1}
        metalness={0.8}
        emissive="#6366f1"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

export default function ThreeHero() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none bg-white dark:bg-slate-950">
      <Canvas>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 2, 10]} fov={50} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} />
          
          <Grid />
          <FloatingSphere />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </Suspense>
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-slate-950" />
    </div>
  );
}
