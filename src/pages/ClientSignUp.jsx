import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, User, Phone, Lock, Eye, EyeOff, ArrowRight, Sparkles, CheckCircle } from "lucide-react";
import GenderToggle from "@/components/GenderToggle";
import anime from 'animejs';

export default function ClientSignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    password: "",
    confirm_password: ""
  });
  const [gender, setGender] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const headerRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    // Animate header
    anime({
      targets: headerRef.current,
      opacity: [0, 1],
      translateY: [-30, 0],
      duration: 800,
      easing: 'easeOutQuart'
    });

    // Animate form fields
    anime({
      targets: '.form-field',
      opacity: [0, 1],
      translateX: [-30, 0],
      duration: 600,
      delay: anime.stagger(100, { start: 300 }),
      easing: 'easeOutQuart'
    });

    // Animate button
    anime({
      targets: '.submit-btn',
      opacity: [0, 1],
      scale: [0.8, 1],
      duration: 600,
      delay: 800,
      easing: 'easeOutBack'
    });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      setError("אנא הכנס שם מלא");
      return false;
    }
    if (!formData.phone.match(/^05\d{8}$/)) {
      setError("מספר הטלפון חייב להתחיל ב-05 ולהכיל 10 ספרות");
      return false;
    }
    if (formData.password.length < 6) {
      setError("הסיסמה חייבת להכיל לפחות 6 תווים");
      return false;
    }
    if (formData.password !== formData.confirm_password) {
      setError("הסיסמאות אינן תואמות");
      return false;
    }
    if (!gender) {
      setError("אנא בחר מין");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await base44.functions.invoke('authService', {
        action: 'register_customer',
        full_name: formData.full_name,
        phone: formData.phone,
        password: formData.password,
        gender
      });
      const newCustomer = response.data;

      setSuccess(true);
      anime({
        targets: '.success-icon',
        scale: [0, 1.2, 1],
        rotate: [0, 360],
        duration: 800,
        easing: 'easeOutElastic(1, .6)'
      });

      setTimeout(() => {
        localStorage.setItem('customer_session', JSON.stringify({
          id: newCustomer.id,
          full_name: newCustomer.full_name,
          phone: newCustomer.phone,
          gender: newCustomer.gender,
          logged_in_at: Date.now()
        }));
        navigate(createPageUrl("Home"));
      }, 1500);

    } catch (err) {
      const msg = err?.response?.data?.error;
      setError(msg || "אירעה שגיאה ביצירת החשבון. אנא נסה שוב.");
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

  if (success) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="rounded-3xl p-8 text-center border" style={{ background: '#3A3D44', borderColor: 'rgba(222,198,167,0.2)' }}>
          <div className="success-icon w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: '#DEC6A7' }}>
            <CheckCircle className="w-10 h-10 text-[#1E1E1E]" />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#DEC6A7' }}>החשבון נוצר בהצלחה!</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>מעביר אותך...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 z-0" style={{ background: '#1E1E1E' }} />
      <div ref={formRef} className="rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative z-10 border" style={{ background: '#3A3D44', borderColor: 'rgba(222,198,167,0.2)' }}>
        {/* Header */}
        <div ref={headerRef} className="text-center mb-6 opacity-0">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="absolute top-4 right-4 hover:opacity-70 transition-all"
            style={{ color: '#DEC6A7' }}
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          
          <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden shadow-lg">
            <img src="https://media.base44.com/images/public/69a35c4a7320c1762a3e2af0/9f36c45d2_cropped_circle_image1.png" alt="לוגו" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#DEC6A7' }}>יצירת חשבון חדש</h1>
          <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.6)' }}>הכנס את הפרטים שלך להרשמה</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4 rounded-xl animate-in fade-in slide-in-from-top-2">
            <AlertDescription className="text-right">{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="form-field opacity-0">
            <Label className="text-right block font-bold mb-2 text-sm" style={{ color: '#DEC6A7' }}>
              <User className="w-4 h-4 inline ml-1" />
              שם מלא
            </Label>
            <Input
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="הכנס שם מלא"
              className="text-right rounded-xl h-12"
              style={{ background: '#2A2A2A', borderColor: 'rgba(222,198,167,0.3)', color: '#FFFFFF' }}
            />
          </div>

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
              className="text-right rounded-xl h-12"
              style={{ background: '#2A2A2A', borderColor: 'rgba(222,198,167,0.3)', color: '#FFFFFF' }}
            />
          </div>

          {/* Gender */}
          <div className="form-field opacity-0">
            <Label className="text-right block font-bold mb-2 text-sm" style={{ color: '#DEC6A7' }}>
              מין
            </Label>
            <GenderToggle value={gender} onChange={setGender} />
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
                className="text-right rounded-xl h-12 pl-12"
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

          {/* Confirm Password */}
          <div className="form-field opacity-0">
            <Label className="text-right block font-bold mb-2 text-sm" style={{ color: '#DEC6A7' }}>
              <Lock className="w-4 h-4 inline ml-1" />
              אישור סיסמה
            </Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="הכנס סיסמה שוב"
                className="text-right rounded-xl h-12 pl-12"
                style={{ background: '#2A2A2A', borderColor: 'rgba(222,198,167,0.3)', color: '#FFFFFF' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors hover:opacity-80"
                style={{ color: 'rgba(222,198,167,0.6)' }}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="submit-btn w-full py-6 text-lg font-bold rounded-2xl hover:opacity-90 shadow-xl transition-all duration-300 opacity-0 mt-6"
            style={{ background: '#DEC6A7', color: '#1E1E1E' }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                נרשם...
              </span>
            ) : (
              <>
                <UserPlus className="w-5 h-5 ml-2" />
                הרשמה
              </>
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            כבר יש לך חשבון?{" "}
            <button
              onClick={() => navigate(createPageUrl("ClientSignIn"))}
              className="font-bold hover:underline"
              style={{ color: '#DEC6A7' }}
            >
              כניסה
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
    </div>
  );
}