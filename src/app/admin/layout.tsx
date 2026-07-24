"use client";

import React from "react";
import Sidebar, { SidebarNavItem } from "@/components/ui-custom/Sidebar";
import Topbar from "@/components/ui-custom/Topbar";
import {
  LayoutDashboard,
  QrCode,
  Utensils,
  BookOpen,
  Receipt,
  Users,
  Settings,
  MapPin,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";

const adminNavItems: SidebarNavItem[] = [
  { title: "Tableau de bord", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Plan de salle (Staff)", href: "/staff/floor-map", icon: MapPin },
  { title: "Gestion des Tables & QR", href: "/admin/tables", icon: QrCode },
  { title: "Menu & Catégories", href: "/admin/menu", icon: BookOpen },
  { title: "Commandes & Cuisine", href: "/staff/orders", icon: Utensils },
  { title: "Additions & Factures", href: "/admin/bills", icon: Receipt },
  { title: "Utilisateurs & Équipe", href: "/admin/users", icon: Users },
  { title: "Paramètres Établissement", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar
        navItems={adminNavItems}
        brandName="Ordena Admin"
        onLogout={() => signOut({ callbackUrl: "/login" })}
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
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Espace Restaurant</span>
            </div>
          }
        />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
