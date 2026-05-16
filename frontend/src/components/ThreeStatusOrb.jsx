import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import { useRef, Suspense } from 'react';

function StatusOrb({ color = "#10b981", speed = 2, distort = 0.3 }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.y = time * 0.5;
    meshRef.current.position.y = Math.sin(time * 2) * 0.1; // Manual float
  });

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]} scale={1.2}>
      <MeshDistortMaterial
        color={color}
        attach="material"
        distort={distort}
        speed={speed}
        roughness={0}
        metalness={1}
        emissive={color}
        emissiveIntensity={0.5}
      />
    </Sphere>
  );
}

export default function ThreeStatusOrb({ color, speed, distort }) {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 3] }}>
        <Suspense fallback={null}>
          <ambientLight intensity={1} />
          <pointLight position={[10, 10, 10]} intensity={2} />
          <StatusOrb color={color} speed={speed} distort={distort} />
        </Suspense>
      </Canvas>
    </div>
  );
}
