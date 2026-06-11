import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Icosahedron, TorusKnot, Sphere, Box, Torus } from '@react-three/drei';
import gsap from 'gsap';
import { useProfile } from '../context/ProfileContext';
import SceneBackground from './3d/SceneBackground';
import '../styles/Hero.css';

function RotatingShape({ type, wireframe, color, secondaryColor, speedMultiplier }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      const speed = speedMultiplier !== undefined ? speedMultiplier : 1.0;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3 * speed;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5 * speed;
    }
  });

  const materialProps = {
    color: color || '#915EFF',
    emissive: secondaryColor || '#00CEF5',
    emissiveIntensity: 0.6,
    wireframe: wireframe !== false,
    metalness: 0.9,
    roughness: 0.15,
  };

  switch (type) {
    case 'torusKnot':
      return (
        <TorusKnot ref={meshRef} args={[0.7, 0.22, 120, 16]}>
          <meshStandardMaterial {...materialProps} />
        </TorusKnot>
      );
    case 'sphere':
      return (
        <Sphere ref={meshRef} args={[1, 32, 32]}>
          <meshStandardMaterial {...materialProps} />
        </Sphere>
      );
    case 'cube':
      return (
        <Box ref={meshRef} args={[1.1, 1.1, 1.1]}>
          <meshStandardMaterial {...materialProps} />
        </Box>
      );
    case 'torus':
      return (
        <Torus ref={meshRef} args={[0.8, 0.22, 16, 100]}>
          <meshStandardMaterial {...materialProps} />
        </Torus>
      );
    case 'icosahedron':
    default:
      return (
        <Icosahedron ref={meshRef} args={[1, 4]}>
          <meshStandardMaterial {...materialProps} />
        </Icosahedron>
      );
  }
}

export default function Hero() {
  const { profile } = useProfile();

  useEffect(() => {
    const titleElement = document.querySelector('.hero-title');
    const subtitleElement = document.querySelector('.hero-subtitle');

    if (titleElement) {
      gsap.fromTo(
        titleElement,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
      );
    }

    if (subtitleElement) {
      gsap.fromTo(
        subtitleElement,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, delay: 0.3, ease: 'power3.out' }
      );
    }
  }, [profile]);

  return (
    <section className="hero">
      {/* Ambient page background from 3D Control Center */}
      <SceneBackground fallback="particles" />

      {/* Main interactive 3D shape */}
      <div className="hero-canvas-container">
        <Canvas camera={{ position: [0, 0, 3.5] }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[5, 5, 5]} intensity={1.5} />
          <pointLight position={[-5, -5, 5]} intensity={1} />
          <RotatingShape
            type={profile.heroGeometry || 'icosahedron'}
            wireframe={profile.wireframe}
            color={profile.themeColor}
            secondaryColor={profile.themeSecondaryColor}
            speedMultiplier={profile.speedMultiplier}
          />
          <OrbitControls enableZoom={false} autoRotate={false} />
        </Canvas>
      </div>

      <div className="hero-content">
        <h1 className="hero-title">
          Hi, I'm <span className="gradient-text">{profile.name}</span>
        </h1>
        <p className="hero-subtitle">
          {profile.subtitle}
        </p>

        <div className="hero-buttons">
          <Link to="/projects" className="btn btn-primary">
            Explore My Work
          </Link>
          <Link to="/contact" className="btn btn-secondary">
            Get In Touch
          </Link>
        </div>

        <div className="hero-info">
          <div className="info-item">
            <h3>{profile.yearsLearning}</h3>
            <p>Years Learning</p>
          </div>
          <div className="info-item">
            <h3>{profile.projectsCompleted}</h3>
            <p>Projects Completed</p>
          </div>
          <div className="info-item">
            <h3>{profile.certifications}</h3>
            <p>Certifications</p>
          </div>
        </div>
      </div>

      <div className="scroll-indicator">
        <span>Scroll to explore</span>
        <div className="mouse">
          <div className="wheel"></div>
        </div>
      </div>
    </section>
  );
}
