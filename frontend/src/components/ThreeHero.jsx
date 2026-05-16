import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PresentationControls, Sky, Environment } from '@react-three/drei';
import { useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';

function WheatHead({ position, rotation, scale = 1, color = "#fbbf24" }) {
  const group = useRef();
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    group.current.rotation.y = Math.sin(time * 0.5) * 0.2;
    group.current.position.y = position[1] + Math.sin(time * 1.2) * 0.1;
  });

  return (
    <group ref={group} position={position} rotation={rotation} scale={scale}>
      <mesh>
        <cylinderGeometry args={[0.05, 0.05, 6, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {Array.from({ length: 15 }).map((_, i) => (
        <mesh key={i} position={[0, i * 0.3 - 1, 0]} rotation={[0, (i * Math.PI) / 3, 0]}>
          <sphereGeometry args={[0.22, 8, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function FloatingIslands() {
  return (
    <group position={[0, -2, 0]}>
      {/* Golden Wheat Stalks */}
      <WheatHead position={[-4, 0, 0]} rotation={[0, 0, 0.2]} scale={1.2} color="#fbbf24" />
      <WheatHead position={[0, 0, -2]} rotation={[0, 0, 0]} scale={1.8} color="#f59e0b" />
      <WheatHead position={[4, 0, 0]} rotation={[0, 0, -0.2]} scale={1.2} color="#d97706" />
      
      {/* Green Crops */}
      <WheatHead position={[-2, -1, 2]} rotation={[0, 0.5, 0.1]} scale={0.8} color="#22c55e" />
      <WheatHead position={[2, -1, 2]} rotation={[0, -0.5, -0.1]} scale={0.8} color="#10b981" />
    </group>
  );
}

function DynamicSun() {
  const mesh = useRef();
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    mesh.current.position.y = 12 + Math.sin(time * 0.5) * 2;
  });

  return (
    <mesh ref={mesh} position={[15, 12, -15]}>
      <sphereGeometry args={[4, 32, 32]} />
      <meshStandardMaterial color="#fcd34d" emissive="#fbbf24" emissiveIntensity={4} />
    </mesh>
  );
}

export default function ThreeHero() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 2, 18], fov: 40 }}>
        <Suspense fallback={null}>
          <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} />
          <ambientLight intensity={0.8} />
          <pointLight position={[-10, 20, 10]} intensity={2} color="#fff" />
          <spotLight position={[20, 20, 20]} angle={0.15} penumbra={1} intensity={3} castShadow />
          
          <PresentationControls
            global
            config={{ mass: 2, tension: 500 }}
            snap={{ mass: 4, tension: 1500 }}
            rotation={[0, 0.2, 0]}
            polar={[-Math.PI / 6, Math.PI / 6]}
            azimuth={[-Math.PI / 4, Math.PI / 4]}
          >
            <Float speed={3} rotationIntensity={0.4} floatIntensity={1.5}>
               <FloatingIslands />
            </Float>
          </PresentationControls>

          <DynamicSun />
          
          <fog attach="fog" args={['#fffbeb', 15, 45]} />
          <Environment preset="sunset" />
        </Suspense>
      </Canvas>
      {/* Artistic Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent dark:from-slate-950 dark:via-transparent opacity-60" />
    </div>
  );
}
