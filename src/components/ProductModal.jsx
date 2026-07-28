import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function ProductModal({
  item,
  categoriesData = [],
  availableSauces = [],
  maxFreeSauces = 2,
  onClose,
  onSave,
  isEditMode = false
}) {
  const { language } = useLanguage();
  
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSpiciness, setSelectedSpiciness] = useState('عادي');
  const [selectedSauces, setSelectedSauces] = useState([]);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = '0px'; // Prevent scrollbar jitter
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, []);

  useEffect(() => {
    if (item) {
      if (isEditMode) {
        setQuantity(item.quantity || 1);
        setSelectedSpiciness(item.selectedSpiciness || 'عادي');
        setSelectedSauces(item.selectedSauces || []);
        if (typeof item.price === 'object' && item.price !== null) {
          setSelectedSize(item.selectedSize || Object.keys(item.price)[0]);
        } else {
          setSelectedSize(null);
        }
      } else {
        setQuantity(1);
        setSelectedSpiciness('عادي');
        setSelectedSauces([]);
        if (typeof item.price === 'object' && item.price !== null) {
          setSelectedSize(Object.keys(item.price)[0]);
        } else {
          setSelectedSize(null);
        }
      }
    }
  }, [item, isEditMode]);

  if (!item || typeof document === 'undefined') return null;

  // Combine item.sauces and availableSauces before using them for price calculation
  const combinedSauces = [];
  if (item.sauces && item.sauces.length > 0) {
    item.sauces.forEach(sauceName => {
      combinedSauces.push({
        id: `item-sauce-${sauceName}`,
        name_ar: sauceName,
        name_en: sauceName,
        price: 0
      });
    });
  }
  availableSauces.filter(sauce => {
    const cats = sauce.assignedCategories || ['all'];
    return cats.includes('all') || (item.category_key && cats.includes(item.category_key));
  }).forEach(sauce => {
    if (!combinedSauces.find(s => s.name_ar === sauce.name_ar || s.name_en === sauce.name_en)) {
      combinedSauces.push(sauce);
    }
  });

  const extraSaucePrice = selectedSauces
    .map(name => {
      const sauceObj = combinedSauces.find(s => s.name_ar === name || s.name_en === name);
      return sauceObj?.price > 0 ? sauceObj.price : 5; // Fallback to 5 EGP if no price specified
    })
    .sort((a, b) => a - b)
    .slice(maxFreeSauces)
    .reduce((sum, p) => sum + p, 0);

  const basePrice = selectedSize ? item.price[selectedSize] : item.price;
  
  const currentModalPrice = basePrice + extraSaucePrice;

  const handleAddToCart = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      const priceToUse = selectedSize ? item?.price[selectedSize] : item?.price;
      const baseName = item?.originalName || item?.name || 'منتج';
      const nameToUse = selectedSize ? `${baseName.replace(/\s\([^)]+\)$/, '')} (${selectedSize})` : baseName;

      // 1. Prepare item with safe defaults
      const itemToAdd = {
        ...item,
        id: item?.id || Date.now(),
        originalName: baseName,
        name: nameToUse,
        price: Number(priceToUse) || 0,
        selectedSize: selectedSize || 'عادي',
        selectedSpiciness: selectedSpiciness || 'عادي',
        selectedSauces: Array.isArray(selectedSauces) ? selectedSauces : [],
        extraSaucePrice: Number(extraSaucePrice) || 0,
        quantity: Number(quantity) || 1
      };

      console.log("حفظ المنتج الجاري:", itemToAdd);

      // 2. Try passing to prop
      let addedViaProp = false;
      if (typeof onSave === 'function') {
        onSave(itemToAdd, quantity);
        addedViaProp = true;
      }

      // 3. Fail-safe: fallback to localStorage directly
      if (!addedViaProp) {
        const existingCart = JSON.parse(localStorage.getItem('demashqi_cart') || '[]');
        const updatedCart = [...existingCart, { ...itemToAdd, cartItemId: Date.now().toString() }];
        localStorage.setItem('demashqi_cart', JSON.stringify(updatedCart));
        window.dispatchEvent(new Event('cartUpdated'));
      }

      // 4. Close modal
      if (typeof onClose === 'function') onClose();
      
    } catch (error) {
      console.error("خطأ أثناء إضافة المنتج للسلة:", error);
      alert("حدث خطأ أثناء الإضافة: " + error.message);
    }
  };

  const extraSaucesCount = Math.max(0, selectedSauces.length - maxFreeSauces);

  return createPortal(
    <div onClick={(e) => { e.stopPropagation(); onClose(); }} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', zIndex: 9999, padding: '1rem', overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={(e) => e.stopPropagation()} className="scale-in" style={{ backgroundColor: 'var(--card-bg)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', position: 'relative', border: '2px solid var(--brand-red)', margin: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color 0.3s', zIndex: 10 }} onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-red)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
          <X size={28} />
        </button>

        <div style={{ paddingRight: '3rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <h2 style={{ margin: 0, color: 'var(--gold)', fontSize: 'clamp(1.8rem, 5vw, 2.4rem)', fontWeight: '900', lineHeight: 1.2 }}>
            {language === 'ar' ? item.name_ar || item.name : item.name_en || item.name}
          </h2>
          {item.category_key && categoriesData.length > 0 && (
            <span style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(229,185,66,0.15)', color: 'var(--gold)', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>
              {categoriesData.find(c => c.key === item.category_key)?.title || item.category_key}
            </span>
          )}
        </div>

        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1.1rem', lineHeight: 1.6 }}>
          {language === 'ar' ? item.desc_ar || item.desc : item.desc_en || item.desc}
        </p>

        {(item.weight || (item.ingredients && item.ingredients.length > 0) || (item.sauces && item.sauces.length > 0)) && (
          <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
            {item.weight && (
              <p style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                <strong style={{ color: 'var(--gold)' }}>{language === 'ar' ? 'الوزن/الحجم:' : 'Weight/Size:'}</strong> {item.weight}
              </p>
            )}
            {item.ingredients && item.ingredients.length > 0 && (
              <div style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: 'var(--gold)', fontSize: '0.95rem' }}>{language === 'ar' ? 'المكونات:' : 'Ingredients:'}</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {item.ingredients.map((ing, idx) => (
                    <span key={idx} style={{ padding: '4px 10px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '20px', fontSize: '0.85rem' }}>{ing}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.8rem', fontSize: '1.1rem' }}>{language === 'ar' ? 'درجة الحرارة / الطعم:' : 'Spiciness Level:'}</h4>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {['عادي', 'حار'].map(level => (
              <label key={level} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.8rem 1.5rem', border: '1px solid', borderColor: selectedSpiciness === level ? 'var(--brand-red)' : 'var(--border-color)', borderRadius: '8px', backgroundColor: selectedSpiciness === level ? 'rgba(239, 68, 68, 0.1)' : 'transparent', transition: 'all 0.2s', flex: 1, justifyContent: 'center' }}>
                <input
                  type="radio"
                  name="spiciness"
                  value={level}
                  checked={selectedSpiciness === level}
                  onChange={() => setSelectedSpiciness(level)}
                  style={{ display: 'none' }}
                />
                <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: selectedSpiciness === level ? 'var(--brand-red)' : 'var(--text-secondary)' }}>
                  {level === 'حار' ? '🌶️ ' : '🧄 '}{language === 'ar' ? level : (level === 'حار' ? 'Spicy' : 'Normal')}
                </span>
              </label>
            ))}
          </div>
        </div>

        {combinedSauces.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <h4 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.1rem' }}>{language === 'ar' ? 'اختيار الصوصات المرفقة:' : 'Select Sauces:'}</h4>
              <span style={{ fontSize: '0.85rem', color: extraSaucesCount > 0 ? 'var(--gold)' : 'var(--brand-red)', fontWeight: 'bold' }}>
                {extraSaucesCount > 0 
                  ? (language === 'ar' ? `تم إضافة ${extraSaucesCount} صوص إضافي (+${extraSaucePrice} ج.م)` : `${extraSaucesCount} extra sauces added (+${extraSaucePrice} EGP)`)
                  : (language === 'ar' ? `اختر حتى ${maxFreeSauces} إضافات مجاناً` : `Up to ${maxFreeSauces} additions free`)}
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
              {combinedSauces.map((sauce, idx) => {
                const name = language === 'ar' ? sauce.name_ar : sauce.name_en;
                const isSelected = selectedSauces.includes(name);
                return (
                  <button
                    key={sauce.id || idx}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      if (isSelected) setSelectedSauces(selectedSauces.filter(s => s !== name));
                      else setSelectedSauces([...selectedSauces, name]);
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                      padding: '0.6rem 1.2rem', border: '1px solid',
                      borderColor: isSelected ? 'var(--gold)' : 'var(--border-color)',
                      borderRadius: '25px',
                      backgroundColor: isSelected ? 'var(--gold)' : 'transparent',
                      color: isSelected ? 'var(--bg-color)' : 'var(--text-secondary)',
                      transition: 'all 0.2s',
                      fontWeight: isSelected ? 'bold' : 'normal',
                      fontSize: '0.95rem',
                      zIndex: 10
                    }}
                  >
                    {isSelected && <Check size={16} />}
                    <span>
                      {name}
                      {sauce.price > 0 && ` (+${sauce.price})`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {typeof item.price === 'object' && item.price !== null && (
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>{language === 'ar' ? 'اختر الحجم أو النوع:' : 'Select Size/Option:'}</h4>
            <div style={{ display: 'grid', gap: '0.8rem' }}>
              {Object.keys(item.price).map(sizeKey => (
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
                  <span style={{ fontWeight: 'bold', color: 'var(--gold)' }}>{language === 'ar' ? `${item.price[sizeKey]} ج.م` : `${item.price[sizeKey]} EGP`}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', marginTop: typeof item.price === 'object' && item.price !== null ? '2rem' : '0', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <div>
            <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>{language === 'ar' ? 'الإجمالي' : 'Total'}</span>
            <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--gold)' }}>
              {language === 'ar' ? `${currentModalPrice * quantity} ج.م` : `${currentModalPrice * quantity} EGP`}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button type="button" onClick={(e) => { e.preventDefault(); setQuantity(Math.max(1, quantity - 1)); }} style={{ width: '40px', height: '40px', fontSize: '1.5rem', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--brand-red)', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
            <span style={{ fontSize: '1.4rem', fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>{quantity}</span>
            <button type="button" onClick={(e) => { e.preventDefault(); setQuantity(quantity + 1); }} style={{ width: '40px', height: '40px', fontSize: '1.5rem', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--brand-red)', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
          </div>
        </div>

        <button 
          type="button" 
          onClick={handleAddToCart} 
          className="btn-primary" 
          style={{ width: '100%', padding: '1.2rem', fontSize: '1.2rem', cursor: 'pointer', position: 'relative', zIndex: 50 }}
        >
          {isEditMode 
            ? (language === 'ar' ? 'حفظ التعديلات' : 'Save Changes') 
            : (language === 'ar' ? 'إضافة إلى الطلب' : 'Add to Order')}
        </button>
      </div>
    </div>,
    document.body
  );
}
