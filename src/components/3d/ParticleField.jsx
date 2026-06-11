import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function createDeterministicRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export default function ParticleField({ count = 1500, color = '#915EFF', spread = 20, speed = 0.15 }) {
  const meshRef = useRef();

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const random = createDeterministicRandom(42);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (random() - 0.5) * spread;
      positions[i * 3 + 1] = (random() - 0.5) * spread;
      positions[i * 3 + 2] = (random() - 0.5) * spread;
      scales[i] = random();
    }
    return { positions, scales };
  }, [count, spread]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime * speed;
    const posArray = meshRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      posArray[i3 + 1] += Math.sin(time + particles.scales[i] * 10) * 0.002;
      posArray[i3] += Math.cos(time + particles.scales[i] * 10) * 0.001;
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
    meshRef.current.rotation.y = time * 0.05;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color={color}
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
