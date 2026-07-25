"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon, UtensilsCrossed, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export interface SidebarNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
}

export interface SidebarProps {
  navItems: SidebarNavItem[];
  brandName?: string;
  logoUrl?: string;
  onLogout?: () => void;
  className?: string;
  footerContent?: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({
  navItems,
  brandName = "Ordena SaaS",
  logoUrl,
  onLogout,
  className,
  footerContent,
}) => {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "w-64 bg-white border-r border-gray-100 flex flex-col h-screen shrink-0 sticky top-0 left-0 select-none z-30",
        className
      )}
    >
      {/* Brand Header */}
      <div className="px-3 pl-4 py-4">
          <Image
            src={"/logo_desk.png"}
            width={250}
            height={250}
            alt="logo desktop"
            className="w-auto h-10"
          />
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && item.href !== "/staff" && pathname?.startsWith(item.href));

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all duration-150 group relative font-medium",
                isActive
                  ? "bg-[#E1F5EE] text-emerald-900 shadow-2xs font-semibold"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/80"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0 transition-colors",
                  isActive ? "text-emerald-700" : "text-gray-400 group-hover:text-gray-600"
                )}
              />
              <span className="truncate flex-1">{item.title}</span>

              {item.badge !== undefined && (
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ml-auto",
                    isActive
                      ? "bg-emerald-200 text-emerald-900"
                      : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Area */}
      <div className="p-3 border-t border-gray-100 space-y-2">
        {footerContent}

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm text-gray-600 hover:text-rose-600 hover:bg-rose-50/80 transition-colors font-medium text-left"
          >
            <LogOut className="w-4 h-4 shrink-0 text-gray-400 group-hover:text-rose-600" />
            <span>Déconnexion</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
