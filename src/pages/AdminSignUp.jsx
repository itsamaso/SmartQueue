import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, User, Phone, Lock, Eye, EyeOff, ArrowRight, Sparkles, CheckCircle, Shield, Key } from "lucide-react";
import anime from 'animejs';

export default function AdminSignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    password: "",
    confirm_password: "",
    secret_code: ""
  });
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
      delay: 900,
      easing: 'easeOutBack'
    });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      setError("الرجاء إدخال الاسم الكامل");
      return false;
    }
    if (!formData.phone.match(/^05\d{8}$/)) {
      setError("رقم الهاتف يجب أن يبدأ بـ 05 ويحتوي على 10 أرقام");
      return false;
    }
    if (formData.password.length < 6) {
      setError("كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل");
      return false;
    }
    if (formData.password !== formData.confirm_password) {
      setError("كلمتا المرور غير متطابقتين");
      return false;
    }
    if (!formData.secret_code) {
      setError("אנא הכנס את הקוד הסודי");
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
        action: 'register_admin',
        full_name: formData.full_name,
        phone: formData.phone,
        password: formData.password,
        secret_code: formData.secret_code
      });
      const newAdmin = response.data;

      setSuccess(true);
      anime({
        targets: '.success-icon',
        scale: [0, 1.2, 1],
        rotate: [0, 360],
        duration: 800,
        easing: 'easeOutElastic(1, .6)'
      });

      setTimeout(() => {
        const sessionData = {
          id: newAdmin.id,
          full_name: newAdmin.full_name,
          phone: newAdmin.phone,
          is_admin: true,
          logged_in_at: Date.now()
        };
        localStorage.setItem('admin_session', JSON.stringify(sessionData));
        localStorage.setItem('customer_session', JSON.stringify(sessionData));
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
        <div className="glass-effect rounded-3xl p-8 text-center gold-shadow">
          <div className="success-icon w-20 h-20 mx-auto mb-4 gold-gradient rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-black" />
          </div>
          <h2 className="text-2xl font-bold gold-text mb-2">تم إنشاء حساب المشرف بنجاح!</h2>
          <p className="text-gray-400">جاري تحويلك...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 z-0" style={{ background: '#1E1E1E' }} />
      
      <div ref={formRef} className="glass-effect rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl gold-shadow relative z-10">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-6 opacity-0">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="absolute top-4 right-4 text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          
          <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden shadow-lg">
            <img src="https://media.base44.com/images/public/69a35c4a7320c1762a3e2af0/9f36c45d2_cropped_circle_image1.png" alt="לוגו" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold gold-text">إنشاء حساب مشرف</h1>
          <p className="text-gray-400 text-sm mt-2">أدخل بياناتك للتسجيل كمشرف</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4 rounded-xl animate-in fade-in slide-in-from-top-2">
            <AlertDescription className="text-right">{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="form-field opacity-0">
            <Label className="text-right block text-yellow-500 font-bold mb-2 text-sm">
              <User className="w-4 h-4 inline ml-1" />
              الاسم الكامل
            </Label>
            <Input
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="أدخل اسمك الكامل"
              className="text-right rounded-xl bg-zinc-900/80 border-zinc-700 focus:border-yellow-500 h-12 text-white"
            />
          </div>

          {/* Phone */}
          <div className="form-field opacity-0">
            <Label className="text-right block text-yellow-500 font-bold mb-2 text-sm">
              <Phone className="w-4 h-4 inline ml-1" />
              رقم الهاتف
            </Label>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="05XXXXXXXX"
              dir="ltr"
              className="text-right rounded-xl bg-zinc-900/80 border-zinc-700 focus:border-yellow-500 h-12 text-white"
            />
          </div>

          {/* Password */}
          <div className="form-field opacity-0">
            <Label className="text-right block text-yellow-500 font-bold mb-2 text-sm">
              <Lock className="w-4 h-4 inline ml-1" />
              كلمة المرور
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="أدخل كلمة المرور"
                className="text-right rounded-xl bg-zinc-900/80 border-zinc-700 focus:border-yellow-500 h-12 text-white pl-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-500 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-field opacity-0">
            <Label className="text-right block text-yellow-500 font-bold mb-2 text-sm">
              <Lock className="w-4 h-4 inline ml-1" />
              تأكيد كلمة المرور
            </Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="أعد إدخال كلمة المرور"
                className="text-right rounded-xl bg-zinc-900/80 border-zinc-700 focus:border-yellow-500 h-12 text-white pl-12"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-500 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Secret Code */}
          <div className="form-field opacity-0">
            <Label className="text-right block text-yellow-500 font-bold mb-2 text-sm">
              <Key className="w-4 h-4 inline ml-1" />
              رمز المشرف السري
            </Label>
            <Input
              type="password"
              name="secret_code"
              value={formData.secret_code}
              onChange={handleChange}
              placeholder="أدخل رمز المشرف"
              className="text-right rounded-xl bg-zinc-900/80 border-zinc-700 focus:border-yellow-500 h-12 text-white"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="submit-btn w-full py-6 text-lg font-bold rounded-2xl gold-gradient hover:opacity-90 shadow-xl transition-all duration-300 text-black gold-shadow opacity-0 mt-6"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                جاري التسجيل...
              </span>
            ) : (
              <>
                <UserPlus className="w-5 h-5 ml-2" />
                إنشاء حساب المشرف
              </>
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            لديك حساب مشرف؟{" "}
            <button
              onClick={() => navigate(createPageUrl("AdminSignIn"))}
              className="text-yellow-500 font-bold hover:underline"
            >
              تسجيل الدخول
            </button>
          </p>
        </div>

        {/* Decorative */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-yellow-600/50"></div>
          <Sparkles className="w-4 h-4 text-yellow-500" />
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-yellow-600/50"></div>
        </div>
      </div>
    </div>
  );
}