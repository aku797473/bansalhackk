import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, Suspense } from 'react';

function StatusOrb({ color = "#10b981" }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.y = time * 0.5;
    meshRef.current.position.y = Math.sin(time * 2) * 0.1;
  });

  return (
    <mesh ref={meshRef} scale={1.2}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color={color}
        roughness={0}
        metalness={1}
        emissive={color}
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}

export default function ThreeStatusOrb({ color }) {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 3] }}>
        <Suspense fallback={null}>
          <ambientLight intensity={1} />
          <pointLight position={[10, 10, 10]} intensity={2} />
          <StatusOrb color={color} />
        </Suspense>
      </Canvas>
    </div>
  );
}
