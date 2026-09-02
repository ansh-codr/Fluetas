"use client";

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

function BackgroundBlob() {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    return new THREE.TorusKnotGeometry(3, 1.2, 128, 32);
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={2} floatIntensity={2}>
      <mesh ref={meshRef} geometry={geometry}>
        <meshPhysicalMaterial 
          color="#2E7D32"
          emissive="#0a200a"
          roughness={0.4}
          metalness={0.1}
          clearcoat={0.5}
          transmission={0.9}
          ior={1.5}
          thickness={2}
          envMapIntensity={1}
        />
      </mesh>
    </Float>
  );
}

export default function HeroBackground3D() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen" style={{ zIndex: 0 }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 35 }}>
        <Environment preset="dawn" />
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#4CA84F" />
        <directionalLight position={[-10, -10, -5]} intensity={1} color="#C23B6B" />
        <BackgroundBlob />
      </Canvas>
    </div>
  );
}
