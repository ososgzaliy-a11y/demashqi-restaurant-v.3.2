import React, { useState, useEffect } from 'react';
import { Lock, ShoppingBag, Calendar, MessageSquare, RefreshCw, Filter, CheckCircle, AlertCircle, Trash2, Archive, Clock, DollarSign, TrendingUp, XCircle, Activity, Edit2, Plus, Eye, X, Printer } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ReceiptPreviewModal from '../components/ReceiptPreviewModal';

// ── Status Configuration ──────────────────────────────────────
const ORDER_STATUSES = {
  pending:    { label: 'قيد الانتظار',    labelEn: 'Pending',          emoji: '🟡', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  preparing:  { label: 'جاري التحضير',    labelEn: 'Preparing',        emoji: '🔵', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  on_the_way: { label: 'خرج للتوصيل',     labelEn: 'On the Way',       emoji: '🟠', color: '#F97316', bg: 'rgba(249,115,22,0.12)' },
  completed:  { label: 'تم التسليم',       labelEn: 'Completed',        emoji: '🟢', color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
  cancelled:  { label: 'ملغي',            labelEn: 'Cancelled',        emoji: '🔴', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
};

const RESERVATION_STATUSES = {
  confirmed: { label: 'مؤكد',       labelEn: 'Confirmed',  emoji: '🟢', color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
  completed: { label: 'مكتمل',      labelEn: 'Completed',  emoji: '⚪', color: '#94A3B8', bg: 'rgba(148,163,184,0.12)' },
};

// ── Status Badge Component ────────────────────────────────────
const StatusBadge = ({ status, config }) => {
  const s = config[status] || config.pending || config.confirmed || { emoji: '❓', labelEn: status || 'Unknown', color: '#999', bg: '#333' };
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
    opacity: visible ? 1 : 0, transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55)',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
  }}>
    <CheckCircle size={20} /> {message}
  </div>
);

// ── KPI Card Component ────────────────────────────────────────
const KPICard = ({ title, value, icon, trend, trendDown, periodLabel }) => (
  <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h4 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 'bold' }}>{title}</h4>
      <div style={{ padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>{icon}</div>
    </div>
    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff' }}>{value}</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
      <span style={{ color: trendDown ? 'var(--brand-red)' : '#10b981', fontWeight: 'bold' }}>{trend}</span>
      <span style={{ color: 'var(--text-secondary)' }}>vs last {periodLabel}</span>
    </div>
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

import { useLanguage } from '../context/LanguageContext';
import AdminCategories from '../components/AdminCategories';
import AdminProducts from '../components/AdminProducts';

class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Admin Panel Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '5rem', textAlign: 'center', color: '#fff', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <AlertCircle size={64} color="var(--brand-red)" style={{ marginBottom: '1.5rem' }} />
          <h2 style={{ marginBottom: '1rem' }}>حدث خطأ أثناء تحميل لوحة التحكم، يرجى إعادة التحميل</h2>
          <button onClick={() => {
            localStorage.clear();
            window.location.reload();
          }} style={{ padding: '1rem 2rem', backgroundColor: 'var(--brand-red)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '1rem' }}>
            تفريغ الذاكرة المؤقتة وإعادة المحاولة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AdminContent() {
  const { language, t } = useLanguage();
  const isRTL = language === 'ar';
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('orders');
  const [data, setData] = useState({ orders: [], reservations: [], contacts: [], categories: [], products: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');
  const [archiveFilter, setArchiveFilter] = useState('all');
  const [resvFilter, setResvFilter] = useState('all');
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [searchQuery, setSearchQuery] = useState('');

  const [showReceiptPreview, setShowReceiptPreview] = useState(false);
  const [selectedOrderToPrint, setSelectedOrderToPrint] = useState(null);
  const [autoPrintEnabled, setAutoPrintEnabled] = useState(() => {
    return localStorage.getItem('demashqi_admin_autoprint') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('demashqi_admin_autoprint', autoPrintEnabled);
  }, [autoPrintEnabled]);

  const handlePrint = async () => {
    window.print();
    if (selectedOrderToPrint?.id) {
      try {
        await updateOrderStatus(selectedOrderToPrint.id, 'preparing');
      } catch (err) {
        console.error('Failed to sync status after print:', err);
      }
    }
  };

  const [salesAnalytics, setSalesAnalytics] = useState(() => {
    try {
      const saved = localStorage.getItem('salesAnalytics');
      const parsed = saved ? JSON.parse(saved) : null;
      if (parsed) {
        return {
          totalRevenue: parsed.totalRevenue || 0,
          completedOrdersCount: parsed.completedOrdersCount || 0,
          cancelledOrdersCount: parsed.cancelledOrdersCount || 0,
          cancelledRevenue: parsed.cancelledRevenue || 0,
          processedOrders: parsed.processedOrders || {}
        };
      }
    } catch {}
    return { totalRevenue: 0, completedOrdersCount: 0, cancelledOrdersCount: 0, cancelledRevenue: 0, processedOrders: {} };
  });

  useEffect(() => {
    localStorage.setItem('salesAnalytics', JSON.stringify(salesAnalytics));
  }, [salesAnalytics]);

  useEffect(() => {
    if (sessionStorage.getItem('admin_session') === 'true') {
      setIsAuthenticated(true);
      fetchData();
    }
  }, []);

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 2500);
  };

  const API = import.meta.env.VITE_API_BASE_URL || '';

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
        sessionStorage.setItem('admin_session', 'true');
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
      const [ordersRes, resvRes, contactsRes, categoriesRes, productsRes] = await Promise.all([
        fetch(`${API}/api/admin/orders`),
        fetch(`${API}/api/admin/reservations`),
        fetch(`${API}/api/admin/contacts`),
        fetch(`${API}/api/categories`),
        fetch(`${API}/api/products`)
      ]);
      const orders = ordersRes.ok ? await ordersRes.json() : [];
      const reservations = resvRes.ok ? await resvRes.json() : [];
      const contacts = contactsRes.ok ? await contactsRes.json() : [];
      const categories = categoriesRes.ok ? await categoriesRes.json() : [];
      const products = productsRes.ok ? await productsRes.json() : [];
      
      setSalesAnalytics(s => {
        let newTotalRev = s.totalRevenue;
        let newCompletedCount = s.completedOrdersCount;
        let newCancelledRev = s.cancelledRevenue;
        let newCancelledCount = s.cancelledOrdersCount;
        let changed = false;
        const newProcessed = { ...s.processedOrders };

        if (Array.isArray(orders)) {
          orders.forEach(order => {
            const currentStatus = newProcessed[order.id];
            const newStatus = order.status;
            
            if (currentStatus !== newStatus && (newStatus === 'completed' || newStatus === 'cancelled')) {
               changed = true;
               if (currentStatus === 'completed') {
                  newTotalRev -= (order.total || 0);
                  newCompletedCount -= 1;
               } else if (currentStatus === 'cancelled') {
                  newCancelledRev -= (order.total || 0);
                  newCancelledCount -= 1;
               }
               
               if (newStatus === 'completed') {
                  newTotalRev += (order.total || 0);
                  newCompletedCount += 1;
                  newProcessed[order.id] = 'completed';
               } else if (newStatus === 'cancelled') {
                  newCancelledRev += (order.total || 0);
                  newCancelledCount += 1;
                  newProcessed[order.id] = 'cancelled';
               }
            }
          });
        }

        if (changed) {
          return {
            totalRevenue: Math.max(0, newTotalRev),
            completedOrdersCount: Math.max(0, newCompletedCount),
            cancelledRevenue: Math.max(0, newCancelledRev),
            cancelledOrdersCount: Math.max(0, newCancelledCount),
            processedOrders: newProcessed
          };
        }
        return s;
      });

      setData({ orders, reservations, contacts, categories, products });
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
        setData(prev => {
          const orderToUpdate = prev.orders.find(o => o.id === orderId);
          if (orderToUpdate) {
            setSalesAnalytics(s => {
              let newTotalRev = s.totalRevenue;
              let newCompletedCount = s.completedOrdersCount;
              let newCancelledRev = s.cancelledRevenue;
              let newCancelledCount = s.cancelledOrdersCount;
              const newProcessed = { ...s.processedOrders };
              const orderTotal = orderToUpdate.total || 0;

              const previousStatus = newProcessed[orderId];

              // Revert previous status if it was counted
              if (previousStatus === 'completed') {
                newTotalRev -= orderTotal;
                newCompletedCount -= 1;
                delete newProcessed[orderId];
              } else if (previousStatus === 'cancelled') {
                newCancelledRev -= orderTotal;
                newCancelledCount -= 1;
                delete newProcessed[orderId];
              }

              // Apply new status
              if (newStatus === 'completed') {
                newTotalRev += orderTotal;
                newCompletedCount += 1;
                newProcessed[orderId] = 'completed';

                // Sync to Management Dashboard (mock data v3)
                try {
                  const mgmtDataRaw = localStorage.getItem('management_mock_data_v3');
                  if (mgmtDataRaw) {
                    const mgmtData = JSON.parse(mgmtDataRaw);
                    mgmtData.kpis.totalSales += orderTotal;
                    mgmtData.kpis.netSales += orderTotal;
                    mgmtData.kpis.totalOrders += 1;
                    mgmtData.recentOrders.unshift({
                      id: orderToUpdate.daily_id ? `#ORD-${orderToUpdate.daily_id}` : `#ORD-${orderId}`,
                      ref: `REF-${orderId}`,
                      customer: orderToUpdate.name || orderToUpdate.customer || 'Customer',
                      phone: orderToUpdate.phone || '01000000000',
                      address: orderToUpdate.address || 'N/A',
                      total: `EGP ${orderTotal}`,
                      status: 'Completed',
                      time: 'Just now',
                      duration: '30 mins',
                      items: orderToUpdate.items || []
                    });
                    if (mgmtData.recentOrders.length > 50) mgmtData.recentOrders.pop();
                    localStorage.setItem('management_mock_data_v3', JSON.stringify(mgmtData));
                  }
                } catch (e) { console.error('Sync to management failed', e); }

              } else if (newStatus === 'cancelled') {
                newCancelledRev += orderTotal;
                newCancelledCount += 1;
                newProcessed[orderId] = 'cancelled';
              }

              return {
                totalRevenue: newTotalRev < 0 ? 0 : newTotalRev,
                completedOrdersCount: newCompletedCount < 0 ? 0 : newCompletedCount,
                cancelledRevenue: newCancelledRev < 0 ? 0 : newCancelledRev,
                cancelledOrdersCount: newCancelledCount < 0 ? 0 : newCancelledCount,
                processedOrders: newProcessed
              };
            });
          }
          return {
            ...prev,
            orders: prev.orders.map(o => o.id === orderId ? { ...o, status: newStatus, archived_at: newStatus === 'completed' ? Date.now() : o.archived_at } : o)
          };
        });
        showToast(`Order #${orderId} → ${ORDER_STATUSES[newStatus]?.labelEn || newStatus}`);
      }
    } catch (err) {
      console.error('Failed to update order status', err);
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm(isRTL ? 'هل أنت متأكد من حذف هذا الطلب نهائياً؟' : 'Are you sure you want to permanently delete this order?')) return;
    try {
      const response = await fetch(`${API}/api/admin/orders/${orderId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setData(prev => ({
          ...prev,
          orders: prev.orders.filter(o => o.id !== orderId)
        }));
        showToast(`Order #${orderId} deleted permanently.`);
      }
    } catch (err) {
      console.error('Failed to delete order', err);
    }
  };

  const clearArchive = async () => {
    if (!window.confirm(isRTL ? 'هل أنت متأكد من مسح جميع طلبات الأرشيف؟' : 'Are you sure you want to clear the entire archive?')) return;
    try {
      const response = await fetch(`${API}/api/admin/orders/archive`, { method: 'DELETE' });
      if (response.ok) {
        setData(prev => ({
          ...prev,
          orders: prev.orders.filter(o => !['completed', 'cancelled'].includes(o.status))
        }));
        showToast('Archive cleared successfully.');
      }
    } catch (err) {
      console.error('Failed to clear archive', err);
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
  // ── Filtered Data (Defensive) ───────────────────────────
  const safeOrders = Array.isArray(data.orders) ? data.orders : [];
  const safeReservations = Array.isArray(data.reservations) ? data.reservations : [];
  const safeContacts = Array.isArray(data.contacts) ? data.contacts : [];
  const safeCategories = Array.isArray(data.categories) ? data.categories : [];
  const safeProducts = Array.isArray(data.products) ? data.products : [];

  const activeOrdersList = safeOrders.filter(o => !['completed', 'cancelled'].includes(o?.status));
  const archivedOrdersList = safeOrders.filter(o => {
    if (!['completed', 'cancelled'].includes(o?.status)) return false;
    if (o.archived_at) {
      const hoursArchived = (Date.now() - o.archived_at) / (1000 * 60 * 60);
      return hoursArchived < 24;
    }
    return true;
  });

  const filteredOrders = activeOrdersList.filter(o => {
    const matchesFilter = orderFilter === 'all' || o?.status === orderFilter;
    const matchesSearch = searchQuery === '' || 
      String(o.id).includes(searchQuery) || 
      String(o.daily_id || '').includes(searchQuery) || 
      (o.name || o.customer || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredArchivedOrders = archivedOrdersList.filter(o => {
    const matchesFilter = archiveFilter === 'all' || o?.status === archiveFilter;
    const matchesSearch = searchQuery === '' || 
      String(o.id).includes(searchQuery) || 
      String(o.daily_id || '').includes(searchQuery) || 
      (o.name || o.customer || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredReservations = resvFilter === 'all'
    ? safeReservations
    : safeReservations.filter(r => r?.status === resvFilter);

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
    <div className="fade-in" dir={isRTL ? 'rtl' : 'ltr'}>
      <Toast message={toast.message} visible={toast.visible} />

      <header className="page-header" style={{ padding: '6rem 0 2rem' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem' }}>Admin Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Manage live orders, table reservations, and customer feedback</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={fetchData} disabled={loading} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', fontSize: '0.95rem', opacity: loading ? 0.6 : 1 }}>
              <RefreshCw size={18} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh Data
            </button>
            <button onClick={() => { sessionStorage.removeItem('admin_session'); setIsAuthenticated(false); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', fontSize: '0.95rem', backgroundColor: 'var(--brand-red)' }}>
              <Lock size={18} /> {isRTL ? 'تسجيل الخروج' : 'Logout'}
            </button>
          </div>
        </div>
      </header>

      <section className="section container">
        {/* ── Navigation Tabs ────────────────────────────────── */}
        <div className="hide-scrollbar" style={{ display: 'flex', gap: '0.8rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {[
            { key: 'orders', icon: <ShoppingBag size={20} />, label: isRTL ? 'الطلبات النشطة' : 'Active Orders', count: activeOrdersList.length },
            { key: 'archive', icon: <Archive size={20} />, label: isRTL ? 'أرشيف الطلبات' : 'Archive', count: archivedOrdersList.length },
            { key: 'reservations', icon: <Calendar size={20} />, label: isRTL ? 'الحجوزات' : 'Reservations', count: safeReservations.length },
            { key: 'contacts', icon: <MessageSquare size={20} />, label: isRTL ? 'الرسائل' : 'Messages', count: safeContacts.length },
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <Filter size={16} color="var(--text-secondary)" />
                {['all', 'pending', 'preparing', 'on_the_way'].map(f => (
                  <button key={f} onClick={() => setOrderFilter(f)} style={filterBtnStyle(orderFilter === f)}>
                    {f === 'all' ? 'All Active' : ORDER_STATUSES[f] ? `${ORDER_STATUSES[f].emoji} ${ORDER_STATUSES[f].labelEn}` : f}
                  </button>
                ))}
              </div>
              <input 
                type="text" 
                placeholder={isRTL ? "بحث برقم الأوردر أو العميل..." : "Search Order ID or Customer..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', minWidth: '250px' }}
              />
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
                          <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Order {order.daily_id ? `#ORD-${order.daily_id}` : `#ORD-${order.id}`}</span>
                          <StatusBadge status={order.status} config={ORDER_STATUSES} />
                        {order?.status === 'cancelled' && order?.cancelled_by === 'customer' && (
                          <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--brand-red)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            {isRTL ? 'ملغي من قبل العميل' : 'Cancelled by customer'}
                          </span>
                        )}
                        <span 
                          title={order?.created_at ? new Date(order.created_at).toLocaleString(isRTL ? 'ar-EG' : 'en-US') : ''}
                          style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'help' }}
                        >
                          {order?.created_at ? new Date(order.created_at).toLocaleTimeString(isRTL ? 'ar-EG' : 'en-US', {hour: '2-digit', minute:'2-digit'}) : '—'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Change:</span>
                        <select
                          value={order?.status || 'pending'}
                          onChange={(e) => updateOrderStatus(order?.id, e.target.value)}
                          style={selectStyle}
                        >
                          {Object.entries(ORDER_STATUSES).filter(([val]) => val !== 'cancelled').map(([val, cfg]) => (
                            <option key={val} value={val}>{cfg.emoji} {cfg.labelEn}</option>
                          ))}
                        </select>
                        <button 
                          onClick={() => deleteOrder(order.id)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: 'var(--brand-red)',
                            borderRadius: '8px',
                            padding: '0.4rem 0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontWeight: 'bold',
                            fontSize: '0.85rem',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.color = '#fff' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = 'var(--brand-red)' }}
                        >
                          <Trash2 size={16} /> {isRTL ? 'حذف' : 'Delete'}
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedOrderToPrint(order);
                            setShowReceiptPreview(true);
                          }}
                          style={{
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            color: '#3B82F6',
                            borderRadius: '8px',
                            padding: '0.4rem 0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontWeight: 'bold',
                            fontSize: '0.85rem',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#3B82F6'; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'; e.currentTarget.style.color = '#3B82F6'; }}
                        >
                          <Printer size={16} />
                          {isRTL ? 'طباعة' : 'Print'}
                        </button>
                      </div>
                    </div>

                    {/* Body Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                      {/* Customer & Address */}
                      <div>
                        <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.8rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer & Address</h4>
                        <p style={{ margin: '0 0 0.5rem 0', fontWeight: '800', fontSize: '1.2rem', color: 'var(--gold)' }}>👤 {order.name || order.customer || 'Unknown Customer'}</p>
                        <p style={{ margin: 0, fontWeight: '500', lineHeight: '1.6' }}>{order.address}</p>
                        <p style={{ margin: '0.3rem 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>📞 {order.phone || '—'}</p>
                        {order.notes && (
                          <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '0.85rem' }}>
                            <strong style={{ color: 'var(--gold)' }}>Notes:</strong> {order.notes}
                          </div>
                        )}
                        <div style={{ marginTop: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', backgroundColor: 'rgba(229,185,66,0.1)', color: 'var(--gold)' }}>
                          💳 {order.paymentMethod === 'vodafone_cash' ? 'Vodafone Cash' : 'Cash on Delivery'}
                        </div>
                      </div>

                      {/* Items Ordered */}
                      <div>
                        <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Items Ordered</h4>
                        <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                          {Array.isArray(order.items) && order.items.map((item, i) => (
                            <li key={i} style={{ marginBottom: '0.8rem', lineHeight: '1.5' }}>
                              <div>
                                <span style={{ fontWeight: '700', color: 'var(--brand-red)' }}>{`${item.quantity || item.qty || 1}x`}</span> {item.name}
                                <span style={{ color: 'var(--text-secondary)', marginLeft: '0.3rem' }}>({item.price} EGP)</span>
                              </div>
                              {(item.selectedSpiciness || (item.selectedSauces && item.selectedSauces.length > 0)) && (
                                <div style={{ display: 'flex', gap: '0.8rem', marginLeft: '1.5rem', marginTop: '0.2rem', fontSize: '0.85rem' }}>
                                  {item.selectedSpiciness && (
                                    <span style={{ color: item.selectedSpiciness === 'حار' ? '#EF4444' : 'var(--text-secondary)' }}>
                                      {item.selectedSpiciness === 'حار' ? '🌶️' : '🧄'} {item.selectedSpiciness}
                                    </span>
                                  )}
                                  {item.selectedSauces && item.selectedSauces.length > 0 && (
                                    <span style={{ color: 'var(--gold)' }}>🧄 {item.selectedSauces.join('، ')}</span>
                                  )}
                                </div>
                              )}
                              {item.specialNote && (
                                <div style={{ fontSize: '0.85rem', color: '#EF4444', fontStyle: 'italic', marginTop: '0.2rem' }}>
                                  📝 ملاحظة: {item.specialNote}
                                </div>
                              )}
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
            TAB: ARCHIVE MANAGEMENT
            ═══════════════════════════════════════════════════════ */}
        {activeTab === 'archive' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', flex: 1 }}>
                <Filter size={16} color="var(--text-secondary)" />
                {['all', 'completed', 'cancelled'].map(f => (
                  <button key={f} onClick={() => setArchiveFilter(f)} style={filterBtnStyle(archiveFilter === f)}>
                    {f === 'all' ? 'All Archived' : ORDER_STATUSES[f] ? `${ORDER_STATUSES[f].emoji} ${ORDER_STATUSES[f].labelEn}` : f}
                  </button>
                ))}
                <input 
                  type="text" 
                  placeholder={isRTL ? "بحث في الأرشيف..." : "Search Archive..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', flex: '1', minWidth: '200px' }}
                />
              </div>
              <button 
                onClick={clearArchive}
                disabled={archivedOrdersList.length === 0}
                style={{
                  padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid var(--brand-red)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--brand-red)', fontWeight: 'bold',
                  display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: archivedOrdersList.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: archivedOrdersList.length === 0 ? 0.5 : 1
                }}
              >
                <Trash2 size={16} /> {isRTL ? 'مسح الأرشيف الآن' : 'Clear Archive Now'}
              </button>
            </div>

            {filteredArchivedOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
                <Archive size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                <p style={{ fontSize: '1.1rem' }}>No archived orders.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {filteredArchivedOrders.map(order => {
                  const minutesArchived = order.archived_at ? Math.floor((Date.now() - order.archived_at) / (1000 * 60)) : 0;
                  const minutesRemaining = 2 - minutesArchived;
                  const accentColor = order.status === 'completed' ? 'var(--brand-green, #22C55E)' : 'var(--brand-red)';

                  return (
                    <div key={order.id} style={{ ...cardStyle, borderLeft: `4px solid ${accentColor}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Order {order.daily_id ? `#ORD-${order.daily_id}` : `#ORD-${order.id}`}</span>
                          <StatusBadge status={order.status} config={ORDER_STATUSES} />
                          <span 
                            title={order?.created_at ? new Date(order.created_at).toLocaleString(isRTL ? 'ar-EG' : 'en-US') : ''}
                            style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'help' }}
                          >
                            <Clock size={14} /> 
                            {order?.created_at ? new Date(order.created_at).toLocaleTimeString(isRTL ? 'ar-EG' : 'en-US', {hour: '2-digit', minute:'2-digit'}) : '—'}
                          </span>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', opacity: 0.7, marginLeft: '0.5rem' }}>
                            ({isRTL ? 'مسح تلقائي بعد 24س' : 'Auto-clear 24h'})
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button 
                            onClick={() => deleteOrder(order.id)}
                            style={{
                              background: 'transparent', border: 'none', color: 'var(--brand-red)',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 'bold', fontSize: '0.85rem',
                              marginLeft: '0.5rem'
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', opacity: 0.8 }}>
                        <div>
                          <p style={{ margin: '0 0 0.5rem 0', fontWeight: '800', fontSize: '1.1rem', color: 'var(--gold)' }}>👤 {order.name || order.customer || 'Unknown Customer'}</p>
                          <p style={{ margin: 0, fontWeight: '500' }}>{order.address}</p>
                          <p style={{ margin: '0.3rem 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>📞 {order.phone || '—'}</p>
                        </div>
                        <div>
                          <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                            {Array.isArray(order.items) && order.items.map((item, i) => (
                              <li key={i} style={{ marginBottom: '0.6rem', fontSize: '0.9rem' }}>
                                <div>
                                  <span style={{ fontWeight: '700' }}>{`${item.quantity || item.qty || 1}x`}</span> {item.name}
                                </div>
                                {(item.selectedSpiciness || (item.selectedSauces && item.selectedSauces.length > 0)) && (
                                  <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1.2rem', marginTop: '0.2rem', fontSize: '0.8rem', opacity: 0.8 }}>
                                    {item.selectedSpiciness && (
                                      <span style={{ color: item.selectedSpiciness === 'حار' ? '#EF4444' : 'var(--text-secondary)' }}>
                                        {item.selectedSpiciness === 'حار' ? '🌶️' : '🧄'} {item.selectedSpiciness}
                                      </span>
                                    )}
                                    {item.selectedSauces && item.selectedSauces.length > 0 && (
                                      <span style={{ color: 'var(--gold)' }}>🧄 {item.selectedSauces.join('، ')}</span>
                                    )}
                                  </div>
                                )}
                                {item.specialNote && (
                                  <div style={{ fontSize: '0.85rem', color: '#EF4444', fontStyle: 'italic', marginTop: '0.2rem', marginLeft: '1.2rem' }}>
                                    📝 ملاحظة: {item.specialNote}
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end' }}>
                          <span style={{ fontSize: '1.5rem', fontWeight: '900', color: accentColor }}>{order.total} EGP</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
              {['all', 'confirmed', 'completed'].map(f => (
                <button key={f} onClick={() => setResvFilter(f)} style={filterBtnStyle(resvFilter === f)}>
                  {f === 'all' ? 'All' : RESERVATION_STATUSES[f] ? `${RESERVATION_STATUSES[f].emoji} ${RESERVATION_STATUSES[f].labelEn}` : f}
                </button>
              ))}
            </div>

            {filteredReservations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
                <AlertCircle size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                <p style={{ fontSize: '1.1rem' }}>No reservations match this filter.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
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
            {safeContacts.length === 0 ? (
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
      {/* Receipt Preview Modal */}
      <ReceiptPreviewModal
        isOpen={showReceiptPreview}
        onClose={() => setShowReceiptPreview(false)}
        order={selectedOrderToPrint}
        onPrint={handlePrint}
        autoPrintEnabled={autoPrintEnabled}
        setAutoPrintEnabled={setAutoPrintEnabled}
        language={language}
      />
    </div>
  );
}

export default function AdminDashboard(props) {
  return (
    <AdminErrorBoundary>
      <AdminContent {...props} />
    </AdminErrorBoundary>
  );
}
