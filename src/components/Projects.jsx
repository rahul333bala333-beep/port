import { useEffect, useRef } from 'react';
import { useProfile } from '../context/ProfileContext';
import SceneBackground from './3d/SceneBackground';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import '../styles/Projects.css';

gsap.registerPlugin(ScrollTrigger);

export default function Projects() {
  const { profile } = useProfile();
  const ctaRef = useRef(null);

  useEffect(() => {
    if (ctaRef.current) {
      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: { trigger: ctaRef.current, start: 'top 85%' },
        }
      );
    }
  }, []);

  return (
    <section id="projects" className="projects-section page-enter">
      <SceneBackground fallback="shapes" />

      <div className="container">
        <h2 className="section-title">Projects</h2>

        <div ref={ctaRef} className="projects-cta projects-github-only">
          <p>Explore all my projects, source code, and contributions on GitHub.</p>
          <a
            href={profile.github || 'https://github.com/rahul333bala333-beep'}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Visit GitHub →
          </a>
        </div>
      </div>
    </section>
  );
}
