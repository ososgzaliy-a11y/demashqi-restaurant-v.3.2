import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Navigation } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export const ReceiptTemplate = ({ order, isPreview = false }) => {
  if (!order || typeof order !== 'object') return null;
  
  // Format items safely, whether it's JSON string or array
  let parsedItems = [];
  try {
    parsedItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
  } catch(e) {
    console.error("Failed to parse items for receipt", e);
  }

  try {
    return (
      <div id="receipt-container" className={isPreview ? "preview-mode" : ""} style={{ backgroundColor: '#ffffff', color: '#000000', padding: '15px' }}>
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>مطعم الدمشقي</h2>
          <p style={{ margin: 0 }}>رقم الطلب: #{order?.orderId || order?.id || 'N/A'}</p>
          <p style={{ margin: 0 }}>التاريخ: {order?.date || new Date(order?.created_at || Date.now()).toLocaleString()}</p>
        </div>
        <hr style={{ borderTop: '1px dashed #000', margin: '10px 0' }} />
        
        {/* Customer Information */}
        {(order?.name || order?.phone || order?.address) && (
          <>
            <div style={{ marginBottom: '10px', fontSize: '0.95em', lineHeight: '1.4' }}>
              {order?.name && <div style={{ fontWeight: 'bold' }}>الاسم: {order.name}</div>}
              {order?.phone && <div>تليفون: {order.phone}</div>}
              {order?.address && <div>العنوان: {order.address}</div>}
            </div>
            <hr style={{ borderTop: '1px dashed #000', margin: '10px 0' }} />
          </>
        )}

        <div>
          {Array.isArray(parsedItems) && parsedItems.map((item, idx) => {
            if (!item) return null;
            return (
              <div key={idx} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span>{item.quantity || 1}x {item.name || 'منتج'}</span>
                  <span>{(item.price || 0) * (item.quantity || 1)} ج.م</span>
                </div>
                {item.selectedSpiciness && <div>- {item.selectedSpiciness}</div>}
                {Array.isArray(item.selectedSauces) && item.selectedSauces.length > 0 && <div>- {item.selectedSauces.join(', ')}</div>}
                {item.specialNote && <div style={{ fontStyle: 'italic', fontWeight: 'bold' }}>- ملاحظة: {item.specialNote}</div>}
              </div>
            );
          })}
        </div>
        <hr style={{ borderTop: '1px dashed #000', margin: '10px 0' }} />
        
        {/* General Order Notes */}
        {order?.notes && (
          <>
            <div style={{ marginBottom: '10px', fontSize: '0.95em', border: '1px solid #000', padding: '5px', borderRadius: '4px', backgroundColor: '#f9f9f9', color: '#000' }}>
              <strong style={{ display: 'block', borderBottom: '1px solid #ddd', paddingBottom: '3px', marginBottom: '3px' }}>ملاحظات الأوردر (للتوصيل/المطبخ):</strong>
              <div style={{ fontWeight: 'bold' }}>{order.notes}</div>
            </div>
            <hr style={{ borderTop: '1px dashed #000', margin: '10px 0' }} />
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2em', fontWeight: 'bold', marginTop: '10px' }}>
          <span>الإجمالي:</span>
          <span>{order?.total || 0} ج.م</span>
        </div>
        <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '0.9em' }}>
          <p style={{ margin: 0 }}>شكراً لزيارتكم!</p>
        </div>
      </div>
    );
  } catch (err) {
    console.error("Receipt rendering error:", err);
    return null;
  }
};

const ReceiptPreviewModal = ({ isOpen, onClose, order, onPrint, autoPrintEnabled, setAutoPrintEnabled, language }) => {
  const downloadReceiptPDF = () => {
    const container = document.createElement('div');
    container.id = 'temp-print-container';
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '80mm';
    container.style.backgroundColor = '#ffffff';
    container.style.color = '#000000';
    container.style.padding = '10mm';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.direction = 'rtl';

    let itemsList = [];
    try {
      itemsList = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    } catch(e) {}
    if (!Array.isArray(itemsList)) itemsList = [];

    container.innerHTML = `
      <div style="text-align: center; font-weight: bold; font-size: 16px; margin-bottom: 5px; color: #000;">مطعم الدمشقي</div>
      <div style="text-align: center; color: #000; font-size: 12px; margin-bottom: 10px;">رقم الطلب: #${order?.orderId || order?.id || '1'}</div>
      <div style="border-bottom: 1px dashed #000; margin: 10px 0;"></div>
      <div style="color: #000; font-size: 12px; text-align: right;">الاسم: ${order?.name || order?.customerName || order?.customer || 'عميل'}</div>
      <div style="color: #000; font-size: 12px; text-align: right;">تليفون: ${order?.phone || '-'}</div>
      <div style="border-bottom: 1px dashed #000; margin: 10px 0;"></div>
      <table style="width: 100%; border-collapse: collapse; color: #000; font-size: 12px;">
        ${itemsList.map(item => `
          <tr>
            <td style="text-align: right; padding: 4px 0;"><b>${item.quantity || item.qty || 1}x</b> ${item.name}</td>
            <td style="text-align: left; padding: 4px 0;">${(item.price || 0) * (item.quantity || item.qty || 1)} ج.م</td>
          </tr>
        `).join('')}
      </table>
      <div style="border-bottom: 1px dashed #000; margin: 10px 0;"></div>
      <div style="text-align: center; font-weight: bold; font-size: 14px; color: #000;">
        الإجمالي: ${order?.total || order?.totalPrice || 0} ج.م
      </div>
    `;

    document.body.appendChild(container);

    setTimeout(() => {
      const opt = {
        margin: 0,
        filename: `Order_${order?.orderId || order?.id || 'receipt'}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2, backgroundColor: '#ffffff', useCORS: true },
        jsPDF: { unit: 'mm', format: [80, 200], orientation: 'portrait' }
      };

      html2pdf().set(opt).from(container).save().then(() => {
        document.body.removeChild(container);
        if (autoPrintEnabled) {
          onClose();
        }
      });
    }, 500);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (autoPrintEnabled && order) {
        const timer = setTimeout(() => {
          downloadReceiptPDF();
        }, 800);
        return () => clearTimeout(timer);
      }
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, autoPrintEnabled, order]);

  if (!isOpen || !order) return null;
  
  let parsedItems = [];
  try {
    parsedItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
  } catch(e) {}

  const modalContent = (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
      <style>{`
        .print-only { display: none; }
        @media print {
          body * { visibility: hidden !important; }
          #print-area, #print-area * { visibility: visible !important; }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            margin: 0;
            padding: 0;
            display: block !important;
            color: #000;
          }
          @page {
            margin: 0;
            size: 80mm auto;
          }
          #printable-receipt-container * {
            color: #000000 !important;
            background-color: #ffffff !important;
          }
        }
      `}</style>

      {/* Dedicated Off-Screen Render Target for PDF Generation */}
      <div 
        id="printable-receipt-container" 
        style={{ 
          position: 'fixed', 
          left: '-9999px', 
          top: 0, 
          width: '80mm', 
          backgroundColor: '#ffffff', 
          color: '#000000', 
          padding: '10mm',
          fontFamily: 'Arial, sans-serif'
        }}
      >
        <div style={{ textAlign: 'center', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '5px' }}>نسخة المطبخ (Kitchen Copy)</div>
        <ReceiptTemplate order={order} isPreview={false} />
        <div style={{ margin: '20px 0', borderBottom: '2px dashed #000', height: '20px' }}></div>
        <div style={{ textAlign: 'center', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '5px' }}>نسخة الحسابات (Accounting Copy)</div>
        <ReceiptTemplate order={order} isPreview={false} />
      </div>

      <div className="scale-in" style={{ backgroundColor: 'var(--card-bg)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', maxWidth: '450px', width: '90%', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>{language === 'ar' ? 'معاينة الفاتورة' : 'Receipt Preview'}</h2>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {Array.isArray(parsedItems) && parsedItems.some(item => item?.img) && (
          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', marginBottom: '1rem', paddingBottom: '0.5rem', scrollbarWidth: 'thin' }}>
            {parsedItems.map((item, idx) => item?.img ? (
              <img 
                key={idx} 
                src={item.img} 
                alt={item.name || 'Product'} 
                title={item.name}
                style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '12px', border: '2px solid var(--gold)', flexShrink: 0, backgroundColor: '#fff' }} 
              />
            ) : null)}
          </div>
        )}
        
        <div style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', overflowY: 'auto', flex: 1, marginBottom: '1.5rem', color: '#000' }}>
          <ReceiptTemplate order={order} isPreview={true} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={autoPrintEnabled} 
              onChange={(e) => setAutoPrintEnabled(e.target.checked)} 
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            {language === 'ar' ? 'طباعة تلقائية' : 'Auto-print'}
          </label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={downloadReceiptPDF} className="btn-primary" style={{ flex: 1, padding: '1rem', borderRadius: '8px', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
              <Navigation size={20} />
              {language === 'ar' ? 'طباعة / حفظ PDF' : 'Print / Save PDF'}
            </button>
            <button onClick={onClose} style={{ padding: '1rem', borderRadius: '8px', fontSize: '1.1rem', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer' }}>
              {language === 'ar' ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ReceiptPreviewModal;
