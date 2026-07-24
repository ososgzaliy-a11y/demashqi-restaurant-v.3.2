import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Reservations() {
  const { language } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    tableId: '',
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

  const restaurantTables = [
    // VIP Rooms (Top)
    { id: 'V1', name: 'Elegant Suite 1', maxGuests: 8, minGuests: 6, type: 'round', top: '16.5%', left: '16.5%' },
    { id: 'V2', name: 'Elegant Suite 2', maxGuests: 8, minGuests: 6, type: 'round', top: '16.5%', left: '44%' },
    { id: 'V3', name: 'Elegant Suite 3', maxGuests: 8, minGuests: 6, type: 'round', top: '16.5%', left: '66%' },

    // Main Hall (15 tables)
    { id: 'M1', name: 'Family Table 1', maxGuests: 4, minGuests: 1, type: 'rect', top: '45%', left: '40%' },
    { id: 'M2', name: 'Family Table 2', maxGuests: 4, minGuests: 1, type: 'rect', top: '45%', left: '50%' },
    { id: 'M3', name: 'Family Table 3', maxGuests: 4, minGuests: 1, type: 'rect', top: '45%', left: '60%' },
    { id: 'M4', name: 'Family Table 4', maxGuests: 4, minGuests: 1, type: 'rect', top: '45%', left: '70%' },
    { id: 'M5', name: 'Family Table 5', maxGuests: 4, minGuests: 1, type: 'rect', top: '45%', left: '80%' },

    { id: 'M6', name: 'Family Table 6', maxGuests: 4, minGuests: 1, type: 'rect', top: '55%', left: '40%' },
    { id: 'M7', name: 'Family Table 7', maxGuests: 4, minGuests: 1, type: 'rect', top: '55%', left: '50%' },
    { id: 'M8', name: 'Family Table 8', maxGuests: 4, minGuests: 1, type: 'rect', top: '55%', left: '60%' },
    { id: 'M9', name: 'Family Table 9', maxGuests: 4, minGuests: 1, type: 'rect', top: '55%', left: '70%' },
    { id: 'M10', name: 'Family Table 10', maxGuests: 4, minGuests: 1, type: 'rect', top: '55%', left: '80%' },

    { id: 'M11', name: 'Family Table 11', maxGuests: 4, minGuests: 1, type: 'rect', top: '65%', left: '40%' },
    { id: 'M12', name: 'Family Table 12', maxGuests: 4, minGuests: 1, type: 'rect', top: '65%', left: '50%' },
    { id: 'M13', name: 'Family Table 13', maxGuests: 4, minGuests: 1, type: 'rect', top: '65%', left: '60%' },
    { id: 'M14', name: 'Family Table 14', maxGuests: 4, minGuests: 1, type: 'rect', top: '65%', left: '70%' },
    { id: 'M15', name: 'Family Table 15', maxGuests: 4, minGuests: 1, type: 'rect', top: '65%', left: '80%' },

    // VIP Rooms (Bottom)
    { id: 'V4', name: 'Elegant Suite 4', maxGuests: 8, minGuests: 6, type: 'round', top: '83.5%', left: '37.5%' },
    { id: 'V5', name: 'Elegant Suite 5', maxGuests: 8, minGuests: 6, type: 'round', top: '83.5%', left: '62.5%' },
    { id: 'V6', name: 'Elegant Suite 6', maxGuests: 8, minGuests: 6, type: 'round', top: '83.5%', left: '87.5%' },

    // Booths (Bottom Left)
    { id: 'B1', name: 'Cozy Corner 1', maxGuests: 6, minGuests: 4, type: 'booth', top: '75%', left: '12.5%' },
    { id: 'B2', name: 'Cozy Corner 2', maxGuests: 6, minGuests: 4, type: 'booth', top: '85%', left: '12.5%' },
    { id: 'B3', name: 'Cozy Corner 3', maxGuests: 6, minGuests: 4, type: 'booth', top: '95%', left: '12.5%' },
  ];

  const baseTimeSlots = [];
  let currentHour = 12;
  let currentMinute = 0;
  for (let i = 0; i < 17; i++) { // 12:00 PM to 8:00 PM
    const formattedHour = currentHour === 12 ? 12 : currentHour % 12;
    const formattedMinute = currentMinute === 0 ? '00' : '30';
    baseTimeSlots.push({ time: `${formattedHour.toString().padStart(2, '0')}:${formattedMinute} PM`, defaultAvailable: true });
    currentMinute += 30;
    if (currentMinute === 60) {
      currentMinute = 0;
      currentHour += 1;
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let parsedValue = value;
    
    if (type === 'checkbox') {
      parsedValue = checked;
    } else if (name === 'guests') {
      parsedValue = value ? parseInt(value) : '';
      if (parsedValue > 12) parsedValue = 12;
    } else if (name === 'phone') {
      parsedValue = value.replace(/\D/g, '').slice(0, 11);
    }

    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };

  const selectDate = (dateObj) => {
    setFormData(prev => ({ ...prev, date: dateObj.toISOString().split('T')[0], time: '' }));
  };

  const selectTime = (timeStr) => {
    setFormData(prev => ({ ...prev, time: timeStr }));
  };

  const selectTable = (tableId) => {
    setFormData(prev => ({ ...prev, tableId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.date || !formData.time || !formData.guests) {
      setStatus({ type: 'error', message: language === 'ar' ? 'الرجاء ملء جميع الحقول المطلوبة.' : 'Please fill in all required fields.' });
      return;
    }

    if (formData.phone.length !== 11) {
      setStatus({ type: 'error', message: language === 'ar' ? 'يجب أن يتكون رقم الهاتف من ١١ رقماً' : 'it must be 11 number' });
      return;
    }

    setStatus({ type: 'loading', message: language === 'ar' ? 'جاري التأكيد...' : 'Submitting...' });

    const payload = { ...formData, tableId: 'TBD' };

    try {
      const response = await fetch(`http://${window.location.hostname}:3000/api/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.[0]?.message || 'Failed to submit reservation');
      }

      setStatus({ type: 'success', message: language === 'ar' ? 'تم تأكيد الحجز!' : 'Reservation confirmed!' });
      setFormData(prev => ({ ...prev, name: '', email: '', date: '', time: '', tableId: '', guests: '' }));
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
                    const isSelected = formData.time === slot.time;
                    return (
                      <button type="button" key={i} onClick={() => selectTime(slot.time)} style={{ padding: '1rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', border: `2px solid ${isSelected ? 'var(--brand-red)' : 'var(--border-color)'}`, backgroundColor: isSelected ? 'var(--brand-red)' : 'transparent', color: isSelected ? '#fff' : 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.3s ease' }} onMouseEnter={e => !isSelected && (e.currentTarget.style.borderColor = 'var(--brand-red)')} onMouseLeave={e => !isSelected && (e.currentTarget.style.borderColor = 'var(--border-color)')}>
                        {slot.time}
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
                <input type="number" id="guests" name="guests" min="1" max="12" value={formData.guests} onChange={handleChange} required placeholder={language === 'ar' ? 'عدد الأشخاص' : 'Number of Guests'} style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.3)', color: 'var(--text-primary)', fontSize: '1.1rem' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required maxLength="11" placeholder={language === 'ar' ? 'رقم الهاتف' : 'Phone Number'} style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.3)', color: 'var(--text-primary)', fontSize: '1.1rem' }} />
                <span style={{ whiteSpace: 'nowrap', fontSize: '0.85rem', color: '#25D366', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span>📱</span>{language === 'ar' ? 'داعم للواتساب *' : 'Supports WhatsApp *'}
                </span>
              </div>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder={language === 'ar' ? 'البريد الإلكتروني (اختياري)' : 'Email Address (optional)'} style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.3)', color: 'var(--text-primary)', fontSize: '1.1rem' }} />
            </div>

            {/* Table selection removed entirely */}

            <button type="submit" className="btn-primary" style={{ marginTop: '1rem', padding: '1.2rem', fontSize: '1.3rem', borderRadius: '50px' }} disabled={status.type === 'loading'}>
              {status.type === 'loading' ? (language === 'ar' ? 'جاري المعالجة...' : 'Processing...') : (language === 'ar' ? 'تأكيد الحجز' : 'Confirm Reservation')}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
