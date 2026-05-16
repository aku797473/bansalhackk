import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, MeshDistortMaterial } from '@react-three/drei';
import { useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';

function DNAHelix() {
  const groupRef = useRef();
  const count = 60;
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 4;
      const x = Math.cos(t) * 2;
      const y = (i / count) * 10 - 5;
      const z = Math.sin(t) * 2;
      temp.push({ x, y, z, color: i % 2 === 0 ? '#6366f1' : '#818cf8' });
    }
    return temp;
  }, []);

  useFrame((state) => {
    groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
  });

  return (
    <group ref={groupRef} position={[4, 0, -5]} rotation={[0.5, 0, 0.2]}>
      {particles.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color={p.color} emissive={p.color} emissiveIntensity={2} />
        </mesh>
      ))}
    </group>
  );
}

function TechCore() {
  const meshRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.x = time * 0.2;
    meshRef.current.rotation.y = time * 0.3;
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={[-4, 2, -8]}>
        <icosahedronGeometry args={[3, 1]} />
        <meshStandardMaterial
          color="#6366f1"
          wireframe
          emissive="#6366f1"
          emissiveIntensity={0.5}
        />
      </mesh>
    </Float>
  );
}

function GroundGrid() {
  const gridRef = useRef();
  useFrame((state) => {
    gridRef.current.position.z = (state.clock.getElapsedTime() * 0.8) % 2;
  });

  return (
    <group position={[0, -4, 0]}>
      <gridHelper
        ref={gridRef}
        args={[100, 50, '#6366f1', '#1e293b']}
        rotation={[0, 0, 0]}
      />
    </group>
  );
}

export default function ThreeHero() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none bg-white dark:bg-slate-950">
      <Canvas camera={{ position: [0, 2, 12], fov: 45 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <spotLight position={[-10, 20, 10]} angle={0.12} penumbra={1} intensity={2} castShadow />
          
          <TechCore />
          <DNAHelix />
          <GroundGrid />
          
          <Stars radius={100} depth={50} count={6000} factor={4} saturation={0} fade speed={1.5} />
          
          <fog attach="fog" args={['#000', 10, 25]} />
        </Suspense>
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-slate-950 opacity-90" />
    </div>
  );
}
