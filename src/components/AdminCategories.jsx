import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function AdminCategories({ categories, fetchData, API }) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ id: null, key: '', name_en: '', name_ar: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const method = formData.id ? 'PUT' : 'POST';
    const url = formData.id ? `${API}/api/admin/categories/${formData.id}` : `${API}/api/admin/categories`;
    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setFormData({ id: null, key: '', name_en: '', name_ar: '' });
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await fetch(`${API}/api/admin/categories/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const inputStyle = { padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: '#fff', width: '100%' };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
      <div style={{ backgroundColor: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px' }}>
        <h3>{formData.id ? 'Edit Category' : 'Add Category'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <input type="text" placeholder="Key (e.g. shawarma)" value={formData.key} onChange={e => setFormData({ ...formData, key: e.target.value })} required style={inputStyle} />
          <input type="text" placeholder="Name (EN)" value={formData.name_en} onChange={e => setFormData({ ...formData, name_en: e.target.value })} required style={inputStyle} />
          <input type="text" placeholder="Name (AR)" value={formData.name_ar} onChange={e => setFormData({ ...formData, name_ar: e.target.value })} required style={inputStyle} />
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, padding: '0.8rem' }}>{loading ? 'Saving...' : 'Save'}</button>
            {formData.id && <button type="button" onClick={() => setFormData({ id: null, key: '', name_en: '', name_ar: '' })} style={{ padding: '0.8rem', backgroundColor: 'transparent', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px' }}>Cancel</button>}
          </div>
        </form>
      </div>

      <div style={{ backgroundColor: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px' }}>
        <h3>Category List</h3>
        <table style={{ width: '100%', textAlign: isRTL ? 'right' : 'left', marginTop: '1rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem' }}>Key</th>
              <th style={{ padding: '1rem' }}>Name (EN)</th>
              <th style={{ padding: '1rem' }}>Name (AR)</th>
              <th style={{ padding: '1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem' }}>{cat.key}</td>
                <td style={{ padding: '1rem' }}>{cat.name_en}</td>
                <td style={{ padding: '1rem' }}>{cat.name_ar}</td>
                <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => setFormData(cat)} style={{ padding: '0.4rem 0.8rem', backgroundColor: 'var(--gold)', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleDelete(cat.id)} style={{ padding: '0.4rem 0.8rem', backgroundColor: 'var(--brand-red)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
