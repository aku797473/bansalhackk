import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PresentationControls } from '@react-three/drei';
import { useRef, Suspense } from 'react';
import * as THREE from 'three';

function WheatHead({ position, rotation, scale = 1 }) {
  const group = useRef();
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    group.current.rotation.y = Math.sin(time * 0.5) * 0.2;
    group.current.position.y = position[1] + Math.sin(time * 1.2) * 0.1;
  });

  return (
    <group ref={group} position={position} rotation={rotation} scale={scale}>
      {/* Stem */}
      <mesh>
        <cylinderGeometry args={[0.05, 0.05, 6, 8]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
      {/* Grains */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} position={[0, i * 0.3 - 1, 0]} rotation={[0, (i * Math.PI) / 3, 0]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function FarmSun() {
  return (
    <mesh position={[10, 10, -10]}>
      <sphereGeometry args={[2, 32, 32]} />
      <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
    </mesh>
  );
}

export default function ThreeHero() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-slate-950 dark:to-emerald-950/20">
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.7} />
          <pointLight position={[-10, 10, 10]} intensity={1} color="#fcd34d" />
          
          <PresentationControls
            global
            config={{ mass: 2, tension: 500 }}
            snap={{ mass: 4, tension: 1500 }}
            rotation={[0, 0.3, 0]}
            polar={[-Math.PI / 4, Math.PI / 4]}
            azimuth={[-Math.PI / 6, Math.PI / 6]}
          >
            <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
               <group position={[0, -2, 0]}>
                  <WheatHead position={[-3, 0, 0]} rotation={[0, 0, 0.2]} scale={1.2} />
                  <WheatHead position={[0, 0, -2]} rotation={[0, 0, 0]} scale={1.5} />
                  <WheatHead position={[3, 0, 0]} rotation={[0, 0, -0.2]} scale={1.2} />
               </group>
            </Float>
          </PresentationControls>

          <FarmSun />
          
          <fog attach="fog" args={['#fffbeb', 10, 30]} />
        </Suspense>
      </Canvas>
      <div className="absolute inset-0 bg-white/20 dark:bg-black/10" />
    </div>
  );
}
