import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import Menu from './pages/Menu';
import Gallery from './pages/Gallery';
import Reservations from './pages/Reservations';
import Locations from './pages/Locations';
import ContactUs from './pages/ContactUs';
import OurStory from './pages/OurStory';
import Chef from './pages/Chef';
import Events from './pages/Events';
import Testimonials from './pages/Testimonials';
import Management from './pages/Management';

import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';
import Admin from './pages/Admin';
import OrderTracking from './pages/OrderTracking';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Scrolls to top of page on every route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

// Global App-like Event Handlers
function GlobalEventHandlers() {
  useEffect(() => {
    const handleContextMenu = (e) => {
      const target = e.target;
      // Allow context menu only on input and textarea elements
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }
      e.preventDefault();
    };
    
    window.addEventListener('contextmenu', handleContextMenu);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);
  
  return null;
}

function App() {
  return (
    <LanguageProvider>
      <CartProvider>
        <Router basename="/demashqi-restaurant-v.3.2">
          <ScrollToTop />
          <GlobalEventHandlers />
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/reservations" element={<Reservations />} />
              <Route path="/locations" element={<Locations />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/story" element={<OurStory />} />
              <Route path="/chef" element={<Chef />} />
              <Route path="/events" element={<Events />} />
              <Route path="/testimonials" element={<Testimonials />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/management" element={<Management />} />
              <Route path="/track" element={<OrderTracking />} />
              <Route path="*" element={
                <div style={{ padding: '12rem 2rem', textAlign: 'center', minHeight: '60vh' }}>
                  <h1 style={{ fontSize: '4rem', color: 'var(--brand-red)', marginBottom: '1rem' }}>404</h1>
                  <h2 style={{ fontSize: '2rem', color: 'var(--gold)', marginBottom: '1rem' }}>الصفحة غير موجودة</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>نعتذر، المسار الذي تحاول الوصول إليه غير متاح أو تم نقله.</p>
                </div>
              } />
            </Routes>
          </Layout>
        </Router>
      </CartProvider>
    </LanguageProvider>
  );
}

export default App;
