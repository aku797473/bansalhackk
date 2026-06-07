import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PresentationControls, Sky, Stars } from '@react-three/drei';
import { useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';

// Helper to generate a glowing green circular particle texture dynamically
const createCircleTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  
  // Create a nice radial gradient for a soft glowing circular point
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.2, 'rgba(52, 211, 153, 0.8)'); // Emerald/mint glow
  gradient.addColorStop(0.6, 'rgba(16, 185, 129, 0.2)');
  gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
};

/**
 * InteractiveParticles (Particle Attractor / Mouse Ripple Effect)
 * Renders 1,200 particle points in a floating dust field.
 * Calculates repulsion forces in real-time when the cursor hovers/touches nearby,
 * creating an elastic fluid bubble deformation effect.
 */
function InteractiveParticles() {
  const count = 1200;
  const meshRef = useRef();
  
  // Memoize texture so it's only created once
  const texture = useMemo(() => createCircleTexture(), []);

  // Set up initial positions and tracking arrays
  const [positions, initialPositions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const initPos = new Float32Array(count * 3);
    const vels = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Arrange particles randomly in a spherical shell around the globe
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const r = 4 + Math.random() * 8; // radius between 4 and 12 units
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      
      initPos[i * 3] = x;
      initPos[i * 3 + 1] = y;
      initPos[i * 3 + 2] = z;

      vels[i * 3] = 0;
      vels[i * 3 + 1] = 0;
      vels[i * 3 + 2] = 0;
    }
    return [pos, initPos, vels];
  }, []);

  const geomRef = useRef();

  useFrame((state) => {
    if (!geomRef.current) return;
    
    const positionsAttr = geomRef.current.attributes.position;
    const array = positionsAttr.array;
    
    // Map normalize device coordinates (-1 to 1) of mouse pointer to viewport coordinates
    const mouseX = (state.pointer.x * state.viewport.width) / 2;
    const mouseY = (state.pointer.y * state.viewport.height) / 2;
    
    // Check if pointer is active on the window
    const isPointerActive = Math.abs(state.pointer.x) > 0.0001 || Math.abs(state.pointer.y) > 0.0001;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      let x = array[idx];
      let y = array[idx + 1];
      let z = array[idx + 2];
      
      const origX = initialPositions[idx];
      const origY = initialPositions[idx + 1];
      const origZ = initialPositions[idx + 2];
      
      let vx = velocities[idx];
      let vy = velocities[idx + 1];
      let vz = velocities[idx + 2];
      
      // Calculate distances in 3D space
      const dx = x - mouseX;
      const dy = y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      const influenceRadius = 5.0;
      
      if (dist < influenceRadius && isPointerActive) {
        // Linear drop-off of force based on distance
        const force = (influenceRadius - dist) / influenceRadius;
        const angle = Math.atan2(dy, dx);
        
        // Repulsion / deformation force
        vx += Math.cos(angle) * force * 0.25;
        vy += Math.sin(angle) * force * 0.25;
        // Warp Z depth to create 3D ripple/bubble shape
        vz += (Math.random() - 0.5) * force * 0.2;
      }
      
      // Restoring force to return particles to their home positions (spring effect)
      vx += (origX - x) * 0.03;
      vy += (origY - y) * 0.03;
      vz += (origZ - z) * 0.03;
      
      // Air friction / damping
      vx *= 0.86;
      vy *= 0.86;
      vz *= 0.86;
      
      array[idx] = x + vx;
      array[idx + 1] = y + vy;
      array[idx + 2] = z + vz;
      
      velocities[idx] = vx;
      velocities[idx + 1] = vy;
      velocities[idx + 2] = vz;
    }
    
    positionsAttr.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.28}
        color="#10b981" // Emerald primary color
        transparent
        alphaMap={texture}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

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
    <div className="absolute inset-0 z-0 overflow-hidden">
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

          {/* Render our interactive particle attractor system */}
          <InteractiveParticles />

          <Stars radius={80} depth={40} count={1200} factor={3} saturation={0} fade speed={0.5} />
          <fog attach="fog" args={['#064e3b', 18, 50]} />
        </Suspense>
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-r from-white/30 dark:from-slate-950/30 via-transparent to-transparent opacity-40" />
    </div>
  );
}
