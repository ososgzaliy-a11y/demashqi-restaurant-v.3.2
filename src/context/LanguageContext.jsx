import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    'nav.home': 'Home',
    'nav.menu': 'Menu',
    'nav.about': 'About Us',
    'nav.reservations': 'Reservations',
    'nav.contact': 'Contact',
    'hero.title': 'Al Sharq Restaurant',
    'hero.subtitle': 'The Origin of Syrian Shawarma in Damanhour. Discover the authentic Syrian taste.',
    'hero.book': 'View Menu',
    'hero.menu': 'Order Now',
    'info.address': 'Al Mohandes Mahmoud Al Habrok Street, Damanhour',
    'info.hours': 'Open Daily: 24 Hours',
    'info.phone': 'Hotlines: 01024488110 / 01556861715',
    'story.subtitle': 'Our 10-Year Journey',
    'story.title': '#1 Choice in Damanhour',
    'story.text': 'For over 10 years, Al Sharq has been the premier choice in Damanhour for authentic Syrian cuisine. Holding a Food Safety Certificate, we guarantee the highest quality, clean, and authentic Damascene taste.',
    'story.btn': 'Discover Our Story',
    'featured.subtitle': 'Signature Dishes',
    'featured.title': 'Authentic Syrian Masterpieces',
    'featured.dish1.name': 'Meat & Chicken Shawarma',
    'featured.dish1.desc': 'Slow-roasting Syrian meat and chicken shawarma on a spit.',
    'featured.dish2.name': 'Syrian Fatteh',
    'featured.dish2.desc': 'Rich plates of Fatteh with toasted bread, yogurt sauce, and roasted nuts.',
    'featured.dish3.name': 'Crispy Chicken Pizza',
    'featured.dish3.desc': 'Crispy golden fried chicken on a rich mozzarella pizza.',
    'featured.btn': 'View Full Menu',
    'footer.desc': 'Al Sharq Syrian Restaurant - Authentic Taste of Damascus.',
    'footer.gallery': 'Gallery',
    'footer.locations': 'Locations',
    'footer.story': 'Our Story',
    'footer.chef': 'Our Chefs',
    'footer.events': 'Events',
    'footer.testimonials': 'Testimonials',
    'footer.feedback': 'Feedback',
    'footer.rights': 'Al Sharq. All rights reserved.',
    'contact.title': 'Contact Us',
    'contact.subtitle': 'Fastest Delivery in Damanhour',
    'contact.getInTouch': 'Get in Touch',
    'contact.getInTouchDesc': 'Al Sharq has the largest call center in Damanhour, operating 24 hours. Message us on WhatsApp or call our hotlines.',
    'contact.location': '📍 Location',
    'contact.locationDesc': 'Al Mohandes Mahmoud Al Habrok Street, Damanhour',
    'contact.phone': '📞 Phone',
    'contact.phoneDesc': '01024488110\n01556861715 (WhatsApp)\n0453188894',
    'contact.email': '✉️ Email',
    'contact.emailDesc': 'hello@alsharq.com',
    'contact.form.name': 'Name',
    'contact.form.email': 'Email',
    'contact.form.subject': 'Subject',
    'contact.form.subjectPlaceholder': 'Tell us your opinion...',
    'contact.form.message': 'Message',
    'contact.form.sending': 'Sending...',
    'contact.form.send': 'Send Message',
    'contact.status.success': 'Message sent!',
    'contact.status.fail': 'Failed to send message.',
    'contact.status.networkError': 'Network error.',
    'track.title': 'Track Your Order',
    'track.subtitle': 'Enter your Order ID',
    'track.placeholder': 'e.g. Order #42',
    'track.btn': 'Track',
    'track.checking': 'Checking status...',
    'track.notFound': 'Order not found.',
    'track.networkError': 'Network error.',
    'track.orderNum': 'Order #',
    'track.placedOn': 'Placed on',
    'track.address': 'Delivery Address',
    'track.step.placed': 'Placed',
    'track.step.preparing': 'Preparing',
    'track.step.onway': 'On the Way',
    'track.step.delivered': 'Delivered',
    'track.payment.vodafone': 'Vodafone Cash',
    'track.payment.cash': 'Cash',
    'menu.title': 'Our Menu',
    'menu.subtitle': 'Click to order',
    'menu.filter.all': 'All',
    'menu.categories': {
      'shawarma': 'Shawarma',
      'fatteh': 'Syrian Fatteh',
      'pizza': 'Pizza & Pastries',
      'inventions': 'Al Sharq Inventions',
    },
    'menu.items': {
      'sh_1': { name: 'Meat Shawarma', desc: 'Authentic Syrian meat shawarma.', price: 120 },
      'sh_2': { name: 'Chicken Shawarma', desc: 'Slow-roasted chicken shawarma.', price: 100 },
      'ft_1': { name: 'Meat Fatteh', desc: 'Rice, toasted bread, yogurt and meat shawarma.', price: 150 },
      'ft_2': { name: 'Chicken Fatteh', desc: 'Rice, toasted bread, yogurt and chicken shawarma.', price: 140 },
      'pz_1': { name: 'Crispy Chicken Pizza', desc: 'Signature crispy chicken with mozzarella.', price: 160 },
      'pz_2': { name: 'Cheese Pastry', desc: 'Authentic Syrian cheese manakeesh.', price: 60 },
      'inv_1': { name: 'Qalbouza', desc: 'Stuffed pastry with melting cheese and shawarma.', price: 180 },
    }
  },
  ar: {
    'nav.home': 'الرئيسية',
    'nav.menu': 'المنيو',
    'nav.about': 'عن الشرق',
    'nav.reservations': 'الحجوزات',
    'nav.contact': 'اتصل بنا',
    'hero.title': 'أصل الشاورما السورية في دمنهور',
    'hero.subtitle': 'مطعم الشرق للمأكولات السورية.. الطعم الدمشقي الأصيل الذي تبحث عنه.',
    'hero.book': 'تصفح المنيو',
    'hero.menu': 'اطلب الآن',
    'info.address': 'شارع المهندس محمود الحبروك، دمنهور',
    'info.hours': 'مفتوح يومياً: ٢٤ ساعة',
    'info.phone': 'الخط الساخن: 01024488110',
    'story.subtitle': 'رحلة ١٠ سنوات',
    'story.title': 'الخيار الأول في دمنهور',
    'story.text': 'مطعم الشرق هو الخيار رقم ١ في دمنهور لأكثر من ١٠ سنوات. حاصلون على "شهادة سلامة الغذاء" لضمان أعلى جودة ونظافة وطعم سوري أصيل.',
    'story.btn': 'اكتشف قصتنا',
    'featured.subtitle': 'أطباق مميزة',
    'featured.title': 'روائع المطبخ السوري',
    'featured.dish1.name': 'شاورما لحم ودجاج',
    'featured.dish1.desc': 'أصل الشاورما السورية بتتبيلة مطعم الشرق السرية.',
    'featured.dish2.name': 'فتة سورية',
    'featured.dish2.desc': 'أطباق الفتة الغنية بالعيش المحمص وصوص الزبادي.',
    'featured.dish3.name': 'بيتزا كرسبي تشيكن',
    'featured.dish3.desc': 'بيتزا بقطع الدجاج الكرسبي المقرمشة وجبنة الموتزاريلا.',
    'featured.btn': 'عرض المنيو كامل',
    'footer.desc': 'مطعم الشرق - الطعم السوري الأصيل.',
    'footer.gallery': 'معرض الصور',
    'footer.locations': 'فروعنا',
    'footer.story': 'عن الشرق',
    'footer.chef': 'الطهاة',
    'footer.events': 'الفعاليات',
    'footer.testimonials': 'آراء العملاء',
    'footer.feedback': 'المقترحات',
    'footer.rights': 'مطعم الشرق. جميع الحقوق محفوظة.',
    'contact.title': 'أسرع دليفري في دمنهور',
    'contact.subtitle': 'أكبر كول سنتر في دمنهور يعمل ٢٤ ساعة لخدمتكم.',
    'contact.getInTouch': 'تواصل معنا',
    'contact.getInTouchDesc': 'لدينا أسرع خدمة توصيل، اطلب الآن واستمتع بالطعم السوري الأصيل.',
    'contact.location': '📍 الموقع',
    'contact.locationDesc': 'شارع المهندس محمود الحبروك، دمنهور',
    'contact.phone': '📞 الهاتف',
    'contact.phoneDesc': '01024488110\n01556861715 (WhatsApp)\n0453188894',
    'contact.email': '✉️ البريد الإلكتروني',
    'contact.emailDesc': 'hello@alsharq.com',
    'contact.form.name': 'الاسم',
    'contact.form.email': 'البريد الإلكتروني',
    'contact.form.subject': 'الموضوع',
    'contact.form.subjectPlaceholder': 'أخبرنا برأيك...',
    'contact.form.message': 'الرسالة',
    'contact.form.sending': 'جاري الإرسال...',
    'contact.form.send': 'إرسال الرسالة',
    'contact.status.success': 'تم الإرسال بنجاح!',
    'contact.status.fail': 'فشل الإرسال.',
    'contact.status.networkError': 'خطأ في الشبكة.',
    'track.title': 'تتبع طلبك',
    'track.subtitle': 'أدخل رقم الطلب',
    'track.placeholder': 'رقم الطلب',
    'track.btn': 'تتبع',
    'track.checking': 'جاري التحقق...',
    'track.notFound': 'الطلب غير موجود.',
    'track.networkError': 'خطأ في الشبكة.',
    'track.orderNum': 'طلب رقم #',
    'track.placedOn': 'تم الطلب في',
    'track.address': 'عنوان التوصيل',
    'track.step.placed': 'تم الطلب',
    'track.step.preparing': 'جاري التحضير',
    'track.step.onway': 'في الطريق',
    'track.step.delivered': 'تم التوصيل',
    'track.payment.vodafone': 'فودافون كاش',
    'track.payment.cash': 'كاش',
    'menu.title': 'قائمة الطعام',
    'menu.subtitle': 'اضغط على أي صنف لإضافته إلى طلبك',
    'menu.filter.all': 'الكل',
    'menu.categories': {
      'shawarma': 'شاورما',
      'fatteh': 'فتة سورية',
      'pizza': 'بيتزا و معجنات',
      'inventions': 'اختراعات الشرق',
    },
    'menu.items': {
      'sh_1': { name: 'شاورما لحم', desc: 'شاورما لحم سورية أصيلة.', price: 120 },
      'sh_2': { name: 'شاورما دجاج', desc: 'شاورما دجاج متبلة بأشهى البهارات السورية.', price: 100 },
      'ft_1': { name: 'فتة شاورما لحم', desc: 'أرز، خبز محمص، شاورما لحم وصوص الفتة.', price: 150 },
      'ft_2': { name: 'فتة شاورما دجاج', desc: 'أرز، خبز محمص، شاورما دجاج وصوص الفتة.', price: 140 },
      'pz_1': { name: 'بيتزا كرسبي تشيكن', desc: 'بيتزا غنية بقطع الدجاج الكرسبي والموتزاريلا.', price: 160 },
      'pz_2': { name: 'فطيرة جبنة سورية', desc: 'معجنات بجبنة العكاوي السورية الممتازة.', price: 60 },
      'inv_1': { name: 'القلبوظة', desc: 'اختراع الشرق: معجنات محشوة بالجبنة السائحة والشاورما.', price: 180 },
    }
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('ar');

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'ar' : 'en'));
  };

  const t = (key) => {
    // Try exact flat match first
    if (translations[language][key]) {
      return translations[language][key];
    }
    // Try nested match
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      if (value === undefined) break;
      value = value[k];
    }
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
