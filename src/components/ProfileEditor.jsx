import { useState, useEffect } from 'react';
import { useProfile } from '../context/ProfileContext';
import {
  fetchCertificates,
  addCertificate as addFirebaseCert,
  deleteCertificate as deleteFirebaseCert,
  updateCertificateCategory,
  CERT_CATEGORIES,
  DEFAULT_CATEGORY
} from '../services/certificateService';
import '../styles/ProfileEditor.css';

export default function ProfileEditor({ isOpen, onClose, onLock }) {
  const { profile, dispatch, defaultProfile } = useProfile();
  const [formData, setFormData] = useState({ ...profile });
  
  const [certs, setCerts] = useState([]);
  const [loadingCerts, setLoadingCerts] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      loadFirebaseCertificates();
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const loadFirebaseCertificates = async () => {
    setLoadingCerts(true);
    try {
      const data = await fetchCertificates();
      setCerts(data);
    } catch (error) {
      console.error('Error fetching certificates in editor:', error);
      setCerts(formData.certificates || []);
    } finally {
      setLoadingCerts(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image is too large. Please select an image smaller than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        handleChange('photoUrl', event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert("Resume file is too large. Please select a file smaller than 3MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        handleChange('resumeUrl', event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const [newCert, setNewCert] = useState({
    title: '',
    issuer: '',
    date: '',
    category: DEFAULT_CATEGORY,
    image: '',
    certificateUrl: ''
  });

  const handleNewCertChange = (field, value) => {
    setNewCert(prev => ({ ...prev, [field]: value }));
  };

  const handleNewCertImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 400 * 1024) {
        alert("Certificate image is too large! Since we are saving directly to the database, please select an image under 400KB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        handleNewCertChange('image', event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNewCertPdfUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 400 * 1024) {
        alert("Certificate file is too large! Please select a file under 400KB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        handleNewCertChange('certificateUrl', event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addCertificate = async () => {
    if (!newCert.title || !newCert.issuer || !newCert.date) {
      alert("Please fill in at least Title, Issuer, and Date.");
      return;
    }

    setIsUploading(true);
    try {
      const certificateItem = {
        id: `cert-${Date.now()}`,
        ...newCert
      };

      const added = await addFirebaseCert(certificateItem, null, null);

      setCerts(prev => [...prev, added]);

      // Update certificates count in profile context just to keep it in sync
      const newCount = String(certs.length + 1);
      handleChange('certifications', newCount);

      // Reset form
      setNewCert({
        title: '',
        issuer: '',
        date: '',
        category: DEFAULT_CATEGORY,
        image: '',
        certificateUrl: ''
      });

      // Reset file inputs
      const imgInput = document.getElementById('new-cert-img-upload');
      const fileInput = document.getElementById('new-cert-file-upload');
      if (imgInput) imgInput.value = '';
      if (fileInput) fileInput.value = '';

      alert("Certificate uploaded to cloud successfully!");
    } catch (error) {
      console.error("Failed to upload certificate:", error);
      alert(`Upload Failed: ${error.message}\n\nDid you enable Storage in Firebase and set the rules to 'if true'?`);
    } finally {
      setIsUploading(false);
    }
  };

  const removeCertificate = async (id, imageUrl, certificateUrl) => {
    if (!confirm("Are you sure you want to delete this certificate? This will remove it from the cloud database and delete any uploaded files.")) {
      return;
    }

    try {
      await deleteFirebaseCert(id, imageUrl, certificateUrl);

      const updated = certs.filter(c => c.id !== id);
      setCerts(updated);

      handleChange('certifications', String(updated.length));

      alert("Certificate deleted successfully.");
    } catch (error) {
      console.error("Failed to delete certificate:", error);
      alert("Failed to delete certificate from cloud database.");
    }
  };

  const handleCertCategoryChange = async (id, category) => {
    // Optimistic update so the dropdown responds instantly.
    setCerts((prev) => prev.map((c) => (c.id === id ? { ...c, category } : c)));
    try {
      await updateCertificateCategory(id, category);
    } catch (error) {
      console.error('Failed to update certificate category:', error);
      alert('Could not update the category in the cloud. Please try again.');
      loadFirebaseCertificates();
    }
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
          {/* Profile Photo Uploader */}
          <div className="editor-field profile-photo-section">
            <label>Profile Photo</label>
            <div className="photo-editor-container">
              <div className="photo-preview-wrapper">
                {formData.photoUrl ? (
                  <img src={formData.photoUrl} alt="Avatar Preview" className="photo-preview-img" />
                ) : (
                  <div className="photo-preview-fallback">👤</div>
                )}
              </div>
              
              <div className="photo-upload-actions">
                <label htmlFor="photo-file-upload" className="btn btn-secondary photo-upload-label">
                  📁 Choose File
                </label>
                <input 
                  id="photo-file-upload"
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                
                {formData.photoUrl && (
                  <button 
                    type="button" 
                    className="btn btn-secondary photo-remove-btn"
                    onClick={() => handleChange('photoUrl', '')}
                  >
                    ✕ Remove
                  </button>
                )}
                
                <span className="photo-size-limit-info">Max size: 2MB</span>
              </div>
            </div>

            <div className="photo-url-fallback">
              <span className="fallback-label">Or paste photo URL:</span>
              <input
                id="editor-photoUrl"
                type="text"
                value={formData.photoUrl || ''}
                onChange={(e) => handleChange('photoUrl', e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>

          {/* Resume Uploader */}
          <div className="editor-field profile-resume-section">
            <label>Resume File (PDF)</label>
            <div className="resume-editor-container">
              <div className={`resume-status-badge ${formData.resumeUrl ? 'uploaded' : ''}`}>
                {formData.resumeUrl ? (
                  formData.resumeUrl.startsWith('data:') 
                    ? '📄 Custom Resume PDF Uploaded' 
                    : '📄 Default Resume Active'
                ) : '❌ No Resume File'}
              </div>
              
              <div className="resume-upload-actions">
                <label htmlFor="resume-file-upload" className="btn btn-secondary resume-upload-label">
                  📁 Choose PDF
                </label>
                <input 
                  id="resume-file-upload"
                  type="file" 
                  accept=".pdf"
                  onChange={handleResumeChange}
                  style={{ display: 'none' }}
                />
                
                {formData.resumeUrl && (
                  <button 
                    type="button" 
                    className="btn btn-secondary resume-remove-btn"
                    onClick={() => handleChange('resumeUrl', '')}
                  >
                    ✕ Remove
                  </button>
                )}
                <span className="resume-size-limit-info">Max size: 3MB</span>
              </div>
            </div>
          </div>

          {/* Certifications Management */}
          <div className="editor-section-divider">Certifications</div>
          
          <div className="editor-field profile-certs-section">
            <label>Manage Certificates ({ certs.length })</label>
            <div className="certs-list">
              {loadingCerts ? (
                <div className="editor-certs-loading">
                  <div className="editor-certs-spinner"></div>
                  <span>Syncing database...</span>
                </div>
              ) : certs.map((cert) => (
                <div key={cert.id} className="cert-list-item">
                  <div className="cert-list-thumb">
                    {cert.image ? (
                      <img src={cert.image} alt="" />
                    ) : (
                      <div className="cert-list-thumb-placeholder">📄</div>
                    )}
                  </div>
                  <div className="cert-list-info">
                    <h4>{cert.title}</h4>
                    <p>{cert.issuer} • {cert.date}</p>
                    <select
                      className="cert-list-category-select"
                      value={cert.category || DEFAULT_CATEGORY}
                      onChange={(e) => handleCertCategoryChange(cert.id, e.target.value)}
                      disabled={isUploading}
                      title="Change category"
                    >
                      {CERT_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button 
                    type="button" 
                    className="cert-delete-btn" 
                    onClick={() => removeCertificate(cert.id, cert.image, cert.certificateUrl)}
                    title="Delete Certificate"
                    disabled={isUploading}
                  >
                    🗑️
                  </button>
                </div>
              ))}
              {!loadingCerts && certs.length === 0 && (
                <div className="no-certs-info">No certifications added yet.</div>
              )}
            </div>

            <div className="add-cert-form glass-card">
              <h5>Add New Certificate</h5>
              
              <div className="add-cert-row">
                <div className="add-cert-col">
                  <label htmlFor="new-cert-title">Title *</label>
                  <input
                    id="new-cert-title"
                    type="text"
                    value={newCert.title}
                    onChange={(e) => handleNewCertChange('title', e.target.value)}
                    placeholder="e.g. Full Stack Development"
                    disabled={isUploading}
                  />
                </div>
                <div className="add-cert-col">
                  <label htmlFor="new-cert-category">Category *</label>
                  <select
                    id="new-cert-category"
                    value={newCert.category}
                    onChange={(e) => handleNewCertChange('category', e.target.value)}
                    disabled={isUploading}
                  >
                    {CERT_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="add-cert-row">
                <div className="add-cert-col">
                  <label htmlFor="new-cert-issuer">Issuer *</label>
                  <input 
                    id="new-cert-issuer"
                    type="text" 
                    value={newCert.issuer} 
                    onChange={(e) => handleNewCertChange('issuer', e.target.value)}
                    placeholder="e.g. Novitech"
                    disabled={isUploading}
                  />
                </div>
                <div className="add-cert-col">
                  <label htmlFor="new-cert-date">Date *</label>
                  <input 
                    id="new-cert-date"
                    type="text" 
                    value={newCert.date} 
                    onChange={(e) => handleNewCertChange('date', e.target.value)}
                    placeholder="e.g. Nov 2025"
                    disabled={isUploading}
                  />
                </div>
              </div>

              <div className="add-cert-row file-upload-row">
                <div className="add-cert-col">
                  <label>Thumbnail Image</label>
                  <div className="file-uploader-widget">
                    {newCert.image ? (
                      <div className="widget-preview">
                        <img src={newCert.image} alt="Thumbnail preview" />
                        <button type="button" onClick={() => handleNewCertChange('image', '')} className="widget-clear" disabled={isUploading}>✕</button>
                      </div>
                    ) : (
                      <div className="file-uploader-controls">
                        <label htmlFor="new-cert-img-upload" className={`btn btn-secondary file-widget-label ${isUploading ? 'disabled' : ''}`}>
                          📁 Choose Image
                        </label>
                        <input 
                          id="new-cert-img-upload"
                          type="file" 
                          accept="image/*"
                          onChange={handleNewCertImageUpload}
                          style={{ display: 'none' }}
                          disabled={isUploading}
                        />
                        <span className="file-info-text">Max: 400KB</span>
                      </div>
                    )}
                  </div>
                  <div className="fallback-input-url">
                    <span>Or paste Image URL:</span>
                    <input 
                      type="text" 
                      value={newCert.image} 
                      onChange={(e) => handleNewCertChange('image', e.target.value)}
                      placeholder="https://example.com/cert.jpg"
                      disabled={isUploading}
                    />
                  </div>
                </div>

                <div className="add-cert-col">
                  <label>Certificate File / PDF</label>
                  <div className="file-uploader-widget">
                    {newCert.certificateUrl ? (
                      <div className="widget-preview text-preview">
                        <span className="pdf-icon">📄</span>
                        <span className="pdf-name">File Selected</span>
                        <button type="button" onClick={() => handleNewCertChange('certificateUrl', '')} className="widget-clear" disabled={isUploading}>✕</button>
                      </div>
                    ) : (
                      <div className="file-uploader-controls">
                        <label htmlFor="new-cert-file-upload" className={`btn btn-secondary file-widget-label ${isUploading ? 'disabled' : ''}`}>
                          📁 Choose PDF/Image
                        </label>
                        <input 
                          id="new-cert-file-upload"
                          type="file" 
                          accept=".pdf,image/*"
                          onChange={handleNewCertPdfUpload}
                          style={{ display: 'none' }}
                          disabled={isUploading}
                        />
                        <span className="file-info-text">Max: 400KB</span>
                      </div>
                    )}
                  </div>
                  <div className="fallback-input-url">
                    <span>Or paste URL:</span>
                    <input 
                      type="text" 
                      value={newCert.certificateUrl} 
                      onChange={(e) => handleNewCertChange('certificateUrl', e.target.value)}
                      placeholder="https://example.com/my-cert-file.pdf"
                      disabled={isUploading}
                    />
                  </div>
                </div>
              </div>

              <button 
                type="button" 
                className="btn btn-primary btn-add-cert"
                onClick={addCertificate}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading to cloud...' : '＋ Add Certificate to List'}
              </button>
            </div>
          </div>

          <div className="editor-section-divider">Profile Details</div>

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
          <button className="btn btn-secondary editor-lock" onClick={() => {
            if (confirm("Lock editing access on this browser? You will need to visit the secret URL (?edit=true or ?admin=true) to unlock it again.")) {
              localStorage.removeItem('portfolio_edit_access');
              if (onLock) onLock();
              onClose();
            }
          }} title="Lock editing access">
            🔒 Lock Editor
          </button>
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
