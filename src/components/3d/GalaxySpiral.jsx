import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useProfile } from '../../context/ProfileContext';

function createDeterministicRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export default function GalaxySpiral({ color = '#915EFF', secondaryColor = '#00CEF5', speed = 1.0 }) {
  const pointsRef = useRef();
  const { profile } = useProfile();
  const count = 3000;
  const arms = 3;

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const random = createDeterministicRandom(77);

    const c1 = new THREE.Color(color);
    const c2 = new THREE.Color(secondaryColor);

    for (let i = 0; i < count; i++) {
      const armIndex = i % arms;
      const armAngle = (armIndex / arms) * Math.PI * 2;
      const dist = random() * 5;
      const spin = dist * 1.2;

      const scatter = (random() - 0.5) * 0.6 * (dist * 0.3 + 0.2);
      const scatterY = (random() - 0.5) * 0.3;
      const scatterZ = (random() - 0.5) * 0.6 * (dist * 0.3 + 0.2);

      positions[i * 3] = Math.cos(armAngle + spin) * dist + scatter;
      positions[i * 3 + 1] = scatterY;
      positions[i * 3 + 2] = Math.sin(armAngle + spin) * dist + scatterZ;

      const mix = dist / 5;
      const mixed = c1.clone().lerp(c2, mix);
      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }

    return { positions, colors };
  }, [color, secondaryColor]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.08 * speed;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05 * speed) * 0.15;

      if (profile.rgbMode && window.rgbPrimary && window.rgbSecondary) {
        const colorsAttr = pointsRef.current.geometry.attributes.color;
        const colorArray = colorsAttr.array;
        
        const c1 = new THREE.Color(window.rgbPrimary);
        const c2 = new THREE.Color(window.rgbSecondary);
        const time = state.clock.elapsedTime * 0.3 * speed;

        for (let i = 0; i < count; i++) {
          const mix = ((i % 100) / 100 + time) % 1.0;
          const mixed = c1.clone().lerp(c2, mix);
          colorArray[i * 3] = mixed.r;
          colorArray[i * 3 + 1] = mixed.g;
          colorArray[i * 3 + 2] = mixed.b;
        }
        colorsAttr.needsUpdate = true;
      }
    }
  });

  return (
    <points ref={pointsRef} position={[0, 0, -1]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        vertexColors
        transparent
        opacity={0.75}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
