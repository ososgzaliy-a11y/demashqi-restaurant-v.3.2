import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function AdminProducts({ products, categories, fetchData, API }) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ id: null, category_key: '', key: '', name_en: '', name_ar: '', desc_en: '', desc_ar: '', price: '', img: '', weight: '', sauces: '[]', ingredients: '[]', is_popular: 0 });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const method = formData.id ? 'PUT' : 'POST';
    const url = formData.id ? `${API}/api/admin/products/${formData.id}` : `${API}/api/admin/products`;
    
    try {
      // Validate JSON fields
      let parsedPrice;
      try {
        parsedPrice = JSON.parse(formData.price || 'null');
      } catch {
        parsedPrice = formData.price; // fallback to string/number if not JSON object
      }

      const payload = {
        ...formData,
        price: parsedPrice,
        sauces: JSON.parse(formData.sauces || '[]'),
        ingredients: JSON.parse(formData.ingredients || '[]')
      };

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setFormData({ id: null, category_key: '', key: '', name_en: '', name_ar: '', desc_en: '', desc_ar: '', price: '', img: '', weight: '', sauces: '[]', ingredients: '[]', is_popular: 0 });
      fetchData();
    } catch (err) {
      alert('Error saving product. Check JSON formats (sauces, ingredients must be valid JSON arrays e.g. ["Garlic"]).');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await fetch(`${API}/api/admin/products/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const inputStyle = { padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: '#fff', width: '100%' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ backgroundColor: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px' }}>
        <h3>{formData.id ? 'Edit Product' : 'Add Product'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <select value={formData.category_key} onChange={e => setFormData({ ...formData, category_key: e.target.value })} required style={inputStyle}>
            <option value="">Select Category</option>
            {categories.map(c => <option key={c.key} value={c.key}>{c.name_en} / {c.name_ar}</option>)}
          </select>
          <input type="text" placeholder="Key (e.g. pz_margherita)" value={formData.key} onChange={e => setFormData({ ...formData, key: e.target.value })} required style={inputStyle} />
          
          <input type="text" placeholder="Name (EN)" value={formData.name_en} onChange={e => setFormData({ ...formData, name_en: e.target.value })} required style={inputStyle} />
          <input type="text" placeholder="Name (AR)" value={formData.name_ar} onChange={e => setFormData({ ...formData, name_ar: e.target.value })} required style={inputStyle} />
          
          <input type="text" placeholder="Desc (EN)" value={formData.desc_en} onChange={e => setFormData({ ...formData, desc_en: e.target.value })} style={inputStyle} />
          <input type="text" placeholder="Desc (AR)" value={formData.desc_ar} onChange={e => setFormData({ ...formData, desc_ar: e.target.value })} style={inputStyle} />
          
          <input type="text" placeholder="Price (number or JSON e.g. {&quot;Medium&quot;:90})" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required style={inputStyle} />
          <input type="text" placeholder="Image URL (optional)" value={formData.img} onChange={e => setFormData({ ...formData, img: e.target.value })} style={inputStyle} />
          
          <input type="text" placeholder="Weight (e.g. 500g) (optional)" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} style={inputStyle} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <input type="checkbox" id="is_popular" checked={formData.is_popular === 1} onChange={e => setFormData({ ...formData, is_popular: e.target.checked ? 1 : 0 })} />
            <label htmlFor="is_popular">Is Popular?</label>
          </div>
          
          <input type="text" placeholder='Sauces JSON array (e.g. ["Ketchup"])' value={formData.sauces} onChange={e => setFormData({ ...formData, sauces: e.target.value })} style={inputStyle} />
          <input type="text" placeholder='Ingredients JSON array' value={formData.ingredients} onChange={e => setFormData({ ...formData, ingredients: e.target.value })} style={inputStyle} />

          <div style={{ display: 'flex', gap: '1rem', gridColumn: '1 / -1' }}>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, padding: '0.8rem' }}>{loading ? 'Saving...' : 'Save Product'}</button>
            {formData.id && <button type="button" onClick={() => setFormData({ id: null, category_key: '', key: '', name_en: '', name_ar: '', desc_en: '', desc_ar: '', price: '', img: '', weight: '', sauces: '[]', ingredients: '[]', is_popular: 0 })} style={{ padding: '0.8rem', backgroundColor: 'transparent', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px' }}>Cancel</button>}
          </div>
        </form>
      </div>

      <div style={{ backgroundColor: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', overflowX: 'auto' }}>
        <h3>Product List</h3>
        <table style={{ width: '100%', textAlign: isRTL ? 'right' : 'left', marginTop: '1rem', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem' }}>Category</th>
              <th style={{ padding: '1rem' }}>Key</th>
              <th style={{ padding: '1rem' }}>Name</th>
              <th style={{ padding: '1rem' }}>Price</th>
              <th style={{ padding: '1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(prod => (
              <tr key={prod.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem' }}>{prod.category_key}</td>
                <td style={{ padding: '1rem' }}>{prod.key}</td>
                <td style={{ padding: '1rem' }}>{isRTL ? prod.name_ar : prod.name_en}</td>
                <td style={{ padding: '1rem' }}>{typeof prod.price === 'object' ? 'Sizes' : prod.price}</td>
                <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => setFormData({
                    ...prod, 
                    price: typeof prod.price === 'object' ? JSON.stringify(prod.price) : prod.price,
                    sauces: JSON.stringify(prod.sauces || []),
                    ingredients: JSON.stringify(prod.ingredients || [])
                  })} style={{ padding: '0.4rem 0.8rem', backgroundColor: 'var(--gold)', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleDelete(prod.id)} style={{ padding: '0.4rem 0.8rem', backgroundColor: 'var(--brand-red)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
