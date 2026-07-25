import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function OffersSlider({ products }) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const scrollRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Get some popular items for the offers
  const offerItems = products.filter(p => p.is_popular === 1).slice(0, 8);

  useEffect(() => {
    if (offerItems.length === 0 || isHovered) return;
    
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const scrollStep = isRTL ? -1 : 1;
    let animationId;

    const autoScroll = () => {
      scrollContainer.scrollLeft += scrollStep;
      
      // Basic infinite effect
      if (isRTL) {
        if (Math.abs(scrollContainer.scrollLeft) >= scrollContainer.scrollWidth - scrollContainer.clientWidth - 5) {
          scrollContainer.scrollLeft = 0;
        }
      } else {
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth - 5) {
          scrollContainer.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(autoScroll);
    };

    animationId = requestAnimationFrame(autoScroll);
    return () => cancelAnimationFrame(animationId);
  }, [isHovered, isRTL, offerItems.length]);

  if (offerItems.length === 0) return null;

  return (
    <div style={{ marginBottom: '3rem' }}>
      <h3 style={{ 
        color: 'var(--gold)', 
        padding: '0 1rem', 
        marginBottom: '1rem', 
        fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', 
        textAlign: isRTL ? 'right' : 'left',
        fontWeight: '900',
        textTransform: 'uppercase'
      }}>
        {language === 'ar' ? '🔥 عروض مميزة' : '🔥 Special Offers'}
      </h3>
      <div 
        ref={scrollRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setIsHovered(false)}
        style={{
          display: 'flex',
          gap: '1.5rem',
          overflowX: 'auto',
          padding: '0 1rem 1rem 1rem',
          scrollBehavior: 'smooth',
          // Hide scrollbar
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
        className="hide-scrollbar"
      >
        {offerItems.map(item => (
          <div key={item.id} className="premium-card" style={{
            flex: '0 0 auto',
            width: '280px',
            padding: '1.2rem',
            borderRadius: '16px',
            backgroundColor: 'var(--card-bg)',
            border: '1px solid rgba(229,185,66,0.3)',
            boxShadow: '0 8px 24px rgba(229,185,66,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 15px 30px rgba(229,185,66,0.2)';
            e.currentTarget.style.borderColor = 'var(--gold)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(229,185,66,0.1)';
            e.currentTarget.style.borderColor = 'rgba(229,185,66,0.3)';
          }}
          >
            {item.img && <img src={item.img} alt={item.name_en} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }} />}
            <div>
              <h4 style={{ margin: '0 0 0.5rem', color: '#fff', fontSize: '1.2rem' }}>{language === 'ar' ? item.name_ar : item.name_en}</h4>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>
                {language === 'ar' ? item.desc_ar : item.desc_en}
              </p>
            </div>
            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--brand-red)', fontWeight: '900', fontSize: '1.3rem' }}>
                {typeof item.price === 'object' && item.price !== null ? Object.values(item.price)[0] : item.price} {language === 'ar' ? 'ج.م' : 'EGP'}
              </span>
              <span style={{ fontSize: '0.85rem', padding: '6px 10px', backgroundColor: 'rgba(229,185,66,0.15)', color: 'var(--gold)', borderRadius: '20px', fontWeight: 'bold' }}>
                {language === 'ar' ? 'اطلب الآن' : 'Order Now'}
              </span>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
