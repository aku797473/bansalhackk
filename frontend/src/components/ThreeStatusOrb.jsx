import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float } from '@react-three/drei';
import { useRef } from 'react';

function StatusOrb({ color = "#10b981", speed = 2, distort = 0.3 }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
  });

  return (
    <Float speed={5} rotationIntensity={2} floatIntensity={2}>
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
    </Float>
  );
}

export default function ThreeStatusOrb({ color, speed, distort }) {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 3] }}>
        <ambientLight intensity={1} />
        <pointLight position={[10, 10, 10]} intensity={2} />
        <StatusOrb color={color} speed={speed} distort={distort} />
      </Canvas>
    </div>
  );
}
