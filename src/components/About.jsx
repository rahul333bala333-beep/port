import { useEffect } from 'react';
import SceneBackground from './3d/SceneBackground';
import { useProfile } from '../context/ProfileContext';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import '../styles/About.css';

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const { profile } = useProfile();

  useEffect(() => {
    const aboutSection = document.querySelector('.about-section');
    if (aboutSection) {
      gsap.fromTo(
        aboutSection,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: aboutSection,
            start: 'top 80%',
          },
        }
      );
    }
  }, [profile]);

  return (
    <section id="about" className="about-section page-enter">
      <SceneBackground fallback="particles" />

      <div className="container">
        <h2 className="section-title">About Me</h2>

        <div className="about-content">
          <div className="about-text glass-card">
            <h3>Career Objective</h3>
            <p>{profile.bio}</p>

            <div className="about-stats">
              <div className="stat">
                <h4>{profile.cgpa}</h4>
                <p>Current CGPA</p>
              </div>
              <div className="stat">
                <h4>{profile.degreeYears}</h4>
                <p>{profile.degree}</p>
              </div>
              <div className="stat">
                <h4 style={{ fontSize: '1.2rem' }}>{profile.college}</h4>
                <p>Engineering College</p>
              </div>
            </div>
          </div>

          <div className="about-highlights">
            <div className="highlight-box glass-card">
              <h4>🎓 Education</h4>
              <p>{profile.degree} from {profile.college}</p>
            </div>
            <div className="highlight-box glass-card">
              <h4>💼 Internship</h4>
              <p>Full Stack Development & UI/UX Design at Aathesh Soft Infotech</p>
            </div>
            <div className="highlight-box glass-card">
              <h4>🔒 Focus</h4>
              <p>Web Development, Security, and User Experience Design</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
