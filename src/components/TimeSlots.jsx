import React, { useMemo, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Clock, Lock, AlertCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import anime from 'animejs';
import { createRipple } from './animations/useAnimeAnimations';

const BUFFER_MINUTES = 0;

const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

const getCurrentIsraeliTime = () => {
  const now = new Date();
  const israelTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
  return {
    date: israelTime,
    hours: israelTime.getHours(),
    minutes: israelTime.getMinutes(),
    totalMinutes: israelTime.getHours() * 60 + israelTime.getMinutes()
  };
};

const getCurrentIsraeliDate = () => {
  const israelTime = getCurrentIsraeliTime().date;
  const year = israelTime.getFullYear();
  const month = String(israelTime.getMonth() + 1).padStart(2, '0');
  const day = String(israelTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const generateAvailableSlots = (serviceDuration, bookings, selectedDate) => {
  const startMinutes = timeToMinutes('12:30');
  const endMinutes = timeToMinutes('20:00');
  const availableSlots = [];
  const israeliToday = getCurrentIsraeliDate();
  const isToday = selectedDate === israeliToday;
  const currentTime = getCurrentIsraeliTime();

  const bookedRanges = bookings
    .filter((b) => b.status === 'confirmed')
    .map((b) => ({
      start: timeToMinutes(b.start_time),
      end: timeToMinutes(b.end_time)
    }))
    .sort((a, b) => a.start - b.start);

  const isSlotAvailable = (slotStart, slotEnd) => {
    for (const booked of bookedRanges) {
      if (slotStart < booked.end + BUFFER_MINUTES && slotEnd > booked.start - BUFFER_MINUTES) {
        return false;
      }
    }
    return true;
  };

  for (let minutes = startMinutes; minutes + serviceDuration <= endMinutes; minutes += 15) {
    const slotEnd = minutes + serviceDuration;
    if (isToday && minutes <= currentTime.totalMinutes) {
      continue;
    }
    if (isSlotAvailable(minutes, slotEnd)) {
      availableSlots.push({
        time: minutesToTime(minutes),
        start: minutes,
        end: slotEnd
      });
    }
  }

  return availableSlots;
};

export default function TimeSlots({ selectedDate, selectedTime, onTimeSelect, selectedService, pendingBookings = [] }) {
  const scrollContainerRef = useRef(null);
  const containerRef = useRef(null);

  const handleTimeClick = useCallback((e, slot) => {
    createRipple(e);
    anime({
      targets: e.currentTarget,
      scale: [1, 0.9, 1.05, 1],
      duration: 300,
      easing: 'easeInOutQuad'
    });
    onTimeSelect(slot.time, slot.start, slot.end);
  }, [onTimeSelect]);

  const { data: bookings = [], isLoading: isLoadingBookings, isFetched: isBookingsFetched } = useQuery({
    queryKey: ['bookings', selectedDate],
    queryFn: () => base44.entities.Booking.filter({ date: selectedDate }),
    enabled: !!selectedDate && !!selectedService,
    staleTime: 10000,
    gcTime: 30000,
    refetchOnWindowFocus: false
  });

  const { data: overrides = [], isLoading: isLoadingOverrides, isFetched: isOverridesFetched } = useQuery({
    queryKey: ['overrides'],
    queryFn: () => base44.entities.AvailabilityOverride.list('-created_date'),
    staleTime: 60000,
    gcTime: 120000,
    refetchOnWindowFocus: false
  });

  const { data: workingHours = [], isLoading: isLoadingWorkingHours, isFetched: isWorkingHoursFetched } = useQuery({
    queryKey: ['workingHours'],
    queryFn: () => base44.entities.WorkingHours.list('-created_date'),
    staleTime: 60000,
    gcTime: 120000,
    refetchOnWindowFocus: false
  });

  const isLoading = (isLoadingBookings && !isBookingsFetched) || (isLoadingOverrides && !isOverridesFetched) || (isLoadingWorkingHours && !isWorkingHoursFetched);

  const isMonday = useMemo(() => {
    if (!selectedDate) return false;
    const date = new Date(selectedDate + 'T12:00:00');
    const israelDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
    return israelDate.getDay() === 1;
  }, [selectedDate]);

  // Check if date is affected by availability overrides
  const dateAvailability = useMemo(() => {
    if (!selectedDate) return { isAvailable: true, type: 'normal', blockedHours: null };

    // Parse the selected date string (YYYY-MM-DD) to get year, month, day
    const [selYear, selMonth, selDay] = selectedDate.split('-').map(Number);

    // Check active overrides
    for (const override of overrides) {
      if (!override.isActive) continue;

      const startAt = new Date(override.startAt);
      const endAt = new Date(override.endAt);

      // Extract year, month, day from override dates (using local time)
      const startYear = startAt.getFullYear();
      const startMonth = startAt.getMonth() + 1;
      const startDay = startAt.getDate();
      
      const endYear = endAt.getFullYear();
      const endMonth = endAt.getMonth() + 1;
      const endDay = endAt.getDate();

      // Create comparable date strings (YYYYMMDD format)
      const selectedDateNum = selYear * 10000 + selMonth * 100 + selDay;
      const startDateNum = startYear * 10000 + startMonth * 100 + startDay;
      const endDateNum = endYear * 10000 + endMonth * 100 + endDay;

      // Check if selected date falls within override period
      if (selectedDateNum >= startDateNum && selectedDateNum <= endDateNum) {
        if (override.type === 'full_closure') {
          return { isAvailable: false, type: 'closed', blockedHours: null };
        } else if (override.type === 'partial_override' && override.availableHours) {
          // For partial override, availableHours contains the BLOCKED time range
          return { isAvailable: true, type: 'partial', blockedHours: override.availableHours };
        }
      }
    }

    return { isAvailable: true, type: 'normal', blockedHours: null };
  }, [selectedDate, overrides]);

  // Get working hours for the selected date
  const workingHoursForDate = useMemo(() => {
    if (!selectedDate) return { startTime: '12:30', endTime: '19:00' };
    
    const [selYear, selMonth, selDay] = selectedDate.split('-').map(Number);
    const selectedDateNum = selYear * 10000 + selMonth * 100 + selDay;
    
    // First check for daily override for this specific date
    for (const wh of workingHours) {
      if (wh.type !== 'daily_override' || !wh.isActive) continue;
      
      const [startYear, startMonth, startDay] = wh.startDate.split('-').map(Number);
      const [endYear, endMonth, endDay] = wh.endDate.split('-').map(Number);
      
      const startDateNum = startYear * 10000 + startMonth * 100 + startDay;
      const endDateNum = endYear * 10000 + endMonth * 100 + endDay;
      
      if (selectedDateNum >= startDateNum && selectedDateNum <= endDateNum) {
        return { startTime: wh.startTime, endTime: wh.endTime };
      }
    }
    
    // Otherwise use default working hours
    const defaultHours = workingHours.find(wh => wh.type === 'default' && wh.isActive);
    if (defaultHours) {
      return { startTime: defaultHours.startTime, endTime: defaultHours.endTime };
    }
    
    // Fallback to hardcoded defaults
    return { startTime: '12:30', endTime: '19:00' };
  }, [selectedDate, workingHours]);

  const availableSlots = useMemo(() => {
    if (!selectedService || !selectedDate || isMonday || !dateAvailability.isAvailable) return [];
    
    const serviceDuration = selectedService.duration_minutes;
    const startMinutes = timeToMinutes(workingHoursForDate.startTime);
    const endMinutes = timeToMinutes(workingHoursForDate.endTime);

    // Get blocked time range if partial closure
    let blockedStart = null;
    let blockedEnd = null;
    if (dateAvailability.type === 'partial' && dateAvailability.blockedHours) {
      const [blockStart, blockEnd] = dateAvailability.blockedHours.split('-');
      if (blockStart && blockEnd) {
        blockedStart = timeToMinutes(blockStart.trim());
        blockedEnd = timeToMinutes(blockEnd.trim());
      }
    }

    const israeliToday = getCurrentIsraeliDate();
    const isToday = selectedDate === israeliToday;
    const currentTime = getCurrentIsraeliTime();
    const availableSlots = [];

    // Include pending bookings from multi-person flow for the same date
    const pendingForDate = pendingBookings.filter(b => b.date === selectedDate);
    
    const bookedRanges = [
      ...bookings
        .filter((b) => b.status === 'confirmed')
        .map((b) => ({
          start: timeToMinutes(b.start_time),
          end: timeToMinutes(b.end_time)
        })),
      ...pendingForDate.map((b) => ({
        start: timeToMinutes(b.start_time),
        end: timeToMinutes(b.end_time)
      }))
    ].sort((a, b) => a.start - b.start);

    const isSlotAvailable = (slotStart, slotEnd) => {
      // Check if slot overlaps with blocked hours
      if (blockedStart !== null && blockedEnd !== null) {
        if (slotStart < blockedEnd && slotEnd > blockedStart) {
          return false;
        }
      }
      
      // Check if slot overlaps with booked appointments
      for (const booked of bookedRanges) {
        if (slotStart < booked.end + BUFFER_MINUTES && slotEnd > booked.start - BUFFER_MINUTES) {
          return false;
        }
      }
      return true;
    };

    for (let minutes = startMinutes; minutes + serviceDuration <= endMinutes; minutes += 5) {
      const slotEnd = minutes + serviceDuration;
      if (isToday && minutes <= currentTime.totalMinutes) {
        continue;
      }
      if (isSlotAvailable(minutes, slotEnd)) {
        availableSlots.push({
          time: minutesToTime(minutes),
          start: minutes,
          end: slotEnd
        });
      }
    }

    return availableSlots;
  }, [selectedService, bookings, selectedDate, isMonday, dateAvailability, pendingBookings, workingHoursForDate]);

  useEffect(() => {
    if (containerRef.current && availableSlots.length > 0) {
      anime({
        targets: containerRef.current,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 400,
        easing: 'easeOutQuart'
      });
      
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        anime({
          targets: '.time-slot-btn',
          opacity: [0, 1],
          translateX: [20, 0],
          duration: 300,
          delay: anime.stagger(30, { start: 100 }),
          easing: 'easeOutQuart'
        });
      }, 50);
    }
  }, [availableSlots.length, selectedDate]);

  if (!selectedService) {
    return (
      <div className="rounded-3xl p-5 shadow-xl border border-[#DEC6A7]/60" style={{ background: 'var(--color-primary)' }}>
        <div className="flex items-center justify-center space-x-2 space-x-reverse mb-3">
          <Clock className="w-6 h-6" style={{ color: 'rgba(215,199,161,0.5)' }} />
          <h2 className="text-xl font-bold" style={{ color: 'rgba(215,199,161,0.6)' }}>
            בחר שירות תחילה
          </h2>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-3xl p-4 sm:p-5 shadow-xl border border-[#DEC6A7]/60" style={{ background: 'var(--color-primary)' }}>
        <div className="flex items-center justify-center space-x-2 space-x-reverse mb-3">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center animate-pulse" style={{ background: '#DEC6A7' }}>
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0A1F1B]" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold" style={{ color: '#FFFFFF' }}>
            טוען תורים...
          </h2>
        </div>
        <div className="flex flex-row-reverse gap-2 sm:gap-3 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 w-20 sm:w-24 h-16 sm:h-20 rounded-2xl animate-pulse" style={{ background: 'var(--color-secondary)' }} />
          ))}
        </div>
      </div>
    );
  }

  if (isMonday) {
    return (
      <div className="rounded-3xl p-6 shadow-xl border border-[#DEC6A7]/60" style={{ background: 'var(--color-primary)' }}>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-red-900 border-2 border-red-600 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-center" style={{ color: '#FFFFFF' }}>
            יום שני סגור
          </h2>
          <p className="text-center text-lg" style={{ color: 'rgba(244,241,234,0.6)' }}>
            המספרה סגורה בימי שני. אנא בחר יום אחר.
          </p>
        </div>
      </div>
    );
  }

  // Check if date is closed due to override
  if (!dateAvailability.isAvailable) {
    return (
      <div className="rounded-3xl p-6 shadow-xl border border-[#DEC6A7]/60" style={{ background: 'var(--color-primary)' }}>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-red-900 border-2 border-red-600 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-center" style={{ color: '#FFFFFF' }}>
            סגור
          </h2>
          <p className="text-center text-lg" style={{ color: 'rgba(244,241,234,0.6)' }}>
            המספרה סגורה בתאריך זה
          </p>
        </div>
      </div>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <div className="rounded-3xl p-6 shadow-xl border border-[#DEC6A7]/60" style={{ background: 'var(--color-primary)' }}>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-orange-900 border-2 border-orange-600 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-center" style={{ color: '#FFFFFF' }}>
            אין תורים פנויים
          </h2>
          <p className="text-center text-lg" style={{ color: 'rgba(244,241,234,0.6)' }}>
            כל התורים תפוסים ליום זה. אנא בחר יום אחר.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="rounded-3xl p-4 sm:p-5 shadow-xl border border-[#DEC6A7]/60" style={{ background: 'var(--color-primary)' }}>
      <div className="flex items-center justify-center space-x-2 space-x-reverse mb-3 sm:mb-4">
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center" style={{ background: '#DEC6A7' }}>
          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0A1F1B]" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold" style={{ color: '#DEC6A7' }}>
          בחר שעה
        </h2>
      </div>

      {dateAvailability.type === 'partial' && dateAvailability.blockedHours && (
        <Alert className="mb-3 sm:mb-4 bg-orange-900/20 border-orange-600">
          <AlertCircle className="w-4 h-4 text-orange-400" />
          <AlertDescription className="text-right text-orange-300 text-sm sm:text-base">
            שעות חסומות: {dateAvailability.blockedHours}
          </AlertDescription>
        </Alert>
      )}

      <div
        ref={scrollContainerRef}
        className="flex flex-row-reverse gap-3 sm:gap-4 overflow-x-auto pb-3 scroll-smooth scrollbar-hide"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {availableSlots.map((slot) => {
          const isSelected = selectedTime === slot.time;
          return (
            <button
              key={slot.time}
              onClick={(e) => handleTimeClick(e, slot)}
              className="time-slot-btn flex-shrink-0 w-[72px] sm:w-[82px] py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 relative overflow-hidden border"
              style={{
                scrollSnapAlign: 'center',
                background: isSelected ? '#DEC6A7' : 'var(--color-secondary)',
                color: isSelected ? '#0A1F1B' : '#FFFFFF',
                borderColor: isSelected ? '#DEC6A7' : 'rgba(215,199,161,0.25)',
                transform: isSelected ? 'scale(1.05)' : undefined,
                boxShadow: isSelected ? '0 8px 24px rgba(215,199,161,0.2)' : '0 2px 8px rgba(0,0,0,0.3)'
              }}
            >
              <div className="flex flex-col items-center justify-center gap-0.5">
                <Clock 
                  className="w-4 h-4"
                  style={{ color: isSelected ? 'rgba(10,31,27,0.8)' : 'rgba(215,199,161,0.7)' }}
                  strokeWidth={2}
                />
                <span className="font-semibold">
                  {slot.time}
                </span>
              </div>
              {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}