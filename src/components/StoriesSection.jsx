import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Sparkles, X, Play, ChevronLeft, ChevronRight } from "lucide-react";
import anime from 'animejs';
import GenderToggle from "@/components/GenderToggle";

function getSessionGender() {
  try {
    const data = localStorage.getItem('customer_session');
    if (data) return JSON.parse(data)?.gender || 'male';
  } catch {}
  return 'male';
}

export default function StoriesSection({ onStoryClick, selectedStory }) {
  const [viewingStory, setViewingStory] = useState(null);
  const [viewingIndex, setViewingIndex] = useState(0);
  const [genderFilter, setGenderFilter] = useState(getSessionGender);
  const containerRef = useRef(null);
  const touchStartX = useRef(null);

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ['stories'],
    queryFn: () => base44.entities.Story.list('order'),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  });

  const filteredStories = stories.filter((s) => s.gender === genderFilter);

  useEffect(() => {
    if (!isLoading && stories.length > 0) {
      anime({
        targets: '.story-item',
        opacity: [0, 1],
        scale: [0.7, 1],
        duration: 500,
        delay: anime.stagger(60),
        easing: 'easeOutBack'
      });
    }
  }, [isLoading, stories.length, genderFilter]);

  const handleStoryClick = useCallback((e, story) => {
    anime({
      targets: e.currentTarget,
      scale: [1, 0.88, 1.08, 1],
      duration: 320,
      easing: 'easeInOutQuad'
    });
    const idx = filteredStories.findIndex((s) => s.id === story.id);
    setViewingIndex(idx);
    setViewingStory(story);
    if (onStoryClick) onStoryClick(story);
  }, [onStoryClick, filteredStories]);

  const goToPrev = useCallback(() => {
    const newIdx = (viewingIndex - 1 + filteredStories.length) % filteredStories.length;
    setViewingIndex(newIdx);
    setViewingStory(filteredStories[newIdx]);
  }, [viewingIndex, filteredStories]);

  const goToNext = useCallback(() => {
    const newIdx = (viewingIndex + 1) % filteredStories.length;
    setViewingIndex(newIdx);
    setViewingStory(filteredStories[newIdx]);
  }, [viewingIndex, filteredStories]);

  if (isLoading) {
    return (
      <div className="rounded-3xl px-4 pt-4 pb-3 border" style={{ background: 'rgba(58,61,68,0.8)', borderColor: 'rgba(222,198,167,0.3)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-24 rounded-full animate-pulse" style={{ background: 'rgba(222,198,167,0.2)' }}></div>
          <div className="h-8 w-28 rounded-xl animate-pulse" style={{ background: 'rgba(222,198,167,0.1)' }}></div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
              <div className="w-[72px] h-[72px] rounded-full animate-pulse" style={{ background: 'rgba(222,198,167,0.15)' }}></div>
              <div className="h-3 w-12 rounded animate-pulse" style={{ background: 'rgba(222,198,167,0.1)' }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        className="rounded-3xl px-4 pt-4 pb-3 border"
        style={{ background: 'rgba(58,61,68,0.85)', borderColor: 'rgba(222,198,167,0.3)', backdropFilter: 'blur(8px)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)' }}>
              <Sparkles className="w-3.5 h-3.5 text-[#1E1E1E]" />
            </div>
            <h2 className="text-xl font-bold tracking-wide" style={{ color: '#DEC6A7' }}>תסרוקות</h2>
          </div>
          <GenderToggle value={genderFilter} onChange={setGenderFilter} className="text-xs !rounded-xl" />
        </div>

        {/* Stories row */}
        <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide" dir="rtl">
          {filteredStories.map((story) => {
            const isVideo = story.media_type === 'video' || story.video_url;
            const isSelected = selectedStory?.id === story.id;
            return (
              <div
                key={story.id}
                className="story-item flex-shrink-0 flex flex-col items-center cursor-pointer opacity-0"
                style={{ width: 72 }}
                onClick={(e) => handleStoryClick(e, story)}
              >
                {/* Ring + Avatar */}
                <div
                  className={`rounded-full transition-all duration-300 ${isSelected ? 'scale-110' : 'hover:scale-105 active:scale-95'}`}
                  style={{
                    padding: 2.5,
                    background: isSelected
                      ? 'linear-gradient(135deg, #FFD36A 0%, #DEC6A7 50%, #B8A87A 100%)'
                      : 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)',
                    boxShadow: isSelected ? '0 0 16px rgba(222,198,167,0.5)' : '0 2px 8px rgba(0,0,0,0.3)'
                  }}
                >
                  <div className="w-[64px] h-[64px] rounded-full overflow-hidden" style={{ background: '#1a1a1a', padding: 2 }}>
                    <div className="w-full h-full rounded-full overflow-hidden relative">
                      {isVideo ? (
                        <>
                          {story.image_url && <img src={story.image_url} alt={story.title} className="w-full h-full object-cover" />}
                          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.35)' }}>
                            <Play className="w-5 h-5 text-white drop-shadow-lg" fill="white" />
                          </div>
                        </>
                      ) : (
                        <img src={story.image_url} alt={story.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Title */}
                <p
                  className="text-center mt-1.5 leading-tight font-medium truncate w-full px-1"
                  style={{ color: isSelected ? '#DEC6A7' : 'rgba(255,255,255,0.75)', fontSize: 11 }}
                >
                  {story.title}
                </p>
              </div>
            );
          })}

          {filteredStories.length === 0 && (
            <p className="text-center w-full py-5 text-sm" style={{ color: 'rgba(222,198,167,0.4)' }}>
              אין תסרוקות להצגה
            </p>
          )}
        </div>
      </div>

      {/* Full-screen viewer */}
      {viewingStory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.96)' }}
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return;
            const diff = touchStartX.current - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) diff > 0 ? goToNext() : goToPrev();
            touchStartX.current = null;
          }}
        >
          {/* Progress dots */}
          {filteredStories.length > 1 && (
            <div className="absolute top-5 left-0 right-0 flex justify-center gap-1.5 z-50 px-6">
              {filteredStories.map((_, i) => (
                <div
                  key={i}
                  className="h-1 rounded-full transition-all duration-300"
                  style={{
                    background: i === viewingIndex ? '#DEC6A7' : 'rgba(255,255,255,0.25)',
                    flex: i === viewingIndex ? 2 : 1
                  }}
                />
              ))}
            </div>
          )}

          {/* Close */}
          <button
            onClick={() => setViewingStory(null)}
            className="absolute top-12 left-4 z-50 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Prev */}
          {filteredStories.length > 1 && (
            <button
              onClick={goToPrev}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-50 w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Next */}
          {filteredStories.length > 1 && (
            <button
              onClick={goToNext}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-50 w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Media */}
          <div className="w-full h-full flex flex-col items-center justify-center px-4">
            {viewingStory.media_type === 'video' || viewingStory.video_url ? (
              <video
                src={viewingStory.video_url}
                controls
                autoPlay
                className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl"
              />
            ) : (
              <img
                src={viewingStory.image_url}
                alt={viewingStory.title}
                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
              />
            )}
          </div>

          {/* Title bar */}
          <div className="absolute bottom-10 left-0 right-0 flex justify-center px-6">
            <div
              className="px-6 py-3 rounded-2xl text-center"
              style={{ background: 'rgba(30,30,30,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(222,198,167,0.2)' }}
            >
              <h3 className="font-bold text-base" style={{ color: '#DEC6A7' }}>{viewingStory.title}</h3>
              {filteredStories.length > 1 && (
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {viewingIndex + 1} / {filteredStories.length}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}