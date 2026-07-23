import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ShoppingBag, Smartphone, CheckCircle, Navigation, Banknote } from 'lucide-react';

function CheckoutForm({ formData, setFormData, cart, cartTotal, status, setStatus, clearCart, navigate }) {
  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setStatus({ type: 'loading', message: 'Processing your order...' });
    const addressStr = `${formData.street}, Building ${formData.building}, Floor ${formData.floor}`;

    try {
      const response = await fetch(`http://${window.location.hostname}:3000/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          total: cartTotal,
          address: addressStr,
          paymentMethod: formData.paymentMethod
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus({
          type: 'success',
          orderId: data.id,
          message: `Order #${data.id} placed securely!`
        });
        clearCart();
      } else {
        setStatus({ type: 'error', message: data.error?.[0]?.message || 'Failed to place order.' });
      }
    } catch (err) {
      console.error('Checkout failed', err);
      setStatus({ type: 'error', message: 'Network error. Please try again later.' });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* 1. Delivery Details */}
      <div style={{ padding: '2rem', backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--gold)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
          <Navigation size={24} /> 1. Delivery Details
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="name" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name</label>
            <input type="text" id="name" name="name" value={formData.name || ''} onChange={handleChange} required placeholder="Ahmed Ali" style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '1.1rem' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="street" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Street Address</label>
            <input type="text" id="street" name="street" value={formData.street || ''} onChange={handleChange} required placeholder="e.g. Al Sadd St" style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '1.1rem' }} />
          </div>

          <div className="responsive-grid-2">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="building" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Building</label>
              <input type="text" id="building" name="building" value={formData.building || ''} onChange={handleChange} required style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '1.1rem' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="floor" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Floor / Apt</label>
              <input type="text" id="floor" name="floor" value={formData.floor || ''} onChange={handleChange} required style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '1.1rem' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Payment Details */}
      <div style={{ padding: '2rem', backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--gold)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
          <CreditCard size={24} /> 2. Payment Method
        </h3>

        <div className="responsive-flex" style={{ marginBottom: '2rem' }}>
          <label style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1.5rem', cursor: 'pointer', borderRadius: '8px', border: `2px solid ${formData.paymentMethod === 'vodafone_cash' ? 'var(--brand-red)' : 'var(--border-color)'}`, backgroundColor: formData.paymentMethod === 'vodafone_cash' ? 'rgba(200, 16, 46, 0.05)' : 'var(--bg-color)', transition: 'all 0.3s ease' }}>
            <input type="radio" name="paymentMethod" value="vodafone_cash" checked={formData.paymentMethod === 'vodafone_cash'} onChange={handleChange} style={{ display: 'none' }} />
            <Smartphone size={32} color={formData.paymentMethod === 'vodafone_cash' ? 'var(--brand-red)' : 'var(--text-secondary)'} />
            <span style={{ fontWeight: 'bold', color: formData.paymentMethod === 'vodafone_cash' ? 'var(--brand-red)' : 'var(--text-secondary)' }}>Vodafone Cash</span>
          </label>
          <label style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1.5rem', cursor: 'pointer', borderRadius: '8px', border: `2px solid ${formData.paymentMethod === 'cash' ? 'var(--gold)' : 'var(--border-color)'}`, backgroundColor: formData.paymentMethod === 'cash' ? 'rgba(255, 215, 0, 0.05)' : 'var(--bg-color)', transition: 'all 0.3s ease' }}>
            <input type="radio" name="paymentMethod" value="cash" checked={formData.paymentMethod === 'cash'} onChange={handleChange} style={{ display: 'none' }} />
            <Banknote size={32} color={formData.paymentMethod === 'cash' ? 'var(--gold)' : 'var(--text-secondary)'} />
            <span style={{ fontWeight: 'bold', color: formData.paymentMethod === 'cash' ? 'var(--gold)' : 'var(--text-secondary)' }}>Any Cash</span>
          </label>
        </div>

        {formData.paymentMethod === 'vodafone_cash' && (
          <div className="fade-in" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px dashed var(--brand-red)', color: 'var(--text-secondary)', textAlign: 'center' }}>
            A representative will contact you via Vodafone Cash on delivery.
          </div>
        )}

        {formData.paymentMethod === 'cash' && (
          <div className="fade-in" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px dashed var(--gold)', color: 'var(--text-secondary)', textAlign: 'center' }}>
            You will pay in cash upon delivery.
          </div>
        )}
      </div>



      <button type="submit" className="btn-primary" style={{ padding: '1.5rem', fontSize: '1.2rem', borderRadius: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.8rem', marginTop: '1rem' }} disabled={status.type === 'loading'}>
        {status.type === 'loading' ? 'Processing...' : (
          <>Confirm Order & Pay {cartTotal} EGP</>
        )}
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
              Track Order #{status.orderId}
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

  const [formData, setFormData] = useState({
    name: '',
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
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Your Cart is Empty</h2>
        <p style={{ marginBottom: '2.5rem', color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Looks like you haven't added anything to your order yet.</p>
        <button onClick={() => navigate('/menu')} className="btn-primary" style={{ padding: '1rem 3rem', borderRadius: '50px' }}>Explore Menu</button>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <header className="page-header" style={{ padding: '8rem 0 3rem' }}>
        <div className="container">
          <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', marginBottom: '1rem' }}>Secure Checkout</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Complete your delivery order.</p>
        </div>
      </header>

      <section className="section container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '3rem' }}>

        {/* Left: Order Summary */}
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <ShoppingBag size={28} color="var(--gold)" /> Order Summary
          </h2>
          <div style={{ backgroundColor: 'var(--card-bg)', padding: '2.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            {cart.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.2rem', marginBottom: '0.3rem' }}>{item.name}</h4>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Qty: {item.quantity}</span>
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--gold)' }}>
                  {item.price}
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', fontSize: '1.5rem', fontWeight: '900', paddingTop: '1rem', borderTop: '2px dashed var(--border-color)' }}>
              <span>Total:</span>
              <span style={{ color: 'var(--brand-red)' }}>{cartTotal} EGP</span>
            </div>
          </div>
        </div>

        {/* Right: Checkout Form */}
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
          />
        </div>
      </section>
    </div>
  );
}
