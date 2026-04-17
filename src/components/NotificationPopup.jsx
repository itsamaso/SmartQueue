import React, { useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft } from "lucide-react";
import anime from 'animejs';
import { createRipple } from './animations/useAnimeAnimations';

export default function NotificationPopup({ notifications, currentIndex, onNext, onBack, onClose }) {
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      anime({
        targets: contentRef.current,
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 400,
        easing: 'easeOutBack'
      });

      anime({
        targets: '.notification-content',
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 500,
        delay: 200,
        easing: 'easeOutQuart'
      });
    }
  }, [currentIndex]);

  if (!notifications || notifications.length === 0 || currentIndex >= notifications.length) {
    return null;
  }

  const current = notifications[currentIndex];
  const hasMore = currentIndex < notifications.length - 1;
  const hasPrevious = currentIndex > 0;
  const total = notifications.length;

  const handleButtonClick = (e, callback) => {
    createRipple(e);
    anime({
      targets: e.currentTarget,
      scale: [1, 0.95, 1],
      duration: 200,
      easing: 'easeInOutQuad',
      complete: callback
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-md bg-zinc-900 border-2 border-yellow-600 [&>button]:hidden">
        <div ref={contentRef} className="space-y-3 sm:space-y-4">
          {/* Header with indicator */}
          <div className="flex items-center justify-between">
            <div className="text-yellow-500 text-xs sm:text-sm font-bold">
              إشعار {currentIndex + 1} من {total}
            </div>
            <button
              onClick={(e) => handleButtonClick(e, onClose)}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          </div>

          {/* Message */}
          <div className="notification-content bg-zinc-800/50 rounded-2xl p-4 sm:p-6 border border-yellow-600/30">
            <p className="text-white text-right whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
              {current.message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 sm:gap-3">
            {hasPrevious && (
              <Button
                onClick={(e) => handleButtonClick(e, onBack)}
                variant="outline"
                className="flex-1 rounded-xl border-zinc-700 hover:border-yellow-600 hover:bg-yellow-500/10 text-gray-300 gap-1 sm:gap-2 text-sm sm:text-base py-2 sm:py-2.5"
              >
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 rotate-180" />
                السابق
              </Button>
            )}
            {hasMore ? (
              <>
                <Button
                  onClick={(e) => handleButtonClick(e, onClose)}
                  variant="outline"
                  className="flex-1 rounded-xl border-zinc-700 hover:border-yellow-600 hover:bg-yellow-500/10 text-gray-300 text-sm sm:text-base py-2 sm:py-2.5"
                >
                  إغلاق
                </Button>
                <Button
                  onClick={(e) => handleButtonClick(e, onNext)}
                  className="flex-1 rounded-xl gold-gradient text-black font-bold hover:opacity-90 gap-1 sm:gap-2 text-sm sm:text-base py-2 sm:py-2.5"
                >
                  التالي
                  <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </>
            ) : (
              !hasPrevious && (
                <Button
                  onClick={(e) => handleButtonClick(e, onClose)}
                  className="w-full rounded-xl gold-gradient text-black font-bold hover:opacity-90 text-sm sm:text-base py-2 sm:py-2.5"
                >
                  إغلاق
                </Button>
              )
            )}
            {hasPrevious && !hasMore && (
              <Button
                onClick={(e) => handleButtonClick(e, onClose)}
                className="flex-1 rounded-xl gold-gradient text-black font-bold hover:opacity-90 text-sm sm:text-base py-2 sm:py-2.5"
              >
                إغلاق
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}