import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Phone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// Import authentic images
import HeroImage from '../../Images/1.jpeg';
import StoryImage from '../../Images/7.png';
import Dish1Image from '../../Images/17.png';
import Dish2Image from '../../Images/22.png';
import Dish3Image from '../../Images/5.png';

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="fade-in">
      {/* Hero Section — Mobile-First, iOS Safe Area Optimized */}
      <section
        className="hero"
        style={{
          backgroundImage: `linear-gradient(rgba(10,10,10,0.55), rgba(10,10,10,0.88)), url(${HeroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'scroll', /* Fixed breaks on iOS Safari */
        }}
      >
        <div className="container hero-content-wrapper">
          <h1 className="hero-heading">
            {t('hero.title')}
          </h1>
          <p className="hero-subheading">
            {t('hero.subtitle')}
          </p>
          <div className="hero-buttons">
            <Link to="/reservations" className="btn-primary hero-btn">
              {t('hero.book')}
            </Link>
            <Link to="/menu" className="btn-outline hero-btn hero-btn-outline">
              {t('hero.menu')}
            </Link>
          </div>
        </div>
      </section>

      {/* Info Bar */}
      <div style={{ backgroundColor: 'var(--gold)', color: 'var(--bg-color)', padding: '1.2rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>
            <MapPin size={18} /> {t('info.address')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>
            <Clock size={18} /> {t('info.hours')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>
            <Phone size={18} /> {t('info.phone')}
          </div>
        </div>
      </div>

      {/* Our Story Snapshot */}
      <section className="section container">
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'clamp(1.5rem, 4vw, 3rem)' }}>
          <div style={{ flex: '1 1 min(100%, 300px)' }}>
            <img src={StoryImage} loading="lazy" alt="Chef preparing food" style={{ width: '100%', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }} />
          </div>
          <div style={{ flex: '1 1 min(100%, 280px)' }}>
            <h4 style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem', fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>
              {t('story.subtitle')}
            </h4>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '1.5rem', lineHeight: 1.2 }}>
              {t('story.title')}
            </h2>
            <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.8 }}>
              {t('story.text')}
            </p>
            <Link to="/about" className="btn-outline">{t('story.btn')}</Link>
          </div>
        </div>
      </section>

      {/* Featured Menu */}
      <section style={{ backgroundColor: 'var(--card-bg)', padding: 'clamp(4rem, 8vw, 8rem) 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 4vw, 4rem)' }}>
            <h4 style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>
              {t('featured.subtitle')}
            </h4>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>{t('featured.title')}</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 'clamp(1.5rem, 4vw, 2rem)' }}>
            {[
              { name: t('featured.dish1.name'), desc: t('featured.dish1.desc'), price: "£60", img: Dish1Image },
              { name: t('featured.dish2.name'), desc: t('featured.dish2.desc'), price: "£180", img: Dish2Image },
              { name: t('featured.dish3.name'), desc: t('featured.dish3.desc'), price: "£90", img: Dish3Image }
            ].map((dish, i) => (
              <div
                key={i}
                style={{ backgroundColor: 'var(--bg-color)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', transition: 'transform 0.4s ease', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-8px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <img src={dish.img} alt={dish.name} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                    <h3 style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', margin: 0 }}>{dish.name}</h3>
                    <span style={{ color: 'var(--gold)', fontWeight: 'bold', fontSize: '1.1rem', flexShrink: 0, marginLeft: '0.5rem' }}>{dish.price}</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{dish.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/menu" className="btn-primary">{t('featured.btn')}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
