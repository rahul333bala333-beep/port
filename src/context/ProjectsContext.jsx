/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import {
  fetchProjects,
  addProject as addProjectRemote,
  updateProject as updateProjectRemote,
  deleteProject as deleteProjectRemote,
  migrateProjectsFromLocalStorage,
} from '../services/projectService';

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

// localStorage is used only as an offline cache / fallback. The source of
// truth is now Firebase Firestore so the project list is the same for
// everyone, on every device.
function loadLocalProjects() {
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
    case 'SET_PROJECTS':
      return action.payload;
    case 'ADD_PROJECT':
      return [...state, action.payload];
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
  const [projects, rawDispatch] = useReducer(projectsReducer, null, loadLocalProjects);

  // On mount: push any local-only projects to the cloud once, then load the
  // authoritative list from Firestore. Falls back to local cache on timeout.
  useEffect(() => {
    let active = true;

    async function init() {
      const localProjects = loadLocalProjects();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firebase connection timeout (4s limit reached)')), 4000)
      );

      try {
        await Promise.race([
          (async () => {
            if (localProjects.length > 0) {
              await migrateProjectsFromLocalStorage(localProjects);
            }
            const data = await fetchProjects();
            if (active && data && data.length > 0) {
              rawDispatch({ type: 'SET_PROJECTS', payload: data });
            }
          })(),
          timeoutPromise,
        ]);
      } catch (error) {
        console.warn('Error or timeout loading projects from Firebase. Using local cache:', error);
      }
    }

    init();

    return () => {
      active = false;
    };
  }, []);

  // Keep a local cache in sync so the page shows something instantly on reload.
  useEffect(() => {
    if (projects) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    }
  }, [projects]);

  // Custom dispatch: updates the UI optimistically AND persists to Firestore.
  const dispatch = useCallback(async (action) => {
    switch (action.type) {
      case 'ADD_PROJECT': {
        const newProject = { ...action.payload, id: action.payload.id || Date.now().toString() };
        rawDispatch({ type: 'ADD_PROJECT', payload: newProject });
        try {
          const saved = await addProjectRemote(newProject);
          rawDispatch({ type: 'EDIT_PROJECT', payload: saved });
        } catch (error) {
          console.error('Failed to save new project to the cloud:', error);
        }
        break;
      }
      case 'EDIT_PROJECT': {
        rawDispatch({ type: 'EDIT_PROJECT', payload: action.payload });
        try {
          await updateProjectRemote(action.payload);
        } catch (error) {
          console.error('Failed to update project in the cloud:', error);
        }
        break;
      }
      case 'DELETE_PROJECT': {
        rawDispatch({ type: 'DELETE_PROJECT', id: action.id });
        try {
          await deleteProjectRemote(action.id);
        } catch (error) {
          console.error('Failed to delete project from the cloud:', error);
        }
        break;
      }
      default:
        rawDispatch(action);
    }
  }, []);

  return (
    <ProjectsContext.Provider value={{ projects: projects || [], dispatch }}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error('useProjects must be used within ProjectsProvider');
  return ctx;
}
