import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogIn, Phone, Lock, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import anime from 'animejs';

export default function ClientSignIn() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const headerRef = useRef(null);
  const formRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    // Animate logo
    anime({
      targets: logoRef.current,
      scale: [0, 1],
      rotate: [-180, 0],
      opacity: [0, 1],
      duration: 1000,
      easing: 'easeOutElastic(1, .6)'
    });

    // Animate header
    anime({
      targets: headerRef.current,
      opacity: [0, 1],
      translateY: [-30, 0],
      duration: 800,
      delay: 200,
      easing: 'easeOutQuart'
    });

    // Animate form fields
    anime({
      targets: '.form-field',
      opacity: [0, 1],
      translateX: [-30, 0],
      duration: 600,
      delay: anime.stagger(100, { start: 400 }),
      easing: 'easeOutQuart'
    });

    // Animate button
    anime({
      targets: '.submit-btn',
      opacity: [0, 1],
      scale: [0.8, 1],
      duration: 600,
      delay: 700,
      easing: 'easeOutBack'
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
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.phone.match(/^05\d{8}$/)) {
      setError("מספר הטלפון חייב להתחיל ב-05 ולהכיל 10 ספרות");
      return;
    }

    if (!formData.password) {
      setError("אנא הכנס סיסמה");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await base44.functions.invoke('authService', {
        action: 'login_customer',
        phone: formData.phone,
        password: formData.password
      });
      const result = response.data;

      anime({ targets: formRef.current, scale: [1, 0.95, 1.02], duration: 300, easing: 'easeInOutQuad' });

      if (result.type === 'admin') {
        localStorage.setItem('admin_session', JSON.stringify({
          id: result.id,
          full_name: result.full_name,
          phone: result.phone,
          is_admin: true,
          logged_in_at: result.logged_in_at
        }));
        localStorage.setItem('customer_session', JSON.stringify({
          id: result.id,
          full_name: result.full_name,
          phone: result.phone,
          is_admin: true,
          logged_in_at: result.logged_in_at
        }));
        setTimeout(() => navigate(createPageUrl("AdminDashboard")), 500);
      } else {
        localStorage.setItem('customer_session', JSON.stringify({
          id: result.id,
          full_name: result.full_name,
          phone: result.phone,
          gender: result.gender,
          logged_in_at: result.logged_in_at
        }));
        setTimeout(() => navigate(createPageUrl("Home")), 500);
      }

    } catch (err) {
      const msg = err?.response?.data?.error;
      setError(msg || "אירעה שגיאה בהתחברות. אנא נסה שוב.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    anime({
      targets: formRef.current,
      opacity: [1, 0],
      translateX: [0, 50],
      duration: 300,
      easing: 'easeInQuart',
      complete: () => navigate(createPageUrl("AuthChoice"))
    });
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 z-0" style={{ background: '#1E1E1E' }} />

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-yellow-500/20"
            style={{
              left: `${15 + (i * 15)}%`,
              top: `${20 + (i % 3) * 25}%`,
              animation: `float ${2 + i * 0.5}s ease-in-out infinite alternate`
            }}
          />
        ))}
      </div>

      <div ref={formRef} className="rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border" style={{ background: '#3A3D44', borderColor: 'rgba(222,198,167,0.2)' }}>
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={handleBack}
          className="absolute top-4 right-4 hover:opacity-70 transition-all z-10"
          style={{ color: '#DEC6A7' }}
        >
          <ArrowRight className="w-5 h-5" />
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <div
            ref={logoRef}
            className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden shadow-lg opacity-0 gold-glow"
          >
            <img 
              src="https://media.base44.com/images/public/69a35c4a7320c1762a3e2af0/9f36c45d2_cropped_circle_image1.png" 
              alt="المقص الذهبي"
              className="w-full h-full object-cover"
            />
          </div>
          <div ref={headerRef} className="opacity-0">
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#DEC6A7' }}>תכנס לחשבון</h1>
            <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.6)' }}>הכנס את הפרטים שלך להמשך</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4 rounded-xl animate-in fade-in slide-in-from-top-2">
            <AlertDescription className="text-right">{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Phone */}
          <div className="form-field opacity-0">
            <Label className="text-right block font-bold mb-2 text-sm" style={{ color: '#DEC6A7' }}>
              <Phone className="w-4 h-4 inline ml-1" />
              מספר טלפון
            </Label>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="05XXXXXXXX"
              dir="ltr"
              className="text-right rounded-xl h-14 text-lg"
              style={{ background: '#2A2A2A', borderColor: 'rgba(222,198,167,0.3)', color: '#FFFFFF' }}
            />
          </div>

          {/* Password */}
          <div className="form-field opacity-0">
            <Label className="text-right block font-bold mb-2 text-sm" style={{ color: '#DEC6A7' }}>
              <Lock className="w-4 h-4 inline ml-1" />
              סיסמה
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="הכנס סיסמה"
                className="text-right rounded-xl h-14 text-lg pl-12"
                style={{ background: '#2A2A2A', borderColor: 'rgba(222,198,167,0.3)', color: '#FFFFFF' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors hover:opacity-80"
                style={{ color: 'rgba(222,198,167,0.6)' }}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="submit-btn w-full py-7 text-xl font-bold rounded-2xl hover:opacity-90 shadow-xl transition-all duration-300 opacity-0 mt-8"
            style={{ background: '#DEC6A7', color: '#1E1E1E' }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                מתחבר...
              </span>
            ) : (
              <>
                <LogIn className="w-6 h-6 ml-2" />
                כניסה
              </>
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            אין לך חשבון?{" "}
            <button
              onClick={() => navigate(createPageUrl("ClientSignUp"))}
              className="font-bold hover:underline"
              style={{ color: '#DEC6A7' }}
            >
              הרשמה
            </button>
          </p>
        </div>

        {/* Decorative */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, rgba(222,198,167,0.4))' }}></div>
          <Sparkles className="w-4 h-4" style={{ color: '#DEC6A7' }} />
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, rgba(222,198,167,0.4))' }}></div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}