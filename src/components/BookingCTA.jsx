import React, { useEffect, useRef } from "react";
import anime from 'animejs';
import { Scissors } from "lucide-react";

export default function BookingCTA({ onBook }) {
  const btnRef = useRef(null);

  useEffect(() => {
    if (btnRef.current) {
      btnRef.current.style.opacity = "0";
      btnRef.current.style.transform = "translateY(30px)";
      requestAnimationFrame(() => {
        btnRef.current.style.transition = "opacity 0.3s ease, transform 0.3s ease";
        btnRef.current.style.opacity = "1";
        btnRef.current.style.transform = "translateY(0)";
      });
    }

    // Clockwise spin animation for the SVG icons
    anime({
      targets: '.cta-svg-icon',
      rotate: '1turn',
      duration: 6000,
      loop: true,
      easing: 'linear'
    });
  }, []);

  return (
    <div ref={btnRef} className="flex flex-col items-center gap-5 py-6">
      {/* Decorative top line */}
      <div className="flex items-center gap-3 w-full px-4">
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(222,198,167,0.4))' }} />
        <Scissors className="w-4 h-4" style={{ color: '#DEC6A7', transform: 'rotate(45deg)' }} />
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(222,198,167,0.4))' }} />
      </div>

      {/* Main CTA button */}
      <button
        onClick={onBook}
        className="relative w-full overflow-hidden rounded-3xl py-7 text-center font-black text-2xl active:scale-95 transition-transform duration-150 select-none"
        style={{
          background: 'linear-gradient(135deg, #DEC6A7 0%, #c9a97a 50%, #DEC6A7 100%)',
          backgroundSize: '200% 200%',
          color: '#1E1E1E',
          boxShadow: '0 8px 40px rgba(222,198,167,0.45), 0 2px 8px rgba(0,0,0,0.4)',
          animation: 'ctaShift 4s ease-in-out infinite'
        }}>
        
        {/* Shimmer layer */}
        <span
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)',
            animation: 'ctaShimmer 2.8s ease-in-out infinite'
          }} />
        

        {/* Text */}
        <span className="relative z-10 flex items-center justify-center gap-4">
          {/* Right SVG - clock */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 502 511.82" width="28" height="28" fill="#1E1E1E" className="cta-svg-icon" style={{ flexShrink: 0, opacity: 0.9, marginRight: '20px' }}>
            <path fillRule="nonzero" d="M279.75 471.21c14.34-1.9 25.67 12.12 20.81 25.75-2.54 6.91-8.44 11.76-15.76 12.73a260.727 260.727 0 0 1-50.81 1.54c-62.52-4.21-118.77-31.3-160.44-72.97C28.11 392.82 0 330.04 0 260.71 0 191.37 28.11 128.6 73.55 83.16S181.76 9.61 251.1 9.61c24.04 0 47.47 3.46 69.8 9.91a249.124 249.124 0 0 1 52.61 21.97l-4.95-12.96c-4.13-10.86 1.32-23.01 12.17-27.15 10.86-4.13 23.01 1.32 27.15 12.18L428.8 68.3a21.39 21.39 0 0 1 1.36 6.5c1.64 10.2-4.47 20.31-14.63 23.39l-56.03 17.14c-11.09 3.36-22.8-2.9-26.16-13.98-3.36-11.08 2.9-22.8 13.98-26.16l4.61-1.41a210.71 210.71 0 0 0-41.8-17.12c-18.57-5.36-38.37-8.24-59.03-8.24-58.62 0-111.7 23.76-150.11 62.18-38.42 38.41-62.18 91.48-62.18 150.11 0 58.62 23.76 111.69 62.18 150.11 34.81 34.81 81.66 57.59 133.77 61.55 14.9 1.13 30.23.76 44.99-1.16zm-67.09-312.63c0-10.71 8.69-19.4 19.41-19.4 10.71 0 19.4 8.69 19.4 19.4V276.7l80.85 35.54c9.8 4.31 14.24 15.75 9.93 25.55-4.31 9.79-15.75 14.24-25.55 9.93l-91.46-40.2c-7.35-2.77-12.58-9.86-12.58-18.17V158.58zm134.7 291.89c-15.62 7.99-13.54 30.9 3.29 35.93 4.87 1.38 9.72.96 14.26-1.31 12.52-6.29 24.54-13.7 35.81-22.02 5.5-4.1 8.36-10.56 7.77-17.39-1.5-15.09-18.68-22.74-30.89-13.78a208.144 208.144 0 0 1-30.24 18.57zm79.16-69.55c-8.84 13.18 1.09 30.9 16.97 30.2 6.21-.33 11.77-3.37 15.25-8.57 7.86-11.66 14.65-23.87 20.47-36.67 5.61-12.64-3.13-26.8-16.96-27.39-7.93-.26-15.11 4.17-18.41 11.4-4.93 10.85-10.66 21.15-17.32 31.03zm35.66-99.52c-.7 7.62 3 14.76 9.59 18.63 12.36 7.02 27.6-.84 29.05-14.97 1.33-14.02 1.54-27.9.58-41.95-.48-6.75-4.38-12.7-10.38-15.85-13.46-6.98-29.41 3.46-28.34 18.57.82 11.92.63 23.67-.5 35.57zM446.1 177.02c4.35 10.03 16.02 14.54 25.95 9.96 9.57-4.4 13.86-15.61 9.71-25.29-5.5-12.89-12.12-25.28-19.69-37.08-9.51-14.62-31.89-10.36-35.35 6.75-.95 5.03-.05 9.94 2.72 14.27 6.42 10.02 12 20.44 16.66 31.39z" />
          </svg>

          <span className="flex flex-col items-center gap-1">
            <span className="text-3xl tracking-wide leading-tight">לחץ כאן</span>
            <span className="text-base font-black uppercase tracking-widest" style={{ color: 'rgba(30,30,30,0.85)', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>קבע/י תורך עכשיו</span>
          </span>

          {/* Left SVG - clock (mirrored) */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 502 511.82" width="28" height="28" fill="#1E1E1E" className="cta-svg-icon" style={{ flexShrink: 0, opacity: 0.9, marginLeft: '20px' }}>
            <path fillRule="nonzero" d="M279.75 471.21c14.34-1.9 25.67 12.12 20.81 25.75-2.54 6.91-8.44 11.76-15.76 12.73a260.727 260.727 0 0 1-50.81 1.54c-62.52-4.21-118.77-31.3-160.44-72.97C28.11 392.82 0 330.04 0 260.71 0 191.37 28.11 128.6 73.55 83.16S181.76 9.61 251.1 9.61c24.04 0 47.47 3.46 69.8 9.91a249.124 249.124 0 0 1 52.61 21.97l-4.95-12.96c-4.13-10.86 1.32-23.01 12.17-27.15 10.86-4.13 23.01 1.32 27.15 12.18L428.8 68.3a21.39 21.39 0 0 1 1.36 6.5c1.64 10.2-4.47 20.31-14.63 23.39l-56.03 17.14c-11.09 3.36-22.8-2.9-26.16-13.98-3.36-11.08 2.9-22.8 13.98-26.16l4.61-1.41a210.71 210.71 0 0 0-41.8-17.12c-18.57-5.36-38.37-8.24-59.03-8.24-58.62 0-111.7 23.76-150.11 62.18-38.42 38.41-62.18 91.48-62.18 150.11 0 58.62 23.76 111.69 62.18 150.11 34.81 34.81 81.66 57.59 133.77 61.55 14.9 1.13 30.23.76 44.99-1.16zm-67.09-312.63c0-10.71 8.69-19.4 19.41-19.4 10.71 0 19.4 8.69 19.4 19.4V276.7l80.85 35.54c9.8 4.31 14.24 15.75 9.93 25.55-4.31 9.79-15.75 14.24-25.55 9.93l-91.46-40.2c-7.35-2.77-12.58-9.86-12.58-18.17V158.58zm134.7 291.89c-15.62 7.99-13.54 30.9 3.29 35.93 4.87 1.38 9.72.96 14.26-1.31 12.52-6.29 24.54-13.7 35.81-22.02 5.5-4.1 8.36-10.56 7.77-17.39-1.5-15.09-18.68-22.74-30.89-13.78a208.144 208.144 0 0 1-30.24 18.57zm79.16-69.55c-8.84 13.18 1.09 30.9 16.97 30.2 6.21-.33 11.77-3.37 15.25-8.57 7.86-11.66 14.65-23.87 20.47-36.67 5.61-12.64-3.13-26.8-16.96-27.39-7.93-.26-15.11 4.17-18.41 11.4-4.93 10.85-10.66 21.15-17.32 31.03zm35.66-99.52c-.7 7.62 3 14.76 9.59 18.63 12.36 7.02 27.6-.84 29.05-14.97 1.33-14.02 1.54-27.9.58-41.95-.48-6.75-4.38-12.7-10.38-15.85-13.46-6.98-29.41 3.46-28.34 18.57.82 11.92.63 23.67-.5 35.57zM446.1 177.02c4.35 10.03 16.02 14.54 25.95 9.96 9.57-4.4 13.86-15.61 9.71-25.29-5.5-12.89-12.12-25.28-19.69-37.08-9.51-14.62-31.89-10.36-35.35 6.75-.95 5.03-.05 9.94 2.72 14.27 6.42 10.02 12 20.44 16.66 31.39z" />
          </svg>
        </span>
      </button>

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/972547736513"
        target="_blank"
        rel="noopener noreferrer"
        className="relative overflow-hidden rounded-2xl px-6 py-3 flex items-center justify-center gap-2.5 font-semibold text-sm active:scale-95 transition-all duration-150 select-none"
        style={{
          background: 'linear-gradient(135deg, #1a3d24 0%, #1e4a2a 100%)',
          border: '1.5px solid rgba(37,211,102,0.5)',
          color: '#4ade80',
          boxShadow: '0 2px 16px rgba(37,211,102,0.2), inset 0 1px 0 rgba(255,255,255,0.05)'
        }}>
        
        <svg viewBox="0 0 24 24" width="20" height="20" fill="#4ade80" style={{ flexShrink: 0 }}>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        <span className="text-lg font-bold">לשאלות ועוד: שלחו הודעה</span>
      </a>

      {/* Subtle hint */}
      <p className="text-sm font-semibold tracking-wide" style={{ color: 'rgba(222,198,167,0.85)', textShadow: '0 0 12px rgba(222,198,167,0.3)' }}>
        הזמנה מהירה • ללא המתנה
      </p>

      <style>{`
        @keyframes ctaShimmer {
          0%   { transform: translateX(-100%) skewX(-15deg); }
          60%, 100% { transform: translateX(200%) skewX(-15deg); }
        }
        @keyframes ctaShift {
          0%, 100% { background-position: 0% 50%; }
          50%       { background-position: 100% 50%; }
        }
      `}</style>
    </div>);

}