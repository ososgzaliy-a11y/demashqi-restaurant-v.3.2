import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Phone } from 'lucide-react';

export default function Locations() {
  const { language } = useLanguage();

  const branches = [
    {
      en: { name: 'Damanhour Branch', address: 'Al-Muhafaza St. - In front of Social Club' },
      ar: { name: 'فرع دمنهور', address: 'شارع المحافظة - امام النادي الاجتماعي' },
      phones: '19000',
      mapLink: 'https://maps.app.goo.gl/ptV517u1JXwDMBt99'
    },
    {
      en: { name: 'El Mansoura Branch', address: 'Nile Corniche - Next to the University' },
      ar: { name: 'فرع المنصورة', address: 'كورنيش النيل - بجوار الجامعة' },
      phones: '19000',
      mapLink: 'https://maps.google.com/?cid=1249500193850224387&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQ'
    },
    {
      en: { name: 'Tanta Branch', address: 'Al Geish Street - City Center' },
      ar: { name: 'فرع طنطا', address: 'شارع الجيش - وسط البلد' },
      phones: '19000',
      mapLink: 'https://maps.app.goo.gl/Lmst7wFoFKmZiHLB9'
    },
    {
      en: { name: 'Kuwait Branch', address: 'Salmiya - Salem Al Mubarak Street' },
      ar: { name: 'فرع الكويت', address: 'السالمية - شارع سالم المبارك' },
      phones: '+965 222 33 444',
      mapLink: 'https://maps.app.goo.gl/Lmst7wFoFKmZiHLB9'
    }
  ];

  return (
    <div className="fade-in">
      <header className="page-header" style={{
        backgroundImage: `linear-gradient(var(--dark-overlay), var(--dark-overlay)), url(https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2000&auto=format&fit=crop)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '12rem 0 6rem'
      }}>
        <div className="container">
          <h1 style={{ color: 'var(--gold)', textShadow: '0 4px 12px rgba(0,0,0,0.8)' }}>
            {language === 'ar' ? 'فروعنا' : 'Our Branches'}
          </h1>
        </div>
      </header>

      <section className="section container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', color: 'var(--brand-red)' }}>
            {language === 'ar' ? 'اكتشف أقرب فرع لك' : 'Find Your Nearest Branch'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '1rem auto' }}>
            {language === 'ar' 
              ? 'نحن متواجدون في أهم المواقع لتقديم أشهى المأكولات البحرية الطازجة لكم.'
              : 'We are located in key areas to bring the freshest seafood right to your table.'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {branches.map((branch, i) => (
            <div key={i} className={`fade-in stagger-${(i % 4) + 1}`} style={{
              backgroundColor: 'var(--card-bg)',
              padding: '2.5rem 2rem',
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              transition: 'transform 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-10px)';
              e.currentTarget.style.borderColor = 'var(--brand-red)';
              e.currentTarget.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <h3 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '1.5rem', textAlign: 'center' }}>
                {language === 'ar' ? branch.ar.name : branch.en.name}
              </h3>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: '1rem', marginBottom: '1.2rem', color: 'var(--text-secondary)' }}>
                <MapPin color="var(--brand-red)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
                <span style={{ fontSize: '1.1rem', lineHeight: '1.6', textAlign: language === 'ar' ? 'right' : 'left' }}>
                  {language === 'ar' ? branch.ar.address : branch.en.address}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
                <Phone color="var(--brand-red)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{branch.phones}</span>
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                <a
                  href={branch.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    textDecoration: 'none'
                  }}
                >
                  <MapPin size={18} />
                  {language === 'ar' ? 'الاتجاهات' : 'Get Directions'}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
