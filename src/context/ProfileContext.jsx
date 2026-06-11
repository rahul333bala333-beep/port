/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, useEffect } from 'react';

const defaultProfile = {
  name: 'Bala Rahul',
  title: 'Full Stack Developer',
  subtitle: 'Full Stack Developer | UI/UX Designer | Cybersecurity Enthusiast',
  bio: 'Detail-oriented Computer Science and Engineering student specializing in Full Stack Web Development, UI/UX Design, and foundational Cybersecurity. Proven ability to build responsive web applications and implement secure coding workflows through hands-on internship experience. Adept at leveraging analytical problem-solving skills to engineer scalable, user-centric software solutions.',
  photoUrl: '',
  email: 'rahul333bala333@gmail.com',
  phone: '+91 8248063051',
  linkedin: 'https://linkedin.com/in/bala-rahul-l-004302368',
  linkedinLabel: 'Bala Rahul L',
  github: 'https://github.com/rahul333bala333-beep',
  githubLabel: 'rahul333bala333-beep',
  figma: 'https://figma.com/@lbala',
  figmaLabel: '@lbala',
  cgpa: '8.0/10',
  college: 'P.S.R. Engineering College',
  degree: 'B.E. Computer Science',
  degreeYears: '2023-2027',
  yearsLearning: '2+',
  projectsCompleted: '5+',
  certifications: '3',
  themeColor: '#915EFF',
  themeSecondaryColor: '#00CEF5',
  heroGeometry: 'icosahedron',
  wireframe: true,
  backgroundType: 'default',
  speedMultiplier: 1.0,
};

const STORAGE_KEY = 'portfolio_profile';

function loadProfile() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...defaultProfile, ...JSON.parse(saved) };
    }
  } catch {
    // ignore
  }
  return defaultProfile;
}

function profileReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'UPDATE_ALL':
      return { ...state, ...action.payload };
    case 'RESET':
      return { ...defaultProfile };
    default:
      return state;
  }
}

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, dispatch] = useReducer(profileReducer, null, loadProfile);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  return (
    <ProfileContext.Provider value={{ profile, dispatch, defaultProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
