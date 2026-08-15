import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Globe, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import LogoImg from '../../Images/2.png';
import Checkout from '../pages/Checkout';
import FloatingSocialMenu from './FloatingSocialMenu';
import SocialMediaFooter from './SocialMediaFooter';
const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const { cart, openCheckout, closeCheckout } = useCart();
  const cartItemCount = (cart || []).reduce((total, item) => total + (item?.quantity || 1), 0);
  const { t, language, toggleLanguage } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
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
  }, [menuOpen]);

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/menu', label: t('nav.menu'), isResetLink: true },
    { to: '/about', label: t('nav.about') },
    { to: '/reservations', label: t('nav.reservations') },
    { to: '/contact', label: t('nav.contact') },
    { to: '/track', label: language === 'ar' ? 'تتبع الطلب' : 'Track Order' },
  ];

  const handleResetNavigation = (e, targetPath) => {
    e.preventDefault();
    closeCheckout();
    setMenuOpen(false);
    window.dispatchEvent(new CustomEvent('resetUIState'));
    navigate(targetPath);
  };

  return (
    <>
      <nav className="navbar">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Logo */}
        <a href="/" onClick={(e) => handleResetNavigation(e, '/')} className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1100, cursor: 'pointer' }}>
          <img src={LogoImg} alt="Bait El-Asmak Logo" style={{ height: 'clamp(32px, 8vw, 44px)', filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))' }} />
        </a>

        {/* Desktop nav links */}
        <div className="nav-links nav-links-desktop" style={{ alignItems: 'center', display: 'flex', gap: '1.5rem' }}>
          {navLinks.map(link => (
            link.isResetLink ? (
              <a key={link.to} href={link.to} onClick={(e) => handleResetNavigation(e, link.to)} className={path === link.to ? 'nav-link active' : 'nav-link'} style={{ transition: 'color 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = '#FBBF24'} onMouseLeave={(e) => e.target.style.color = ''}>
                {link.label}
              </a>
            ) : (
              <Link key={link.to} to={link.to} className={path === link.to ? 'nav-link active' : 'nav-link'}>
                {link.label}
              </Link>
            )
          ))}

          <button onClick={toggleLanguage} className="lang-toggle" style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'transparent', color: '#fff', border: '1px solid var(--border-color)', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>
            <Globe size={16} />
            <span style={{ fontWeight: 'bold' }}>{language === 'en' ? 'عربي' : 'EN'}</span>
          </button>

          {path !== '/admin-dashboard' && path !== '/manager-dashboard' && (
            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); openCheckout(); }} className={path === '/checkout' ? 'nav-link active' : 'nav-link'} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer', color: '#fff' }}>
              <ShoppingCart size={20} />
              {cartItemCount > 0 && (
                <span style={{ position: 'absolute', top: '-8px', right: '-12px', background: 'var(--gold)', color: 'var(--bg-color)', fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '10px' }}>
                  {cartItemCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Mobile: cart + hamburger */}
        <div className="nav-mobile-controls" style={{ display: 'none', alignItems: 'center', gap: '1rem', zIndex: 1100 }}>
          {path !== '/admin-dashboard' && path !== '/manager-dashboard' && (
            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); openCheckout(); }} style={{ display: 'flex', alignItems: 'center', position: 'relative', color: '#fff', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <ShoppingCart size={22} />
              {cartItemCount > 0 && (
                <span style={{ position: 'absolute', top: '-8px', right: '-10px', background: 'var(--gold)', color: 'var(--bg-color)', fontSize: '0.65rem', fontWeight: 'bold', padding: '2px 5px', borderRadius: '10px' }}>
                  {cartItemCount}
                </span>
              )}
            </button>
          )}
          <button
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label="Toggle menu"
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.3rem', display: 'flex', alignItems: 'center' }}
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>
    </nav>

      {/* Backdrop */}
      <div 
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          zIndex: 1040,
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
          backdropFilter: 'blur(4px)'
        }}
        onClick={() => setMenuOpen(false)}
      />

      {/* Mobile Dropdown Menu Window */}
      <div
        className="mobile-menu"
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          right: language === 'ar' ? 'auto' : 0,
          left: language === 'ar' ? 0 : 'auto',
          width: '280px',
          maxWidth: '85vw',
          backgroundColor: 'var(--card-bg)',
          zIndex: 1050,
          display: 'flex',
          flexDirection: 'column',
          padding: '5rem 1.5rem 2rem',
          gap: '1rem',
          transform: menuOpen ? 'translateX(0)' : `translateX(${language === 'ar' ? '-100%' : '100%'})`,
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: language === 'ar' ? '5px 0 20px rgba(0,0,0,0.1)' : '-5px 0 20px rgba(0,0,0,0.1)',
          overflowY: 'auto'
        }}
      >
        <button 
          onClick={() => setMenuOpen(false)}
          style={{ position: 'absolute', top: '20px', right: language === 'ar' ? 'auto' : '20px', left: language === 'ar' ? '20px' : 'auto', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
        >
          <X size={28} />
        </button>

        {navLinks.map(link => (
          link.isResetLink ? (
            <a
              key={link.to}
              href={link.to}
              onClick={(e) => handleResetNavigation(e, link.to)}
              style={{
                fontSize: '1.3rem',
                fontWeight: '700',
                color: path === link.to ? 'var(--brand-red)' : 'var(--text-primary)',
                textDecoration: 'none',
                padding: '0.8rem 1rem',
                width: '100%',
                textAlign: language === 'ar' ? 'right' : 'left',
                borderBottom: '1px solid var(--border-color)',
                transition: 'all 0.2s',
              }}
            >
              {link.label}
            </a>
          ) : (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              style={{
                fontSize: '1.3rem',
                fontWeight: '700',
                color: path === link.to ? 'var(--brand-red)' : 'var(--text-primary)',
                textDecoration: 'none',
                padding: '0.8rem 1rem',
                width: '100%',
                textAlign: language === 'ar' ? 'right' : 'left',
                borderBottom: '1px solid var(--border-color)',
                transition: 'all 0.2s',
              }}
            >
              {link.label}
            </Link>
          )
        ))}
        <button
          onClick={() => { toggleLanguage(); setMenuOpen(false); }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'transparent', color: 'var(--text-primary)', border: '2px solid var(--brand-red)', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', marginTop: '1.5rem', fontWeight: 'bold', width: '100%' }}
        >
          <Globe size={18} />
          <span>{language === 'en' ? 'عربي' : 'EN'}</span>
        </button>
      </div>
    </>
  );
};

const Footer = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  return (
    <footer className="footer no-interaction">
      <div className="container">
        <div className="footer-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src={LogoImg} alt="Bait El-Asmak Logo" draggable="false" style={{ height: '80px', marginBottom: '1rem', filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))' }} />
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
        <SocialMediaFooter customLogo={LogoImg} />
        <p
          onClick={() => {
            window.__adminClicks = (window.__adminClicks || 0) + 1;
            if (window.__adminClicks >= 3) {
              window.__adminClicks = 0;
              navigate('/admin-dashboard');
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

const FloatingCart = () => {
  const { cart, openCheckout } = useCart();
  const { language } = useLanguage();
  const cartItemCount = (cart || []).reduce((total, item) => total + (item?.quantity || 1), 0);
  const location = useLocation();

  const [showTooltip, setShowTooltip] = useState(false);
  const [animateCart, setAnimateCart] = useState(false);

  useEffect(() => {
    const handleAdd = () => {
      setShowTooltip(true);
      setAnimateCart(true);
      setTimeout(() => setAnimateCart(false), 500);
      setTimeout(() => setShowTooltip(false), 3000);
    };
    window.addEventListener('itemAddedToCart', handleAdd);
    return () => window.removeEventListener('itemAddedToCart', handleAdd);
  }, []);

  const isDashboard = location.pathname === '/admin-dashboard' || location.pathname === '/manager-dashboard';
  if (cartItemCount === 0 || isDashboard) return null;

  return (
    <div className="flex flex-col items-end gap-2" style={{ position: 'fixed', right: '1.5rem', bottom: '12vh', zIndex: 50, pointerEvents: 'auto' }}>
      {/* CTA Label */}
      <div style={{
        backgroundColor: '#000',
        color: '#fff',
        padding: '0.6rem 1rem',
        borderRadius: '8px',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        border: '1px solid #333',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        opacity: showTooltip ? 1 : 0,
        transform: showTooltip ? 'translateY(0)' : 'translateY(10px)',
        pointerEvents: 'none',
        marginBottom: '0.5rem'
      }}>
        {language === 'ar' ? 'اضغط هنا للذهاب لـ Checkout' : 'Click here to Checkout'}
        <div style={{
          position: 'absolute',
          bottom: '-6px',
          right: '25px',
          width: '12px',
          height: '12px',
          backgroundColor: '#000',
          borderRight: '1px solid #333',
          borderBottom: '1px solid #333',
          transform: 'rotate(45deg)'
        }}></div>
      </div>
      
      {/* Floating Button */}
      <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); openCheckout(); }} style={{
        backgroundColor: 'var(--brand-red)',
        color: '#fff',
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: animateCart ? '0 0 25px rgba(200,16,46,0.8)' : '0 4px 15px rgba(200,16,46,0.4)',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        transform: animateCart ? 'scale(1.15)' : 'scale(1)',
        alignSelf: 'flex-end',
        position: 'relative'
      }}
      onMouseEnter={(e) => { if (!animateCart) e.currentTarget.style.transform = 'scale(1.1)' }}
      onMouseLeave={(e) => { if (!animateCart) e.currentTarget.style.transform = 'scale(1)' }}
      >
        <ShoppingCart size={30} />
        <span style={{
          position: 'absolute',
          top: '-2px',
          right: '-2px',
          backgroundColor: 'var(--gold)',
          color: '#000',
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '0.9rem',
          transition: 'transform 0.2s',
          transform: animateCart ? 'scale(1.2)' : 'scale(1)'
        }}>
          {cartItemCount}
        </span>
      </button>
    </div>
  );
};

export default function Layout({ children }) {
  const { isCheckoutOpen, closeCheckout } = useCart();
  const { language } = useLanguage();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const handleAdd = () => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    };
    window.addEventListener('itemAddedToCart', handleAdd);
    return () => window.removeEventListener('itemAddedToCart', handleAdd);
  }, []);

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <FloatingCart />
      <FloatingSocialMenu />
      
      {/* Success Toast Notification */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: `translateX(-50%) translateY(${showToast ? '0' : '-100px'})`,
        opacity: showToast ? 1 : 0,
        backgroundColor: '#2ecc71',
        color: '#fff',
        padding: '1rem 2rem',
        borderRadius: '30px',
        fontWeight: 'bold',
        fontSize: '1.1rem',
        boxShadow: '0 10px 25px rgba(46, 204, 113, 0.4)',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        zIndex: 100000,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        ✅ {language === 'ar' ? 'تم إضافة المنتج للسلة بنجاح' : 'Item added to cart successfully'}
      </div>

      {/* Checkout Modal Overlay */}
      {isCheckoutOpen && (
        <Checkout isModal={true} onClose={closeCheckout} />
      )}
    </>
  );
}
