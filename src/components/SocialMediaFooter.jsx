import React from 'react';

const SocialMediaFooter = ({ customLogo }) => {
  const icons = [
    {
      name: 'Instagram',
      url: 'https://instagram.com',
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm3.98-10.169a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z"/>
        </svg>
      )
    },
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/alsharqdamanhour',
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7.5v4H10v9.5h4v-9.5z"/>
        </svg>
      )
    },
    {
      name: 'TikTok',
      url: 'https://www.tiktok.com/@elsh3rk_restaurant?_r=1&_t=ZS-98ugylT8HCv',
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v7.2c0 1.93-.41 3.88-1.5 5.5-1.57 2.33-4.22 3.5-7.05 3.21-2.91-.3-5.46-2.12-6.52-4.88-1.07-2.76-.56-5.99 1.34-8.25 1.83-2.17 4.79-3.1 7.57-2.47.01 1.37.01 2.73.01 4.1-1.3-.23-2.69-.03-3.83.67-1.3.8-2.09 2.29-2 3.82.09 1.63 1.15 3.1 2.67 3.67 1.57.59 3.42.34 4.71-.7 1.14-.91 1.75-2.35 1.73-3.81V.02z"/>
        </svg>
      )
    }
  ];

  return (
    <div 
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '20px',
        padding: '1.5rem 0',
        width: '100%',
        flexWrap: 'wrap'
      }}
    >
      {icons.map((item, idx) => (
        <a
          key={idx}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          title={item.name}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'var(--gold)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#B38A22';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--gold)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {item.image ? (
             <img src={item.image} alt={item.name} style={{ width: '22px', height: '22px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
          ) : (
             item.svg
          )}
        </a>
      ))}
    </div>
  );
};

export default SocialMediaFooter;
