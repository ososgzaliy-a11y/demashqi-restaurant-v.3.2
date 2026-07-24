import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { CreditCard, ShoppingBag, Smartphone, CheckCircle, Navigation, Banknote } from 'lucide-react';

function CheckoutForm({ formData, setFormData, cart, cartTotal, status, setStatus, clearCart, navigate, language }) {
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

    setStatus({ type: 'loading', message: t.processing });
    
    let addressParts = [formData.street];
    if (formData.building) addressParts.push(`${language === 'ar' ? 'مبنى' : 'Building'} ${formData.building}`);
    if (formData.floor) addressParts.push(`${language === 'ar' ? 'طابق' : 'Floor'} ${formData.floor}`);
    const addressStr = addressParts.join(', ');

    try {
      const response = await fetch(`http://${window.location.hostname}:3000/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          total: cartTotal,
          address: addressStr,
          phone: formData.phone,
          paymentMethod: formData.paymentMethod
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

      <button type="submit" className="btn-primary" style={{ padding: '1.5rem', fontSize: '1.2rem', borderRadius: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.8rem', marginTop: '1rem' }} disabled={status.type === 'loading'}>
        {status.type === 'loading' ? t.processing : t.confirmBtn}
      </button>

      {status.message && (
        <div className="scale-in" style={{ padding: '1.5rem', marginTop: '1rem', borderRadius: '8px', backgroundColor: status.type === 'success' ? 'rgba(46, 204, 113, 0.1)' : 'rgba(200, 16, 46, 0.1)', color: status.type === 'success' ? '#2ecc71' : 'var(--brand-red)', border: `1px solid ${status.type === 'success' ? '#2ecc71' : 'var(--brand-red)'}`, textAlign: 'center', fontWeight: 'bold' }}>
          <div>{status.message}</div>
          {status.orderId && (
            <button
              type="button"
              onClick={() => navigate(`/track?id=${status.orderId}`)}
              className="btn-primary"
              style={{ marginTop: '1rem', padding: '0.8rem 1.8rem', borderRadius: '50px', fontSize: '1rem' }}
            >
              {t.trackOrder(status.orderId)}
            </button>
          )}
        </div>
      )}
    </form>
  );
}

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    street: '',
    building: '',
    floor: '',
    paymentMethod: 'vodafone_cash'
  });
  const [status, setStatus] = useState({ type: '', message: '' });

  if (cart.length === 0 && status.type !== 'success') {
    return (
      <div className="container" style={{ padding: '8rem 0', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <ShoppingBag size={80} color="var(--text-secondary)" style={{ opacity: 0.5, marginBottom: '2rem' }} />
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          {language === 'ar' ? 'سلة الطلبات فارغة' : 'Your Cart is Empty'}
        </h2>
        <p style={{ marginBottom: '2.5rem', color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
          {language === 'ar' ? 'لم تضف أي عناصر إلى طلبك بعد.' : "Looks like you haven't added anything to your order yet."}
        </p>
        <button onClick={() => navigate('/menu')} className="btn-primary" style={{ padding: '1rem 3rem', borderRadius: '50px' }}>
          {language === 'ar' ? 'استكشف القائمة' : 'Explore Menu'}
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <header className="page-header" style={{ padding: '8rem 0 3rem' }}>
        <div className="container">
          <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', marginBottom: '1rem' }}>
            {language === 'ar' ? 'الدفع الآمن' : 'Secure Checkout'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
            {language === 'ar' ? 'أكمل طلب التوصيل الخاص بك.' : 'Complete your delivery order.'}
          </p>
        </div>
      </header>

      <section className="section container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '3rem' }}>

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
                  <span style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                    {language === 'ar' ? `الكمية: ${item.quantity}` : `Qty: ${item.quantity}`}
                  </span>
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--gold)' }}>
                  {item.price}
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
          />
        </div>
      </section>
    </div>
  );
}
