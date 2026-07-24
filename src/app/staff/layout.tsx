"use client";

import React from "react";
import Sidebar, { SidebarNavItem } from "@/components/ui-custom/Sidebar";
import Topbar from "@/components/ui-custom/Topbar";
import {
  MapPin,
  Utensils,
  Bell,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

const staffNavItems: SidebarNavItem[] = [
  { title: "Plan de Salle", href: "/staff/floor-map", icon: MapPin },
  { title: "Cuisine & Production", href: "/staff/kitchen", icon: Utensils },
  { title: "Service & Salle", href: "/staff/server", icon: Bell },
];

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar
        navItems={staffNavItems}
        brandName="Ordena Staff"
        onLogout={() => signOut({ callbackUrl: "/login" })}
        footerContent={
          (session?.user?.role === "restaurant_admin" ||
            session?.user?.role === "super_admin") && (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retour Espace Admin</span>
            </Link>
          )
        }
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          user={
            session?.user
              ? {
                  name: session.user.name,
                  email: session.user.email,
                  role: session.user.role,
                }
              : undefined
          }
          tenantSelectorSlot={
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Espace Service & Salle</span>
            </div>
          }
        />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
