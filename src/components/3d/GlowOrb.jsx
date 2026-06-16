import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useProfile } from '../../context/ProfileContext';

export default function GlowOrb({ color = '#915EFF', size = 1.2, pulseSpeed = 0.8 }) {
  const meshRef = useRef();
  const glowRef = useRef();
  const { profile } = useProfile();

  useFrame((state) => {
    const t = state.clock.elapsedTime * pulseSpeed;
    if (meshRef.current) {
      meshRef.current.scale.setScalar(size + Math.sin(t) * 0.15);
      meshRef.current.rotation.y = t * 0.3;
      meshRef.current.rotation.x = t * 0.2;

      if (meshRef.current.material) {
        if (profile.rgbMode && window.rgbPrimary) {
          meshRef.current.material.color.set(window.rgbPrimary);
          meshRef.current.material.emissive.set(window.rgbPrimary);
        } else {
          meshRef.current.material.color.set(color);
          meshRef.current.material.emissive.set(color);
        }
      }
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(size * 1.6 + Math.sin(t + 1) * 0.2);

      if (glowRef.current.material) {
        if (profile.rgbMode && window.rgbPrimary) {
          glowRef.current.material.color.set(window.rgbPrimary);
        } else {
          glowRef.current.material.color.set(color);
        }
      }
    }
  });

  return (
    <group>
      {/* Outer glow shell */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.04} />
      </mesh>

      {/* Inner core */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 4]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.9}
          roughness={0.1}
          wireframe
        />
      </mesh>
    </group>
  );
}
