import React, { useEffect, useRef, useMemo, useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Sparkles } from "lucide-react";
import anime from 'animejs';
import { createRipple } from './animations/useAnimeAnimations';
import GenderToggle from "@/components/GenderToggle";

// Service images mapping
const SERVICE_IMAGES = {
  'حلاقة مع لحية': 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&h=300&fit=crop&q=80',
  'حلاقة بدون لحية': 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=300&fit=crop&q=80',
  'تخطيط مع لحية': 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=300&fit=crop&q=80',
  'تنظيف بشرة': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690a3843a53fcfa9ffef20a2/22b2ca756_ChatGPTImageJan31202610_48_19PM.png',
  'تنظيف بشرة VIP': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690a3843a53fcfa9ffef20a2/df3e869ab_ChatGPTImageJan31202610_50_44PM.png'
};

const SERVICE_ORDER = {
  'تنظيف بشرة VIP': 0,
  'حلاقة مع لحية': 1,
  'حلاقة بدون لحية': 2,
  'تخطيط مع لحية': 3
};

function getSessionGender() {
  try {
    const data = localStorage.getItem('customer_session');
    if (data) return JSON.parse(data)?.gender || 'male';
  } catch {}
  return 'male';
}

export default function ServiceSelector({ selectedServiceId, onServiceSelect }) {
  const containerRef = useRef(null);
  const [genderFilter, setGenderFilter] = useState(getSessionGender);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list('price'),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const filteredServices = useMemo(() =>
    services.filter(s => s.gender === genderFilter),
    [services, genderFilter]
  );

  const sortedServices = useMemo(() =>
    [...filteredServices].sort((a, b) => (SERVICE_ORDER[a.name] || 99) - (SERVICE_ORDER[b.name] || 99)),
    [filteredServices]
  );

  useEffect(() => {
    if (!isLoading && services.length > 0) {
      anime({
        targets: '.service-card',
        opacity: [0, 1],
        translateY: [40, 0],
        scale: [0.9, 1],
        duration: 600,
        delay: anime.stagger(100),
        easing: 'easeOutBack'
      });
    }
  }, [isLoading, services.length, genderFilter]);

  const handleServiceClick = useCallback((e, serviceId) => {
    createRipple(e);
    anime({
      targets: e.currentTarget,
      scale: [1, 0.95, 1.02, 1],
      duration: 300,
      easing: 'easeInOutQuad'
    });
    onServiceSelect(serviceId);
  }, [onServiceSelect]);

  if (isLoading) {
    return (
      <div className="rounded-3xl p-5 shadow-xl animate-pulse border border-[#DEC6A7]/60" style={{ background: 'var(--color-primary)' }}>
        <div className="flex items-center justify-center space-x-2 space-x-reverse mb-4">
          <div className="w-7 h-7 rounded-full" style={{ background: '#DEC6A7' }}></div>
          <div className="h-7 w-32 rounded" style={{ background: 'var(--color-secondary)' }}></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) =>
            <div key={i} className="h-20 rounded-2xl" style={{ background: 'var(--color-secondary)' }}></div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl p-5 shadow-xl border border-[#DEC6A7]/60" style={{ background: 'var(--color-primary)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: '#DEC6A7' }}>
            <Sparkles className="w-4 h-4 text-[#1E1E1E]" />
          </div>
          <h2 className="text-2xl font-bold" style={{ color: '#DEC6A7' }}>בחר שירות</h2>
        </div>
        <GenderToggle value={genderFilter} onChange={setGenderFilter} className="text-xs !rounded-xl" />
      </div>

      <div className="space-y-3 max-h-[55vh] overflow-y-auto scrollbar-hide" ref={containerRef}>
        {sortedServices.map((service) => {
          const isSelected = selectedServiceId === service.id;
          const serviceImage = service.background_image_url || SERVICE_IMAGES[service.name] || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop&q=80';
          const isVip = service.name === 'تنظيف بشرة VIP';

          return (
            <button
              key={service.id}
              onClick={(e) => handleServiceClick(e, service.id)}
              className={`service-card w-full rounded-2xl transition-all duration-300 opacity-0 overflow-hidden ${
                isSelected
                  ? 'shadow-2xl ring-4 ring-[#DEC6A7] ring-offset-2 ring-offset-[#0A1F1B]'
                  : 'hover:scale-[1.02] border-2 border-[#DEC6A7]/40 hover:border-[#DEC6A7]'
              }`}
            >
              <div className="relative">
                <img src={serviceImage} alt={service.name} className="w-full h-24 sm:h-28 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute inset-0 p-4 flex items-center justify-between">
                  <h3 className={`text-lg sm:text-xl font-black text-white drop-shadow-lg px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full border border-yellow-500/30 ${isVip ? 'mr-auto ml-auto' : ''}`}>
                    {service.name}
                  </h3>
                  <h3 className="text-lg sm:text-xl font-black text-white drop-shadow-lg px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full border border-yellow-500/30">
                    {service.price} ₪
                  </h3>
                </div>
                {isSelected && (
                  <div className="absolute top-3 left-3 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#DEC6A7' }}>
                    <span className="text-black text-sm">✓</span>
                  </div>
                )}
                {isVip && (
                  <div className="absolute top-3 -right-7 w-28 h-7 flex items-center justify-center rotate-45 shadow-lg overflow-hidden" style={{ background: '#DEC6A7' }}>
                    <span className="text-[#1E1E1E] text-base font-black tracking-wider">VIP</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
        {sortedServices.length === 0 && (
          <p className="text-center py-6 text-sm" style={{ color: 'rgba(222,198,167,0.5)' }}>אין שירותים להצגה</p>
        )}
      </div>
    </div>
  );
}