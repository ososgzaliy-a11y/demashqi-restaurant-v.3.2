import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { CreditCard, ShoppingBag, Smartphone, CheckCircle, Navigation, Banknote, AlertTriangle, X, Edit2, Trash2 } from 'lucide-react';
import ProductModal from '../components/ProductModal';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, countdown, title, message, confirmText, cancelText }) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
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
};

function CheckoutForm({ formData, setFormData, cart, cartTotal, status, setStatus, clearCart, navigate, language }) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmCountdown, setConfirmCountdown] = useState(5);

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
    if (cart.length === 0) return;

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

  const proceedCheckout = async () => {
    setShowConfirmModal(false);
    setStatus({ type: 'loading', message: t.processing });
    let addressParts = [formData.street];
    if (formData.building) addressParts.push(`${language === 'ar' ? 'مبنى' : 'Building'} ${formData.building}`);
    if (formData.floor) addressParts.push(`${language === 'ar' ? 'طابق' : 'Floor'} ${formData.floor}`);
    const addressStr = addressParts.join(', ');

    const today = new Date().toISOString().split('T')[0];
    let lastDate = localStorage.getItem('lastOrderDate');
    let dailyCounter = parseInt(localStorage.getItem('dailyOrderCounter') || '0', 10);
    
    if (lastDate !== today) {
      dailyCounter = 1;
      localStorage.setItem('lastOrderDate', today);
    } else {
      dailyCounter += 1;
    }
    localStorage.setItem('dailyOrderCounter', dailyCounter.toString());
    const dailyOrderId = dailyCounter;

    try {
      const response = await fetch(`http://${window.location.hostname}:3000/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          total: cartTotal,
          address: addressStr,
          phone: formData.phone,
          notes: formData.notes,
          paymentMethod: formData.paymentMethod,
          daily_id: dailyOrderId
        })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: 'success',
          orderId: data.id,
          message: language === 'ar' ? `تم تأكيد الطلب #${data.id} بنجاح!` : `Order #${data.id} placed securely!`
        });
        clearCart();
      } else {
        setStatus({ type: 'error', message: data.error?.[0]?.message || (language === 'ar' ? 'فشل في إرسال الطلب.' : 'Failed to place order.') });
      }
    } catch (err) {
      console.error('Checkout failed', err);
      setStatus({ type: 'error', message: t.networkError });
    }
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
            <label htmlFor="street" style={labelStyle}>{t.street}</label>
            <input type="text" id="street" name="street" value={formData.street || ''} onChange={handleChange} required placeholder={t.streetPH} style={inputStyle} />
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

        <div className="responsive-flex" style={{ marginBottom: '2rem' }}>
          <label style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1.5rem', cursor: 'pointer', borderRadius: '8px', border: `2px solid ${formData.paymentMethod === 'vodafone_cash' ? 'var(--brand-red)' : 'var(--border-color)'}`, backgroundColor: formData.paymentMethod === 'vodafone_cash' ? 'rgba(200, 16, 46, 0.05)' : 'var(--bg-color)', transition: 'all 0.3s ease' }}>
            <input type="radio" name="paymentMethod" value="vodafone_cash" checked={formData.paymentMethod === 'vodafone_cash'} onChange={handleChange} style={{ display: 'none' }} />
            <Smartphone size={32} color={formData.paymentMethod === 'vodafone_cash' ? 'var(--brand-red)' : 'var(--text-secondary)'} />
            <span style={{ fontWeight: 'bold', color: formData.paymentMethod === 'vodafone_cash' ? 'var(--brand-red)' : 'var(--text-secondary)' }}>{t.vodafoneCash}</span>
          </label>
          <label style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1.5rem', cursor: 'pointer', borderRadius: '8px', border: `2px solid ${formData.paymentMethod === 'cash' ? 'var(--gold)' : 'var(--border-color)'}`, backgroundColor: formData.paymentMethod === 'cash' ? 'rgba(255, 215, 0, 0.05)' : 'var(--bg-color)', transition: 'all 0.3s ease' }}>
            <input type="radio" name="paymentMethod" value="cash" checked={formData.paymentMethod === 'cash'} onChange={handleChange} style={{ display: 'none' }} />
            <Banknote size={32} color={formData.paymentMethod === 'cash' ? 'var(--gold)' : 'var(--text-secondary)'} />
            <span style={{ fontWeight: 'bold', color: formData.paymentMethod === 'cash' ? 'var(--gold)' : 'var(--text-secondary)' }}>{t.anyCash}</span>
          </label>
        </div>

        {formData.paymentMethod === 'vodafone_cash' && (
          <div className="fade-in" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px dashed var(--brand-red)', color: 'var(--text-secondary)', textAlign: 'center' }}>
            {t.vodafoneNote}
          </div>
        )}

        {formData.paymentMethod === 'cash' && (
          <div className="fade-in" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px dashed var(--gold)', color: 'var(--text-secondary)', textAlign: 'center' }}>
            {t.cashNote}
          </div>
        )}
      </div>

      {status.type !== 'success' && (
        <button type="submit" className="btn-primary" style={{ padding: '1.5rem', fontSize: '1.2rem', borderRadius: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.8rem', marginTop: '1rem' }} disabled={status.type === 'loading'}>
          {status.type === 'loading' ? t.processing : t.confirmBtn}
        </button>
      )}

      {status.type === 'error' && (
        <div className="scale-in" style={{ padding: '1.5rem', marginTop: '1rem', borderRadius: '8px', backgroundColor: 'rgba(200, 16, 46, 0.1)', color: 'var(--brand-red)', border: '1px solid var(--brand-red)', textAlign: 'center', fontWeight: 'bold' }}>
          <div>{status.message}</div>
        </div>
      )}

      {status.type === 'success' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', overflowY: 'auto', padding: '1rem' }}>
          <div className="scale-in" style={{ backgroundColor: 'var(--card-bg)', padding: '3rem 2rem', borderRadius: '16px', border: '1px solid #2ecc71', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', position: 'relative', margin: 'auto' }}>
            <button
              type="button"
              onClick={() => {
                document.body.style.overflow = 'unset';
                if (onClose) onClose();
                clearCart();
                if (setStatus) setStatus({ type: '', message: '' });
                navigate('/menu');
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
                    if (onClose) onClose();
                    navigate(`/track?id=${status.orderId}`);
                  }}
                  className="btn-primary"
                  style={{ padding: '1rem 2rem', borderRadius: '50px', fontSize: '1.1rem', width: '100%', backgroundColor: '#2ecc71', border: 'none', cursor: 'pointer' }}
                >
                  {t.trackOrder(status.orderId)}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  document.body.style.overflow = 'unset';
                  if (onClose) onClose();
                  clearCart();
                  if (setStatus) setStatus({ type: '', message: '' });
                  navigate('/menu');
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
      )}

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

export default function Checkout({ isModal = false, onClose }) {
  const { cart, cartTotal, clearCart, updateQuantity, updateCartItem, removeFromCart } = useCart();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [editingCartItem, setEditingCartItem] = useState(null);
  const [availableSauces, setAvailableSauces] = useState([]);
  const [maxFreeSauces, setMaxFreeSauces] = useState(2);

  useEffect(() => {
    try {
      const savedSauces = localStorage.getItem('availableSauces');
      if (savedSauces) setAvailableSauces(JSON.parse(savedSauces).filter(s => s.is_available));
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
    return () => window.removeEventListener('keydown', handleEsc);
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
    paymentMethod: 'vodafone_cash'
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
            {cart.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.2rem', marginBottom: '0.3rem' }}>{item.name}</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginBottom: '0.5rem' }}>
                    {item.selectedSpiciness && (
                      <span style={{ color: item.selectedSpiciness === 'حار' ? 'var(--brand-red)' : 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        🌶️ {language === 'ar' ? `الطعم: ${item.selectedSpiciness}` : `Spiciness: ${item.selectedSpiciness}`}
                      </span>
                    )}
                    {item.selectedSauces && item.selectedSauces.length > 0 && (
                      <div style={{ color: 'var(--gold)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column' }}>
                        <span>🧄 {language === 'ar' ? `الصوصات: ${item.selectedSauces.join('، ')}` : `Sauces: ${item.selectedSauces.join(', ')}`}</span>
                        {item.extraSaucePrice > 0 && (
                          <span style={{ color: 'var(--brand-red)', marginTop: '0.2rem' }}>
                            {language === 'ar' ? `إضافات: صوص إضافي (+${item.extraSaucePrice} ج.م)` : `Additions: Extra Sauce (+${item.extraSaucePrice} EGP)`}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button 
                        onClick={() => {
                          if (item.quantity <= 1) {
                            handleRemoveItem(item.cartItemId);
                          } else {
                            updateQuantity(item.cartItemId, item.quantity - 1);
                          }
                        }}
                        style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                      <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                    <button 
                      onClick={() => setEditingCartItem(item)}
                      style={{ background: 'none', border: 'none', color: 'var(--brand-red)', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Edit2 size={14} /> {language === 'ar' ? 'تعديل' : 'Edit'}
                    </button>
                    <button 
                      onClick={() => handleRemoveItem(item.cartItemId)}
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
                    const basePriceVal = parseInt(item.price?.toString().match(/(\d+)/)?.[0] || 0);
                    const extras = item.extraSaucePrice || 0;
                    const total = (basePriceVal + extras) * item.quantity;
                    
                    return (
                      <>
                        <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--gold)' }}>
                          {language === 'ar' ? `${total} ج.م` : `${total} EGP`}
                        </div>
                        {(extras > 0 || item.quantity > 1) && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.3rem', direction: 'ltr' }}>
                            {extras > 0 
                              ? `(${basePriceVal} + ${extras}) × ${item.quantity}` 
                              : `${basePriceVal} × ${item.quantity}`}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', fontSize: '1.5rem', fontWeight: '900', paddingTop: '1rem', borderTop: '2px dashed var(--border-color)' }}>
              <span>{language === 'ar' ? 'الإجمالي:' : 'Total:'}</span>
              <span style={{ color: 'var(--brand-red)' }}>{cartTotal} {language === 'ar' ? 'جنيه' : 'EGP'}</span>
            </div>
          </div>
        </div>

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
          availableSauces={availableSauces}
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
            {cart.length === 0 && status.type !== 'success' ? <EmptyCartView /> : CheckoutContent}
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
      </div>
    );
  }

  return cart.length === 0 && status.type !== 'success' ? <EmptyCartView /> : CheckoutContent;
}
