import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Phone } from 'lucide-react';

export default function AboutUs() {
  const { language } = useLanguage();

  return (
    <div className="fade-in">
      <header className="page-header" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: `linear-gradient(var(--dark-overlay), var(--dark-overlay)), url(${import.meta.env.BASE_URL}Images/44.png)`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="container" style={{ textAlign: 'center', padding: '0 1rem' }}>
          <h1 className="scale-in" style={{ fontSize: 'clamp(2.2rem, 7vw, 5rem)', color: 'var(--gold)', textShadow: '0 8px 20px rgba(0,0,0,0.9)', marginBottom: '1rem' }}>
            {language === 'ar' ? 'قصتنا' : 'Our Story'}
          </h1>
          <p className="fade-in stagger-1" style={{ fontSize: 'clamp(1rem, 3vw, 1.6rem)', color: '#fff', fontWeight: 'bold', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
            {language === 'ar' ? 'رحلة الشغف بالأكل الشامي الأصيل، من قلب دمشق إلى مائدتك.' : 'A journey of passion for authentic Levantine cuisine, from the heart of Damascus to your table.'}
          </p>
        </div>
      </header>

      <section className="section container">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(3rem, 6vw, 5rem)', alignItems: 'center', maxWidth: '1000px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', marginBottom: '2rem', color: 'var(--gold)' }}>
              {language === 'ar' ? 'من نحن' : 'Who We Are'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '1.2rem', lineHeight: '2' }}>
              {language === 'ar' ? (
                <>
                  <p>تأسس مطعم الدمشقي من شغف عميق بالطهي الشامي التقليدي. لقد أخذنا على عاتقنا مهمة الحفاظ على النكهات الأصيلة التي تميزت بها مدينة دمشق، أقدم مدينة مأهولة في العالم.</p>
                  <p>نحن لا نقدم مجرد طعام، بل نقدم تجربة وثقافة. من التتبيلات السرية التي يتم تحضيرها يومياً، إلى اللحوم الطازجة والخبز الساخن، كل طبق يروي قصة عراقة وأصالة. فريقنا من الطهاة المحترفين يجمع بين الخبرة الطويلة والحب والشغف لتقديم أفضل تجربة تذوق لكل ضيف.</p>
                </>
              ) : (
                <>
                  <p>Al Demashqi Restaurant was founded on a deep passion for traditional Levantine cooking. We made it our mission to preserve the authentic flavors that define Damascus, one of the oldest continuously inhabited cities in the world.</p>
                  <p>We don't just serve food; we serve culture and history. From our secret marinades prepared fresh daily, to our premium meats and freshly baked bread, every dish tells a story of heritage. Our team of master chefs combines decades of experience with an absolute love for their craft to deliver an unforgettable culinary experience.</p>
                </>
              )}
            </div>
          </div>

          <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--border-color)' }}></div>

          <div style={{ textAlign: 'center', width: '100%' }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', marginBottom: 'clamp(1.5rem, 4vw, 3rem)', color: 'var(--gold)' }}>
              {language === 'ar' ? 'فروعنا' : 'Our Branches'}
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
              {[
                {
                  en: { name: 'Main Branch', address: 'Al-Muhafaza St. - In front of Social Club' },
                  ar: { name: 'الفرع الرئيسي', address: 'شارع المحافظة - امام النادي الاجتماعي' },
                  phones: '045/3149997 - 01094956760'
                },
                {
                  en: { name: 'Al-Rahibat Branch', address: 'Damanhour - Middle of Al-Rahibat St.' },
                  ar: { name: 'فرع الراهبات', address: 'دمنهور - منتصف شارع الراهبات' },
                  phones: '045/3220067 - 01060646298'
                },
                {
                  en: { name: 'Damanhour University Branch', address: 'Colleges Complex - University Tower' },
                  ar: { name: 'فرع جامعة دمنهور', address: 'مجمع الكليات - برج الجامعة' },
                  phones: '045/3149998'
                }
              ].map((branch, i) => (
                <div key={i} className={`fade-in stagger-${(i % 4) + 1}`} style={{ backgroundColor: 'var(--card-bg)', padding: '2.5rem 2rem', borderRadius: '12px', border: '1px solid var(--border-color)', transition: 'transform 0.3s ease, border-color 0.3s ease' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'var(--brand-red)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}>
                  <h3 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
                    {language === 'ar' ? branch.ar.name : branch.en.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: '1rem', marginBottom: '1.2rem', color: 'var(--text-secondary)' }}>
                    <MapPin color="var(--brand-red)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
                    <span style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>{language === 'ar' ? branch.ar.address : branch.en.address}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
                    <Phone color="var(--brand-red)" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{branch.phones}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--border-color)', margin: '2rem 0' }}></div>

          <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: 'clamp(2rem, 5vw, 4rem)', alignItems: 'center', marginBottom: '4rem' }}>
            <div style={{ flex: '1 1 280px' }}>
              <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', marginBottom: '1.5rem', color: 'var(--gold)' }}>
                {language === 'ar' ? 'تصفح القائمة الأصلية' : 'View Original Menu'}
              </h2>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                {language === 'ar' 
                  ? 'يمكنك هنا تصفح صفحات المنيو الأصلية الخاصة بنا للتعرف على جميع الأصناف بالتفصيل، من الشاورما السورية الأصيلة والبروستد، إلى البيتزا والمعجنات الطازجة.' 
                  : 'Here you can browse our original physical menu pages to see all our items in detail, from authentic Syrian Shawarma and Broasted, to fresh Pizzas and pastries.'}
              </p>
            </div>
            
            <div style={{ flex: '1 1 400px', display: 'flex', gap: '1.5rem' }}>
              <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', border: '2px solid var(--border-color)', transition: 'transform 0.3s ease' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                <img src={`${import.meta.env.BASE_URL}Images/44.png`} alt="Menu Page 1" style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
              <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', border: '2px solid var(--border-color)', transition: 'transform 0.3s ease' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                <img src={`${import.meta.env.BASE_URL}Images/45.png`} alt="Menu Page 2" style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
