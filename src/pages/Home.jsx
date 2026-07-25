import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Phone, Tag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// Import authentic images
import HeroImage from '../../Images/1.jpeg';
import StoryImage from '../../Images/7.png';
import Dish1Image from '../../Images/17.png';
import Dish2Image from '../../Images/22.png';
import Dish3Image from '../../Images/5.png';

export default function Home() {
  const { t, language } = useLanguage();
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await fetch(`http://${window.location.hostname}:3000/api/products`);
        if (res.ok) {
          const allProds = await res.json();
          // Filter products that have an offer_type 'daily' or 'weekly'
          const filtered = allProds.filter(p => p.offer_type === 'daily' || p.offer_type === 'weekly');
          setOffers(filtered);
        }
      } catch (err) {
        console.error('Error fetching offers:', err);
      }
    };
    fetchOffers();
  }, []);

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

      {/* Offers Section */}
      {offers.length > 0 && (
        <section style={{ backgroundColor: 'var(--bg-color)', padding: 'clamp(3rem, 6vw, 6rem) 0' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 4vw, 4rem)' }}>
              <h4 style={{ color: 'var(--brand-red)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Tag size={20} />
                {language === 'ar' ? 'لفترة محدودة' : 'Limited Time'}
              </h4>
              <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--gold)' }}>
                {language === 'ar' ? 'عروض وخصومات اليوم' : "Today's Offers & Discounts"}
              </h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 'clamp(1.5rem, 4vw, 2rem)' }}>
              {offers.map(offer => (
                <div key={offer.id} style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(229,185,66,0.3)', position: 'relative' }}>
                  {/* Badge */}
                  <div style={{ position: 'absolute', top: '1rem', right: '1rem', backgroundColor: 'var(--brand-red)', color: '#fff', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem', zIndex: 2 }}>
                    {offer.offer_type === 'daily' 
                      ? (language === 'ar' ? 'عرض اليوم' : "Today's Offer") 
                      : (language === 'ar' ? 'عرض الأسبوع' : 'Weekly Offer')}
                  </div>
                  
                  <img src={offer.img || `${import.meta.env.BASE_URL}Images/31.png`} alt={offer.name_en} style={{ width: '100%', height: '200px', objectFit: 'cover' }} onError={e => { e.target.src = `${import.meta.env.BASE_URL}Images/31.png`; }} />
                  <div style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.3rem', margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
                      {language === 'ar' ? offer.name_ar : offer.name_en}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '1rem' }}>
                      {language === 'ar' ? offer.desc_ar : offer.desc_en}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--gold)', fontWeight: 'bold', fontSize: '1.3rem' }}>
                        {typeof offer.price === 'object' && offer.price !== null ? Math.min(...Object.values(offer.price)) : offer.price} {language === 'ar' ? 'ج.م' : 'EGP'}
                      </span>
                      <Link to="/menu" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', backgroundColor: 'rgba(229,185,66,0.1)', color: 'var(--gold)', borderRadius: '20px', fontWeight: 'bold', textDecoration: 'none' }}>
                        {language === 'ar' ? 'اطلب الآن' : 'Order Now'}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
