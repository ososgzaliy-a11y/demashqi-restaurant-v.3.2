import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../context/LanguageContext';
import { PlusCircle, Pencil, Trash2, X, Plus, Minus } from 'lucide-react';
import ManagerAuthModal from './ManagerAuthModal';

const EMPTY = {
  id: null, category_key: '', key: '', name_en: '', name_ar: '',
  desc_en: '', desc_ar: '', img: '', weight: '', is_popular: 0,
  offer_type: 'none',
  sauces: [], ingredients: [],
  // price mode: 'single' | 'multi'
  priceMode: 'single',
  singlePrice: '',
  sizes: [{ label: '', price: '' }],
};

export default function AdminProducts({ products, categories, fetchData, API, showToast }) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(EMPTY);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [authModal, setAuthModal] = useState({ isOpen: false, actionLabel: '', pendingAction: null });

  useEffect(() => {
    if (showCancelModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showCancelModal]);

  const lbl = (en, ar) => (language === 'ar' ? ar : en);

  const inputStyle = {
    padding: '0.8rem 1rem', borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-color)', color: '#fff',
    width: '100%', fontSize: '0.9rem', outline: 'none',
  };

  const processFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const size = Math.min(img.width, img.height);
          canvas.width = 800;
          canvas.height = 800;
          const ctx = canvas.getContext('2d');
          const startX = (img.width - size) / 2;
          const startY = (img.height - size) / 2;
          ctx.drawImage(img, startX, startY, size, size, 0, 0, 800, 800);
          setFormData(prev => ({ ...prev, img: canvas.toDataURL('image/jpeg', 0.85) }));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const clearImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFormData(prev => ({ ...prev, img: '' }));
  };

  // --- Size helpers ---
  const addSize = () => setFormData(f => ({ ...f, sizes: [...f.sizes, { label: '', price: '' }] }));
  const removeSize = (i) => setFormData(f => ({ ...f, sizes: f.sizes.filter((_, idx) => idx !== i) }));
  const updateSize = (i, field, val) => setFormData(f => {
    const sizes = [...f.sizes];
    sizes[i] = { ...sizes[i], [field]: val };
    return { ...f, sizes };
  });

  // --- Array helpers (sauces / ingredients) ---
  const addArrayItem = (field) => setFormData(f => ({ 
    ...f, 
    [field]: [...f[field], field === 'sauces' ? { name: '', price: '' } : ''] 
  }));
  const removeArrayItem = (field, i) => setFormData(f => ({ ...f, [field]: f[field].filter((_, idx) => idx !== i) }));
  const updateArrayItem = (field, i, val, key = null) => setFormData(f => {
    const arr = [...f[field]];
    if (field === 'sauces' && key) {
       arr[i] = { ...arr[i], [key]: val };
    } else {
       arr[i] = val;
    }
    return { ...f, [field]: arr };
  });

  const buildPrice = () => {
    if (formData.priceMode === 'single') {
      return Number(formData.singlePrice);
    }
    const obj = {};
    formData.sizes.forEach(s => {
      if (s.label && s.price) obj[s.label] = Number(s.price);
    });
    return obj;
  };

  const confirmSubmit = (e) => {
    e.preventDefault();
    setAuthModal({
      isOpen: true,
      actionLabel: formData.id ? lbl('تعديل منتج', 'Edit Product') : lbl('إضافة منتج', 'Add Product'),
      pendingAction: executeSubmit
    });
  };

  const executeSubmit = async () => {
    setLoading(true);
    let finalKey = formData.key;
    if (!finalKey) {
       const base = (formData.name_en || formData.name_ar || 'prod').toLowerCase().replace(/[^a-z0-9]+/g, '_');
       finalKey = `${base}_${Date.now().toString().slice(-4)}`;
    }
    const method = formData.id ? 'PUT' : 'POST';
    const url = formData.id
      ? `${API}/api/admin/products/${formData.id}`
      : `${API}/api/admin/products`;
    try {
      const payload = {
        category_key: formData.category_key,
        key: finalKey,
        name_en: formData.name_en,
        name_ar: formData.name_ar,
        desc_en: formData.desc_en,
        desc_ar: formData.desc_ar,
        img: formData.img,
        weight: formData.weight,
        is_popular: formData.is_popular,
        offer_type: formData.offer_type || 'none',
        sauces: formData.sauces.filter(s => typeof s === 'string' ? s.trim() : (s.name && s.name.trim())),
        ingredients: formData.ingredients.filter(i => typeof i === 'string' ? i.trim() : true),
        price: buildPrice(),
      };
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Server error');
      setFormData(EMPTY);
      fetchData();
      if (showToast) showToast(lbl('Product saved successfully', 'تم حفظ المنتج بنجاح'));
    } catch (err) {
      alert(lbl('Error saving product. Check all required fields.', 'خطأ في الحفظ. تحقق من الحقول المطلوبة.'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id) => {
    setAuthModal({
      isOpen: true,
      actionLabel: lbl('حذف منتج', 'Delete Product'),
      pendingAction: () => executeDelete(id)
    });
  };

  const executeDelete = async (id) => {
    try {
      await fetch(`${API}/api/admin/products/${id}`, { method: 'DELETE' });
      fetchData();
      if (showToast) showToast(lbl('Product deleted', 'تم حذف المنتج'));
    } catch (err) { console.error(err); }
  };

  const handleEdit = (prod) => {
    const isMulti = typeof prod.price === 'object' && prod.price !== null;
    setFormData({
      ...EMPTY,
      id: prod.id,
      category_key: prod.category_key || '',
      key: prod.key || '',
      name_en: prod.name_en || '',
      name_ar: prod.name_ar || '',
      desc_en: prod.desc_en || '',
      desc_ar: prod.desc_ar || '',
      img: prod.img || '',
      weight: prod.weight || '',
      is_popular: prod.is_popular || 0,
      offer_type: prod.offer_type || 'none',
      sauces: Array.isArray(prod.sauces) ? prod.sauces.map(s => typeof s === 'string' ? { name: s, price: 0 } : s) : [],
      ingredients: Array.isArray(prod.ingredients) ? prod.ingredients : [],
      priceMode: isMulti ? 'multi' : 'single',
      singlePrice: isMulti ? '' : String(prod.price || ''),
      sizes: isMulti
        ? Object.entries(prod.price).map(([label, price]) => ({ label, price: String(price) }))
        : [{ label: '', price: '' }],
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const displayPrice = (price) => {
    if (typeof price === 'object' && price !== null) {
      const min = Math.min(...Object.values(price));
      return `${lbl('From', 'من')} ${min} ${lbl('EGP', 'ج.م')}`;
    }
    return `${price} ${lbl('EGP', 'ج.م')}`;
  };

  const sectionLabel = { fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block', fontWeight: '600', letterSpacing: '0.3px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Form Section */}
      <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: 'clamp(1rem, 3vw, 2rem)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', color: 'var(--gold)' }}>
          {formData.id ? lbl('تعديل منتج', 'Edit Product') : lbl('إضافة منتج جديد', 'Add New Product')}
        </h2>

        <form onSubmit={confirmSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: '1rem' }}>

            {/* Category */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={sectionLabel}>{lbl('Category *', 'القسم *')}</label>
              <select value={formData.category_key} onChange={e => setFormData({ ...formData, category_key: e.target.value })} required style={inputStyle}>
                <option value="">{lbl('— Select Category —', '— اختر القسم —')}</option>
                {categories.map(c => <option key={c.key} value={c.key}>{isRTL ? c.name_ar : c.name_en}</option>)}
              </select>
            </div>

            {/* Names */}
            <div>
              <label style={sectionLabel}>Name EN *</label>
              <input type="text" value={formData.name_en} onChange={e => setFormData({ ...formData, name_en: e.target.value })} required style={inputStyle} placeholder="Margherita Pizza" />
            </div>
            <div>
              <label style={sectionLabel}>الاسم بالعربي *</label>
              <input type="text" value={formData.name_ar} onChange={e => setFormData({ ...formData, name_ar: e.target.value })} required style={{ ...inputStyle, direction: 'rtl' }} placeholder="بيتزا مرغريتا" />
            </div>

            {/* Descriptions */}
            <div>
              <label style={sectionLabel}>Desc EN</label>
              <input type="text" value={formData.desc_en} onChange={e => setFormData({ ...formData, desc_en: e.target.value })} style={inputStyle} placeholder="Fresh tomato, mozzarella..." />
            </div>
            <div>
              <label style={sectionLabel}>الوصف بالعربي</label>
              <input type="text" value={formData.desc_ar} onChange={e => setFormData({ ...formData, desc_ar: e.target.value })} style={{ ...inputStyle, direction: 'rtl' }} placeholder="طماطم طازجة، موزاريلا..." />
            </div>

            {/* Drag & Drop Image Zone */}
            <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
              <label style={sectionLabel}>{lbl('Product Image (Drag & Drop)', 'صورة المنتج (اسحب وأفلت هنا)')}</label>
              <label 
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
                style={{ 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                  padding: '2rem', border: '2px dashed var(--gold)', borderRadius: '12px', cursor: 'pointer',
                  backgroundColor: 'rgba(229,185,66,0.05)', transition: 'background 0.3s',
                  minHeight: '150px'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(229,185,66,0.1)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(229,185,66,0.05)'}
              >
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                {formData.img && formData.img.startsWith('data:image') ? (
                  <div style={{ position: 'relative' }}>
                    <img src={formData.img} alt="Preview" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }} />
                    <button 
                      onClick={clearImage}
                      style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--brand-red)', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.3)' }}
                      title={lbl('Clear Image', 'حذف الصورة')}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📸</div>
                    <div>{lbl('Click or drop image here', 'انقر أو اسحب الصورة هنا')}</div>
                    <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.7 }}>
                      {lbl('Auto center-cropped to square', 'يتم قص الصورة تلقائياً لمربع')}
                    </div>
                  </div>
                )}
              </label>
            </div>

            {/* Weight */}
            <div>
              <label style={sectionLabel}>{lbl('Weight / Size', 'الوزن / الحجم')}</label>
              <input type="text" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} style={inputStyle} placeholder="500g" />
            </div>

            {/* Popular & Offer Type */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <input type="checkbox" id="is_popular" checked={formData.is_popular === 1} onChange={e => setFormData({ ...formData, is_popular: e.target.checked ? 1 : 0 })} style={{ accentColor: 'var(--gold)', transform: 'scale(1.3)' }} />
                <label htmlFor="is_popular" style={{ cursor: 'pointer', fontWeight: '600' }}>
                  ⭐ {lbl('Is Popular?', 'منتج مميز؟')}
                </label>
              </div>
              <div>
                <select value={formData.offer_type} onChange={e => setFormData({ ...formData, offer_type: e.target.value })} style={inputStyle}>
                  <option value="none">{lbl('No Offer', 'بدون عرض')}</option>
                  <option value="daily">{lbl("Today's Offer", 'عرض اليوم')}</option>
                  <option value="weekly">{lbl("Weekly Offer", 'عرض الأسبوع')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── PRICE SECTION ── */}
          <div style={{ marginTop: '1.5rem', padding: '1.2rem', backgroundColor: 'var(--bg-color)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <label style={{ ...sectionLabel, fontSize: '0.9rem', marginBottom: '1rem' }}>
              💰 {lbl('Pricing', 'الأسعار')}
            </label>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name="priceMode" value="single" checked={formData.priceMode === 'single'} onChange={() => setFormData(f => ({ ...f, priceMode: 'single' }))} style={{ accentColor: 'var(--gold)' }} />
                {lbl('Single Price', 'سعر موحد')}
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name="priceMode" value="multi" checked={formData.priceMode === 'multi'} onChange={() => setFormData(f => ({ ...f, priceMode: 'multi' }))} style={{ accentColor: 'var(--gold)' }} />
                {lbl('Multiple Sizes', 'أحجام متعددة')}
              </label>
            </div>

            {formData.priceMode === 'single' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="number" min="0" value={formData.singlePrice} onChange={e => setFormData({ ...formData, singlePrice: e.target.value })} required={formData.priceMode === 'single'} style={{ ...inputStyle, maxWidth: '200px' }} placeholder="90" />
                <span style={{ color: 'var(--text-secondary)' }}>{lbl('EGP', 'ج.م')}</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                {formData.sizes.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.7rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder={lbl('Size name (e.g. Medium)', 'اسم الحجم (مثال: وسط)')}
                      value={s.label}
                      onChange={e => updateSize(i, 'label', e.target.value)}
                      required={formData.priceMode === 'multi'}
                      style={{ ...inputStyle, flex: 2 }}
                    />
                    <input
                      type="number" min="0"
                      placeholder={lbl('Price', 'السعر')}
                      value={s.price}
                      onChange={e => updateSize(i, 'price', e.target.value)}
                      required={formData.priceMode === 'multi'}
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <span style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>{lbl('EGP', 'ج.م')}</span>
                    {formData.sizes.length > 1 && (
                      <button type="button" onClick={() => removeSize(i)} style={{ background: 'none', border: 'none', color: 'var(--brand-red)', cursor: 'pointer', padding: '4px' }}>
                        <Minus size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addSize} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid #22C55E', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <Plus size={15} /> {lbl('Add Size', 'إضافة حجم')}
                </button>
              </div>
            )}
          </div>

          {/* ── INGREDIENTS & SAUCES ── */}
          {['ingredients', 'sauces'].map(field => (
            <div key={field} style={{ marginTop: '1.2rem', padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <label style={{ ...sectionLabel, fontSize: '0.9rem', marginBottom: '0.8rem' }}>
                {field === 'ingredients' ? lbl('🥗 Ingredients', '🥗 المكونات') : lbl('🥫 Sauces & Extras', '🥫 الصوصات والإضافات')}
              </label>
              {formData[field].map((val, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                  {field === 'ingredients' ? (
                    <input type="text" value={val} onChange={e => updateArrayItem(field, i, e.target.value)} style={{ ...inputStyle, flex: 1 }} placeholder={lbl('e.g. Cheese', 'مثال: جبنة')} />
                  ) : (
                    <>
                      <input type="text" value={val.name} onChange={e => updateArrayItem(field, i, e.target.value, 'name')} style={{ ...inputStyle, flex: 2 }} placeholder={lbl('Extra name (e.g. Garlic)', 'اسم الإضافة')} />
                      <input type="number" min="0" value={val.price} onChange={e => updateArrayItem(field, i, e.target.value, 'price')} style={{ ...inputStyle, flex: 1 }} placeholder={lbl('Price', 'السعر')} />
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{lbl('EGP', 'ج.م')}</span>
                    </>
                  )}
                  <button type="button" onClick={() => removeArrayItem(field, i)} style={{ background: 'none', border: 'none', color: 'var(--brand-red)', cursor: 'pointer', padding: '4px' }}>
                    <X size={18} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => addArrayItem(field)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', backgroundColor: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid #22C55E', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', marginTop: '0.3rem' }}>
                <Plus size={14} /> {lbl('Add', 'إضافة')}
              </button>
            </div>
          ))}

          {/* Submit / Cancel */}
          <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: '1 1 200px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <PlusCircle size={18} />
              {loading ? lbl('Saving...', 'جاري الحفظ...') : lbl('Save Product', 'حفظ المنتج')}
            </button>
            {formData.id && (
              <button type="button" onClick={() => setShowCancelModal(true)} style={{ flex: '1 1 150px', padding: '1rem 1.5rem', backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <X size={18} /> {lbl('Cancel', 'إلغاء')}
              </button>
            )}
          </div>
        </form>
      </div>

      {showCancelModal && createPortal(
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg)', padding: '2rem', borderRadius: '16px',
            border: '1px solid var(--border-color)', maxWidth: '400px', width: '90%',
            textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ margin: '0 0 1rem', color: '#fff', fontSize: '1.3rem' }}>
              {lbl('Cancel Changes?', 'هل أنت متأكد من إلغاء التغييرات؟')}
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              {lbl('Any unsaved data will be lost.', 'البيانات غير المحفوظة ستفقد.')}
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setShowCancelModal(false)} style={{ flex: 1, padding: '0.8rem', backgroundColor: 'transparent', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }}>
                {lbl('No, Keep Editing', 'لا، استمر')}
              </button>
              <button onClick={() => { setFormData(EMPTY); setShowCancelModal(false); }} style={{ flex: 1, padding: '0.8rem', backgroundColor: 'var(--brand-red)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                {lbl('Yes, Cancel', 'نعم، إلغاء')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <ManagerAuthModal
        isOpen={authModal.isOpen}
        actionLabel={authModal.actionLabel}
        onClose={() => setAuthModal(prev => ({ ...prev, isOpen: false }))}
        onSuccess={() => {
          if (authModal.pendingAction) authModal.pendingAction();
          setAuthModal(prev => ({ ...prev, isOpen: false }));
        }}
      />

      {/* ── TABLE ── */}
      <div className="table-responsive" style={{ backgroundColor: 'var(--card-bg)', padding: '1.8rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ color: 'var(--gold)', margin: 0 }}>📦 {lbl('Product List', 'قائمة المنتجات')} ({products.length})</h3>
          <input 
            type="text" 
            placeholder={lbl('Search products...', 'ابحث عن منتج...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: '#fff', minWidth: '220px' }}
          />
        </div>
        <table className="responsive-table" style={{ width: '100%', textAlign: isRTL ? 'right' : 'left', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
              {[lbl('Category', 'القسم'), lbl('Name', 'الاسم'), lbl('Price', 'السعر'), lbl('Popular', 'مميز'), lbl('Actions', 'الإجراءات')].map(h => (
                <th key={h} style={{ padding: '0.8rem 1rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.filter(p => searchQuery === '' || 
              (p.name_en && p.name_en.toLowerCase().includes(searchQuery.toLowerCase())) || 
              (p.name_ar && p.name_ar.includes(searchQuery)) ||
              (p.category_key && p.category_key.toLowerCase().includes(searchQuery.toLowerCase()))
            ).map(prod => (
              <tr key={prod.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td data-label={lbl('Category', 'القسم')} style={{ padding: '0.8rem 1rem', color: 'var(--text-secondary)' }}>{prod.category_key}</td>
                <td data-label={lbl('Name', 'الاسم')} style={{ padding: '0.8rem 1rem', fontWeight: '600' }}>{isRTL ? prod.name_ar : prod.name_en}</td>
                <td data-label={lbl('Price', 'السعر')} style={{ padding: '0.8rem 1rem', color: 'var(--brand-red)', fontWeight: '700' }}>{displayPrice(prod.price)}</td>
                <td data-label={lbl('Popular', 'مميز')} style={{ padding: '0.8rem 1rem' }}>
                  <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.8rem', backgroundColor: prod.is_popular ? 'rgba(229,185,66,0.15)' : 'rgba(255,255,255,0.05)', color: prod.is_popular ? 'var(--gold)' : 'var(--text-secondary)' }}>
                    {prod.is_popular ? '⭐ Yes' : '—'}
                  </span>
                </td>
                <td data-label={lbl('Actions', 'الإجراءات')} style={{ padding: '0.8rem 1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleEdit(prod)} style={{ padding: '0.35rem 0.7rem', backgroundColor: 'rgba(229,185,66,0.15)', color: 'var(--gold)', border: '1px solid var(--gold)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem' }}>
                      <Pencil size={13} /> {lbl('Edit', 'تعديل')}
                    </button>
                    <button 
                      onClick={() => confirmDelete(prod.id)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: 'var(--brand-red)',
                        borderRadius: '8px',
                        padding: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    > <Trash2 size={13} /> {lbl('Delete', 'حذف')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
