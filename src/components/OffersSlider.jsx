import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function OffersSlider({ products, items, onItemClick, title }) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isPausedForDelay, setIsPausedForDelay] = useState(false);
  const intervalRef = useRef(null);
  const delayTimeoutRef = useRef(null);
  const isAutoScrollingRef = useRef(false);
  const longPressTimeoutRef = useRef(null);
  const touchStartPosRef = useRef(null);

  // Get items (use passed items, or fallback to popular)
  const offerItems = items || (products ? products.filter(p => p.is_popular === 1).slice(0, 8) : []);

  const formatPrice = (price) => {
    if (typeof price === 'object' && price !== null) {
      const minPrice = Math.min(...Object.values(price));
      return language === 'ar' ? `يبدأ من ${minPrice} ج.م` : `From ${minPrice} EGP`;
    }
    return language === 'ar' ? `${price} ج.م` : `${price} EGP`;
  };

  const goToNext = useCallback(() => {
    isAutoScrollingRef.current = true;
    setActiveIndex(prev => (prev + 1) % offerItems.length);
  }, [offerItems.length]);

  const goToPrev = useCallback(() => {
    isAutoScrollingRef.current = true;
    setActiveIndex(prev => (prev - 1 + offerItems.length) % offerItems.length);
  }, [offerItems.length]);

  // Smart Auto-play with 3.5s spotlight per slide
  useEffect(() => {
    if (offerItems.length === 0 || isHovered || isPausedForDelay || !isVisible) return;
    intervalRef.current = setInterval(goToNext, 3500);
    return () => clearInterval(intervalRef.current);
  }, [isHovered, isPausedForDelay, isVisible, goToNext, offerItems.length]);

  // Intersection Observer to pause when out of view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setIsVisible(entries[0].isIntersecting);
      },
      { threshold: 0.1 } // Pauses if less than 10% is visible
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  // Sync scroll position when auto-playing without causing vertical page jumps
  useEffect(() => {
    if (!containerRef.current || isHovered || !isAutoScrollingRef.current) return;
    const cards = containerRef.current.querySelectorAll('.offer-card');
    const card = cards[activeIndex];
    if (card) {
      const container = containerRef.current;
      const scrollPos = card.offsetLeft - container.offsetLeft - (container.clientWidth / 2) + (card.clientWidth / 2);
      container.scrollTo({ left: scrollPos, behavior: 'smooth' });
    }
    isAutoScrollingRef.current = false; // Reset after auto-scroll
  }, [activeIndex, isHovered]);

  const handleScroll = (e) => {
    // We update activeIndex natively without fighting the scroll, to let momentum work
    const container = e.target;
    const scrollLeft = container.scrollLeft;
    const cardWidth = 260 + 24; // width + gap approx
    let newIndex = Math.round(scrollLeft / cardWidth);
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= offerItems.length) newIndex = offerItems.length - 1;
    setActiveIndex(newIndex);
  };

  const handleInteractionStart = () => {
    setIsHovered(true);
    if (delayTimeoutRef.current) clearTimeout(delayTimeoutRef.current);
    setIsPausedForDelay(true);
  };

  const handleInteractionEnd = () => {
    setIsHovered(false);
    if (delayTimeoutRef.current) clearTimeout(delayTimeoutRef.current);
    delayTimeoutRef.current = setTimeout(() => {
      setIsPausedForDelay(false);
    }, 10000); // Wait 10 seconds before resuming autoplay
  };

  const handleCardTouchStart = (e, index) => {
    const touch = e.touches[0];
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };

    longPressTimeoutRef.current = setTimeout(() => {
      setActiveIndex(index);
      setHoveredIndex(null); // Clear any hover effect just in case
    }, 200);
  };

  const handleCardTouchMove = (e) => {
    if (!touchStartPosRef.current || !longPressTimeoutRef.current) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartPosRef.current.x);
    const dy = Math.abs(touch.clientY - touchStartPosRef.current.y);
    
    // If user moved their finger more than 10px, it's a swipe, not a hold
    if (dx > 10 || dy > 10) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  };

  const handleCardTouchEnd = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  };

  if (offerItems.length === 0) return null;

  return (
    <div style={{ marginBottom: '3rem' }}>
      {/* Title */}
      {title !== null && (
        <h3 style={{
          color: 'var(--gold)',
          padding: '0 1rem',
          marginBottom: '1.5rem',
          fontSize: 'clamp(1.4rem, 4vw, 1.8rem)',
          textAlign: isRTL ? 'right' : 'left',
          fontWeight: '900',
          letterSpacing: '1px'
        }}>
          {title || (language === 'ar' ? '🔥 عروض مميزة' : '🔥 Special Offers')}
        </h3>
      )}

      {/* Slider Track */}
      <div
        style={{ position: 'relative', overflow: 'hidden' }}
        onMouseEnter={handleInteractionStart}
        onMouseLeave={handleInteractionEnd}
        onTouchStart={handleInteractionStart}
        onTouchEnd={handleInteractionEnd}
      >
          <div
            ref={containerRef}
            onScroll={handleScroll}
            style={{
              display: 'flex',
              gap: '1.5rem',
              overflowX: 'auto',
              padding: '1.5rem 1rem 2rem 1rem', // Add padding for shadow and scaling
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch',
              height: '420px', // Fixed height to prevent shifting
              alignItems: 'center',
            }}
            className="hide-scrollbar"
          >
            {offerItems.map((item, index) => {
            const isActive = hoveredIndex !== null ? index === hoveredIndex : index === activeIndex;
            return (
              <div
                key={item.id}
                className="offer-card"
                onClick={() => onItemClick && onItemClick(item)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onTouchStart={(e) => handleCardTouchStart(e, index)}
                onTouchMove={handleCardTouchMove}
                onTouchEnd={handleCardTouchEnd}
                onContextMenu={(e) => e.preventDefault()}
                style={{
                  flex: '0 0 auto',
                  width: '260px',
                  height: '350px', // Fixed card height
                  padding: '1.2rem',
                  borderRadius: '16px',
                  backgroundColor: 'var(--card-bg)',
                  border: isActive ? '2px solid var(--brand-red)' : '1px solid rgba(229,185,66,0.2)',
                  boxShadow: isActive
                    ? '0 0 20px rgba(220,38,38,0.3)'
                    : '0 4px 12px rgba(0,0,0,0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  // Skip/Slide Transition effect
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  opacity: isActive ? 1 : 0.7,
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

                {/* Offer Badge */}
                {item.offer_type && item.offer_type !== 'none' && (
                  <div style={{ position: 'absolute', top: '1rem', right: '1rem', backgroundColor: 'var(--brand-red)', color: '#fff', padding: '0.3rem 0.8rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.8rem', zIndex: 3, boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                    {item.offer_type === 'daily' 
                      ? (language === 'ar' ? 'عرض اليوم' : "Today's Offer") 
                      : item.offer_type === 'weekly'
                      ? (language === 'ar' ? 'عرض الأسبوع' : 'Weekly Offer')
                      : (language === 'ar' ? 'الأكثر طلباً' : 'Best Seller')}
                  </div>
                )}

                {item.img && (
                  <img
                    loading="lazy"
                    src={item.img}
                    alt={item.name_en}
                    style={{ width: '100%', height: '140px', minHeight: '140px', objectFit: 'cover', borderRadius: '8px', position: 'relative', zIndex: 1 }}
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

        {/* Navigation Dots and Arrows */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.8rem', marginTop: '0.5rem' }}>
          <button 
            onClick={() => setActiveIndex(prev => Math.max(0, prev - 1))}
            style={{ 
              background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '50%', 
              width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              color: 'var(--text-secondary)', cursor: activeIndex === 0 ? 'not-allowed' : 'pointer',
              opacity: activeIndex === 0 ? 0.3 : 1
            }}
            disabled={activeIndex === 0}
          >
            {isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                  outline: 'none',
                }}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          
          <button 
            onClick={() => setActiveIndex(prev => Math.min(offerItems.length - 1, prev + 1))}
            style={{ 
              background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '50%', 
              width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              color: 'var(--text-secondary)', cursor: activeIndex === offerItems.length - 1 ? 'not-allowed' : 'pointer',
              opacity: activeIndex === offerItems.length - 1 ? 0.3 : 1
            }}
            disabled={activeIndex === offerItems.length - 1}
          >
            {isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
