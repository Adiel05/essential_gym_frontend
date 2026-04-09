import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Cylinder, Box, Torus, Sphere, MeshDistortMaterial } from '@react-three/drei';

// Componente para la barra con discos
const Barbell = ({ position }) => {
  const barRef = useRef();
  useFrame(() => {
    if (barRef.current) barRef.current.rotation.z += 0.005;
  });
  return (
    <group position={position} ref={barRef}>
      {/* Barra */}
      <Cylinder args={[0.1, 0.1, 2, 8]} rotation={[0, 0, 0]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#ccc" metalness={0.8} roughness={0.3} />
      </Cylinder>
      {/* Discos izquierdos */}
      <Cylinder args={[0.4, 0.4, 0.2, 16]} position={[-0.8, 0, 0]}>
        <meshStandardMaterial color="#1A4B8C" metalness={0.6} />
      </Cylinder>
      <Cylinder args={[0.4, 0.4, 0.2, 16]} position={[-1.0, 0, 0]}>
        <meshStandardMaterial color="#1A4B8C" metalness={0.6} />
      </Cylinder>
      {/* Discos derechos */}
      <Cylinder args={[0.4, 0.4, 0.2, 16]} position={[0.8, 0, 0]}>
        <meshStandardMaterial color="#1A4B8C" metalness={0.6} />
      </Cylinder>
      <Cylinder args={[0.4, 0.4, 0.2, 16]} position={[1.0, 0, 0]}>
        <meshStandardMaterial color="#1A4B8C" metalness={0.6} />
      </Cylinder>
    </group>
  );
};

// Componente para cinta de correr
const Treadmill = ({ position }) => (
  <group position={position}>
    <Box args={[1.2, 0.2, 0.8]} position={[0, 0, 0]}>
      <meshStandardMaterial color="#555" metalness={0.4} roughness={0.6} />
    </Box>
    <Box args={[1.0, 0.1, 0.5]} position={[0, 0.15, 0]}>
      <meshStandardMaterial color="#222" metalness={0.1} />
    </Box>
    <Cylinder args={[0.1, 0.1, 0.4, 8]} position={[0.5, 0.2, 0.4]}>
      <meshStandardMaterial color="#ccc" />
    </Cylinder>
  </group>
);

// Componente principal de la escena
const GymScene = () => {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <pointLight position={[-2, 3, 4]} intensity={0.8} color="#6EC8E0" />
      
      {/* Suelo virtual */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <shadowMaterial opacity={0.3} color="#000" transparent />
      </mesh>

      <Barbell position={[-1.5, -0.5, 0]} />
      <Treadmill position={[1.2, -0.8, 0.5]} />
      
      {/* Pesa rusa (kettlebell) */}
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
        <group position={[0, -0.2, 1.2]}>
          <Sphere args={[0.3, 32, 32]}>
            <MeshDistortMaterial color="#6EC8E0" metalness={0.7} roughness={0.2} distort={0.2} speed={2} />
          </Sphere>
          <Torus args={[0.25, 0.05, 16, 32]} position={[0, 0.35, 0]} rotation={[0, 0, 0]}>
            <meshStandardMaterial color="#1A4B8C" metalness={0.8} />
          </Torus>
        </group>
      </Float>

      {/* Partículas flotantes (como gotas de sudor o polvo de magnesio) */}
      {[...Array(50)].map((_, i) => (
        <Float key={i} speed={0.5 + Math.random() * 1.5} floatIntensity={0.5 + Math.random()}>
          <mesh position={[Math.sin(i) * 4, Math.cos(i * 2) * 2, Math.cos(i) * 3 - 2]}>
            <sphereGeometry args={[0.03, 4, 4]} />
            <meshStandardMaterial color="#6EC8E0" emissive="#1A4B8C" emissiveIntensity={0.3} />
          </mesh>
        </Float>
      ))}
      
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.8} />
    </>
  );
};

export default GymScene;