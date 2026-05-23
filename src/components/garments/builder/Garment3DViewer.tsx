"use client"

import { Suspense, useRef, useState, useMemo, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { 
  OrbitControls, 
  Environment, 
  ContactShadows,
  useTexture,
  Center,
  PerspectiveCamera,
  Grid,
  SoftShadows,
  useGLTF,
  Decal,
  MeshTransmissionMaterial,
} from "@react-three/drei"
import * as THREE from "three"
import { GarmentType } from "@/lib/garments/catalog"
import { DesignPlacement } from "./PlacementCanvas"

interface Garment3DViewerProps {
  garment: GarmentType
  placements: DesignPlacement[]
  selectedColor: string
  autoRotate?: boolean
}

// Advanced fabric material with realistic properties
function useFabricMaterial(color: string) {
  const fabricColor = useMemo(() => new THREE.Color(color), [color])
  
  return useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: fabricColor,
      roughness: 0.85,
      metalness: 0.05,
      sheen: 1.0,
      sheenRoughness: 0.5,
      sheenColor: new THREE.Color(0xffffff),
      clearcoat: 0.0,
      clearcoatRoughness: 1.0,
      side: THREE.DoubleSide,
    })
  }, [fabricColor])
}

// T-Shirt with curved, organic shape
function TeeShirtGeometry({ material }: { material: THREE.Material }) {
  const groupRef = useRef<THREE.Group>(null)
  
  // Create curved t-shirt shape using custom geometry
  const bodyGeometry = useMemo(() => {
    const shape = new THREE.Shape()
    
    // Draw t-shirt outline
    const w = 0.7 // half width
    const h = 0.9 // half height
    const sw = 0.25 // sleeve width
    const sh = 0.35 // sleeve height
    const nw = 0.2 // neck width
    const nh = 0.15 // neck height
    
    // Start at bottom left
    shape.moveTo(-w, -h)
    // Bottom curve
    shape.lineTo(w, -h)
    // Right side up
    shape.lineTo(w, h - sh)
    // Right sleeve
    shape.lineTo(w + sw, h - sh + 0.1)
    shape.lineTo(w + sw - 0.05, h - sh + 0.25)
    // Right shoulder
    shape.lineTo(nw, h)
    // Neck curve
    shape.quadraticCurveTo(0, h - nh - 0.05, -nw, h)
    // Left shoulder
    shape.lineTo(-(w + sw - 0.05), h - sh + 0.25)
    // Left sleeve
    shape.lineTo(-(w + sw), h - sh + 0.1)
    shape.lineTo(-w, h - sh)
    // Back to start
    shape.lineTo(-w, -h)
    
    const extrudeSettings = {
      depth: 0.12,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.02,
      bevelThickness: 0.02,
      curveSegments: 12,
    }
    
    return new THREE.ExtrudeGeometry(shape, extrudeSettings)
  }, [])
  
  // Add subtle wave animation
  useFrame((state) => {
    if (groupRef.current) {
      // Gentle breathing animation
      groupRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.005
      groupRef.current.scale.x = 1 + Math.cos(state.clock.elapsedTime * 0.6) * 0.003
    }
  })
  
  return (
    <group ref={groupRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <mesh castShadow receiveShadow material={material} geometry={bodyGeometry}>
      </mesh>
      
      {/* Neck ribbing */}
      <mesh position={[0, 0.85, 0.06]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.18, 0.03, 8, 32, Math.PI * 1.3]} />
        <primitive object={material} />
      </mesh>
      
      {/* Fabric fold details */}
      <mesh position={[0.25, 0.3, 0.07]} rotation={[-Math.PI / 2, 0, 0.3]}>
        <planeGeometry args={[0.3, 0.02]} />
        <meshBasicMaterial color={0x000000} transparent opacity={0.1} />
      </mesh>
      <mesh position={[-0.2, -0.1, 0.07]} rotation={[-Math.PI / 2, 0, -0.2]}>
        <planeGeometry args={[0.35, 0.02]} />
        <meshBasicMaterial color={0x000000} transparent opacity={0.1} />
      </mesh>
    </group>
  )
}

// Hoodie with hood and pockets
function HoodieGeometry({ material, color }: { material: THREE.Material, color: THREE.Color }) {
  const groupRef = useRef<THREE.Group>(null)
  
  const bodyGeometry = useMemo(() => {
    const shape = new THREE.Shape()
    const w = 0.75
    const h = 1.0
    const sw = 0.3
    const sh = 0.4
    
    shape.moveTo(-w, -h)
    shape.lineTo(w, -h)
    shape.lineTo(w, h - sh)
    shape.lineTo(w + sw, h - sh + 0.1)
    shape.lineTo(w + sw - 0.05, h - sh + 0.3)
    shape.lineTo(0.35, h + 0.15)
    // Hood opening
    shape.quadraticCurveTo(0, h + 0.35, -0.35, h + 0.15)
    shape.lineTo(-(w + sw - 0.05), h - sh + 0.3)
    shape.lineTo(-(w + sw), h - sh + 0.1)
    shape.lineTo(-w, h - sh)
    shape.lineTo(-w, -h)
    
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.15,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.02,
      bevelThickness: 0.02,
      curveSegments: 12,
    })
  }, [])
  
  return (
    <group ref={groupRef} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh castShadow receiveShadow material={material} geometry={bodyGeometry} />
      
      {/* Kangaroo pocket */}
      <mesh position={[0, -0.3, 0.08]} rotation={[-Math.PI / 2, 0, 0]}>
        <shapeGeometry args={[(() => {
          const s = new THREE.Shape()
          s.moveTo(-0.4, 0)
          s.lineTo(0.4, 0)
          s.lineTo(0.35, -0.4)
          s.lineTo(-0.35, -0.4)
          return s
        })()]} />
        <meshPhysicalMaterial 
          color={color.clone().multiplyScalar(0.95)}
          roughness={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Hood */}
      <mesh position={[0, 1.15, -0.05]}>
        <sphereGeometry args={[0.35, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <primitive object={material} />
      </mesh>
      
      {/* Drawstrings */}
      <mesh position={[-0.1, 1.0, 0.15]}>
        <cylinderGeometry args={[0.015, 0.015, 0.4]} />
        <meshStandardMaterial color={0xeeeeee} />
      </mesh>
      <mesh position={[0.1, 1.0, 0.15]}>
        <cylinderGeometry args={[0.015, 0.015, 0.4]} />
        <meshStandardMaterial color={0xeeeeee} />
      </mesh>
    </group>
  )
}

// Pants with realistic leg shape
function PantsGeometry({ material }: { material: THREE.Material }) {
  const groupRef = useRef<THREE.Group>(null)
  
  return (
    <group ref={groupRef}>
      {/* Waist */}
      <mesh castShadow receiveShadow material={material} position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.65, 0.7, 0.25, 32]} />
      </mesh>
      
      {/* Left leg */}
      <mesh castShadow receiveShadow material={material} position={[-0.32, 0.3, 0]}>
        <cylinderGeometry args={[0.28, 0.22, 1.8, 32]} />
      </mesh>
      
      {/* Right leg */}
      <mesh castShadow receiveShadow material={material} position={[0.32, 0.3, 0]}>
        <cylinderGeometry args={[0.28, 0.22, 1.8, 32]} />
      </mesh>
      
      {/* Crotch area */}
      <mesh castShadow receiveShadow material={material} position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.35, 0.4, 0.3, 32]} />
      </mesh>
      
      {/* Fly/zipper area */}
      <mesh position={[0, 1.15, 0.35]}>
        <planeGeometry args={[0.08, 0.3]} />
        <meshBasicMaterial color={0x000000} transparent opacity={0.2} />
      </mesh>
      
      {/* Pockets */}
      <mesh position={[-0.35, 1.25, 0.15]} rotation={[0, 0.3, 0]}>
        <planeGeometry args={[0.2, 0.25]} />
        <meshBasicMaterial color={0x000000} transparent opacity={0.1} />
      </mesh>
      <mesh position={[0.35, 1.25, 0.15]} rotation={[0, -0.3, 0]}>
        <planeGeometry args={[0.2, 0.25]} />
        <meshBasicMaterial color={0x000000} transparent opacity={0.1} />
      </mesh>
    </group>
  )
}

// Cap with curved brim
function CapGeometry({ material }: { material: THREE.Material }) {
  return (
    <group>
      {/* Crown */}
      <mesh castShadow receiveShadow material={material} position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.5, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
      </mesh>
      
      {/* Front panel (flat) */}
      <mesh castShadow receiveShadow material={material} position={[0, 0.35, 0.25]}>
        <boxGeometry args={[0.5, 0.4, 0.08]} />
      </mesh>
      
      {/* Brim - curved using shape */}
      <mesh castShadow receiveShadow material={material} position={[0, 0.15, 0.5]} rotation={[0.2, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.05, 32, 1, false, -Math.PI * 0.4, Math.PI * 0.8]} />
      </mesh>
      
      {/* Top button */}
      <mesh position={[0, 0.72, 0]}>
        <sphereGeometry args={[0.04]} />
        <primitive object={material} />
      </mesh>
      
      {/* Ventilation eyelets */}
      {[[-0.25, 0.45, 0.35] as const, [0.25, 0.45, 0.35] as const, [-0.35, 0.4, 0.25] as const, [0.35, 0.4, 0.25] as const].map((pos, i) => (
        <mesh key={i} position={pos}>
          <circleGeometry args={[0.025]} />
          <meshBasicMaterial color={0x000000} />
        </mesh>
      ))}
    </group>
  )
}

// Tote bag
function BagGeometry({ material }: { material: THREE.Material }) {
  return (
    <group>
      {/* Main body - slightly tapered */}
      <mesh castShadow receiveShadow material={material} position={[0, 0, 0]}>
        <cylinderGeometry args={[0.6, 0.7, 1.4, 4]} />
      </mesh>
      
      {/* Handles */}
      <mesh castShadow material={material} position={[-0.35, 0.9, 0]}>
        <torusGeometry args={[0.25, 0.04, 8, 32, Math.PI]} />
      </mesh>
      <mesh castShadow material={material} position={[0.35, 0.9, 0]}>
        <torusGeometry args={[0.25, 0.04, 8, 32, Math.PI]} />
      </mesh>
      
      {/* Bottom reinforcement */}
      <mesh position={[0, -0.7, 0]}>
        <boxGeometry args={[1.3, 0.05, 0.35]} />
        <meshStandardMaterial color={0x000000} transparent opacity={0.2} />
      </mesh>
    </group>
  )
}

// Design Decal with proper projection
function DesignDecal({ 
  texture, 
  placement, 
  garmentCategory 
}: { 
  texture: THREE.Texture
  placement: DesignPlacement
  garmentCategory: string
}) {
  const decalRef = useRef<THREE.Mesh>(null)
  
  const position = useMemo(() => {
    // Map 2D placement to 3D coordinates
    const x = ((placement.x - 50) / 50) * 0.65
    const y = ((50 - placement.y) / 50) * 0.9
    const z = 0.15
    
    switch (garmentCategory) {
      case "tops":
        return new THREE.Vector3(x, y - 0.05, z)
      case "outerwear":
        return new THREE.Vector3(x, y + 0.1, z + 0.05)
      case "bottoms":
        return new THREE.Vector3(x * 0.8, y - 0.5, z)
      case "headwear":
        return new THREE.Vector3(x * 0.6, y * 0.3 + 0.35, z + 0.3)
      case "bags":
        return new THREE.Vector3(x * 0.8, y - 0.2, z + 0.2)
      default:
        return new THREE.Vector3(x, y, z)
    }
  }, [placement.x, placement.y, garmentCategory])
  
  const scale = useMemo(() => {
    const s = placement.scale * 0.4
    return new THREE.Vector3(s, s, s)
  }, [placement.scale])
  
  const rotation = useMemo(() => {
    return new THREE.Euler(0, 0, (placement.rotation * Math.PI) / 180)
  }, [placement.rotation])
  
  return (
    <Decal 
      position={position}
      rotation={rotation}
      scale={scale}
      map={texture}
    />
  )
}

// Main Garment Model
function GarmentModel({ 
  garment, 
  placements, 
  selectedColor 
}: { 
  garment: GarmentType
  placements: DesignPlacement[]
  selectedColor: string
}) {
  const groupRef = useRef<THREE.Group>(null)
  const material = useFabricMaterial(selectedColor)
  const color = useMemo(() => new THREE.Color(selectedColor), [selectedColor])
  
  // Load placement textures
  const placementTextures = useMemo(() => {
    return placements.map(p => {
      const imageUrl = p.design.thumbnail_url || p.design.image_url
      if (!imageUrl) return null
      
      try {
        const loader = new THREE.TextureLoader()
        loader.setCrossOrigin('anonymous')
        const texture = loader.load(imageUrl)
        texture.needsUpdate = true
        texture.minFilter = THREE.LinearFilter
        texture.magFilter = THREE.LinearFilter
        texture.anisotropy = 16
        return { texture, placement: p }
      } catch (e) {
        console.warn('Error creating texture:', e)
        return null
      }
    }).filter((item): item is { texture: THREE.Texture; placement: DesignPlacement } => item !== null)
  }, [placements])
  
  // Render appropriate geometry
  const renderGarment = () => {
    switch (garment.category) {
      case "tops":
        // Check if it's a hoodie
        if (garment.name.toLowerCase().includes('hoodie')) {
          return <HoodieGeometry material={material} color={color} />
        }
        return <TeeShirtGeometry material={material} />
      case "bottoms":
        return <PantsGeometry material={material} />
      case "headwear":
        return <CapGeometry material={material} />
      case "bags":
        return <BagGeometry material={material} />
      default:
        return <TeeShirtGeometry material={material} />
    }
  }
  
  return (
    <group ref={groupRef}>
      <Center>
        {renderGarment()}
        
        {/* Design Decals */}
        {placementTextures.map((item, index) => (
          <DesignDecal
            key={`${item.placement.id}-${index}`}
            texture={item.texture}
            placement={item.placement}
            garmentCategory={garment.category}
          />
        ))}
      </Center>
    </group>
  )
}

// Scene setup
function Scene({ garment, placements, selectedColor, autoRotate }: Garment3DViewerProps) {
  return (
    <>
      <SoftShadows size={25} samples={10} focus={0.5} />
      
      <PerspectiveCamera makeDefault position={[0, 0, 3.5]} fov={40} />
      
      <OrbitControls 
        enablePan={false}
        enableZoom={true}
        minDistance={2}
        maxDistance={6}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.8}
        autoRotate={autoRotate}
        autoRotateSpeed={1}
        enableDamping={true}
        dampingFactor={0.05}
      />
      
      {/* Studio lighting setup */}
      <ambientLight intensity={0.3} />
      
      {/* Key light */}
      <directionalLight 
        position={[4, 5, 4]} 
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
        shadow-radius={4}
      />
      
      {/* Fill light */}
      <directionalLight position={[-4, 3, 2]} intensity={0.4} color="#e8f5e8" />
      
      {/* Rim light */}
      <directionalLight position={[0, 2, -4]} intensity={0.3} color="#4ade80" />
      
      {/* Environment */}
      <Environment preset="studio" />
      
      {/* Garment */}
      <GarmentModel 
        garment={garment}
        placements={placements}
        selectedColor={selectedColor}
      />
      
      {/* Ground shadow */}
      <ContactShadows 
        position={[0, -1.8, 0]} 
        opacity={0.3}
        scale={8}
        blur={3}
        far={4}
      />
      
      {/* Grid */}
      <Grid
        position={[0, -1.81, 0]}
        args={[10, 10]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#1a2e1a"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#4ade80"
        fadeDistance={5}
        fadeStrength={1}
        infiniteGrid
      />
    </>
  )
}

// Loading screen
function Loader() {
  return (
    <div className="flex items-center justify-center h-full bg-[#0a0f0a]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#4ade80] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#6b8e6b] font-mono text-xs">INITIALIZING 3D ENGINE...</p>
      </div>
    </div>
  )
}

// Client-only wrapper
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <Loader />
  return children
}

// Main export
export function Garment3DViewer({ 
  garment, 
  placements, 
  selectedColor,
  autoRotate = false
}: Garment3DViewerProps) {
  return (
    <div className="relative w-full h-[500px] lg:h-[600px] bg-gradient-to-b from-[#0a0f0a] to-[#050805] border border-[#1a2e1a] overflow-hidden">
      <ClientOnly>
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance",
            stencil: false,
            depth: true,
          }}
          camera={{ position: [0, 0, 3.5], fov: 40 }}
        >
          <Suspense fallback={null}>
            <Scene 
              garment={garment}
              placements={placements}
              selectedColor={selectedColor}
              autoRotate={autoRotate}
            />
          </Suspense>
        </Canvas>
      </ClientOnly>
      
      {/* Controls overlay */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="bg-black/70 backdrop-blur-sm px-4 py-2 border border-[#1a2e1a] rounded">
          <p className="text-[10px] text-[#6b8e6b] font-mono tracking-wider">
            DRAG TO ROTATE • SCROLL TO ZOOM
          </p>
        </div>
        
        <div className="bg-black/70 backdrop-blur-sm px-4 py-2 border border-[#1a2e1a] rounded pointer-events-auto">
          <p className="text-sm text-[#4ade80] font-black tracking-wider">
            {garment.name.toUpperCase()}
          </p>
          <p className="text-[10px] text-[#6b8e6b] font-mono">
            {placements.length} DESIGN{placements.length !== 1 ? 'S' : ''} APPLIED
          </p>
        </div>
      </div>
      
      {/* Corner brackets */}
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#4ade80]" />
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#4ade80]" />
      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#4ade80]" />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#4ade80]" />
    </div>
  )
}

export default Garment3DViewer
