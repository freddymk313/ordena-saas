import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@/models/User";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const pathname = nextUrl.pathname;

      if (pathname.startsWith("/super-admin")) {
        if (!isLoggedIn) return false;
        return role === "super_admin";
      }

      if (pathname.startsWith("/admin")) {
        if (!isLoggedIn) return false;
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
        token.tenantId = user.tenantId ? user.tenantId.toString() : null;
        token.activeTenantId = user.activeTenantId
          ? user.activeTenantId.toString()
          : user.tenantId
          ? user.tenantId.toString()
          : null;
      }

      // Allow super_admin to update activeTenantId dynamically in session
      if (trigger === "update" && session?.activeTenantId !== undefined) {
        token.activeTenantId = session.activeTenantId;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.tenantId = token.tenantId as string | null;
        session.user.activeTenantId = token.activeTenantId as string | null;
      }
      return session;
    },
  },
  providers: [],
};
