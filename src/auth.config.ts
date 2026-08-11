if (!process.env.NEXTAUTH_URL || !process.env.NEXTAUTH_URL.startsWith("http")) {
  process.env.NEXTAUTH_URL = process.env.APP_URL || "http://localhost:3000";
}
if (!process.env.AUTH_URL || !process.env.AUTH_URL.startsWith("http")) {
  process.env.AUTH_URL = process.env.APP_URL || "http://localhost:3000";
}

import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@/models/User";

export const authConfig: NextAuthConfig = {
  trustHost: true,
  basePath: "/api/auth",
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const onboardingCompleted = auth?.user?.onboardingCompleted;
      const pathname = nextUrl.pathname;

      // Unauthenticated access to onboarding or admin/staff
      if (pathname.startsWith("/onboarding")) {
        if (!isLoggedIn) return false;
        if (role !== "restaurant_admin") {
          if (role === "super_admin") {
            return Response.redirect(new URL("/super-admin/dashboard", nextUrl));
          }
          return Response.redirect(new URL("/staff/server", nextUrl));
        }
        if (onboardingCompleted === true) {
          return Response.redirect(new URL("/admin/dashboard", nextUrl));
        }
        return true;
      }

      if (pathname === "/login" || pathname === "/signup") {
        if (isLoggedIn) {
          if (role === "super_admin") {
            return Response.redirect(new URL("/super-admin/dashboard", nextUrl));
          } else if (role === "restaurant_admin") {
            if (onboardingCompleted === false) {
              return Response.redirect(new URL("/onboarding", nextUrl));
            }
            return Response.redirect(new URL("/admin/dashboard", nextUrl));
          } else if (role === "server") {
            return Response.redirect(new URL("/staff/server", nextUrl));
          } else if (role === "kitchen") {
            return Response.redirect(new URL("/staff/kitchen", nextUrl));
          }
        }
        return true;
      }

      if (pathname.startsWith("/super-admin")) {
        if (!isLoggedIn) return false;
        return role === "super_admin";
      }

      if (pathname.startsWith("/admin/orders")) {
        if (!isLoggedIn) return false;
        return role === "restaurant_admin" || role === "super_admin" || role === "server" || role === "kitchen";
      }

      if (pathname.startsWith("/admin")) {
        if (!isLoggedIn) return false;
        if (role === "restaurant_admin" && onboardingCompleted === false) {
          return Response.redirect(new URL("/onboarding", nextUrl));
        }
        return role === "restaurant_admin" || role === "super_admin";
      }

      if (pathname.startsWith("/staff")) {
        if (!isLoggedIn) return false;
        return role === "server" || role === "kitchen" || role === "restaurant_admin" || role === "super_admin";
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.tenantId = user.tenantId ? String(user.tenantId) : null;
        token.activeTenantId = user.activeTenantId
          ? String(user.activeTenantId)
          : user.tenantId
          ? String(user.tenantId)
          : null;
        token.onboardingCompleted = (user as { onboardingCompleted?: boolean }).onboardingCompleted ?? false;
      }

      // Allow updating session fields dynamically (e.g. switch-tenant, complete onboarding)
      if (trigger === "update") {
        if (session?.activeTenantId !== undefined) {
          token.activeTenantId = session.activeTenantId;
        }
        if (session?.onboardingCompleted !== undefined) {
          token.onboardingCompleted = session.onboardingCompleted;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.tenantId = token.tenantId as string | null;
        session.user.activeTenantId = token.activeTenantId as string | null;
        session.user.onboardingCompleted = token.onboardingCompleted as boolean;
      }
      return session;
    },
  },
  providers: [],
};
