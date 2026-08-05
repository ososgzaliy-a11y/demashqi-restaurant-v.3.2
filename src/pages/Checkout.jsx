import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { CreditCard, ShoppingBag, Smartphone, CheckCircle, Navigation, Banknote, AlertTriangle, X, Edit2, Trash2, MapPin } from 'lucide-react';
import ProductModal from '../components/ProductModal';
import RecommendationsModal from '../components/RecommendationsModal';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, countdown, title, message, confirmText, cancelText }) => {
  useEffect(() => {
    if (isOpen) {
      // منع سكرول الخلفية أثناء ظهور التنبيه
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;
  
  const modalContent = (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', overflow: 'hidden' }}>
      <div className="scale-in" style={{ backgroundColor: 'var(--card-bg)', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
        <AlertTriangle size={48} color="var(--gold)" style={{ marginBottom: '1.5rem' }} />
        <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '1rem' }}>{title}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button onClick={onConfirm} className="btn-primary" style={{ padding: '1rem', borderRadius: '8px', fontSize: '1.1rem', cursor: 'pointer' }}>
            {confirmText} ({countdown})
          </button>
          <button onClick={onClose} style={{ padding: '1rem', borderRadius: '8px', fontSize: '1.1rem', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer' }}>
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

function CheckoutForm({ formData, setFormData, cart, cartTotal, status, setStatus, clearCart, navigate, language, onClose: closeCart }) {
  const API = import.meta.env.VITE_API_BASE_URL || '';
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmCountdown, setConfirmCountdown] = useState(5);
  const [isSubmittingState, setIsSubmittingState] = useState(false);
  const [confirmedOrderData, setConfirmedOrderData] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const isSubmittingRef = React.useRef(false);

  const handleGetLocation = () => {
    setLocationError(null);

    // Check if geolocation is available in this context (requires HTTPS or localhost)
    const isSecureContext = window.isSecureContext || location.hostname === 'localhost' || location.hostname === '127.0.0.1';

    if (!navigator.geolocation || !isSecureContext) {
      setLocationError(language === 'ar'
        ? 'تحديد الموقع التلقائي يتطلب اتصالاً آمناً (HTTPS). يرجى كتابة عنوانك يدوياً في الخانة أدناه.'
        : 'Auto-location requires a secure connection (HTTPS). Please type your address manually below.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=ar`);
          const data = await response.json();
          if (data && data.display_name) {
            setFormData(prev => ({
              ...prev,
              street: data.display_name
            }));
            setLocationError(null);
          }
        } catch (error) {
          console.error('Error fetching location:', error);
          setLocationError(language === 'ar'
            ? 'تعذر تحويل موقعك لعنوان. يرجى كتابة العنوان يدوياً.'
            : 'Could not convert location to address. Please type it manually.');
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsLocating(false);
        // POSITION_UNAVAILABLE (code 2) or PERMISSION_DENIED (code 1)
        if (error.code === 1) {
          setLocationError(language === 'ar'
            ? 'تم رفض الوصول للموقع. يرجى كتابة عنوانك يدوياً في الخانة أدناه.'
            : 'Location access denied. Please type your address manually below.');
        } else {
          setLocationError(language === 'ar'
            ? 'تعذر تحديد موقعك. يرجى كتابة العنوان يدوياً.'
            : 'Could not determine your location. Please type your address manually.');
        }
      }
    );
  };

  const INTEGRATION_IDS = {
    cards: 5811753,
    wallets: "PLACEHOLDER_WALLETS",
    instapay: "PLACEHOLDER_INSTAPAY"
  };

  // Paymob In-Page States
  const [paymobIframeUrl, setPaymobIframeUrl] = useState(null);
  const [fetchingPaymob, setFetchingPaymob] = useState(false);
  
  // Listen for Paymob Iframe Callback Message
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'PAYMOB_RESULT') {
        if (event.data.success) {
          createOrderInDB(true);
        } else {
          setStatus({ type: 'error', message: language === 'ar' ? 'فشلت عملية الدفع. يرجى مراجعة بيانات البطاقة والمحاولة مرة أخرى.' : 'Payment failed. Please review your card details and try again.' });
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [cart, formData, cartTotal, language]);

  // Fetch Iframe URL when Credit Card is selected
  useEffect(() => {
    if (formData.paymentMethod === 'cards' && !paymobIframeUrl && !fetchingPaymob) {
      setFetchingPaymob(true);
      const tempOrderId = `temp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      let addressParts = [formData.street];
      if (formData.building) addressParts.push(`${language === 'ar' ? 'مبنى' : 'Building'} ${formData.building}`);
      if (formData.floor) addressParts.push(`${language === 'ar' ? 'طابق' : 'Floor'} ${formData.floor}`);
      const addressStr = addressParts.join(', ');

      fetch(`${API}/api/payment/paymob`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: tempOrderId,
          total: cartTotal,
          items: cart,
          name: formData.name,
          address: addressStr,
          phone: formData.phone,
          integration_id: INTEGRATION_IDS.cards
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.paymentKey) {
          setPaymobIframeUrl(`https://accept.paymob.com/api/acceptance/iframes/1064976?payment_token=${data.paymentKey}`);
        } else if (data.success && data.iframeUrl) {
          setPaymobIframeUrl(data.iframeUrl);
        } else {
          setStatus({ type: 'error', message: language === 'ar' ? 'حدث خطأ في تجهيز الدفع' : 'Error preparing payment' });
        }
      })
      .catch(err => {
        console.error(err);
        setStatus({ type: 'error', message: language === 'ar' ? 'خطأ في الاتصال بخادم الدفع' : 'Payment server error' });
      })
      .finally(() => {
        setFetchingPaymob(false);
      });
    } else if (formData.paymentMethod !== 'cards') {
      setPaymobIframeUrl(null);
    }
  }, [formData.paymentMethod]); // Only refetch if they toggle payment methods, to prevent constant iframe reloading on typing


  const closeSuccessModal = () => {
    if (setStatus) setStatus({ type: '', message: '' });
  };

  useEffect(() => {
    let timer;
    if (showConfirmModal) {
      if (confirmCountdown > 0) {
        timer = setTimeout(() => setConfirmCountdown(prev => prev - 1), 1000);
      } else {
        // Auto cancel when time runs out
        setShowConfirmModal(false);
      }
    }
    return () => clearTimeout(timer);
  }, [showConfirmModal, confirmCountdown]);

  const t = {
    processing: language === 'ar' ? 'جاري المعالجة...' : 'Processing your order...',
    networkError: language === 'ar' ? 'خطأ في الشبكة. يرجى المحاولة لاحقاً.' : 'Network error. Please try again later.',
    fillFields: language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة.' : 'Please fill in all required fields.',
    invalidPhone: language === 'ar' ? 'يجب أن يتكون رقم الهاتف من ١١ رقماً' : 'it must be 11 number',
    deliveryTitle: language === 'ar' ? 'تفاصيل التوصيل' : 'Delivery Details',
    fullName: language === 'ar' ? 'الاسم الكامل' : 'Full Name',
    fullNamePH: language === 'ar' ? '' : '',
    phone: language === 'ar' ? 'رقم الهاتف' : 'Phone Number',
    whatsapp: language === 'ar' ? 'داعم للواتساب' : 'WhatsApp supported',
    street: language === 'ar' ? 'عنوان الشارع' : 'Street Address',
    streetPH: language === 'ar' ? 'مثال: شارع السد' : 'e.g. Al Sadd St',
    building: language === 'ar' ? 'المبنى' : 'Building',
    floor: language === 'ar' ? 'الطابق / الشقة' : 'Floor / Apt',
    notes: language === 'ar' ? 'ملاحظات إضافية' : 'Additional Notes',
    paymentTitle: language === 'ar' ? 'طريقة الدفع' : 'Payment Method',
    vodafoneCash: language === 'ar' ? 'فودافون كاش' : 'Vodafone Cash',
    anyCash: language === 'ar' ? 'الدفع نقداً' : 'Any Cash',
    vodafoneNote: language === 'ar' ? 'سيتصل بك ممثل عبر فودافون كاش عند التسليم.' : 'A representative will contact you via Vodafone Cash on delivery.',
    cashNote: language === 'ar' ? 'ستدفع نقداً عند الاستلام.' : 'You will pay in cash upon delivery.',
    confirmBtn: language === 'ar' ? `تأكيد الطلب والدفع ${cartTotal} جنيه` : `Confirm Order & Pay ${cartTotal} EGP`,
    trackOrder: (id) => language === 'ar' ? `تتبع الطلب #${id}` : `Track Order #${id}`,
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!cart || cart.length === 0) return;

    if (!formData.name || !formData.phone || !formData.street) {
      setStatus({ type: 'error', message: t.fillFields });
      return;
    }

    if (formData.phone.length !== 11) {
      setStatus({ type: 'error', message: t.invalidPhone });
      return;
    }

    setShowConfirmModal(true);
    setConfirmCountdown(5);
  };

  const createOrderInDB = async (isPaidByCard = false) => {
    if (isSubmittingRef.current && !isPaidByCard) return;
    isSubmittingRef.current = true;
    setIsSubmittingState(true);
    
    setStatus({ type: 'loading', message: t.processing });
    let addressParts = [formData.street];
    if (formData.building) addressParts.push(`${language === 'ar' ? 'مبنى' : 'Building'} ${formData.building}`);
    if (formData.floor) addressParts.push(`${language === 'ar' ? 'طابق' : 'Floor'} ${formData.floor}`);
    const addressStr = addressParts.join(', ');

    let globalCounter = parseInt(localStorage.getItem('globalOrderCounter') || '7023', 10);
    globalCounter += 1;
    localStorage.setItem('globalOrderCounter', globalCounter.toString());
    const dailyOrderId = globalCounter;

    try {
      const payload = {
        items: cart,
        total: Number(cartTotal) || 0,
        address: addressStr,
        name: formData.name,
        phone: formData.phone,
        notes: formData.notes,
        paymentMethod: formData.paymentMethod,
        daily_id: dailyOrderId
      };

      const response = await fetch(`${API}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ 
          type: 'success', 
          message: language === 'ar' ? `تم تأكيد الطلب #${dailyOrderId} وجاري تحضيره الآن!` : `Order #${dailyOrderId} confirmed and is being prepared!`,
          orderId: dailyOrderId 
        });
        setConfirmedOrderData({ ...payload, orderId: dailyOrderId, date: new Date().toLocaleString() });
        clearCart();
      } else {
        console.log('Order Submit Error:', data);
        const errorMsg = data.error 
          ? (Array.isArray(data.error) ? data.error[0].message : data.error) 
          : (language === 'ar' ? 'فشل في إرسال الطلب.' : 'Failed to place order.');
        setStatus({ type: 'error', message: errorMsg });
      }
    } catch (err) {
      console.error('Checkout failed', err);
      console.log('Order Submit Error:', err.response?.data || err.message || err);
      setStatus({ type: 'error', message: err.message || t.networkError });
    } finally {
      isSubmittingRef.current = false;
      setIsSubmittingState(false);
    }
  };

  const proceedCheckout = () => {
    setShowConfirmModal(false);
    createOrderInDB(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let parsedValue = type === 'checkbox' ? checked : value;
    if (name === 'phone') {
      parsedValue = value.replace(/\D/g, '').slice(0, 11);
    }
    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };

  const inputStyle = {
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-color)',
    color: 'var(--text-primary)',
    fontSize: '1.1rem',
    width: '100%',
    boxSizing: 'border-box'
  };

  const labelStyle = { fontWeight: 600, color: 'var(--text-secondary)' };

  useEffect(() => {
    if (status.type === 'success') {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [status.type]);

  return (
    <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* 1. Delivery Details */}
      <div style={{ padding: '2rem', backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--gold)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
          <Navigation size={24} /> {language === 'ar' ? '١.' : '1.'} {t.deliveryTitle}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Full Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="name" style={labelStyle}>{t.fullName}</label>
            <input type="text" id="name" name="name" value={formData.name || ''} onChange={handleChange} required placeholder={t.fullNamePH} style={inputStyle} />
          </div>

          {/* Phone Number */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="phone" style={labelStyle}>{t.phone}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input type="tel" id="phone" name="phone" value={formData.phone || ''} onChange={handleChange} required maxLength="11" placeholder={language === 'ar' ? '' : ''} style={{ ...inputStyle, flex: 1 }} />
              <span style={{ whiteSpace: 'nowrap', fontSize: '0.85rem', color: '#25D366', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span>📱</span>{t.whatsapp}
              </span>
            </div>
          </div>

          {/* Street Address */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="street" style={labelStyle}>{t.street}</label>
              <button 
                type="button" 
                onClick={handleGetLocation} 
                disabled={isLocating}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem', 
                  backgroundColor: 'transparent', 
                  border: '1px solid var(--brand-red)', 
                  color: 'var(--brand-red)', 
                  padding: '0.4rem 0.8rem', 
                  borderRadius: '20px', 
                  fontSize: '0.85rem',
                  cursor: isLocating ? 'not-allowed' : 'pointer',
                  opacity: isLocating ? 0.7 : 1,
                  transition: 'all 0.2s'
                }}
              >
                <MapPin size={14} />
                {isLocating ? (language === 'ar' ? 'جاري التحديد...' : 'Locating...') : (language === 'ar' ? 'تحديد موقعي الحالي' : 'Get Current Location')}
              </button>
            </div>
            <input type="text" id="street" name="street" value={formData.street || ''} onChange={handleChange} required placeholder={t.streetPH} style={inputStyle} />
            {locationError && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                padding: '0.6rem 0.9rem', 
                borderRadius: '8px', 
                backgroundColor: 'rgba(255, 165, 0, 0.1)', 
                border: '1px solid rgba(255, 165, 0, 0.4)', 
                color: '#f5a623',
                fontSize: '0.85rem',
                lineHeight: 1.4
              }}>
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>📍</span>
                <span>{locationError}</span>
              </div>
            )}
          </div>

          {/* Building & Floor */}
          <div className="responsive-grid-2">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="building" style={labelStyle}>{t.building}</label>
              <input type="text" id="building" name="building" value={formData.building || ''} onChange={handleChange} placeholder={language === 'ar' ? '(اختياري)' : '(optional)'} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="floor" style={labelStyle}>{t.floor}</label>
              <input type="text" id="floor" name="floor" value={formData.floor || ''} onChange={handleChange} placeholder={language === 'ar' ? '(اختياري)' : '(optional)'} style={inputStyle} />
            </div>
          </div>

          {/* Notes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="notes" style={labelStyle}>{t.notes}</label>
            <textarea id="notes" name="notes" value={formData.notes || ''} onChange={handleChange} placeholder={language === 'ar' ? 'أي ملاحظات إضافية للتوصيل أو الطلب...' : 'Any additional notes for delivery or order...'} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} />
          </div>
        </div>
      </div>

      {/* 2. Payment Method */}
      <div style={{ padding: '2rem', backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--gold)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
          <CreditCard size={24} /> {language === 'ar' ? '٢.' : '2.'} {t.paymentTitle}
        </h3>

        <div className="responsive-flex" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <label style={{ flex: 1, minWidth: '150px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.5rem', cursor: 'pointer', borderRadius: '8px', border: `2px solid ${formData.paymentMethod === 'cash' ? 'var(--gold)' : 'var(--border-color)'}`, backgroundColor: formData.paymentMethod === 'cash' ? 'rgba(255, 215, 0, 0.05)' : 'var(--bg-color)', transition: 'all 0.3s ease' }}>
            <input type="radio" name="paymentMethod" value="cash" checked={formData.paymentMethod === 'cash'} onChange={handleChange} style={{ display: 'none' }} />
            <Banknote size={32} color={formData.paymentMethod === 'cash' ? 'var(--gold)' : 'var(--text-secondary)'} />
            <span style={{ fontWeight: 'bold', color: formData.paymentMethod === 'cash' ? 'var(--gold)' : 'var(--text-secondary)', textAlign: 'center' }}>{language === 'ar' ? 'الدفع نقداً' : 'Cash on Delivery'}</span>
          </label>

          <label style={{ flex: 1, minWidth: '150px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.5rem', cursor: 'pointer', borderRadius: '8px', border: `2px solid ${formData.paymentMethod === 'wallets' ? '#e60000' : 'var(--border-color)'}`, backgroundColor: formData.paymentMethod === 'wallets' ? 'rgba(230, 0, 0, 0.05)' : 'var(--bg-color)', transition: 'all 0.3s ease' }}>
            <input type="radio" name="paymentMethod" value="wallets" checked={formData.paymentMethod === 'wallets'} onChange={handleChange} style={{ display: 'none' }} />
            <Smartphone size={32} color={formData.paymentMethod === 'wallets' ? '#e60000' : 'var(--text-secondary)'} />
            <span style={{ fontWeight: 'bold', color: formData.paymentMethod === 'wallets' ? '#e60000' : 'var(--text-secondary)', textAlign: 'center' }}>{language === 'ar' ? 'محافظ إلكترونية' : 'E-Wallets'}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Vodafone, Orange, Etisalat</span>
          </label>

          <label style={{ flex: 1, minWidth: '150px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.5rem', cursor: 'pointer', borderRadius: '8px', border: `2px solid ${formData.paymentMethod === 'instapay' ? '#662d91' : 'var(--border-color)'}`, backgroundColor: formData.paymentMethod === 'instapay' ? 'rgba(102, 45, 145, 0.05)' : 'var(--bg-color)', transition: 'all 0.3s ease' }}>
            <input type="radio" name="paymentMethod" value="instapay" checked={formData.paymentMethod === 'instapay'} onChange={handleChange} style={{ display: 'none' }} />
            <Smartphone size={32} color={formData.paymentMethod === 'instapay' ? '#662d91' : 'var(--text-secondary)'} />
            <span style={{ fontWeight: 'bold', color: formData.paymentMethod === 'instapay' ? '#662d91' : 'var(--text-secondary)', textAlign: 'center' }}>{language === 'ar' ? 'إنستا باي' : 'InstaPay'}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Instant transfer</span>
          </label>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.5rem', cursor: 'pointer', borderRadius: '8px', border: `2px solid ${formData.paymentMethod === 'cards' ? '#28a745' : 'var(--border-color)'}`, backgroundColor: formData.paymentMethod === 'cards' ? 'rgba(40, 167, 69, 0.05)' : 'var(--bg-color)', transition: 'all 0.3s ease', width: '100%', boxSizing: 'border-box' }}>
            <input type="radio" name="paymentMethod" value="cards" checked={formData.paymentMethod === 'cards'} onChange={handleChange} style={{ display: 'none' }} />
            <CreditCard size={32} color={formData.paymentMethod === 'cards' ? '#28a745' : 'var(--text-secondary)'} />
            <span style={{ fontWeight: 'bold', color: formData.paymentMethod === 'cards' ? '#28a745' : 'var(--text-secondary)', textAlign: 'center' }}>{language === 'ar' ? 'بطاقة بنكية' : 'Credit Card'}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Al Ahly, Misr, QNB, CIB</span>
          </label>
        </div>

        {formData.paymentMethod === 'cash' && (
          <div className="fade-in" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px dashed var(--gold)', color: 'var(--text-secondary)', textAlign: 'center' }}>
            {t.cashNote}
          </div>
        )}

        {formData.paymentMethod === 'cards' && (
          <div className="fade-in" style={{ marginTop: '1.5rem', padding: '0', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid #28a745', textAlign: 'center', width: '100%', overflow: 'hidden' }}>
            {fetchingPaymob ? (
              <div style={{ color: 'var(--text-primary)', padding: '2rem' }}>{language === 'ar' ? 'جاري تجهيز بوابة الدفع...' : 'Preparing payment gateway...'}</div>
            ) : paymobIframeUrl ? (
              <div style={{ width: '100%', height: '750px', borderRadius: '8px', overflow: 'hidden', position: 'relative', zIndex: 50 }}>
                <iframe 
                  src={paymobIframeUrl}
                  style={{ width: '100%', height: '100%', border: 'none', overflow: 'hidden', position: 'relative', zIndex: 50 }}
                  scrolling="no"
                  title="Paymob Payment Gateway"
                  allow="payment"
                />
              </div>
            ) : (
               <div style={{ color: 'var(--brand-red)', padding: '2rem' }}>{language === 'ar' ? 'تعذر جلب بوابة الدفع. يرجى التأكد من البيانات أو اختيار طريقة أخرى.' : 'Could not fetch payment gateway. Please check details or choose another method.'}</div>
            )}
          </div>
        )}

        {(formData.paymentMethod === 'wallets' || formData.paymentMethod === 'instapay') && (
          <div className="fade-in" style={{ marginTop: '1.5rem', padding: '2rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: `1px solid ${formData.paymentMethod === 'instapay' ? '#662d91' : '#e60000'}`, textAlign: 'center', width: '100%' }}>
            <h4 style={{ marginBottom: '1rem', color: formData.paymentMethod === 'instapay' ? '#662d91' : '#e60000' }}>
              {language === 'ar' ? 'بيانات الدفع' : 'Payment Details'}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px', margin: '0 auto' }}>
              <input 
                type="text" 
                name="walletOrInstaPayNumber" 
                onChange={handleChange} 
                value={formData.walletOrInstaPayNumber || ''} 
                placeholder={formData.paymentMethod === 'wallets' ? (language === 'ar' ? 'رقم المحفظة الإلكترونية' : 'E-Wallet Number') : (language === 'ar' ? 'عنوان الدفع (IPA)' : 'InstaPay Address (IPA)')} 
                style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', width: '100%', boxSizing: 'border-box' }} 
                required
              />
            </div>
          </div>
        )}
      </div>
      {status.type !== 'success' && formData.paymentMethod !== 'cards' && (
        <button type="submit" className="btn-primary" style={{ padding: '1.5rem', fontSize: '1.2rem', borderRadius: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.8rem', marginTop: '1rem' }} disabled={status.type === 'loading'}>
          {status.type === 'loading' ? t.processing : t.confirmBtn}
        </button>
      )}

      {status.type === 'error' && (
        <div className="scale-in" style={{ padding: '1.5rem', marginTop: '1rem', borderRadius: '8px', backgroundColor: 'rgba(200, 16, 46, 0.1)', color: 'var(--brand-red)', border: '1px solid var(--brand-red)', textAlign: 'center', fontWeight: 'bold' }}>
          <div>{status.message}</div>
        </div>
      )}

      {status.type === 'success' && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', overflow: 'hidden', padding: '1rem' }}>
          <div className="scale-in" style={{ backgroundColor: 'var(--card-bg)', padding: '3rem 2rem', borderRadius: '16px', border: '1px solid #2ecc71', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', position: 'relative' }}>
            <button
              type="button"
              onClick={() => {
                document.body.style.overflow = 'unset';
                if (typeof clearCart === 'function') clearCart();
                closeSuccessModal();
                if (typeof closeCart === 'function') closeCart();
                
                if (navigate) {
                  navigate('/menu');
                } else {
                  window.location.href = '/menu';
                }
              }}
              style={{ position: 'absolute', top: '15px', left: language === 'ar' ? '15px' : 'auto', right: language === 'ar' ? 'auto' : '15px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              <X size={24} />
            </button>
            <CheckCircle size={64} color="#2ecc71" style={{ marginBottom: '1.5rem', display: 'inline-block' }} />
            <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '2rem' }}>{language === 'ar' ? 'تم تأكيد الطلب بنجاح' : 'Order Confirmed'}</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {status.orderId && (
                <button
                  type="button"
                  onClick={() => {
                    document.body.style.overflow = 'unset';
                    closeSuccessModal();
                    if (typeof closeCart === 'function') closeCart();
                    
                    if (navigate) {
                      navigate(`/track?id=${status.orderId}`);
                    } else {
                      window.location.href = `/track?id=${status.orderId}`;
                    }
                  }}
                  className="btn-primary"
                  style={{ padding: '1rem 2rem', borderRadius: '50px', fontSize: '1.1rem', width: '100%', backgroundColor: '#2ecc71', border: 'none', cursor: 'pointer' }}
                >
                  {t.trackOrder(status.orderId)}
                </button>
              )}
              {/* Print button removed as per restaurant owner request (receipt is internal) */}
              <button
                type="button"
                onClick={() => {
                  document.body.style.overflow = 'unset';
                  if (typeof clearCart === 'function') clearCart();
                  closeSuccessModal();
                  if (typeof closeCart === 'function') closeCart();
                  
                  if (navigate) {
                    navigate('/menu');
                  } else {
                    window.location.href = '/menu';
                  }
                }}
                style={{ padding: '1rem 2rem', borderRadius: '50px', fontSize: '1.1rem', width: '100%', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'var(--text-secondary)' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-color)' }}
              >
                {language === 'ar' ? 'العودة للقائمة الرئيسية' : 'Back to Menu'}
              </button>
            </div>
          </div>
        </div>
      , document.body)}

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={proceedCheckout}
        countdown={confirmCountdown}
        title={language === 'ar' ? 'تأكيد الطلب' : 'Confirm Order'}
        message={language === 'ar' ? 'يرجى مراجعة طلبك وتأكيده قبل انتهاء الوقت. لن يتم اعتماد الطلب بدون تأكيدك.' : 'Please review and confirm your order before time runs out. The order will not be placed without your confirmation.'}
        confirmText={language === 'ar' ? 'اضغط للتأكيد' : 'Click to Confirm'}
        cancelText={language === 'ar' ? 'إلغاء' : 'Cancel'}
      />

    </form>
  );
}

class CheckoutErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Cart Drawer/Checkout Crash:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', padding: '2rem', overflow: 'auto' }}>
          <div style={{ color: '#ff4444', textAlign: 'left', maxWidth: '800px', width: '100%' }}>
            <h2>Cart Component Crashed!</h2>
            <p><strong>Error:</strong> {this.state.error?.toString()}</p>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '0.8rem', marginTop: '1rem', background: '#222', padding: '1rem' }}>
              {this.state.error?.stack}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function CheckoutInternal({ isModal = false, onClose }) {
  const { cart, cartTotal, clearCart, updateQuantity, updateCartItem, removeFromCart, addToCart } = useCart();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [editingCartItem, setEditingCartItem] = useState(null);
  const [addedSuggestions, setAddedSuggestions] = useState({});
  const [maxFreeSauces, setMaxFreeSauces] = useState(2);
  const [crossSellItems, setCrossSellItems] = useState([]);
  const [showCrossSell, setShowCrossSell] = useState(true);
  const [showRecModal, setShowRecModal] = useState(false);

  const handleAddSuggestion = (item) => {
    if (!cart || cart.length === 0) {
      return;
    }
    
    // Attach to the last cart item
    const lastItem = cart[cart.length - 1];
    if (!lastItem) return;
    const priceToAdd = typeof item?.price === 'object' ? Math.min(...Object.values(item.price)) : item?.price;
    const newAddOns = [...(lastItem.addOns || []), { ...item, price: priceToAdd }];
    
    updateCartItem(lastItem.cartItemId, { ...lastItem, addOns: newAddOns });
    
    setAddedSuggestions(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedSuggestions(prev => ({ ...prev, [item.id]: false }));
    }, 1500);
  };

  useEffect(() => {
    // Static standard Shawarma extras
    const staticExtras = [
      { id: 'extra-garlic', name_ar: 'تومية عادية', name_en: 'Garlic Dip', price: 10, img: 'Images/Products/sauces/garlic.png', is_addon: true },
      { id: 'extra-cheddar-fries', name_ar: 'بطاطس شيدر', name_en: 'Cheddar Fries', price: 25, img: 'Images/Products/appetizers/fries.png', is_addon: true },
      { id: 'extra-coleslaw', name_ar: 'سلطة كول سلو', name_en: 'Coleslaw', price: 15, img: 'Images/Products/sauces/coleslaw.png', is_addon: true }
    ];
    setCrossSellItems(staticExtras);
  }, [cart]);

  useEffect(() => {
    try {
      const savedMax = localStorage.getItem('maxFreeSauces');
      if (savedMax) setMaxFreeSauces(parseInt(savedMax, 10));
    } catch {}
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isModal && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    
    const handleForceClose = () => {
      if (isModal && onClose) onClose();
    };
    window.addEventListener('forceCloseCart', handleForceClose);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
      window.removeEventListener('forceCloseCart', handleForceClose);
    };
  }, [isModal, onClose]);

  useEffect(() => {
    if (isModal) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px';
      const rootEl = document.getElementById('root');
      if (rootEl) rootEl.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = 'unset';
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
      const rootEl = document.getElementById('root');
      if (rootEl) rootEl.style.overflow = 'unset';
    }
    return () => {
      document.documentElement.style.overflow = 'unset';
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
      const rootEl = document.getElementById('root');
      if (rootEl) rootEl.style.overflow = 'unset';
    };
  }, [isModal]);

  const [toastMessage, setToastMessage] = useState('');

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
    setToastMessage(language === 'ar' ? 'تم حذف المنتج من السلة 🗑️' : 'Item removed from cart 🗑️');
    setTimeout(() => setToastMessage(''), 2000);
  };

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    street: '',
    building: '',
    floor: '',
    notes: '',
    paymentMethod: 'cash'
  });
  const [status, setStatus] = useState({ type: '', message: '' });

  const EmptyCartView = () => (
    <div className="container" style={{ padding: '8rem 0', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <ShoppingBag size={80} color="var(--text-secondary)" style={{ opacity: 0.5, marginBottom: '2rem' }} />
      <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
        {language === 'ar' ? 'سلة الطلبات فارغة' : 'Your Cart is Empty'}
      </h2>
      <p style={{ marginBottom: '2.5rem', color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
        {language === 'ar' ? 'لم تضف أي عناصر إلى طلبك بعد.' : "Looks like you haven't added anything to your order yet."}
      </p>
      <button onClick={() => { 
        if (isModal && onClose) onClose(); 
        navigate('/menu'); 
      }} className="btn-primary" style={{ padding: '1rem 3rem', borderRadius: '50px' }}>
        {language === 'ar' ? 'استكشف القائمة' : 'Explore Menu'}
      </button>
    </div>
  );

  const CheckoutContent = (
    <div className="fade-in">
      {/* Header */}
      <div style={{ backgroundColor: 'var(--card-bg)', padding: isModal ? '2rem 0' : '8rem 0 3rem', borderBottom: '1px solid var(--border-color)', position: 'relative' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', marginBottom: '1rem' }}>
            {language === 'ar' ? 'الدفع الآمن' : 'Secure Checkout'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
            {language === 'ar' ? 'أكمل طلب التوصيل الخاص بك.' : 'Complete your delivery order.'}
          </p>
        </div>
      </div>

      <section className="section container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '3rem', padding: '3rem 0' }}>

        {/* Order Summary */}
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <ShoppingBag size={28} color="var(--gold)" />
            {language === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
          </h2>
          <div style={{ backgroundColor: 'var(--card-bg)', padding: '2.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            {(cart || []).map((item, idx) => {
              if (!item) return null;
              return (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.2rem', marginBottom: '0.3rem' }}>{item?.name || 'Unknown Item'}</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginBottom: '0.5rem' }}>
                    {item?.selectedSpiciness && (
                      <span style={{ color: item.selectedSpiciness === 'حار' ? 'var(--brand-red)' : 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        🌶️ {language === 'ar' ? `الطعم: ${item.selectedSpiciness}` : `Spiciness: ${item.selectedSpiciness}`}
                      </span>
                    )}
                    {Array.isArray(item?.selectedSauces) && item.selectedSauces.length > 0 && (
                      <div style={{ color: 'var(--gold)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column' }}>
                        <span>🧄 {language === 'ar' ? `الصوصات: ${item.selectedSauces.join('، ')}` : `Sauces: ${item.selectedSauces.join(', ')}`}</span>
                        {(item?.extraSaucePrice || 0) > 0 && (
                          <span style={{ color: 'var(--brand-red)', marginTop: '0.2rem' }}>
                            {language === 'ar' ? `إضافات: صوص إضافي (+${item.extraSaucePrice} ج.م)` : `Additions: Extra Sauce (+${item.extraSaucePrice} EGP)`}
                          </span>
                        )}
                      </div>
                    )}
                    {Array.isArray(item?.addOns) && item.addOns.length > 0 && (
                      <div style={{ marginTop: '0.3rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        {item.addOns.map((addon, idx) => (
                          <span key={idx} style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            + {language === 'ar' ? addon?.name_ar : addon?.name_en} — {addon?.price || 0} {language === 'ar' ? 'ج.م' : 'EGP'}
                          </span>
                        ))}
                      </div>
                    )}
                    {item?.specialNote && (
                      <span style={{ color: 'var(--brand-red)', fontSize: '0.85rem', fontStyle: 'italic', marginTop: '0.3rem' }}>
                        📝 {language === 'ar' ? `ملاحظة: ${item.specialNote}` : `Note: ${item.specialNote}`}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button 
                        onClick={() => {
                          if ((item?.quantity || 1) <= 1) {
                            handleRemoveItem(item?.cartItemId);
                          } else {
                            updateQuantity(item?.cartItemId, (item?.quantity || 1) - 1);
                          }
                        }}
                        style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                      <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>{item?.quantity || 1}</span>
                      <button 
                        onClick={() => updateQuantity(item?.cartItemId, (item?.quantity || 1) + 1)}
                        style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                    <button 
                      onClick={() => setEditingCartItem(item)}
                      style={{ background: 'none', border: 'none', color: 'var(--brand-red)', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Edit2 size={14} /> {language === 'ar' ? 'تعديل' : 'Edit'}
                    </button>
                    <button 
                      onClick={() => handleRemoveItem(item?.cartItemId)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-red)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                    >
                      <Trash2 size={14} /> {language === 'ar' ? 'حذف' : 'Remove'}
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                  {(() => {
                    const basePriceVal = parseInt(item?.price?.toString().match(/(\d+)/)?.[0] || 0);
                    const extras = item?.extraSaucePrice || 0;
                    const addOnsTotal = (Array.isArray(item?.addOns) ? item.addOns : []).reduce((sum, addOn) => sum + (Number(addOn?.price) || 0), 0);
                    const qty = item?.quantity || 1;
                    const total = (basePriceVal + extras + addOnsTotal) * qty;
                    
                    return (
                      <>
                        <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--gold)' }}>
                          {language === 'ar' ? `${total} ج.م` : `${total} EGP`}
                        </div>
                        {(extras > 0 || addOnsTotal > 0 || qty > 1) && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.3rem', direction: 'ltr' }}>
                            {(extras > 0 || addOnsTotal > 0) 
                              ? `(${basePriceVal} + ${extras + addOnsTotal}) × ${qty}` 
                              : `${basePriceVal} × ${qty}`}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            )})}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', fontSize: '1.5rem', fontWeight: '900', paddingTop: '1rem', borderTop: '2px dashed var(--border-color)' }}>
              <span>{language === 'ar' ? 'الإجمالي:' : 'Total:'}</span>
              <span style={{ color: 'var(--brand-red)' }}>{cartTotal} {language === 'ar' ? 'جنيه' : 'EGP'}</span>
            </div>
          </div>
        </div>

        {/* Cross-Sell / Suggested Products Section */}
        {crossSellItems.length > 0 && (
          <div style={{ backgroundColor: 'var(--card-bg)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--gold)' }}>
                {language === 'ar' ? '🍟 إضافات' : '🍟 Add-ons / Extras'}
              </h3>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowCrossSell(!showCrossSell);
                }}
                style={{ 
                  background: showCrossSell ? 'rgba(255,255,255,0.1)' : 'var(--gold)', 
                  border: 'none', 
                  color: showCrossSell ? '#fff' : '#000', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '0.5rem', 
                  fontSize: '0.9rem',
                  padding: '0.5rem 0.8rem',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease',
                  zIndex: 10
                }}
              >
                {showCrossSell 
                  ? <><X size={20} /> {language === 'ar' ? 'إخفاء' : 'Hide'}</>
                  : (language === 'ar' ? 'إظهار الإضافات' : 'Show Add-ons')}
              </button>
            </div>
            <div 
              style={{ 
                maxHeight: showCrossSell ? '800px' : '0px', 
                opacity: showCrossSell ? 1 : 0, 
                overflow: 'hidden', 
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <div style={{ display: 'flex', overflowX: 'auto', gap: '1rem', paddingBottom: '1rem', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
                  {crossSellItems.map(item => (
                    <div key={item.id} style={{ minWidth: '220px', flexShrink: 0, padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.8rem', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                      {item.img && <img src={item.img} alt={item.name_en} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />}
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 0.4rem', fontSize: '1rem', color: 'var(--text-primary)' }}>
                          {language === 'ar' ? item.name_ar : item.name_en}
                        </h4>
                        <div style={{ color: 'var(--brand-red)', fontWeight: 'bold' }}>
                          {typeof item.price === 'object' ? Math.min(...Object.values(item.price)) : item.price} {language === 'ar' ? 'ج.م' : 'EGP'}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleAddSuggestion(item)}
                        style={{ 
                          backgroundColor: addedSuggestions[item.id] ? '#4CAF50' : 'var(--gold)', 
                          color: addedSuggestions[item.id] ? '#fff' : '#000', 
                          border: 'none', padding: '0.6rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s ease' 
                        }}
                        onMouseEnter={e => !addedSuggestions[item.id] && (e.currentTarget.style.backgroundColor = '#d4a331')}
                        onMouseLeave={e => !addedSuggestions[item.id] && (e.currentTarget.style.backgroundColor = 'var(--gold)')}
                      >
                        {addedSuggestions[item.id] ? (language === 'ar' ? '✓ تم الإضافة' : '✓ Added') : (language === 'ar' ? '+ إضافة للسلة' : '+ Add to Cart')}
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                  <button 
                    type="button"
                    onClick={() => setShowRecModal(true)}
                    style={{
                      background: 'none', border: '1px solid var(--gold)', color: 'var(--gold)',
                      padding: '0.8rem 1.5rem', borderRadius: '25px', fontWeight: 'bold',
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = 'var(--gold)';
                      e.currentTarget.style.color = '#000';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--gold)';
                    }}
                  >
                    {language === 'ar' ? 'عرض مقترحات أخرى ➔' : 'Show more recommendations ➔'}
                  </button>
                </div>
            </div>
          </div>
        )}

        {/* Checkout Form */}
        <div>
          <CheckoutForm
            formData={formData}
            setFormData={setFormData}
            cart={cart}
            cartTotal={cartTotal}
            status={status}
            setStatus={setStatus}
            clearCart={clearCart}
            navigate={navigate}
            language={language}
            onClose={onClose}
          />
        </div>
      </section>

      {editingCartItem && (
        <ProductModal 
          item={editingCartItem}
          categoriesData={[]} 
          isEditMode={true}
          maxFreeSauces={maxFreeSauces}
          onClose={() => setEditingCartItem(null)}
          onSave={(updatedItem, qty) => {
            updateCartItem(editingCartItem.cartItemId, { ...updatedItem, quantity: qty });
            setEditingCartItem(null);
          }}
          isEditMode={true}
        />
      )}
    </div>
  );

  if (isModal) {
    return (
      <div 
        onClick={onClose}
        onWheel={(e) => e.preventDefault()}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          backgroundColor: 'rgba(0,0,0,0.7)', 
          backdropFilter: 'blur(4px)',
          display: 'flex', 
          justifyContent: language === 'ar' ? 'flex-start' : 'flex-end',
          animation: 'fadeIn 0.3s ease',
          touchAction: 'none'
        }}>
        <div 
          onClick={e => e.stopPropagation()}
          className="cart-scroll-container overscroll-contain"
          style={{
            backgroundColor: 'var(--bg-color)', 
            width: '100%', 
            maxWidth: '600px', 
            height: '100%',
            overflowY: 'auto',
            animation: language === 'ar' ? 'slideInLeft 0.35s cubic-bezier(0.4,0,0.2,1)' : 'slideInRight 0.35s cubic-bezier(0.4,0,0.2,1)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}>
          
          {/* Universal Drawer Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', position: 'sticky', top: 0, zIndex: 10 }}>
            <h2 style={{ margin: 0, color: 'var(--gold)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingBag size={24} />
              {language === 'ar' ? 'سلة الطلبات' : 'Your Cart'}
            </h2>
            <button onClick={onClose} style={{
              background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--brand-red)', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <X size={24} />
            </button>
          </div>

          <div style={{ flex: 1 }}>
            {(cart?.length || 0) === 0 && status?.type !== 'success' ? <EmptyCartView /> : CheckoutContent}
          </div>
        </div>
        
        {/* Toast Notification */}
        {toastMessage && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: 'var(--brand-red)',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '8px',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 10000,
            animation: 'toastSlideIn 0.3s cubic-bezier(0.4,0,0.2,1)'
          }}>
            {toastMessage}
          </div>
        )}

        {/* Receipt Template moved to CheckoutForm */}
        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
          }
          @keyframes slideInLeft {
            from { transform: translateX(-100%); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
          }
          @keyframes toastSlideIn {
            from { transform: translateX(100%); opacity: 0; }
            to   { transform: translateX(0); opacity: 1; }
          }
        `}</style>
        
        {showRecModal && (
          <RecommendationsModal onClose={() => setShowRecModal(false)} />
        )}
      </div>
    );
  }

  return cart?.length === 0 && status?.type !== 'success' ? <EmptyCartView /> : CheckoutContent;
}

export default function Checkout(props) {
  return (
    <CheckoutErrorBoundary>
      <CheckoutInternal {...props} />
    </CheckoutErrorBoundary>
  );
}
