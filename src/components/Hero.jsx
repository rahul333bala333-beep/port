import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Icosahedron, TorusKnot, Sphere, Box, Torus } from '@react-three/drei';
import gsap from 'gsap';
import { useProfile } from '../context/ProfileContext';
import SceneBackground from './3d/SceneBackground';
import profilePhoto from '../assets/profile.png';
import '../styles/Hero.css';

function RotatingShape({ type, wireframe, color, secondaryColor, speedMultiplier }) {
  const meshRef = useRef();
  const { profile } = useProfile();

  useFrame((state) => {
    if (meshRef.current) {
      const speed = speedMultiplier !== undefined ? speedMultiplier : 1.0;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3 * speed;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5 * speed;

      if (meshRef.current.material) {
        if (profile.rgbMode && window.rgbPrimary && window.rgbSecondary) {
          meshRef.current.material.color.set(window.rgbPrimary);
          meshRef.current.material.emissive.set(window.rgbSecondary);
        } else {
          meshRef.current.material.color.set(color || '#915EFF');
          meshRef.current.material.emissive.set(secondaryColor || '#00CEF5');
        }
      }
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

  const hasRightElement = true; // Always has right element (3D canvas or profile photo)

  return (
    <section className={`hero ${!hasRightElement ? 'no-shape' : ''}`}>
      {/* Ambient page background from 3D Control Center */}
      <SceneBackground fallback="particles" />

      <div className="hero-content">
        <div className="hero-badge">Welcome To My Portfolio</div>
        
        <h1 className="hero-title">
          Hi, I'm <span className="gradient-text">{profile.name}</span>
        </h1>
        <p className="hero-subtitle">
          {profile.subtitle}
        </p>
        <p className="hero-description">
          {profile.bio}
        </p>

        <div className="hero-buttons">
          <Link to="/contact" className="btn btn-primary">
            Hire Me
          </Link>
          {profile.resumeUrl ? (
            <a 
              href={profile.resumeUrl} 
              download={`${profile.name.replace(/\s+/g, '_')}_Resume.pdf`} 
              className="btn btn-secondary"
            >
              Download Resume
            </a>
          ) : (
            <button 
              className="btn btn-secondary" 
              onClick={() => alert("Resume not uploaded yet. Please unlock the Profile Editor (using ?edit=true in the URL) and upload your resume PDF.")}
            >
              Download Resume
            </button>
          )}
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

      {/* Main interactive 3D shape OR Profile Photo */}
      {profile.showHeroShape !== false ? (
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
      ) : (
        <div className="hero-photo-container">
          <div className="hero-photo-card glass-card">
            <div className="hero-photo-glow"></div>
            <img 
              src={profile.photoUrl || profilePhoto} 
              alt={profile.name} 
              className="hero-profile-img" 
            />
          </div>
        </div>
      )}

      <div className="scroll-indicator">
        <span>Scroll to explore</span>
        <div className="mouse">
          <div className="wheel"></div>
        </div>
      </div>
    </section>
  );
}
