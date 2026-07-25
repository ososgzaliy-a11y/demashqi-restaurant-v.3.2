import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { PlusCircle, Pencil, Trash2, X, Plus, Minus } from 'lucide-react';

const EMPTY = {
  id: null, category_key: '', key: '', name_en: '', name_ar: '',
  desc_en: '', desc_ar: '', img: '', weight: '', is_popular: 0,
  sauces: [], ingredients: [],
  // price mode: 'single' | 'multi'
  priceMode: 'single',
  singlePrice: '',
  sizes: [{ label: '', price: '' }],
};

export default function AdminProducts({ products, categories, fetchData, API }) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(EMPTY);

  const lbl = (en, ar) => (language === 'ar' ? ar : en);

  const inputStyle = {
    padding: '0.8rem 1rem', borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-color)', color: '#fff',
    width: '100%', fontSize: '0.9rem', outline: 'none',
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
  const addArrayItem = (field) => setFormData(f => ({ ...f, [field]: [...f[field], ''] }));
  const removeArrayItem = (field, i) => setFormData(f => ({ ...f, [field]: f[field].filter((_, idx) => idx !== i) }));
  const updateArrayItem = (field, i, val) => setFormData(f => {
    const arr = [...f[field]];
    arr[i] = val;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const method = formData.id ? 'PUT' : 'POST';
    const url = formData.id
      ? `${API}/api/admin/products/${formData.id}`
      : `${API}/api/admin/products`;
    try {
      const payload = {
        category_key: formData.category_key,
        key: formData.key,
        name_en: formData.name_en,
        name_ar: formData.name_ar,
        desc_en: formData.desc_en,
        desc_ar: formData.desc_ar,
        img: formData.img,
        weight: formData.weight,
        is_popular: formData.is_popular,
        sauces: formData.sauces.filter(s => s.trim()),
        ingredients: formData.ingredients.filter(i => i.trim()),
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
    } catch (err) {
      alert(lbl('Error saving product. Check all required fields.', 'خطأ في الحفظ. تحقق من الحقول المطلوبة.'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(lbl('Delete this product?', 'هل تريد حذف هذا المنتج؟'))) return;
    try {
      await fetch(`${API}/api/admin/products/${id}`, { method: 'DELETE' });
      fetchData();
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
      sauces: Array.isArray(prod.sauces) ? prod.sauces : [],
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
      {/* ── FORM ── */}
      <div style={{ backgroundColor: 'var(--card-bg)', padding: '2rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--gold)' }}>
          {formData.id ? lbl('✏️ Edit Product', '✏️ تعديل منتج') : lbl('➕ Add Product', '➕ إضافة منتج')}
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: '1rem' }}>

            {/* Category */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={sectionLabel}>{lbl('Category *', 'القسم *')}</label>
              <select value={formData.category_key} onChange={e => setFormData({ ...formData, category_key: e.target.value })} required style={inputStyle}>
                <option value="">{lbl('— Select Category —', '— اختر القسم —')}</option>
                {categories.map(c => <option key={c.key} value={c.key}>{isRTL ? c.name_ar : c.name_en}</option>)}
              </select>
            </div>

            {/* Key */}
            <div>
              <label style={sectionLabel}>{lbl('Key (slug) *', 'المفتاح (slug) *')}</label>
              <input type="text" value={formData.key} onChange={e => setFormData({ ...formData, key: e.target.value })} required style={inputStyle} placeholder="pz_margherita" />
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

            {/* Image */}
            <div>
              <label style={sectionLabel}>{lbl('Image URL', 'رابط الصورة')}</label>
              <input type="text" value={formData.img} onChange={e => setFormData({ ...formData, img: e.target.value })} style={inputStyle} placeholder="https://..." />
            </div>

            {/* Weight */}
            <div>
              <label style={sectionLabel}>{lbl('Weight / Size', 'الوزن / الحجم')}</label>
              <input type="text" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} style={inputStyle} placeholder="500g" />
            </div>

            {/* Popular */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <input type="checkbox" id="is_popular" checked={formData.is_popular === 1} onChange={e => setFormData({ ...formData, is_popular: e.target.checked ? 1 : 0 })} style={{ accentColor: 'var(--gold)', transform: 'scale(1.3)' }} />
              <label htmlFor="is_popular" style={{ cursor: 'pointer', fontWeight: '600' }}>
                ⭐ {lbl('Is Popular?', 'منتج مميز؟')}
              </label>
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
                {field === 'ingredients' ? lbl('🥗 Ingredients', '🥗 المكونات') : lbl('🥫 Sauces', '🥫 الصوصات')}
              </label>
              {formData[field].map((val, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input type="text" value={val} onChange={e => updateArrayItem(field, i, e.target.value)} style={{ ...inputStyle }} placeholder={field === 'ingredients' ? lbl('e.g. Cheese', 'مثال: جبنة') : lbl('e.g. Garlic Sauce', 'مثال: صوص ثوم')} />
                  <button type="button" onClick={() => removeArrayItem(field, i)} style={{ background: 'none', border: 'none', color: 'var(--brand-red)', cursor: 'pointer' }}>
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
          <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.5rem' }}>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <PlusCircle size={18} />
              {loading ? lbl('Saving...', 'جاري الحفظ...') : lbl('Save Product', 'حفظ المنتج')}
            </button>
            {formData.id && (
              <button type="button" onClick={() => setFormData(EMPTY)} style={{ padding: '1rem 1.5rem', backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <X size={18} /> {lbl('Cancel', 'إلغاء')}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── TABLE ── */}
      <div style={{ backgroundColor: 'var(--card-bg)', padding: '1.8rem', borderRadius: '14px', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--gold)' }}>📦 {lbl('Product List', 'قائمة المنتجات')} ({products.length})</h3>
        <table style={{ width: '100%', textAlign: isRTL ? 'right' : 'left', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
              {[lbl('Category', 'القسم'), lbl('Name', 'الاسم'), lbl('Price', 'السعر'), lbl('Popular', 'مميز'), lbl('Actions', 'الإجراءات')].map(h => (
                <th key={h} style={{ padding: '0.8rem 1rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map(prod => (
              <tr key={prod.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{ padding: '0.8rem 1rem', color: 'var(--text-secondary)' }}>{prod.category_key}</td>
                <td style={{ padding: '0.8rem 1rem', fontWeight: '600' }}>{isRTL ? prod.name_ar : prod.name_en}</td>
                <td style={{ padding: '0.8rem 1rem', color: 'var(--brand-red)', fontWeight: '700' }}>{displayPrice(prod.price)}</td>
                <td style={{ padding: '0.8rem 1rem' }}>
                  <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.8rem', backgroundColor: prod.is_popular ? 'rgba(229,185,66,0.15)' : 'rgba(255,255,255,0.05)', color: prod.is_popular ? 'var(--gold)' : 'var(--text-secondary)' }}>
                    {prod.is_popular ? '⭐ Yes' : '—'}
                  </span>
                </td>
                <td style={{ padding: '0.8rem 1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleEdit(prod)} style={{ padding: '0.35rem 0.7rem', backgroundColor: 'rgba(229,185,66,0.15)', color: 'var(--gold)', border: '1px solid var(--gold)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem' }}>
                      <Pencil size={13} /> {lbl('Edit', 'تعديل')}
                    </button>
                    <button onClick={() => handleDelete(prod.id)} style={{ padding: '0.35rem 0.7rem', backgroundColor: 'rgba(200,16,46,0.15)', color: 'var(--brand-red)', border: '1px solid var(--brand-red)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem' }}>
                      <Trash2 size={13} /> {lbl('Delete', 'حذف')}
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
