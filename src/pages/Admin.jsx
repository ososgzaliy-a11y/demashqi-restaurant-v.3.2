import React, { useState, useEffect } from 'react';
import { Lock, ShoppingBag, Calendar, MessageSquare, RefreshCw, CheckCircle, Clock, Truck, XCircle, AlertCircle } from 'lucide-react';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'reservations', 'contacts'
  const [data, setData] = useState({ orders: [], reservations: [], contacts: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch(`http://${window.location.hostname}:3000/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const resData = await response.json();
      if (response.ok && resData.success) {
        setIsAuthenticated(true);
        fetchData();
      } else {
        setError(resData.error || 'Invalid admin password');
      }
    } catch (err) {
      setError('Failed to connect to backend server');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, resvRes, contactsRes] = await Promise.all([
        fetch(`http://${window.location.hostname}:3000/api/admin/orders`),
        fetch(`http://${window.location.hostname}:3000/api/admin/reservations`),
        fetch(`http://${window.location.hostname}:3000/api/admin/contacts`)
      ]);

      const orders = ordersRes.ok ? await ordersRes.json() : [];
      const reservations = resvRes.ok ? await resvRes.json() : [];
      const contacts = contactsRes.ok ? await contactsRes.json() : [];

      setData({ orders, reservations, contacts });
    } catch (err) {
      console.error('Error fetching admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://${window.location.hostname}:3000/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        setData(prev => ({
          ...prev,
          orders: prev.orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
        }));
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '10rem 0 5rem', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="scale-in" style={{ backgroundColor: 'var(--card-bg)', padding: '3rem', borderRadius: '16px', border: '1px solid var(--border-color)', maxWidth: '450px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '60px', height: '60px', backgroundColor: 'rgba(200, 16, 46, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Lock size={32} color="var(--brand-red)" />
            </div>
            <h2 style={{ fontSize: '2rem', color: 'var(--gold)' }}>Admin Portal</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Enter password to access dashboard</p>
          </div>

          {error && (
            <div style={{ padding: '0.8rem', backgroundColor: 'rgba(200,16,46,0.1)', border: '1px solid var(--brand-red)', color: 'var(--brand-red)', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.95rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <input
              type="password"
              placeholder="Enter Admin Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: '#fff', fontSize: '1rem' }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '1rem', borderRadius: '8px' }}>
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <header className="page-header" style={{ padding: '6rem 0 2rem' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem' }}>Admin Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Manage live orders, table reservations, and customer feedback</p>
          </div>
          <button onClick={fetchData} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', fontSize: '0.95rem' }}>
            <RefreshCw size={18} className={loading ? 'spin' : ''} /> Refresh Data
          </button>
        </div>
      </header>

      <section className="section container">
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', overflowX: 'auto' }}>
          <button
            onClick={() => setActiveTab('orders')}
            style={{ padding: '0.8rem 1.5rem', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'orders' ? 'var(--brand-red)' : 'transparent', color: activeTab === 'orders' ? 'var(--gold)' : 'var(--text-secondary)', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.3s ease' }}
          >
            <ShoppingBag size={20} /> Orders ({data.orders.length})
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            style={{ padding: '0.8rem 1.5rem', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'reservations' ? 'var(--brand-red)' : 'transparent', color: activeTab === 'reservations' ? 'var(--gold)' : 'var(--text-secondary)', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.3s ease' }}
          >
            <Calendar size={20} /> Reservations ({data.reservations.length})
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            style={{ padding: '0.8rem 1.5rem', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'contacts' ? 'var(--brand-red)' : 'transparent', color: activeTab === 'contacts' ? 'var(--gold)' : 'var(--text-secondary)', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.3s ease' }}
          >
            <MessageSquare size={20} /> Messages ({data.contacts.length})
          </button>
        </div>

        {/* Tab 1: Orders */}
        {activeTab === 'orders' && (
          <div>
            {data.orders.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '3rem' }}>No orders found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {data.orders.map(order => (
                  <div key={order.id} className="premium-card" style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                      <div>
                        <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--gold)' }}>Order #{order.id}</span>
                        <span style={{ marginLeft: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                          {new Date(order.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Status:</span>
                        <select
                          value={order.status || 'pending'}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          style={{ padding: '0.5rem 1rem', borderRadius: '6px', backgroundColor: 'var(--bg-color)', color: 'var(--gold)', border: '1px solid var(--border-color)', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="preparing">Preparing</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                      <div>
                        <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Customer & Address</h4>
                        <p style={{ margin: 0, fontWeight: '600' }}>{order.address}</p>
                        <p style={{ margin: '0.5rem 0 0', color: 'var(--gold)', fontSize: '0.9rem' }}>Payment: {order.paymentMethod === 'vodafone_cash' ? 'Vodafone Cash' : 'Cash on Delivery'}</p>
                      </div>

                      <div>
                        <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Items Ordered</h4>
                        <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                          {Array.isArray(order.items) && order.items.map((item, i) => (
                            <li key={i} style={{ marginBottom: '0.3rem' }}>
                              {item.quantity}x {item.name} ({item.price})
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Total Amount</span>
                        <span style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--brand-red)' }}>{order.total} EGP</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Reservations */}
        {activeTab === 'reservations' && (
          <div>
            {data.reservations.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '3rem' }}>No reservations found.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {data.reservations.map(res => (
                  <div key={res.id} className="premium-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--gold)', fontWeight: 'bold' }}>
                      <span>Reservation #{res.id}</span>
                      <span>{res.guests} Guests</span>
                    </div>
                    <h3 style={{ fontSize: '1.3rem', margin: '0 0 0.5rem', color: '#fff' }}>{res.name}</h3>
                    <p style={{ color: 'var(--text-secondary)', margin: '0 0 1rem', fontSize: '0.95rem' }}>{res.email}</p>
                    <div style={{ display: 'flex', gap: '1rem', backgroundColor: 'var(--bg-color)', padding: '0.8rem', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--brand-red)' }}>
                      <span>Date: {res.date}</span>
                      <span>Time: {res.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Contacts */}
        {activeTab === 'contacts' && (
          <div>
            {data.contacts.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '3rem' }}>No messages found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {data.contacts.map(msg => (
                  <div key={msg.id} className="premium-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <h4 style={{ margin: 0, color: 'var(--gold)', fontSize: '1.2rem' }}>{msg.name} ({msg.email})</h4>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{new Date(msg.created_at).toLocaleString()}</span>
                    </div>
                    <p style={{ whiteSpace: 'pre-line', color: 'var(--text-primary)', marginTop: '1rem', backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: '8px' }}>
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
