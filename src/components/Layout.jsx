import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Globe, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import LogoImg from '../../Images/2.png';

const Navbar = () => {
  const location = useLocation();
  const path = location.pathname;
  const { cart } = useCart();
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const { t, language, toggleLanguage } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/menu', label: t('nav.menu') },
    { to: '/about', label: t('nav.about') },
    { to: '/reservations', label: t('nav.reservations') },
    { to: '/contact', label: t('nav.contact') },
    { to: '/track', label: language === 'ar' ? 'تتبع الطلب' : 'Track Order' },
  ];

  return (
    <nav className="navbar">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Logo */}
        <Link to="/" className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1100 }}>
          <img src={LogoImg} alt="Al Demashqi Logo" style={{ height: 'clamp(32px, 8vw, 44px)', filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))' }} />
        </Link>

        {/* Desktop nav links */}
        <div className="nav-links nav-links-desktop" style={{ alignItems: 'center', display: 'flex', gap: '1.5rem' }}>
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} className={path === link.to ? 'nav-link active' : 'nav-link'}>
              {link.label}
            </Link>
          ))}

          <button onClick={toggleLanguage} className="lang-toggle" style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>
            <Globe size={16} />
            <span style={{ fontWeight: 'bold' }}>{language === 'en' ? 'عربي' : 'EN'}</span>
          </button>

          <Link to="/checkout" className={path === '/checkout' ? 'nav-link active' : 'nav-link'} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', position: 'relative' }}>
            <ShoppingCart size={20} />
            {cartItemCount > 0 && (
              <span style={{ position: 'absolute', top: '-8px', right: '-12px', background: 'var(--gold)', color: 'var(--bg-color)', fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '10px' }}>
                {cartItemCount}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile: cart + hamburger */}
        <div className="nav-mobile-controls" style={{ display: 'none', alignItems: 'center', gap: '1rem', zIndex: 1100 }}>
          <Link to="/checkout" style={{ display: 'flex', alignItems: 'center', position: 'relative', color: 'var(--text-primary)' }}>
            <ShoppingCart size={22} />
            {cartItemCount > 0 && (
              <span style={{ position: 'absolute', top: '-8px', right: '-10px', background: 'var(--gold)', color: 'var(--bg-color)', fontSize: '0.65rem', fontWeight: 'bold', padding: '2px 5px', borderRadius: '10px' }}>
                {cartItemCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label="Toggle menu"
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.3rem', display: 'flex', alignItems: 'center' }}
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <div
        className="mobile-menu glass-panel"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1050,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem',
          transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {navLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            onClick={() => setMenuOpen(false)}
            style={{
              fontSize: 'clamp(1.5rem, 5vw, 1.8rem)',
              fontWeight: '700',
              color: path === link.to ? 'var(--gold)' : 'var(--text-primary)',
              textDecoration: 'none',
              borderBottom: path === link.to ? '2px solid var(--brand-red)' : '2px solid transparent',
              padding: '0.5rem 1rem',
              width: '100%',
              textAlign: 'center',
              transition: 'color 0.2s',
            }}
          >
            {link.label}
          </Link>
        ))}
        <button
          onClick={() => { toggleLanguage(); setMenuOpen(false); }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontSize: '1.1rem', marginTop: '1rem' }}
        >
          <Globe size={18} />
          <span style={{ fontWeight: 'bold' }}>{language === 'en' ? 'عربي' : 'EN'}</span>
        </button>
      </div>
    </nav>
  );
};

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src={LogoImg} alt="Al Demashqi Logo" style={{ height: '80px', marginBottom: '1rem', filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))' }} />
          <p>{t('footer.desc')}</p>
        </div>
        <div className="nav-links" style={{ justifyContent: 'center', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <Link to="/" className="nav-link">{t('nav.home')}</Link>
          <Link to="/menu" className="nav-link">{t('nav.menu')}</Link>
          <Link to="/about" className="nav-link">{t('nav.about')}</Link>
          <Link to="/reservations" className="nav-link">{t('nav.reservations')}</Link>
          <Link to="/contact" className="nav-link">{t('nav.contact')}</Link>
          <Link to="/contact" className="nav-link" style={{ color: 'var(--brand-red)' }}>{t('footer.feedback')}</Link>
        </div>
        <p
          onClick={() => {
            window.__adminClicks = (window.__adminClicks || 0) + 1;
            if (window.__adminClicks >= 3) {
              window.__adminClicks = 0;
              window.location.pathname.includes('demashqi-restaurant-v.3.2')
                ? window.location.assign('/demashqi-restaurant-v.3.2/admin')
                : window.location.assign('/admin');
            }
          }}
          style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer', userSelect: 'none' }}
          title=""
        >
          &copy; {new Date().getFullYear()} {t('footer.rights')} | Developed by Mostafa & Osama
        </p>
      </div>
    </footer>
  );
};

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
