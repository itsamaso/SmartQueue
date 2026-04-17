import React, { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, ShoppingBag, User } from "lucide-react";

export default function BottomNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveFromPath = () => {
    const path = location.pathname.toLowerCase();
    if (path.includes('products')) return 'products';
    if (path.includes('clientprofile')) return 'profile';
    if (path === '/' || path === '/home') return 'home';
    return null;
  };

  const currentActive = getActiveFromPath();
  const isHomeActive = currentActive === 'home';

  const handleNavClick = useCallback((page) => {
    if (page === "Home" && isHomeActive) {
      window.dispatchEvent(new CustomEvent('resetBookingStep'));
    } else {
      navigate(createPageUrl(page));
    }
  }, [navigate, isHomeActive]);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between"
      style={{
        height: '62px',
        background: '#000000',
        borderTop: '1px solid rgba(222,198,167,0.25)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
        paddingLeft: '24px',
        paddingRight: '24px',
      }}
    >
      {/* Products */}
      <button
        onClick={() => handleNavClick("Products")}
        className="relative flex flex-col items-center py-1.5 px-4 active:scale-90 transition-transform duration-150"
      >
        <ShoppingBag
          className="w-[24px] h-[24px]"
          style={{ color: currentActive === 'products' ? '#DEC6A7' : 'rgba(255,255,255,0.4)' }}
          strokeWidth={1.8}
        />
        <span className="text-[11px] mt-[4px] font-medium" style={{ color: currentActive === 'products' ? '#DEC6A7' : 'rgba(255,255,255,0.4)' }}>
          מוצרים
        </span>
        {currentActive === 'products' && (
          <div className="absolute bottom-0 w-5 h-[3px] rounded-full" style={{ background: '#DEC6A7' }} />
        )}
      </button>

      {/* Home (center) */}
      <button
        onClick={() => handleNavClick("Home")}
        className="flex items-center justify-center outline-none focus:outline-none active:scale-90 transition-transform duration-150"
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          background: isHomeActive
            ? 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)'
            : '#1a1a1a',
          border: `2px solid ${isHomeActive ? '#DEC6A7' : 'rgba(222,198,167,0.4)'}`,
          boxShadow: isHomeActive
            ? '0 4px 20px rgba(222,198,167,0.5)'
            : '0 4px 16px rgba(0,0,0,0.5)',
        }}
      >
        <Home
          className="w-[20px] h-[20px]"
          style={{ color: isHomeActive ? '#1E1E1E' : 'rgba(255,255,255,0.5)' }}
          strokeWidth={2}
        />
      </button>

      {/* Profile */}
      <button
        onClick={() => handleNavClick("ClientProfile")}
        className="relative flex flex-col items-center py-1.5 px-4 active:scale-90 transition-transform duration-150"
      >
        <User
          className="w-[24px] h-[24px]"
          style={{ color: currentActive === 'profile' ? '#DEC6A7' : 'rgba(255,255,255,0.4)' }}
          strokeWidth={1.8}
        />
        <span className="text-[11px] mt-[4px] font-medium" style={{ color: currentActive === 'profile' ? '#DEC6A7' : 'rgba(255,255,255,0.4)' }}>
          פרופיל
        </span>
        {currentActive === 'profile' && (
          <div className="absolute bottom-0 w-5 h-[3px] rounded-full" style={{ background: '#DEC6A7' }} />
        )}
      </button>
    </div>
  );
}