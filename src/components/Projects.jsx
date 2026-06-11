import { useState, useEffect, useRef } from 'react';
import { useProjects } from '../context/ProjectsContext';
import SceneBackground from './3d/SceneBackground';
import ProjectModal from './ProjectModal';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import '../styles/Projects.css';

gsap.registerPlugin(ScrollTrigger);

function ProjectCard({ project, onEdit, onDelete }) {
  const cardRef = useRef();

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: cardRef.current,
            start: 'top 85%',
          },
        }
      );
    }
  }, []);

  return (
    <div ref={cardRef} className="project-card glass-card">
      <div className="project-header">
        <h3>{project.title}</h3>
        <div className="project-actions">
          <button className="icon-btn edit-btn" onClick={() => onEdit(project)} title="Edit Project">
            ✏️
          </button>
          <button className="icon-btn delete-btn" onClick={() => onDelete(project.id)} title="Delete Project">
            🗑️
          </button>
        </div>
      </div>

      <p className="project-description">{project.description}</p>

      {project.features && project.features.length > 0 && (
        <ul className="project-features">
          {project.features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      )}

      <div className="project-tech">
        {project.tech && project.tech.map((t, index) => (
          <span key={index} className="tech-tag">
            {t}
          </span>
        ))}
      </div>

      <a href={project.link || '#'} className="project-link" target="_blank" rel="noopener noreferrer">
        View Project →
      </a>
    </div>
  );
}

export default function Projects() {
  const { projects, dispatch } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);

  const handleEdit = (project) => {
    setEditProject(project);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      dispatch({ type: 'DELETE_PROJECT', id });
    }
  };

  const handleSave = (project) => {
    if (project.id) {
      dispatch({ type: 'EDIT_PROJECT', payload: project });
    } else {
      dispatch({ type: 'ADD_PROJECT', payload: project });
    }
  };

  return (
    <section id="projects" className="projects-section page-enter">
      <SceneBackground fallback="shapes" />

      <div className="container">
        <div className="projects-section-header">
          <h2 className="section-title">Featured Projects</h2>
          <button 
            className="btn btn-primary add-project-fab"
            onClick={() => {
              setEditProject(null);
              setIsModalOpen(true);
            }}
          >
            ➕ Add Project
          </button>
        </div>

        <div className="projects-grid">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

        <div className="projects-cta">
          <p>Want to see more projects?</p>
          <a href="https://github.com/rahul333bala333-beep" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            Visit GitHub
          </a>
        </div>
      </div>

      <ProjectModal 
        key={isModalOpen ? `open-${editProject?.id || 'new'}` : 'closed'}
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        editProject={editProject} 
      />
    </section>
  );
}
