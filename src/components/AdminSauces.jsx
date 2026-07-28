import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function AdminSauces({ categories = [] }) {
  const { language, t } = useLanguage();
  const isRTL = language === 'ar';
  
  const [sauces, setSauces] = useState([]);
  const [maxFreeSauces, setMaxFreeSauces] = useState(2);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name_ar: '', name_en: '', price: 0, is_available: true, assignedCategories: ['all'] });

  useEffect(() => {
    try {
      const savedSauces = localStorage.getItem('availableSauces');
      if (savedSauces) setSauces(JSON.parse(savedSauces));
      
      const savedMax = localStorage.getItem('maxFreeSauces');
      if (savedMax) setMaxFreeSauces(parseInt(savedMax, 10));
    } catch (err) {
      console.error('Error loading sauces', err);
    }
  }, []);

  const saveToStorage = (newSauces) => {
    setSauces(newSauces);
    localStorage.setItem('availableSauces', JSON.stringify(newSauces));
  };

  const handleMaxFreeChange = (e) => {
    const val = parseInt(e.target.value, 10) || 0;
    setMaxFreeSauces(val);
    localStorage.setItem('maxFreeSauces', val);
  };

  const handleSave = () => {
    if (!formData.name_ar || !formData.name_en) return alert(isRTL ? 'الرجاء إدخال الاسم باللغتين' : 'Please enter names in both languages');
    
    if (editingId) {
      const updated = sauces.map(s => s.id === editingId ? { ...formData, id: editingId } : s);
      saveToStorage(updated);
      setEditingId(null);
    } else {
      const newSauce = { ...formData, id: Date.now().toString() };
      saveToStorage([...sauces, newSauce]);
    }
    setFormData({ name_ar: '', name_en: '', price: 0, is_available: true, assignedCategories: ['all'] });
  };

  const handleEdit = (sauce) => {
    setEditingId(sauce.id);
    setFormData({ name_ar: sauce.name_ar, name_en: sauce.name_en, price: sauce.price, is_available: sauce.is_available, assignedCategories: sauce.assignedCategories || ['all'] });
  };

  const handleDelete = (id) => {
    if (window.confirm(isRTL ? 'تأكيد الحذف؟' : 'Confirm delete?')) {
      const updated = sauces.filter(s => s.id !== id);
      saveToStorage(updated);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name_ar: '', name_en: '', price: 0, is_available: true, assignedCategories: ['all'] });
  };

  return (
    <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '14px', border: '1px solid var(--border-color)', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ color: 'var(--gold)', margin: 0 }}>{isRTL ? 'إدارة الصوصات الإضافية' : 'Sauces Management'}</h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'rgba(255,255,255,0.05)', padding: '0.8rem 1.5rem', borderRadius: '8px' }}>
          <label style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>{isRTL ? 'الحد الأقصى للصوصات المجانية:' : 'Max Free Sauces:'}</label>
          <input 
            type="number" 
            min="0"
            value={maxFreeSauces} 
            onChange={handleMaxFreeChange}
            style={{ width: '80px', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--gold)', backgroundColor: 'var(--bg-color)', color: '#fff', fontSize: '1.1rem', textAlign: 'center' }}
          />
        </div>
      </div>

      {/* Form */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem', backgroundColor: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{isRTL ? 'الاسم (عربي)' : 'Name (Arabic)'}</label>
          <input type="text" value={formData.name_ar} onChange={e => setFormData({...formData, name_ar: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: '#fff' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{isRTL ? 'الاسم (إنجليزي)' : 'Name (English)'}</label>
          <input type="text" value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: '#fff' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{isRTL ? 'السعر (0 = مجاني)' : 'Price (0 = Free)'}</label>
          <input type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: '#fff' }} />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{isRTL ? 'متاح للأقسام التالية' : 'Available for Categories'}</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', padding: '0.4rem 0.8rem', backgroundColor: formData.assignedCategories.includes('all') ? 'rgba(229,185,66,0.2)' : 'rgba(255,255,255,0.05)', borderRadius: '20px', border: `1px solid ${formData.assignedCategories.includes('all') ? 'var(--gold)' : 'transparent'}` }}>
              <input 
                type="checkbox" 
                checked={formData.assignedCategories.includes('all')}
                onChange={(e) => {
                  if (e.target.checked) setFormData({...formData, assignedCategories: ['all']});
                  else setFormData({...formData, assignedCategories: []});
                }}
                style={{ display: 'none' }}
              />
              <span style={{ fontSize: '0.9rem', color: formData.assignedCategories.includes('all') ? 'var(--gold)' : 'var(--text-secondary)' }}>{isRTL ? 'كل القائمة' : 'All Menu'}</span>
            </label>
            {categories.map(cat => (
              <label key={cat.key} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', padding: '0.4rem 0.8rem', backgroundColor: formData.assignedCategories.includes(cat.key) ? 'rgba(229,185,66,0.2)' : 'rgba(255,255,255,0.05)', borderRadius: '20px', border: `1px solid ${formData.assignedCategories.includes(cat.key) ? 'var(--gold)' : 'transparent'}` }}>
                <input 
                  type="checkbox"
                  checked={formData.assignedCategories.includes(cat.key)}
                  onChange={(e) => {
                    let newCats = [...formData.assignedCategories].filter(c => c !== 'all');
                    if (e.target.checked) newCats.push(cat.key);
                    else newCats = newCats.filter(c => c !== cat.key);
                    if (newCats.length === 0) newCats = ['all'];
                    setFormData({...formData, assignedCategories: newCats});
                  }}
                  style={{ display: 'none' }}
                />
                <span style={{ fontSize: '0.9rem', color: formData.assignedCategories.includes(cat.key) ? 'var(--gold)' : 'var(--text-secondary)' }}>
                  {isRTL ? cat.title || cat.name_ar : cat.title || cat.name_en}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <input type="checkbox" checked={formData.is_available} onChange={e => setFormData({...formData, is_available: e.target.checked})} style={{ transform: 'scale(1.5)', accentColor: 'var(--brand-red)' }} />
            {isRTL ? 'متاح للطلب' : 'Available'}
          </label>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
          <button onClick={handleSave} className="btn-primary" style={{ flex: 1, padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            {editingId ? <Save size={18} /> : <Plus size={18} />}
            {editingId ? (isRTL ? 'حفظ التعديلات' : 'Save') : (isRTL ? 'إضافة صوص' : 'Add Sauce')}
          </button>
          {editingId && (
            <button onClick={cancelEdit} style={{ padding: '0.8rem', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '8px', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {sauces.map(sauce => (
          <div key={sauce.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: `1px solid ${sauce.is_available ? 'var(--border-color)' : 'rgba(239,68,68,0.3)'}`, opacity: sauce.is_available ? 1 : 0.6 }}>
            <div>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', color: 'var(--gold)' }}>{isRTL ? sauce.name_ar : sauce.name_en}</h4>
              <span style={{ color: sauce.price > 0 ? 'var(--brand-red)' : 'var(--text-secondary)', fontWeight: 'bold' }}>
                {sauce.price > 0 ? `${sauce.price} EGP` : (isRTL ? 'مجاني' : 'Free')}
              </span>
              {!sauce.is_available && <span style={{ marginLeft: '1rem', color: '#EF4444', fontSize: '0.85rem' }}>({isRTL ? 'غير متاح' : 'Unavailable'})</span>}
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                {(sauce.assignedCategories || ['all']).map(catKey => {
                  if (catKey === 'all') return <span key="all" style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(229,185,66,0.1)', color: 'var(--gold)' }}>{isRTL ? 'الكل' : 'All'}</span>;
                  const cat = categories.find(c => c.key === catKey);
                  if (!cat) return null;
                  return <span key={catKey} style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>{isRTL ? cat.title || cat.name_ar : cat.title || cat.name_en}</span>;
                })}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => handleEdit(sauce)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }}><Edit2 size={16} /></button>
              <button onClick={() => handleDelete(sauce.id)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: 'var(--brand-red)', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }}><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        {sauces.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            {isRTL ? 'لا يوجد صوصات مضافة حالياً' : 'No sauces added yet'}
          </div>
        )}
      </div>
    </div>
  );
}
