import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Scissors, 
  Package, 
  Bell, 
  Clock, 
  Users, 
  LogOut,
  ChevronRight,
  X,
  Settings
} from "lucide-react";

const menuItems = [
  { id: "bookings", label: "תורים", icon: Calendar },
  { id: "stories", label: "סטיילינג", icon: Scissors },
  { id: "services", label: "ניהול שירותים", icon: Settings },
  { id: "products", label: "מוצרים", icon: Package },
  { id: "notifications", label: "התראות", icon: Bell },
  { id: "availability", label: "ניהול שעות", icon: Clock },
  { id: "clients", label: "לקוחות", icon: Users },
];

export default function AdminSidebar({ activeTab, onTabChange, onLogout, isOpen, onClose }) {
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed top-0 right-0 h-full w-72 z-50 
        border-l border-[rgba(222,198,167,0.25)]
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:h-auto lg:min-h-screen
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}
      style={{ background: 'rgba(30,30,30,0.97)', backdropFilter: 'blur(12px)' }}>
        <div className="flex flex-col h-full p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 pb-4" style={{ borderBottom: '1px solid rgba(222,198,167,0.2)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)' }}>
                <Settings className="w-5 h-5 text-black" />
              </div>
              <h2 className="font-black text-lg" style={{ color: '#DEC6A7' }}>לוח בקרה</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden rounded-xl"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
                  style={isActive ? {
                    background: 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)',
                    color: '#1E1E1E',
                    fontWeight: 700,
                    boxShadow: '0 4px 16px rgba(222,198,167,0.3)'
                  } : {
                    color: 'rgba(255,255,255,0.65)'
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: isActive ? '#1E1E1E' : '#DEC6A7' }} />
                  <span className="flex-1 text-right">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 rotate-180" />}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="pt-4 mt-4 pb-24 lg:pb-4" style={{ borderTop: '1px solid rgba(222,198,167,0.2)' }}>
            <Button
              variant="outline"
              onClick={onLogout}
              className="w-full rounded-xl"
              style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.5)', color: '#f87171' }}
            >
              <LogOut className="w-4 h-4 ml-2" />
              התנתקות
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}