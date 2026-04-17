import React, { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl, toUserFacingErrorMessage } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import Navbar from "../components/Navbar";
import StoriesSection from "../components/StoriesSection";
// WelcomeSection replaced inline - no import needed
import DateSelector from "../components/DateSelector";
import TimeSlots from "../components/TimeSlots";
import BookingForm from "../components/BookingForm";
import ServiceSelector from "../components/ServiceSelector";
import PersonCountSelector from "../components/PersonCountSelector";
import BookingCTA from "../components/BookingCTA";

import AuthGuard from "../components/AuthGuard";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import anime from 'animejs';
import { createRipple } from '../components/animations/useAnimeAnimations';

// Get current date in Israel timezone
const getCurrentIsraeliDate = () => {
  const now = new Date();
  const israelTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
  const year = israelTime.getFullYear();
  const month = String(israelTime.getMonth() + 1).padStart(2, '0');
  const day = String(israelTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function HomeContent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pageRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(getCurrentIsraeliDate());
  const [selectedTime, setSelectedTime] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [personCount, setPersonCount] = useState(1);
  const [currentPersonIndex, setCurrentPersonIndex] = useState(0);
  const [allBookingsData, setAllBookingsData] = useState([]);

  const [customer, setCustomer] = useState(null);
  const [sessionName, setSessionName] = useState(null);

  useEffect(() => {
    try {
      const customerData = localStorage.getItem('customer_session');
      const adminData = localStorage.getItem('admin_session');
      if (customerData) {
        const parsed = JSON.parse(customerData);
        setCustomer(parsed);
        setSessionName(parsed?.full_name || null);
      } else if (adminData) {
        const parsed = JSON.parse(adminData);
        setSessionName(parsed?.full_name || null);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (pageRef.current) {
      anime({
        targets: pageRef.current,
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuart'
      });
    }

    // Logo entrance + continuous glow animation
    anime({
      targets: '#welcome-logo',
      opacity: [0, 1],
      scale: [0.5, 1],
      duration: 400,
      delay: 100,
      easing: 'easeOutBack'
    });
    anime({
      targets: '#welcome-logo',
      boxShadow: [
        '0 0 8px rgba(222,198,167,0.3)',
        '0 0 24px rgba(222,198,167,0.7)'
      ],
      duration: 1500,
      delay: 500,
      loop: true,
      direction: 'alternate',
      easing: 'easeInOutSine'
    });
  }, []);

  useEffect(() => {
    const handleReset = () => setCurrentStep(1);
    window.addEventListener('resetBookingStep', handleReset);
    return () => window.removeEventListener('resetBookingStep', handleReset);
  }, []);

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list('price'),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  });



  const { data: overrides = [] } = useQuery({
    queryKey: ['overrides'],
    queryFn: () => base44.entities.AvailabilityOverride.list('-created_date'),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  });

  const selectedService = useMemo(() =>
  services.find((s) => s.id === selectedServiceId),
  [services, selectedServiceId]
  );



  const createBookingMutation = useMutation({
    mutationFn: async (bookingDataArray) => {
      const timeToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
      };

      const bookingsToCreate = Array.isArray(bookingDataArray) ? bookingDataArray : [bookingDataArray];
      const createdBookings = [];

      for (const bookingData of bookingsToCreate) {
        const [bookYear, bookMonth, bookDay] = bookingData.date.split('-').map(Number);
        const bookingDateNum = bookYear * 10000 + bookMonth * 100 + bookDay;

        const bookingStartMinutes = timeToMinutes(bookingData.start_time);
        const bookingEndMinutes = timeToMinutes(bookingData.end_time);

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

          if (bookingDateNum >= startDateNum && bookingDateNum <= endDateNum) {
            if (override.type === 'full_closure') {
              throw new Error('המספרה סגורה בתאריך זה. אנא בחר מועד אחר.');
            } else if (override.type === 'partial_override' && override.availableHours) {
              const [blockedStart, blockedEnd] = override.availableHours.split('-');
              if (blockedStart && blockedEnd) {
                const blockedStartMinutes = timeToMinutes(blockedStart.trim());
                const blockedEndMinutes = timeToMinutes(blockedEnd.trim());

                if (bookingStartMinutes < blockedEndMinutes && bookingEndMinutes > blockedStartMinutes) {
                  throw new Error(`התור שנבחר חופף לשעות הסגירה (${blockedStart.trim()} - ${blockedEnd.trim()}). אנא בחר מועד אחר.`);
                }
              }
            }
          }
        }

        const existingBookings = await base44.entities.Booking.filter({
          date: bookingData.date,
          status: 'confirmed'
        });

        // Also check against already created bookings in this batch
        const allBookedRanges = [
        ...existingBookings.map((b) => ({ start: timeToMinutes(b.start_time), end: timeToMinutes(b.end_time) })),
        ...createdBookings.map((b) => ({ start: timeToMinutes(b.start_time), end: timeToMinutes(b.end_time) }))];


        const newStart = bookingStartMinutes;
        const newEnd = bookingEndMinutes;

        for (const booked of allBookedRanges) {
          if (newStart < booked.end && newEnd > booked.start) {
            throw new Error('התור הזה כבר נתפס. אנא בחר מועד אחר.');
          }
        }

        const newBooking = await base44.entities.Booking.create(bookingData);
        createdBookings.push(newBooking);
      }

      return createdBookings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      navigate(createPageUrl("Success"));
    },
    onError: (error) => {
      setError(toUserFacingErrorMessage(error, 'ההזמנה נכשלה. אנא נסה שוב.'));
    }
  });

  const handleTimeSelect = (time, start, end) => {
    if (selectedTime === time) {
      setSelectedTime(null);
      setStartTime(null);
      setEndTime(null);
    } else {
      setSelectedTime(time);
      const minutesToTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
      };
      setStartTime(time);
      setEndTime(minutesToTime(end));
    }
    setError('');
  };

  const handleBookingSubmit = (formData) => {
    if (!selectedService) {
      setError('אנא בחר שירות');
      return;
    }

    const currentBooking = {
      name: formData.name,
      phone: formData.phone,
      service_id: selectedService.id,
      service_name: selectedService.name,
      service_duration: selectedService.duration_minutes,
      price: selectedService.price,
      date: selectedDate,
      start_time: startTime,
      end_time: endTime,
      status: 'confirmed',
      customer_id: customer?.id || null,
      booked_by_phone: customer?.phone || formData.phone,
      group_size: personCount,
      person_index: currentPersonIndex + 1
    };

    if (personCount === 1) {
      // Single person booking
      createBookingMutation.mutate([currentBooking]);
    } else {
      // Multi-person booking
      const updatedBookings = [...allBookingsData, currentBooking];

      if (currentPersonIndex < personCount - 1) {
        // More people to book
        setAllBookingsData(updatedBookings);
        setCurrentPersonIndex(currentPersonIndex + 1);
        setCurrentStep(3); // Go back to service selection for next person
        setSelectedServiceId('');
        setSelectedTime(null);
        setStartTime(null);
        setEndTime(null);
        setSelectedDate(selectedDate); // Keep the same date
      } else {
        // All people booked, submit all
        createBookingMutation.mutate(updatedBookings);
      }
    }
  };

  const handleStartBooking = () => {
    setCurrentStep(2);
    setError('');
  };

  const handleServiceChange = (serviceId) => {
    setSelectedServiceId(serviceId);
    setSelectedTime(null);
    setStartTime(null);
    setEndTime(null);
    setError('');
    if (serviceId) {
      setCurrentStep(4);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setStartTime(null);
    setEndTime(null);
    setError('');
    setCurrentStep(5);
  };

  const handleTimeSelectWrapper = (time, start, end) => {
    handleTimeSelect(time, start, end);
    if (time !== selectedTime) {
      setCurrentStep(6);
    }
  };

  const handleBackStep = (e) => {
    if (e) createRipple(e);
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      // Going back from service selection to person count
      if (currentPersonIndex > 0) {
        setCurrentPersonIndex(currentPersonIndex - 1);
        allBookingsData.pop();
        setAllBookingsData([...allBookingsData]);
      }
      setCurrentStep(2);
    } else if (currentStep === 4) {
      setSelectedServiceId('');
      setCurrentStep(3);
    } else if (currentStep === 5) {
      setSelectedTime(null);
      setStartTime(null);
      setEndTime(null);
      setCurrentStep(4);
    } else if (currentStep === 6) {
      setSelectedTime(null);
      setStartTime(null);
      setEndTime(null);
      setCurrentStep(5);
    }
  };



  return (
    <div ref={pageRef} className="min-h-screen bg-transparent pb-24">
      <Navbar />
      

      
      <div className="max-w-lg mx-auto px-2 sm:px-3 py-3 sm:py-4 space-y-3 sm:space-y-4">
        {/* Inline Welcome Section */}
        <div className="pt-2 pb-1 flex items-center gap-3">
          <img
            id="welcome-logo"
            src="https://media.base44.com/images/public/69a35c4a7320c1762a3e2af0/9f36c45d2_cropped_circle_image1.png"
            alt="Logo"
            style={{ width: 54, height: 54, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, opacity: 0 }}
          />
          <h1 className="text-2xl font-black leading-tight text-right" style={{ color: '#FFFFFF', fontFamily: "'Heebo', sans-serif" }}>
            ברוך הבא{sessionName ?
            <>
                {', '}
                <span style={{
                color: '#DEC6A7',
                textShadow: '0 0 20px rgba(222,198,167,0.4)'
              }}>
                  {sessionName.split(' ')[0]}
                </span>
              </> :
            ''}
          </h1>
        </div>
        
        <StoriesSection
          onStoryClick={setSelectedStory}
          selectedStory={selectedStory} />
        

        {currentStep > 1 &&
        <div className="flex items-center gap-1.5 py-1" dir="ltr">
            {[
          { step: 2, label: 'כמות' },
          { step: 3, label: 'שירות' },
          { step: 4, label: 'תאריך' },
          { step: 5, label: 'שעה' },
          { step: 6, label: 'אישור' }].
          map(({ step, label }, i, arr) => {
            const isCompleted = currentStep > step;
            const isActive = currentStep === step;
            const isClickable = isCompleted;
            return (
              <React.Fragment key={step}>
                  <div
                  className={`flex flex-col items-center gap-0.5 ${isClickable ? 'cursor-pointer' : ''}`}
                  onClick={() => isClickable && setCurrentStep(step)}>
                  
                    <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all duration-300"
                    style={{
                      background: isCompleted ? '#DEC6A7' : isActive ? '#DEC6A7' : 'rgba(222,198,167,0.15)',
                      color: isCompleted || isActive ? '#1E1E1E' : 'rgba(222,198,167,0.4)',
                      transform: isActive ? 'scale(1.15)' : 'scale(1)',
                      boxShadow: isActive ? '0 0 8px rgba(222,198,167,0.5)' : 'none'
                    }}>
                    
                      {isCompleted ? '✓' : i + 1}
                    </div>
                    <span className="text-[8px] text-sm font-medium"

                  style={{ color: isActive ? '#DEC6A7' : isCompleted ? 'rgba(222,198,167,0.6)' : 'rgba(255,255,255,0.25)' }}>
                    
                      {label}
                    </span>
                  </div>
                  {i < arr.length - 1 &&
                <div
                  className="h-px flex-1 mb-3 transition-all duration-300"
                  style={{ background: currentStep > step ? '#DEC6A7' : 'rgba(222,198,167,0.15)', minWidth: '8px' }} />

                }
                </React.Fragment>);

          })}
          </div>
        }

        {error &&
        <Alert variant="destructive" className="rounded-2xl">
            <AlertDescription className="text-right">{error}</AlertDescription>
          </Alert>
        }

        <div className="transition-all duration-500 ease-in-out">
          {currentStep === 1 &&
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
              <BookingCTA onBook={handleStartBooking} />
            </div>
          }

          {currentStep === 2 &&
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
              <PersonCountSelector
              personCount={personCount}
              onPersonCountChange={setPersonCount}
              onStartBooking={() => setCurrentStep(3)} />
            
            </div>
          }

          {currentStep === 3 &&
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {personCount > 1 &&
            <div className="mb-3 p-3 bg-[#D7C7A1]/10 rounded-xl border border-[#D7C7A1]/30 text-center">
                  <p className="text-[#D7C7A1] font-bold">
                    הזמנה עבור אדם {currentPersonIndex + 1} מתוך {personCount}
                  </p>
                </div>
            }
              <ServiceSelector
              selectedServiceId={selectedServiceId}
              onServiceSelect={handleServiceChange} />
            
            </div>
          }

          {currentStep === 4 && selectedServiceId &&
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {personCount > 1 &&
            <div className="mb-3 p-3 bg-[#D7C7A1]/10 rounded-xl border border-[#D7C7A1]/30 text-center">
                  <p className="text-[#D7C7A1] font-bold">
                    הזמנה עבור אדם {currentPersonIndex + 1} מתוך {personCount}
                  </p>
                </div>
            }
              <DateSelector
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              overrides={overrides} />
            
            </div>
          }

          {currentStep === 5 && selectedServiceId && selectedDate &&
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {personCount > 1 &&
            <div className="mb-3 p-3 bg-[#D7C7A1]/10 rounded-xl border border-[#D7C7A1]/30 text-center">
                  <p className="text-[#D7C7A1] font-bold">
                    הזמנה עבור אדם {currentPersonIndex + 1} מתוך {personCount}
                  </p>
                </div>
            }
              <TimeSlots
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onTimeSelect={handleTimeSelectWrapper}
              selectedService={selectedService}
              pendingBookings={allBookingsData} />
            
            </div>
          }

          {currentStep === 6 && selectedServiceId && selectedDate && selectedTime &&
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {personCount > 1 &&
            <div className="mb-3 p-3 bg-[#D7C7A1]/10 rounded-xl border border-[#D7C7A1]/30 text-center">
                  <p className="text-[#D7C7A1] font-bold">
                    הזמנה עבור אדם {currentPersonIndex + 1} מתוך {personCount}
                  </p>
                </div>
            }
              <BookingForm
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              selectedService={selectedService}
              startTime={startTime}
              endTime={endTime}
              onSubmit={handleBookingSubmit}
              isSubmitting={createBookingMutation.isPending}
              personCount={personCount}
              currentPersonIndex={currentPersonIndex} />
            
            </div>
          }
        </div>
      </div>


    </div>);

}

export default function Home() {
  return (
    <AuthGuard>
      <HomeContent />
    </AuthGuard>);

}