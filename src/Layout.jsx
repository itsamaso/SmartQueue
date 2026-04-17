import React, { useState, useEffect, useMemo } from "react";
import BottomNavbar from "@/components/BottomNavbar";

// Pages that should show the bottom navbar (auth pages are excluded by not being listed here)
const PAGES_WITH_NAVBAR = ["Home", "Products", "ClientNotifications", "ClientProfile", "AdminDashboard"];
const AUTH_PAGES = ["AuthChoice", "ClientSignIn", "ClientSignUp", "AdminSignIn", "AdminSignUp"];

export default function Layout({ children, currentPageName }) {
  const [showNavbar, setShowNavbar] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const customerData = localStorage.getItem('customer_session');
        const adminData = localStorage.getItem('admin_session');
        const isAuthenticated = 
          (customerData && JSON.parse(customerData)?.id) ||
          (adminData && JSON.parse(adminData)?.id);
        const isAuthPage = AUTH_PAGES.includes(currentPageName);
        setShowNavbar(!!(isAuthenticated && PAGES_WITH_NAVBAR.includes(currentPageName) && !isAuthPage));
      } catch {
        setShowNavbar(false);
      }
    };

    checkAuth();

    // Listen for storage changes (logout from other tabs or same tab)
    window.addEventListener('storage', checkAuth);
    
    // Also check periodically for same-tab logout
    const interval = setInterval(checkAuth, 500);

    return () => {
      window.removeEventListener('storage', checkAuth);
      clearInterval(interval);
    };
  }, [currentPageName]);

  return (
    <div dir="rtl" className="min-h-screen bg-transparent">
      <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        :root {
          --color-primary: #3A3D44;
          --color-secondary: #2A2A2A;
          --color-accent: #DEC6A7;
          --color-background: #1E1E1E;
          --color-text: #FFFFFF;
        }

        * {
          font-family: 'Heebo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        /* Mobile 9:16 optimization */
        @media (max-width: 480px) {
          html {
            font-size: 14px;
          }
        }
        
        @media (min-width: 481px) and (max-width: 768px) {
          html {
            font-size: 15px;
          }
        }
        
        body {
          background: #1E1E1E;
          position: relative;
          min-height: 100vh;
        }

        body::before {
                    content: none;
                    }

          .gradient-bg {
            background: rgba(30, 30, 30, 0.6);
          }

          .glass-effect {
            background: rgba(30, 30, 30, 0.6);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(222, 198, 167, 0.15);
          }
        
        .gold-gradient {
          background: linear-gradient(135deg, #FFD36A 0%, #FFB400 100%);
        }
        
        .gold-text {
          background: linear-gradient(135deg, #FFD36A 0%, #F7E27A 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .barberpole {
          background: repeating-linear-gradient(
            45deg,
            #FFD36A,
            #FFD36A 10px,
            #FFB400 10px,
            #FFB400 20px
          );
          animation: slide 1s linear infinite;
        }
        
        @keyframes slide {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .gold-shadow {
          box-shadow: 0 4px 20px rgba(255, 211, 106, 0.2);
        }
        
        .gold-glow {
          box-shadow: 0 0 20px rgba(255, 211, 106, 0.4);
          }
          `}</style>
          {children}
          {showNavbar && <BottomNavbar />}
          </div>
          );
}