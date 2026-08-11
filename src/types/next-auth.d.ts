import { DefaultSession } from "next-auth";
import { UserRole } from "@/models/User";

declare module "next-auth" {
  interface User {
    id?: string;
    role?: UserRole;
    tenantId?: string | null;
    activeTenantId?: string | null;
    onboardingCompleted?: boolean;
  }

  interface Session {
    user: {
      id?: string;
      role?: UserRole;
      tenantId?: string | null;
      activeTenantId?: string | null;
      onboardingCompleted?: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    tenantId?: string | null;
    activeTenantId?: string | null;
    onboardingCompleted?: boolean;
  }
}
