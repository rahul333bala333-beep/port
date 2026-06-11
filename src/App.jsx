import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Navigation from './components/Navigation';
import ProfileEditor from './components/ProfileEditor';
import ThreeDControlCenter from './components/ThreeDControlCenter';
import PageTransition from './components/PageTransition';
import { useProfile } from './context/ProfileContext';

function hexToRgb(hex) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '145, 94, 255';
}

function App() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const { profile } = useProfile();
  const location = useLocation();

  useEffect(() => {
    if (profile) {
      const primaryHex = profile.themeColor || '#915EFF';
      const secondaryHex = profile.themeSecondaryColor || '#00CEF5';
      const rgb = hexToRgb(primaryHex);

      document.documentElement.style.setProperty('--accent-primary', primaryHex);
      document.documentElement.style.setProperty('--accent-secondary', secondaryHex);
      document.documentElement.style.setProperty('--border-glass', `rgba(${rgb}, 0.15)`);
      document.documentElement.style.setProperty('--border-glow', `rgba(${rgb}, 0.4)`);
      document.documentElement.style.setProperty('--shadow-glow', `0 0 30px rgba(${rgb}, 0.15)`);
      document.documentElement.style.setProperty('--gradient-primary', `linear-gradient(135deg, ${primaryHex}, ${secondaryHex})`);
    }
  }, [profile?.themeColor, profile?.themeSecondaryColor]);

  return (
    <div className="app">
      <Navigation onOpenEditor={() => setIsEditorOpen(true)} />
      
      <main className="page-content">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Hero /></PageTransition>} />
          <Route path="/about" element={<PageTransition><About /></PageTransition>} />
          <Route path="/skills" element={<PageTransition><Skills /></PageTransition>} />
          <Route path="/experience" element={<PageTransition><Experience /></PageTransition>} />
          <Route path="/projects" element={<PageTransition><Projects /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        </Routes>
      </main>

      <ProfileEditor 
        key={isEditorOpen ? 'open' : 'closed'} 
        isOpen={isEditorOpen} 
        onClose={() => setIsEditorOpen(false)} 
      />

      <ThreeDControlCenter />
    </div>
  );
}

export default App;
