"use client";

import React, { useMemo, useState } from "react";
import Sidebar, { SidebarNavItem } from "@/components/ui-custom/Sidebar";
import Topbar from "@/components/ui-custom/Topbar";
import {
  LayoutDashboard,
  QrCode,
  Utensils,
  BookOpen,
  Users,
  Settings,
  DollarSign,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";

const allAdminNavItems: SidebarNavItem[] = [
  { title: "Tableau de bord", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Menu & Catégories", href: "/admin/menu", icon: BookOpen },
  { title: "Commandes & Cuisine", href: "/admin/orders", icon: Utensils },
  { title: "Tables & QR", href: "/admin/tables", icon: QrCode },
  // { title: "Additions & Factures", href: "/admin/bills", icon: DollarSign },
  { title: "Utilisateurs", href: "/admin/users", icon: Users },
  { title: "Paramètres", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const filteredNavItems = useMemo(() => {
    const role = session?.user?.role;
    if (role === "server" || role === "kitchen") {
      return allAdminNavItems.filter((item) => item.href === "/admin/orders");
    }
    return allAdminNavItems;
  }, [session?.user?.role]);

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
      <Sidebar
        navItems={filteredNavItems}
        brandName="Ordena Admin"
        onLogout={() => signOut({ callbackUrl: "/login" })}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <Topbar
          onToggleMobileNav={() => setMobileNavOpen((prev) => !prev)}
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
            <div className="flex items-center gap-2 text-xs font-bold text-gray-800 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Espace Restaurant</span>
            </div>
          }
        />
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
