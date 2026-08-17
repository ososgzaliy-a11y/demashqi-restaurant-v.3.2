import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function ContactUs() {
  const { t, language } = useLanguage();
  const API = import.meta.env.VITE_API_BASE_URL || '';
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: t('contact.form.sending') });
    
    try {
      const response = await fetch(`${API}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus({ type: 'success', message: t('contact.status.success') });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus({ type: 'error', message: data.error?.[0]?.message || t('contact.status.fail') });
      }
    } catch (error) {
      setStatus({ type: 'error', message: t('contact.status.networkError') });
    }
  };

  return (
    <div className="fade-in">
      <header className="page-header no-interaction" style={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: `linear-gradient(var(--dark-overlay), var(--dark-overlay)), url(${import.meta.env.BASE_URL}Images/hero_shawarma.png)`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="container" style={{ textAlign: 'center', padding: '0 1rem' }}>
          <h1 className="scale-in" style={{ fontSize: 'clamp(2.2rem, 7vw, 5rem)', color: 'var(--gold)', textShadow: '0 8px 20px rgba(0,0,0,0.9)', marginBottom: '1rem' }}>
            {t('contact.title')}
          </h1>
          <p className="fade-in stagger-1" style={{ fontSize: 'clamp(1rem, 3vw, 1.6rem)', color: '#fff', fontWeight: 'bold', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
            {t('contact.subtitle')}
          </p>
        </div>
      </header>

      <section className="section container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 'clamp(2rem, 5vw, 4rem)' }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>{t('contact.getInTouch')}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            {t('contact.getInTouchDesc')}
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontFamily: 'Inter, sans-serif' }}>{t('contact.location')}</h3>
              <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>{t('contact.locationDesc')}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontFamily: 'Inter, sans-serif' }}>{t('contact.phone')}</h3>
              <p style={{ color: 'var(--text-secondary)', direction: 'ltr', textAlign: language === 'ar' ? 'right' : 'left', whiteSpace: 'pre-line' }}>{t('contact.phoneDesc')}</p>
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontFamily: 'Inter, sans-serif' }}>{t('contact.email')}</h3>
              <p style={{ color: 'var(--text-secondary)' }}>{t('contact.emailDesc')}</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--card-bg)', padding: '2.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          {status.message && (
            <div style={{ padding: '1rem', marginBottom: '2rem', borderRadius: '4px', backgroundColor: status.type === 'success' ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)', color: status.type === 'success' ? '#2ecc71' : '#e74c3c', border: `1px solid ${status.type === 'success' ? '#2ecc71' : '#e74c3c'}` }}>
              {status.message}
            </div>
          )}
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="name" style={{ fontWeight: 600 }}>{t('contact.form.name')}</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)' }} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="email" style={{ fontWeight: 600 }}>{t('contact.form.email')}</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', textAlign: language === 'ar' ? 'right' : 'left', direction: 'ltr' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="subject" style={{ fontWeight: 600 }}>{t('contact.form.subject')}</label>
              <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} required placeholder={t('contact.form.subjectPlaceholder')} style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)' }} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="message" style={{ fontWeight: 600 }}>{t('contact.form.message')}</label>
              <textarea id="message" name="message" value={formData.message} onChange={handleChange} required rows="5" style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', resize: 'vertical' }}></textarea>
            </div>
            
            <button type="submit" className="btn-primary" disabled={status.type === 'loading'}>
              {status.type === 'loading' ? t('contact.form.sending') : t('contact.form.send')}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
