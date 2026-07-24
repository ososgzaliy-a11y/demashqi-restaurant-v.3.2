import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useCart } from '../context/CartContext';
import { X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { searchMenuItems } from '../utils/searchUtils';

const MenuHero = `${import.meta.env.BASE_URL}Images/31.png`;

export default function Menu() {
  const { addToCart } = useCart();
  const { t, language } = useLanguage();
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeCategoryKey, setActiveCategoryKey] = useState("all");
  const [searchQuery, setSearchQuery] = useState('');

  const items = t('menu.items');
  const catT = t('menu.categories');

  const exactImageMap = {
    'sh_sand_chicken': '7.png',
    'sh_sand_meat': '26.png',
    'pz_margherita': '5.png',
    'app_fatteh': '8.png',
    'br_4': '11.png',
    'dr_cocktail': '14.png',
    'dr_latte': '15.png',
    'cr_nutella': '17.png'
  };

  const getImageForKey = (key) => {
    if (exactImageMap[key]) {
      return `${import.meta.env.BASE_URL}Images/${exactImageMap[key]}`;
    }
    return null;
  };

  // Build categories dynamically from the translations object
  const categoriesData = [
    {
      key: 'shawarma',
      title: catT.shawarma,
      items: Object.keys(items).filter(k => k.startsWith('sh_') || k.startsWith('west_')).map(k => ({ ...items[k], id: k, img: getImageForKey(k) })),
      img: `${import.meta.env.BASE_URL}Images/26.png`
    },
    {
      key: 'broasted',
      title: catT.broasted,
      items: Object.keys(items).filter(k => k.startsWith('br_') || k.startsWith('meal_')).map(k => ({ ...items[k], id: k, img: getImageForKey(k) })),
      img: `${import.meta.env.BASE_URL}Images/11.png`
    },
    {
      key: 'pizza',
      title: catT.pizza,
      items: Object.keys(items).filter(k => k.startsWith('pz_') || k.startsWith('man_')).map(k => ({ ...items[k], id: k, img: getImageForKey(k) })),
      img: `${import.meta.env.BASE_URL}Images/5.png`
    },
    {
      key: 'crepes',
      title: catT.crepes,
      items: Object.keys(items).filter(k => k.startsWith('cr_') || k.startsWith('maria_') || k.startsWith('sham_')).map(k => ({ ...items[k], id: k, img: getImageForKey(k) })),
      img: `${import.meta.env.BASE_URL}Images/17.png`
    },
    {
      key: 'appetizers',
      title: catT.appetizers,
      items: Object.keys(items).filter(k => k.startsWith('tray_') || k.startsWith('app_')).map(k => ({ ...items[k], id: k, img: getImageForKey(k) })),
      img: `${import.meta.env.BASE_URL}Images/8.png`
    },
    {
      key: 'drinks',
      title: catT.drinks,
      items: Object.keys(items).filter(k => k.startsWith('dr_') || k.startsWith('ds_')).map(k => ({ ...items[k], id: k, img: getImageForKey(k) })),
      img: `${import.meta.env.BASE_URL}Images/14.png`
    }
  ];

  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setQuantity(1);
    if (typeof item.price === 'object') {
      setSelectedSize(Object.keys(item.price)[0]);
    } else {
      setSelectedSize(null);
    }
  };

  const handleAddToCart = () => {
    if (selectedItem) {
      const priceToUse = selectedSize ? selectedItem.price[selectedSize] : selectedItem.price;
      const nameToUse = selectedSize ? `${selectedItem.name} (${selectedSize})` : selectedItem.name;

      addToCart({ ...selectedItem, name: nameToUse, price: priceToUse }, quantity);
      setSelectedItem(null);
    }
  };

  const getDisplayPrice = (priceData) => {
    if (typeof priceData === 'object') {
      const minPrice = Math.min(...Object.values(priceData));
      return language === 'ar' ? `تبدأ من ${minPrice} ج.م` : `From ${minPrice} EGP`;
    }
    return language === 'ar' ? `${priceData} ج.م` : `${priceData} EGP`;
  };

  const currentModalPrice = selectedItem
    ? (selectedSize ? selectedItem.price[selectedSize] : selectedItem.price)
    : 0;

  const activeCategory = categoriesData.find(c => c.key === activeCategoryKey);

  const allItemsFlattened = categoriesData.reduce((acc, cat) => {
    // Avoid duplicates if any exist
    cat.items.forEach(item => {
      if (!acc.find(i => i.id === item.id)) acc.push(item);
    });
    return acc;
  }, []);

  const searchResults = searchMenuItems(searchQuery, allItemsFlattened);

  return (
    <div className="fade-in">
      {/* Header is smaller if a category is active */}
      <header className="page-header no-interaction" style={{ backgroundImage: `linear-gradient(var(--dark-overlay), var(--dark-overlay)), url(${MenuHero})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', paddingTop: activeCategoryKey === "all" ? '12rem' : '10rem', paddingBottom: activeCategoryKey === "all" ? '6rem' : '4rem', transition: 'all 0.3s ease' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 style={{ color: 'var(--gold)', textShadow: '0 4px 12px rgba(0,0,0,0.8)', fontSize: activeCategoryKey === "all" ? '4rem' : '2.5rem', transition: 'all 0.3s ease' }}>{t('menu.title')}</h1>
          {activeCategoryKey === "all" && <p style={{ fontSize: '1.4rem', color: '#fff', marginTop: '1rem', fontWeight: 'bold' }}>{t('menu.subtitle')}</p>}
        </div>
      </header>

      <section className="section container">
        {/* Search Bar */}
        <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'center' }}>
          <input
            type="text"
            placeholder={language === 'ar' ? 'ابحث عن منتج...' : 'Search for a product...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '600px',
              padding: '1rem 1.5rem',
              fontSize: '1.1rem',
              borderRadius: '50px',
              border: '2px solid var(--border-color)',
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'border-color 0.3s ease'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--gold)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
          />
        </div>

        {searchQuery ? (
          <div className="fade-in">
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'var(--gold)', textAlign: 'center' }}>
              {language === 'ar' ? 'نتائج البحث' : 'Search Results'}
            </h2>
            {searchResults.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '2rem' }}>
                {searchResults.map((item, i) => (
                  <div key={item.id || i} className={`fade-in stagger-${(i % 4) + 1}`} onClick={() => handleOpenModal(item)} style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', transition: 'transform 0.3s ease, box-shadow 0.3s ease', cursor: 'pointer', opacity: 0 }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(200, 16, 46, 0.3)'; e.currentTarget.style.borderColor = 'var(--brand-red)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}>
                    <div style={{ padding: '1.5rem', display: 'flex', gap: '1rem' }}>
                      <img
                        src={item.img || `${import.meta.env.BASE_URL}Images/31.png`}
                        alt={item.name}
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
                        onError={(e) => { e.target.src = `${import.meta.env.BASE_URL}Images/31.png`; }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                        <h3 style={{ fontSize: '1.4rem', margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>{item.name}</h3>
                        <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--brand-red)' }}>{getDisplayPrice(item.price)}</span>
                        <p style={{ color: 'var(--text-secondary)', margin: 0, fontWeight: 500, fontSize: '0.95rem', lineHeight: '1.5' }}>{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
                {language === 'ar' ? 'لا توجد نتائج' : 'No results found'}
              </p>
            )}
          </div>
        ) : activeCategoryKey === "all" ? (
          /* Category Grid View */
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'var(--text-primary)', textAlign: 'center' }}>
              {language === 'ar' ? 'اختر القسم' : 'Select a Category'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '2rem' }}>
              {categoriesData.map((cat) => (
                <div
                  key={cat.key}
                  onClick={() => setActiveCategoryKey(cat.key)}
                  style={{
                    position: 'relative',
                    height: '250px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    border: '2px solid var(--border-color)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.borderColor = 'var(--brand-red)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                >
                  <img src={cat.img} alt={cat.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.2))', display: 'flex', alignItems: 'flex-end', padding: '2rem' }}>
                    <h3 style={{ color: 'var(--gold)', fontSize: '2.2rem', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>{cat.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Items View for Selected Category */
          <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem', borderBottom: '2px solid var(--brand-red)', paddingBottom: '1rem' }}>
              <button
                onClick={() => setActiveCategoryKey("all")}
                className="btn-outline back-to-cat-btn"
                style={{ padding: '0.5rem 1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <X size={20} />
                {language === 'ar' ? 'العودة للأقسام' : 'Back to Categories'}
              </button>
              <h2 style={{ fontSize: '2.5rem', margin: 0, color: 'var(--gold)' }}>{activeCategory?.title}</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '2rem' }}>
              {activeCategory?.items.map((item, i) => (
                <div key={item.id || i} className={`fade-in stagger-${(i % 4) + 1}`} onClick={() => handleOpenModal(item)} style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', transition: 'transform 0.3s ease, box-shadow 0.3s ease', cursor: 'pointer', opacity: 0 }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(200, 16, 46, 0.3)'; e.currentTarget.style.borderColor = 'var(--brand-red)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}>
                  <div style={{ padding: '1.5rem', display: 'flex', gap: '1rem' }}>
                    <img
                      src={item.img || `${import.meta.env.BASE_URL}Images/31.png`}
                      alt={item.name}
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
                      onError={(e) => { e.target.src = `${import.meta.env.BASE_URL}Images/31.png`; }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                      <h3 style={{ fontSize: '1.4rem', margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>{item.name}</h3>
                      <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--brand-red)' }}>{getDisplayPrice(item.price)}</span>
                      <p style={{ color: 'var(--text-secondary)', margin: 0, fontWeight: 500, fontSize: '0.95rem', lineHeight: '1.5' }}>{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Add to Cart Modal with React Portal */}
      {selectedItem && typeof document !== 'undefined' && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="scale-in" style={{ backgroundColor: 'var(--card-bg)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', position: 'relative', border: '2px solid var(--brand-red)', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' }}>
            <button onClick={() => setSelectedItem(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color 0.3s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-red)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
              <X size={28} />
            </button>

            <h2 style={{ marginBottom: '0.5rem', color: 'var(--gold)', fontSize: '2rem' }}>{selectedItem.name}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>{selectedItem.desc}</p>

            {/* Size Selector */}
            {typeof selectedItem.price === 'object' && (
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>{language === 'ar' ? 'اختر الحجم أو النوع:' : 'Select Size/Option:'}</h4>
                <div style={{ display: 'grid', gap: '0.8rem' }}>
                  {Object.keys(selectedItem.price).map(sizeKey => (
                    <label key={sizeKey} style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', padding: '0.8rem', border: '1px solid', borderColor: selectedSize === sizeKey ? 'var(--gold)' : 'var(--border-color)', borderRadius: '8px', backgroundColor: selectedSize === sizeKey ? 'rgba(212, 175, 55, 0.1)' : 'transparent', transition: 'all 0.2s' }}>
                      <input
                        type="radio"
                        name="itemSize"
                        value={sizeKey}
                        checked={selectedSize === sizeKey}
                        onChange={() => setSelectedSize(sizeKey)}
                        style={{ accentColor: 'var(--gold)', transform: 'scale(1.2)' }}
                      />
                      <span style={{ fontSize: '1.1rem', flex: 1 }}>{sizeKey}</span>
                      <span style={{ fontWeight: 'bold', color: 'var(--gold)' }}>{language === 'ar' ? `${selectedItem.price[sizeKey]} ج.م` : `${selectedItem.price[sizeKey]} EGP`}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', marginTop: typeof selectedItem.price === 'object' ? '2rem' : '0', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
              <div>
                <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>{language === 'ar' ? 'الإجمالي' : 'Total'}</span>
                <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--gold)' }}>
                  {language === 'ar' ? `${currentModalPrice * quantity} ج.م` : `${currentModalPrice * quantity} EGP`}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: '40px', height: '40px', fontSize: '1.5rem', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--brand-red)', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                <span style={{ fontSize: '1.4rem', fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} style={{ width: '40px', height: '40px', fontSize: '1.5rem', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--brand-red)', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
            </div>

            <button onClick={handleAddToCart} className="btn-primary" style={{ width: '100%', padding: '1.2rem', fontSize: '1.2rem' }}>
              {language === 'ar' ? 'إضافة إلى الطلب' : 'Add to Order'}
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
