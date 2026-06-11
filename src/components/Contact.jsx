import { useEffect } from 'react';
import SceneBackground from './3d/SceneBackground';
import { useProfile } from '../context/ProfileContext';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import '../styles/Contact.css';

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const { profile } = useProfile();

  useEffect(() => {
    const contactSection = document.querySelector('.contact-section');
    if (contactSection) {
      gsap.fromTo(
        contactSection,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: contactSection,
            start: 'top 80%',
          },
        }
      );
    }
  }, [profile]);

  return (
    <section id="contact" className="contact-section page-enter">
      <SceneBackground fallback="orb" />

      <div className="container">
        <h2 className="section-title">Get In Touch</h2>

        <div className="contact-content">
          <div className="contact-info glass-card">
            <h3>Let's connect!</h3>
            <p>
              I'm always interested in hearing about new projects and opportunities. 
              Feel free to reach out through any of the channels below.
            </p>

            <div className="contact-methods">
              {profile.phone && (
                <div className="contact-method">
                  <h4>📱 Phone</h4>
                  <a href={`tel:${profile.phone.replace(/\s+/g, '')}`}>{profile.phone}</a>
                </div>
              )}

              {profile.email && (
                <div className="contact-method">
                  <h4>📧 Email</h4>
                  <a href={`mailto:${profile.email}`}>{profile.email}</a>
                </div>
              )}

              {profile.linkedin && (
                <div className="contact-method">
                  <h4>💼 LinkedIn</h4>
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                    {profile.linkedinLabel || 'LinkedIn Profile'}
                  </a>
                </div>
              )}

              {profile.github && (
                <div className="contact-method">
                  <h4>🐙 GitHub</h4>
                  <a href={profile.github} target="_blank" rel="noopener noreferrer">
                    {profile.githubLabel || 'GitHub Profile'}
                  </a>
                </div>
              )}

              {profile.figma && (
                <div className="contact-method">
                  <h4>🎨 Figma</h4>
                  <a href={profile.figma} target="_blank" rel="noopener noreferrer">
                    {profile.figmaLabel || 'Figma Profile'}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="contact-form-wrapper glass-card">
            <form className="contact-form" onSubmit={(e) => { e.preventDefault(); alert('Message sent successfully!'); }}>
              <div className="form-group">
                <input type="text" placeholder="Your Name" required />
              </div>

              <div className="form-group">
                <input type="email" placeholder="Your Email" required />
              </div>

              <div className="form-group">
                <textarea placeholder="Your Message" rows="5" required></textarea>
              </div>

              <button type="submit" className="btn btn-primary">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>

      <footer className="footer">
        <p>&copy; 2026 {profile.name}. All rights reserved.</p>
        <p>Crafted with ❤️ and 3D animations</p>
      </footer>
    </section>
  );
}
