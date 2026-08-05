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
  const [iframeUrl, setIframeUrl] = useState(null);
  
  // Check if we are returning from Paymob (Callback)
  const isSuccessCallback = searchParams.get('success') === 'true';
  const isFailureCallback = searchParams.get('success') === 'false';
  const hasCallback = searchParams.has('success');

  const API = import.meta.env.VITE_API_BASE_URL || '';
  const isCreatingOrderRef = React.useRef(false);
  const [orderFinalized, setOrderFinalized] = useState(false);

  useEffect(() => {
    // If it's a callback, handle it immediately
    if (hasCallback) {
      if (isSuccessCallback && !isCreatingOrderRef.current && !orderFinalized) {
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
      } else if (!isSuccessCallback) {
        setLoading(false);
      }
      return;
    }

    // Otherwise, we are initializing a new payment
    const initPayment = async () => {
      const pendingOrderStr = sessionStorage.getItem('pendingOrder');
      if (!pendingOrderStr) {
        setError(language === 'ar' ? 'بيانات الدفع مفقودة' : 'Payment data missing');
        setLoading(false);
        return;
      }

      try {
        const state = JSON.parse(pendingOrderStr);
        const res = await fetch(`${API}/api/payment/paymob`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: state.tempOrderId,
            total: state.total,
            items: state.items,
            name: state.name,
            address: state.address,
            phone: state.phone
          })
        });

        const data = await res.json();
        if (data.success && data.iframeUrl) {
          setIframeUrl(data.iframeUrl);
        } else {
          setError(language === 'ar' ? 'حدث مشكلة في جلب بيانات الدفع' : 'Failed to initialize payment');
        }
      } catch (err) {
        console.error(err);
        setError(language === 'ar' ? 'حدث مشكلة في الاتصال بالخادم' : 'Server connection error');
      } finally {
        setLoading(false);
      }
    };

    initPayment();
  }, [hasCallback, language, isSuccessCallback, clearCart, API, orderFinalized]);

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

  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '4rem auto', minHeight: '70vh', padding: '1rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-primary)' }}>
        {language === 'ar' ? 'إتمام الدفع' : 'Complete Payment'}
      </h2>
      
      {iframeUrl && (
        <div style={{ width: '100%', height: '600px', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
          <iframe 
            src={iframeUrl}
            width="100%"
            height="100%"
            frameBorder="0"
            title="Payment Gateway"
          />
        </div>
      )}
    </div>
  );
}
