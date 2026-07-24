import React, { useState, useEffect } from 'react';
import { Lock, ShoppingBag, Calendar, MessageSquare, RefreshCw, Filter, CheckCircle, AlertCircle } from 'lucide-react';

// ── Status Configuration ──────────────────────────────────────
const ORDER_STATUSES = {
  pending:    { label: 'قيد الانتظار',    labelEn: 'Pending',          emoji: '🟡', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  preparing:  { label: 'جاري التحضير',    labelEn: 'Preparing',        emoji: '🔵', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  on_the_way: { label: 'خرج للتوصيل',     labelEn: 'On the Way',       emoji: '🟠', color: '#F97316', bg: 'rgba(249,115,22,0.12)' },
  completed:  { label: 'تم التسليم',       labelEn: 'Completed',        emoji: '🟢', color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
  cancelled:  { label: 'ملغي',            labelEn: 'Cancelled',        emoji: '🔴', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
};

const RESERVATION_STATUSES = {
  pending:   { label: 'قيد التأكيد', labelEn: 'Pending',    emoji: '🟡', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  confirmed: { label: 'مؤكد',       labelEn: 'Confirmed',  emoji: '🟢', color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
  cancelled: { label: 'ملغي',       labelEn: 'Cancelled',  emoji: '🔴', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  completed: { label: 'مكتمل',      labelEn: 'Completed',  emoji: '⚪', color: '#94A3B8', bg: 'rgba(148,163,184,0.12)' },
};

// ── Status Badge Component ────────────────────────────────────
const StatusBadge = ({ status, config }) => {
  const s = config[status] || config.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700',
      color: s.color, backgroundColor: s.bg, border: `1px solid ${s.color}30`,
      whiteSpace: 'nowrap'
    }}>
      {s.emoji} {s.labelEn}
    </span>
  );
};

// ── Toast Notification ────────────────────────────────────────
const Toast = ({ message, visible }) => (
  <div style={{
    position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999,
    padding: '1rem 1.5rem', borderRadius: '12px',
    backgroundColor: 'rgba(34,197,94,0.95)', color: '#fff', fontWeight: '700',
    display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem',
    transform: visible ? 'translateY(0)' : 'translateY(120%)',
    opacity: visible ? 1 : 0, transition: 'all 0.35s ease',
    boxShadow: '0 8px 30px rgba(0,0,0,0.4)'
  }}>
    <CheckCircle size={20} /> {message}
  </div>
);

// ── Styles ────────────────────────────────────────────────────
const cardStyle = {
  backgroundColor: 'var(--card-bg)', borderRadius: '14px', border: '1px solid var(--border-color)',
  padding: '1.8rem', transition: 'border-color 0.3s ease',
};
const selectStyle = {
  padding: '0.5rem 1rem', borderRadius: '8px', backgroundColor: 'var(--bg-color)',
  color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontWeight: '600',
  cursor: 'pointer', fontSize: '0.9rem',
};
const filterBtnStyle = (active) => ({
  padding: '0.5rem 1.2rem', borderRadius: '20px', border: 'none', fontSize: '0.85rem',
  fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease',
  backgroundColor: active ? 'var(--brand-red)' : 'rgba(255,255,255,0.05)',
  color: active ? '#fff' : 'var(--text-secondary)',
});

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('orders');
  const [data, setData] = useState({ orders: [], reservations: [], contacts: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');
  const [resvFilter, setResvFilter] = useState('all');
  const [toast, setToast] = useState({ visible: false, message: '' });

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 2500);
  };

  const API = `http://${window.location.hostname}:3000`;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch(`${API}/api/admin/login`, {
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
        fetch(`${API}/api/admin/orders`),
        fetch(`${API}/api/admin/reservations`),
        fetch(`${API}/api/admin/contacts`)
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
      const response = await fetch(`${API}/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        setData(prev => ({
          ...prev,
          orders: prev.orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
        }));
        showToast(`Order #${orderId} → ${ORDER_STATUSES[newStatus]?.labelEn || newStatus}`);
      }
    } catch (err) {
      console.error('Failed to update order status', err);
    }
  };

  const updateReservationStatus = async (resvId, newStatus) => {
    try {
      const response = await fetch(`${API}/api/admin/reservations/${resvId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        setData(prev => ({
          ...prev,
          reservations: prev.reservations.map(r => r.id === resvId ? { ...r, status: newStatus } : r)
        }));
        showToast(`Reservation #${resvId} → ${RESERVATION_STATUSES[newStatus]?.labelEn || newStatus}`);
      }
    } catch (err) {
      console.error('Failed to update reservation status', err);
    }
  };

  // ── Filtered Data ─────────────────────────────────────────
  const filteredOrders = orderFilter === 'all'
    ? data.orders
    : orderFilter === 'active'
      ? data.orders.filter(o => !['completed', 'cancelled'].includes(o.status))
      : data.orders.filter(o => o.status === orderFilter);

  const filteredReservations = resvFilter === 'all'
    ? data.reservations
    : resvFilter === 'active'
      ? data.reservations.filter(r => !['completed', 'cancelled'].includes(r.status))
      : data.reservations.filter(r => r.status === resvFilter);

  // ── Login Screen ──────────────────────────────────────────
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

  // ── Dashboard ─────────────────────────────────────────────
  return (
    <div className="fade-in">
      <Toast message={toast.message} visible={toast.visible} />

      <header className="page-header" style={{ padding: '6rem 0 2rem' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem' }}>Admin Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Manage live orders, table reservations, and customer feedback</p>
          </div>
          <button onClick={fetchData} disabled={loading} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', fontSize: '0.95rem', opacity: loading ? 0.6 : 1 }}>
            <RefreshCw size={18} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh Data
          </button>
        </div>
      </header>

      <section className="section container">
        {/* ── Navigation Tabs ────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', overflowX: 'auto' }}>
          {[
            { key: 'orders', icon: <ShoppingBag size={20} />, label: 'Orders', count: data.orders.length },
            { key: 'reservations', icon: <Calendar size={20} />, label: 'Reservations', count: data.reservations.length },
            { key: 'contacts', icon: <MessageSquare size={20} />, label: 'Messages', count: data.contacts.length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '0.8rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: 'bold',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                transition: 'all 0.3s ease',
                backgroundColor: activeTab === tab.key ? 'var(--brand-red)' : 'transparent',
                color: activeTab === tab.key ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {tab.icon} {tab.label} <span style={{ backgroundColor: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8rem' }}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════
            TAB 1: ORDERS MANAGEMENT
            ═══════════════════════════════════════════════════════ */}
        {activeTab === 'orders' && (
          <div>
            {/* Filter Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <Filter size={16} color="var(--text-secondary)" />
              {['all', 'active', 'pending', 'preparing', 'on_the_way', 'completed', 'cancelled'].map(f => (
                <button key={f} onClick={() => setOrderFilter(f)} style={filterBtnStyle(orderFilter === f)}>
                  {f === 'all' ? 'All' : f === 'active' ? '🔥 Active' : ORDER_STATUSES[f] ? `${ORDER_STATUSES[f].emoji} ${ORDER_STATUSES[f].labelEn}` : f}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
                <AlertCircle size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                <p style={{ fontSize: '1.1rem' }}>No orders match this filter.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {filteredOrders.map(order => (
                  <div key={order.id} style={cardStyle} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand-red)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                    {/* Header Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--gold)' }}>Order #{order.id}</span>
                        <StatusBadge status={order.status || 'pending'} config={ORDER_STATUSES} />
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          {order.created_at ? new Date(order.created_at).toLocaleString() : '—'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Change:</span>
                        <select
                          value={order.status || 'pending'}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          style={selectStyle}
                        >
                          {Object.entries(ORDER_STATUSES).map(([val, cfg]) => (
                            <option key={val} value={val}>{cfg.emoji} {cfg.labelEn}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Body Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                      {/* Customer & Address */}
                      <div>
                        <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer & Address</h4>
                        <p style={{ margin: 0, fontWeight: '600', lineHeight: '1.6' }}>{order.address}</p>
                        <div style={{ marginTop: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', backgroundColor: 'rgba(229,185,66,0.1)', color: 'var(--gold)' }}>
                          💳 {order.paymentMethod === 'vodafone_cash' ? 'Vodafone Cash' : 'Cash on Delivery'}
                        </div>
                      </div>

                      {/* Items Ordered */}
                      <div>
                        <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Items Ordered</h4>
                        <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                          {Array.isArray(order.items) && order.items.map((item, i) => (
                            <li key={i} style={{ marginBottom: '0.3rem', lineHeight: '1.5' }}>
                              <span style={{ fontWeight: '700', color: 'var(--brand-red)' }}>{item.quantity}x</span> {item.name}
                              <span style={{ color: 'var(--text-secondary)', marginLeft: '0.3rem' }}>({item.price} EGP)</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Total */}
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Total Amount</span>
                        <span style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--brand-red)', lineHeight: '1.2' }}>{order.total} EGP</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB 2: RESERVATIONS MANAGEMENT
            ═══════════════════════════════════════════════════════ */}
        {activeTab === 'reservations' && (
          <div>
            {/* Filter Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <Filter size={16} color="var(--text-secondary)" />
              {['all', 'active', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
                <button key={f} onClick={() => setResvFilter(f)} style={filterBtnStyle(resvFilter === f)}>
                  {f === 'all' ? 'All' : f === 'active' ? '🔥 Active' : RESERVATION_STATUSES[f] ? `${RESERVATION_STATUSES[f].emoji} ${RESERVATION_STATUSES[f].labelEn}` : f}
                </button>
              ))}
            </div>

            {filteredReservations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
                <AlertCircle size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                <p style={{ fontSize: '1.1rem' }}>No reservations match this filter.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
                {filteredReservations.map(res => (
                  <div key={res.id} style={cardStyle} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand-red)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                    {/* Reservation Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--gold)' }}>Reservation #{res.id}</span>
                      <StatusBadge status={res.status || 'pending'} config={RESERVATION_STATUSES} />
                    </div>

                    {/* Guest Info */}
                    <div style={{ marginBottom: '1rem' }}>
                      <h3 style={{ fontSize: '1.3rem', margin: '0 0 0.3rem', color: '#fff' }}>{res.name}</h3>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>📞 {res.phone || '—'}</p>
                      {res.email && <p style={{ margin: '0.2rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>✉️ {res.email}</p>}
                    </div>

                    {/* Date/Time/Guests Row */}
                    <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                      <span style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: 'rgba(200,16,46,0.08)', color: 'var(--brand-red)', fontSize: '0.9rem', fontWeight: '700' }}>📅 {res.date}</span>
                      <span style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: 'rgba(200,16,46,0.08)', color: 'var(--brand-red)', fontSize: '0.9rem', fontWeight: '700' }}>🕐 {res.time}</span>
                      <span style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: 'rgba(229,185,66,0.1)', color: 'var(--gold)', fontSize: '0.9rem', fontWeight: '700' }}>👥 {res.guests} Guests</span>
                    </div>

                    {/* Table Info */}
                    {res.tableId && (
                      <p style={{ margin: '0 0 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>🪑 Table: <strong style={{ color: '#fff' }}>{res.tableId}</strong></p>
                    )}

                    {/* Status Dropdown */}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status:</span>
                      <select
                        value={res.status || 'pending'}
                        onChange={(e) => updateReservationStatus(res.id, e.target.value)}
                        style={selectStyle}
                      >
                        {Object.entries(RESERVATION_STATUSES).map(([val, cfg]) => (
                          <option key={val} value={val}>{cfg.emoji} {cfg.labelEn}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB 3: CONTACT MESSAGES
            ═══════════════════════════════════════════════════════ */}
        {activeTab === 'contacts' && (
          <div>
            {data.contacts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
                <AlertCircle size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                <p style={{ fontSize: '1.1rem' }}>No messages found.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {data.contacts.map(msg => (
                  <div key={msg.id} style={cardStyle} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand-red)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <h4 style={{ margin: 0, color: 'var(--gold)', fontSize: '1.2rem' }}>{msg.name} ({msg.email})</h4>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{msg.created_at ? new Date(msg.created_at).toLocaleString() : '—'}</span>
                    </div>
                    <p style={{ whiteSpace: 'pre-line', color: 'var(--text-primary)', marginTop: '1rem', backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: '8px', lineHeight: '1.7' }}>
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
