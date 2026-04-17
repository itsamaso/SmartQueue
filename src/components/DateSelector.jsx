import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import anime from 'animejs';
import { createRipple } from './animations/useAnimeAnimations';

// Get current date in Israel timezone (YYYY-MM-DD format)
const getCurrentIsraeliDate = () => {
  const now = new Date();
  const israelTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
  const year = israelTime.getFullYear();
  const month = String(israelTime.getMonth() + 1).padStart(2, '0');
  const day = String(israelTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Hebrew day names
const hebrewDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
// RTL display: Sunday on right (column 0), Saturday on left (column 6)
const hebrewDaysShortRTL = ['יום א', 'יום ב', 'יום ג', 'יום ד', 'יום ה', 'יום ו', 'שבת'];
const hebrewMonths = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

export default function DateSelector({ selectedDate, onDateChange, overrides = [] }) {
  const containerRef = useRef(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = new Date(selectedDate + 'T12:00:00'); 
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });

  useEffect(() => {
    if (containerRef.current) {
      anime({
        targets: containerRef.current,
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 600,
        easing: 'easeOutQuart'
      });
    }
  }, []);

  useEffect(() => {
    anime({
      targets: '.calendar-day',
      opacity: [0, 1],
      scale: [0.8, 1],
      duration: 400,
      delay: anime.stagger(20),
      easing: 'easeOutQuart'
    });
  }, [currentMonth]);

  const minDate = useMemo(() => getCurrentIsraeliDate(), []);
  
  // Maximum date is 7 days from today (next week limit)
  const maxDate = useMemo(() => {
    const now = new Date();
    const israelTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
    israelTime.setDate(israelTime.getDate() + 7);
    const year = israelTime.getFullYear();
    const month = String(israelTime.getMonth() + 1).padStart(2, '0');
    const day = String(israelTime.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const todayButtonRef = useRef(null);

  const handleTodayClick = useCallback((e) => {
    createRipple(e);
    anime({
      targets: todayButtonRef.current,
      scale: [1, 0.97, 1],
      duration: 300,
      easing: 'easeInOutQuad'
    });
    const today = getCurrentIsraeliDate();
    setTimeout(() => onDateChange(today), 150);
  }, [onDateChange]);

  const handleDateClick = useCallback((e, date) => {
    if (date && !isDateDisabled(date)) {
      anime({
        targets: e.currentTarget,
        scale: [1, 0.9, 1.1, 1],
        duration: 250,
        easing: 'easeInOutQuad'
      });
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      onDateChange(dateStr);
    }
  }, [onDateChange]);

  const formatDateInHebrew = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day); 
    const dayName = hebrewDays[date.getDay()];
    const dayNum = date.getDate();
    const monthName = hebrewMonths[date.getMonth()];
    const yearNum = date.getFullYear();
    return `${dayName}, ${dayNum} ${monthName} ${yearNum}`;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // JS getDay(): Sunday=0, Monday=1, ..., Saturday=6
    // Grid is RTL so Sunday (index 0) appears on the right
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isMonday = useCallback((date) => {
    if (!date) return false;
    return date.getDay() === 1;
  }, []);

  const isFullClosureDay = useCallback((date) => {
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
  }, [overrides]);

  const isDateDisabled = useCallback((date) => {
    if (!date) return true;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    // Disable past dates
    if (dateStr < minDate) return true;
    
    // Disable dates beyond next week (7 days)
    if (dateStr > maxDate) return true;
    
    // Disable Mondays
    if (isMonday(date)) return true;
    
    // Disable full closure days
    if (isFullClosureDay(date)) return true;
    
    return false;
  }, [minDate, maxDate, isMonday, isFullClosureDay]);

  const isDateSelected = useCallback((date) => {
    if (!date) return false;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return dateStr === selectedDate;
  }, [selectedDate]);

  const handlePrevMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const days = useMemo(() => getDaysInMonth(currentMonth), [currentMonth]);
  const currentMonthName = hebrewMonths[currentMonth.getMonth()];
  const currentYear = currentMonth.getFullYear();

  return (
    <div ref={containerRef} className="rounded-3xl p-4 sm:p-5 shadow-xl border border-[#DEC6A7]/60" style={{ background: 'var(--color-primary)' }}>
      <div className="flex items-center justify-center space-x-2 space-x-reverse mb-3 sm:mb-4">
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center" style={{ background: '#DEC6A7' }}>
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0A1F1B]" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold" style={{ color: '#DEC6A7' }}>
          בחר תאריך
        </h2>
      </div>
      
      <div className="rounded-2xl p-3 sm:p-4 mb-3 border-2" style={{ background: 'var(--color-secondary)', borderColor: 'rgba(215,199,161,0.4)' }}>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevMonth}
            className="rounded-full border h-8 w-8 sm:h-9 sm:w-9 hover:opacity-70"
            style={{ borderColor: 'rgba(215,199,161,0.4)' }}
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#DEC6A7' }} />
          </Button>
          
          <h3 className="font-bold text-base sm:text-lg" style={{ color: '#FFFFFF' }}>
            {currentMonthName} {currentYear}
          </h3>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            className="rounded-full border h-8 w-8 sm:h-9 sm:w-9 hover:opacity-70"
            style={{ borderColor: 'rgba(215,199,161,0.4)' }}
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#DEC6A7' }} />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2" dir="rtl">
          {hebrewDaysShortRTL.map((day, index) => (
            <div key={index} className="text-center text-xs sm:text-sm font-bold py-1 sm:py-2" style={{ color: 'rgba(215,199,161,0.6)' }}>
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2" dir="rtl">
          {days.map((date, index) => {
            const isDisabled = isDateDisabled(date);
            const isSelected = isDateSelected(date);
            const isMondayDay = date && isMonday(date);
            const isClosureDay = date && isFullClosureDay(date);
            
            return (
              <button
                key={index}
                onClick={(e) => handleDateClick(e, date)}
                disabled={isDisabled}
                style={isSelected ? { background: '#DEC6A7', color: '#1E1E1E' } : (!isDisabled && !isMondayDay && !isClosureDay) ? { background: 'var(--color-secondary)', borderColor: 'rgba(215,199,161,0.3)', color: '#FFFFFF' } : {}}
                className={`
                  calendar-day aspect-square rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all
                  ${!date ? 'invisible' : ''}
                  ${isDisabled ? 'text-gray-600 cursor-not-allowed' : 'hover:scale-110'}
                  ${isSelected 
                    ? 'shadow-lg scale-105 ring-2 sm:ring-4 ring-[#DEC6A7]' 
                    : isMondayDay || isClosureDay
                      ? 'bg-red-950/50 border border-red-900/50 text-red-400/50'
                      : isDisabled 
                        ? 'border opacity-30' 
                        : 'border sm:border-2 hover:border-[#DEC6A7]'
                  }
                `}
              >
                {date ? date.getDate() : ''}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl p-2.5 sm:p-3 mb-3 border-2" style={{ background: 'var(--color-secondary)', borderColor: 'rgba(215,199,161,0.4)' }}>
        <p className="text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1 text-right" style={{ color: 'rgba(215,199,161,0.6)' }}>התאריך הנבחר</p>
        <p className="text-sm sm:text-base font-bold text-right" style={{ color: '#DEC6A7' }}>
          {formatDateInHebrew(selectedDate)}
        </p>
      </div>
      
      <Button 
        ref={todayButtonRef}
        onClick={handleTodayClick}
        className="w-full font-bold rounded-2xl h-10 sm:h-12 text-sm sm:text-base shadow-lg hover:shadow-xl hover:opacity-90 transition-all duration-300 relative overflow-hidden"
        style={{ background: '#DEC6A7', color: '#1E1E1E' }}
      >
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[btnShimmer_2.5s_ease-in-out_infinite]"></span>
        <span className="relative z-10">היום</span>
      </Button>
      
      <style>{`
        @keyframes btnShimmer {
          0% { transform: translateX(-100%); }
          50%, 100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}