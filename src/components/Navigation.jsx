import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import '../styles/Navigation.css';

export default function Navigation({ onOpenEditor, canEdit }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { profile } = useProfile();

  const navLinks = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'about', label: 'About', path: '/about' },
    { id: 'skills', label: 'Skills', path: '/skills' },
    { id: 'experience', label: 'Experience', path: '/experience' },
    { id: 'projects', label: 'Projects', path: '/projects' },
    { id: 'contact', label: 'Contact', path: '/contact' },
  ];

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
        <NavLink to="/" className="nav-logo" onClick={() => setIsMenuOpen(false)}>
          <span className="logo-text">{getInitials(profile?.name)}</span>
        </NavLink>

        <div className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          {navLinks.map((link) => (
            <li key={link.id} className="nav-item">
              <NavLink
                to={link.path}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </NavLink>
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
