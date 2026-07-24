"use client";

import React from "react";
import Sidebar, { SidebarNavItem } from "@/components/ui-custom/Sidebar";
import Topbar from "@/components/ui-custom/Topbar";
import {
  Building2,
  LayoutDashboard,
  ShieldCheck,
  Utensils,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";

const superAdminNavItems: SidebarNavItem[] = [
  { title: "Dashboard SaaS", href: "/super-admin/dashboard", icon: Building2 },
  { title: "Vue Admin Restaurant", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Vue Équipe / Salle", href: "/staff/server", icon: Utensils },
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar
        navItems={superAdminNavItems}
        brandName="Ordena SuperAdmin"
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
            <div className="flex items-center gap-2 text-xs font-black text-amber-900 bg-amber-100 px-3 py-1.5 rounded-full border border-amber-200">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>SUPER ADMIN PLATFORME</span>
            </div>
          }
        />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
