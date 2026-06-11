/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, useEffect } from 'react';

const defaultProjects = [
  {
    id: '1',
    title: 'Vendor Ledger Management',
    description: 'A responsive financial management system for tracking vendor transactions and balances.',
    tech: ['HTML5', 'CSS3', 'JavaScript'],
    link: '#',
    features: [
      'Responsive design with cross-browser compatibility',
      'Data visualization screens',
      'Optimized navigation layouts',
      'Reusable code patterns',
    ],
  },
  {
    id: '2',
    title: 'Security Operations Checklist',
    description: 'Comprehensive cybersecurity checklist for organizational security awareness and compliance.',
    tech: ['Cybersecurity', 'Risk Assessment', 'Documentation'],
    link: '#',
    features: [
      'Risk assessment framework',
      'Incident response guidelines',
      'Compliance standards',
      'Security best practices',
    ],
  },
  {
    id: '3',
    title: 'Portfolio Website',
    description: 'Interactive 3D animated portfolio showcasing skills and projects with modern design.',
    tech: ['React', 'Three.js', 'GSAP', 'CSS3'],
    link: '#',
    features: [
      '3D animations and interactions',
      'Smooth scroll effects',
      'Responsive design',
      'Modern UI/UX principles',
    ],
  },
];

const STORAGE_KEY = 'portfolio_projects';

function loadProjects() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return defaultProjects;
}

function projectsReducer(state, action) {
  switch (action.type) {
    case 'ADD_PROJECT':
      return [...state, { ...action.payload, id: Date.now().toString() }];
    case 'EDIT_PROJECT':
      return state.map((p) => (p.id === action.payload.id ? { ...p, ...action.payload } : p));
    case 'DELETE_PROJECT':
      return state.filter((p) => p.id !== action.id);
    case 'RESET':
      return [...defaultProjects];
    default:
      return state;
  }
}

const ProjectsContext = createContext(null);

export function ProjectsProvider({ children }) {
  const [projects, dispatch] = useReducer(projectsReducer, null, loadProjects);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  return (
    <ProjectsContext.Provider value={{ projects, dispatch }}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error('useProjects must be used within ProjectsProvider');
  return ctx;
}
