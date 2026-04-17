import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toUserFacingErrorMessage } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, KeyRound, CheckCircle, XCircle } from "lucide-react";

export default function ResetPassword() {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) setToken(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (newPassword !== confirmPassword) {
      setErrorMsg("הסיסמאות אינן תואמות");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg("הסיסמה חייבת להכיל לפחות 6 תווים");
      return;
    }

    setLoading(true);
    const res = await base44.functions.invoke("completePasswordReset", {
      token,
      new_password: newPassword,
    });

    if (res.data?.success) {
      setStatus("success");
    } else {
      setErrorMsg(toUserFacingErrorMessage(res.data?.error, "אירעה שגיאה, נסה שוב"));
      setStatus("error");
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center p-4" style={{ background: '#1E1E1E' }}>
        <div className="text-center space-y-3">
          <XCircle className="w-16 h-16 mx-auto" style={{ color: '#fca5a5' }} />
          <p className="text-xl font-bold" style={{ color: '#DEC6A7' }}>קישור לא תקין</p>
          <p style={{ color: 'rgba(255,255,255,0.4)' }}>הקישור שקיבלת אינו תקין. פנה למנהל לקבלת קישור חדש.</p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center p-4" style={{ background: '#1E1E1E' }}>
        <div className="text-center space-y-4 max-w-sm">
          <CheckCircle className="w-20 h-20 mx-auto" style={{ color: '#4ade80' }} />
          <p className="text-2xl font-black" style={{ color: '#DEC6A7' }}>הסיסמה עודכנה!</p>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>תוכל להתחבר עכשיו עם הסיסמה החדשה שלך.</p>
          <Button
            onClick={() => window.location.href = '/ClientSignIn'}
            className="w-full font-bold rounded-xl"
            style={{ background: 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)', color: '#1E1E1E' }}
          >
            התחברות
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center p-4" style={{ background: '#1E1E1E' }}>
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)' }}>
            <KeyRound className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-2xl font-black" style={{ color: '#DEC6A7' }}>איפוס סיסמה</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>הזן סיסמה חדשה לחשבונך</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl p-6" style={{ background: 'rgba(222,198,167,0.06)', border: '1px solid rgba(222,198,167,0.2)' }}>
          <div>
            <Label className="block mb-2 text-right" style={{ color: 'rgba(255,255,255,0.6)' }}>סיסמה חדשה</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="לפחות 6 תווים"
                required
                className="rounded-xl text-right text-white pl-10"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(222,198,167,0.25)' }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <Label className="block mb-2 text-right" style={{ color: 'rgba(255,255,255,0.6)' }}>אימות סיסמה</Label>
            <Input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="הזן שוב את הסיסמה"
              required
              className="rounded-xl text-right text-white"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(222,198,167,0.25)' }}
            />
          </div>

          {errorMsg && (
            <div className="rounded-xl p-3 text-center text-sm font-medium" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
              {errorMsg}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full font-bold rounded-xl disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)', color: '#1E1E1E' }}
          >
            {loading ? 'מעדכן...' : 'עדכן סיסמה'}
          </Button>
        </form>
      </div>
    </div>
  );
}