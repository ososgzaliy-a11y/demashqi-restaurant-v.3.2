import React, { useState, useEffect } from 'react';
import { Lock, XCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const API = import.meta.env.VITE_API_URL || '';

export default function ManagerAuthModal({ isOpen, onClose, onSuccess, actionLabel }) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setPassword('');
      setError('');
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError(isRTL ? 'يرجى إدخال كلمة السر' : 'Please enter password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API}/api/manager/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        onSuccess();
        onClose();
      } else {
        setError(isRTL ? 'كلمة السر غير صحيحة' : 'Invalid manager password');
      }
    } catch (err) {
      setError(isRTL ? 'حدث خطأ في الاتصال' : 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, margin: 'auto',
      backgroundColor: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '1rem',
      direction: isRTL ? 'rtl' : 'ltr'
    }}>
      <div className="scale-in" style={{
        backgroundColor: 'var(--bg-color)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '2.5rem',
        maxWidth: '450px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        position: 'relative'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute', top: '1.5rem', [isRTL ? 'left' : 'right']: '1.5rem',
            background: 'none', border: 'none', color: 'var(--text-secondary)',
            cursor: 'pointer', padding: '0.2rem', transition: 'color 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <XCircle size={24} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            display: 'inline-flex', padding: '1rem', 
            backgroundColor: 'rgba(229,185,66,0.1)', 
            borderRadius: '50%', color: 'var(--gold)', marginBottom: '1rem' 
          }}>
            <Lock size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {isRTL ? 'صلاحية المدير مطلوبة' : 'Manager Access Required'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {isRTL 
              ? `للمتابعة في (${actionLabel})، يرجى إدخال كلمة سر المدير.` 
              : `To proceed with (${actionLabel}), please enter manager password.`}
          </p>
        </div>

        {error && (
          <div style={{ 
            backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            color: 'var(--brand-red)', padding: '0.8rem', borderRadius: '8px',
            marginBottom: '1.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {isRTL ? 'كلمة السر' : 'Password'}
            </label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoFocus
              style={{
                width: '100%', padding: '0.8rem 1rem', borderRadius: '8px',
                backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)',
                color: '#fff', fontSize: '1rem', outline: 'none'
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--gold)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button 
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: '0.8rem', borderRadius: '8px',
                backgroundColor: 'transparent', border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 'bold'
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </button>
            <button 
              type="submit"
              disabled={loading}
              style={{
                flex: 1, padding: '0.8rem', borderRadius: '8px',
                backgroundColor: 'var(--gold)', border: 'none',
                color: '#1a1a1a', cursor: loading ? 'wait' : 'pointer', fontWeight: 'bold',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? (isRTL ? 'جاري التحقق...' : 'Verifying...') : (isRTL ? 'تأكيد الصلاحية' : 'Verify Access')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
