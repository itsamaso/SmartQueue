import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { UserPlus, LogIn, Sparkles } from "lucide-react";
import anime from 'animejs';

export default function AuthChoice() {
  const navigate = useNavigate();
  const logoRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonsRef = useRef(null);
  const decorRef = useRef(null);
  const brandingRef = useRef(null);
  const badgeRef = useRef(null);

  useEffect(() => {
    // Check if already logged in
    const customerData = localStorage.getItem('customer_session');
    if (customerData) {
      try {
        const customer = JSON.parse(customerData);
        if (customer && customer.id) {
          navigate(createPageUrl("Home"));
          return;
        }
      } catch {}
    }

    // Animate logo
    anime({
      targets: logoRef.current,
      scale: [0, 1],
      rotate: [180, 0],
      opacity: [0, 1],
      duration: 1200,
      easing: 'easeOutElastic(1, .6)'
    });

    // Animate title
    anime({
      targets: titleRef.current,
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 800,
      delay: 400,
      easing: 'easeOutQuart'
    });

    // Animate subtitle
    anime({
      targets: subtitleRef.current,
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 800,
      delay: 600,
      easing: 'easeOutQuart'
    });

    // Animate buttons
    anime({
      targets: '.auth-btn',
      opacity: [0, 1],
      translateY: [40, 0],
      scale: [0.8, 1],
      duration: 800,
      delay: anime.stagger(150, { start: 800 }),
      easing: 'easeOutBack'
    });

    // Floating sparkles animation
    anime({
      targets: '.floating-sparkle',
      translateY: [-10, 10],
      opacity: [0.3, 1, 0.3],
      duration: 2000,
      loop: true,
      direction: 'alternate',
      delay: anime.stagger(200),
      easing: 'easeInOutSine'
    });

    // Decorative lines animation
    anime({
      targets: decorRef.current?.querySelectorAll('.decor-line'),
      scaleX: [0, 1],
      opacity: [0, 1],
      duration: 1000,
      delay: anime.stagger(100, { start: 1000 }),
      easing: 'easeOutQuart'
    });

    // Animate branding message
    anime({
      targets: brandingRef.current,
      opacity: [0, 1],
      translateY: [-20, 0],
      duration: 1000,
      delay: 200,
      easing: 'easeOutQuart'
    });

    // Animate experience badge
    anime({
      targets: badgeRef.current,
      opacity: [0, 1],
      scale: [0.5, 1],
      rotate: [-10, 0],
      duration: 800,
      delay: 500,
      easing: 'easeOutBack'
    });

    // Continuous shimmer on branding
    anime({
      targets: '.branding-text',
      backgroundPosition: ['-200% 0', '200% 0'],
      duration: 3000,
      loop: true,
      easing: 'linear'
    });

    // Continuous logo glow
    anime({
      targets: logoRef.current,
      boxShadow: [
        '0 0 20px rgba(255, 211, 106, 0.4)',
        '0 0 40px rgba(255, 211, 106, 0.6)',
        '0 0 20px rgba(255, 211, 106, 0.4)'
      ],
      duration: 2000,
      loop: true,
      easing: 'easeInOutSine'
    });
  }, [navigate]);

  const handleButtonClick = (e, targetPage) => {
    const btn = e.currentTarget;
    
    // Ripple effect
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      background: rgba(255, 211, 106, 0.4);
      border-radius: 50%;
      transform: scale(0);
      pointer-events: none;
      width: 200px;
      height: 200px;
      left: ${e.clientX - rect.left - 100}px;
      top: ${e.clientY - rect.top - 100}px;
    `;
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);

    anime({
      targets: ripple,
      scale: [0, 2],
      opacity: [1, 0],
      duration: 600,
      easing: 'easeOutQuart',
      complete: () => ripple.remove()
    });

    anime({
      targets: btn,
      scale: [1, 0.95, 1.02, 1],
      duration: 400,
      easing: 'easeInOutQuad',
      complete: () => navigate(createPageUrl(targetPage))
    });
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 z-0" style={{ background: '#1E1E1E' }} />

      {/* Top Branding Section */}
      <div className="absolute top-8 sm:top-12 left-0 right-0 z-10 flex flex-col items-center gap-4 px-4">
        {/* Branding Message */}
        <div ref={brandingRef} className="text-center opacity-0">
          <p className="branding-text text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: '#DEC6A7' }}>
            הזמנה מהירה, יופי מובטח.
          </p>
        </div>

        {/* Foundation Year Badge */}
        <div 
          ref={badgeRef} 
          className="opacity-0 px-5 py-2 rounded-full border backdrop-blur-sm"
          style={{ background: 'rgba(222,198,167,0.08)', borderColor: 'rgba(222,198,167,0.3)' }}
        >
          <span className="font-bold text-sm sm:text-base" style={{ color: '#DEC6A7' }}>מאז 1998</span>
        </div>
      </div>

      {/* Floating sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <Sparkles
            key={i}
            className={`floating-sparkle absolute w-4 h-4`}
            style={{ color: 'rgba(215,199,161,0.25)' }}
            style={{
              left: `${10 + (i * 12)}%`,
              top: `${15 + (i % 3) * 25}%`
            }}
          />
        ))}
      </div>

      {/* Decorative elements */}
      <div ref={decorRef} className="absolute top-0 left-0 right-0 h-1 flex">
        <div className="decor-line flex-1 h-full opacity-0" style={{ background: 'linear-gradient(to right, transparent, #D7C7A1, transparent)' }}></div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 flex">
        <div className="decor-line flex-1 h-full opacity-0" style={{ background: 'linear-gradient(to right, transparent, #D7C7A1, transparent)' }}></div>
      </div>

      {/* Main content */}
      <div className="rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl border" style={{ background: 'rgba(30,30,30,0.88)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderColor: 'rgba(222,198,167,0.2)' }}>
        {/* Logo */}
        <div ref={logoRef} className="w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-6 rounded-full overflow-hidden shadow-xl opacity-0 gold-glow">
          <img 
            src="https://media.base44.com/images/public/69a35c4a7320c1762a3e2af0/9f36c45d2_cropped_circle_image1.png" 
            alt="המספרה"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Title */}
        <h1 ref={titleRef} className="text-3xl sm:text-4xl font-black text-center mb-3 opacity-0" style={{ color: '#DEC6A7' }}>
          SmartQueue
        </h1>

        {/* Subtitle */}
        <p ref={subtitleRef} className="text-center mb-8 text-sm sm:text-base opacity-0" style={{ color: 'rgba(255,255,255,0.6)' }}>
          ברוך הבא למספרה הטובה ביותר
        </p>

        {/* Buttons */}
        <div ref={buttonsRef} className="space-y-4">
          <Button
            onClick={(e) => handleButtonClick(e, "ClientSignIn")}
            className="auth-btn w-full py-6 sm:py-7 text-lg sm:text-xl font-bold rounded-2xl border-2 transition-all duration-300 opacity-0 hover:opacity-80"
            style={{ borderColor: '#DEC6A7', color: '#DEC6A7', background: '#2A2A2A' }}
          >
            <LogIn className="w-5 h-5 sm:w-6 sm:h-6 ml-2" />
            כניסה לחשבון
          </Button>

          <Button
            onClick={(e) => handleButtonClick(e, "ClientSignUp")}
            className="auth-btn w-full py-6 sm:py-7 text-lg sm:text-xl font-bold rounded-2xl hover:opacity-90 shadow-xl transition-all duration-300 opacity-0"
            style={{ background: '#DEC6A7', color: '#1E1E1E' }}
          >
            <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 ml-2" />
            יצירת חשבון חדש
          </Button>
        </div>

        {/* Footer decoration */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, rgba(222,198,167,0.4))' }}></div>
          <Sparkles className="w-4 h-4" style={{ color: '#DEC6A7' }} />
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, rgba(222,198,167,0.4))' }}></div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,211,106,0.3), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}