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

import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';
import Checkout from './pages/Checkout';
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

function App() {
  return (
    <LanguageProvider>
      <CartProvider>
        <Router basename="/sertaurant">
          <ScrollToTop />
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
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/track" element={<OrderTracking />} />
            </Routes>
          </Layout>
        </Router>
      </CartProvider>
    </LanguageProvider>
  );
}

export default App;
