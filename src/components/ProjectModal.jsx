import { useState, useEffect } from 'react';
import '../styles/ProjectModal.css';

export default function ProjectModal({ isOpen, onClose, onSave, editProject }) {
  const [formData, setFormData] = useState(() => {
    if (editProject) {
      return {
        title: editProject.title || '',
        description: editProject.description || '',
        techStr: (editProject.tech || []).join(', '),
        featuresStr: (editProject.features || []).join('\n'),
        link: editProject.link || '',
      };
    }
    return { title: '', description: '', techStr: '', featuresStr: '', link: '' };
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const project = {
      ...(editProject && { id: editProject.id }),
      title: formData.title.trim(),
      description: formData.description.trim(),
      tech: formData.techStr.split(',').map((t) => t.trim()).filter(Boolean),
      features: formData.featuresStr.split('\n').map((f) => f.trim()).filter(Boolean),
      link: formData.link.trim() || '#',
    };
    onSave(project);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="project-modal">
        <div className="modal-header">
          <h3>
            <span className="modal-icon">{editProject ? '✏️' : '➕'}</span>
            {editProject ? 'Edit Project' : 'Add New Project'}
          </h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="modal-field">
            <label htmlFor="proj-title">Project Title *</label>
            <input
              id="proj-title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              placeholder="My Awesome Project"
              required
            />
          </div>

          <div className="modal-field">
            <label htmlFor="proj-desc">Description *</label>
            <textarea
              id="proj-desc"
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              placeholder="What does this project do?"
              rows={3}
              required
            />
          </div>

          <div className="modal-field">
            <label htmlFor="proj-tech">Tech Stack <span className="field-hint">(comma-separated)</span></label>
            <input
              id="proj-tech"
              type="text"
              value={formData.techStr}
              onChange={(e) => setFormData((p) => ({ ...p, techStr: e.target.value }))}
              placeholder="React, Node.js, MongoDB"
            />
          </div>

          <div className="modal-field">
            <label htmlFor="proj-features">Features <span className="field-hint">(one per line)</span></label>
            <textarea
              id="proj-features"
              value={formData.featuresStr}
              onChange={(e) => setFormData((p) => ({ ...p, featuresStr: e.target.value }))}
              placeholder={"Responsive design\nUser authentication\nReal-time updates"}
              rows={4}
            />
          </div>

          <div className="modal-field">
            <label htmlFor="proj-link">Project Link</label>
            <input
              id="proj-link"
              type="text"
              value={formData.link}
              onChange={(e) => setFormData((p) => ({ ...p, link: e.target.value }))}
              placeholder="https://github.com/..."
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editProject ? 'Save Changes' : 'Add Project'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
