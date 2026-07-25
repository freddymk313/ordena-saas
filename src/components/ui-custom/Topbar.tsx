"use client";

import React from "react";
import { Bell, User, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TopbarProps {
  tenantSelectorSlot?: React.ReactNode;
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
  unreadNotificationsCount?: number;
  onNotificationClick?: () => void;
  onUserMenuClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const Topbar: React.FC<TopbarProps> = ({
  tenantSelectorSlot,
  user,
  unreadNotificationsCount = 0,
  onNotificationClick,
  onUserMenuClick,
  className,
  children,
}) => {
  return (
    <header
      className={cn(
        "h-18 bg-white border-b border-gray-100 px-6 flex items-center justify-end sticky top-0 z-20 shadow-2xs",
        className
      )}
    >
      {/* Right Slot: Notifications & User Profile */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Notification Bell */}
        <button
          onClick={onNotificationClick}
          aria-label="Notifications"
          className="relative p-2 rounded-lg border text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors focus:outline-hidden"
        >
          <Bell className="w-5 h-5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          )}
        </button>

        <div className="h-5 w-px bg-gray-200 mx-1" />

        {/* User Profile Badge */}
        <button
          onClick={onUserMenuClick}
          className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-gray-50 transition-colors text-left focus:outline-hidden"
        >
          <div className="w-8.5 h-8.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-semibold text-xs shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>

          {user && (
            <div className="hidden sm:flex flex-col min-w-0 pr-1">
              <span className="text-xs *font-semibold text-gray-900 truncate max-w-[130px]">
                {user.name || "Utilisateur"}
              </span>
              <span className="text-[10px] text-gray-500 capitalize truncate max-w-[130px]">
                {user.role ? user.role.replace("_", " ") : "Membre"}
              </span>
            </div>
          )}

          <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
