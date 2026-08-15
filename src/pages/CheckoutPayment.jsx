import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { CheckCircle, XCircle } from 'lucide-react';

export default function CheckoutPayment() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if we are returning from Paymob (Callback)
  const isSuccessCallback = searchParams.get('success') === 'true';
  const isFailureCallback = searchParams.get('success') === 'false';
  const isPendingCallback = searchParams.get('pending') === 'true';
  const hasCallback = searchParams.has('success');
  const txnResponseCode = searchParams.get('txn_response_code');

  const API = import.meta.env.VITE_API_BASE_URL || '';
  const isCreatingOrderRef = React.useRef(false);
  const [orderFinalized, setOrderFinalized] = useState(false);

  useEffect(() => {
    // We only expect this page to be hit as a callback
    if (hasCallback) {
      if (isSuccessCallback && !isPendingCallback && !isCreatingOrderRef.current && !orderFinalized) {
        isCreatingOrderRef.current = true;
        const pendingOrderStr = sessionStorage.getItem('pendingOrder');
        if (pendingOrderStr) {
          try {
            const pendingOrder = JSON.parse(pendingOrderStr);
            fetch(`${API}/api/orders`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(pendingOrder)
            }).then(res => {
              if (res.ok) {
                clearCart();
                sessionStorage.removeItem('pendingOrder');
                setOrderFinalized(true);
                setLoading(false);
              } else {
                setError(language === 'ar' ? 'حدث خطأ أثناء حفظ الطلب' : 'Error saving order');
                setLoading(false);
              }
            }).catch(err => {
              console.error(err);
              setError(language === 'ar' ? 'خطأ في الاتصال بالخادم' : 'Server connection error');
              setLoading(false);
            });
            return;
          } catch (e) {
            console.error(e);
            setError(language === 'ar' ? 'بيانات الجلسة غير صالحة' : 'Invalid session data');
            setLoading(false);
            return;
          }
        } else {
          // If no pendingOrder is found but success is true, it might have been processed already
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } else {
      setError(language === 'ar' ? 'مسار غير صالح' : 'Invalid route access');
      setLoading(false);
    }
  }, [hasCallback, language, isSuccessCallback, isPendingCallback, clearCart, API, orderFinalized]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <h2>{language === 'ar' ? 'جاري تجهيز بوابة الدفع...' : 'Preparing Payment Gateway...'}</h2>
      </div>
    );
  }

  if (hasCallback) {
    return (
      <div style={{ padding: '6rem 2rem', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {isSuccessCallback ? (
          <>
            <CheckCircle size={80} color="var(--success-color, #28a745)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              {language === 'ar' ? 'تمت العملية بنجاح!' : 'Payment Successful!'}
            </h2>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              {language === 'ar' ? 'تم تأكيد طلبك وجاري تحضيره.' : 'Your order has been confirmed and is being prepared.'}
            </p>
            <button 
              onClick={() => navigate('/')}
              style={{ padding: '0.8rem 2rem', background: 'var(--brand-red)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1.1rem' }}
            >
              {language === 'ar' ? 'العودة للرئيسية' : 'Return Home'}
            </button>
          </>
        ) : (
          <>
            <XCircle size={80} color="var(--brand-red)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              {language === 'ar' ? 'حدث مشكلة أثناء الدفع' : 'Payment Failed'}
            </h2>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              {language === 'ar' ? 'عذراً، لم نتمكن من إتمام عملية الدفع. يرجى المحاولة مرة أخرى.' : 'Sorry, we could not complete the payment. Please try again.'}
            </p>
            <button 
              onClick={() => navigate('/menu')}
              style={{ padding: '0.8rem 2rem', background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1.1rem' }}
            >
              {language === 'ar' ? 'المحاولة مرة أخرى' : 'Try Again'}
            </button>
          </>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '6rem 2rem', textAlign: 'center', minHeight: '60vh' }}>
        <XCircle size={60} color="var(--brand-red)" style={{ marginBottom: '1rem' }} />
        <h2 style={{ color: 'var(--brand-red)', marginBottom: '1rem' }}>
          {language === 'ar' ? 'خطأ' : 'Error'}
        </h2>
        <p style={{ color: 'var(--text-primary)' }}>{error}</p>
        <button 
          onClick={() => navigate('/menu')}
          style={{ marginTop: '2rem', padding: '0.8rem 2rem', background: 'var(--brand-red)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {language === 'ar' ? 'العودة للقائمة' : 'Return to Menu'}
        </button>
      </div>
    );
  }

  return null;
}
