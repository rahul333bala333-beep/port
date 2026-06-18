import { useState, useEffect } from 'react';
import { useProfile } from '../context/ProfileContext';
import '../styles/Navigation.css';

const navLinks = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
];

export default function Navigation({ onOpenEditor, canEdit }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [active, setActive] = useState('home');
  const { profile } = useProfile();

  // Scroll-spy: highlight the nav link for the section currently in view.
  useEffect(() => {
    const sections = navLinks
      .map((l) => document.getElementById(l.id))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const handleNav = (e, id) => {
    e.preventDefault();
    setIsMenuOpen(false);
    setActive(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const getInitials = (name) => {
    if (!name) return 'BR';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <a href="#home" className="nav-logo" onClick={(e) => handleNav(e, 'home')}>
          <span className="logo-text">{getInitials(profile?.name)}</span>
        </a>

        <div className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          {navLinks.map((link) => (
            <li key={link.id} className="nav-item">
              <a
                href={`#${link.id}`}
                className={`nav-link ${active === link.id ? 'active' : ''}`}
                onClick={(e) => handleNav(e, link.id)}
              >
                {link.label}
              </a>
            </li>
          ))}
          {canEdit && (
            <li className="nav-item nav-action-item">
              <button
                className="profile-toggle-btn"
                onClick={() => {
                  onOpenEditor();
                  setIsMenuOpen(false);
                }}
                title="Edit Profile"
              >
                {profile?.photoUrl ? (
                  <img src={profile.photoUrl} alt={profile.name} className="nav-avatar" />
                ) : (
                  <div className="nav-avatar-fallback">
                    <span>👤</span>
                  </div>
                )}
                <span className="profile-toggle-text">Edit Profile</span>
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
