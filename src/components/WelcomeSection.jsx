import React, { useEffect, useRef } from "react";
import anime from 'animejs';

export default function WelcomeSection({ customerName }) {
  const containerRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    // Get name from session directly here as well
    let sessionName = customerName;
    if (!sessionName) {
      try {
        const customerData = localStorage.getItem('customer_session');
        const adminData = localStorage.getItem('admin_session');
        if (customerData) sessionName = JSON.parse(customerData)?.full_name;
        else if (adminData) sessionName = JSON.parse(adminData)?.full_name;
      } catch {}
    }

    if (containerRef.current) {
      anime({
        targets: containerRef.current,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 1000,
        easing: 'easeOutCubic'
      });

      anime({
        targets: textRef.current,
        opacity: [0, 1],
        translateX: [-20, 0],
        duration: 800,
        delay: 400,
        easing: 'easeOutCubic'
      });

      anime({
        targets: '.welcome-gradient-1',
        opacity: [0.4, 0.8],
        translateX: ['-10%', '10%'],
        duration: 4000,
        loop: true,
        direction: 'alternate',
        easing: 'easeInOutSine'
      });

      anime({
        targets: '.welcome-gradient-2',
        opacity: [0.2, 0.5],
        translateX: ['10%', '-10%'],
        duration: 5000,
        loop: true,
        direction: 'alternate',
        easing: 'easeInOutSine'
      });

      anime({
        targets: '.welcome-gradient-3',
        opacity: [0.3, 0.6],
        scale: [1, 1.2],
        duration: 6000,
        loop: true,
        direction: 'alternate',
        easing: 'easeInOutSine'
      });

      anime({
        targets: '.welcome-text-glow',
        textShadow: [
          '0 0 10px rgba(215,199,161,0.3)',
          '0 0 25px rgba(215,199,161,0.5)'
        ],
        duration: 3000,
        loop: true,
        direction: 'alternate',
        easing: 'easeInOutSine'
      });
    }
  }, []);

  // Resolve name from prop or session
  const resolveName = () => {
    if (customerName) return customerName.split(' ')[0];
    try {
      const customerData = localStorage.getItem('customer_session');
      const adminData = localStorage.getItem('admin_session');
      if (customerData) {
        const c = JSON.parse(customerData);
        if (c?.full_name) return c.full_name.split(' ')[0];
      }
      if (adminData) {
        const a = JSON.parse(adminData);
        if (a?.full_name) return a.full_name.split(' ')[0];
      }
    } catch {}
    return 'אורחנו';
  };

  const firstName = resolveName();

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden rounded-2xl p-4 sm:p-5 border border-[#DEC6A7]/60"
      style={{ opacity: 0, background: 'rgba(58, 61, 68, 0.85)' }}
    >
      {/* Multi-layer animated gradient background */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <div className="welcome-gradient-1 absolute inset-0 bg-gradient-to-r from-[#DEC6A7]/20 via-transparent to-[#DEC6A7]/10" />
        <div className="welcome-gradient-2 absolute inset-0 bg-gradient-to-l from-[#DEC6A7]/15 via-[#DEC6A7]/5 to-transparent" />
        <div className="welcome-gradient-3 absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(215,199,161,0.15)_0%,_transparent_70%)]" />
      </div>

      {/* Shimmer effect */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-[#DEC6A7]/15 to-transparent"
          style={{ animation: 'shimmer 3s ease-in-out infinite', transform: 'translateX(-100%)' }}
        />
      </div>
      
      {/* Content */}
      <div ref={textRef} className="relative z-10 text-center" style={{ opacity: 0 }}>
        <div className="flex items-center justify-center gap-3">
          <img 
            src="https://media.base44.com/images/public/69a35c4a7320c1762a3e2af0/9f36c45d2_cropped_circle_image1.png"
            alt="Logo"
            loading="eager"
            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
          <h2 className="welcome-text-glow text-xl sm:text-2xl font-bold" style={{ color: '#DEC6A7' }}>
            ברוך הבא, {firstName} 👋
          </h2>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          50%, 100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}