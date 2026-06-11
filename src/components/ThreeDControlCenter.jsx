import { useState } from 'react';
import { useProfile } from '../context/ProfileContext';
import '../styles/ThreeDControlCenter.css';

export default function ThreeDControlCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { profile, dispatch } = useProfile();

  const handleUpdate = (field, value) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  };

  const presets = [
    { name: 'Cyberpunk', primary: '#915EFF', secondary: '#00CEF5' },
    { name: 'Sunset Glow', primary: '#FF5E62', secondary: '#FF9966' },
    { name: 'Emerald', primary: '#10B981', secondary: '#059669' },
    { name: 'Sakura Pink', primary: '#EC4899', secondary: '#F43F5E' },
    { name: 'Ocean Breeze', primary: '#00C9FF', secondary: '#92FE9D' },
  ];

  const geometries = [
    { id: 'icosahedron', label: 'Icosahedron' },
    { id: 'torusKnot', label: 'Torus Knot' },
    { id: 'sphere', label: 'Sphere' },
    { id: 'cube', label: 'Cube' },
    { id: 'torus', label: 'Ring' },
  ];

  const backgrounds = [
    { id: 'default', label: 'Page Default' },
    { id: 'particles', label: 'Particles Field' },
    { id: 'shapes', label: 'Floating Shapes' },
    { id: 'orb', label: 'Glowing Orb' },
    { id: 'none', label: 'Black Space' },
  ];

  return (
    <div className={`control-center-wrapper ${isOpen ? 'open' : ''}`}>
      {/* Floating Toggle Button */}
      <button 
        className="control-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle 3D Settings"
        title="3D Configurator"
      >
        <span className="control-icon">{isOpen ? '✕' : '⚙️'}</span>
      </button>

      {/* Slide-out Panel */}
      <div className="control-panel glass-card">
        <div className="control-panel-header">
          <h3>
            <span className="panel-header-icon">🎮</span>
            3D Control Center
          </h3>
        </div>

        <div className="control-panel-body">
          {/* Geometries section */}
          <div className="control-group">
            <span className="group-label">Hero Shape</span>
            <div className="shape-selector">
              {geometries.map((geo) => (
                <button
                  key={geo.id}
                  className={`shape-btn ${profile.heroGeometry === geo.id ? 'active' : ''}`}
                  onClick={() => handleUpdate('heroGeometry', geo.id)}
                >
                  {geo.label}
                </button>
              ))}
            </div>
          </div>

          {/* Wireframe toggle */}
          <div className="control-group flex-row">
            <label htmlFor="wireframe-toggle" className="group-label">Wireframe Mode</label>
            <label className="switch">
              <input
                id="wireframe-toggle"
                type="checkbox"
                checked={!!profile.wireframe}
                onChange={(e) => handleUpdate('wireframe', e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
          </div>

          {/* Background Selection */}
          <div className="control-group">
            <span className="group-label">Background Style</span>
            <div className="bg-selector">
              {backgrounds.map((bg) => (
                <button
                  key={bg.id}
                  className={`bg-btn ${profile.backgroundType === bg.id ? 'active' : ''}`}
                  onClick={() => handleUpdate('backgroundType', bg.id)}
                >
                  {bg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Speed slider */}
          <div className="control-group">
            <div className="slider-label-row">
              <label htmlFor="speed-slider" className="group-label">Animation Speed</label>
              <span className="slider-val">{(profile.speedMultiplier || 1.0).toFixed(1)}x</span>
            </div>
            <input
              id="speed-slider"
              type="range"
              min="0.2"
              max="3.0"
              step="0.1"
              value={profile.speedMultiplier || 1.0}
              onChange={(e) => handleUpdate('speedMultiplier', parseFloat(e.target.value))}
              className="range-slider"
            />
          </div>

          {/* Color Presets */}
          <div className="control-group">
            <span className="group-label">Theme Accent Presets</span>
            <div className="preset-colors">
              {presets.map((p) => (
                <button
                  key={p.name}
                  className={`preset-btn ${profile.themeColor === p.primary && profile.themeSecondaryColor === p.secondary ? 'active' : ''}`}
                  style={{
                    background: `linear-gradient(135deg, ${p.primary}, ${p.secondary})`
                  }}
                  title={p.name}
                  aria-label={p.name}
                  onClick={() => {
                    handleUpdate('themeColor', p.primary);
                    handleUpdate('themeSecondaryColor', p.secondary);
                  }}
                />
              ))}
            </div>
          </div>

          {/* Custom Color Pickers */}
          <div className="control-group custom-color-group">
            <span className="group-label">Custom Palette</span>
            <div className="color-pickers">
              <div className="color-picker-item">
                <label htmlFor="primary-color-picker">Primary</label>
                <input
                  id="primary-color-picker"
                  type="color"
                  value={profile.themeColor || '#915EFF'}
                  onChange={(e) => handleUpdate('themeColor', e.target.value)}
                />
              </div>
              <div className="color-picker-item">
                <label htmlFor="secondary-color-picker">Secondary</label>
                <input
                  id="secondary-color-picker"
                  type="color"
                  value={profile.themeSecondaryColor || '#00CEF5'}
                  onChange={(e) => handleUpdate('themeSecondaryColor', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
