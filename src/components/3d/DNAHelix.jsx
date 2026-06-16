import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useProfile } from '../../context/ProfileContext';

export default function DNAHelix({ color = '#915EFF', secondaryColor = '#00CEF5', speed = 1.0 }) {
  const groupRef = useRef();
  const { profile } = useProfile();
  const strandCount = 80;
  const radius = 1.2;
  const height = 12;

  const spheres = useMemo(() => {
    const result = [];
    for (let i = 0; i < strandCount; i++) {
      const t = (i / strandCount) * Math.PI * 6;
      const y = (i / strandCount) * height - height / 2;
      result.push({
        strand1: [Math.cos(t) * radius, y, Math.sin(t) * radius],
        strand2: [Math.cos(t + Math.PI) * radius, y, Math.sin(t + Math.PI) * radius],
        t,
        y,
      });
    }
    return result;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3 * speed;

      if (profile.rgbMode && window.rgbPrimary && window.rgbSecondary) {
        // Compute a moving HSL color based on Y coordinate to create a flowing rainbow wave!
        groupRef.current.traverse((child) => {
          if (child.isMesh && child.material) {
            const yOffset = child.position.y || 0;
            const t = state.clock.elapsedTime * 0.8 * speed;
            const hue = (yOffset / 12 + t * 0.15) % 1.0;
            
            // Set strand colors slightly offset from each other
            const colorHue = child.name === 'strand2' ? (hue + 0.3) % 1.0 : hue;
            child.material.color.setHSL(colorHue, 0.9, 0.5);
            child.material.emissive.setHSL(colorHue, 0.9, 0.5);
          } else if (child.isLine && child.material) {
            // Lines are in local coordinate space of parent group, so we get Y from s.strand1
            const t = state.clock.elapsedTime * 0.8 * speed;
            child.material.color.set(window.rgbPrimary);
          }
        });
      } else {
        groupRef.current.traverse((child) => {
          if (child.isMesh && child.material) {
            if (child.name === 'strand1') {
              child.material.color.set(color);
              child.material.emissive.set(color);
            } else if (child.name === 'strand2') {
              child.material.color.set(secondaryColor);
              child.material.emissive.set(secondaryColor);
            }
          } else if (child.isLine && child.material) {
            child.material.color.set(color);
          }
        });
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -2]}>
      {spheres.map((s, i) => (
        <group key={i}>
          {/* Strand 1 */}
          <mesh name="strand1" position={s.strand1}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.8}
              transparent
              opacity={0.9}
            />
          </mesh>
          {/* Strand 2 */}
          <mesh name="strand2" position={s.strand2}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial
              color={secondaryColor}
              emissive={secondaryColor}
              emissiveIntensity={0.8}
              transparent
              opacity={0.9}
            />
          </mesh>
          {/* Connecting rungs every 4th */}
          {i % 4 === 0 && (
            <line name="rung">
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={2}
                  array={new Float32Array([...s.strand1, ...s.strand2])}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color={color} transparent opacity={0.25} />
            </line>
          )}
        </group>
      ))}
    </group>
  );
}
