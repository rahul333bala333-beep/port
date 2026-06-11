import { useEffect } from 'react';
import SceneBackground from './3d/SceneBackground';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import '../styles/Experience.css';

gsap.registerPlugin(ScrollTrigger);

export default function Experience() {
  useEffect(() => {
    const timeline = document.querySelectorAll('.timeline-item');
    timeline.forEach((item, index) => {
      gsap.fromTo(
        item,
        { opacity: 0, x: index % 2 === 0 ? -50 : 50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          delay: index * 0.2,
          scrollTrigger: {
            trigger: item,
            start: 'top 80%',
          },
        }
      );
    });
  }, []);

  return (
    <section id="experience" className="experience-section page-enter">
      <SceneBackground fallback="orb" />

      <div className="container">
        <h2 className="section-title">Experience</h2>

        <div className="timeline">
          <div className="timeline-item left">
            <div className="timeline-content glass-card">
              <h3>Full Stack Development Intern</h3>
              <p className="company">Aathesh Soft Infotech Pvt Ltd</p>
              <p className="date">Nov 2025 - Dec 2025</p>
              <ul className="responsibilities">
                <li>Engineered responsive, cross-browser compatible frontend web interfaces</li>
                <li>Applied modern UI/UX design principles in software development workflows</li>
                <li>Utilized Git and GitHub for version control and deployment management</li>
                <li>Collaborated with senior developers to deliver production-ready web components</li>
              </ul>
            </div>
          </div>

          <div className="timeline-center-line"></div>

          <div className="timeline-item right">
            <div className="timeline-content glass-card">
              <h3>Vendor Ledger Management System</h3>
              <p className="project-type">Frontend Development Project</p>
              <p className="date">Nov 2025</p>
              <ul className="responsibilities">
                <li>Architected responsive frontend interface using HTML5, CSS3, and JavaScript</li>
                <li>Optimized data tracking visualization screens and navigation layouts</li>
                <li>Implemented reusable code patterns for scalability and maintenance</li>
              </ul>
            </div>
          </div>

          <div className="timeline-item left">
            <div className="timeline-content glass-card">
              <h3>Security Operations Checklist</h3>
              <p className="project-type">Cybersecurity Project</p>
              <p className="date">Dec 2025</p>
              <ul className="responsibilities">
                <li>Created comprehensive cybersecurity checklist for organizational awareness</li>
                <li>Included risk assessment and incident response preparation guidelines</li>
                <li>Improved understanding of security operations workflow</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="certifications">
          <h3>Certifications</h3>
          <div className="cert-grid">
            <div className="cert-item glass-card">
              <span className="cert-badge">✓</span>
              <h4>Full Stack Development</h4>
              <p>Novitech - Nov 2025</p>
            </div>
            <div className="cert-item glass-card">
              <span className="cert-badge">✓</span>
              <h4>Cybersecurity Training</h4>
              <p>YM Cybersecurity - Dec 2025</p>
            </div>
            <div className="cert-item glass-card">
              <span className="cert-badge">✓</span>
              <h4>Cloud Computing Fundamentals</h4>
              <p>NPTEL - Aug 2025</p>
            </div>
            <div className="cert-item glass-card">
              <span className="cert-badge">✓</span>
              <h4>Introduction to IoT</h4>
              <p>NPTEL - Aug 2025</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
