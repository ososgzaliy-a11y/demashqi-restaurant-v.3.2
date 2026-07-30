import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import ProductModal from '../components/ProductModal';
import { ShoppingBag, X } from 'lucide-react';

const MenuHero = `${import.meta.env.BASE_URL}Images/31.png`;

export default function RecommendationsModal({ onClose }) {
  const { cart, addToCart } = useCart();
  const { language, t } = useLanguage();
  
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || ''}/api/products`)
      .then(res => res.json())
      .then(data => {
        const cartCategories = cart.map(item => item.category_key);
        const cartKeys = cart.map(item => item.key);
        
        let targetCategories = new Set();
        
        if (cartCategories.includes('shawarma')) {
          targetCategories.add('appetizers');
          targetCategories.add('sauces');
          targetCategories.add('shawarma');
        }
        if (cartCategories.includes('appetizers')) {
          targetCategories.add('appetizers');
        }
        if (cartCategories.includes('meals')) {
          targetCategories.add('appetizers');
          targetCategories.add('meals');
        }
        
        if (targetCategories.size === 0) {
          targetCategories.add('appetizers');
          targetCategories.add('drinks');
          targetCategories.add('sauces');
          targetCategories.add('desserts');
        }

        const filtered = data.filter(s => targetCategories.has(s.category_key) && !cartKeys.includes(s.key));
        
        const shuffled = filtered.sort(() => 0.5 - Math.random());
        
        const normalized = shuffled.map(p => ({
          ...p,
          sauces: Array.isArray(p.sauces) ? p.sauces : (typeof p.sauces === 'string' ? JSON.parse(p.sauces || '[]') : []),
          ingredients: Array.isArray(p.ingredients) ? p.ingredients : (typeof p.ingredients === 'string' ? JSON.parse(p.ingredients || '[]') : []),
        }));
        
        setRecommendations(normalized);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [cart]);

  useEffect(() => {
    // Scroll to top when modal opens
    window.scrollTo(0, 0);
    
    // Save original overflow styles
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    
    // Force allow scrolling on the main window
    document.body.style.setProperty('overflow', 'auto', 'important');
    document.documentElement.style.setProperty('overflow', 'auto', 'important');
    
    return () => {
      // Restore original overflow styles (so Cart can re-lock the background)
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, []);

  const normalisePrice = (raw) => {
    if (raw === null || raw === undefined) return 0;
    if (typeof raw === 'object') return raw;
    if (typeof raw === 'string') {
      try { return JSON.parse(raw); } catch { return Number(raw) || raw; }
    }
    return raw;
  };

  const getDisplayPrice = (rawPrice) => {
    const price = normalisePrice(rawPrice);
    if (typeof price === 'object') {
      const values = Object.values(price).map(v => Number(v));
      return `${Math.min(...values)} - ${Math.max(...values)} ${language === 'ar' ? 'ج.م' : 'EGP'}`;
    }
    return `${price} ${language === 'ar' ? 'ج.م' : 'EGP'}`;
  };

  const handleOpenModal = (item) => {
    const price = normalisePrice(item.price);
    const normItem = { ...item, price };
    setSelectedItem(normItem);
  };

  const handleAddToCart = (updatedItem, quantity) => {
    addToCart(updatedItem, quantity);
    setSelectedItem(null);
    showToast(language === 'ar' ? 'تم إضافة المنتج بنجاح 🛒' : 'Item added successfully 🛒');
  };

  return createPortal(
    <div 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-color)',
        zIndex: 100000,
        paddingBottom: '4rem'
      }}
      className="fade-in"
    >
      <header style={{ padding: '2rem 1rem 1rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)' }}>
        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <h1 style={{ color: 'var(--gold)', fontSize: '2rem', margin: 0 }}>
                {language === 'ar' ? 'قائمة المقترحات' : 'Recommendations'}
              </h1>
              
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                style={{
                  background: 'var(--brand-red)',
                  border: 'none',
                  color: '#fff',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'opacity 0.2s ease',
                  fontSize: '0.9rem'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = 0.8}
                onMouseLeave={e => e.currentTarget.style.opacity = 1}
              >
                <X size={20} />
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
            
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: '0 auto', maxWidth: '600px' }}>
              {language === 'ar' 
                ? 'اخترنا لك بعناية مجموعة من الأطباق والإضافات التي تتماشى تماماً مع طلبك الحالي لتجربة طعام لا تُنسى!'
                : 'We have carefully selected items that perfectly complement your current order for an unforgettable experience!'}
            </p>
          </div>
        </div>
      </header>

      <section className="section container" style={{ padding: '2rem 1rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gold)' }}>
            <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
            {language === 'ar' ? 'جاري تحضير المقترحات...' : 'Preparing recommendations...'}
          </div>
        ) : recommendations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
            <ShoppingBag size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <p style={{ fontSize: '1.2rem' }}>
              {language === 'ar' ? 'لا توجد مقترحات إضافية حالياً، طلبك يبدو رائعاً!' : 'No more recommendations, your order looks great!'}
            </p>
          </div>
        ) : (
          <div className="recommendations-grid" style={{ display: 'grid', gap: '2rem' }}>
            {recommendations.map((item, i) => (
              <div 
                key={item.id || i} 
                className={`fade-in stagger-${(i % 4) + 1}`} 
                onClick={() => handleOpenModal(item)} 
                style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', transition: 'transform 0.3s ease, box-shadow 0.3s ease', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(200, 16, 46, 0.3)'; e.currentTarget.style.borderColor = 'var(--brand-red)'; }} 
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
              >
                <div style={{ position: 'relative', height: '200px' }}>
                  <img src={item.img || MenuHero} alt={item.name_en} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1 }}>
                  <h3 style={{ fontSize: '1.4rem', margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
                    {language === 'ar' ? item.name_ar : item.name_en}
                  </h3>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--brand-red)' }}>
                    {getDisplayPrice(item.price)}
                  </span>
                  <p style={{ color: 'var(--text-secondary)', margin: 0, fontWeight: 500, fontSize: '0.95rem', lineHeight: '1.5' }}>
                    {language === 'ar' ? item.desc_ar : item.desc_en}
                  </p>
                  <button 
                    style={{ marginTop: 'auto', backgroundColor: 'var(--gold)', color: '#000', border: 'none', padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s', width: '100%' }}
                    onClick={(e) => { e.stopPropagation(); handleOpenModal(item); }}
                  >
                    {language === 'ar' ? '+ إضافة' : '+ Add'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedItem && (
        <ProductModal 
          product={selectedItem} 
          onClose={() => setSelectedItem(null)} 
          onAddToCart={handleAddToCart} 
        />
      )}

      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: 'var(--gold)', color: '#000', padding: '1rem 2rem',
          borderRadius: '50px', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          zIndex: 10001, animation: 'slideUpFade 0.3s ease forwards'
        }}>
          {toastMessage}
        </div>
      )}

      <style>{`
        .recommendations-grid {
          grid-template-columns: 1fr;
        }
        @media (min-width: 600px) {
          .recommendations-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 900px) {
          .recommendations-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </div>,
    document.body
  );
}
