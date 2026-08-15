import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" fill="currentColor" viewBox="0 0 16 16">
    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c-.003 1.396.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
  </svg>
);

const FloatingSocialMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const buttonRef = useRef(null);
  const dragStartPos = useRef(null);
  const initialOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Default position: bottom left corner (RTL optimized)
    const defaultX = 24; // 1.5rem from left
    const defaultY = window.innerHeight - (window.innerHeight * 0.12) - 64; 
    setPosition({ x: defaultX, y: defaultY });
  }, []);

  const handlePointerDown = (e) => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    initialOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    setIsDragging(false);
    
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragStartPos.current) return;

    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    
    // If moved more than 5 pixels, it's a drag
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      setIsDragging(true);
    }
    
    if (isDragging) {
      let newX = e.clientX - initialOffset.current.x;
      let newY = e.clientY - initialOffset.current.y;
      
      const padding = 10;
      const buttonSize = 64;
      newX = Math.max(padding, Math.min(window.innerWidth - buttonSize - padding, newX));
      newY = Math.max(padding, Math.min(window.innerHeight - buttonSize - padding, newY));
      
      setPosition({ x: newX, y: newY });
    }
  };

  const handlePointerUp = (e) => {
    if (!dragStartPos.current) return;
    
    e.target.releasePointerCapture(e.pointerId);
    dragStartPos.current = null;
    
    if (!isDragging) {
      setIsOpen(!isOpen);
    }
    
    setTimeout(() => setIsDragging(false), 50);
  };

  const handleLinkClick = (e) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        transform: `translate(${position.x}px, ${position.y}px)`,
        zIndex: 1100,
        touchAction: 'none'
      }}
    >
      <div 
        style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          paddingBottom: '16px',
          pointerEvents: isOpen ? 'auto' : 'none',
          opacity: isOpen ? 1 : 0,
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <a
          href="https://www.facebook.com/alsharqdamanhour"
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleLinkClick}
          style={{
            backgroundColor: '#1877F2',
            color: 'white',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0)',
            transition: 'all 0.3s ease',
            transitionDelay: '0.1s'
          }}
        >
          <FacebookIcon />
        </a>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleLinkClick}
          style={{
            background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
            color: 'white',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0)',
            transition: 'all 0.3s ease',
            transitionDelay: '0.05s'
          }}
        >
          <InstagramIcon />
        </a>
        <a
          href="https://wa.me/201556861715"
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleLinkClick}
          style={{
            backgroundColor: '#25D366',
            color: 'white',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0)',
            transition: 'all 0.3s ease',
            transitionDelay: '0s'
          }}
        >
          <MessageCircle size={24} />
        </a>
      </div>

      <div
        ref={buttonRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          backgroundColor: isOpen ? '#e74c3c' : '#25D366',
          color: 'white',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isOpen ? '0 4px 15px rgba(231, 76, 60, 0.4)' : '0 4px 15px rgba(37, 211, 102, 0.4)',
          cursor: isDragging ? 'grabbing' : 'grab',
          transition: isDragging ? 'none' : 'background-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
        }}
        onMouseEnter={(e) => { if(!isDragging) e.currentTarget.style.transform = 'scale(1.1)'; }}
        onMouseLeave={(e) => { if(!isDragging) e.currentTarget.style.transform = 'scale(1)'; }}
      >
        <div style={{
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: isOpen ? 'rotate(135deg)' : 'rotate(0deg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {isOpen ? <X size={34} /> : <WhatsAppIcon />}
        </div>
      </div>
    </div>
  );
};

export default FloatingSocialMenu;
