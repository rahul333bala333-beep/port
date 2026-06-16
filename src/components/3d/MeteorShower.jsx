import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useProfile } from '../../context/ProfileContext';

function createDeterministicRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export default function MeteorShower({ color = '#915EFF', secondaryColor = '#00CEF5', speed = 1.0 }) {
  const groupRef = useRef();
  const meteorCount = 30;

  const meteors = useMemo(() => {
    const random = createDeterministicRandom(55);
    const result = [];
    for (let i = 0; i < meteorCount; i++) {
      result.push({
        startPos: [
          (random() - 0.5) * 20,
          random() * 10 + 3,
          (random() - 0.5) * 12 - 4,
        ],
        speed: 0.8 + random() * 1.5,
        length: 0.4 + random() * 0.8,
        delay: random() * 10,
        size: 0.015 + random() * 0.025,
        useSecondary: random() > 0.5,
      });
    }
    return result;
  }, []);

  return (
    <group ref={groupRef}>
      {meteors.map((m, i) => (
        <Meteor
          key={i}
          startPos={m.startPos}
          meteorSpeed={m.speed}
          length={m.length}
          delay={m.delay}
          size={m.size}
          color={m.useSecondary ? secondaryColor : color}
          useSecondary={m.useSecondary}
          speed={speed}
        />
      ))}
    </group>
  );
}

function Meteor({ startPos, meteorSpeed, length, delay, size, color, useSecondary, speed }) {
  const meshRef = useRef();
  const trailRef = useRef();
  const { profile } = useProfile();

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    const progress = ((t * meteorSpeed + delay) % 12) - 1;

    const activeColor = (profile.rgbMode && window.rgbPrimary && window.rgbSecondary)
      ? (useSecondary ? window.rgbSecondary : window.rgbPrimary)
      : color;

    if (meshRef.current) {
      meshRef.current.position.x = startPos[0] + progress * 1.5;
      meshRef.current.position.y = startPos[1] - progress * 2;
      meshRef.current.position.z = startPos[2];

      const fade = progress < 0 ? 0 : progress > 10 ? Math.max(0, 1 - (progress - 10)) : 1;
      meshRef.current.material.opacity = fade * 0.9;
      if (meshRef.current.material.color) {
        meshRef.current.material.color.set(activeColor);
      }
    }
    if (trailRef.current) {
      trailRef.current.position.x = startPos[0] + progress * 1.5;
      trailRef.current.position.y = startPos[1] - progress * 2;
      trailRef.current.position.z = startPos[2];
      trailRef.current.material.opacity = (progress < 0 ? 0 : progress > 10 ? 0 : 0.35);
      if (trailRef.current.material.color) {
        trailRef.current.material.color.set(activeColor);
      }
    }
  });

  return (
    <group>
      {/* Head */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 6, 6]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Trail */}
      <mesh ref={trailRef} rotation={[0, 0, Math.atan2(-2, 1.5)]}>
        <planeGeometry args={[length, size * 2]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
