import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function OffersSlider({ products, onItemClick }) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef(null);

  // Get popular items for the offers (duplicate list for seamless loop)
  const offerItems = products.filter(p => p.is_popular === 1).slice(0, 8);

  const formatPrice = (price) => {
    if (typeof price === 'object' && price !== null) {
      const minPrice = Math.min(...Object.values(price));
      return language === 'ar' ? `يبدأ من ${minPrice} ج.م` : `From ${minPrice} EGP`;
    }
    return language === 'ar' ? `${price} ج.م` : `${price} EGP`;
  };

  const goToNext = useCallback(() => {
    setActiveIndex(prev => (prev + 1) % offerItems.length);
  }, [offerItems.length]);

  const goToPrev = useCallback(() => {
    setActiveIndex(prev => (prev - 1 + offerItems.length) % offerItems.length);
  }, [offerItems.length]);

  // Auto-play with 2s spotlight per slide
  useEffect(() => {
    if (offerItems.length === 0 || isHovered) return;
    intervalRef.current = setInterval(goToNext, 2500);
    return () => clearInterval(intervalRef.current);
  }, [isHovered, goToNext, offerItems.length]);

  // Scroll active card into view
  useEffect(() => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll('.offer-card');
    if (cards[activeIndex]) {
      cards[activeIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeIndex]);

  if (offerItems.length === 0) return null;

  return (
    <div style={{ marginBottom: '3rem' }}>
      {/* Title */}
      <h3 style={{
        color: 'var(--gold)',
        padding: '0 1rem',
        marginBottom: '1.5rem',
        fontSize: 'clamp(1.4rem, 4vw, 1.8rem)',
        textAlign: isRTL ? 'right' : 'left',
        fontWeight: '900',
        letterSpacing: '1px'
      }}>
        {language === 'ar' ? '🔥 عروض مميزة' : '🔥 Special Offers'}
      </h3>

      {/* Slider Track */}
      <div
        style={{ position: 'relative' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => { setIsHovered(false); }}
      >
        <div
          ref={containerRef}
          style={{
            display: 'flex',
            gap: '1.5rem',
            overflowX: 'auto',
            padding: '0.5rem 1rem 1.5rem 1rem',
            scrollBehavior: 'smooth',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
          className="hide-scrollbar"
        >
          {offerItems.map((item, index) => {
            const isActive = index === activeIndex;
            return (
              <div
                key={item.id}
                className="offer-card"
                onClick={() => onItemClick && onItemClick(item)}
                style={{
                  flex: '0 0 auto',
                  width: '260px',
                  padding: '1.2rem',
                  borderRadius: '16px',
                  backgroundColor: 'var(--card-bg)',
                  border: isActive ? '2px solid var(--gold)' : '1px solid rgba(229,185,66,0.2)',
                  boxShadow: isActive
                    ? '0 16px 40px rgba(229,185,66,0.3)'
                    : '0 4px 12px rgba(0,0,0,0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  // Spotlight / Zoom effect on active
                  transform: isActive ? 'scale(1.08) translateY(-6px)' : 'scale(1) translateY(0)',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  zIndex: isActive ? 2 : 1,
                  position: 'relative',
                }}
              >
                {/* Active spotlight glow overlay */}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '16px',
                    background: 'radial-gradient(ellipse at center top, rgba(229,185,66,0.12) 0%, transparent 70%)',
                    pointerEvents: 'none',
                    zIndex: 0,
                  }} />
                )}

                {item.img && (
                  <img
                    src={item.img}
                    alt={item.name_en}
                    style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', position: 'relative', zIndex: 1 }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                )}

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <h4 style={{ margin: '0 0 0.5rem', color: isActive ? 'var(--gold)' : '#fff', fontSize: '1.1rem', transition: 'color 0.4s ease' }}>
                    {language === 'ar' ? item.name_ar : item.name_en}
                  </h4>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>
                    {language === 'ar' ? item.desc_ar : item.desc_en}
                  </p>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                  <span style={{ color: 'var(--brand-red)', fontWeight: '900', fontSize: '1.2rem' }}>
                    {formatPrice(item.price)}
                  </span>
                  <span style={{
                    fontSize: '0.8rem',
                    padding: '4px 10px',
                    backgroundColor: isActive ? 'var(--gold)' : 'rgba(229,185,66,0.15)',
                    color: isActive ? '#000' : 'var(--gold)',
                    borderRadius: '20px',
                    fontWeight: 'bold',
                    transition: 'all 0.4s ease'
                  }}>
                    {language === 'ar' ? 'اطلب الآن' : 'Order Now'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
          {offerItems.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              style={{
                width: i === activeIndex ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: i === activeIndex ? 'var(--gold)' : 'var(--border-color)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
