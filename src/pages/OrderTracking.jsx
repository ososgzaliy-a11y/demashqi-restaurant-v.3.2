import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Clock, Utensils, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function OrderTracking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const orderIdParam = searchParams.get('id') || '';

  const [orderId, setOrderId] = useState(orderIdParam);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOrderStatus = async (idToFetch) => {
    if (!idToFetch) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`http://${window.location.hostname}:3000/api/orders/${idToFetch}`);
      const data = await response.json();
      if (response.ok) {
        setOrder(data);
      } else {
        setError(t('track.notFound'));
        setOrder(null);
      }
    } catch (err) {
      setError(t('track.networkError'));
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderIdParam) {
      fetchOrderStatus(orderIdParam);
    }
  }, [orderIdParam]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (orderId) {
      navigate(`/track?id=${orderId}`);
      fetchOrderStatus(orderId);
    }
  };

  const getStepIndex = (status) => {
    switch (status) {
      case 'pending': return 1;
      case 'preparing': return 2;
      case 'out_for_delivery': return 3;
      case 'delivered': return 4;
      default: return 0;
    }
  };

  const currentStep = order ? getStepIndex(order.status) : 0;

  const steps = [
    { icon: Clock, label: t('track.step.placed') },
    { icon: Utensils, label: t('track.step.preparing') },
    { icon: Truck, label: t('track.step.onway') },
    { icon: CheckCircle, label: t('track.step.delivered') },
  ];

  return (
    <div className="fade-in" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Page Header */}
      <header
        className="page-header"
        style={{ paddingTop: 'clamp(5rem, 12vw, 9rem)', paddingBottom: 'clamp(1.5rem, 4vw, 3rem)' }}
      >
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 style={{ marginBottom: '0.8rem' }}>
            {t('track.title')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.95rem, 3vw, 1.2rem)', padding: '0 1rem' }}>
            {t('track.subtitle')}
          </p>
        </div>
      </header>

      <section className="section container" style={{ maxWidth: '800px' }}>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          style={{
            display: 'flex',
            gap: '0.8rem',
            marginBottom: '2.5rem',
            flexWrap: 'wrap',
          }}
        >
          <input
            type="number"
            inputMode="numeric"
            placeholder={t('track.placeholder')}
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            style={{
              flex: '1 1 200px',
              padding: '1rem 1.5rem',
              borderRadius: '50px',
              border: '2px solid var(--border-color)',
              backgroundColor: 'var(--card-bg)',
              color: '#fff',
              fontSize: 'clamp(1rem, 3vw, 1.1rem)',
              minHeight: '48px',
              textAlign: isRTL ? 'right' : 'left',
              outline: 'none',
              transition: 'border-color 0.3s ease',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--gold)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
          />
          <button
            type="submit"
            className="btn-primary"
            style={{
              borderRadius: '50px',
              padding: '0.9rem 2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              minHeight: '48px',
              flex: '0 0 auto',
              fontSize: 'clamp(0.95rem, 3vw, 1.05rem)',
            }}
          >
            <Search size={20} />
            {t('track.btn')}
          </button>
        </form>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gold)', fontSize: '1.1rem' }}>
            {t('track.checking')}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div
            className="scale-in"
            style={{
              padding: '1.5rem',
              backgroundColor: 'rgba(200,16,46,0.08)',
              border: '1px solid var(--brand-red)',
              borderRadius: '12px',
              color: 'var(--brand-red)',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: 'clamp(0.95rem, 3vw, 1.1rem)',
            }}
          >
            <AlertCircle size={32} style={{ margin: '0 auto 0.7rem', display: 'block' }} />
            {error}
          </div>
        )}

        {/* Order Card */}
        {order && !loading && (
          <div className="scale-in premium-card" style={{ padding: 'clamp(1.2rem, 4vw, 2.5rem)' }}>

            {/* Order Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1rem',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '1.5rem',
                marginBottom: '2rem',
              }}
            >
              <div>
                <h2 style={{ fontSize: 'clamp(1.4rem, 5vw, 1.8rem)', color: 'var(--gold)', margin: 0 }}>
                  {t('track.orderNum')}{order.id}
                </h2>
                <span style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.8rem, 2.5vw, 0.95rem)', display: 'block', marginTop: '0.3rem' }}>
                  {t('track.placedOn')}{' '}{new Date(order.created_at).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                </span>
              </div>
              <div style={{ textAlign: isRTL ? 'left' : 'right' }}>
                <span style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 'bold', color: 'var(--brand-red)', display: 'block' }}>
                  {order.total} {language === 'ar' ? 'ج.م' : 'EGP'}
                </span>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'clamp(0.78rem, 2vw, 0.9rem)', marginTop: '0.2rem' }}>
                  {order.paymentMethod === 'vodafone_cash' ? t('track.payment.vodafone') : t('track.payment.cash')}
                </p>
              </div>
            </div>

            {/* Progress Stepper */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                position: 'relative',
                margin: 'clamp(1.5rem, 4vw, 3rem) 0',
                gap: '0.5rem',
              }}
            >
              {/* Progress Line */}
              <div
                style={{
                  position: 'absolute',
                  top: '24px',
                  [isRTL ? 'right' : 'left']: '10%',
                  width: '80%',
                  height: '4px',
                  backgroundColor: 'var(--border-color)',
                  zIndex: 1,
                }}
              >
                <div
                  style={{
                    height: '100%',
                    backgroundColor: 'var(--brand-red)',
                    width: `${((currentStep - 1) / 3) * 100}%`,
                    transition: 'width 0.6s ease',
                    // RTL: progress goes from right
                    ...(isRTL && { marginLeft: 'auto' }),
                  }}
                />
              </div>

              {/* Steps */}
              {steps.map((step, index) => {
                const stepNum = index + 1;
                const isActive = currentStep >= stepNum;
                const Icon = step.icon;
                return (
                  <div
                    key={index}
                    style={{
                      zIndex: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      flex: 1,
                      gap: '0.6rem',
                    }}
                  >
                    <div
                      style={{
                        width: 'clamp(40px, 10vw, 52px)',
                        height: 'clamp(40px, 10vw, 52px)',
                        borderRadius: '50%',
                        backgroundColor: isActive ? 'var(--brand-red)' : 'var(--card-bg)',
                        border: `2px solid ${isActive ? 'var(--brand-red)' : 'var(--border-color)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isActive ? '#fff' : 'var(--text-secondary)',
                        transition: 'all 0.4s ease',
                        boxShadow: isActive ? '0 0 12px rgba(200,16,46,0.35)' : 'none',
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <span
                      style={{
                        fontWeight: 'bold',
                        color: isActive ? 'var(--gold)' : 'var(--text-secondary)',
                        fontSize: 'clamp(0.68rem, 2vw, 0.9rem)',
                        textAlign: 'center',
                        lineHeight: 1.3,
                        transition: 'color 0.4s ease',
                        maxWidth: '70px',
                        wordBreak: 'break-word',
                      }}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Delivery Address */}
            <div
              style={{
                marginTop: '1.5rem',
                backgroundColor: 'var(--bg-color)',
                padding: 'clamp(0.9rem, 3vw, 1.2rem)',
                borderRadius: '8px',
                color: 'var(--text-secondary)',
                fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                borderLeft: isRTL ? 'none' : '3px solid var(--brand-red)',
                borderRight: isRTL ? '3px solid var(--brand-red)' : 'none',
              }}
            >
              <strong style={{ color: 'var(--text-primary)' }}>{t('track.address')}: </strong>
              {order.address}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
