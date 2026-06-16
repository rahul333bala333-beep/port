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
import AIChatbot from './components/AIChatbot';
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

  const [canEdit, setCanEdit] = useState(() => {
    return localStorage.getItem('portfolio_edit_access') === 'true';
  });

  const handleUnlock = () => {
    const pin = prompt("Enter Admin Passcode to Unlock Editor:");
    if (pin === "rahul7925") {
      localStorage.setItem('portfolio_edit_access', 'true');
      setCanEdit(true);
      alert("Editor unlocked successfully! Click the avatar in the navbar or the floating configurator to edit your profile.");
    } else if (pin !== null) {
      alert("Incorrect passcode. Editing access denied.");
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('edit') === 'true' || params.get('admin') === 'true') {
      handleUnlock();
      
      // Clean query parameter from address bar
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [location]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        handleUnlock();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!profile) return;

    // Apply Fonts
    document.documentElement.style.setProperty('--font-heading', profile.fontHeading || "'Space Grotesk', sans-serif");
    document.documentElement.style.setProperty('--font-body', profile.fontBody || "'Inter', sans-serif");

    // Apply Colors / RGB Mode
    if (profile.rgbMode) {
      let frameId;
      const tick = () => {
        const time = Date.now() * 0.001 * (profile.speedMultiplier || 1.0);
        
        // Cycle colors smoothly through hue
        const r1 = Math.sin(time) * 127 + 128;
        const g1 = Math.sin(time + 2) * 127 + 128;
        const b1 = Math.sin(time + 4) * 127 + 128;
        
        const r2 = Math.sin(time + 3) * 127 + 128;
        const g2 = Math.sin(time + 5) * 127 + 128;
        const b2 = Math.sin(time + 7) * 127 + 128;

        const primaryHex = `#${Math.round(r1).toString(16).padStart(2, '0')}${Math.round(g1).toString(16).padStart(2, '0')}${Math.round(b1).toString(16).padStart(2, '0')}`;
        const secondaryHex = `#${Math.round(r2).toString(16).padStart(2, '0')}${Math.round(g2).toString(16).padStart(2, '0')}${Math.round(b2).toString(16).padStart(2, '0')}`;
        
        document.documentElement.style.setProperty('--accent-primary', primaryHex);
        document.documentElement.style.setProperty('--accent-secondary', secondaryHex);
        
        const rgb = `${Math.round(r1)}, ${Math.round(g1)}, ${Math.round(b1)}`;
        document.documentElement.style.setProperty('--border-glass', `rgba(${rgb}, 0.15)`);
        document.documentElement.style.setProperty('--border-glow', `rgba(${rgb}, 0.4)`);
        document.documentElement.style.setProperty('--shadow-glow', `0 0 30px rgba(${rgb}, 0.15)`);
        document.documentElement.style.setProperty('--gradient-primary', `linear-gradient(135deg, ${primaryHex}, ${secondaryHex})`);

        window.rgbPrimary = primaryHex;
        window.rgbSecondary = secondaryHex;

        frameId = requestAnimationFrame(tick);
      };
      
      tick();
      return () => cancelAnimationFrame(frameId);
    } else {
      // Normal static colors
      const primaryHex = profile.themeColor || '#915EFF';
      const secondaryHex = profile.themeSecondaryColor || '#00CEF5';
      const rgb = hexToRgb(primaryHex);

      document.documentElement.style.setProperty('--accent-primary', primaryHex);
      document.documentElement.style.setProperty('--accent-secondary', secondaryHex);
      document.documentElement.style.setProperty('--border-glass', `rgba(${rgb}, 0.15)`);
      document.documentElement.style.setProperty('--border-glow', `rgba(${rgb}, 0.4)`);
      document.documentElement.style.setProperty('--shadow-glow', `0 0 30px rgba(${rgb}, 0.15)`);
      document.documentElement.style.setProperty('--gradient-primary', `linear-gradient(135deg, ${primaryHex}, ${secondaryHex})`);
      
      window.rgbPrimary = null;
      window.rgbSecondary = null;
    }
  }, [
    profile?.themeColor,
    profile?.themeSecondaryColor,
    profile?.fontHeading,
    profile?.fontBody,
    profile?.rgbMode,
    profile?.speedMultiplier
  ]);

  return (
    <div className="app">
      <Navigation onOpenEditor={() => setIsEditorOpen(true)} canEdit={canEdit} />
      
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
        onLock={() => setCanEdit(false)}
      />

      <ThreeDControlCenter />

      <AIChatbot />
    </div>
  );
}

export default App;
