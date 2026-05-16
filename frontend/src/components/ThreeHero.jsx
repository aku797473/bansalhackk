import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PresentationControls, Sky, Stars, Sparkles } from '@react-three/drei';
import { useRef, Suspense } from 'react';
import * as THREE from 'three';

function HarvestGlobe() {
  const meshRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.y = time * 0.2;
  });

  return (
    <group ref={meshRef}>
      {/* Central "Earth" of Farming */}
      <mesh>
        <sphereGeometry args={[3, 64, 64]} />
        <meshStandardMaterial 
          color="#16a34a" 
          roughness={0.4} 
          metalness={0.2}
          emissive="#064e3b"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Decorative Golden Rings */}
      <mesh rotation={[Math.PI / 2.5, 0, 0]}>
        <torusGeometry args={[4.5, 0.05, 16, 100]} />
        <meshStandardMaterial color="#fbbf24" emissive="#d97706" emissiveIntensity={2} />
      </mesh>
      
      {/* Floating Wheat Spikes */}
      {Array.from({ length: 8 }).map((_, i) => (
        <group key={i} rotation={[0, (i * Math.PI) / 4, 0]} position={[0, Math.sin(i) * 0.5, 0]}>
           <mesh position={[5, 0, 0]}>
             <coneGeometry args={[0.1, 1, 4]} />
             <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1} />
           </mesh>
        </group>
      ))}

      <Sparkles count={50} scale={10} size={2} color="#fbbf24" speed={0.5} />
    </group>
  );
}

export default function ThreeHero() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      {/* Added simple background color to prevent flicker if context is lost */}
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }} gl={{ antialias: true, alpha: true }}>
        <Suspense fallback={null}>
          <Sky distance={450000} sunPosition={[5, 1, 8]} inclination={0} azimuth={0.25} />
          <ambientLight intensity={0.7} />
          <pointLight position={[-10, 10, 10]} intensity={1.5} color="#fff" />
          <spotLight position={[20, 20, 20]} angle={0.15} penumbra={1} intensity={2} castShadow />
          
          <PresentationControls
            global
            config={{ mass: 2, tension: 500 }}
            snap={{ mass: 4, tension: 1500 }}
            rotation={[0, 0.5, 0]}
            polar={[-Math.PI / 6, Math.PI / 6]}
            azimuth={[-Math.PI / 4, Math.PI / 4]}
          >
            <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
               <HarvestGlobe />
            </Float>
          </PresentationControls>

          <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
          
          <fog attach="fog" args={['#064e3b', 15, 45]} />
          {/* REMOVED Environment preset to prevent external CDN fetch errors */}
        </Suspense>
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/20 via-transparent to-transparent dark:from-slate-950/20 opacity-50" />
    </div>
  );
}
