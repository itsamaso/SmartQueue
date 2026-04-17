import React, { useState, useEffect, useRef } from "react";
import anime from 'animejs';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Trash2, Edit, Plus, Lock, Clock, Calendar, ChevronLeft, ChevronRight, X, Bell, User, Phone, Scissors, Menu, MessageCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import AdminSidebar from "../components/admin/AdminSidebar";

import ClientsTab from "../components/admin/ClientsTab";
import NotificationsTab from "../components/NotificationsTab";
import AvailabilityTab from "../components/AvailabilityTab";
import ProductsTab from "../components/ProductsTab";
import ServicesTab from "../components/admin/ServicesTab";

const hebrewMonths = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

const formatDateInHebrew = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00');
  const day = date.getDate();
  const monthName = hebrewMonths[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${monthName} ${year}`;
};

const hebrewDaysShortRTL = ['ראש', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
const hebrewDaysFull = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

const getDayName = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00');
  return hebrewDaysFull[date.getDay()];
};

const formatDateNumbers = (dateStr) => {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

function AdminDatePicker({ selectedDate, onDateChange, overrides = [] }) {
  const [open, setOpen] = React.useState(false);
  const [currentMonth, setCurrentMonth] = React.useState(() => {
    if (selectedDate) {
      const date = new Date(selectedDate + 'T12:00:00');
      return new Date(date.getFullYear(), date.getMonth(), 1);
    }
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  });

  const isMonday = (date) => date && date.getDay() === 1;

  const isFullClosureDay = (date) => {
    if (!date) return false;
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dateNum = year * 10000 + month * 100 + day;

    for (const override of overrides) {
      if (!override.isActive || override.type !== 'full_closure') continue;
      const startAt = new Date(override.startAt);
      const endAt = new Date(override.endAt);
      const startDateNum = startAt.getFullYear() * 10000 + (startAt.getMonth() + 1) * 100 + startAt.getDate();
      const endDateNum = endAt.getFullYear() * 10000 + (endAt.getMonth() + 1) * 100 + endAt.getDate();
      if (dateNum >= startDateNum && dateNum <= endDateNum) {
        return true;
      }
    }
    return false;
  };

  const isDateDisabled = (date) => {
    if (!date) return true;
    if (isMonday(date)) return true;
    if (isFullClosureDay(date)) return true;
    return false;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) days.push(new Date(year, month, day));
    return days;
  };

  const handleDateClick = (date) => {
    if (!date || isDateDisabled(date)) return;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    onDateChange(`${year}-${month}-${day}`);
    setOpen(false);
  };

  const isDateSelected = (date) => {
    if (!date || !selectedDate) return false;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}` === selectedDate;
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="w-full justify-between rounded-xl text-white" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(222,198,167,0.25)' }}>
          <Calendar className="w-4 h-4" style={{ color: '#DEC6A7' }} />
          <span>{selectedDate ? formatDateInHebrew(selectedDate) : 'בחר תאריך'}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" style={{ background: '#1E1E1E', border: '1px solid rgba(222,198,167,0.3)' }} align="start">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} style={{ color: '#DEC6A7' }}>
            <ChevronRight className="w-5 h-5" />
          </Button>
          <span className="font-bold text-white">{hebrewMonths[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} style={{ color: '#DEC6A7' }}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2" dir="rtl">
          {hebrewDaysShortRTL.map((day, i) => <div key={i} className="text-center text-xs font-bold text-gray-400 py-1">{day}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1" dir="rtl">
          {days.map((date, i) => {
            const disabled = isDateDisabled(date);
            const isMondayDay = date && isMonday(date);
            const isClosureDay = date && isFullClosureDay(date);
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleDateClick(date)}
                disabled={disabled}
                className={`aspect-square rounded-lg text-sm font-medium transition-all ${!date ? 'invisible' : ''} ${isDateSelected(date) ? 'gold-gradient text-black' : isMondayDay || isClosureDay ? 'bg-red-950/50 text-red-400/50 cursor-not-allowed' : disabled ? 'text-gray-600 cursor-not-allowed' : 'text-white hover:bg-zinc-700'}`}
              >
                {date ? date.getDate() : ''}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const adminSession = localStorage.getItem('admin_session');
    if (adminSession) {
      try {
        const admin = JSON.parse(adminSession);
        if (!admin || !admin.id) return false;
        const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
        if (admin.logged_in_at && Date.now() - admin.logged_in_at > SESSION_MAX_AGE_MS) {
          localStorage.removeItem('admin_session');
          return false;
        }
        return true;
      } catch {
        return false;
      }
    }
    return false;
  });
  const [newBookingPopup, setNewBookingPopup] = useState(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const previousBookingsRef = React.useRef([]);
  const [editingBooking, setEditingBooking] = useState(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [uploadingStory, setUploadingStory] = useState(false);
  const [storyEditMode, setStoryEditMode] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [showStoryDialog, setShowStoryDialog] = useState(false);
  const [storyTitle, setStoryTitle] = useState("");
  const [storyImageUrl, setStoryImageUrl] = useState("");
  const [storyGender, setStoryGender] = useState("male");
  const [storyFilterGender, setStoryFilterGender] = useState("male");
  const [storyFilterEnabled, setStoryFilterEnabled] = useState(true);
  const [newStoryTitle, setNewStoryTitle] = useState("");
  const [newStoryGender, setNewStoryGender] = useState("male");
  const [newStoryFile, setNewStoryFile] = useState(null);
  const [showNewStoryDialog, setShowNewStoryDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [editingNotification, setEditingNotification] = useState(null);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [editingOverride, setEditingOverride] = useState(null);
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("bookings");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollContainerRef = useRef(null);
  const [whatsappBooking, setWhatsappBooking] = useState(null);
  const [showWhatsappDialog, setShowWhatsappDialog] = useState(false);

  // Check if booking is within 1 hour
  const isWithinOneHour = (booking) => {
    const now = new Date();
    const israelTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
    const todayStr = `${israelTime.getFullYear()}-${String(israelTime.getMonth() + 1).padStart(2, '0')}-${String(israelTime.getDate()).padStart(2, '0')}`;
    
    if (booking.date !== todayStr) return false;
    
    const [bookingHours, bookingMinutes] = booking.start_time.split(':').map(Number);
    const bookingTime = new Date(israelTime);
    bookingTime.setHours(bookingHours, bookingMinutes, 0, 0);
    
    const diffMs = bookingTime - israelTime;
    const diffMinutes = diffMs / (1000 * 60);
    
    return diffMinutes > 0 && diffMinutes <= 60;
  };

  const openWhatsApp = (booking, template) => {
    let message = '';
    const phone = booking.phone.replace(/^0/, '972');
    const salonName = 'המספרה';
    const dateFormatted = formatDateInHebrew(booking.date);
    
    if (template === 'confirmation') {
      message = `שלום ${booking.name} 👋

התור שלך ב${salonName} אושר בהצלחה.

🗓 תאריך: ${dateFormatted}
⏰ שעה: ${booking.start_time}

נתראה! ✂️`;
    } else if (template === 'reminder') {
      message = `שלום, תזכורת לתורך היום בשעה שבחרת. אל תשכח להגיע 10 דקות לפני 🫶`;
    }
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
    setShowWhatsappDialog(false);
    setWhatsappBooking(null);
  };

  const { data: rawBookings = [] } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => base44.entities.Booking.list('-created_date'),
    enabled: isAuthenticated,
    refetchInterval: 10000
  });

  const bookings = React.useMemo(() => {
    const now = new Date();
    const israelTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
    const year = israelTime.getFullYear();
    const month = String(israelTime.getMonth() + 1).padStart(2, '0');
    const day = String(israelTime.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    return [...rawBookings]
      .filter((booking) => booking.date >= todayStr && booking.status !== 'cancelled')
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.start_time.localeCompare(b.start_time);
      });
  }, [rawBookings]);

  const { data: stories = [] } = useQuery({
    queryKey: ['stories'],
    queryFn: () => base44.entities.Story.list('order'),
    enabled: isAuthenticated
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list('price'),
    enabled: isAuthenticated
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.list('-created_date'),
    enabled: isAuthenticated
  });

  const { data: overrides = [] } = useQuery({
    queryKey: ['overrides'],
    queryFn: () => base44.entities.AvailabilityOverride.list('-created_date'),
    enabled: isAuthenticated
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('order'),
    enabled: isAuthenticated
  });

  const { data: workingHours = [] } = useQuery({
    queryKey: ['workingHours'],
    queryFn: () => base44.entities.WorkingHours.list('-created_date'),
    enabled: isAuthenticated
  });

  // Animate tab content on change
  useEffect(() => {
    anime({
      targets: '.tab-content',
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 400,
      easing: 'easeOutQuart'
    });
  }, [activeTab]);

  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  const [selectedServiceId, setSelectedServiceId] = React.useState('');
  const selectedServiceForNew = services.find((s) => s.id === selectedServiceId);
  const serviceDuration = editingBooking?.service_duration || selectedServiceForNew?.duration_minutes || 30;

  const availableSlots = React.useMemo(() => {
    if (!selectedDate || (!editingBooking && !selectedServiceId)) return [];

    // Get working hours for the selected date
    const [selYear, selMonth, selDay] = selectedDate.split('-').map(Number);
    const selectedDateNum = selYear * 10000 + selMonth * 100 + selDay;
    
    let workingStartTime = '12:30';
    let workingEndTime = '19:00';
    
    // Check for daily override first
    for (const wh of workingHours) {
      if (wh.type !== 'daily_override' || !wh.isActive) continue;
      
      const [startYear, startMonth, startDay] = wh.startDate.split('-').map(Number);
      const [endYear, endMonth, endDay] = wh.endDate.split('-').map(Number);
      
      const startDateNum = startYear * 10000 + startMonth * 100 + startDay;
      const endDateNum = endYear * 10000 + endMonth * 100 + endDay;
      
      if (selectedDateNum >= startDateNum && selectedDateNum <= endDateNum) {
        workingStartTime = wh.startTime;
        workingEndTime = wh.endTime;
        break;
      }
    }
    
    // If no daily override, check for default hours
    if (workingStartTime === '12:30' && workingEndTime === '19:00') {
      const defaultHours = workingHours.find(wh => wh.type === 'default' && wh.isActive);
      if (defaultHours) {
        workingStartTime = defaultHours.startTime;
        workingEndTime = defaultHours.endTime;
      }
    }

    const startMinutes = timeToMinutes(workingStartTime);
    const endMinutes = timeToMinutes(workingEndTime);
    const slots = [];

    const bookedRanges = rawBookings
      .filter((b) => b.date === selectedDate && b.status !== 'cancelled' && b.id !== editingBooking?.id)
      .map((b) => ({ start: timeToMinutes(b.start_time), end: timeToMinutes(b.end_time) }))
      .sort((a, b) => a.start - b.start);

    let blockedStart = null;
    let blockedEnd = null;

    if (selectedDate) {
      const [selYear, selMonth, selDay] = selectedDate.split('-').map(Number);
      const selectedDateNum = selYear * 10000 + selMonth * 100 + selDay;

      for (const override of overrides) {
        if (!override.isActive) continue;
        const overrideStart = new Date(override.startAt);
        const overrideEnd = new Date(override.endAt);
        const startYear = overrideStart.getFullYear();
        const startMonth = overrideStart.getMonth() + 1;
        const startDay = overrideStart.getDate();
        const endYear = overrideEnd.getFullYear();
        const endMonth = overrideEnd.getMonth() + 1;
        const endDay = overrideEnd.getDate();
        const startDateNum = startYear * 10000 + startMonth * 100 + startDay;
        const endDateNum = endYear * 10000 + endMonth * 100 + endDay;

        if (selectedDateNum >= startDateNum && selectedDateNum <= endDateNum) {
          if (override.type === 'partial_override' && override.availableHours) {
            const [blockStart, blockEnd] = override.availableHours.split('-');
            if (blockStart && blockEnd) {
              blockedStart = timeToMinutes(blockStart.trim());
              blockedEnd = timeToMinutes(blockEnd.trim());
            }
          }
        }
      }
    }

    const isSlotAvailable = (slotStart, slotEnd) => {
      if (blockedStart !== null && blockedEnd !== null) {
        if (slotStart < blockedEnd && slotEnd > blockedStart) return false;
      }
      for (const booked of bookedRanges) {
        if (slotStart < booked.end + 5 && slotEnd > booked.start - 5) return false;
      }
      return true;
    };

    for (let minutes = startMinutes; minutes + serviceDuration <= endMinutes; minutes += 15) {
      const slotEnd = minutes + serviceDuration;
      if (isSlotAvailable(minutes, slotEnd)) {
        slots.push({ time: minutesToTime(minutes), start: minutes, end: slotEnd });
      }
    }

    return slots;
  }, [selectedDate, editingBooking, rawBookings, selectedServiceId, serviceDuration, overrides, workingHours]);

  const deleteBookingMutation = useMutation({
    mutationFn: (id) => base44.entities.Booking.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] })
  });

  const updateBookingMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Booking.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setEditingBooking(null);
      setShowBookingDialog(false);
    }
  });

  const createBookingMutation = useMutation({
    mutationFn: (data) => base44.entities.Booking.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setShowBookingDialog(false);
    }
  });

  const deleteStoryMutation = useMutation({
    mutationFn: (id) => base44.entities.Story.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stories'] })
  });

  const updateStoryMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Story.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      setShowStoryDialog(false);
      setEditingStory(null);
      setStoryTitle("");
      setStoryImageUrl("");
    }
  });

  const createNotificationMutation = useMutation({
    mutationFn: (data) => base44.entities.Notification.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setShowNotificationDialog(false);
      setEditingNotification(null);
    }
  });

  const updateNotificationMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Notification.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setShowNotificationDialog(false);
      setEditingNotification(null);
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const createOverrideMutation = useMutation({
    mutationFn: (data) => base44.entities.AvailabilityOverride.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['overrides'] });
      setShowOverrideDialog(false);
      setEditingOverride(null);
    }
  });

  const updateOverrideMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AvailabilityOverride.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['overrides'] });
      setShowOverrideDialog(false);
      setEditingOverride(null);
    }
  });

  const deleteOverrideMutation = useMutation({
    mutationFn: (id) => base44.entities.AvailabilityOverride.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['overrides'] })
  });

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_session');
    localStorage.removeItem('customer_session');
    navigate(createPageUrl("AuthChoice"));
  };

  React.useEffect(() => {
    if (!isAuthenticated) return;
    const currentIds = rawBookings.map((b) => b.id);
    const previousIds = previousBookingsRef.current;

    if (!initialLoadDone) {
      previousBookingsRef.current = currentIds;
      if (rawBookings.length > 0) setInitialLoadDone(true);
      return;
    }

    const newBookings = rawBookings.filter((b) => !previousIds.includes(b.id) && b.status === 'confirmed');
    if (newBookings.length > 0) setNewBookingPopup(newBookings[0]);
    previousBookingsRef.current = currentIds;
  }, [rawBookings, isAuthenticated, initialLoadDone]);

  const handleNewStorySubmit = async () => {
    if (!newStoryTitle || !newStoryFile) return;
    setUploadingStory(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file: newStoryFile });
    await base44.entities.Story.create({
      title: newStoryTitle,
      image_url: file_url,
      order: stories.length + 1,
      gender: newStoryGender
    });
    queryClient.invalidateQueries({ queryKey: ['stories'] });
    setUploadingStory(false);
    setShowNewStoryDialog(false);
    setNewStoryTitle("");
    setNewStoryFile(null);
    setNewStoryGender("male");
  };

  const openStoryEditDialog = (story) => {
    setEditingStory(story);
    setStoryTitle(story.title);
    setStoryImageUrl(story.image_url);
    setStoryGender(story.gender || "male");
    setShowStoryDialog(true);
  };

  const handleStoryEditSubmit = async () => {
    if (!editingStory || !storyTitle) return;
    updateStoryMutation.mutate({
      id: editingStory.id,
      data: {
        title: storyTitle,
        image_url: storyImageUrl,
        gender: storyGender
      }
    });
  };

  const handleStoryImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingStory(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setStoryImageUrl(file_url);
    setUploadingStory(false);
  };

  const handleTimeSelect = (time, start, end) => {
    setSelectedTime(time);
    setStartTime(time);
    setEndTime(minutesToTime(end));
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      service_id: editingBooking?.service_id || selectedServiceId,
      service_name: editingBooking?.service_name || selectedServiceForNew?.name,
      service_duration: editingBooking?.service_duration || selectedServiceForNew?.duration_minutes,
      price: editingBooking?.price || selectedServiceForNew?.price,
      date: formData.get('date'),
      start_time: startTime,
      end_time: endTime,
      status: formData.get('status') || 'confirmed'
    };

    if (editingBooking) {
      updateBookingMutation.mutate({ id: editingBooking.id, data });
    } else {
      createBookingMutation.mutate(data);
    }
  };

  const handleNotificationSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const message = formData.get('message');
    const startAtStr = formData.get('startAt');
    const isPermanent = formData.get('isPermanent') === 'on';

    const startAt = new Date(startAtStr);
    let expiresAt;
    let duration;
    let durationUnit;

    if (isPermanent) {
      // Set expiry date far in the future for permanent notifications
      expiresAt = new Date('2099-12-31T23:59:59');
      duration = 0;
      durationUnit = 'permanent';
    } else {
      duration = parseInt(formData.get('duration')) || 1;
      durationUnit = formData.get('durationUnit') || 'hours';
      expiresAt = new Date(startAt);

      switch (durationUnit) {
        case 'minutes': expiresAt.setMinutes(expiresAt.getMinutes() + duration); break;
        case 'hours': expiresAt.setHours(expiresAt.getHours() + duration); break;
        case 'days': expiresAt.setDate(expiresAt.getDate() + duration); break;
      }
    }

    const data = { message, startAt: startAt.toISOString(), duration, durationUnit, expiresAt: expiresAt.toISOString() };

    if (editingNotification) {
      updateNotificationMutation.mutate({ id: editingNotification.id, data });
    } else {
      createNotificationMutation.mutate(data);
    }
  };

  const handleOverrideSubmit = (e) => {
    e.preventDefault();
    const getValue = (name) => e.target.get ? e.target.get(name) : new FormData(e.target).get(name);

    const type = getValue('type');
    const startAtStr = getValue('startAt');
    const endAtStr = getValue('endAt');
    const availableHours = getValue('availableHours');
    const isActive = getValue('isActive') === 'on';

    const startAt = new Date(startAtStr);
    const endAt = new Date(endAtStr);

    if (endAt <= startAt) {
      alert('שעת הסיום חייבת להיות אחרי שעת ההתחלה');
      return;
    }

    const data = { type, startAt: startAt.toISOString(), endAt: endAt.toISOString(), availableHours: availableHours || null, reason: null, isActive };

    if (editingOverride) {
      updateOverrideMutation.mutate({ id: editingOverride.id, data });
    } else {
      createOverrideMutation.mutate(data);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(createPageUrl("AdminSignIn"));
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1E1E1E' }}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full animate-pulse" style={{ background: 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)' }}></div>
          <p className="font-bold" style={{ color: '#DEC6A7' }}>מעביר...</p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "bookings":
        return (
          <div className="tab-content rounded-3xl p-4 md:p-6" style={{ background: 'rgba(222,198,167,0.06)', border: '1px solid rgba(222,198,167,0.2)' }}>
            <div className="flex items-center justify-center mb-5">
              <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setEditingBooking(null);
                      setSelectedDate('');
                      setSelectedTime(null);
                      setStartTime(null);
                      setEndTime(null);
                      setSelectedServiceId('');
                    }}
                    className="font-bold rounded-xl"
                    style={{ background: 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)', color: '#1E1E1E' }}
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    תור חדש
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" style={{ background: '#1E1E1E', border: '1px solid rgba(222,198,167,0.3)' }}>
                  <DialogHeader>
                    <DialogTitle className="text-center text-xl font-bold" style={{ color: '#DEC6A7' }}>
                      {editingBooking ? 'עריכת תור' : 'יצירת תור חדש'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleBookingSubmit} className="space-y-5">
                    <div>
                      <Label htmlFor="name" className="text-right block mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>שם</Label>
                      <Input id="name" name="name" defaultValue={editingBooking?.name} required className="rounded-xl text-right text-white" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(222,198,167,0.25)' }} />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-right block mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>טלפון</Label>
                      <Input id="phone" name="phone" defaultValue={editingBooking?.phone} required className="rounded-xl text-right text-white" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(222,198,167,0.25)' }} />
                    </div>
                    {editingBooking ? (
                      <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(222,198,167,0.2)' }}>
                        <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>שירות</p>
                        <p className="text-white font-medium">{editingBooking.service_name}</p>
                        <p className="text-xs mt-1" style={{ color: '#DEC6A7' }}>{editingBooking.service_duration} דקות • {editingBooking.price} ₪</p>
                      </div>
                    ) : (
                      <div>
                        <Label className="text-right block mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>שירות</Label>
                        <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                          <SelectTrigger className="rounded-xl text-right text-white" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(222,198,167,0.25)' }}>
                            <SelectValue placeholder="בחר שירות" />
                          </SelectTrigger>
                          <SelectContent style={{ background: '#2a2a2a', border: '1px solid rgba(222,198,167,0.25)' }}>
                            {services.map((service) => (
                              <SelectItem key={service.id} value={service.id} className="text-white">
                                {service.name} - {service.price} ₪
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div>
                      <Label htmlFor="date" className="text-right block mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>תאריך</Label>
                      <input type="hidden" name="date" value={selectedDate || editingBooking?.date || ''} />
                      <AdminDatePicker
                        selectedDate={selectedDate || editingBooking?.date || ''}
                        onDateChange={(date) => {
                          setSelectedDate(date);
                          setSelectedTime(null);
                          setStartTime(null);
                          setEndTime(null);
                        }}
                        overrides={overrides}
                      />
                    </div>
                    {selectedDate && (editingBooking || selectedServiceId) && (
                      <div>
                        <Label className="text-right block mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>בחר שעה פנויה</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {availableSlots.map((slot) => {
                            const isSelected = selectedTime === slot.time;
                            return (
                              <button
                                key={slot.time}
                                type="button"
                                onClick={() => handleTimeSelect(slot.time, slot.start, slot.end)}
                                className="px-3 py-3 rounded-xl font-bold transition-all duration-200"
                                style={isSelected ? {
                                  background: 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)',
                                  color: '#1E1E1E',
                                  boxShadow: '0 4px 12px rgba(222,198,167,0.4)'
                                } : {
                                  background: 'rgba(255,255,255,0.06)',
                                  border: '1px solid rgba(222,198,167,0.25)',
                                  color: 'white'
                                }}
                              >
                                <div className="flex flex-col items-center">
                                  <Clock className="w-4 h-4 mb-1" style={{ color: isSelected ? '#1E1E1E' : '#DEC6A7' }} />
                                  <span className="text-sm">{slot.time}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    <div>
                      <Label htmlFor="status" className="text-right block mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>סטטוס</Label>
                      <Select name="status" defaultValue={editingBooking?.status || 'confirmed'}>
                        <SelectTrigger className="rounded-xl text-right text-white" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(222,198,167,0.25)' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent style={{ background: '#2a2a2a', border: '1px solid rgba(222,198,167,0.25)' }}>
                          <SelectItem value="confirmed" className="text-white">מאושר</SelectItem>
                          <SelectItem value="cancelled" className="text-white">מבוטל</SelectItem>
                          <SelectItem value="completed" className="text-white">הושלם</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" disabled={!selectedTime || !startTime || (!editingBooking && !selectedServiceId)} className="w-full font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed" style={{ background: 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)', color: '#1E1E1E' }}>
                      {editingBooking ? 'עדכן' : 'צור'} תור
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Mobile-optimized booking cards */}
            <div className="space-y-3" dir="rtl">
              {bookings.map((booking) => {
                const needsReminder = isWithinOneHour(booking);
                return (
                  <div
                    key={booking.id}
                    className="rounded-2xl p-4 transition-all"
                    style={{
                      background: needsReminder ? 'rgba(222,198,167,0.1)' : 'rgba(255,255,255,0.04)',
                      border: needsReminder ? '1px solid rgba(222,198,167,0.5)' : '1px solid rgba(222,198,167,0.12)',
                      boxShadow: needsReminder ? '0 0 16px rgba(222,198,167,0.2)' : 'none',
                      animation: needsReminder ? 'goldPulse 2s ease-in-out infinite' : 'none'
                    }}
                  >
                    {/* Top row: name + status */}
                    <div className="flex items-start justify-between mb-3">
                      <span
                        className="text-xs font-bold px-2 py-1 rounded-lg"
                        style={booking.status === 'confirmed' ? { background: 'rgba(34,197,94,0.15)', color: '#86efac' } :
                               booking.status === 'cancelled' ? { background: 'rgba(239,68,68,0.15)', color: '#fca5a5' } :
                               { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
                      >
                        {booking.status === 'confirmed' ? 'מאושר' : booking.status === 'cancelled' ? 'מבוטל' : 'הושלם'}
                      </span>
                      <div>
                        <p className="font-bold text-base text-right" style={{ color: '#DEC6A7' }}>{booking.name}</p>
                        <p className="text-xs text-right" style={{ color: 'rgba(255,255,255,0.5)' }}>{booking.service_name} • {booking.price} ₪</p>
                      </div>
                    </div>

                    {/* Middle row: date + time + phone */}
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }} dir="ltr">{booking.phone}</p>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">{getDayName(booking.date)} • {booking.start_time}–{booking.end_time}</p>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }} dir="ltr">{formatDateNumbers(booking.date)}</p>
                      </div>
                    </div>

                    {/* Actions row */}
                    <div className="flex items-center justify-start gap-2 pt-2" style={{ borderTop: '1px solid rgba(222,198,167,0.1)' }}>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" style={{ color: '#86efac', background: 'rgba(34,197,94,0.1)' }} onClick={() => { setWhatsappBooking(booking); setShowWhatsappDialog(true); }}>
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" style={{ color: '#DEC6A7', background: 'rgba(222,198,167,0.1)' }} onClick={() => { setEditingBooking(booking); setSelectedDate(booking.date); setSelectedTime(booking.start_time); setStartTime(booking.start_time); setEndTime(booking.end_time); setShowBookingDialog(true); }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" style={{ color: '#fca5a5', background: 'rgba(239,68,68,0.1)' }} onClick={() => { if (confirm('למחוק את התור?')) deleteBookingMutation.mutate(booking.id); }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {bookings.length === 0 && (
              <div className="text-center py-12" style={{ color: 'rgba(255,255,255,0.35)' }}>
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>אין תורים עדיין</p>
              </div>
            )}
            
            {/* WhatsApp Template Dialog */}
            <Dialog open={showWhatsappDialog} onOpenChange={setShowWhatsappDialog}>
              <DialogContent className="max-w-sm" style={{ background: '#1E1E1E', border: '1px solid rgba(222,198,167,0.3)' }}>
                <DialogHeader>
                  <DialogTitle className="text-center text-xl font-bold" style={{ color: '#DEC6A7' }}>
                    שליחת הודעת וואטסאפ
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <p className="text-center text-sm mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    בחר סוג הודעה עבור {whatsappBooking?.name}
                  </p>
                  <Button
                    onClick={() => openWhatsApp(whatsappBooking, 'confirmation')}
                    className="w-full h-14 rounded-xl flex items-center justify-center gap-3"
                    style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', color: '#86efac' }}
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-bold">אישור תור</span>
                  </Button>
                  <Button
                    onClick={() => openWhatsApp(whatsappBooking, 'reminder')}
                    className="w-full h-14 rounded-xl flex items-center justify-center gap-3"
                    style={{ background: 'rgba(222,198,167,0.12)', border: '1px solid rgba(222,198,167,0.35)', color: '#DEC6A7' }}
                  >
                    <Bell className="w-5 h-5" />
                    <span className="font-bold">תזכורת לתור</span>
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <style>{`
              @keyframes goldPulse {
                0%, 100% { box-shadow: 0 0 0 1px rgba(222,198,167,0.3), 0 0 12px rgba(222,198,167,0.15); }
                50% { box-shadow: 0 0 0 2px rgba(222,198,167,0.6), 0 0 24px rgba(222,198,167,0.3); }
              }
            `}</style>
          </div>
        );
      case "stories":
        return (
          <div className="tab-content rounded-2xl p-3" style={{ background: 'rgba(222,198,167,0.06)', border: '1px solid rgba(222,198,167,0.2)' }}>
            {/* Top bar: filter + actions — stacks on mobile */}
            <div className="flex flex-col gap-3 mb-4" dir="rtl">
              {/* Gender filter — full width on mobile */}
              <div className="flex gap-2 w-full">
                <button
                  type="button"
                  onClick={() => { setStoryFilterGender("male"); setStoryFilterEnabled(true); }}
                  className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95"
                  style={storyFilterEnabled && storyFilterGender === "male"
                    ? { background: 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)', color: '#1E1E1E' }
                    : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(222,198,167,0.25)', color: 'rgba(255,255,255,0.6)' }}
                >גברים</button>
                <button
                  type="button"
                  onClick={() => { setStoryFilterGender("female"); setStoryFilterEnabled(true); }}
                  className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95"
                  style={storyFilterEnabled && storyFilterGender === "female"
                    ? { background: 'linear-gradient(135deg, #e8a0c0 0%, #c970a0 100%)', color: '#1E1E1E' }
                    : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(222,198,167,0.25)', color: 'rgba(255,255,255,0.6)' }}
                >נשים</button>
                <button
                  type="button"
                  onClick={() => setStoryFilterEnabled(false)}
                  className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95"
                  style={!storyFilterEnabled
                    ? { background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff' }
                    : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.4)' }}
                >הכל</button>
              </div>
              {/* Actions row */}
              <div className="flex gap-2 w-full">
                <Button
                  onClick={() => { setShowNewStoryDialog(true); setNewStoryTitle(""); setNewStoryFile(null); setNewStoryGender("male"); }}
                  className="flex-1 h-11 font-bold rounded-2xl text-sm"
                  style={{ background: 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)', color: '#1E1E1E' }}
                >
                  <Plus className="w-4 h-4 ml-1" />
                  סטיילינג חדש
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setStoryEditMode(!storyEditMode)}
                  className="flex-1 h-11 font-bold rounded-2xl text-sm"
                  style={storyEditMode
                    ? { background: 'rgba(222,198,167,0.15)', border: '1px solid rgba(222,198,167,0.4)', color: '#DEC6A7' }
                    : { background: 'transparent', border: '1px solid rgba(222,198,167,0.35)', color: '#DEC6A7' }}
                >
                  {storyEditMode ? <X className="w-4 h-4 ml-1" /> : <Edit className="w-4 h-4 ml-1" />}
                  {storyEditMode ? 'ביטול' : 'עריכה'}
                </Button>
              </div>
            </div>

            {/* New Story Dialog */}
            <Dialog open={showNewStoryDialog} onOpenChange={setShowNewStoryDialog}>
              <DialogContent className="w-[92vw] max-w-sm rounded-3xl max-h-[80vh] overflow-y-auto" style={{ background: '#1E1E1E', border: '1px solid rgba(222,198,167,0.3)' }}>
                <DialogHeader>
                  <DialogTitle className="text-center text-lg font-bold" style={{ color: '#DEC6A7' }}>סטיילינג חדש</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pb-2" dir="rtl">
                  <div>
                    <Label className="block mb-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>כותרת *</Label>
                    <Input
                      value={newStoryTitle}
                      onChange={(e) => setNewStoryTitle(e.target.value)}
                      placeholder="שם הסטיילינג"
                      className="h-11 rounded-2xl text-right text-white text-base"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(222,198,167,0.25)' }}
                    />
                  </div>
                  <div>
                    <Label className="block mb-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>מגדר</Label>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setNewStoryGender("male")} className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95"
                        style={newStoryGender === "male" ? { background: 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)', color: '#1E1E1E' } : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(222,198,167,0.25)', color: 'rgba(255,255,255,0.6)' }}>
                        גברים
                      </button>
                      <button type="button" onClick={() => setNewStoryGender("female")} className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95"
                        style={newStoryGender === "female" ? { background: 'linear-gradient(135deg, #e8a0c0 0%, #c970a0 100%)', color: '#1E1E1E' } : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(222,198,167,0.25)', color: 'rgba(255,255,255,0.6)' }}>
                        נשים
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label className="block mb-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>תמונה *</Label>
                    <label htmlFor="new-story-file" className="cursor-pointer block">
                      <div className="w-full py-4 rounded-2xl font-bold text-sm text-center transition-all active:scale-95"
                        style={{ background: 'rgba(255,255,255,0.06)', border: `1px dashed ${newStoryFile ? 'rgba(222,198,167,0.6)' : 'rgba(222,198,167,0.25)'}`, color: newStoryFile ? '#DEC6A7' : 'rgba(255,255,255,0.5)' }}>
                        <Upload className="w-5 h-5 inline ml-2" />
                        {newStoryFile ? newStoryFile.name : 'בחר תמונה'}
                      </div>
                      <input id="new-story-file" type="file" accept="image/*" className="hidden" onChange={(e) => setNewStoryFile(e.target.files[0] || null)} />
                    </label>
                  </div>
                  <Button
                    onClick={handleNewStorySubmit}
                    disabled={!newStoryTitle || !newStoryFile || uploadingStory}
                    className="w-full h-12 font-bold rounded-2xl text-base disabled:opacity-40"
                    style={{ background: 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)', color: '#1E1E1E' }}
                  >
                    {uploadingStory ? 'מעלה...' : 'העלה סטיילינג'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Story Edit Dialog */}
            <Dialog open={showStoryDialog} onOpenChange={(open) => { setShowStoryDialog(open); if (!open) { setEditingStory(null); setStoryTitle(""); setStoryImageUrl(""); } }}>
              <DialogContent className="w-[92vw] max-w-sm rounded-3xl max-h-[80vh] overflow-y-auto" style={{ background: '#1E1E1E', border: '1px solid rgba(222,198,167,0.3)' }}>
                <DialogHeader>
                  <DialogTitle className="text-center text-lg font-bold" style={{ color: '#DEC6A7' }}>עריכת סטיילינג</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pb-2" dir="rtl">
                  <div>
                    <Label className="block mb-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>תמונה</Label>
                    <div className="relative w-20 h-20 mx-auto rounded-full p-0.5" style={{ background: 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)' }}>
                      <div className="w-full h-full rounded-full bg-black p-0.5">
                        <img src={storyImageUrl} alt={storyTitle} className="w-full h-full rounded-full object-cover" />
                      </div>
                    </div>
                    <Label htmlFor="story-edit-image" className="cursor-pointer block mt-3">
                      <Button type="button" variant="outline" className="w-full h-11 rounded-2xl" style={{ border: '1px solid rgba(222,198,167,0.3)', color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.05)' }} disabled={uploadingStory} asChild>
                        <div><Upload className="w-4 h-4 ml-2" />{uploadingStory ? 'מעלה...' : 'החלף תמונה'}</div>
                      </Button>
                      <Input id="story-edit-image" type="file" accept="image/*" onChange={handleStoryImageChange} className="hidden" disabled={uploadingStory} />
                    </Label>
                  </div>
                  <div>
                    <Label className="block mb-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>כותרת</Label>
                    <Input value={storyTitle} onChange={(e) => setStoryTitle(e.target.value)} className="h-11 rounded-2xl text-right text-white text-base" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(222,198,167,0.25)' }} />
                  </div>
                  <div>
                    <Label className="block mb-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>מגדר</Label>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setStoryGender("male")} className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95"
                        style={storyGender === "male" ? { background: 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)', color: '#1E1E1E' } : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(222,198,167,0.25)', color: 'rgba(255,255,255,0.6)' }}>
                        גברים
                      </button>
                      <button type="button" onClick={() => setStoryGender("female")} className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95"
                        style={storyGender === "female" ? { background: 'linear-gradient(135deg, #e8a0c0 0%, #c970a0 100%)', color: '#1E1E1E' } : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(222,198,167,0.25)', color: 'rgba(255,255,255,0.6)' }}>
                        נשים
                      </button>
                    </div>
                  </div>
                  <Button onClick={handleStoryEditSubmit} disabled={!storyTitle || updateStoryMutation.isPending} className="w-full h-12 font-bold rounded-2xl text-base disabled:opacity-40" style={{ background: 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)', color: '#1E1E1E' }}>
                    עדכן
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            {/* Stories grid — 3 cols on mobile for comfortable touch targets */}
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {stories.filter(s => !storyFilterEnabled || (s.gender || 'male') === storyFilterGender).map((story) => (
                <div
                  key={story.id}
                  className={`relative flex flex-col items-center ${storyEditMode ? 'cursor-pointer' : ''}`}
                  onClick={() => storyEditMode && openStoryEditDialog(story)}
                >
                  <div className="w-20 h-20 rounded-full p-0.5" style={{ background: storyFilterGender === 'female' ? 'linear-gradient(135deg, #e8a0c0 0%, #c970a0 100%)' : 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)', outline: storyEditMode ? '2px solid rgba(222,198,167,0.5)' : 'none', outlineOffset: '2px' }}>
                    <div className="w-full h-full rounded-full bg-black p-0.5 relative">
                      <img src={story.image_url} alt={story.title} className="w-full h-full rounded-full object-cover" />
                      {storyEditMode && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                          <Edit className="w-5 h-5" style={{ color: '#DEC6A7' }} />
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-center text-xs font-medium mt-2 text-gray-300 leading-tight w-full truncate px-1">{story.title}</p>
                  {storyEditMode && (
                    <button
                      className="mt-2 flex items-center justify-center w-9 h-9 rounded-full transition-all active:scale-90"
                      style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)' }}
                      onClick={(e) => { e.stopPropagation(); if (confirm('למחוק את הסטיילינג?')) deleteStoryMutation.mutate(story.id); }}
                    >
                      <Trash2 className="w-4 h-4" style={{ color: '#fca5a5' }} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case "services":
        return <div className="tab-content"><ServicesTab /></div>;
      case "products":
        return <div className="tab-content"><ProductsTab products={products} /></div>;
      case "notifications":
        return (
          <div className="tab-content"><NotificationsTab
            notifications={notifications}
            editingNotification={editingNotification}
            setEditingNotification={setEditingNotification}
            showDialog={showNotificationDialog}
            setShowDialog={setShowNotificationDialog}
            onSubmit={handleNotificationSubmit}
            onDelete={(id) => deleteNotificationMutation.mutate(id)}
          /></div>
        );
      case "availability":
        return (
          <div className="tab-content"><AvailabilityTab
            overrides={overrides}
            editingOverride={editingOverride}
            setEditingOverride={setEditingOverride}
            showDialog={showOverrideDialog}
            setShowDialog={setShowOverrideDialog}
            onSubmit={handleOverrideSubmit}
            onDelete={(id) => deleteOverrideMutation.mutate(id)}
            onToggleActive={(id, isActive) => updateOverrideMutation.mutate({ id, data: { isActive } })}
          /></div>
        );
      case "clients":
        return <div className="tab-content"><ClientsTab /></div>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen relative" style={{ background: '#1E1E1E' }}>
      {/* Subtle background texture overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(222,198,167,0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(222,198,167,0.03) 0%, transparent 50%)' }} />
      {/* New Booking Popup */}
      {newBookingPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md animate-in zoom-in-95 duration-300">
            <div className="rounded-3xl overflow-hidden" style={{ background: '#1E1E1E', border: '1px solid rgba(222,198,167,0.4)', boxShadow: '0 8px 40px rgba(222,198,167,0.2)' }}>
              <div className="p-4 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black/20 rounded-full flex items-center justify-center">
                    <Bell className="w-5 h-5 text-black animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-black font-black text-lg">תור חדש!</h3>
                    <p className="text-black/70 text-sm">אושר תור חדש</p>
                  </div>
                </div>
                <button onClick={() => setNewBookingPopup(null)} className="w-8 h-8 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(222,198,167,0.15)' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)' }}>
                  <User className="w-5 h-5 text-black" />
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>שם לקוח</p>
                  <p className="text-white font-bold text-lg">{newBookingPopup.name}</p>
                </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(222,198,167,0.15)' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)' }}>
                  <Phone className="w-5 h-5 text-black" />
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>מספר טלפון</p>
                  <p className="text-white font-bold text-lg" dir="ltr">{newBookingPopup.phone}</p>
                </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(222,198,167,0.15)' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)' }}>
                  <Scissors className="w-5 h-5 text-black" />
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>שירות</p>
                  <p className="text-white font-bold">{newBookingPopup.service_name}</p>
                  <p className="font-bold" style={{ color: '#DEC6A7' }}>{newBookingPopup.price} ₪</p>
                </div>
                </div>
                <div className="flex gap-3">
                <div className="flex-1 flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(222,198,167,0.15)' }}>
                  <Calendar className="w-5 h-5" style={{ color: '#DEC6A7' }} />
                  <div>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>תאריך</p>
                    <p className="text-white font-bold text-sm">{formatDateInHebrew(newBookingPopup.date)}</p>
                  </div>
                </div>
                <div className="flex-1 flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(222,198,167,0.15)' }}>
                  <Clock className="w-5 h-5" style={{ color: '#DEC6A7' }} />
                  <div>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>שעה</p>
                    <p className="text-white font-bold">{newBookingPopup.start_time}</p>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-row-reverse relative z-10">
        {/* Sidebar */}
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {/* Main Header */}
          <div className="rounded-2xl p-4 mb-6 flex items-center justify-between" style={{ background: 'rgba(222,198,167,0.07)', border: '1px solid rgba(222,198,167,0.2)' }}>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="lg:hidden rounded-xl" style={{ color: '#DEC6A7' }}>
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-xl md:text-2xl font-black" style={{ background: 'linear-gradient(135deg, #DEC6A7 0%, #F7E27A 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>לוח בקרה</h1>
            <div className="w-10 lg:hidden" />
          </div>

          {renderTabContent()}
          <div className="h-24" /> {/* Bottom padding for navbar */}
        </main>
      </div>
    </div>
  );
}