import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const isSessionValid = (sessionKey) => {
  try {
    const data = localStorage.getItem(sessionKey);
    if (!data) return false;
    const session = JSON.parse(data);
    if (!session || !session.id) return false;
    // Check expiry
    if (session.logged_in_at && Date.now() - session.logged_in_at > SESSION_MAX_AGE_MS) {
      localStorage.removeItem(sessionKey);
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

export default function AuthGuard({ children }) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const customerValid = isSessionValid('customer_session');
      const adminValid = isSessionValid('admin_session');

      if (customerValid || adminValid) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('customer_session');
        localStorage.removeItem('admin_session');
        navigate(createPageUrl("AuthChoice"));
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full gold-gradient animate-pulse"></div>
          <p className="text-yellow-500 font-medium text-sm">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}