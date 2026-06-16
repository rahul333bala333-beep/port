import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useProfile } from '../../context/ProfileContext';

export default function NeonGrid({ color = '#915EFF', secondaryColor = '#00CEF5', speed = 1.0 }) {
  const gridRef = useRef();
  const { profile } = useProfile();

  // Create longitudinal lines (radiating outward)
  const longLinesCount = 24;
  const longLines = useMemo(() => {
    const lines = [];
    const length = 25;
    const startZ = -20;
    const endZ = 5;

    for (let i = 0; i < longLinesCount; i++) {
      const angle = (i / longLinesCount) * Math.PI * 2;
      const xStart = Math.cos(angle) * 1.5;
      const yStart = Math.sin(angle) * 1.5;
      const xEnd = Math.cos(angle) * 12;
      const yEnd = Math.sin(angle) * 12;

      lines.push(new Float32Array([
        xStart, yStart, startZ,
        xEnd, yEnd, endZ
      ]));
    }
    return lines;
  }, []);

  // Create concentric rings (moving towards the viewer)
  const ringCount = 12;
  const rings = useMemo(() => {
    const result = [];
    for (let i = 0; i < ringCount; i++) {
      result.push({
        initialZ: -20 + (i / ringCount) * 25,
      });
    }
    return result;
  }, []);

  const ringRefs = useRef([]);
  // Reset refs list
  ringRefs.current = [];

  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.8 * speed;
    
    // Rotate the entire grid slightly
    if (gridRef.current) {
      gridRef.current.rotation.z = state.clock.elapsedTime * 0.03 * speed;

      // Color updates based on RGB mode
      gridRef.current.traverse((child) => {
        if (child.material) {
          if (profile.rgbMode && window.rgbPrimary && window.rgbSecondary) {
            const activeColor = child.name === 'long-line' ? window.rgbPrimary : window.rgbSecondary;
            child.material.color.set(activeColor);
          } else {
            if (child.name === 'long-line') {
              child.material.color.set(color);
            } else if (child.name === 'ring') {
              child.material.color.set(secondaryColor);
            }
          }
        }
      });
    }

    // Move rings towards the camera
    ringRefs.current.forEach((ring, idx) => {
      if (ring) {
        const initialZ = rings[idx].initialZ;
        // Shift Z based on time
        let currentZ = initialZ + (t % 25);
        if (currentZ > 5) {
          currentZ -= 25;
        }
        ring.position.z = currentZ;

        // Scale the ring based on depth to make it a cone/tunnel shape
        // At Z = -20, scale is small. At Z = 5, scale is large.
        const normalized = (currentZ + 20) / 25; // 0 to 1
        const scale = 1.5 + normalized * 10;
        ring.scale.set(scale, scale, 1);

        // Fade out rings when they get too close or are too far
        if (ring.material) {
          const opacity = Math.sin(normalized * Math.PI) * 0.5;
          ring.material.opacity = opacity;
        }
      }
    });
  });

  return (
    <group ref={gridRef} position={[0, 0, 0]}>
      {/* Longitudinal lines */}
      {longLines.map((points, i) => (
        <line key={`long-${i}`} name="long-line">
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={points}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={i % 2 === 0 ? color : secondaryColor}
            transparent
            opacity={0.15}
          />
        </line>
      ))}

      {/* Concentric rings moving towards user */}
      {rings.map((_, i) => (
        <mesh
          key={`ring-${i}`}
          ref={(el) => {
            if (el) ringRefs.current[i] = el;
          }}
          position={[0, 0, 0]}
          name="ring"
        >
          {/* Ring geometry using ring or circle */}
          <ringGeometry args={[1, 1.015, 32]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? color : secondaryColor}
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}
