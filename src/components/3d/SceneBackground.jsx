import { Canvas } from '@react-three/fiber';
import { useProfile } from '../../context/ProfileContext';
import ParticleField from './ParticleField';
import FloatingShapes from './FloatingShapes';
import GlowOrb from './GlowOrb';

/**
 * Shared 3D background that reads `profile.backgroundType` from context
 * and renders the matching scene. Each page can pass a `fallback` prop
 * that is used when `backgroundType === 'default'`.
 *
 * @param {{ fallback?: 'particles' | 'shapes' | 'orb' | 'none' }} props
 */
export default function SceneBackground({ fallback = 'particles' }) {
  const { profile } = useProfile();

  const activeBg = profile.backgroundType === 'default'
    ? fallback
    : profile.backgroundType;

  if (activeBg === 'none') return null;

  const speed = profile.speedMultiplier ?? 1.0;
  const primary = profile.themeColor || '#915EFF';
  const secondary = profile.themeSecondaryColor || '#00CEF5';

  return (
    <div className="canvas-bg">
      <Canvas camera={{ position: [0, 0, 6] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.2} />

        {activeBg === 'particles' && (
          <ParticleField
            count={1200}
            color={primary}
            spread={18}
            speed={0.14 * speed}
          />
        )}

        {activeBg === 'shapes' && (
          <FloatingShapes
            count={14}
            primaryColor={primary}
            secondaryColor={secondary}
            speedMultiplier={speed}
          />
        )}

        {activeBg === 'orb' && (
          <GlowOrb
            color={primary}
            size={1.3}
            pulseSpeed={0.6 * speed}
          />
        )}
      </Canvas>
    </div>
  );
}
