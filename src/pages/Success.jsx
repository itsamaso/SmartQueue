import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar, Home } from "lucide-react";
import anime from 'animejs';
import { createRipple } from '../components/animations/useAnimeAnimations';
import AuthGuard from '../components/AuthGuard';

function SuccessContent() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const checkRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    // Animate check icon
    anime({
      targets: checkRef.current,
      scale: [0, 1.3, 1],
      rotate: ['0deg', '360deg'],
      duration: 1000,
      easing: 'easeOutElastic(1, .5)'
    });

    // Animate content
    anime({
      targets: '.success-item',
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 600,
      delay: anime.stagger(100, { start: 500 }),
      easing: 'easeOutQuart'
    });

    // Floating animation for check
    anime({
      targets: checkRef.current,
      translateY: [-5, 5, -5],
      duration: 3000,
      loop: true,
      easing: 'easeInOutSine',
      delay: 1000
    });
  }, []);

  const handleButtonClick = (e) => {
    createRipple(e);
    anime({
      targets: e.currentTarget,
      scale: [1, 0.95, 1],
      duration: 300,
      easing: 'easeInOutQuad',
      complete: () => navigate(createPageUrl("Home"))
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4" style={{ background: '#1E1E1E' }}>
      <div ref={containerRef} className="rounded-3xl p-5 sm:p-6 shadow-2xl max-w-md w-full text-center border" style={{ background: '#3A3D44', borderColor: 'rgba(222,198,167,0.3)' }}>
        <div className="mb-5 sm:mb-6">
          <div ref={checkRef} className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-r from-green-500 to-green-700 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </div>
        </div>

        <h1 className="success-item text-2xl sm:text-3xl font-bold mb-2 sm:mb-3" style={{ color: '#DEC6A7' }}>
          ההזמנה אושרה!
        </h1>
        
        <p className="success-item text-sm sm:text-base mb-5 sm:mb-6" style={{ color: 'rgba(255,255,255,0.7)' }}>
          התור שלך נקבע בהצלחה.
        </p>

        <div className="success-item rounded-2xl p-3 sm:p-4 mb-5 sm:mb-6 border" style={{ background: '#2A2A2A', borderColor: 'rgba(222,198,167,0.2)' }}>
          <div className="flex items-center justify-center space-x-2 space-x-reverse mb-2 sm:mb-3">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#DEC6A7' }} />
            <h3 className="text-sm sm:text-base font-semibold" style={{ color: '#FFFFFF' }}>מה הלאה?</h3>
          </div>
          <ul className="text-right space-y-2 text-xs sm:text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <li className="flex items-start text-right">
              <span className="font-bold ml-2" style={{ color: '#DEC6A7' }}>•</span>
              <span className="flex-1 text-right">תקבל הודעת אישור לטלפון שלך</span>
            </li>
            <li className="flex items-start text-right">
              <span className="font-bold ml-2" style={{ color: '#DEC6A7' }}>•</span>
              <span className="flex-1 text-right">תקבל תזכורת שעה לפני התור</span>
            </li>
            <li className="flex items-start text-right">
              <span className="font-bold ml-2" style={{ color: '#DEC6A7' }}>•</span>
              <span className="flex-1 text-right">לביטול או שינוי, צור קשר שעתיים מראש</span>
            </li>
          </ul>
        </div>

        <Button
          onClick={handleButtonClick}
          className="success-item w-full hover:opacity-90 font-bold py-4 sm:py-5 rounded-2xl text-sm sm:text-base shadow-lg transition-all duration-300"
          style={{ background: '#DEC6A7', color: '#1E1E1E' }}
        >
          <div className="flex items-center justify-center space-x-2 space-x-reverse">
            <span>חזרה לעמוד הראשי</span>
            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </Button>
      </div>
    </div>
  );
}

export default function Success() {
  return (
    <AuthGuard>
      <SuccessContent />
    </AuthGuard>
  );
}