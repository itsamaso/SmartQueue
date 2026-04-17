import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Clock, CalendarOff, ChevronRight, ChevronLeft, Settings, Sun } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const hebrewMonths = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

const formatDateInHebrew = (dateStr) => {
  const date = new Date(dateStr);
  const day = date.getDate();
  const monthName = hebrewMonths[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${monthName} ${year}`;
};

const getOverrideStatus = (override) => {
  const now = new Date();
  const startAt = new Date(override.startAt);
  const endAt = new Date(override.endAt);
  
  if (now < startAt) return { label: 'עתידי', color: 'bg-blue-900/70 text-blue-300' };
  if (now >= endAt) return { label: 'הסתיים', color: 'bg-gray-800/70 text-gray-400' };
  return { label: 'פעיל', color: 'bg-green-900/70 text-green-300' };
};

// RTL display: Sunday on right (column 0), Saturday on left (column 6)
const hebrewDaysShortRTL = ['ראש', 'שני', 'שלי', 'רבי', 'חמי', 'שישי', 'שבת'];

// Date Picker Component
function DatePicker({ selectedDate, onDateChange, label, overrides = [], disableMondays = true, disableFullClosures = true }) {
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (selectedDate) {
      return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    }
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  });

  const isMonday = (date) => date && date.getDay() === 1;

  const isFullClosureDay = (date) => {
    if (!date || !disableFullClosures) return false;
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
    if (disableMondays && isMonday(date)) return true;
    if (disableFullClosures && isFullClosureDay(date)) return true;
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
    onDateChange(date);
    setOpen(false);
  };

  const isDateSelected = (date) => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div>
      <Label className="text-right block mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between rounded-xl text-white"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(222,198,167,0.25)' }}
          >
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
                  className={`aspect-square rounded-lg text-sm font-medium transition-all ${!date ? 'invisible' : ''} ${isMondayDay || isClosureDay ? 'bg-red-950/50 text-red-400/50 cursor-not-allowed' : disabled ? 'text-gray-600 cursor-not-allowed' : 'text-white hover:bg-white/10'}`}
                  style={isDateSelected(date) ? { background: 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)', color: '#1E1E1E' } : {}}
                >
                  {date ? date.getDate() : ''}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}



// Time Picker with scroll wheel style
function TimePicker({ value, onChange, label }) {
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];
  
  const [selectedHour, setSelectedHour] = React.useState(() => value ? value.split(':')[0] : '12');
  const [selectedMinute, setSelectedMinute] = React.useState(() => value ? value.split(':')[1] : '00');

  React.useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      setSelectedHour(h);
      setSelectedMinute(m);
    }
  }, [value]);

  const handleHourChange = (hour) => {
    setSelectedHour(hour);
    onChange(`${hour}:${selectedMinute}`);
  };

  const handleMinuteChange = (minute) => {
    setSelectedMinute(minute);
    onChange(`${selectedHour}:${minute}`);
  };

  return (
    <div>
      <Label className="text-right block mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</Label>
      <div className="flex gap-2 items-center justify-center rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(222,198,167,0.25)' }}>
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-500 mb-1">שעה</span>
          <select
            value={selectedHour}
            onChange={(e) => handleHourChange(e.target.value)}
            className="text-white text-2xl font-bold rounded-lg px-4 py-2 text-center appearance-none cursor-pointer focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(222,198,167,0.25)' }}
          >
            {hours.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>
        <span className="text-2xl font-bold" style={{ color: '#DEC6A7' }}>:</span>
        <div className="flex flex-col items-center">
          <span className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>דקה</span>
          <select
            value={selectedMinute}
            onChange={(e) => handleMinuteChange(e.target.value)}
            className="text-white text-2xl font-bold rounded-lg px-4 py-2 text-center appearance-none cursor-pointer focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(222,198,167,0.25)' }}
          >
            {minutes.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>
      {value && (
        <p className="text-center font-bold mt-2 text-lg" style={{ color: '#DEC6A7' }}>{value}</p>
      )}
    </div>
  );
}

export default function AvailabilityTab({
  overrides,
  editingOverride,
  setEditingOverride,
  showDialog,
  setShowDialog,
  onSubmit,
  onDelete
}) {
  const queryClient = useQueryClient();
  const now = new Date();
  const [overrideType, setOverrideType] = useState(null);
  
  // Full closure state
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  
  // Partial closure state - now with date range
  const [partialStartDate, setPartialStartDate] = useState(null);
  const [partialEndDate, setPartialEndDate] = useState(null);
  const [blockStartTime, setBlockStartTime] = useState('12:00');
  const [blockEndTime, setBlockEndTime] = useState('14:00');
  
  // Daily hours state
  const [dailyStartDate, setDailyStartDate] = useState(null);
  const [dailyEndDate, setDailyEndDate] = useState(null);
  const [dailyStartTime, setDailyStartTime] = useState('12:30');
  const [dailyEndTime, setDailyEndTime] = useState('19:00');
  const [editingDailyHours, setEditingDailyHours] = useState(null);
  
  // Default working hours dialog
  const [showDefaultHoursDialog, setShowDefaultHoursDialog] = useState(false);
  const [defaultStartTime, setDefaultStartTime] = useState('12:30');
  const [defaultEndTime, setDefaultEndTime] = useState('19:00');
  
  // Fetch working hours
  const { data: workingHours = [] } = useQuery({
    queryKey: ['workingHours'],
    queryFn: () => base44.entities.WorkingHours.list('-created_date')
  });
  
  // Get default working hours
  const defaultHours = workingHours.find(wh => wh.type === 'default' && wh.isActive);
  
  // Mutations for working hours
  const createWorkingHoursMutation = useMutation({
    mutationFn: (data) => base44.entities.WorkingHours.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workingHours'] });
      setShowDefaultHoursDialog(false);
      setShowDialog(false);
    }
  });
  
  const updateWorkingHoursMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.WorkingHours.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workingHours'] });
      setShowDefaultHoursDialog(false);
    }
  });
  
  const deleteWorkingHoursMutation = useMutation({
    mutationFn: (id) => base44.entities.WorkingHours.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workingHours'] })
  });
  
  // Filter out expired overrides
  const activeOverrides = overrides.filter(override => {
    const endAt = new Date(override.endAt);
    return endAt >= now;
  });
  
  // Filter active daily hour overrides
  const activeDailyHours = workingHours.filter(wh => {
    if (wh.type !== 'daily_override' || !wh.isActive) return false;
    const endDate = new Date(wh.endDate + 'T23:59:59');
    return endDate >= now;
  });

  const resetForm = () => {
    setOverrideType(null);
    setStartDate(null);
    setEndDate(null);
    setPartialStartDate(null);
    setPartialEndDate(null);
    setBlockStartTime('12:00');
    setBlockEndTime('14:00');
    setDailyStartDate(null);
    setDailyEndDate(null);
    setDailyStartTime('12:30');
    setDailyEndTime('19:00');
    setEditingDailyHours(null);
  };

  const handleOpenDialog = (override = null) => {
    if (override) {
      setEditingOverride(override);
      setOverrideType(override.type);
      if (override.type === 'full_closure') {
        setStartDate(new Date(override.startAt));
        setEndDate(new Date(override.endAt));
      } else {
        setPartialStartDate(new Date(override.startAt));
        setPartialEndDate(new Date(override.endAt));
        if (override.availableHours) {
          const [start, end] = override.availableHours.split('-');
          setBlockStartTime(start?.trim());
          setBlockEndTime(end?.trim());
        }
      }
    } else {
      setEditingOverride(null);
      resetForm();
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    resetForm();
    setEditingOverride(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (overrideType === 'full_closure') {
      if (!startDate || !endDate) {
        alert('الرجاء اختيار تاريخ البداية والنهاية');
        return;
      }
      if (endDate < startDate) {
        alert('تاريخ النهاية يجب أن يكون بعد تاريخ البداية');
        return;
      }
      
      // Create dates in local timezone properly
      const startAt = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0, 0);
      const endAt = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999);
      
      // Format as local date string to avoid timezone issues
      const formatLocalDateTime = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };
      
      const formData = {
        type: 'full_closure',
        startAt: formatLocalDateTime(startAt),
        endAt: formatLocalDateTime(endAt),
        availableHours: '',
        reason: '',
        isActive: 'on'
      };
      
      const syntheticEvent = {
        preventDefault: () => {},
        target: { get: (name) => formData[name] }
      };
      
      onSubmit(syntheticEvent);
    } else if (overrideType === 'partial_override') {
      if (!partialStartDate || !blockStartTime || !blockEndTime) {
        alert('الرجاء اختيار التاريخ ووقت البداية والنهاية');
        return;
      }
      if (blockEndTime <= blockStartTime) {
        alert('وقت النهاية يجب أن يكون بعد وقت البداية');
        return;
      }
      
      // Handle single day case (when end date not selected or same as start)
      const effectiveEndDate = partialEndDate || partialStartDate;
      
      if (effectiveEndDate < partialStartDate) {
        alert('تاريخ النهاية يجب أن يكون بعد تاريخ البداية');
        return;
      }
      
      // Create dates in local timezone properly
      const startAt = new Date(partialStartDate.getFullYear(), partialStartDate.getMonth(), partialStartDate.getDate(), 0, 0, 0, 0);
      const endAt = new Date(effectiveEndDate.getFullYear(), effectiveEndDate.getMonth(), effectiveEndDate.getDate(), 23, 59, 59, 999);
      
      // Format as local date string to avoid timezone issues
      const formatLocalDateTime = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };
      
      const formData = {
        type: 'partial_override',
        startAt: formatLocalDateTime(startAt),
        endAt: formatLocalDateTime(endAt),
        availableHours: `${blockStartTime}-${blockEndTime}`,
        reason: '',
        isActive: 'on'
      };
      
      const syntheticEvent = {
        preventDefault: () => {},
        target: { get: (name) => formData[name] }
      };
      
      onSubmit(syntheticEvent);
    } else if (overrideType === 'daily_hours') {
      if (!dailyStartDate) {
        alert('الرجاء اختيار التاريخ');
        return;
      }
      if (!dailyStartTime || !dailyEndTime || dailyStartTime === '00:00' && dailyEndTime === '00:00') {
        alert('الرجاء تحديد وقت البداية والنهاية');
        return;
      }
      if (dailyEndTime <= dailyStartTime) {
        alert('وقت النهاية يجب أن يكون بعد وقت البداية');
        return;
      }
      
      // Handle single day case (when end date not selected or same as start)
      const effectiveEndDate = dailyEndDate || dailyStartDate;
      
      if (effectiveEndDate < dailyStartDate) {
        alert('تاريخ النهاية يجب أن يكون بعد تاريخ البداية');
        return;
      }
      
      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      if (editingDailyHours) {
        updateWorkingHoursMutation.mutate({
          id: editingDailyHours.id,
          data: {
            startTime: dailyStartTime,
            endTime: dailyEndTime,
            startDate: formatDate(dailyStartDate),
            endDate: formatDate(effectiveEndDate)
          }
        });
      } else {
        createWorkingHoursMutation.mutate({
          type: 'daily_override',
          startTime: dailyStartTime,
          endTime: dailyEndTime,
          startDate: formatDate(dailyStartDate),
          endDate: formatDate(effectiveEndDate),
          isActive: true
        });
      }
    }
    
    handleCloseDialog();
  };
  
  const handleDefaultHoursSubmit = () => {
    if (!defaultStartTime || !defaultEndTime) {
      alert('الرجاء اختيار وقت البداية والنهاية');
      return;
    }
    if (defaultEndTime <= defaultStartTime) {
      alert('وقت النهاية يجب أن يكون بعد وقت البداية');
      return;
    }
    
    if (defaultHours) {
      updateWorkingHoursMutation.mutate({
        id: defaultHours.id,
        data: {
          startTime: defaultStartTime,
          endTime: defaultEndTime
        }
      });
    } else {
      createWorkingHoursMutation.mutate({
        type: 'default',
        startTime: defaultStartTime,
        endTime: defaultEndTime,
        isActive: true
      });
    }
  };

  return (
    <div className="rounded-3xl p-4 md:p-6" style={{ background: 'rgba(222,198,167,0.06)', border: '1px solid rgba(222,198,167,0.2)' }}>
      {/* Default Working Hours Display - always visible */}
      <div className="mb-6 p-4 rounded-xl flex items-center justify-between" style={{ background: 'rgba(222,198,167,0.08)', border: '1px solid rgba(222,198,167,0.25)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)' }}>
            <Clock className="w-5 h-5 text-black" />
          </div>
          <div>
            <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>שעות עבודה ברירת מחדל</p>
            {defaultHours ? (
              <p className="text-white font-bold text-lg">{defaultHours.startTime} – {defaultHours.endTime}</p>
            ) : (
              <p className="text-sm" style={{ color: 'rgba(222,198,167,0.5)' }}>לא הוגדר עדיין</p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-xl flex-shrink-0"
          style={{ color: '#DEC6A7', background: 'rgba(222,198,167,0.1)' }}
          onClick={() => {
            if (defaultHours) {
              setDefaultStartTime(defaultHours.startTime);
              setDefaultEndTime(defaultHours.endTime);
            }
            setShowDefaultHoursDialog(true);
          }}
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
        <Dialog open={showDialog} onOpenChange={(open) => { if (!open) handleCloseDialog(); else handleOpenDialog(); }}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog(null)}
              className="font-bold rounded-xl w-full sm:w-auto"
              style={{ background: 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)', color: '#1E1E1E' }}
            >
              <Plus className="w-4 h-4 ml-2" />
              ניהול שעות עבודה
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" style={{ background: '#1E1E1E', border: '1px solid rgba(222,198,167,0.3)' }}>
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold" style={{ color: '#DEC6A7' }}>
                {editingOverride ? 'עריכת סגירה' : 'הוספת סגירה חדשה'}
              </DialogTitle>
            </DialogHeader>
            
            {!overrideType ? (
              <div className="space-y-4">
                <p className="text-center text-gray-400 mb-4">בחר סוג שינוי</p>
                <Button
                  onClick={() => setOverrideType('full_closure')}
                  className="w-full h-20 bg-red-900/50 hover:bg-red-900/70 border-2 border-red-600 rounded-xl flex flex-col items-center justify-center gap-2"
                >
                  <CalendarOff className="w-7 h-7 text-red-400" />
                  <span className="text-white font-bold text-sm">סגירה מלאה (ימים שלמים)</span>
                </Button>
                <Button
                  onClick={() => setOverrideType('partial_override')}
                  className="w-full h-20 bg-orange-900/50 hover:bg-orange-900/70 border-2 border-orange-600 rounded-xl flex flex-col items-center justify-center gap-2"
                >
                  <Clock className="w-7 h-7 text-orange-400" />
                  <span className="text-white font-bold text-sm">סגירה חלקית (שעות מסוימות)</span>
                </Button>
                <Button
                  onClick={() => setOverrideType('daily_hours')}
                  className="w-full h-20 bg-green-900/50 hover:bg-green-900/70 border-2 border-green-600 rounded-xl flex flex-col items-center justify-center gap-2"
                >
                  <Sun className="w-7 h-7 text-green-400" />
                  <span className="text-white font-bold text-sm">שעות יומיות (הגדרת שעות עבודה)</span>
                </Button>
              </div>
            ) : overrideType === 'full_closure' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-2 mb-4 p-3 bg-red-900/30 rounded-xl border border-red-600">
                  <CalendarOff className="w-5 h-5 text-red-400" />
                  <span className="text-red-300 font-medium">סגירה מלאה</span>
                </div>
                
                <DatePicker
                  selectedDate={startDate}
                  onDateChange={setStartDate}
                  label="מתאריך"
                  overrides={overrides}
                  disableMondays={true}
                  disableFullClosures={true}
                />
                
                <DatePicker
                  selectedDate={endDate}
                  onDateChange={setEndDate}
                  label="עד תאריך"
                  overrides={overrides}
                  disableMondays={true}
                  disableFullClosures={true}
                />
                
                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setOverrideType(null)} className="flex-1 rounded-xl" style={{ border: '1px solid rgba(222,198,167,0.25)', color: 'rgba(255,255,255,0.6)' }}>חזרה</Button>
                  <Button type="submit" className="flex-1 font-bold rounded-xl" style={{ background: 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)', color: '#1E1E1E' }}>{editingOverride ? 'עדכן' : 'הוסף'}</Button>
                </div>
              </form>
            ) : overrideType === 'partial_override' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-2 mb-4 p-3 bg-orange-900/30 rounded-xl border border-orange-600">
                  <Clock className="w-5 h-5 text-orange-400" />
                  <span className="text-orange-300 font-medium">סגירה חלקית</span>
                </div>
                
                <DatePicker
                  selectedDate={partialStartDate}
                  onDateChange={setPartialStartDate}
                  label="מתאריך"
                  overrides={overrides}
                  disableMondays={true}
                  disableFullClosures={true}
                />
                
                <DatePicker
                  selectedDate={partialEndDate}
                  onDateChange={setPartialEndDate}
                  label="עד תאריך (אופציונלי)"
                  overrides={overrides}
                  disableMondays={true}
                  disableFullClosures={true}
                />
                
                <TimePicker
                  value={blockStartTime}
                  onChange={setBlockStartTime}
                  label="תחילת תקופת הסגירה"
                />
                
                <TimePicker
                  value={blockEndTime}
                  onChange={setBlockEndTime}
                  label="סוף תקופת הסגירה"
                />
                
                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setOverrideType(null)} className="flex-1 rounded-xl" style={{ border: '1px solid rgba(222,198,167,0.25)', color: 'rgba(255,255,255,0.6)' }}>חזרה</Button>
                  <Button type="submit" className="flex-1 font-bold rounded-xl" style={{ background: 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)', color: '#1E1E1E' }}>{editingOverride ? 'עדכן' : 'הוסף'}</Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-2 mb-4 p-3 bg-green-900/30 rounded-xl border border-green-600">
                  <Sun className="w-5 h-5 text-green-400" />
                  <span className="text-green-300 font-medium">שעות יומיות</span>
                </div>
                
                <DatePicker
                  selectedDate={dailyStartDate}
                  onDateChange={setDailyStartDate}
                  label="מתאריך"
                  overrides={overrides}
                  disableMondays={true}
                  disableFullClosures={true}
                />
                
                <DatePicker
                  selectedDate={dailyEndDate}
                  onDateChange={setDailyEndDate}
                  label="עד תאריך (אופציונלי)"
                  overrides={overrides}
                  disableMondays={true}
                  disableFullClosures={true}
                />
                
                <TimePicker
                  value={dailyStartTime}
                  onChange={setDailyStartTime}
                  label="תחילת יום עבודה"
                />
                
                <TimePicker
                  value={dailyEndTime}
                  onChange={setDailyEndTime}
                  label="סוף יום עבודה"
                />
                
                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setOverrideType(null)} className="flex-1 rounded-xl" style={{ border: '1px solid rgba(222,198,167,0.25)', color: 'rgba(255,255,255,0.6)' }}>חזרה</Button>
                  <Button type="submit" className="flex-1 font-bold rounded-xl" style={{ background: 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)', color: '#1E1E1E' }}>{editingDailyHours ? 'עדכן' : 'הוסף'}</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
        
        {/* Default Working Hours Button */}
        <Dialog open={showDefaultHoursDialog} onOpenChange={setShowDefaultHoursDialog}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                if (defaultHours) {
                  setDefaultStartTime(defaultHours.startTime);
                  setDefaultEndTime(defaultHours.endTime);
                }
              }}
              variant="outline"
              className="font-bold rounded-xl w-full sm:w-auto"
              style={{ border: '1px solid rgba(222,198,167,0.35)', color: '#DEC6A7', background: 'transparent' }}
            >
              <Settings className="w-4 h-4 ml-2" />
              עריכת שעות ברירת מחדל
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" style={{ background: '#1E1E1E', border: '1px solid rgba(222,198,167,0.3)' }}>
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold" style={{ color: '#DEC6A7' }}>
                שעות עבודה ברירת מחדל
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <p className="text-center text-gray-400 mb-4">הגדרת שעות עבודה ברירת מחדל לכל הימים</p>
              
              <TimePicker
                value={defaultStartTime}
                onChange={setDefaultStartTime}
                label="תחילת יום עבודה"
              />
              
              <TimePicker
                value={defaultEndTime}
                onChange={setDefaultEndTime}
                label="סוף יום עבודה"
              />
              
              <Button
                onClick={handleDefaultHoursSubmit}
                className="w-full font-bold rounded-xl mt-4"
                style={{ background: 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)', color: '#1E1E1E' }}
              >
                {defaultHours ? 'עדכן' : 'שמור'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3" dir="rtl">
        {/* Daily Hours Overrides */}
        {activeDailyHours.map((wh) => (
          <div key={wh.id} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(222,198,167,0.12)' }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-green-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sun className="w-5 h-5 text-green-300" />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm">שעות יומיות</p>
                  <p className="text-green-400 text-xs mt-0.5">{wh.startTime} - {wh.endTime}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {formatDateInHebrew(wh.startDate)} → {formatDateInHebrew(wh.endDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-xl"
                  style={{ color: '#DEC6A7', background: 'rgba(222,198,167,0.1)' }}
                  onClick={() => {
                    setEditingDailyHours(wh);
                    setOverrideType('daily_hours');
                    setDailyStartDate(new Date(wh.startDate + 'T12:00:00'));
                    setDailyEndDate(new Date(wh.endDate + 'T12:00:00'));
                    setDailyStartTime(wh.startTime);
                    setDailyEndTime(wh.endTime);
                    setShowDialog(true);
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-400 hover:bg-red-500/10"
                  onClick={() => {
                    if (confirm('למחוק שעות אלו?')) {
                      deleteWorkingHoursMutation.mutate(wh.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        {/* Overrides */}
        {activeOverrides.map((override) => (
          <div key={override.id} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(222,198,167,0.12)' }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${override.type === 'full_closure' ? 'bg-red-900/50' : 'bg-orange-900/50'}`}>
                  {override.type === 'full_closure' ? (
                    <CalendarOff className="w-5 h-5 text-red-300" />
                  ) : (
                    <Clock className="w-5 h-5 text-orange-300" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm">
                    {override.type === 'full_closure' ? 'סגירה מלאה' : 'סגירה חלקית'}
                  </p>
                  {override.type === 'partial_override' && override.availableHours && (
                    <p className="text-orange-400 text-xs mt-0.5">תקופת סגירה: {override.availableHours}</p>
                  )}
                  <p className="text-gray-400 text-xs mt-1">
                    {formatDateInHebrew(override.startAt)} → {formatDateInHebrew(override.endAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-xl"
                  style={{ color: '#DEC6A7', background: 'rgba(222,198,167,0.1)' }}
                  onClick={() => handleOpenDialog(override)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-400 hover:bg-red-500/10"
                  onClick={() => {
                    if (confirm('למחוק סגירה זו?')) {
                      onDelete(override.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {activeOverrides.length === 0 && activeDailyHours.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>אין שינויים מתוזמנים</p>
        </div>
      )}
    </div>
  );
}