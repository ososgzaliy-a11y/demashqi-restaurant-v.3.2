import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function PaymobCallback() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const success = searchParams.get('success') === 'true';
    
    // Post message to the parent window (Checkout.jsx)
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'PAYMOB_RESULT',
        success,
        data: Object.fromEntries(searchParams.entries())
      }, '*');
    }
  }, [searchParams]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#fff', color: '#000', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <h2>جاري معالجة الدفع...</h2>
        <p>يرجى الانتظار ولا تغلق هذه النافذة.</p>
      </div>
    </div>
  );
}
