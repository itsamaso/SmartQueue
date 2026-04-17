import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Search, Edit, Trash2, Phone, Calendar, Eye, EyeOff, UserX, User, Clock, KeyRound } from "lucide-react";
import anime from 'animejs';

const hebrewMonths = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

const formatDateInHebrew = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return `${date.getDate()} ${hebrewMonths[date.getMonth()]} ${date.getFullYear()}`;
};

export default function ClientsTab() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingClient, setEditingClient] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [generatingResetFor, setGeneratingResetFor] = useState(null);
  const [resetLink, setResetLink] = useState(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetClientName, setResetClientName] = useState("");
  const [resetClientPhone, setResetClientPhone] = useState("");
  const cardsRef = useRef(null);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list('-created_date'),
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['all-bookings'],
    queryFn: () => base44.entities.Booking.list('-created_date'),
  });

  useEffect(() => {
    if (cardsRef.current && !isLoading && customers.length > 0) {
      anime({
        targets: cardsRef.current.querySelectorAll('.client-card'),
        opacity: [0, 1],
        translateY: [30, 0],
        delay: anime.stagger(80),
        duration: 500,
        easing: 'easeOutQuart'
      });
    }
  }, [isLoading, customers, searchTerm]);

  const updateCustomerMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Customer.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customers'] }); setShowEditDialog(false); setEditingClient(null); }
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: (id) => base44.entities.Customer.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] })
  });

  const getBookingCount = (customerId) => bookings.filter(b => b.customer_id === customerId).length;

  const hasAppointmentToday = (customerId, phone) => {
    const now = new Date();
    const israelTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
    const todayStr = `${israelTime.getFullYear()}-${String(israelTime.getMonth() + 1).padStart(2, '0')}-${String(israelTime.getDate()).padStart(2, '0')}`;
    return bookings.some(b => b.date === todayStr && b.status === 'confirmed' && (b.customer_id === customerId || b.phone === phone));
  };

  const filteredCustomers = customers.filter(customer =>
    customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = { full_name: formData.get('full_name'), phone: formData.get('phone') };
    const newPassword = formData.get('password');
    if (newPassword && newPassword.trim() !== '') data.password = newPassword;
    updateCustomerMutation.mutate({ id: editingClient.id, data });
  };

  const handleGenerateResetLink = async (e, customer) => {
    e.stopPropagation();
    setGeneratingResetFor(customer.id);
    const res = await base44.functions.invoke("generatePasswordResetLink", { customer_id: customer.id });
    setGeneratingResetFor(null);
    if (res.data?.reset_link) {
      setResetLink(res.data.reset_link);
      setResetClientName(customer.full_name);
      setResetClientPhone(customer.phone);
      setShowResetDialog(true);
    }
  };

  const handleCardClick = (e, customer) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `position:absolute;width:${size}px;height:${size}px;background:rgba(222,198,167,0.2);border-radius:50%;pointer-events:none;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px;transform:scale(0);`;
    card.style.position = 'relative';
    card.style.overflow = 'hidden';
    card.appendChild(ripple);
    anime({ targets: ripple, scale: [0, 2], opacity: [1, 0], duration: 600, easing: 'easeOutQuart', complete: () => ripple.remove() });
  };

  return (
    <div className="rounded-3xl p-4 sm:p-6" style={{ background: 'rgba(222,198,167,0.06)', border: '1px solid rgba(222,198,167,0.2)' }}>
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)' }}>
            <Users className="w-6 h-6 text-black" />
          </div>
          <div className="text-center">
            <h2 className="font-black text-2xl" style={{ color: '#DEC6A7' }}>ניהול לקוחות</h2>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{customers.length} לקוחות רשומים</p>
          </div>
        </div>

        <div className="relative w-full">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#DEC6A7' }} />
          <Input
            placeholder="חיפוש לפי שם או טלפון..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-12 h-12 rounded-2xl text-white placeholder:text-gray-500 text-base"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(222,198,167,0.25)' }}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full animate-pulse" style={{ background: 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)' }} />
          <p className="text-lg" style={{ color: 'rgba(255,255,255,0.4)' }}>טוען...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <UserX className="w-10 h-10" style={{ color: 'rgba(255,255,255,0.2)' }} />
          </div>
          <p className="text-lg font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {searchTerm ? 'לא נמצאו תוצאות' : 'אין לקוחות רשומים עדיין'}
          </p>
        </div>
      ) : (
        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredCustomers.map((customer) => {
            const hasToday = hasAppointmentToday(customer.id, customer.phone);
            const bookingCount = getBookingCount(customer.id);
            return (
              <div
                key={customer.id}
                className="client-card opacity-0 rounded-2xl p-4 transition-all duration-300 cursor-pointer active:scale-[0.98]"
                style={{ background: 'rgba(255,255,255,0.04)', border: hasToday ? '1px solid rgba(222,198,167,0.4)' : '1px solid rgba(222,198,167,0.12)' }}
                onClick={(e) => handleCardClick(e, customer)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={hasToday ? { background: 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)' } : { background: 'rgba(255,255,255,0.08)' }}>
                      <User className="w-6 h-6" style={{ color: hasToday ? '#1E1E1E' : 'rgba(255,255,255,0.4)' }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight" style={{ color: '#DEC6A7' }}>{customer.full_name}</h3>
                      <a href={`tel:${customer.phone}`} className="flex items-center gap-1.5 text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }} dir="ltr" onClick={(e) => e.stopPropagation()}>
                        <Phone className="w-3.5 h-3.5" />
                        {customer.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" style={{ color: '#DEC6A7', background: 'rgba(222,198,167,0.1)' }} onClick={(e) => { e.stopPropagation(); setEditingClient(customer); setShowEditDialog(true); }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" style={{ color: '#86efac', background: 'rgba(34,197,94,0.1)' }} onClick={(e) => handleGenerateResetLink(e, customer)} disabled={generatingResetFor === customer.id}>
                      {generatingResetFor === customer.id ? <div className="w-4 h-4 rounded-full border-2 border-green-300 border-t-transparent animate-spin" /> : <KeyRound className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" style={{ color: '#fca5a5', background: 'rgba(239,68,68,0.1)' }} onClick={(e) => { e.stopPropagation(); if (confirm(`למחוק את החשבון של "${customer.full_name}"?`)) deleteCustomerMutation.mutate(customer.id); }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {hasToday ? (
                    <div className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }}>
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      <span className="text-green-300 text-xs font-bold">תור היום</span>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <Clock className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.25)' }} />
                      <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>אין תור</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 py-2 px-4 rounded-xl" style={{ background: 'rgba(222,198,167,0.08)', border: '1px solid rgba(222,198,167,0.15)' }}>
                    <Calendar className="w-3.5 h-3.5" style={{ color: '#DEC6A7' }} />
                    <span className="text-white font-bold text-sm">{bookingCount}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reset Link Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="max-w-md" style={{ background: '#1E1E1E', border: '1px solid rgba(222,198,167,0.3)' }}>
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold" style={{ color: '#DEC6A7' }}>
              קישור איפוס סיסמה
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-center text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              קישור נוצר עבור <span style={{ color: '#DEC6A7' }} className="font-bold">{resetClientName}</span>. הקישור תקף ל-24 שעות.
            </p>
            <div className="rounded-xl p-3 break-all text-xs font-mono" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(222,198,167,0.2)', color: 'rgba(255,255,255,0.6)' }}>
              {resetLink}
            </div>
            <a
              href={`https://wa.me/${resetClientPhone?.replace(/\D/g, '').replace(/^0/, '972')}?text=${encodeURIComponent(`שלום ${resetClientName}, להגדרת סיסמה חדשה לחשבונך לחץ על הקישור הבא (תקף ל-24 שעות):\n${resetLink}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: '#25D366' }}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              שלח לוואטסאפ
            </a>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md" style={{ background: '#1E1E1E', border: '1px solid rgba(222,198,167,0.3)' }}>
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold" style={{ color: '#DEC6A7' }}>
              עריכת פרטי לקוח
            </DialogTitle>
          </DialogHeader>
          {editingClient && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <Label className="text-right block mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>שם מלא</Label>
                <Input name="full_name" defaultValue={editingClient.full_name} required className="rounded-xl text-right text-white" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(222,198,167,0.25)' }} />
              </div>
              <div>
                <Label className="text-right block mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>מספר טלפון</Label>
                <Input name="phone" defaultValue={editingClient.phone} required className="rounded-xl text-right text-white" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(222,198,167,0.25)' }} dir="ltr" />
              </div>
              <div>
                <Label className="text-right block mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>סיסמה חדשה (אופציונלי)</Label>
                <div className="relative">
                  <Input name="password" type={showPassword ? "text" : "password"} placeholder="השאר ריק לשמירת הסיסמה הנוכחית" className="rounded-xl text-right text-white pl-10" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(222,198,167,0.25)' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={updateCustomerMutation.isPending} className="w-full font-bold rounded-xl disabled:opacity-40" style={{ background: 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)', color: '#1E1E1E' }}>
                {updateCustomerMutation.isPending ? 'שומר...' : 'שמור שינויים'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}