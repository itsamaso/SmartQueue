import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Users, User, UserPlus, Minus, Plus } from "lucide-react";
import anime from 'animejs';
import { createRipple } from './animations/useAnimeAnimations';

export default function PersonCountSelector({ personCount, onPersonCountChange, onStartBooking }) {
  const containerRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      anime({
        targets: containerRef.current,
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 600,
        easing: 'easeOutQuart'
      });
    }
  }, []);

  const handleIncrement = (e) => {
    createRipple(e);
    if (personCount < 5) {
      onPersonCountChange(personCount + 1);
    }
  };

  const handleDecrement = (e) => {
    createRipple(e);
    if (personCount > 1) {
      onPersonCountChange(personCount - 1);
    }
  };

  const handleStartBooking = (e) => {
    createRipple(e);
    anime({
      targets: buttonRef.current,
      scale: [1, 0.97, 1],
      duration: 300,
      easing: 'easeInOutQuad'
    });
    setTimeout(() => onStartBooking(), 150);
  };

  return (
    <div ref={containerRef} className="rounded-3xl p-5 sm:p-6 shadow-xl border border-[#DEC6A7]/60" style={{ background: 'var(--color-primary)' }}>
      <div className="flex items-center justify-center space-x-2 space-x-reverse mb-6">
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#DEC6A7' }}>
          <Users className="w-5 h-5 text-[#1E1E1E]" />
        </div>
        <h2 className="text-2xl font-bold" style={{ color: '#DEC6A7' }}>הזמן עכשיו</h2>
      </div>

      <div className="text-center mb-6">
        <p className="text-[#FFFFFF]/80 mb-4 text-lg font-medium">כמה אנשים ?</p>
        
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleDecrement}
            disabled={personCount <= 1}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
            personCount <= 1 ?
            'cursor-not-allowed opacity-30' :
            'border-2 hover:opacity-80'}`
            }
            style={personCount > 1 ? { background: 'var(--color-secondary)', color: '#DEC6A7', borderColor: '#DEC6A7' } : { background: 'var(--color-secondary)', color: '#DEC6A7' }}>
            
            <Minus className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-center w-24 h-20 rounded-2xl border-2" style={{ background: 'var(--color-secondary)', borderColor: '#DEC6A7' }}>
            <div className="text-center">
              <span className="text-4xl font-black" style={{ color: '#DEC6A7' }}>{personCount}</span>
            </div>
          </div>

          <button
            onClick={handleIncrement}
            disabled={personCount >= 5}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
            personCount >= 5 ?
            'cursor-not-allowed opacity-30' :
            'border-2 hover:opacity-80'}`
            }
            style={personCount < 5 ? { background: 'var(--color-secondary)', color: '#DEC6A7', borderColor: '#DEC6A7' } : { background: 'var(--color-secondary)', color: '#DEC6A7' }}>
            
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {personCount > 1 &&
        <div className="mt-4 p-3 rounded-xl border" style={{ background: 'rgba(215,199,161,0.08)', borderColor: 'rgba(215,199,161,0.25)' }}>
            <p className="text-sm" style={{ color: '#DEC6A7' }}>
              יוזמנו {personCount} תורים רצופים
            </p>
          </div>
        }
      </div>

      <Button
        ref={buttonRef}
        onClick={handleStartBooking}
        className="w-full py-6 text-xl font-black rounded-2xl hover:opacity-90 shadow-xl transition-all duration-300 hover:shadow-2xl relative overflow-hidden group"
        style={{ background: '#DEC6A7', color: '#1E1E1E' }}>
        
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[btnShimmer_2.5s_ease-in-out_infinite]"></span>
        {personCount === 1 ?
        <span className="flex items-center justify-center gap-2 relative z-10">
            <User className="w-5 h-5" />
            המשך להזמנה
          </span> :

        <span className="flex items-center justify-center gap-2 relative z-10">
            <UserPlus className="w-5 h-5" />
            הזמן {personCount} תורים
          </span>
        }
      </Button>
      
      <style>{`
        @keyframes btnShimmer {
          0% { transform: translateX(-100%); }
          50%, 100% { transform: translateX(200%); }
        }
      `}</style>
    </div>);

}