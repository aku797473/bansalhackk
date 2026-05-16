import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, PerspectiveCamera } from '@react-three/drei';
import { useRef, Suspense } from 'react';

function AnimatedSphere() {
  const meshRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.x = time * 0.2;
    meshRef.current.rotation.y = time * 0.3;
    meshRef.current.position.y = Math.sin(time) * 0.2; // Manual float
  });

  return (
    <Sphere ref={meshRef} args={[1, 100, 100]} scale={1.8}>
      <MeshDistortMaterial
        color="#10b981"
        attach="material"
        distort={0.4}
        speed={3}
        roughness={0.4}
        metalness={0.8}
      />
    </Sphere>
  );
}

export default function ThreeHero() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-40 dark:opacity-20">
      <Canvas>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} />
          <pointLight position={[-10, -10, -10]} />
          
          <AnimatedSphere />
        </Suspense>
      </Canvas>
    </div>
  );
}
