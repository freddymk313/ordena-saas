"use client";

import React from "react";
import { Bell, User, ChevronDown, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

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
  onToggleMobileNav?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const Topbar: React.FC<TopbarProps> = ({
  tenantSelectorSlot,
  user,
  unreadNotificationsCount = 0,
  onNotificationClick,
  onUserMenuClick,
  onToggleMobileNav,
  className,
}) => {
  return (
    <header
      className={cn(
        "h-16 md:h-18 bg-white border-b border-gray-100 px-4 md:px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs",
        className
      )}
    >
      {/* Left Slot: Mobile Hamburger + Logo / Tenant */}
      <div className="flex items-center gap-3">
        {onToggleMobileNav && (
          <button
            onClick={onToggleMobileNav}
            className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 md:hidden focus:outline-hidden"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="md:hidden flex items-center">
          <Image
            src={"/logo_desk.png"}
            width={120}
            height={32}
            alt="logo mobile"
            className="w-auto h-7"
            priority
          />
        </div>

        {tenantSelectorSlot && (
          <div className="hidden sm:flex items-center">{tenantSelectorSlot}</div>
        )}
      </div>

      {/* Right Slot: Notifications & User Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Notification Bell */}
        <button
          onClick={onNotificationClick}
          aria-label="Notifications"
          className="relative p-2 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors focus:outline-hidden"
        >
          <Bell className="w-4.5 h-4.5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          )}
        </button>

        <div className="h-5 w-px bg-gray-200" />

        {/* User Profile Badge */}
        <button
          onClick={onUserMenuClick}
          className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-50 transition-colors text-left focus:outline-hidden"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>

          {user && (
            <div className="hidden sm:flex flex-col min-w-0 pr-1">
              <span className="text-xs font-bold text-gray-900 truncate max-w-[130px]">
                {user.name || "Utilisateur"}
              </span>
              <span className="text-[10px] text-gray-500 capitalize truncate max-w-[130px]">
                {user.role ? user.role.replace("_", " ") : "Membre"}
              </span>
            </div>
          )}

          <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
