import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User,
  Calendar,
  Clock,
  Scissors,
  X,
  Lock,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  ChevronRight,
  Shield
} from "lucide-react";
import anime from 'animejs';
import { createRipple } from '../components/animations/useAnimeAnimations';
import AuthGuard from '../components/AuthGuard';


const hebrewMonths = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

const formatDateInHebrew = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00');
  const day = date.getDate();
  const monthName = hebrewMonths[date.getMonth()];
  return `${day} ${monthName}`;
};

function ClientProfileContent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pageRef = useRef(null);
  const [customer, setCustomer] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    try {
      const customerData = localStorage.getItem('customer_session');
      if (customerData) {
        const parsed = JSON.parse(customerData);
        if (parsed && parsed.id) { setCustomer(parsed); return; }
      }
      const adminData = localStorage.getItem('admin_session');
      if (adminData) {
        const parsed = JSON.parse(adminData);
        if (parsed && parsed.id) setCustomer({ ...parsed, is_admin: true });
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (pageRef.current) {
      anime({
        targets: pageRef.current,
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutQuart'
      });

      anime({
        targets: '.profile-card',
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 600,
        delay: anime.stagger(100, { start: 200 }),
        easing: 'easeOutQuart'
      });
    }
  }, []);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['client-bookings', customer?.id, customer?.phone],
    queryFn: async () => {
      const byCustomerId = customer?.id
        ? await base44.entities.Booking.filter({ customer_id: customer.id }, '-date')
        : [];
      const byPhone = customer?.phone
        ? await base44.entities.Booking.filter({ booked_by_phone: customer.phone }, '-date')
        : [];
      const byDirectPhone = customer?.phone
        ? await base44.entities.Booking.filter({ phone: customer.phone }, '-date')
        : [];
      // Merge and deduplicate by id
      const map = {};
      [...byCustomerId, ...byPhone, ...byDirectPhone].forEach(b => { map[b.id] = b; });
      return Object.values(map).sort((a, b) => (b.date > a.date ? 1 : -1));
    },
    enabled: !!(customer?.id || customer?.phone),
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list(),
  });

  const cancelBookingMutation = useMutation({
    mutationFn: (bookingId) => base44.entities.Booking.update(bookingId, { status: 'cancelled' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-bookings'] });
      setShowCancelDialog(false);
      setSelectedBooking(null);
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (password) => {
      await base44.entities.Customer.update(customer.id, { password });
      const updatedCustomer = { ...customer, password };
      localStorage.setItem('customer_session', JSON.stringify(updatedCustomer));
      setCustomer(updatedCustomer);
    },
    onSuccess: () => {
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowPasswordDialog(false);
        setPasswordSuccess(false);
      }, 1500);
    },
  });

  const handleCancelBooking = (booking) => {
    setSelectedBooking(booking);
    setShowCancelDialog(true);
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    setPasswordError('');
    
    if (newPassword.length < 4) {
      setPasswordError('הסיסמה חייבת להיות 4 תווים לפחות');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('הסיסמאות אינן תואמות');
      return;
    }
    
    updatePasswordMutation.mutate(newPassword);
  };

  // Get today's date in Israel timezone (date only, no time)
  const getTodayDateString = () => {
    const now = new Date();
    const israelTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
    const year = israelTime.getFullYear();
    const month = String(israelTime.getMonth() + 1).padStart(2, '0');
    const day = String(israelTime.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const todayStr = getTodayDateString();
  
  const upcomingBookings = bookings.filter(b => b.status === 'confirmed' && b.date >= todayStr);
  const pastBookings = bookings.filter(b => b.date < todayStr || b.status !== 'confirmed');

  return (
    <div ref={pageRef} className="min-h-screen pb-24" style={{ background: '#1E1E1E' }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: '#000000', borderColor: 'rgba(222,198,167,0.2)' }}>
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl("Home"))}
            className="w-10 h-10 rounded-full border transition-all hover:opacity-80"
            style={{ background: 'rgba(222,198,167,0.08)', borderColor: 'rgba(222,198,167,0.25)', color: '#DEC6A7' }}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold" style={{ color: '#DEC6A7' }}>הפרופיל שלי</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-3 py-4 space-y-4">
        {/* Profile Info Card */}
        <div className="profile-card rounded-3xl p-5 border" style={{ background: '#3A3D44', borderColor: 'rgba(222,198,167,0.2)' }}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg" style={{ background: '#DEC6A7' }}>
              <User className="w-8 h-8 text-[#1E1E1E]" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>{customer?.full_name}</h2>
              <p dir="ltr" style={{ color: 'rgba(255,255,255,0.6)' }}>{customer?.phone}</p>
              {customer?.is_admin && (
                <span className="inline-flex items-center gap-1 mt-1 text-xs px-2 py-1 rounded-full" style={{ color: '#DEC6A7', background: 'rgba(222,198,167,0.1)' }}>
                  <Shield className="w-3 h-3" />
                  מנהל
                </span>
              )}
            </div>
          </div>
          
          <div className="space-y-3 mt-4">
            <Button
              onClick={(e) => {
                createRipple(e);
                setShowPasswordDialog(true);
              }}
              className="w-full border rounded-2xl h-12 hover:opacity-80 transition-all"
              style={{ background: '#2A2A2A', borderColor: 'rgba(222,198,167,0.3)', color: '#DEC6A7' }}
            >
              <Lock className="w-4 h-4 ml-2" />
              שנה סיסמה
            </Button>

            {customer?.is_admin && (
              <Button
                onClick={(e) => {
                  createRipple(e);
                  navigate(createPageUrl("AdminDashboard"));
                }}
                className="w-full font-bold rounded-2xl h-12 hover:opacity-90"
                style={{ background: '#DEC6A7', color: '#1E1E1E' }}
              >
                <Shield className="w-4 h-4 ml-2" />
                לוח בקרה
              </Button>
            )}
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="profile-card">
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: '#DEC6A7' }}>
            <Calendar className="w-5 h-5" />
            התורים הקרובים
          </h3>
          
          {isLoading ? (
            <div className="rounded-2xl p-4 animate-pulse" style={{ background: '#3A3D44' }}>
              <div className="h-20 rounded-xl" style={{ background: '#2A2A2A' }}></div>
            </div>
          ) : upcomingBookings.length === 0 ? (
            <div className="rounded-2xl p-6 text-center border" style={{ background: '#3A3D44', borderColor: 'rgba(222,198,167,0.15)' }}>
              <Calendar className="w-12 h-12 mx-auto mb-2" style={{ color: 'rgba(222,198,167,0.3)' }} />
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>אין תורים קרובים</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={() => handleCancelBooking(booking)}
                />
              ))}
            </div>
          )}
        </div>




      </div>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="border rounded-3xl max-w-sm mx-auto" style={{ background: '#3A3D44', borderColor: 'rgba(222,198,167,0.25)' }}>
          <DialogHeader>
            <DialogTitle className="text-center text-xl" style={{ color: '#DEC6A7' }}>ביטול התור</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="mb-2" style={{ color: 'rgba(255,255,255,0.8)' }}>האם אתה בטוח שברצונך לבטל את התור הזה?</p>
            {selectedBooking && (
              <p className="font-bold" style={{ color: '#DEC6A7' }}>
                {formatDateInHebrew(selectedBooking.date)} - {selectedBooking.start_time}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowCancelDialog(false)}
              className="flex-1 rounded-2xl h-12 hover:opacity-80"
              style={{ background: '#2A2A2A', color: '#FFFFFF' }}
            >
              ביטול
              </Button>
              <Button
               onClick={() => cancelBookingMutation.mutate(selectedBooking?.id)}
               disabled={cancelBookingMutation.isPending}
               className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-2xl h-12"
              >
               {cancelBookingMutation.isPending ? 'מבטל...' : 'אשר ביטול'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="border rounded-3xl max-w-sm mx-auto" style={{ background: '#3A3D44', borderColor: 'rgba(222,198,167,0.25)' }}>
          <DialogHeader>
            <DialogTitle className="text-center text-xl" style={{ color: '#DEC6A7' }}>שנה סיסמה</DialogTitle>
          </DialogHeader>
          
          {passwordSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-4 animate-bounce">
                <Check className="w-8 h-8 text-white" />
              </div>
              <p className="text-green-400 font-bold">הסיסמה שונתה בהצלחה!</p>
            </div>
          ) : (
            <form onSubmit={handlePasswordUpdate} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label style={{ color: 'rgba(255,255,255,0.7)' }}>סיסמה חדשה</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="rounded-xl h-12 pr-4 pl-12"
                    style={{ background: '#2A2A2A', borderColor: 'rgba(222,198,167,0.3)', color: '#FFFFFF' }}
                    placeholder="הכנס סיסמה חדשה"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'rgba(222,198,167,0.6)' }}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label style={{ color: 'rgba(255,255,255,0.7)' }}>אשר סיסמה</Label>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="rounded-xl h-12"
                  style={{ background: '#2A2A2A', borderColor: 'rgba(222,198,167,0.3)', color: '#FFFFFF' }}
                  placeholder="הכנס שוב את הסיסמה"
                />
              </div>

              {passwordError && (
                <p className="text-red-400 text-sm text-center">{passwordError}</p>
              )}

              <Button
                type="submit"
                disabled={updatePasswordMutation.isPending}
                className="w-full font-bold rounded-2xl h-12 hover:opacity-90"
                style={{ background: '#DEC6A7', color: '#1E1E1E' }}
              >
                {updatePasswordMutation.isPending ? 'מעדכן...' : 'עדכן סיסמה'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>


    </div>
  );
}

function BookingCard({ booking, onCancel }) {
  const cardRef = useRef(null);

  return (
    <div
      ref={cardRef}
      className="rounded-2xl p-4 border"
      style={{ background: '#3A3D44', borderColor: 'rgba(222,198,167,0.2)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#DEC6A7' }}>
            <Scissors className="w-5 h-5 text-[#1E1E1E]" />
          </div>
          <div>
            <p className="font-bold" style={{ color: '#FFFFFF' }}>{booking.service_name}</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{booking.price} ₪</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-sm mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" style={{ color: '#DEC6A7' }} />
          <span>{formatDateInHebrew(booking.date)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" style={{ color: '#DEC6A7' }} />
          <span>{booking.start_time}</span>
        </div>
      </div>

      <Button
        onClick={(e) => {
          createRipple(e);
          onCancel();
        }}
        variant="outline"
        className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-xl h-10 text-sm"
      >
        <X className="w-4 h-4 ml-1" />
        בטל
      </Button>
    </div>
  );
}

export default function ClientProfile() {
  return (
    <AuthGuard>
      <ClientProfileContent />
    </AuthGuard>
  );
}