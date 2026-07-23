import React from 'react';

export default function Gallery() {
  const images = [
    "https://images.unsplash.com/photo-1561501900-3701fa6a0864?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1627918821035-430b8d5a1cb3?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1529144415895-6aaf8be872fb?q=80&w=800&auto=format&fit=crop"
  ];

  return (
    <div className="fade-in">
      <header className="page-header" style={{ padding: '8rem 0 3rem' }}>
        <div className="container">
          <h1>Our Gallery</h1>
          <p style={{ color: 'var(--text-secondary)' }}>A glimpse into the Demashqi experience.</p>
        </div>
      </header>

      <section className="section container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {images.map((src, idx) => (
            <div key={idx} style={{ overflow: 'hidden', borderRadius: '8px', cursor: 'pointer' }}>
              <img 
                src={src} 
                alt={`Gallery image ${idx + 1}`} 
                style={{ width: '100%', height: '300px', objectFit: 'cover', transition: 'transform 0.5s ease' }} 
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} 
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
