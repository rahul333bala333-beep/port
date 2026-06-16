import { useEffect, useRef, useState } from 'react';
import SceneBackground from './3d/SceneBackground';
import { useProfile } from '../context/ProfileContext';
import {
  fetchCertificates,
  migrateCertsFromLocalStorage,
  CERT_CATEGORIES,
  DEFAULT_CATEGORY,
} from '../services/certificateService';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import '../styles/Experience.css';

gsap.registerPlugin(ScrollTrigger);

// One labeled, horizontally-scrollable carousel for a single certificate category.
function CertCategoryCarousel({ category, certs, onCardClick }) {
  const carouselRef = useRef(null);

  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 340; // card width + gap
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="cert-category">
      <h4 className="cert-category-title">
        <span className="cert-category-icon">{category.icon}</span>
        {category.label}
      </h4>

      <div className="carousel-wrapper">
        <button className="carousel-arrow left" onClick={() => scroll('left')} aria-label="Scroll left">
          ⟨
        </button>

        <div className="cert-carousel" ref={carouselRef}>
          {certs.map((cert) => (
            <div key={cert.id} className="cert-card" onClick={() => onCardClick(cert)}>
              <div className="cert-image-container">
                {cert.image ? (
                  <img src={cert.image} alt={cert.title} className="cert-image" />
                ) : (
                  <div className="cert-placeholder">
                    <svg viewBox="0 0 24 24" className="cert-placeholder-icon">
                      <path fill="currentColor" d="M12 3L1 9l11 6l9-4.91V17h2V9L12 3zm0 2.22L18.93 9L12 12.78L5.07 9L12 5.22zM12 14.5c-3.07 0-5.5-2.02-5.5-4.5H4.5c0 3.58 3.36 6.5 7.5 6.5s7.5-2.92 7.5-6.5h-2c0 2.48-2.43 4.5-5.5 4.5z" />
                    </svg>
                    <span className="cert-placeholder-text">CERTIFICATE</span>
                  </div>
                )}
                <div className="cert-hover-overlay">
                  <span className="view-cert-btn">Preview</span>
                </div>
              </div>
              <div className="cert-info">
                <h4>{cert.title}</h4>
                {cert.certificateUrl && (
                  <a
                    href={cert.certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cert-card-visit-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Visit Certificate ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <button className="carousel-arrow right" onClick={() => scroll('right')} aria-label="Scroll right">
          ⟩
        </button>
      </div>
    </div>
  );
}

export default function Experience() {
  const { profile } = useProfile();
  const [selectedCert, setSelectedCert] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeline = document.querySelectorAll('.timeline-item');
    timeline.forEach((item, index) => {
      gsap.fromTo(
        item,
        { opacity: 0, x: index % 2 === 0 ? -50 : 50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          delay: index * 0.2,
          scrollTrigger: {
            trigger: item,
            start: 'top 80%',
          },
        }
      );
    });
  }, []);

  // Sync / Migrate & Fetch Certificates from Firebase
  useEffect(() => {
    let active = true;
    
    async function initCertificates() {
      const localCerts = profile.certificates || [];
      
      // Create a 3.5-second timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Firebase connection timeout (3.5s limit reached)')), 3500)
      );

      try {
        // Race the database operations against the timeout
        await Promise.race([
          (async () => {
            // Run migration from localStorage if any exists
            if (localCerts.length > 0) {
              await migrateCertsFromLocalStorage(localCerts);
            }
            
            // Fetch fresh list from Firestore
            const data = await fetchCertificates();
            if (active) {
              if (data && data.length > 0) {
                setCertificates(data);
              } else {
                setCertificates(localCerts);
              }
              setLoading(false);
            }
          })(),
          timeoutPromise
        ]);
      } catch (error) {
        console.warn('Error or timeout initializing certificates from Firebase. Falling back to local storage:', error);
        if (active) {
          setCertificates(localCerts);
          setLoading(false);
        }
      }
    }

    initCertificates();
    
    return () => {
      active = false;
    };
  }, [profile.certificates]);

  const handleCardClick = (cert) => {
    setSelectedCert(cert);
  };

  // Group certificates into their categories, preserving the configured order.
  const groupedCerts = CERT_CATEGORIES.map((category) => ({
    category,
    items: certificates.filter(
      (cert) => (cert.category || DEFAULT_CATEGORY) === category.id
    ),
  })).filter((group) => group.items.length > 0);


  return (
    <section id="experience" className="experience-section page-enter">
      <SceneBackground fallback="orb" />

      <div className="container">
        <h2 className="section-title">Experience</h2>

        <div className="timeline">
          <div className="timeline-item left">
            <div className="timeline-content glass-card">
              <h3>Full Stack Development Intern</h3>
              <p className="company">Aathesh Soft Infotech Pvt Ltd</p>
              <p className="date">Nov 2025 - Dec 2025</p>
              <ul className="responsibilities">
                <li>Engineered responsive, cross-browser compatible frontend web interfaces</li>
                <li>Applied modern UI/UX design principles in software development workflows</li>
                <li>Utilized Git and GitHub for version control and deployment management</li>
                <li>Collaborated with senior developers to deliver production-ready web components</li>
              </ul>
            </div>
          </div>

          <div className="timeline-center-line"></div>

          <div className="timeline-item right">
            <div className="timeline-content glass-card">
              <h3>Vendor Ledger Management System</h3>
              <p className="project-type">Frontend Development Project</p>
              <p className="date">Nov 2025</p>
              <ul className="responsibilities">
                <li>Architected responsive frontend interface using HTML5, CSS3, and JavaScript</li>
                <li>Optimized data tracking visualization screens and navigation layouts</li>
                <li>Implemented reusable code patterns for scalability and maintenance</li>
              </ul>
            </div>
          </div>

          <div className="timeline-item left">
            <div className="timeline-content glass-card">
              <h3>Security Operations Checklist</h3>
              <p className="project-type">Cybersecurity Project</p>
              <p className="date">Dec 2025</p>
              <ul className="responsibilities">
                <li>Created comprehensive cybersecurity checklist for organizational awareness</li>
                <li>Included risk assessment and incident response preparation guidelines</li>
                <li>Improved understanding of security operations workflow</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="certifications">
          <h3>Certifications</h3>
          <p className="section-subtitle">My Completed Certifications</p>

          {loading ? (
            <div className="cert-loading-container">
              <div className="cert-spinner"></div>
              <p>Syncing cloud credentials...</p>
            </div>
          ) : groupedCerts.length > 0 ? (
            groupedCerts.map(({ category, items }) => (
              <CertCategoryCarousel
                key={category.id}
                category={category}
                certs={items}
                onCardClick={handleCardClick}
              />
            ))
          ) : (
            <div className="cert-empty-container">
              <p>No certificates available.</p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedCert && (
        <div className="cert-lightbox" onClick={() => setSelectedCert(null)}>
          <div className="cert-lightbox-content glass-card" onClick={(e) => e.stopPropagation()}>
            <button 
              className="cert-lightbox-close" 
              onClick={() => setSelectedCert(null)}
              aria-label="Close Lightbox"
            >
              ✕
            </button>
            <div className="cert-lightbox-body">
              {selectedCert.image ? (
                <img src={selectedCert.image} alt={selectedCert.title} className="cert-lightbox-img" />
              ) : (
                <div className="cert-lightbox-placeholder">
                  <svg viewBox="0 0 24 24" className="cert-lightbox-placeholder-icon">
                    <path fill="currentColor" d="M12 3L1 9l11 6l9-4.91V17h2V9L12 3zm0 2.22L18.93 9L12 12.78L5.07 9L12 5.22zM12 14.5c-3.07 0-5.5-2.02-5.5-4.5H4.5c0 3.58 3.36 6.5 7.5 6.5s7.5-2.92 7.5-6.5h-2c0 2.48-2.43 4.5-5.5 4.5z"/>
                  </svg>
                  <p>No preview image uploaded</p>
                </div>
              )}
            </div>
            <div className="cert-lightbox-footer">
              <div className="cert-lightbox-text">
                <h3>{selectedCert.title}</h3>
                <p>{selectedCert.issuer} • {selectedCert.date}</p>
              </div>
              {selectedCert.certificateUrl && (
                <a 
                  href={selectedCert.certificateUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-primary cert-view-link"
                >
                  📄 View Full Certificate / File
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
