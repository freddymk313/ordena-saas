import { DefaultSession } from "next-auth";
import { UserRole } from "@/models/User";

declare module "next-auth" {
  interface User {
    id?: string;
    role?: UserRole;
    tenantId?: string | null;
    activeTenantId?: string | null;
  }

  interface Session {
    user: {
      id?: string;
      role?: UserRole;
      tenantId?: string | null;
      activeTenantId?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    tenantId?: string | null;
    activeTenantId?: string | null;
  }
}
