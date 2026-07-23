import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Reservations() {
  const { language } = useLanguage();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    date: '',
    time: '',
    guests: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [bookedSlots, setBookedSlots] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem('demashqi_booked_slots');
    if (saved) {
      setBookedSlots(JSON.parse(saved));
    }
  }, []);

  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  };
  const availableDates = generateDates();

  const baseTimeSlots = [
    { time: '12:00 PM', defaultAvailable: true },
    { time: '01:00 PM', defaultAvailable: true },
    { time: '02:00 PM', defaultAvailable: false }, // Simulating hardcoded unavailable
    { time: '03:30 PM', defaultAvailable: true },
    { time: '05:00 PM', defaultAvailable: false },
    { time: '06:30 PM', defaultAvailable: true },
    { time: '07:00 PM', defaultAvailable: true },
    { time: '08:30 PM', defaultAvailable: true },
    { time: '09:00 PM', defaultAvailable: true },
    { time: '10:00 PM', defaultAvailable: false }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'guests' ? parseInt(value) : value)
    }));
  };

  const selectDate = (dateObj) => {
    setFormData(prev => ({ ...prev, date: dateObj.toISOString().split('T')[0], time: '' }));
  };

  const selectTime = (timeStr) => {
    setFormData(prev => ({ ...prev, time: timeStr }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.time) {
      setStatus({ type: 'error', message: language === 'ar' ? 'الرجاء تحديد التاريخ والوقت.' : 'Please select a date and time.' });
      return;
    }

    setStatus({ type: 'loading', message: language === 'ar' ? 'جاري التأكيد...' : 'Submitting...' });
    
    try {
      const response = await fetch(`http://${window.location.hostname}:3000/api/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.[0]?.message || 'Failed to submit reservation');
      }

      // Track booked slot
      const newBookedSlots = { ...bookedSlots };
      if (!newBookedSlots[formData.date]) {
        newBookedSlots[formData.date] = [];
      }
      newBookedSlots[formData.date].push(formData.time);
      setBookedSlots(newBookedSlots);
      localStorage.setItem('demashqi_booked_slots', JSON.stringify(newBookedSlots));

      setStatus({ type: 'success', message: language === 'ar' ? 'تم تأكيد الحجز!' : 'Reservation confirmed!' });
      setFormData(prev => ({ ...prev, name: '', email: '', date: '', time: '', guests: '' }));
    } catch (error) {
      setStatus({ type: 'error', message: language === 'ar' ? 'حدث خطأ أثناء إرسال الحجز.' : 'An error occurred while submitting.' });
    }
  };

  return (
    <div className="fade-in">
      <header className="page-header" style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: `linear-gradient(var(--dark-overlay), var(--dark-overlay)), url(${import.meta.env.BASE_URL}Images/12.png)`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="container" style={{ textAlign: 'center', padding: '0 1rem' }}>
          <h1 className="scale-in" style={{ fontSize: 'clamp(2.2rem, 7vw, 4.5rem)', color: 'var(--gold)', textShadow: '0 8px 20px rgba(0,0,0,0.9)', marginBottom: '1rem' }}>
            {language === 'ar' ? 'احجز طاولتك' : 'Book a Table'}
          </h1>
          <p className="fade-in stagger-1" style={{ fontSize: 'clamp(1rem, 3vw, 1.4rem)', color: '#fff', fontWeight: 'bold' }}>
            {language === 'ar' ? 'احجز مكانك لتجربة طعام لا تُنسى.' : 'Reserve your spot for an unforgettable dining experience.'}
          </p>
        </div>
      </header>

      <section className="section container" style={{ maxWidth: '860px' }}>
        <div className="scale-in" style={{ backgroundColor: 'var(--card-bg)', padding: 'clamp(1.5rem, 5vw, 4rem)', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
          {status.message && (
            <div className="fade-in" style={{ padding: '1.5rem', marginBottom: '2rem', borderRadius: '8px', backgroundColor: status.type === 'success' ? 'rgba(46, 204, 113, 0.1)' : 'rgba(200, 16, 46, 0.1)', color: status.type === 'success' ? '#2ecc71' : 'var(--brand-red)', border: `1px solid ${status.type === 'success' ? '#2ecc71' : 'var(--brand-red)'}`, textAlign: 'center', fontWeight: 'bold', fontSize: '1.1rem' }}>
              {status.message}
            </div>
          )}
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ fontSize: '1.3rem', color: 'var(--gold)', fontWeight: 'bold' }}>
                {language === 'ar' ? 'اختر اليوم' : 'Select a Date'}
              </label>
              <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'thin' }}>
                {availableDates.map((d, i) => {
                  const dateStr = d.toISOString().split('T')[0];
                  const isSelected = formData.date === dateStr;
                  const dayName = new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'short' }).format(d);
                  const dayNum = new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric' }).format(d);
                  const monthName = new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'short' }).format(d);
                  
                  return (
                    <button type="button" key={i} onClick={() => selectDate(d)} style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '90px', height: '100px', borderRadius: '12px', border: `2px solid ${isSelected ? 'var(--brand-red)' : 'var(--border-color)'}`, backgroundColor: isSelected ? 'rgba(200, 16, 46, 0.1)' : 'transparent', color: isSelected ? 'var(--brand-red)' : 'var(--text-primary)', transition: 'all 0.3s ease' }} onMouseEnter={e => !isSelected && (e.currentTarget.style.borderColor = 'var(--gold)')} onMouseLeave={e => !isSelected && (e.currentTarget.style.borderColor = 'var(--border-color)')}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{dayName}</span>
                      <span style={{ fontSize: '1.8rem', fontWeight: '900', margin: '0.2rem 0' }}>{dayNum}</span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{monthName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {formData.date && (
              <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label style={{ fontSize: '1.3rem', color: 'var(--gold)', fontWeight: 'bold' }}>
                  {language === 'ar' ? 'الوقت المتاح' : 'Available Times'}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
                  {baseTimeSlots.map((slot, i) => {
                    const isBooked = bookedSlots[formData.date]?.includes(slot.time);
                    const isAvailable = slot.defaultAvailable && !isBooked;
                    const isSelected = formData.time === slot.time;
                    
                    return (
                      <button type="button" key={i} disabled={!isAvailable} onClick={() => selectTime(slot.time)} style={{ padding: '1rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', border: `2px solid ${isSelected ? 'var(--brand-red)' : 'var(--border-color)'}`, backgroundColor: isSelected ? 'var(--brand-red)' : 'transparent', color: isSelected ? '#fff' : (isAvailable ? 'var(--text-primary)' : 'var(--border-color)'), opacity: isAvailable ? 1 : 0.5, cursor: isAvailable ? 'pointer' : 'not-allowed', transition: 'all 0.3s ease' }} onMouseEnter={e => isAvailable && !isSelected && (e.currentTarget.style.borderColor = 'var(--brand-red)')} onMouseLeave={e => isAvailable && !isSelected && (e.currentTarget.style.borderColor = 'var(--border-color)')}>
                        {isBooked ? (language === 'ar' ? 'محجوز' : 'Booked') : slot.time}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ fontSize: '1.3rem', color: 'var(--gold)', fontWeight: 'bold' }}>
                {language === 'ar' ? 'تفاصيل الاتصال' : 'Contact Details'}
              </label>
              <div className="responsive-grid-2">
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required placeholder={language === 'ar' ? 'الاسم الكامل' : 'Full Name'} style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.3)', color: 'var(--text-primary)', fontSize: '1.1rem' }} />
                <input type="number" id="guests" name="guests" min="1" max="20" value={formData.guests} onChange={handleChange} required placeholder={language === 'ar' ? 'عدد الأشخاص' : 'Number of Guests'} style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.3)', color: 'var(--text-primary)', fontSize: '1.1rem' }} />
              </div>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required placeholder={language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'} style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.3)', color: 'var(--text-primary)', fontSize: '1.1rem' }} />
            </div>


            
            <button type="submit" className="btn-primary" style={{ marginTop: '1rem', padding: '1.2rem', fontSize: '1.3rem', borderRadius: '50px' }} disabled={status.type === 'loading'}>
              {status.type === 'loading' ? (language === 'ar' ? 'جاري المعالجة...' : 'Processing...') : (language === 'ar' ? 'تأكيد الحجز' : 'Confirm Reservation')}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
