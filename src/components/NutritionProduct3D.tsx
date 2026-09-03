"use client";

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, PresentationControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

interface ProductProps {
  color: string;
}

function PremiumBottle({ color }: ProductProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating rotation
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.15;
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.6} floatingRange={[-0.05, 0.05]}>
      <group ref={groupRef} position={[0, -0.2, 0]}>
        {/* Outer Frosted Glass Shell */}
        <mesh castShadow>
          <cylinderGeometry args={[0.8, 0.8, 2.4, 64]} />
          <meshPhysicalMaterial 
            color="#ffffff"
            transmission={0.95} // High transmission for glass look
            opacity={1}
            metalness={0.05}
            roughness={0.2} // Frosted effect
            ior={1.4}
            thickness={1.5}
            specularIntensity={1}
            clearcoat={1}
            clearcoatRoughness={0.1}
            envMapIntensity={1.2}
          />
        </mesh>

        {/* Inner Content (The actual product color) */}
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.65, 0.65, 1.9, 64]} />
          <meshStandardMaterial 
            color={color}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>

        {/* Sleek Matte Black Cap */}
        <mesh position={[0, 1.35, 0]} castShadow>
          <cylinderGeometry args={[0.82, 0.82, 0.35, 64]} />
          <meshStandardMaterial 
            color="#12160F"
            roughness={0.4}
            metalness={0.6}
          />
        </mesh>
        
        {/* Subtle Cap Rim Accent */}
        <mesh position={[0, 1.18, 0]}>
          <cylinderGeometry args={[0.83, 0.83, 0.05, 64]} />
          <meshStandardMaterial 
            color={color}
            roughness={0.2}
            metalness={0.8}
            emissive={color}
            emissiveIntensity={0.2}
          />
        </mesh>
      </group>
    </Float>
  );
}

export default function NutritionProduct3D({ color }: ProductProps) {
  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas shadows camera={{ position: [0, 0, 7], fov: 40 }}>
        {/* Clean studio lighting for premium feel */}
        <Environment preset="studio" />
        <ambientLight intensity={0.5} />
        <spotLight position={[5, 8, 5]} angle={0.2} penumbra={1} intensity={1.5} castShadow />
        <spotLight position={[-5, 5, -5]} angle={0.2} penumbra={1} intensity={0.5} color={color} />
        
        <PresentationControls
          global
          snap
          rotation={[0.1, 0, 0]}
          polar={[-Math.PI / 6, Math.PI / 6]}
          azimuth={[-Math.PI / 3, Math.PI / 3]}
        >
          <PremiumBottle color={color} />
        </PresentationControls>

        {/* Beautiful colored soft shadow */}
        <ContactShadows 
          position={[0, -1.8, 0]} 
          opacity={0.65} 
          scale={5} 
          blur={2.5} 
          far={4} 
          color={color} 
        />
      </Canvas>
    </div>
  );
}
