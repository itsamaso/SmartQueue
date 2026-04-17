import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, Bell, Infinity } from "lucide-react";
import { format } from "date-fns";

const hebrewMonths = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

const formatDateTimeInHebrew = (dateStr) => {
  const date = new Date(dateStr);
  const day = date.getDate();
  const monthName = hebrewMonths[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day} ${monthName} ${year} - ${hours}:${minutes}`;
};

export default function NotificationsTab({
  notifications,
  editingNotification,
  setEditingNotification,
  showDialog,
  setShowDialog,
  onSubmit,
  onDelete
}) {
  const now = new Date();
  
  const activeNotifications = notifications.filter(notification => {
    const expiresAt = new Date(notification.expiresAt);
    return now < expiresAt || expiresAt.getFullYear() >= 2099;
  });

  const [isPermanentChecked, setIsPermanentChecked] = useState(false);

  useEffect(() => {
    if (editingNotification) {
      setIsPermanentChecked(isPermanent(editingNotification));
    } else {
      setIsPermanentChecked(false);
    }
  }, [editingNotification, showDialog]);
  
  const isPermanent = (notification) => {
    const expiresAt = new Date(notification.expiresAt);
    return expiresAt.getFullYear() >= 2099;
  };

  const getNotificationStatus = (notification) => {
    const startAt = new Date(notification.startAt);
    const expiresAt = new Date(notification.expiresAt);
    if (now < startAt) return { label: 'מתוזמן', style: { background: 'rgba(222,198,167,0.15)', color: '#DEC6A7' } };
    if (isPermanent(notification)) return { label: 'קבוע', style: { background: 'rgba(180,150,220,0.15)', color: '#c4a8e8' } };
    if (now >= expiresAt) return { label: 'הסתיים', style: { background: 'rgba(239,68,68,0.12)', color: '#fca5a5' } };
    return { label: 'פעיל', style: { background: 'rgba(74,222,128,0.12)', color: '#86efac' } };
  };

  const getNowDateTimeLocal = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div className="rounded-3xl p-4 md:p-6" style={{ background: 'rgba(222,198,167,0.06)', border: '1px solid rgba(222,198,167,0.2)' }}>
      <div className="flex items-center justify-center mb-6">
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button
              onClick={() => setEditingNotification(null)}
              className="font-bold rounded-xl"
              style={{ background: 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)', color: '#1E1E1E' }}
            >
              <Plus className="w-4 h-4 ml-2" />
              התראה חדשה
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" style={{ background: '#1E1E1E', border: '1px solid rgba(222,198,167,0.3)' }}>
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold" style={{ color: '#DEC6A7' }}>
                {editingNotification ? 'עריכת התראה' : 'יצירת התראה חדשה'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <Label htmlFor="message" className="text-right block mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>הודעה *</Label>
                <Textarea
                  id="message"
                  name="message"
                  defaultValue={editingNotification?.message}
                  required
                  rows={4}
                  placeholder="כתוב את ההודעה כאן..."
                  className="rounded-xl text-right text-white resize-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(222,198,167,0.25)' }}
                />
              </div>

              <div>
                <Label htmlFor="startAt" className="text-right block mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>תאריך ושעת התחלה</Label>
                <Input
                  id="startAt"
                  name="startAt"
                  type="datetime-local"
                  defaultValue={editingNotification ? format(new Date(editingNotification.startAt), "yyyy-MM-dd'T'HH:mm") : getNowDateTimeLocal()}
                  required
                  className="rounded-xl text-right text-white"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(222,198,167,0.25)' }}
                />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(222,198,167,0.2)' }}>
                <Checkbox
                  id="isPermanent"
                  name="isPermanent"
                  checked={isPermanentChecked}
                  onCheckedChange={setIsPermanentChecked}
                  style={{ borderColor: '#DEC6A7' }}
                />
                <Label htmlFor="isPermanent" className="flex items-center gap-2 cursor-pointer" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <Infinity className="w-4 h-4" style={{ color: '#DEC6A7' }} />
                  התראה קבועה (ללא תאריך סיום)
                </Label>
              </div>

              {!isPermanentChecked && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration" className="text-right block mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>משך *</Label>
                    <Input
                      id="duration"
                      name="duration"
                      type="number"
                      min="1"
                      defaultValue={editingNotification?.duration || 1}
                      className="rounded-xl text-right text-white"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(222,198,167,0.25)' }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="durationUnit" className="text-right block mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>יחידה</Label>
                    <Select name="durationUnit" defaultValue={editingNotification?.durationUnit || 'hours'}>
                      <SelectTrigger className="rounded-xl text-right text-white" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(222,198,167,0.25)' }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent style={{ background: '#2a2a2a', border: '1px solid rgba(222,198,167,0.25)' }}>
                        <SelectItem value="minutes" className="text-white">דקות</SelectItem>
                        <SelectItem value="hours" className="text-white">שעות</SelectItem>
                        <SelectItem value="days" className="text-white">ימים</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full font-bold rounded-xl"
                style={{ background: 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)', color: '#1E1E1E' }}
              >
                {editingNotification ? 'עדכן' : 'צור'} התראה
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {activeNotifications.length === 0 ? (
        <div className="text-center py-12" style={{ color: 'rgba(255,255,255,0.35)' }}>
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>אין התראות עדיין</p>
        </div>
      ) : (
        <div className="space-y-3" dir="rtl">
          {activeNotifications.map((notification) => {
            const status = getNotificationStatus(notification);
            return (
              <div key={notification.id} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(222,198,167,0.12)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(222,198,167,0.15)' }}>
                      <Bell className="w-5 h-5" style={{ color: '#DEC6A7' }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-block px-2 py-0.5 rounded-lg text-xs font-bold" style={status.style}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-white font-medium text-sm line-clamp-2 mb-2">
                        {notification.message}
                      </p>
                      <div className="text-xs space-y-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        <p>התחלה: {formatDateTimeInHebrew(notification.startAt)}</p>
                        <p>
                          סיום: {isPermanent(notification) ? (
                            <span className="inline-flex items-center gap-1 text-purple-400">
                              <Infinity className="w-3 h-3" />
                              קבוע
                            </span>
                          ) : (
                            formatDateTimeInHebrew(notification.expiresAt)
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-xl"
                      style={{ color: '#DEC6A7', background: 'rgba(222,198,167,0.1)' }}
                      onClick={() => { setEditingNotification(notification); setShowDialog(true); }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-xl"
                      style={{ color: '#fca5a5', background: 'rgba(239,68,68,0.1)' }}
                      onClick={() => { if (confirm('למחוק את ההתראה?')) onDelete(notification.id); }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}