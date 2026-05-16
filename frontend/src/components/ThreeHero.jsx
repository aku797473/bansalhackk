import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PresentationControls, Sky, Stars } from '@react-three/drei';
import { useRef, Suspense } from 'react';
import * as THREE from 'three';

function HarvestGlobe() {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      meshRef.current.rotation.y = time * 0.15;
    }
  });

  return (
    <group ref={meshRef}>
      <mesh>
        <sphereGeometry args={[3, 48, 48]} />
        <meshStandardMaterial 
          color="#16a34a" 
          roughness={0.6} 
          metalness={0.1}
          emissive="#064e3b"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      <mesh rotation={[Math.PI / 2.5, 0, 0]}>
        <torusGeometry args={[4.5, 0.04, 12, 64]} />
        <meshStandardMaterial color="#fbbf24" emissive="#d97706" emissiveIntensity={1} />
      </mesh>
      
      {Array.from({ length: 6 }).map((_, i) => (
        <group key={i} rotation={[0, (i * Math.PI) / 3, 0]} position={[0, Math.sin(i) * 0.4, 0]}>
           <mesh position={[5, 0, 0]}>
             <coneGeometry args={[0.08, 0.8, 4]} />
             <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
           </mesh>
        </group>
      ))}
    </group>
  );
}

export default function ThreeHero() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Added a unique key to force clean mount and prevent context lost */}
      <Canvas 
        key="harvest-globe-v3"
        camera={{ position: [0, 0, 16], fov: 42 }} 
        gl={{ antialias: false, powerPreference: "high-performance" }} // Lower antialias for stability
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Sky distance={450000} sunPosition={[2, 0.5, 5]} inclination={0} azimuth={0.25} />
          <ambientLight intensity={0.8} />
          <pointLight position={[-8, 8, 8]} intensity={1.2} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          
          <PresentationControls
            global
            config={{ mass: 1, tension: 400 }}
            snap={{ mass: 3, tension: 1200 }}
            rotation={[0, 0.4, 0]}
            polar={[-Math.PI / 8, Math.PI / 8]}
            azimuth={[-Math.PI / 6, Math.PI / 6]}
          >
            <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
               <HarvestGlobe />
            </Float>
          </PresentationControls>

          <Stars radius={80} depth={40} count={1200} factor={3} saturation={0} fade speed={0.5} />
          <fog attach="fog" args={['#064e3b', 18, 50]} />
        </Suspense>
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-r from-white/30 dark:from-slate-950/30 via-transparent to-transparent opacity-40" />
    </div>
  );
}
