import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo, Suspense } from 'react';
import * as THREE from 'three';

function WheatBlade({ position, delay }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    // Wave animation to simulate wind
    const wave = Math.sin(time * 1.5 + delay) * 0.15;
    const wave2 = Math.cos(time * 0.8 + delay) * 0.1;
    meshRef.current.rotation.x = wave;
    meshRef.current.rotation.z = wave2;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <coneGeometry args={[0.02, 1, 4]} />
      <meshStandardMaterial color="#fbbf24" emissive="#d97706" emissiveIntensity={0.2} />
    </mesh>
  );
}

function Field() {
  const count = 400;
  const blades = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 30,
          -2,
          (Math.random() - 0.5) * 30
        ],
        delay: Math.random() * Math.PI * 2
      });
    }
    return temp;
  }, []);

  return (
    <group>
      {blades.map((b, i) => (
        <WheatBlade key={i} {...b} />
      ))}
      {/* Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#451a03" />
      </mesh>
    </group>
  );
}

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-sky-100 to-amber-50 dark:from-slate-900 dark:to-slate-950">
      <Canvas camera={{ position: [0, 2, 15], fov: 45 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#fcd34d" />
          <Field />
          <fog attach="fog" args={['#fffbeb', 5, 30]} />
        </Suspense>
      </Canvas>
      <div className="absolute inset-0 bg-white/10 dark:bg-black/40" />
    </div>
  );
}
