import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCart } from '../context/CartContext';
import { X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { searchMenuItems } from '../utils/searchUtils';
import OffersSlider from '../components/OffersSlider';
import ProductModal from '../components/ProductModal';

const MenuHero = `${import.meta.env.BASE_URL}Images/31.png`;

export default function Menu() {
  const { addToCart, openCheckout } = useCart();
  const { t, language } = useLanguage();
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeCategoryKey, setActiveCategoryKey] = useState("all");
  const [searchQuery, setSearchQuery] = useState('');
  const [availableSauces, setAvailableSauces] = useState([]);
  const [maxFreeSauces, setMaxFreeSauces] = useState(2);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('availableSauces');
      if (saved) setAvailableSauces(JSON.parse(saved).filter(s => s.is_available));
      const savedMax = localStorage.getItem('maxFreeSauces');
      if (savedMax) setMaxFreeSauces(parseInt(savedMax, 10));
    } catch {}
  }, []);

  const [categoriesData, setCategoriesData] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const exactImageMap = {
    'sh_sand_chicken': '7.png', 'sh_sand_meat': '26.png',
    'pz_margherita': '5.png', 'app_fatteh': '8.png',
    'br_4': '11.png', 'dr_cocktail': '14.png',
    'dr_latte': '15.png', 'cr_nutella': '17.png',
  };
  const getImageForKey = (key) => exactImageMap[key]
    ? `${import.meta.env.BASE_URL}Images/${exactImageMap[key]}`
    : null;

  const getFallbackImageForCategory = (categoryKey) => {
    switch(categoryKey) {
      case 'shawarma': return 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?q=80&w=800';
      case 'grills': return 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800';
      case 'appetizers': return 'https://images.unsplash.com/photo-1541518763669-27fef04b14e8?q=80&w=800';
      case 'burgers': return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800';
      case 'pizza_pastries': return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800';
      case 'desserts': return 'https://images.unsplash.com/photo-1519676867240-f03562e64548?q=80&w=800';
      case 'drinks': return 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=800';
      default: return `${import.meta.env.BASE_URL}Images/31.png`;
    }
  };

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch(`http://${window.location.hostname}:3000/api/categories`),
          fetch(`http://${window.location.hostname}:3000/api/products`)
        ]);
        const dbCats = await catRes.json();
        const dbProds = await prodRes.json();

        setProducts(dbProds);

        // Group products by category
        const builtCats = dbCats.map(cat => {
          const catItems = dbProds.filter(p => p.category_key === cat.key).map(p => {
            // Normalise price: DB may return it as a string-encoded JSON
            let price = p.price;
            if (typeof price === 'string') {
              try { price = JSON.parse(price); } catch { price = Number(price) || price; }
            }
            return {
              ...p,
              price,
              id: p.id,
              name: language === 'ar' ? p.name_ar : p.name_en,
              desc: language === 'ar' ? p.desc_ar : p.desc_en,
              category_key: cat.key,
              img: p.img || getImageForKey(p.key) || getFallbackImageForCategory(cat.key),
              // Also normalise arrays
              sauces: Array.isArray(p.sauces) ? p.sauces : (typeof p.sauces === 'string' ? JSON.parse(p.sauces || '[]') : []),
              ingredients: Array.isArray(p.ingredients) ? p.ingredients : (typeof p.ingredients === 'string' ? JSON.parse(p.ingredients || '[]') : []),
            };
          });
          return {
            key: cat.key,
            title: language === 'ar' ? cat.name_ar : cat.name_en,
            items: catItems,
            img: getImageForKey(catItems[0]?.key) || getFallbackImageForCategory(cat.key)
          };
        });

        // Add 'all' category conceptually handled by activeCategoryKey logic
        setCategoriesData(builtCats);
      } catch (err) {
        console.error('Error fetching menu', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [language]);

  const normalisePrice = (raw) => {
    if (raw === null || raw === undefined) return 0;
    if (typeof raw === 'object') return raw;
    if (typeof raw === 'string') {
      try { return JSON.parse(raw); } catch { return Number(raw) || raw; }
    }
    return raw;
  };

  const handleOpenModal = (item) => {
    const price = normalisePrice(item.price);
    const normItem = { ...item, price };
    setSelectedItem(normItem);
  };

  const handleAddToCart = (updatedItem, quantity) => {
    addToCart(updatedItem, quantity);
    setSelectedItem(null);
    openCheckout();
  };

  const getDisplayPrice = (rawPrice) => {
    const price = normalisePrice(rawPrice);
    if (typeof price === 'object' && price !== null) {
      const minPrice = Math.min(...Object.values(price));
      return language === 'ar' ? `يبدأ من ${minPrice} ج.م` : `From ${minPrice} EGP`;
    }
    return language === 'ar' ? `${price} ج.م` : `${price} EGP`;
  };

  const activeCategory = categoriesData.find(c => c.key === activeCategoryKey);

  const allItemsFlattened = (categoriesData || []).reduce((acc, cat) => {
    // Avoid duplicates if any exist
    if (cat && cat.items) {
      cat.items.forEach(item => {
        if (!acc.find(i => i.id === item.id)) acc.push(item);
      });
    }
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
              transition: 'border-color 0.3s ease',
              textAlign: language === 'ar' ? 'right' : 'left'
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--gold)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
          />
        </div>

        {/* Loading State */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gold)', fontSize: '1.2rem' }}>
            <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
            {language === 'ar' ? 'جاري تحميل القائمة...' : 'Loading Menu...'}
          </div>
        ) : (
          <>
            {/* Offers Slider (Only show when not searching and active category is all) */}
            {!searchQuery && activeCategoryKey === 'all' && (
              <OffersSlider products={products} onItemClick={handleOpenModal} />
            )}

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
                            loading="lazy"
                            src={item.img || getFallbackImageForCategory(item.category_key)}
                            alt={item.name}
                            style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
                            onError={(e) => { e.target.src = getFallbackImageForCategory(item.category_key); }}
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
                  {categoriesData?.map((cat) => (
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
                      <img loading="lazy" src={cat.img || getFallbackImageForCategory(cat.key)} alt={cat.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = getFallbackImageForCategory(cat.key); }} />
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
                  {activeCategory?.items?.map((item, i) => (
                    <div key={item.id || i} className={`fade-in stagger-${(i % 4) + 1}`} onClick={() => handleOpenModal(item)} style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', transition: 'transform 0.3s ease, box-shadow 0.3s ease', cursor: 'pointer', opacity: 0 }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(200, 16, 46, 0.3)'; e.currentTarget.style.borderColor = 'var(--brand-red)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}>
                      <div style={{ padding: '1.5rem', display: 'flex', gap: '1rem' }}>
                        <img
                          loading="lazy"
                          src={item.img || getFallbackImageForCategory(item.category_key)}
                          alt={item.name}
                          style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
                          onError={(e) => { e.target.src = getFallbackImageForCategory(item.category_key); }}
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
          </>
        )}
      </section>

      {/* Add to Cart Modal with React Portal */}
      {selectedItem && (
        <ProductModal 
          item={selectedItem}
          categoriesData={categoriesData}
          availableSauces={availableSauces}
          maxFreeSauces={maxFreeSauces}
          onClose={() => setSelectedItem(null)}
          onSave={handleAddToCart}
          isEditMode={false}
        />
      )}
    </div>
  );
}
