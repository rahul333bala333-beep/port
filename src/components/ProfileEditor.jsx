import { useState, useEffect } from 'react';
import { useProfile } from '../context/ProfileContext';
import '../styles/ProfileEditor.css';

export default function ProfileEditor({ isOpen, onClose }) {
  const { profile, dispatch, defaultProfile } = useProfile();
  const [formData, setFormData] = useState({ ...profile });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    dispatch({ type: 'UPDATE_ALL', payload: formData });
    onClose();
  };

  const handleReset = () => {
    dispatch({ type: 'RESET' });
    setFormData({ ...defaultProfile });
  };

  if (!isOpen) return null;

  const fields = [
    { key: 'name', label: 'Full Name', type: 'text' },
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'subtitle', label: 'Subtitle', type: 'text' },
    { key: 'bio', label: 'Bio', type: 'textarea' },
    { key: 'photoUrl', label: 'Photo URL', type: 'text', placeholder: 'https://...' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone', label: 'Phone', type: 'tel' },
    { key: 'linkedin', label: 'LinkedIn URL', type: 'url' },
    { key: 'linkedinLabel', label: 'LinkedIn Display Name', type: 'text' },
    { key: 'github', label: 'GitHub URL', type: 'url' },
    { key: 'githubLabel', label: 'GitHub Display Name', type: 'text' },
    { key: 'figma', label: 'Figma URL', type: 'url' },
    { key: 'figmaLabel', label: 'Figma Display Name', type: 'text' },
    { key: 'cgpa', label: 'CGPA', type: 'text' },
    { key: 'college', label: 'College', type: 'text' },
    { key: 'degree', label: 'Degree', type: 'text' },
    { key: 'degreeYears', label: 'Degree Years', type: 'text' },
    { key: 'yearsLearning', label: 'Years Learning', type: 'text' },
    { key: 'projectsCompleted', label: 'Projects Completed', type: 'text' },
    { key: 'certifications', label: 'Certifications Count', type: 'text' },
  ];

  return (
    <>
      <div className="editor-overlay" onClick={onClose} />
      <div className={`profile-editor ${isOpen ? 'open' : ''}`}>
        <div className="editor-header">
          <h3>
            <span className="editor-icon">✏️</span>
            Edit Profile
          </h3>
          <button className="editor-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="editor-body">
          {fields.map(({ key, label, type, placeholder }) => (
            <div key={key} className="editor-field">
              <label htmlFor={`editor-${key}`}>{label}</label>
              {type === 'textarea' ? (
                <textarea
                  id={`editor-${key}`}
                  value={formData[key] || ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  rows={4}
                />
              ) : (
                <input
                  id={`editor-${key}`}
                  type={type}
                  value={formData[key] || ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={placeholder || ''}
                />
              )}
            </div>
          ))}
        </div>

        <div className="editor-footer">
          <button className="btn btn-secondary editor-reset" onClick={handleReset}>
            Reset Defaults
          </button>
          <button className="btn btn-primary editor-save" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}
