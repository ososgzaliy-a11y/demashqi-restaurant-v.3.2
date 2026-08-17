import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function AboutUs() {
  const { language, t } = useLanguage();

  return (
    <div className="fade-in">
      <header className="page-header no-interaction" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: `linear-gradient(var(--dark-overlay), var(--dark-overlay)), url(${import.meta.env.BASE_URL}Images/hero_shawarma.png)`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="container" style={{ textAlign: 'center', padding: '0 1rem' }}>
          <h1 className="scale-in" style={{ fontSize: 'clamp(2.2rem, 7vw, 5rem)', color: 'var(--gold)', textShadow: '0 8px 20px rgba(0,0,0,0.9)', marginBottom: '1rem' }}>
            {language === 'ar' ? 'قصتنا' : 'Our Story'}
          </h1>
          <p className="fade-in stagger-1" style={{ fontSize: 'clamp(1rem, 3vw, 1.6rem)', color: '#fff', fontWeight: 'bold', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
            {language === 'ar' ? 'رحلة ١٠ سنوات من الشغف بتقديم المأكولات السورية الأصيلة.' : 'A 10-year journey of passion for authentic Syrian cuisine.'}
          </p>
        </div>
      </header>

      <section className="section container">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(3rem, 6vw, 5rem)', alignItems: 'center', maxWidth: '1000px', margin: '0 auto' }}>

          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', marginBottom: '2rem', color: 'var(--gold)' }}>
              {language === 'ar' ? 'الخيار الأول في دمنهور' : '#1 Choice in Damanhour'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '1.2rem', lineHeight: '2' }}>
              {language === 'ar' ? (
                <>
                  <p>تأسس مطعم الشرق للمأكولات السورية منذ أكثر من ١٠ سنوات ليكون نقلة نوعية في عالم المأكولات الشامية في دمنهور. لقد أخذنا على عاتقنا مهمة تقديم الطعم السوري الأصيل لكل عشاق الطعام.</p>
                  <p>نحن لا نقدم مجرد طعام، بل نقدم قطعة من دمشق. من الشاورما المحمرة ببطء على السيخ، إلى أطباق الفتة الغنية والمخبوزات الطازجة، كل طبق يروي قصة التزامنا بالطعم الأصيل. فريقنا من أمهر الطهاة السوريين يضمن لك تجربة لا تُنسى.</p>
                </>
              ) : (
                <>
                  <p>Al Sharq Syrian Restaurant was founded over 10 years ago to bring a paradigm shift to Levantine cuisine in Damanhour. We made it our mission to deliver authentic Syrian taste to every food lover.</p>
                  <p>We don't just serve food; we offer a piece of Damascus. From slow-roasted shawarma on the spit to rich fatteh plates and fresh pastries, every dish tells a story of our commitment to authentic flavors. Our team of skilled Syrian chefs ensures an unforgettable experience.</p>
                </>
              )}
            </div>
          </div>

          <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--border-color)' }}></div>

          <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: 'clamp(2rem, 5vw, 4rem)', alignItems: 'center', marginBottom: '4rem' }}>
            <div style={{ flex: '1 1 280px' }}>
              <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', marginBottom: '1.5rem', color: 'var(--gold)' }}>
                {language === 'ar' ? 'شهادة سلامة الغذاء' : 'Food Safety Certificate'}
              </h2>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                {language === 'ar'
                  ? 'نفخر في مطعم الشرق بحصولنا على "شهادة سلامة الغذاء" والتي تضمن تطبيق أعلى معايير الجودة والنظافة. كل مكوناتنا طازجة ونحرص دائماً على صحة وسلامة عملائنا الكرام لضمان تجربة طعام آمنة ولذيذة.'
                  : 'At Al Sharq, we are proud to hold the "Food Safety Certificate", ensuring the highest standards of quality and hygiene. All our ingredients are fresh, and we always prioritize the health and safety of our valued customers.'}
              </p>
            </div>

            <div style={{ flex: '1 1 400px', display: 'flex', gap: '1.5rem' }}>
              <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', border: '2px solid var(--border-color)', transition: 'transform 0.3s ease' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                <img src={import.meta.env.BASE_URL + "Images/fatteh_syrian.png"} alt="Syrian Fatteh" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
              <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', border: '2px solid var(--border-color)', transition: 'transform 0.3s ease' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                <img src={import.meta.env.BASE_URL + "Images/qalbouza.png"} alt="Qalbouza" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
