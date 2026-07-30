import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../context/LanguageContext';
import { PlusCircle, Pencil, Trash2, X } from 'lucide-react';

const EMPTY = { id: null, key: '', name_en: '', name_ar: '', img: '', desc_en: '', desc_ar: '' };

export default function AdminCategories({ categories, fetchData, API, showToast }) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(EMPTY);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
      if (showToast) showToast(lbl('Category saved successfully', 'تم حفظ القسم بنجاح'));
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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'start' }}>
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
              {lbl('Category Image (Drag & Drop)', 'صورة القسم (اسحب وأفلت هنا)')}
            </label>
            <label 
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              style={{ 
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                padding: '1.5rem', border: '2px dashed var(--gold)', borderRadius: '12px', cursor: 'pointer',
                backgroundColor: 'rgba(229,185,66,0.05)', transition: 'background 0.3s',
                minHeight: '120px', position: 'relative'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(229,185,66,0.1)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(229,185,66,0.05)'}
            >
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              {formData.img && formData.img.startsWith('data:image') ? (
                <div style={{ position: 'relative' }}>
                  <img src={formData.img} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }} />
                  <button 
                    onClick={clearImage}
                    style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--brand-red)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.3)' }}
                    title={lbl('Clear Image', 'حذف الصورة')}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>📸</div>
                  <div style={{ fontSize: '0.9rem' }}>{lbl('Click or drop image here', 'انقر أو اسحب الصورة هنا')}</div>
                  <div style={{ fontSize: '0.75rem', marginTop: '0.4rem', opacity: 0.7 }}>
                    {lbl('Auto center-cropped to square', 'يتم قص الصورة تلقائياً لمربع')}
                  </div>
                </div>
              )}
            </label>
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

          <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: '1 1 200px', padding: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <PlusCircle size={18} />
              {loading ? lbl('Saving...', 'جاري الحفظ...') : lbl('Save', 'حفظ')}
            </button>
            {formData.id && (
              <button type="button" onClick={() => setShowCancelModal(true)} style={{ flex: '1 1 150px', padding: '0.9rem 1.2rem', backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
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

      {/* ── Table ── */}
      <div className="table-responsive" style={{ backgroundColor: 'var(--card-bg)', padding: '1.8rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ color: 'var(--gold)', margin: 0 }}>
            {lbl('📋 Category List', '📋 قائمة الأقسام')}
          </h3>
          <input 
            type="text" 
            placeholder={lbl('Search categories...', 'ابحث عن قسم...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: '#fff', minWidth: '220px' }}
          />
        </div>
        <table className="responsive-table" style={{ width: '100%', textAlign: isRTL ? 'right' : 'left', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
              <th style={{ padding: '0.8rem 1rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{lbl('Key', 'المفتاح')}</th>
              <th style={{ padding: '0.8rem 1rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{lbl('Name', 'الاسم')}</th>
              <th style={{ padding: '0.8rem 1rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{lbl('Image', 'الصورة')}</th>
              <th style={{ padding: '0.8rem 1rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{lbl('Actions', 'الإجراءات')}</th>
            </tr>
          </thead>
          <tbody>
            {categories.filter(c => searchQuery === '' || 
              (c.name_en && c.name_en.toLowerCase().includes(searchQuery.toLowerCase())) || 
              (c.name_ar && c.name_ar.includes(searchQuery)) ||
              (c.key && c.key.toLowerCase().includes(searchQuery.toLowerCase()))
            ).map(cat => (
              <tr key={cat.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td data-label={lbl('Key', 'المفتاح')} style={{ padding: '0.8rem 1rem', color: 'var(--text-secondary)' }}>{cat.key}</td>
                <td data-label={lbl('Name', 'الاسم')} style={{ padding: '0.8rem 1rem' }}>
                  <div style={{ fontWeight: '600' }}>{isRTL ? cat.name_ar : cat.name_en}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{isRTL ? cat.name_en : cat.name_ar}</div>
                </td>
                <td data-label={lbl('Image', 'الصورة')} style={{ padding: '0.8rem 1rem' }}>
                  {cat.img
                    ? <img src={cat.img} alt="" style={{ width: '50px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} onError={e => { e.target.style.display = 'none'; }} />
                    : <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>—</span>
                  }
                </td>
                <td data-label={lbl('Actions', 'الإجراءات')} style={{ padding: '0.8rem 1rem' }}>
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
