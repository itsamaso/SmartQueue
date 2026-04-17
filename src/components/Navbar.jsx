import React, { useEffect, useRef, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LogOut, Bell, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import anime from 'animejs';

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return `לפני ${diffMins} דקות`;
  if (diffHours < 24) return `לפני ${diffHours} שעות`;
  if (diffDays < 7) return `לפני ${diffDays} ימים`;
  return date.toLocaleDateString('he-IL');
};

export default function Navbar() {
  const navigate = useNavigate();
  const titleRef = useRef(null);
  const logoutRef = useRef(null);
  const dropdownRef = useRef(null);
  const [customer, setCustomer] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const customerData = localStorage.getItem('customer_session');
    if (customerData) {
      try {
        setCustomer(JSON.parse(customerData));
      } catch {}
    }
  }, []);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.list('-created_date'),
    staleTime: 2 * 60 * 1000,
  });

  const activeNotifications = useMemo(() => {
    const now = new Date();
    return notifications.filter(n => {
      const startAt = new Date(n.startAt);
      const expiresAt = new Date(n.expiresAt);
      return startAt <= now && now < expiresAt;
    });
  }, [notifications]);

  const activeNotificationsCount = activeNotifications.length;

  // Close dropdown on outside click
  useEffect(() => {
    if (!showDropdown) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showDropdown]);

  useEffect(() => {
    // Animate title entrance
    anime({
      targets: titleRef.current,
      opacity: [0, 1],
      translateY: [-20, 0],
      duration: 800,
      easing: 'easeOutElastic(1, .8)'
    });

    // Animate button
    anime({
      targets: logoutRef.current,
      opacity: [0, 1],
      scale: [0.5, 1],
      duration: 600,
      easing: 'easeOutBack'
    });
  }, []);

  const handleLogout = () => {
    anime({
      targets: logoutRef.current,
      scale: [1, 0.85, 1.1, 1],
      rotate: ['0deg', '-10deg', '10deg', '0deg'],
      duration: 400,
      easing: 'easeInOutQuad',
      complete: () => {
        localStorage.removeItem('customer_session');
        navigate(createPageUrl("AuthChoice"));
      }
    });
  };


  
  return (
    <nav className="sticky top-0 z-50 shadow-xl border-b" style={{ background: '#000000', borderColor: 'rgba(222,198,167,0.15)' }} ref={dropdownRef}>
      <div className="max-w-7xl mx-auto px-4 py-3 relative flex items-center justify-between">
        
        {/* Right: Logout Button */}
        <div className="flex items-center gap-2">
          <div ref={logoutRef}>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="h-10 px-3 rounded-xl transition-all duration-300 border group hover:opacity-80"
              style={{ background: 'rgba(215,199,161,0.08)', borderColor: 'rgba(215,199,161,0.25)' }}
            >
              <LogOut className="w-4 h-4 transition-colors" style={{ color: '#DEC6A7' }} />
              <span className="mr-2 text-xs font-bold transition-colors" style={{ color: '#DEC6A7' }}>יציאה</span>
            </Button>
          </div>
        </div>

        {/* Center: Title */}
        <div ref={titleRef} className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative flex items-center justify-center">
            <div className="navbar-glow absolute w-32 h-8 rounded-full" style={{ background: 'rgba(222,198,167,0.18)', filter: 'blur(12px)' }} />
            <span className="relative text-2xl tracking-widest" style={{ color: '#DEC6A7', letterSpacing: '0.14em', fontFamily: "-apple-system, 'SF Pro Display', 'SF Pro Text', BlinkMacSystemFont, 'Helvetica Neue', sans-serif", fontWeight: 700 }}> </span>
          </div>
        </div>
        <style>{`
          @keyframes navbarGlow {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.15); }
          }
          .navbar-glow { animation: navbarGlow 3s ease-in-out infinite; }
          @keyframes dropdownFadeIn {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        
        {/* Left: Notifications Button */}
        <div className="w-20 flex justify-end">
          <button
            onClick={() => setShowDropdown(v => !v)}
            className="relative h-10 w-10 flex items-center justify-center rounded-xl border transition-all duration-300 hover:opacity-80"
            style={{
              background: showDropdown ? 'rgba(222,198,167,0.18)' : 'rgba(215,199,161,0.08)',
              borderColor: showDropdown ? 'rgba(222,198,167,0.6)' : 'rgba(215,199,161,0.25)'
            }}
          >
            <Bell className="w-5 h-5" style={{ color: '#DEC6A7' }} strokeWidth={1.8} />
            {activeNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] bg-red-500 text-white text-[7px] font-bold rounded-full flex items-center justify-center border border-black">
                {activeNotificationsCount > 9 ? '9+' : activeNotificationsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Notifications Dropdown */}
      {showDropdown && (
        <div
          className="absolute left-0 right-0"
          style={{
            animation: 'dropdownFadeIn 0.2s ease-out',
            background: 'rgba(18,18,18,0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(222,198,167,0.2)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
            zIndex: 49,
            maxHeight: '60vh',
            overflowY: 'auto',
          }}
        >
          {/* Dropdown header */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2" style={{ borderBottom: '1px solid rgba(222,198,167,0.1)' }}>
            <button onClick={() => setShowDropdown(false)}>
              <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.4)' }} />
            </button>
            <span className="text-sm font-bold" style={{ color: '#DEC6A7' }}>התראות פעילות</span>
            <Bell className="w-4 h-4" style={{ color: '#DEC6A7' }} strokeWidth={1.8} />
          </div>

          {/* Notification items */}
          <div className="px-4 py-3 space-y-2 max-w-7xl mx-auto">
            {activeNotifications.length === 0 ? (
              <div className="text-center py-6" style={{ color: 'rgba(255,255,255,0.35)' }}>
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">אין התראות כרגע</p>
              </div>
            ) : (
              activeNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start gap-3 rounded-2xl p-3"
                  style={{
                    background: 'rgba(222,198,167,0.06)',
                    border: '1px solid rgba(222,198,167,0.15)',
                  }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)' }}>
                    <Bell className="w-4 h-4 text-black" />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-sm text-white leading-relaxed">{notification.message}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{formatDate(notification.startAt)}</span>
                      <Calendar className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.35)' }} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="h-3" />
        </div>
      )}
    </nav>
  );
}