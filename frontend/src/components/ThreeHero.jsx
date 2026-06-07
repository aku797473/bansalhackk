import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PresentationControls, Sky, Stars } from '@react-three/drei';
import { useRef, Suspense, useMemo, useEffect } from 'react';
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
  gradient.addColorStop(0.2, 'rgba(52, 211, 153, 0.8)'); // Emerald glow
  gradient.addColorStop(0.6, 'rgba(16, 185, 129, 0.2)');
  gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
};

/**
 * CursorBubbleTrail (Interactive Bubble Emitter)
 * Spawns circular floating bubbles right under the cursor as the mouse moves.
 * When clicking or touching, it triggers a beautiful dynamic burst of particles.
 */
function CursorBubbleTrail() {
  const count = 250; // Maximum active particles in the pool
  const geomRef = useRef();
  const isPressed = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Generate circular glow texture
  const texture = useMemo(() => createCircleTexture(), []);

  // Set up particle pool
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        age: 0, // 0 means inactive
        maxAge: 40 + Math.random() * 30, // particle lifespan (frames)
        size: 0.15 + Math.random() * 0.35,
      });
    }
    return arr;
  }, []);

  // Allocate typed arrays for position, size, and color attributes
  const [positions, sizes, colors] = useMemo(() => {
    return [
      new Float32Array(count * 3),
      new Float32Array(count),
      new Float32Array(count * 3)
    ];
  }, []);

  // Track click/touch events to spawn bursts
  useEffect(() => {
    const handleDown = () => {
      isPressed.current = true;
    };
    const handleUp = () => {
      isPressed.current = false;
    };
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchstart', handleDown);
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchstart', handleDown);
      window.removeEventListener('touchend', handleUp);
    };
  }, []);

  useFrame((state) => {
    if (!geomRef.current) return;

    const positionsAttr = geomRef.current.attributes.position;
    const sizesAttr = geomRef.current.attributes.size;
    const colorsAttr = geomRef.current.attributes.color;

    const posArr = positionsAttr.array;
    const sizeArr = sizesAttr.array;
    const colorArr = colorsAttr.array;

    // Convert mouse normalized coords to 3D viewport coords
    const mouseX = (state.pointer.x * state.viewport.width) / 2;
    const mouseY = (state.pointer.y * state.viewport.height) / 2;

    const isPointerActive = Math.abs(state.pointer.x) > 0.0001 || Math.abs(state.pointer.y) > 0.0001;
    const mouseMoved = Math.abs(mouseX - lastMousePos.current.x) > 0.03 || Math.abs(mouseY - lastMousePos.current.y) > 0.03;

    // 1. Spawn particles on movement (Trail Effect)
    if (isPointerActive && mouseMoved) {
      // Spawn 2 particles per movement frame
      let spawned = 0;
      for (let i = 0; i < count; i++) {
        if (spawned >= 2) break;
        const p = particles[i];
        if (p.age <= 0) {
          p.x = mouseX;
          p.y = mouseY;
          p.z = (Math.random() - 0.5) * 1.5;

          // Drift direction outwards + slightly upwards
          const angle = Math.random() * Math.PI * 2;
          const speed = 0.01 + Math.random() * 0.03;
          p.vx = Math.cos(angle) * speed;
          p.vy = Math.sin(angle) * speed + 0.015; // float up
          p.vz = (Math.random() - 0.5) * 0.01;

          p.age = p.maxAge;
          p.size = 0.15 + Math.random() * 0.3;
          spawned++;
        }
      }
      lastMousePos.current = { x: mouseX, y: mouseY };
    }

    // 2. Spawn particles on Click/Touch (Burst Effect)
    if (isPointerActive && isPressed.current) {
      let spawned = 0;
      for (let i = 0; i < count; i++) {
        if (spawned >= 6) break; // Spawn a burst of 6 particles per click frame
        const p = particles[i];
        if (p.age <= 0) {
          p.x = mouseX;
          p.y = mouseY;
          p.z = (Math.random() - 0.5) * 2;

          // Rapid radial dispersion velocity
          const angle = Math.random() * Math.PI * 2;
          const speed = 0.06 + Math.random() * 0.1;
          p.vx = Math.cos(angle) * speed;
          p.vy = Math.sin(angle) * speed;
          p.vz = (Math.random() - 0.5) * 0.04;

          p.age = p.maxAge * 0.7; // shorter life for burst
          p.size = 0.25 + Math.random() * 0.35;
          spawned++;
        }
      }
    }

    // 3. Update active particles positions and visual states
    for (let i = 0; i < count; i++) {
      const p = particles[i];
      const idx = i * 3;

      if (p.age > 0) {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Apply friction damping
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.vz *= 0.96;

        p.age -= 1;

        const lifeFactor = p.age / p.maxAge;

        // Set position coords
        posArr[idx] = p.x;
        posArr[idx + 1] = p.y;
        posArr[idx + 2] = p.z;

        // Animate scale (swell, then shrink to 0 at the end of lifecycle)
        sizeArr[i] = p.size * Math.sin(lifeFactor * Math.PI);

        // Dynamic transition color: gold (start) -> green (fading)
        const transition = 1 - lifeFactor;
        colorArr[idx] = 0.9 - transition * 0.8; // red drops
        colorArr[idx + 1] = 0.7 + transition * 0.2; // green rises
        colorArr[idx + 2] = 0.2 + transition * 0.3; // blue rises
      } else {
        // Position inactive particles far out of screen space
        posArr[idx] = 99999;
        posArr[idx + 1] = 99999;
        posArr[idx + 2] = 99999;
        sizeArr[i] = 0;
      }
    }

    positionsAttr.needsUpdate = true;
    sizesAttr.needsUpdate = true;
    colorsAttr.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={`
          attribute float size;
          attribute vec3 color;
          varying vec3 vColor;
          void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (280.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          uniform sampler2D pointTexture;
          varying vec3 vColor;
          void main() {
            gl_FragColor = vec4(vColor, 1.0) * texture2D(pointTexture, gl_PointCoord);
          }
        `}
        uniforms={{
          pointTexture: { value: texture }
        }}
      />
    </points>
  );
}

/**
 * InteractiveParticles (Particle Attractor / Grid Distortion)
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

          {/* Render our interactive particle attractor grid system */}
          <InteractiveParticles />

          {/* Render our custom cursor bubble trail and burst emitter system */}
          <CursorBubbleTrail />

          <Stars radius={80} depth={40} count={1200} factor={3} saturation={0} fade speed={0.5} />
          <fog attach="fog" args={['#064e3b', 18, 50]} />
        </Suspense>
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-r from-white/30 dark:from-slate-950/30 via-transparent to-transparent opacity-40" />
    </div>
  );
}
