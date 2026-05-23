"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { 
  OrbitControls, 
  Grid, 
  Environment, 
  ContactShadows,
  Box,
  useTexture
} from "@react-three/drei";
import * as THREE from "three";
import { ViewPreset, LightingPreset, TransformState } from "@/lib/mockup/use-mockup-state";

interface SceneProps {
  garmentType: string;
  garmentColor: string;
  fabric: string;
  printArea: string;
  designUrl: string | null;
  transform: TransformState;
  viewPreset: ViewPreset;
  autoRotate: boolean;
  zoom: number;
  showGrid: boolean;
  showPrintArea: boolean;
  showSafeZones: boolean;
  lighting: LightingPreset;
  onLoad?: () => void;
}

// Garment placeholder geometry
function GarmentMesh({ 
  garmentType, 
  garmentColor, 
  designUrl, 
  transform,
  showPrintArea,
  showSafeZones,
  printArea 
}: { 
  garmentType: string; 
  garmentColor: string;
  designUrl: string | null;
  transform: TransformState;
  showPrintArea: boolean;
  showSafeZones: boolean;
  printArea: string;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Design texture
  const designTexture = designUrl ? useTexture(designUrl) : null;
  
  if (designTexture) {
    designTexture.encoding = THREE.sRGBEncoding;
  }

  // Get print area dimensions based on area type
  const getPrintAreaConfig = () => {
    switch (printArea) {
      case "front":
      case "back":
        return { width: 1.4, height: 1.8, y: 0.2 };
      case "left-sleeve":
      case "right-sleeve":
        return { width: 0.6, height: 0.8, y: 0.5 };
      default:
        return { width: 1.4, height: 1.8, y: 0.2 };
    }
  };

  const printConfig = getPrintAreaConfig();

  // Garment geometry based on type (simplified representations)
  const getGarmentGeometry = () => {
    switch (garmentType) {
      case "tshirt":
        return (
          <group>
            {/* Torso */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.6, 2.2, 0.3]} />
              <meshStandardMaterial color={garmentColor} roughness={0.8} />
            </mesh>
            {/* Left Sleeve */}
            <mesh position={[-1.1, 0.6, 0]} rotation={[0, 0, 0.3]} castShadow receiveShadow>
              <boxGeometry args={[0.7, 0.9, 0.25]} />
              <meshStandardMaterial color={garmentColor} roughness={0.8} />
            </mesh>
            {/* Right Sleeve */}
            <mesh position={[1.1, 0.6, 0]} rotation={[0, 0, -0.3]} castShadow receiveShadow>
              <boxGeometry args={[0.7, 0.9, 0.25]} />
              <meshStandardMaterial color={garmentColor} roughness={0.8} />
            </mesh>
            {/* Neck */}
            <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.35, 0.35, 0.1, 32]} />
              <meshStandardMaterial color={garmentColor} roughness={0.9} />
            </mesh>
            {/* Neck hole */}
            <mesh position={[0, 1.31, 0]}>
              <cylinderGeometry args={[0.25, 0.25, 0.11, 32]} />
              <meshBasicMaterial color="#0a0a0a" />
            </mesh>
          </group>
        );
      case "hoodie":
        return (
          <group>
            {/* Torso */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.7, 2.4, 0.4]} />
              <meshStandardMaterial color={garmentColor} roughness={0.9} />
            </mesh>
            {/* Left Sleeve */}
            <mesh position={[-1.2, 0.5, 0]} rotation={[0, 0, 0.2]} castShadow receiveShadow>
              <boxGeometry args={[0.75, 1.1, 0.35]} />
              <meshStandardMaterial color={garmentColor} roughness={0.9} />
            </mesh>
            {/* Right Sleeve */}
            <mesh position={[1.2, 0.5, 0]} rotation={[0, 0, -0.2]} castShadow receiveShadow>
              <boxGeometry args={[0.75, 1.1, 0.35]} />
              <meshStandardMaterial color={garmentColor} roughness={0.9} />
            </mesh>
            {/* Hood */}
            <mesh position={[0, 1.6, -0.1]} castShadow receiveShadow>
              <boxGeometry args={[1.0, 0.6, 0.5]} />
              <meshStandardMaterial color={garmentColor} roughness={0.9} />
            </mesh>
            {/* Pocket */}
            <mesh position={[0, -0.5, 0.21]} castShadow receiveShadow>
              <boxGeometry args={[0.8, 0.6, 0.05]} />
              <meshStandardMaterial color={garmentColor} roughness={0.9} />
            </mesh>
          </group>
        );
      case "tank":
        return (
          <group>
            {/* Torso */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.4, 2.2, 0.25]} />
              <meshStandardMaterial color={garmentColor} roughness={0.7} />
            </mesh>
            {/* Left Strap */}
            <mesh position={[-0.5, 1.2, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.2, 0.4, 0.26]} />
              <meshStandardMaterial color={garmentColor} roughness={0.7} />
            </mesh>
            {/* Right Strap */}
            <mesh position={[0.5, 1.2, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.2, 0.4, 0.26]} />
              <meshStandardMaterial color={garmentColor} roughness={0.7} />
            </mesh>
          </group>
        );
      case "longsleeve":
        return (
          <group>
            {/* Torso */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.5, 2.3, 0.3]} />
              <meshStandardMaterial color={garmentColor} roughness={0.8} />
            </mesh>
            {/* Left Sleeve (long) */}
            <mesh position={[-1.25, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.0, 0.8, 0.25]} />
              <meshStandardMaterial color={garmentColor} roughness={0.8} />
            </mesh>
            {/* Right Sleeve (long) */}
            <mesh position={[1.25, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.0, 0.8, 0.25]} />
              <meshStandardMaterial color={garmentColor} roughness={0.8} />
            </mesh>
          </group>
        );
      default:
        return null;
    }
  };

  return (
    <group 
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {getGarmentGeometry()}
      
      {/* Print Area Plane */}
      {(showPrintArea || designUrl) && (printArea === "front" || printArea === "back") && (
        <group 
          position={[
            transform.x * 0.01,
            transform.y * 0.01 + printConfig.y,
            printArea === "back" ? -0.16 : 0.16
          ]}
          rotation={[0, printArea === "back" ? Math.PI : 0, THREE.MathUtils.degToRad(transform.rotation)]}
          scale={[transform.scale, transform.scale, 1]}
        >
          {/* Print area bounds */}
          {showPrintArea && (
            <mesh>
              <planeGeometry args={[printConfig.width, printConfig.height]} />
              <meshBasicMaterial 
                color="#22c55e" 
                transparent 
                opacity={0.1} 
                side={THREE.DoubleSide}
              />
            </mesh>
          )}
          
          {/* Safe zone */}
          {showSafeZones && (
            <mesh>
              <planeGeometry args={[printConfig.width * 0.85, printConfig.height * 0.85]} />
              <meshBasicMaterial 
                color="#22c55e" 
                transparent 
                opacity={0.05} 
                side={THREE.DoubleSide}
              />
            </mesh>
          )}
          
          {/* Print area border */}
          {showPrintArea && (
            <lineSegments>
              <edgesGeometry args={[new THREE.PlaneGeometry(printConfig.width, printConfig.height)]} />
              <lineBasicMaterial color="#22c55e" transparent opacity={0.5} />
            </lineSegments>
          )}
          
          {/* Safe zone border */}
          {showSafeZones && (
            <lineSegments>
              <edgesGeometry args={[new THREE.PlaneGeometry(printConfig.width * 0.85, printConfig.height * 0.85)]} />
              <lineBasicMaterial color="#22c55e" transparent opacity={0.3} />
            </lineSegments>
          )}
          
          {/* Design texture */}
          {designUrl && designTexture && (
            <mesh>
              <planeGeometry args={[printConfig.width, printConfig.height]} />
              <meshBasicMaterial 
                map={designTexture} 
                transparent 
                alphaTest={0.1}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}
        </group>
      )}

      {/* Sleeve print areas */}
      {(showPrintArea || designUrl) && (printArea === "left-sleeve" || printArea === "right-sleeve") && (
        <group 
          position={[
            printArea === "left-sleeve" ? -1.4 : 1.4,
            transform.y * 0.01 + 0.3,
            transform.x * 0.01 + 0.15
          ]}
          rotation={[0, printArea === "left-sleeve" ? -0.3 : 0.3, THREE.MathUtils.degToRad(transform.rotation)]}
          scale={[transform.scale, transform.scale, 1]}
        >
          {showPrintArea && (
            <mesh>
              <planeGeometry args={[printConfig.width, printConfig.height]} />
              <meshBasicMaterial color="#22c55e" transparent opacity={0.1} side={THREE.DoubleSide} />
            </mesh>
          )}
          {showSafeZones && (
            <mesh>
              <planeGeometry args={[printConfig.width * 0.85, printConfig.height * 0.85]} />
              <meshBasicMaterial color="#22c55e" transparent opacity={0.05} side={THREE.DoubleSide} />
            </mesh>
          )}
          {designUrl && designTexture && (
            <mesh>
              <planeGeometry args={[printConfig.width, printConfig.height]} />
              <meshBasicMaterial 
                map={designTexture} 
                transparent 
                alphaTest={0.1}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}
        </group>
      )}
    </group>
  );
}

// Camera controller
function CameraController({ 
  viewPreset, 
  autoRotate, 
  zoom 
}: { 
  viewPreset: ViewPreset; 
  autoRotate: boolean;
  zoom: number;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  const viewPositions: Record<ViewPreset, [number, number, number]> = {
    front: [0, 0, 5],
    "three-quarter": [3, 1, 4],
    side: [5, 0, 0],
    back: [0, 0, -5],
    top: [0, 5, 0],
    bottom: [0, -5, 0],
  };

  useEffect(() => {
    if (controlsRef.current) {
      const target = viewPositions[viewPreset];
      // Animate camera to new position
      const startPos = camera.position.clone();
      const endPos = new THREE.Vector3(...target);
      
      let progress = 0;
      const duration = 500; // ms
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        progress = Math.min(elapsed / duration, 1);
        
        // Easing
        const eased = 1 - Math.pow(1 - progress, 3);
        
        camera.position.lerpVectors(startPos, endPos, eased);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      animate();
    }
  }, [viewPreset, camera]);

  useEffect(() => {
    // Update camera distance based on zoom
    const baseDistance = 5;
    const newDistance = baseDistance * (100 / zoom);
    if (controlsRef.current) {
      controlsRef.current.minDistance = 2;
      controlsRef.current.maxDistance = 10;
    }
  }, [zoom]);

  return (
    <OrbitControls
      ref={controlsRef}
      autoRotate={autoRotate}
      autoRotateSpeed={2}
      enablePan={true}
      enableZoom={true}
      minDistance={2}
      maxDistance={10}
      target={[0, 0, 0]}
    />
  );
}

// Lighting setup
function SceneLighting({ preset }: { preset: LightingPreset }) {
  const lightSetups = {
    studio: (
      <>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
        <directionalLight position={[-5, 5, 5]} intensity={0.4} />
        <pointLight position={[0, 3, 3]} intensity={0.3} />
      </>
    ),
    dramatic: (
      <>
        <ambientLight intensity={0.2} />
        <spotLight 
          position={[5, 8, 5]} 
          angle={0.5} 
          penumbra={0.5} 
          intensity={1.2}
          castShadow
        />
        <directionalLight position={[-3, 2, -3]} intensity={0.3} color="#4169e1" />
      </>
    ),
    minimal: (
      <>
        <ambientLight intensity={0.6} />
        <directionalLight position={[0, 5, 5]} intensity={0.5} castShadow />
      </>
    ),
  };

  return lightSetups[preset];
}

// Main scene component
function Scene({ 
  garmentType, 
  garmentColor, 
  fabric, 
  printArea,
  designUrl,
  transform,
  viewPreset, 
  autoRotate, 
  zoom,
  showGrid,
  showPrintArea,
  showSafeZones,
  lighting,
  onLoad 
}: SceneProps) {
  useEffect(() => {
    onLoad?.();
  }, [onLoad]);

  return (
    <>
      <SceneLighting preset={lighting} />
      
      {showGrid && (
        <Grid
          position={[0, -2, 0]}
          args={[10, 10]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#22c55e"
          sectionSize={2}
          sectionThickness={1}
          sectionColor="#22c55e"
          fadeDistance={25}
          fadeStrength={1}
          infiniteGrid
        />
      )}
      
      <GarmentMesh 
        garmentType={garmentType}
        garmentColor={garmentColor}
        designUrl={designUrl}
        transform={transform}
        showPrintArea={showPrintArea}
        showSafeZones={showSafeZones}
        printArea={printArea}
      />
      
      <ContactShadows
        position={[0, -2, 0]}
        opacity={0.4}
        scale={10}
        blur={2.5}
        far={4}
      />
      
      <CameraController 
        viewPreset={viewPreset} 
        autoRotate={autoRotate}
        zoom={zoom}
      />
    </>
  );
}

// Loading spinner component
function LoadingSpinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#0a0f0a]/80 backdrop-blur-sm z-10">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-3 border-[#22c55e]/30 border-t-[#22c55e] rounded-full animate-spin" />
        <span className="text-[#22c55e] text-sm font-mono">Loading 3D Scene...</span>
      </div>
    </div>
  );
}

// Main exported component
interface ThreeSceneProps {
  garmentType: string;
  garmentColor: string;
  fabric: string;
  printArea: string;
  designUrl: string | null;
  transform: TransformState;
  viewPreset: ViewPreset;
  autoRotate: boolean;
  zoom: number;
  showGrid: boolean;
  showPrintArea: boolean;
  showSafeZones: boolean;
  lighting: LightingPreset;
  className?: string;
}

export function ThreeScene({
  garmentType,
  garmentColor,
  fabric,
  printArea,
  designUrl,
  transform,
  viewPreset,
  autoRotate,
  zoom,
  showGrid,
  showPrintArea,
  showSafeZones,
  lighting,
  className = "",
}: ThreeSceneProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {isLoading && <LoadingSpinner />}
      <Canvas
        shadows
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1,
        }}
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }}
      >
        <Scene
          garmentType={garmentType}
          garmentColor={garmentColor}
          fabric={fabric}
          printArea={printArea}
          designUrl={designUrl}
          transform={transform}
          viewPreset={viewPreset}
          autoRotate={autoRotate}
          zoom={zoom}
          showGrid={showGrid}
          showPrintArea={showPrintArea}
          showSafeZones={showSafeZones}
          lighting={lighting}
          onLoad={() => setIsLoading(false)}
        />
      </Canvas>
    </div>
  );
}
