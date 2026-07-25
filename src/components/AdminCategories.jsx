import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { PlusCircle, Pencil, Trash2, X } from 'lucide-react';

const EMPTY = { id: null, key: '', name_en: '', name_ar: '', img: '', desc_en: '', desc_ar: '' };

export default function AdminCategories({ categories, fetchData, API }) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(EMPTY);

  const lbl = (en, ar) => (language === 'ar' ? ar : en);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, img: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const method = formData.id ? 'PUT' : 'POST';
    const url = formData.id
      ? `${API}/api/admin/categories/${formData.id}`
      : `${API}/api/admin/categories`;
    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setFormData(EMPTY);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(lbl('Delete this category?', 'هل أنت متأكد من حذف هذا القسم؟'))) return;
    try {
      await fetch(`${API}/api/admin/categories/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const inputStyle = {
    padding: '0.8rem 1rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-color)',
    color: '#fff',
    width: '100%',
    fontSize: '0.95rem',
    outline: 'none',
    direction: 'ltr',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px,380px) 1fr', gap: '2rem', alignItems: 'start' }}>
      {/* ── Form ── */}
      <div style={{ backgroundColor: 'var(--card-bg)', padding: '1.8rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--gold)' }}>
          {formData.id ? lbl('✏️ Edit Category', '✏️ تعديل القسم') : lbl('➕ Add Category', '➕ إضافة قسم')}
        </h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
              {lbl('Key (slug, e.g. shawarma)', 'المفتاح الداخلي (slug)')}
            </label>
            <input type="text" value={formData.key} onChange={e => setFormData({ ...formData, key: e.target.value })} required style={inputStyle} placeholder="shawarma" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Name EN</label>
              <input type="text" value={formData.name_en} onChange={e => setFormData({ ...formData, name_en: e.target.value })} required style={inputStyle} placeholder="Shawarma" />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>الاسم بالعربي</label>
              <input type="text" value={formData.name_ar} onChange={e => setFormData({ ...formData, name_ar: e.target.value })} required style={{ ...inputStyle, direction: 'rtl' }} placeholder="شاورما" />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
              {lbl('Image (Upload or URL) *', 'رابط أو رفع صورة القسم *')}
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input type="text" value={formData.img} onChange={e => setFormData({ ...formData, img: e.target.value })} style={{ ...inputStyle, flex: 1 }} placeholder="https://..." />
              <label style={{ cursor: 'pointer', padding: '0.8rem 1rem', backgroundColor: 'var(--gold)', color: '#000', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem', flexShrink: 0, textAlign: 'center' }}>
                {lbl('Browse', 'تصفح')}
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              </label>
            </div>
            {formData.img && formData.img.startsWith('data:image') && (
              <img src={formData.img} alt="Preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', marginTop: '0.5rem' }} />
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Desc EN (optional)</label>
              <input type="text" value={formData.desc_en} onChange={e => setFormData({ ...formData, desc_en: e.target.value })} style={inputStyle} placeholder="Grilled wraps..." />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>الوصف بالعربي (اختياري)</label>
              <input type="text" value={formData.desc_ar} onChange={e => setFormData({ ...formData, desc_ar: e.target.value })} style={{ ...inputStyle, direction: 'rtl' }} placeholder="شاورما مشوية..." />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, padding: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <PlusCircle size={18} />
              {loading ? lbl('Saving...', 'جاري الحفظ...') : lbl('Save', 'حفظ')}
            </button>
            {formData.id && (
              <button type="button" onClick={() => setFormData(EMPTY)} style={{ padding: '0.9rem 1.2rem', backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <X size={18} />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── Table ── */}
      <div style={{ backgroundColor: 'var(--card-bg)', padding: '1.8rem', borderRadius: '14px', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--gold)' }}>
          {lbl('📋 Category List', '📋 قائمة الأقسام')}
        </h3>
        <table style={{ width: '100%', textAlign: isRTL ? 'right' : 'left', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
              <th style={{ padding: '0.8rem 1rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{lbl('Key', 'المفتاح')}</th>
              <th style={{ padding: '0.8rem 1rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{lbl('Name', 'الاسم')}</th>
              <th style={{ padding: '0.8rem 1rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{lbl('Image', 'الصورة')}</th>
              <th style={{ padding: '0.8rem 1rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{lbl('Actions', 'الإجراءات')}</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{ padding: '0.8rem 1rem', color: 'var(--text-secondary)' }}>{cat.key}</td>
                <td style={{ padding: '0.8rem 1rem' }}>
                  <div style={{ fontWeight: '600' }}>{isRTL ? cat.name_ar : cat.name_en}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{isRTL ? cat.name_en : cat.name_ar}</div>
                </td>
                <td style={{ padding: '0.8rem 1rem' }}>
                  {cat.img
                    ? <img src={cat.img} alt="" style={{ width: '50px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} onError={e => { e.target.style.display = 'none'; }} />
                    : <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>—</span>
                  }
                </td>
                <td style={{ padding: '0.8rem 1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setFormData({ ...cat, img: cat.img || '', desc_en: cat.desc_en || '', desc_ar: cat.desc_ar || '' })}
                      style={{ padding: '0.4rem 0.8rem', backgroundColor: 'rgba(229,185,66,0.15)', color: 'var(--gold)', border: '1px solid var(--gold)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Pencil size={14} /> {lbl('Edit', 'تعديل')}
                    </button>
                    <button onClick={() => handleDelete(cat.id)}
                      style={{ padding: '0.4rem 0.8rem', backgroundColor: 'rgba(200,16,46,0.15)', color: 'var(--brand-red)', border: '1px solid var(--brand-red)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Trash2 size={14} /> {lbl('Delete', 'حذف')}
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
