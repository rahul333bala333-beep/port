import { useEffect, useRef } from 'react';
import SceneBackground from './3d/SceneBackground';
import { skillsData } from '../data/portfolioData';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import '../styles/Skills.css';

gsap.registerPlugin(ScrollTrigger);

function SkillBox({ skill, level }) {
  const boxRef = useRef();

  useEffect(() => {
    if (boxRef.current) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: boxRef.current,
          start: 'top 85%',
        },
      });

      tl.fromTo(
        boxRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6 }
      ).fromTo(
        boxRef.current.querySelector('.skill-level-bar'),
        { width: 0 },
        { width: `${level}%`, duration: 0.8 },
        0.2
      );
    }
  }, [level]);

  return (
    <div ref={boxRef} className="skill-box glass-card">
      <h4>{skill}</h4>
      <div className="skill-level">
        <div className="skill-level-bar" style={{ width: 0 }}></div>
      </div>
      <span className="skill-percentage">{level}%</span>
    </div>
  );
}

export default function Skills() {
  return (
    <section id="skills" className="skills-section page-enter">
      <SceneBackground fallback="shapes" />

      <div className="container">
        <h2 className="section-title">Technical Skills</h2>

        <div className="skills-grid">
          {skillsData.map((item, index) => (
            <SkillBox key={index} skill={item.skill} level={item.level} />
          ))}
        </div>

        <div className="skills-categories">
          <div className="category glass-card">
            <h4>Frontend</h4>
            <p>HTML, CSS, JavaScript, React, Responsive Design</p>
          </div>
          <div className="category glass-card">
            <h4>Tools</h4>
            <p>Git, GitHub, VS Code, Figma, DevTools</p>
          </div>
          <div className="category glass-card">
            <h4>Soft Skills</h4>
            <p>Problem Solving, Communication, Team Collaboration</p>
          </div>
        </div>
      </div>
    </section>
  );
}
