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

// Définition étendue avec les rôles autorisés par route
type RoleAllowedNavItem = SidebarNavItem & {
  roles?: string[];
};

const ALL_ROLES = ["restaurant_admin", "super_admin"];

const staffNavItems: RoleAllowedNavItem[] = [
  {
    title: "Plan de Salle",
    href: "/staff/floor-map",
    icon: MapPin,
    roles: ["server", ...ALL_ROLES],
  },
  {
    title: "Cuisine & Production",
    href: "/staff/kitchen",
    icon: Utensils,
    roles: ["kitchen", ...ALL_ROLES],
  },
  {
    title: "Service & Salle",
    href: "/staff/server",
    icon: Bell,
    roles: ["server", ...ALL_ROLES],
  },
];

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  // Filtrage des éléments du menu selon le rôle de l'utilisateur
  const filteredNavItems = staffNavItems.filter((item) => {
    if (!item.roles) return true;
    return userRole ? item.roles.includes(userRole) : false;
  });

  // Dynamic label for topbar
  const getSpaceLabel = () => {
    if (userRole === "kitchen") return "Espace Cuisine & Production";
    if (userRole === "server") return "Espace Service & Salle";
    return "Espace Staff";
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar
        navItems={filteredNavItems}
        brandName="Ordena Staff"
        onLogout={() => signOut({ callbackUrl: "/login" })}
        footerContent={
          (userRole === "restaurant_admin" || userRole === "super_admin") && (
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
              <span>{getSpaceLabel()}</span>
            </div>
          }
        />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}