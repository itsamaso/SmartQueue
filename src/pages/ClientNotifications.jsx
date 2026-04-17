import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Bell, ChevronRight, Calendar } from "lucide-react";
import anime from 'animejs';
import AuthGuard from '../components/AuthGuard';


const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `לפני ${diffMins} דקות`;
  if (diffHours < 24) return `לפני ${diffHours} שעות`;
  if (diffDays < 7) return `לפני ${diffDays} ימים`;
  return date.toLocaleDateString('he-IL');
};

function ClientNotificationsContent() {
  const navigate = useNavigate();
  const pageRef = useRef(null);

  useEffect(() => {
    if (pageRef.current) {
      anime({
        targets: pageRef.current,
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutQuart'
      });

      anime({
        targets: '.notification-card',
        opacity: [0, 1],
        translateX: [30, 0],
        duration: 500,
        delay: anime.stagger(100, { start: 300 }),
        easing: 'easeOutQuart'
      });
    }
  }, []);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['client-notifications'],
    queryFn: () => base44.entities.Notification.list('-created_date'),
  });

  const activeNotifications = notifications.filter(n => {
    const now = new Date();
    const startAt = new Date(n.startAt);
    const expiresAt = new Date(n.expiresAt);
    return startAt <= now && now < expiresAt;
  });

  return (
    <div ref={pageRef} className="min-h-screen bg-transparent pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 glass-effect border-b border-yellow-600/30">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl("Home"))}
            className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-600/30 text-yellow-500 hover:bg-yellow-500/20 transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold gold-text">התראות</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-3 py-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-effect rounded-2xl p-4 animate-pulse">
                <div className="h-16 bg-zinc-800 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : activeNotifications.length === 0 ? (
          <div className="glass-effect rounded-3xl p-8 text-center border border-yellow-600/20">
            <div className="w-20 h-20 mx-auto bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-10 h-10 text-gray-600" />
            </div>
            <p className="text-gray-400 text-lg">אין התראות כרגע</p>
          </div>
        ) : (
          activeNotifications.map((notification, index) => (
            <div
              key={notification.id}
              className="notification-card glass-effect rounded-2xl p-4 border border-yellow-600/20"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 gold-gradient rounded-full flex items-center justify-center flex-shrink-0">
                  <Bell className="w-5 h-5 text-black" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium leading-relaxed">{notification.message}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(notification.startAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>


    </div>
  );
}

export default function ClientNotifications() {
  return (
    <AuthGuard>
      <ClientNotificationsContent />
    </AuthGuard>
  );
}