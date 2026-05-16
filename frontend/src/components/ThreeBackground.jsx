import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float } from '@react-three/drei';
import { useRef, Suspense } from 'react';
import * as THREE from 'three';

function AnimatedBackground() {
  const meshRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.x = time * 0.1;
    meshRef.current.rotation.y = time * 0.15;
  });

  return (
    <>
      <ambientLight intensity={1} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#6366f1" />
      <pointLight position={[-10, -10, -10]} intensity={2} color="#ec4899" />
      
      {/* Huge Glowing Sphere to ensure visibility */}
      <mesh ref={meshRef} position={[0, 0, -10]}>
        <sphereGeometry args={[15, 32, 32]} />
        <meshStandardMaterial 
          color="#6366f1" 
          wireframe 
          transparent 
          opacity={0.3}
          emissive="#6366f1"
          emissiveIntensity={1}
        />
      </mesh>

      <Float speed={4} rotationIntensity={1} floatIntensity={2}>
        <mesh position={[5, 2, -5]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#818cf8" emissive="#818cf8" emissiveIntensity={2} />
        </mesh>
      </Float>

      <Float speed={3} rotationIntensity={1} floatIntensity={2}>
        <mesh position={[-5, -2, -5]}>
          <octahedronGeometry args={[1.5]} />
          <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={2} />
        </mesh>
      </Float>

      <Stars radius={100} depth={50} count={5000} factor={4} saturation={1} fade speed={2} />
    </>
  );
}

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-slate-900 overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <Suspense fallback={null}>
          <AnimatedBackground />
        </Suspense>
      </Canvas>
      {/* Dark overlay to make text pop */}
      <div className="absolute inset-0 bg-slate-900/60 pointer-events-none" />
    </div>
  );
}
