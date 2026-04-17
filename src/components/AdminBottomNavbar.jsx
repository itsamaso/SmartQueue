import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { CalendarDays, Image, ShoppingBag, Bell, Users } from "lucide-react";
import anime from 'animejs';
import { createRipple } from './animations/useAnimeAnimations';

const navItems = [
  { id: "bookings", icon: CalendarDays, label: "المواعيد" },
  { id: "stories", icon: Image, label: "التسريحات" },
  { id: "products", icon: ShoppingBag, label: "المنتجات" },
  { id: "notifications", icon: Bell, label: "الإشعارات" },
  { id: "clients", icon: Users, label: "العملاء" },
];

export default function AdminBottomNavbar({ activeTab, onTabChange }) {
  const navRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (navRef.current && !hasAnimated.current) {
      hasAnimated.current = true;
      anime({
        targets: navRef.current,
        translateY: [100, 0],
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutQuart'
      });
    }
  }, []);

  const handleNavClick = (e, id) => {
    createRipple(e);
    anime({
      targets: e.currentTarget,
      scale: [1, 0.9, 1.1, 1],
      duration: 300,
      easing: 'easeInOutQuad',
      complete: () => onTabChange(id)
    });
  };

  return (
    <div ref={navRef} className="fixed bottom-0 left-0 right-0 z-50 pb-[10px]">
      <div className="max-w-lg mx-auto px-4">
        <div
          className="glass-effect rounded-[24px] border border-yellow-600/30"
          style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.4)' }}
        >
          <div className="flex items-center justify-around py-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={(e) => handleNavClick(e, item.id)}
                  className="relative flex flex-col items-center py-1.5 px-3 transition-all duration-300"
                >
                  <div className="relative">
                    {isActive && (
                      <div className="absolute -inset-2 bg-yellow-500/15 rounded-full blur-sm -z-10"></div>
                    )}
                    <Icon
                      className={`w-[22px] h-[22px] transition-colors duration-300 ${isActive ? 'text-yellow-500' : 'text-gray-400'}`}
                      strokeWidth={1.8}
                    />
                  </div>
                  <span className={`text-[10px] mt-[5px] font-medium transition-colors duration-300 ${isActive ? 'text-yellow-500' : 'text-gray-500'}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute bottom-0 w-5 h-[3px] bg-yellow-500 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}