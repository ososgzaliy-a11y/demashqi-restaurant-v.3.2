const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'src');

const dirs = [
  'components',
  'pages',
  'assets'
];

dirs.forEach(d => fs.mkdirSync(path.join(src, d), { recursive: true }));

const indexCss = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');

:root {
  --bg-color: #0a0a0a;
  --text-primary: #f5f5f5;
  --text-secondary: #a0a0a0;
  --gold: #d4af37;
  --gold-hover: #f3c93f;
  --dark-overlay: rgba(10, 10, 10, 0.8);
  --card-bg: #141414;
  --border-color: #2a2a2a;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg-color);
  color: var(--text-primary);
  line-height: 1.6;
  overflow-x: hidden;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Playfair Display', serif;
  font-weight: 600;
  color: var(--gold);
}

a {
  text-decoration: none;
  color: inherit;
  transition: color 0.3s ease;
}

a:hover {
  color: var(--gold);
}

button {
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* Utilities */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section {
  padding: 6rem 0;
}

.fade-in {
  animation: fadeIn 1s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.btn-primary {
  background-color: var(--gold);
  color: var(--bg-color);
  border: none;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-radius: 4px;
}

.btn-primary:hover {
  background-color: var(--gold-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
}

.btn-outline {
  background-color: transparent;
  color: var(--gold);
  border: 1px solid var(--gold);
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-radius: 4px;
}

.btn-outline:hover {
  background-color: var(--gold);
  color: var(--bg-color);
}

/* Layout */
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  background-color: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(10px);
  z-index: 1000;
  border-bottom: 1px solid var(--border-color);
  padding: 1.5rem 0;
}

.navbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-brand {
  font-family: 'Playfair Display', serif;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--gold);
  letter-spacing: 2px;
  text-transform: uppercase;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 400;
}

.nav-link.active {
  color: var(--gold);
}

.footer {
  background-color: var(--card-bg);
  padding: 4rem 0 2rem;
  border-top: 1px solid var(--border-color);
  text-align: center;
}

.footer-content {
  margin-bottom: 2rem;
}

.footer-brand {
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  color: var(--gold);
  margin-bottom: 1rem;
}

/* Specific page layouts */
.hero {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: linear-gradient(var(--dark-overlay), var(--dark-overlay)), url('https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?q=80&w=2070&auto=format&fit=crop') center/cover;
}

.hero h1 {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: #fff;
  text-shadow: 0 4px 12px rgba(0,0,0,0.5);
}

.hero p {
  font-size: 1.2rem;
  color: #ddd;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.page-header {
  padding: 10rem 0 4rem;
  text-align: center;
  background-color: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
}

.page-header h1 {
  font-size: 3.5rem;
}
`;

fs.writeFileSync(path.join(src, 'index.css'), indexCss);

const appJsx = `import React from 'react';
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

function App() {
  return (
    <Router>
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
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
`;

fs.writeFileSync(path.join(src, 'App.jsx'), appJsx);
fs.writeFileSync(path.join(src, 'App.css'), '');

const mainJsx = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`;

fs.writeFileSync(path.join(src, 'main.jsx'), mainJsx);

const layoutJsx = `import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">Al Demashqi</Link>
        <div className="nav-links">
          <Link to="/" className={path === '/' ? 'nav-link active' : 'nav-link'}>Home</Link>
          <Link to="/menu" className={path === '/menu' ? 'nav-link active' : 'nav-link'}>Menu</Link>
          <Link to="/about" className={path === '/about' ? 'nav-link active' : 'nav-link'}>About</Link>
          <Link to="/reservations" className={path === '/reservations' ? 'nav-link active' : 'nav-link'}>Reservations</Link>
          <Link to="/contact" className={path === '/contact' ? 'nav-link active' : 'nav-link'}>Contact</Link>
        </div>
      </div>
    </nav>
  );
};

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-content">
        <div className="footer-brand">Al Demashqi</div>
        <p>Authentic Syrian & Middle Eastern Cuisine</p>
      </div>
      <div className="nav-links" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
        <Link to="/gallery" className="nav-link">Gallery</Link>
        <Link to="/locations" className="nav-link">Locations</Link>
        <Link to="/story" className="nav-link">Our Story</Link>
        <Link to="/chef" className="nav-link">Chef</Link>
        <Link to="/events" className="nav-link">Events</Link>
        <Link to="/testimonials" className="nav-link">Testimonials</Link>
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>&copy; {new Date().getFullYear()} Al Demashqi Restaurant. All rights reserved.</p>
    </div>
  </footer>
);

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
`;

fs.writeFileSync(path.join(src, 'components/Layout.jsx'), layoutJsx);

const pages = [
  'AboutUs', 'Gallery', 'Reservations', 'Locations', 
  'ContactUs', 'OurStory', 'Chef', 'Events', 'Testimonials'
];

pages.forEach(page => {
  const content = `import React from 'react';

export default function ${page}() {
  return (
    <div className="fade-in">
      <header className="page-header">
        <div className="container">
          <h1>${page.replace(/([A-Z])/g, ' $1').trim()}</h1>
        </div>
      </header>
      <section className="section container">
        <p>Premium content for ${page} will be displayed here.</p>
      </section>
    </div>
  );
}
`;
  fs.writeFileSync(path.join(src, `pages/${page}.jsx`), content);
});

console.log('Scaffold complete.');
