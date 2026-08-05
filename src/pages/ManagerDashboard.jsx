import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Lock, TrendingUp, XCircle, DollarSign, Users, LogOut, Activity, RefreshCw, Filter, ShoppingBag, CheckCircle, Printer } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import AdminCategories from '../components/AdminCategories';
import AdminProducts from '../components/AdminProducts';
import ReceiptPreviewModal from '../components/ReceiptPreviewModal';

export default function ManagerDashboard() {
  const { language } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [timeFilter, setTimeFilter] = useState('today');
  const [chartFilter, setChartFilter] = useState('today');
  const [tableFilter, setTableFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('financials');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [selectedGraphPoint, setSelectedGraphPoint] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [showReceiptPreview, setShowReceiptPreview] = useState(false);
  const [autoPrintEnabled, setAutoPrintEnabled] = useState(() => {
    return localStorage.getItem('demashqi_manager_autoprint') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('demashqi_manager_autoprint', autoPrintEnabled);
  }, [autoPrintEnabled]);

  const handlePrint = async () => {
    window.print();
    if (selectedOrder?.id) {
      try {
        const orderId = selectedOrder.id.replace('#ORD-', '');
        await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/admin/orders/${orderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'preparing' })
        });
      } catch (err) {
        console.error('Failed to sync status after print:', err);
      }
    }
  };

  const getChartData = (filter) => {
    if (filter === 'today' && dashboardData?.peakTimes) {
      return dashboardData.peakTimes.map(p => {
        const [hr, min] = p.time.split(':');
        const h12 = (parseInt(hr) % 12) || 12;
        const ampm = parseInt(hr) >= 12 ? (language === 'ar' ? 'م' : 'PM') : (language === 'ar' ? 'ص' : 'AM');
        
        const isTwoHourMark = parseInt(hr) % 2 === 0 && min === '00';
        const displayName = isTwoHourMark ? `${h12}:00 ${ampm}` : '';

        const endMin = min === '00' ? '30' : '00';
        const endHr = min === '30' ? (parseInt(hr) + 1).toString().padStart(2, '0') : hr;
        const endH12 = (parseInt(endHr) % 12) || 12;
        const endAmpm = parseInt(endHr) >= 12 && parseInt(endHr) < 24 ? (language === 'ar' ? 'م' : 'PM') : (language === 'ar' ? 'ص' : 'AM');
        
        const tooltipTime = `${h12}:${min} ${ampm} - ${endH12}:${endMin} ${endAmpm}`;

        return {
          name: p.time,
          tooltipTime,
          orders: p.orders,
          rawOrders: p.rawOrders
        };
      });
    } else if (filter === 'week') {
      return [
        { name: language === 'ar' ? 'الإثنين' : 'Mon', orders: 15 }, { name: language === 'ar' ? 'الثلاثاء' : 'Tue', orders: 24 },
        { name: language === 'ar' ? 'الأربعاء' : 'Wed', orders: 18 }, { name: language === 'ar' ? 'الخميس' : 'Thu', orders: 32 },
        { name: language === 'ar' ? 'الجمعة' : 'Fri', orders: 45 }, { name: language === 'ar' ? 'السبت' : 'Sat', orders: 40 },
        { name: language === 'ar' ? 'الأحد' : 'Sun', orders: 30 }
      ];
    } else if (filter === 'month') {
      return Array.from({length: 15}, (_, i) => ({ name: `${(i*2)+1}`, orders: Math.floor(Math.random() * 50) + 10 }));
    } else if (filter === 'year') {
      const mosEn = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const mosAr = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
      return mosEn.map((m, i) => ({ name: language === 'ar' ? mosAr[i] : m, orders: Math.floor(Math.random() * 500) + 200 }));
    }
    return [];
  };

  const dummyOrders = [
    { id: '#ORD-1029', customer: 'Ahmed Hassan', phone: '01012345678', address: '123 Main St, Nasr City, Cairo', amount: 850, subtotal: 800, deliveryFee: 50, date: '2026-08-01 14:30', status: 'Confirmed', items: [{ name: 'Shawarma Meat', qty: 2, price: 400 }, { name: 'Kebab', qty: 1, price: 400 }] },
    { id: '#ORD-1028', customer: 'Mona Ali', phone: '01198765432', address: '45 Maadi, Cairo', amount: 420, subtotal: 370, deliveryFee: 50, date: '2026-08-01 13:15', status: 'Canceled', items: [{ name: 'Chicken Meal', qty: 1, price: 370 }] },
    { id: '#ORD-1027', customer: 'Tarek Ziad', phone: '01234567890', address: '12 Heliopolis, Cairo', amount: 1200, subtotal: 1150, deliveryFee: 50, date: '2026-08-01 12:05', status: 'Confirmed', items: [{ name: 'Mixed Grill Family', qty: 1, price: 1150 }] },
    { id: '#ORD-1026', customer: 'Sarah Ibrahim', phone: '01000011122', address: '89 Dokki, Giza', amount: 350, subtotal: 300, deliveryFee: 50, date: '2026-08-01 11:50', status: 'Confirmed', items: [{ name: 'Falafel Wrap', qty: 4, price: 75 }] },
    { id: '#ORD-1025', customer: 'Khaled Omar', phone: '01555566677', address: 'Zamalek, Cairo', amount: 960, subtotal: 910, deliveryFee: 50, date: '2026-08-01 11:20', status: 'Confirmed', items: [{ name: 'Beef Burger', qty: 2, price: 300 }, { name: 'Fries', qty: 2, price: 155 }] },
    { id: '#ORD-1024', customer: 'Nour Youssef', phone: '01223344556', address: 'Mohandeseen, Giza', amount: 210, subtotal: 160, deliveryFee: 50, date: '2026-08-01 10:45', status: 'Canceled', items: [{ name: 'Hummus', qty: 1, price: 160 }] },
    { id: '#ORD-1023', customer: 'Ramy Saeed', phone: '01099887766', address: 'New Cairo', amount: 730, subtotal: 680, deliveryFee: 50, date: '2026-08-01 10:10', status: 'Confirmed', items: [{ name: 'Shish Tawook', qty: 2, price: 340 }] },
    { id: '#ORD-1022', customer: 'Hala Mahmoud', phone: '01111223344', address: 'Downtown Cairo', amount: 550, subtotal: 500, deliveryFee: 50, date: '2026-08-01 09:30', status: 'Confirmed', items: [{ name: 'Meat Pizza', qty: 1, price: 500 }] }
  ];

  const actualOrders = dashboardData ? dashboardData.recentOrders : dummyOrders;
  
  const filteredActualOrders = tableFilter === 'all' 
    ? actualOrders 
    : actualOrders.filter(o => {
        const s = o.status.toLowerCase();
        if (tableFilter === 'confirmed') return s === 'completed' || s === 'confirmed' || s === 'preparing';
        if (tableFilter === 'canceled') return s === 'cancelled' || s === 'canceled';
        return true;
      });

  const API = import.meta.env.VITE_API_BASE_URL || '';
  const [allOrders, setAllOrders] = useState([]);

  // Prevent body scroll when any modal is open
  useEffect(() => {
    if (selectedOrder || selectedGraphPoint) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [selectedOrder, selectedGraphPoint]);

  // Authentication Check & Auto-Refresh Polling
  useEffect(() => {
    const authStatus = sessionStorage.getItem('manager_session');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      fetchData();
      
      const interval = setInterval(() => {
        fetchData();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, catRes, prodRes] = await Promise.all([
        fetch(`${API}/api/admin/orders`),
        fetch(`${API}/api/categories`),
        fetch(`${API}/api/products`)
      ]);
      if (ordersRes.ok) setAllOrders(await ordersRes.json());
      if (catRes.ok) setCategories(await catRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());
    } catch (err) {
      console.error('Error fetching manager data', err);
    }
  };

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 2500);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API}/api/manager/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await response.json();
      if (data.success) {
        sessionStorage.setItem('manager_session', 'true');
        setIsAuthenticated(true);
        setError('');
        fetchData();
      } else {
        setError(data.error || (language === 'ar' ? 'كلمة المرور غير صحيحة' : 'Incorrect password'));
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('manager_session');
    setIsAuthenticated(false);
    setPassword('');
  };

  const handleGraphClick = (clickedPoint) => {
    if (!clickedPoint || !clickedPoint.time) return;
    const [hStr] = clickedPoint.time.split(':');
    const hour = parseInt(hStr);
    const startHour = hour % 2 === 0 ? hour : hour - 1;
    
    let totalOrders = 0;
    let allRawOrders = [];
    
    const keysToMerge = [
      `${startHour.toString().padStart(2, '0')}:00`,
      `${startHour.toString().padStart(2, '0')}:30`,
      `${(startHour + 1).toString().padStart(2, '0')}:00`,
      `${(startHour + 1).toString().padStart(2, '0')}:30`
    ];
    
    keysToMerge.forEach(key => {
      const pointData = dashboardData.peakTimes.find(d => d.time === key);
      if (pointData) {
        totalOrders += pointData.orders;
        allRawOrders = [...allRawOrders, ...pointData.rawOrders];
      }
    });
    
    const formatHour = (h) => {
      const hStr = h % 24;
      const ampm = hStr >= 12 ? (language === 'ar' ? 'م' : 'PM') : (language === 'ar' ? 'ص' : 'AM');
      const h12 = hStr % 12 || 12;
      return `${h12}:00 ${ampm}`;
    };
    
    const displayRange = `${formatHour(startHour)} - ${formatHour(startHour + 2)}`;
    
    setSelectedGraphPoint({
      displayTime: displayRange,
      orders: totalOrders,
      rawOrders: allRawOrders
    });
  };

  // Dynamic Data Calculation based on timeFilter
  useEffect(() => {
    if (allOrders.length === 0 && !dashboardData) {
      // Initialize empty state
      setDashboardData({
        kpis: { totalSales: 0, netSales: 0, cancelledOrders: 0, estNetProfit: 0, totalOrders: 0 },
        kpiTrends: { totalSales: 0, estNetProfit: 0, cancelledOrders: 0, totalOrders: 0 },
        peakTimes: [
          { time: '10:00', orders: 0 }, { time: '12:00', orders: 0 }, { time: '14:00', orders: 0 },
          { time: '16:00', orders: 0 }, { time: '18:00', orders: 0 }, { time: '20:00', orders: 0 },
          { time: '22:00', orders: 0 }, { time: '23:00', orders: 0 },
        ],
        recentOrders: []
      });
      return;
    }

    const now = new Date();
    let currentStart, currentEnd, previousStart, previousEnd;

    if (timeFilter === 'today') {
      currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      currentEnd = new Date(currentStart.getTime() + 24 * 60 * 60 * 1000);
      previousStart = new Date(currentStart.getTime() - 24 * 60 * 60 * 1000);
      previousEnd = currentStart;
    } else if (timeFilter === 'this_week') {
      const dayOfWeek = now.getDay();
      currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
      currentEnd = new Date(currentStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      previousStart = new Date(currentStart.getTime() - 7 * 24 * 60 * 60 * 1000);
      previousEnd = currentStart;
    } else if (timeFilter === 'this_month') {
      currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
      currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      previousEnd = currentStart;
    } else if (timeFilter === 'this_year') {
      currentStart = new Date(now.getFullYear(), 0, 1);
      currentEnd = new Date(now.getFullYear() + 1, 0, 1);
      previousStart = new Date(now.getFullYear() - 1, 0, 1);
      previousEnd = currentStart;
    }

    let currentGrossRevenue = 0, currentRefunds = 0, currentSuccessfulOrders = 0;
    let prevGrossRevenue = 0, prevRefunds = 0, prevSuccessfulOrders = 0;
    const recentDisplay = [];
    
    // Generate 48 buckets of 30 mins each
    const peakMap = {};
    for (let h = 0; h < 24; h++) {
      const hr = h.toString().padStart(2, '0');
      peakMap[`${hr}:00`] = { count: 0, orders: [] };
      peakMap[`${hr}:30`] = { count: 0, orders: [] };
    }

    console.log('Fetched Orders:', allOrders);

    allOrders.forEach(order => {
      const orderDate = new Date(Number(order.created_at) > 1000000000 ? Number(order.created_at) : order.created_at);
      const isCurrent = orderDate >= currentStart && orderDate < currentEnd;
      const isPrevious = orderDate >= previousStart && orderDate < previousEnd;
      const rawTotal = order.totalPrice !== undefined ? order.totalPrice : (order.amount !== undefined ? order.amount : order.total);
      const orderTotal = Number(rawTotal) || 0;

      if (isCurrent) {
        currentGrossRevenue += orderTotal;
        
        if (order.status === 'cancelled') {
          currentRefunds += orderTotal;
        } else {
          currentSuccessfulOrders += 1;
        }
        
        const hour = orderDate.getHours().toString().padStart(2, '0');
        const minutes = orderDate.getMinutes();
        const minBucket = minutes < 30 ? '00' : '30';
        const timeKey = `${hour}:${minBucket}`;
        
        if (peakMap[timeKey]) {
          peakMap[timeKey].count += 1;
          
          const h = orderDate.getHours();
          const m = orderDate.getMinutes().toString().padStart(2, '0');
          const s = orderDate.getSeconds().toString().padStart(2, '0');
          const ampm = h >= 12 ? (language === 'ar' ? 'م' : 'PM') : (language === 'ar' ? 'ص' : 'AM');
          const h12 = h % 12 || 12;
          
          peakMap[timeKey].orders.push({
            id: order.daily_id ? `#ORD-${order.daily_id}` : `#ORD-${order.id}`,
            status: order.status,
            total: `EGP ${orderTotal.toLocaleString()}`,
            amount: orderTotal,
            items: order.items || [],
            exactTime: `${h12}:${m}:${s} ${ampm}`
          });
        }

        recentDisplay.push({
          id: order.daily_id ? `#ORD-${order.daily_id}` : `#ORD-${order.id}`,
          customer: order.name || 'Unknown Customer',
          phone: order.phone || '-',
          address: order.address || '-',
          items: order.items || [],
          duration: order.duration || 'N/A',
          ref: order.ref || '',
          total: `EGP ${orderTotal.toLocaleString()}`,
          amount: orderTotal,
          subtotal: orderTotal,
          deliveryFee: 0,
          status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
          date: orderDate.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') + ' ' + orderDate.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {hour: '2-digit', minute:'2-digit'}),
          time: orderDate.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {hour: '2-digit', minute:'2-digit'}),
          _timestamp: orderDate.getTime()
        });
      } else if (isPrevious) {
        prevGrossRevenue += orderTotal;
        if (order.status === 'cancelled') {
          prevRefunds += orderTotal;
        } else {
          prevSuccessfulOrders += 1;
        }
      }
    });

    recentDisplay.sort((a, b) => b._timestamp - a._timestamp);

    const calcTrend = (curr, prev) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    const currentNetSales = currentGrossRevenue - currentRefunds;
    const prevNetSales = prevGrossRevenue - prevRefunds;

    setDashboardData({
      kpis: {
        totalSales: currentNetSales,
        estNetProfit: currentNetSales * 0.25,
        cancelledOrders: currentRefunds,
        totalOrders: currentSuccessfulOrders
      },
      kpiTrends: {
        totalSales: calcTrend(currentNetSales, prevNetSales),
        estNetProfit: calcTrend(currentNetSales * 0.25, prevNetSales * 0.25),
        cancelledOrders: calcTrend(currentRefunds, prevRefunds),
        totalOrders: calcTrend(currentSuccessfulOrders, prevSuccessfulOrders)
      },
      peakTimes: Object.keys(peakMap).map(k => ({
        time: k,
        orders: peakMap[k].count,
        rawOrders: peakMap[k].orders
      })),
      recentOrders: recentDisplay
    });
  }, [allOrders, timeFilter, language]);

  const getPeriodLabel = () => {
    switch (timeFilter) {
      case 'today': return language === 'ar' ? 'مقارنة بالأمس' : 'vs Yesterday';
      case 'this_week': return language === 'ar' ? 'مقارنة بالأسبوع الماضي' : 'vs Last Week';
      case 'this_month': return language === 'ar' ? 'مقارنة بالشهر الماضي' : 'vs Last Month';
      case 'this_year': return language === 'ar' ? 'مقارنة بالسنة الماضية' : 'vs Last Year';
      default: return '';
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ backgroundColor: 'var(--card-bg)', padding: '3rem 2rem', borderRadius: '16px', border: '1px solid var(--border-color)', width: '100%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--gold)', marginBottom: '1.5rem' }}>
            <Lock size={32} />
          </div>
          <h2 style={{ color: 'var(--gold)', marginBottom: '0.5rem', fontSize: '1.8rem' }}>
            {language === 'ar' ? 'بوابة الإدارة' : 'Management Portal'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            {language === 'ar' ? 'يرجى إدخال كلمة المرور للوصول للوحة المبيعات' : 'Please enter password to access sales dashboard'}
          </p>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={language === 'ar' ? 'كلمة المرور' : 'Password'}
              style={{
                width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-color)', color: '#fff', fontSize: '1rem', textAlign: language === 'ar' ? 'right' : 'left'
              }}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            />
            {error && <div style={{ color: 'var(--brand-red)', fontSize: '0.9rem' }}>{error}</div>}
            
            <button
              type="submit"
              className="order-btn"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Header Section */}
      <div style={{ padding: '6rem 0 2rem 0', borderBottom: '1px solid var(--border-color)', marginBottom: '2.5rem' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', color: 'var(--brand-red)', display: 'flex', alignItems: 'center', gap: '0.8rem', margin: 0 }}>
              <Activity size={32} />
              {language === 'ar' ? 'لوحة تحكم المدير (العمليات)' : 'Manager Dashboard (Operations)'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1.1rem' }}>
              {language === 'ar' ? 'متابعة وتحديث حالة الطلبات المباشرة' : 'Track and update live orders'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={fetchData}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 'bold' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--text-secondary)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            >
              <RefreshCw size={18} />
              {language === 'ar' ? 'تحديث البيانات' : 'Refresh Data'}
            </button>
            <button
              onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 'bold' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--brand-red)'; e.currentTarget.style.borderColor = 'var(--brand-red)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            >
              <LogOut size={18} />
              {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        {/* ── Navigation Tabs ────────────────────────────────── */}
        <div className="hide-scrollbar" style={{ display: 'flex', gap: '0.8rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {[
            { key: 'financials', icon: <TrendingUp size={20} />, label: language === 'ar' ? 'البيانات المالية' : 'Financials' },
            { key: 'categories', icon: <Filter size={20} />, label: language === 'ar' ? 'الأقسام' : 'Categories' },
            { key: 'products', icon: <ShoppingBag size={20} />, label: language === 'ar' ? 'المنتجات' : 'Products' },
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
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'financials' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <KPICard 
                title={language === 'ar' ? 'صافي المبيعات' : 'Net Sales'} 
                value={`EGP ${dashboardData.kpis.totalSales.toLocaleString()}`} 
                icon={<TrendingUp size={24} color="#10b981" />} 
                trend={`${dashboardData.kpiTrends.totalSales >= 0 ? '+' : ''}${dashboardData.kpiTrends.totalSales}%`} 
                trendDown={dashboardData.kpiTrends.totalSales < 0}
                periodLabel={language === 'ar' ? (timeFilter === 'today' ? 'اليوم' : timeFilter === 'week' ? 'أسبوع' : 'شهر') : timeFilter}
              />
              <KPICard 
                title={language === 'ar' ? 'المرتجعات والإلغاءات' : 'Returns & Refunds'} 
                value={`EGP ${dashboardData.kpis.cancelledOrders.toLocaleString()}`} 
                icon={<XCircle size={24} color="var(--brand-red)" />} 
                trend={`${dashboardData.kpiTrends.cancelledOrders >= 0 ? '+' : ''}${dashboardData.kpiTrends.cancelledOrders}%`} 
                trendDown={dashboardData.kpiTrends.cancelledOrders > 0} 
                periodLabel={language === 'ar' ? (timeFilter === 'today' ? 'اليوم' : timeFilter === 'week' ? 'أسبوع' : 'شهر') : timeFilter}
              />
              <KPICard 
                title={language === 'ar' ? 'صافي الربح التقديري (25%)' : 'Est. Net Profit (25%)'} 
                value={`EGP ${dashboardData.kpis.estNetProfit.toLocaleString()}`} 
                icon={<DollarSign size={24} color="var(--gold)" />} 
                trend={`${dashboardData.kpiTrends.estNetProfit >= 0 ? '+' : ''}${dashboardData.kpiTrends.estNetProfit}%`} 
                trendDown={dashboardData.kpiTrends.estNetProfit < 0}
                periodLabel={language === 'ar' ? (timeFilter === 'today' ? 'اليوم' : timeFilter === 'week' ? 'أسبوع' : 'شهر') : timeFilter}
              />
              <KPICard 
                title={language === 'ar' ? 'إجمالي الطلبات الناجحة' : 'Successful Orders'} 
                value={dashboardData.kpis.totalOrders.toLocaleString()} 
                icon={<Activity size={24} color="#3b82f6" />} 
                trend={`${dashboardData.kpiTrends.totalOrders >= 0 ? '+' : ''}${dashboardData.kpiTrends.totalOrders}%`} 
                trendDown={dashboardData.kpiTrends.totalOrders < 0}
                periodLabel={language === 'ar' ? (timeFilter === 'today' ? 'اليوم' : timeFilter === 'week' ? 'أسبوع' : 'شهر') : timeFilter}
              />
            </div>

            {/* Sales Chart Section */}
            <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border-color)', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem' }}>
                  {language === 'ar' ? 'المبيعات' : 'Sales Chart'}
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--bg-color)', padding: '0.3rem', borderRadius: '8px' }}>
                  {['today', 'week', 'month', 'year'].map(filter => (
                    <button
                      key={filter}
                      onClick={() => setChartFilter(filter)}
                      style={{
                        padding: '0.5rem 1rem', border: 'none', borderRadius: '6px',
                        backgroundColor: chartFilter === filter ? 'var(--card-bg)' : 'transparent',
                        color: chartFilter === filter ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontWeight: chartFilter === filter ? 'bold' : 'normal',
                        cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      {language === 'ar' ? (filter === 'today' ? 'اليوم' : filter === 'week' ? 'هذا الأسبوع' : filter === 'month' ? 'هذا الشهر' : 'هذا العام') : (filter.charAt(0).toUpperCase() + filter.slice(1))}
                    </button>
                  ))}
                </div>
              </div>
              
              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart 
                    data={getChartData(chartFilter)} 
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    onClick={(e) => {
                       if(e && e.activePayload && e.activePayload.length > 0) {
                          const data = e.activePayload[0].payload;
                          if (data.rawOrders && data.rawOrders.length > 0) {
                             setSelectedGraphPoint(data);
                          } else if (data.rawOrders && data.rawOrders.length === 0) {
                             setToast({ visible: true, message: language === 'ar' ? 'لا يوجد طلبات في هذه الفترة' : 'No orders in this period' });
                             setTimeout(() => setToast({ visible: false, message: '' }), 3000);
                          }
                       }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--brand-red)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="var(--brand-red)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="var(--text-secondary)" 
                      tick={{ fill: 'var(--text-secondary)', fontSize: '0.8rem' }} 
                      axisLine={false} 
                      tickLine={false} 
                      dy={10}
                      interval={chartFilter === 'today' ? 3 : 'preserveStartEnd'}
                      tickFormatter={(val) => {
                        if (chartFilter !== 'today') return val;
                        const [hr, min] = val.split(':');
                        const h12 = (parseInt(hr) % 12) || 12;
                        const ampm = parseInt(hr) >= 12 ? (language === 'ar' ? 'م' : 'PM') : (language === 'ar' ? 'ص' : 'AM');
                        return `${h12}:${min} ${ampm}`;
                      }}
                    />
                    <YAxis 
                      stroke="var(--text-secondary)" 
                      tick={{ fill: 'var(--text-secondary)', fontSize: '0.85rem' }} 
                      axisLine={false} 
                      tickLine={false} 
                      allowDecimals={false}
                      width={45}
                      dx={-10}
                    />
                    <Tooltip 
                      allowEscapeViewBox={{ x: false, y: true }}
                      isAnimationActive={false}
                      wrapperStyle={{ pointerEvents: 'auto' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div 
                              onClick={() => {
                                if (data.rawOrders && data.rawOrders.length > 0) {
                                  setSelectedGraphPoint(data);
                                }
                              }}
                              style={{ cursor: 'pointer', backgroundColor: 'var(--card-bg)', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}
                            >
                              <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>
                                {language === 'ar' ? 'الوقت:' : 'Time:'} <span style={{ color: '#fff', fontWeight: 'bold' }}>{data.tooltipTime || data.name}</span>
                              </p>
                              <p style={{ margin: 0, color: 'var(--brand-red)', fontWeight: 'bold' }}>
                                {language === 'ar' ? 'الطلبات:' : 'Orders:'} {payload[0].value}
                              </p>
                              {data.rawOrders?.length > 0 && (
                                <p style={{ margin: '0.5rem 0 0', color: 'var(--brand-red)', fontSize: '0.8rem', opacity: 0.9, fontWeight: 'bold' }}>
                                  {language === 'ar' ? '👉 انقر هنا لعرض التفاصيل' : '👉 Click here for details'}
                                </p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                      cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 40, style: { cursor: 'pointer' } }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="orders" 
                      stroke="var(--brand-red)" 
                      strokeWidth={4} 
                      fillOpacity={1} 
                      fill="url(#colorSales)" 
                      activeDot={{ 
                        r: 6, fill: 'var(--brand-red)', stroke: '#fff', strokeWidth: 2, 
                        style: { cursor: 'pointer' },
                        onClick: (e, payload) => {
                          if (payload && payload.payload) {
                            const data = payload.payload;
                            if (data.rawOrders && data.rawOrders.length > 0) {
                               setSelectedGraphPoint(data);
                            }
                          }
                        }
                      }}
                    />
                    {selectedGraphPoint && (
                      <ReferenceArea x1={selectedGraphPoint.name} x2={selectedGraphPoint.name} strokeOpacity={0.3} fill="var(--brand-red)" fillOpacity={0.15} />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Order History Table */}
            <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem' }}>
                  {language === 'ar' ? 'سجل الطلبات' : 'Order History'}
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['all', 'confirmed', 'canceled'].map(filter => (
                    <button
                      key={filter}
                      onClick={() => setTableFilter(filter)}
                      style={{
                        padding: '0.5rem 1rem', border: 'none', borderRadius: '20px',
                        backgroundColor: tableFilter === filter ? 'var(--brand-red)' : 'var(--bg-color)',
                        color: tableFilter === filter ? '#fff' : 'var(--text-secondary)',
                        fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      {language === 'ar' ? (filter === 'all' ? 'الكل' : filter === 'confirmed' ? 'مؤكدة' : 'ملغاة') : (filter.charAt(0).toUpperCase() + filter.slice(1))}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 'bold', textAlign: 'center' }}>{language === 'ar' ? 'رقم الطلب' : 'Order ID'}</th>
                      <th style={{ padding: '12px 16px', fontWeight: 'bold', textAlign: 'center' }}>{language === 'ar' ? 'اسم العميل' : 'Customer Name'}</th>
                      <th style={{ padding: '12px 16px', fontWeight: 'bold', textAlign: 'center' }}>{language === 'ar' ? 'المبلغ' : 'Amount'}</th>
                      <th style={{ padding: '12px 16px', fontWeight: 'bold', textAlign: 'center' }}>{language === 'ar' ? 'التاريخ والوقت' : 'Date/Time'}</th>
                      <th style={{ padding: '12px 16px', fontWeight: 'bold', textAlign: 'center' }}>{language === 'ar' ? 'الحالة' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredActualOrders.map((order, idx) => (
                      <tr key={idx} 
                        onClick={() => setSelectedOrder(order)}
                        style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)', transition: 'background-color 0.2s', cursor: 'pointer' }} 
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-color)'} 
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>{order.id}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>{order.customer}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 'bold', color: 'var(--gold)', textAlign: 'center' }}>EGP {order.amount || order.total?.replace('EGP ', '')}</td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', textAlign: 'center' }}>{order.date}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span style={{ 
                            padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', display: 'inline-block',
                            backgroundColor: (order.status === 'Completed' || order.status === 'Confirmed' || order.status === 'Preparing') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: (order.status === 'Completed' || order.status === 'Confirmed' || order.status === 'Preparing') ? '#10b981' : 'var(--brand-red)'
                          }}>
                            {language === 'ar' ? ((order.status === 'Completed' || order.status === 'Confirmed' || order.status === 'Preparing') ? 'مؤكد' : 'ملغى') : order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <AdminCategories categories={categories} fetchData={fetchData} API={API} showToast={showToast} />
        )}

        {activeTab === 'products' && (
          <AdminProducts products={products} categories={categories} fetchData={fetchData} API={API} showToast={showToast} />
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div 
          onClick={() => setSelectedOrder(null)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', backdropFilter: 'blur(5px)' }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{ backgroundColor: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', position: 'relative' }}
          >
            <button 
              onClick={() => setSelectedOrder(null)}
              style={{ position: 'absolute', top: '1rem', right: language === 'ar' ? 'auto' : '1rem', left: language === 'ar' ? '1rem' : 'auto', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <XCircle size={24} />
            </button>
            <h2 style={{ color: 'var(--gold)', margin: '0 0 1.5rem 0' }}>{language === 'ar' ? 'تفاصيل الطلب' : 'Order Details'} {selectedOrder.id}</h2>
            
            <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{language === 'ar' ? 'اسم العميل:' : 'Customer Name:'}</span>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{selectedOrder.customer}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{language === 'ar' ? 'رقم الهاتف:' : 'Phone Number:'}</span>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{selectedOrder.phone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{language === 'ar' ? 'العنوان:' : 'Address:'}</span>
                <span style={{ color: '#fff', fontWeight: 'bold', textAlign: language === 'ar' ? 'left' : 'right', maxWidth: '60%' }}>{selectedOrder.address}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{language === 'ar' ? 'الحالة:' : 'Status:'}</span>
                <span style={{ 
                  color: (selectedOrder.status === 'Completed' || selectedOrder.status === 'Confirmed' || selectedOrder.status === 'Preparing') ? '#10b981' : 'var(--brand-red)',
                  fontWeight: 'bold' 
                }}>
                  {language === 'ar' ? ((selectedOrder.status === 'Completed' || selectedOrder.status === 'Confirmed' || selectedOrder.status === 'Preparing') ? 'مؤكد' : 'ملغى') : selectedOrder.status}
                </span>
              </div>
            </div>

            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>{language === 'ar' ? 'المنتجات' : 'Items'}</h3>
            <div style={{ marginBottom: '2rem', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem' }}>
              {selectedOrder.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', paddingBottom: '0.8rem', borderBottom: i === selectedOrder.items?.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ color: '#fff' }}>
                    <span style={{ color: 'var(--gold)', marginRight: '0.5rem' }}>{`${item.quantity || item.qty || 1}x`}</span> 
                    {item.name}
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>EGP {item.price}</div>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{language === 'ar' ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                <span style={{ color: '#fff' }}>EGP {selectedOrder.subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{language === 'ar' ? 'رسوم التوصيل:' : 'Delivery Fee:'}</span>
                <span style={{ color: '#fff' }}>EGP {selectedOrder.deliveryFee}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gold)', fontWeight: 'bold', fontSize: '1.2rem' }}>{language === 'ar' ? 'الإجمالي:' : 'Total:'}</span>
                <span style={{ color: 'var(--gold)', fontWeight: 'bold', fontSize: '1.2rem' }}>EGP {selectedOrder.amount}</span>
              </div>
            </div>
            
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={() => setShowReceiptPreview(true)}
                className="btn-primary"
                style={{ padding: '0.8rem 2rem', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}
              >
                <Printer size={20} />
                {language === 'ar' ? 'طباعة הפاتورة' : 'Print Receipt'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Graph Point Details Modal */}
      {selectedGraphPoint && (
        <div 
          onClick={() => setSelectedGraphPoint(null)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', backdropFilter: 'blur(5px)' }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{ backgroundColor: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', position: 'relative' }}
          >
            <button 
              onClick={() => setSelectedGraphPoint(null)}
              style={{ position: 'absolute', top: '1rem', right: language === 'ar' ? 'auto' : '1rem', left: language === 'ar' ? '1rem' : 'auto', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <XCircle size={24} />
            </button>
            <h2 style={{ color: 'var(--gold)', margin: '0 0 0.5rem 0' }}>
              {language === 'ar' ? 'تفاصيل الفترة الزمنية' : 'Time Interval Details'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontWeight: 'bold' }}>
              {selectedGraphPoint.tooltipTime || selectedGraphPoint.name}
            </p>

            {/* Metrics Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>{language === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}</div>
                <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold' }}>{selectedGraphPoint.rawOrders?.length || 0}</div>
              </div>
              <div style={{ backgroundColor: 'rgba(229,185,66,0.05)', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(229,185,66,0.2)' }}>
                <div style={{ color: 'var(--gold)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>{language === 'ar' ? 'إجمالي المبيعات' : 'Total Revenue'}</div>
                <div style={{ color: 'var(--gold)', fontSize: '1.5rem', fontWeight: 'bold' }}>
                  EGP {selectedGraphPoint.rawOrders?.reduce((acc, ro) => acc + (ro.amount || 0), 0).toLocaleString()}
                </div>
              </div>
            </div>

            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.1rem' }}>{language === 'ar' ? 'سجل الطلبات' : 'Order Breakdown'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {selectedGraphPoint.rawOrders?.length > 0 ? selectedGraphPoint.rawOrders.map((ro, i) => (
                <div key={i} style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'var(--bg-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem' }}>
                    <div>
                      <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>{ro.id}</span>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        🕒 {ro.exactTime}
                      </div>
                    </div>
                    <div style={{ textAlign: language === 'ar' ? 'left' : 'right' }}>
                      <span style={{ 
                        display: 'inline-block', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem',
                        backgroundColor: (ro.status === 'completed' || ro.status === 'confirmed' || ro.status === 'preparing') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: (ro.status === 'completed' || ro.status === 'confirmed' || ro.status === 'preparing') ? '#10b981' : 'var(--brand-red)'
                      }}>
                        {ro.status.charAt(0).toUpperCase() + ro.status.slice(1)}
                      </span>
                      <div style={{ color: 'var(--gold)', fontWeight: 'bold', fontSize: '1.1rem' }}>{ro.total}</div>
                    </div>
                  </div>
                  
                  {/* Items List */}
                  {ro.items && ro.items.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {ro.items.map((item, idx) => (
                        <div key={idx} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 'bold', color: 'var(--brand-red)' }}>{`${item.quantity || item.qty || 1}x`}</span>
                          <span>{item.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )) : (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                  {language === 'ar' ? 'لا يوجد طلبات في هذه الفترة' : 'No orders in this period'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Receipt Preview Modal */}
      <ReceiptPreviewModal
        isOpen={showReceiptPreview}
        onClose={() => setShowReceiptPreview(false)}
        order={selectedOrder}
        onPrint={handlePrint}
        autoPrintEnabled={autoPrintEnabled}
        setAutoPrintEnabled={setAutoPrintEnabled}
        language={language}
      />
    </div>
  );
}

// Subcomponents & Styles
const KPICard = ({ title, value, icon, trend, trendDown, periodLabel }) => (
  <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'transform 0.3s', cursor: 'default', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ color: 'var(--text-secondary)', margin: '0 0 0.5rem 0', fontSize: '0.95rem', fontWeight: 'bold' }}>{title}</p>
        <h3 style={{ color: '#fff', margin: 0, fontSize: '1.8rem' }}>{value}</h3>
      </div>
      <div style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
        {icon}
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ 
        display: 'inline-block', 
        padding: '0.2rem 0.6rem', 
        borderRadius: '20px', 
        fontSize: '0.85rem', 
        fontWeight: 'bold', 
        backgroundColor: trendDown ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
        color: trendDown ? 'var(--brand-red)' : '#10b981'
      }}>
        {trend}
      </span>
      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{periodLabel}</span>
    </div>
  </div>
);

const tableHeaderStyle = {
  padding: '1.2rem',
  color: 'var(--text-secondary)',
  fontWeight: '600',
  fontSize: '0.95rem',
  borderBottom: '1px solid var(--border-color)'
};

const tableCellStyle = {
  padding: '1.2rem',
  color: '#fff',
  fontSize: '0.95rem'
};
