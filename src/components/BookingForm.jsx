import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Scissors, UserCircle } from "lucide-react";
import anime from 'animejs';
import { createRipple } from './animations/useAnimeAnimations';

const hebrewMonths = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

const formatDateInHebrew = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00');
  const day = date.getDate();
  const monthName = hebrewMonths[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${monthName} ${year}`;
};

export default function BookingForm({ selectedDate, selectedTime, selectedService, startTime, endTime, onSubmit, isSubmitting, personCount = 1, currentPersonIndex = 0 }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: ""
  });
  const formRef = useRef(null);
  const buttonRef = useRef(null);

  // Auto-load customer info from session
  useEffect(() => {
    try {
      const customerData = localStorage.getItem('customer_session');
      const adminData = localStorage.getItem('admin_session');
      const session = customerData ? JSON.parse(customerData) : adminData ? JSON.parse(adminData) : null;
      if (session) {
        setFormData({
          name: session.full_name || "",
          phone: session.phone || ""
        });
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (selectedTime && formRef.current) {
      anime({
        targets: formRef.current,
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 600,
        easing: 'easeOutQuart'
      });

      anime({
        targets: '.form-field',
        opacity: [0, 1],
        translateX: [-20, 0],
        duration: 500,
        delay: anime.stagger(100, { start: 200 }),
        easing: 'easeOutQuart'
      });
    }
  }, [selectedTime]);



  const handleSubmit = (e) => {
    e.preventDefault();
    createRipple(e);
    anime({
      targets: buttonRef.current,
      scale: [1, 0.97, 1],
      duration: 300,
      easing: 'easeInOutQuad'
    });
    setTimeout(() => onSubmit(formData), 150);
  };

  if (!selectedTime) {
    return (
      <div className="rounded-3xl p-6 shadow-xl border border-[#DEC6A7]/60" style={{ background: 'var(--color-primary)' }}>
        <div className="flex items-center justify-center space-x-2 space-x-reverse">
          <UserCircle className="w-6 h-6" style={{ color: 'rgba(215,199,161,0.5)' }} />
          <p className="text-lg font-semibold" style={{ color: 'rgba(244,241,234,0.5)' }}>
            בחר שעה תחילה
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={formRef} className="rounded-3xl p-4 sm:p-6 shadow-xl border border-[#DEC6A7]/60" style={{ background: 'var(--color-primary)' }}>
      <div className="flex items-center justify-center space-x-2 space-x-reverse mb-4 sm:mb-5">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center" style={{ background: '#DEC6A7' }}>
          <UserCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#1E1E1E]" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold" style={{ color: '#DEC6A7' }}>
          פרטי ההזמנה
        </h2>
      </div>

      {/* Appointment Summary Card */}
      <div className="form-field rounded-2xl p-4 sm:p-5 mb-4 sm:mb-5 border shadow-lg relative overflow-hidden" style={{ background: 'var(--color-secondary)', borderColor: 'rgba(215,199,161,0.3)' }}>
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: '#DEC6A7' }}></div>
        
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0" style={{ background: '#DEC6A7' }}>
            <Scissors className="w-7 h-7 sm:w-8 sm:h-8 text-[#1E1E1E]" />
          </div>
          
          {/* Details */}
          <div className="flex-1 space-y-1.5">
            <p className="text-base sm:text-lg font-bold" style={{ color: '#FFFFFF' }}>{selectedService.name}</p>
            <div className="flex items-center gap-2 text-sm" style={{ color: 'rgba(244,241,234,0.6)' }}>
              <Calendar className="w-3.5 h-3.5" style={{ color: '#DEC6A7' }} />
              <span>{formatDateInHebrew(selectedDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm" style={{ color: 'rgba(244,241,234,0.6)' }}>
              <Clock className="w-3.5 h-3.5" style={{ color: '#DEC6A7' }} />
              <span className="font-semibold" style={{ color: '#DEC6A7' }}>{startTime} - {endTime}</span>
            </div>
          </div>
          
          {/* Price Badge */}
          <div className="flex-shrink-0">
            <span className="inline-block px-3 py-1.5 font-black text-sm sm:text-base rounded-xl shadow-md" style={{ background: '#DEC6A7', color: '#1E1E1E' }}>
              {selectedService.price} ₪
            </span>
          </div>
        </div>
        
        {/* Phone highlight */}
        <div className="mt-3 pt-3 flex items-center justify-center gap-2" style={{ borderTop: '1px solid rgba(215,199,161,0.15)' }}>
          <UserCircle className="w-4 h-4" style={{ color: '#DEC6A7' }} />
          <span className="text-sm" style={{ color: 'rgba(244,241,234,0.6)' }}>מספר טלפון:</span>
          <span className="px-3 py-0.5 rounded-full text-sm font-bold" style={{ background: 'rgba(215,199,161,0.1)', border: '1px solid rgba(215,199,161,0.3)', color: '#DEC6A7' }} dir="ltr">
            {formData.phone}
          </span>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: '#DEC6A7' }}></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">

        <Button
          ref={buttonRef}
          type="submit"
          disabled={isSubmitting}
          className="form-field w-full py-5 sm:py-6 text-base sm:text-lg font-bold rounded-2xl hover:opacity-90 shadow-xl transition-all duration-300 hover:shadow-2xl disabled:opacity-50 relative overflow-hidden"
          style={{ background: '#DEC6A7', color: '#1E1E1E' }}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[btnShimmer_2.5s_ease-in-out_infinite]"></span>
          {isSubmitting ? (
            <span className="flex items-center justify-center space-x-2 space-x-reverse relative z-10">
              <span className="animate-spin">⏳</span>
              <span>מבצע הזמנה...</span>
            </span>
          ) : personCount > 1 && currentPersonIndex < personCount - 1 ? (
            <span className="relative z-10">{`הבא - הזמנה לאדם ${currentPersonIndex + 2}`}</span>
          ) : (
            <span className="relative z-10">אישור הזמנה</span>
          )}
        </Button>
        
        <style>{`
          @keyframes btnShimmer {
            0% { transform: translateX(-100%); }
            50%, 100% { transform: translateX(200%); }
          }
        `}</style>
      </form>
    </div>
  );
}