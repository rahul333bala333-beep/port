import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useProfile } from '../../context/ProfileContext';

function createDeterministicRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function Shape({ position, geometry, color, speed, rotationAxis, offset }) {
  const meshRef = useRef();
  const { profile } = useProfile();

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime * speed + offset;
    meshRef.current.rotation.x = t * rotationAxis[0];
    meshRef.current.rotation.y = t * rotationAxis[1];
    meshRef.current.rotation.z = t * rotationAxis[2];
    meshRef.current.position.y = position[1] + Math.sin(t) * 0.3;

    if (meshRef.current.material) {
      if (profile.rgbMode && window.rgbPrimary && window.rgbSecondary) {
        const activeColor = offset > Math.PI ? window.rgbPrimary : window.rgbSecondary;
        meshRef.current.material.color.set(activeColor);
        meshRef.current.material.emissive.set(activeColor);
      } else {
        meshRef.current.material.color.set(color);
        meshRef.current.material.emissive.set(color);
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      {geometry}
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.15}
        wireframe
        emissive={color}
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

export default function FloatingShapes({
  count = 12,
  primaryColor = '#915EFF',
  secondaryColor = '#00CEF5',
  speedMultiplier = 1.0,
}) {
  const shapes = useMemo(() => {
    const random = createDeterministicRandom(88);
    const geometries = [
      <icosahedronGeometry args={[0.5, 0]} />,
      <octahedronGeometry args={[0.5, 0]} />,
      <dodecahedronGeometry args={[0.4, 0]} />,
      <tetrahedronGeometry args={[0.5, 0]} />,
    ];
    const colors = [primaryColor, secondaryColor, '#EC4899', '#22D3EE', '#A78BFA'];
    const result = [];
    
    for (let i = 0; i < count; i++) {
      result.push({
        position: [
          (random() - 0.5) * 14,
          (random() - 0.5) * 10,
          (random() - 0.5) * 8 - 2,
        ],
        geometry: geometries[Math.floor(random() * geometries.length)],
        color: colors[Math.floor(random() * colors.length)],
        speed: (0.2 + random() * 0.4) * speedMultiplier,
        rotationAxis: [
          random() > 0.5 ? 1 : 0.5,
          random() > 0.5 ? 1 : 0.5,
          random() > 0.3 ? 0.3 : 0,
        ],
        offset: random() * Math.PI * 2,
      });
    }
    return result;
  }, [count, primaryColor, secondaryColor, speedMultiplier]);

  return (
    <group>
      {shapes.map((s, i) => (
        <Shape key={i} {...s} />
      ))}
    </group>
  );
}
