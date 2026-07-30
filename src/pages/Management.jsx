import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Lock, TrendingUp, XCircle, DollarSign, Users, LogOut, Activity, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Management() {
  const { language } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [timeFilter, setTimeFilter] = useState('today');
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [selectedGraphPoint, setSelectedGraphPoint] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const API = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000`;
  const [allOrders, setAllOrders] = useState([]);

  // Prevent body scroll when any modal is open
  useEffect(() => {
    if (selectedOrder || selectedGraphPoint) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedOrder, selectedGraphPoint]);

  // Authentication Check
  useEffect(() => {
    const authStatus = sessionStorage.getItem('admin_session');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      fetchOrders();
    }
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API}/api/admin/orders`);
      if (res.ok) {
        const data = await res.json();
        setAllOrders(data);
      }
    } catch (err) {
      console.error('Error fetching orders for management', err);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'manager123') {
      sessionStorage.setItem('admin_session', 'true');
      setIsAuthenticated(true);
      setError('');
      fetchOrders();
    } else {
      setError(language === 'ar' ? 'كلمة المرور غير صحيحة' : 'Incorrect password');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_session');
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

    let currentRevenue = 0, currentOrders = 0, currentCancelled = 0;
    let prevRevenue = 0, prevOrders = 0, prevCancelled = 0;
    const recentDisplay = [];
    
    // Generate 48 buckets of 30 mins each
    const peakMap = {};
    for (let h = 0; h < 24; h++) {
      const hr = h.toString().padStart(2, '0');
      peakMap[`${hr}:00`] = { count: 0, orders: [] };
      peakMap[`${hr}:30`] = { count: 0, orders: [] };
    }

    allOrders.forEach(order => {
      const orderDate = new Date(Number(order.created_at) > 1000000000 ? Number(order.created_at) : order.created_at);
      const isCurrent = orderDate >= currentStart && orderDate < currentEnd;
      const isPrevious = orderDate >= previousStart && orderDate < previousEnd;
      const orderTotal = typeof order.total === 'number' ? order.total : parseFloat(order.total) || 0;

      if (isCurrent) {
        currentOrders += 1;
        
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
            exactTime: `${h12}:${m}:${s} ${ampm}`
          });
        }

        if (order.status === 'completed') {
          currentRevenue += orderTotal;
        } else if (order.status === 'cancelled') {
          currentCancelled += 1;
        }

        if (order.status === 'completed') {
          recentDisplay.push({
            id: order.daily_id ? `#ORD-${order.daily_id}` : `#ORD-${order.id}`,
            customer: order.name || 'Unknown Customer',
            phone: order.phone || '-',
            address: order.address || '-',
            items: order.items || [],
            duration: order.duration || 'N/A',
            ref: order.ref || '',
            total: `EGP ${orderTotal.toLocaleString()}`,
            status: 'Completed',
            time: orderDate.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {hour: '2-digit', minute:'2-digit'}),
            _timestamp: orderDate.getTime()
          });
        }
      } else if (isPrevious) {
        prevOrders += 1;
        if (order.status === 'completed') {
          prevRevenue += orderTotal;
        } else if (order.status === 'cancelled') {
          prevCancelled += 1;
        }
      }
    });

    recentDisplay.sort((a, b) => b._timestamp - a._timestamp);

    const calcTrend = (curr, prev) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    setDashboardData({
      kpis: {
        totalSales: currentRevenue,
        estNetProfit: currentRevenue * 0.25,
        cancelledOrders: currentCancelled,
        totalOrders: currentOrders
      },
      kpiTrends: {
        totalSales: calcTrend(currentRevenue, prevRevenue),
        estNetProfit: calcTrend(currentRevenue * 0.25, prevRevenue * 0.25),
        cancelledOrders: calcTrend(currentCancelled, prevCancelled),
        totalOrders: calcTrend(currentOrders, prevOrders)
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
            <h1 style={{ color: 'var(--gold)', fontSize: '2.5rem', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <Activity size={32} />
              {language === 'ar' ? 'لوحة المبيعات الإدارية' : 'Management Sales Dashboard'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1.1rem' }}>
              {language === 'ar' ? 'تحليل المبيعات، الطلبات، وأوقات الذروة' : 'Sales, Orders, and Peak Times Analysis'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={fetchOrders}
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
        
        {/* Time Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', alignItems: 'center' }} dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {[
            { id: 'today', ar: 'هذا اليوم', en: 'Today' },
            { id: 'this_week', ar: 'هذا الأسبوع', en: 'This Week' },
            { id: 'this_month', ar: 'هذا الشهر', en: 'This Month' },
            { id: 'this_year', ar: 'هذه السنة', en: 'This Year' }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setTimeFilter(filter.id)}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 'bold',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                backgroundColor: timeFilter === filter.id ? 'var(--brand-red)' : 'rgba(255,255,255,0.05)',
                color: timeFilter === filter.id ? '#fff' : 'var(--text-secondary)'
              }}
            >
              {language === 'ar' ? filter.ar : filter.en}
            </button>
          ))}
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <KPICard 
            title={language === 'ar' ? 'إجمالي المبيعات' : 'Total Sales'} 
            value={`EGP ${dashboardData.kpis.totalSales.toLocaleString()}`} 
            icon={<TrendingUp size={24} color="#10b981" />} 
            trend={`${dashboardData.kpiTrends.totalSales > 0 ? '+' : ''}${dashboardData.kpiTrends.totalSales}%`} 
            trendDown={dashboardData.kpiTrends.totalSales < 0}
            periodLabel={getPeriodLabel()}
          />
          <KPICard 
            title={language === 'ar' ? 'الطلبات الملغاة' : 'Cancelled Orders'} 
            value={dashboardData.kpis.cancelledOrders.toLocaleString()} 
            icon={<XCircle size={24} color="var(--brand-red)" />} 
            trend={`${dashboardData.kpiTrends.cancelledOrders > 0 ? '+' : ''}${dashboardData.kpiTrends.cancelledOrders}%`} 
            trendDown={dashboardData.kpiTrends.cancelledOrders > 0} 
            periodLabel={getPeriodLabel()}
          />
          <KPICard 
            title={language === 'ar' ? 'صافي الربح التقديري (25%)' : 'Est. Net Profit (25%)'} 
            value={`EGP ${dashboardData.kpis.estNetProfit.toLocaleString()}`} 
            icon={<DollarSign size={24} color="var(--gold)" />} 
            trend={`${dashboardData.kpiTrends.estNetProfit > 0 ? '+' : ''}${dashboardData.kpiTrends.estNetProfit}%`} 
            trendDown={dashboardData.kpiTrends.estNetProfit < 0}
            periodLabel={getPeriodLabel()}
          />
          <KPICard 
            title={language === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'} 
            value={dashboardData.kpis.totalOrders.toLocaleString()} 
            icon={<Users size={24} color="#3b82f6" />} 
            trend={`${dashboardData.kpiTrends.totalOrders > 0 ? '+' : ''}${dashboardData.kpiTrends.totalOrders}%`} 
            trendDown={dashboardData.kpiTrends.totalOrders < 0}
            periodLabel={getPeriodLabel()}
          />
        </div>

        {/* Charts Row */}
        <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '1rem', marginBottom: '2.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
          <h3 style={{ color: '#fff', marginBottom: '1.5rem', fontSize: '1.2rem', padding: '0 0.5rem' }}>
            {language === 'ar' ? 'أوقات الذروة والمبيعات بالساعة' : 'Peak Times & Hourly Sales'}
          </h3>
          <div style={{ height: '350px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={dashboardData.peakTimes.map(d => {
                  const [hStr, mStr] = d.time.split(':');
                  const hour = parseInt(hStr);
                  const ampm = hour >= 12 ? (language === 'ar' ? 'م' : 'PM') : (language === 'ar' ? 'ص' : 'AM');
                  const hour12 = hour % 12 || 12;
                  return { ...d, displayTime: `${hour12}:${mStr} ${ampm}` };
                })} 
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  if (e && e.activePayload && e.activePayload.length > 0) {
                    handleGraphClick(e.activePayload[0].payload);
                  }
                }}
              >
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--gold)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--gold)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis 
                  dataKey="displayTime" 
                  stroke="var(--text-secondary)" 
                  tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} 
                  interval={3}
                  tickFormatter={(tickItem) => typeof tickItem === 'string' ? tickItem.replace(':00', '') : tickItem}
                />
                <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--gold)', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: 'var(--gold)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="var(--gold)" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorOrders)" 
                  activeDot={{ 
                    cursor: 'pointer', 
                    r: 6,
                    onClick: (e, payload) => {
                      if (payload && payload.payload) handleGraphClick(payload.payload);
                    }
                  }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>
              {language === 'ar' ? 'أحدث طلبات العملاء' : 'Recent Customer Orders'}
            </h3>
            <input 
              type="text" 
              placeholder={language === 'ar' ? "بحث برقم الأوردر أو العميل..." : "Search Order ID or Customer..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: '#fff', minWidth: '250px' }}
            />
          </div>
          <div className="hide-scrollbar" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: language === 'ar' ? 'right' : 'left' }} dir={language === 'ar' ? 'rtl' : 'ltr'}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                  <th style={tableHeaderStyle}>{language === 'ar' ? 'رقم الطلب' : 'Order ID'}</th>
                  <th style={tableHeaderStyle}>{language === 'ar' ? 'العميل' : 'Customer'}</th>
                  <th style={tableHeaderStyle}>{language === 'ar' ? 'الهاتف' : 'Phone'}</th>
                  <th style={tableHeaderStyle}>{language === 'ar' ? 'الإجمالي' : 'Total'}</th>
                  <th style={tableHeaderStyle}>{language === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th style={tableHeaderStyle}>{language === 'ar' ? 'الوقت' : 'Time'}</th>
                </tr>
              </thead>
              <tbody>
                {(showAllOrders ? dashboardData.recentOrders : dashboardData.recentOrders.slice(0, 5))
                  .filter(o => searchQuery === '' || 
                    String(o.id).includes(searchQuery) || 
                    (o.customer || '').toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((order, idx) => (
                  <tr 
                    key={idx} 
                    onClick={() => setSelectedOrder(order)}
                    style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s', cursor: 'pointer' }} 
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'} 
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td data-label={language === 'ar' ? 'رقم الطلب' : 'Order ID'} style={tableCellStyle}><span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>{order.id}</span></td>
                    <td data-label={language === 'ar' ? 'العميل' : 'Customer'} style={tableCellStyle}>{order.customer}</td>
                    <td data-label={language === 'ar' ? 'الهاتف' : 'Phone'} style={tableCellStyle}><span style={{ color: 'var(--text-secondary)' }}>{order.phone}</span></td>
                    <td data-label={language === 'ar' ? 'الإجمالي' : 'Total'} style={tableCellStyle}>{order.total}</td>
                    <td data-label={language === 'ar' ? 'الحالة' : 'Status'} style={tableCellStyle}>
                      <span style={{ 
                        padding: '0.3rem 0.8rem', 
                        borderRadius: '20px', 
                        fontSize: '0.85rem', 
                        fontWeight: 'bold',
                        backgroundColor: order.status === 'Completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: order.status === 'Completed' ? '#10b981' : 'var(--brand-red)'
                      }}>
                        {order.status === 'Completed' && language === 'ar' ? 'مكتمل' : 
                         order.status === 'Completed' ? 'Completed' : 
                         order.status === 'Cancelled' && language === 'ar' ? 'ملغي' : 'Cancelled'}
                      </span>
                    </td>
                    <td data-label={language === 'ar' ? 'الوقت' : 'Time'} style={tableCellStyle}>
                      <span 
                        title={new Date(order._timestamp).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                        style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', cursor: 'help' }}
                      >
                        {order.time}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {dashboardData.recentOrders.length > 5 && (
            <div style={{ padding: '1.5rem', textAlign: 'center', borderTop: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setShowAllOrders(!showAllOrders)}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--gold)',
                  color: 'var(--gold)',
                  padding: '0.6rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.2s',
                  fontSize: '0.95rem'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(229, 185, 66, 0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                {showAllOrders 
                  ? (language === 'ar' ? 'طي السجل' : 'Collapse History') 
                  : (language === 'ar' ? 'عرض السجل الكامل' : 'View Full History')}
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: '1rem'
        }} onClick={() => setSelectedOrder(null)}>
          <div style={{
            backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)',
            borderRadius: '16px', width: '95%', maxWidth: '600px',
            maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem',
            position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            textAlign: language === 'ar' ? 'right' : 'left'
          }} onClick={e => e.stopPropagation()} dir={language === 'ar' ? 'rtl' : 'ltr'}>
            
            <button onClick={() => setSelectedOrder(null)} style={{ position: 'absolute', top: '1.5rem', [language === 'ar' ? 'left' : 'right']: '1.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <XCircle size={28} />
            </button>

            <h2 style={{ color: 'var(--gold)', margin: '0.5rem 0', fontSize: '1.5rem', paddingInlineEnd: '2.5rem' }}>
              {language === 'ar' ? 'تفاصيل الطلب' : 'Order Details'}
            </h2>
            <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
              <span>{selectedOrder.id}</span>
              <span>•</span>
              <span>{selectedOrder.ref}</span>
              <span>•</span>
              <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
                {new Date(selectedOrder._timestamp).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem', padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.3rem' }}>{language === 'ar' ? 'العميل' : 'Customer'}</p>
                <p style={{ color: '#fff', fontWeight: 'bold' }}>{selectedOrder.customer}</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.3rem' }}>{language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}</p>
                <p style={{ color: '#fff', fontWeight: 'bold' }}>{selectedOrder.phone}</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.3rem' }}>{language === 'ar' ? 'العنوان' : 'Address'}</p>
                <p style={{ color: '#fff', fontWeight: 'bold' }}>{selectedOrder.address || 'N/A'}</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.3rem' }}>{language === 'ar' ? 'مدة التوصيل المستغرقة' : 'Delivery Duration'}</p>
                <p style={{ color: '#fff', fontWeight: 'bold' }}>{selectedOrder.duration}</p>
              </div>
            </div>

            <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              {language === 'ar' ? 'قائمة الأصناف' : 'Order Items'}
            </h3>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0' }}>
              {selectedOrder.items.map((item, i) => {
                const itemQty = item.quantity || item.qty || 1;
                const itemPrice = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
                return (
                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>x{itemQty}</span>
                    <span style={{ color: '#fff' }}>{item.name}</span>
                  </div>
                  <span style={{ color: 'var(--text-secondary)' }}>EGP {itemPrice * itemQty}</span>
                </li>
              )})}
            </ul>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', backgroundColor: 'var(--brand-red)', borderRadius: '12px', color: '#fff' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{language === 'ar' ? 'إجمالي الفاتورة' : 'Total Bill'}</span>
              <span style={{ fontSize: '1.5rem', fontWeight: '900' }}>{selectedOrder.total}</span>
            </div>

          </div>
        </div>
      )}

      {/* Graph Point Details Modal */}
      {selectedGraphPoint && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: '1rem'
        }} onClick={() => setSelectedGraphPoint(null)}>
          <div style={{
            backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)',
            borderRadius: '16px', width: '95%', maxWidth: '750px',
            maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem',
            position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          }} onClick={e => e.stopPropagation()} dir={language === 'ar' ? 'rtl' : 'ltr'}>
            
            <button onClick={() => setSelectedGraphPoint(null)} style={{ position: 'absolute', top: '1.5rem', right: language === 'ar' ? 'auto' : '1.5rem', left: language === 'ar' ? '1.5rem' : 'auto', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem' }}>
              <XCircle size={24} />
            </button>
            
            <h2 style={{ color: 'var(--gold)', margin: '0.5rem 0', fontSize: '1.5rem', paddingInlineEnd: '2.5rem' }}>
              {language === 'ar' ? `تفاصيل فترة (${selectedGraphPoint.displayTime})` : `Period Details (${selectedGraphPoint.displayTime})`}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              {language === 'ar' ? `إجمالي الأوردرات في هذه الفترة: ${selectedGraphPoint.orders}` : `Total orders in this period: ${selectedGraphPoint.orders}`}
            </p>

            <div className="table-responsive hide-scrollbar" style={{ backgroundColor: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: language === 'ar' ? 'right' : 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                    <th style={tableHeaderStyle}>{language === 'ar' ? 'رقم الطلب' : 'Order ID'}</th>
                    <th style={tableHeaderStyle}>{language === 'ar' ? 'التوقيت' : 'Time'}</th>
                    <th style={tableHeaderStyle}>{language === 'ar' ? 'الحالة' : 'Status'}</th>
                    <th style={tableHeaderStyle}>{language === 'ar' ? 'السعر' : 'Price'}</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedGraphPoint.rawOrders && selectedGraphPoint.rawOrders.length > 0 ? (
                    selectedGraphPoint.rawOrders.map((ro, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={tableCellStyle}><span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>{ro.id}</span></td>
                        <td style={tableCellStyle}><span style={{ color: 'var(--text-secondary)' }}>{ro.exactTime}</span></td>
                        <td style={tableCellStyle}>
                          <span style={{ 
                            padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold',
                            backgroundColor: ro.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: ro.status === 'completed' ? '#10b981' : 'var(--brand-red)'
                          }}>
                            {ro.status === 'completed' && language === 'ar' ? 'مكتمل' : 
                             ro.status === 'completed' ? 'Completed' : 
                             ro.status === 'cancelled' && language === 'ar' ? 'ملغي' : 
                             ro.status === 'cancelled' ? 'Cancelled' : ro.status}
                          </span>
                        </td>
                        <td style={tableCellStyle}>{ro.total}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ ...tableCellStyle, textAlign: 'center', color: 'var(--text-secondary)' }}>
                        {language === 'ar' ? 'لا توجد طلبات في هذه الفترة' : 'No orders in this period'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

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
