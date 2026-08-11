if (!process.env.NEXTAUTH_URL || !process.env.NEXTAUTH_URL.startsWith("http")) {
  process.env.NEXTAUTH_URL = process.env.APP_URL || "http://localhost:3000";
}
if (!process.env.AUTH_URL || !process.env.AUTH_URL.startsWith("http")) {
  process.env.AUTH_URL = process.env.APP_URL || "http://localhost:3000";
}

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Tenant } from "@/models/Tenant";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectToDatabase();

          const user = await User.findOne({
            email: (credentials.email as string).toLowerCase().trim(),
          });

          if (!user || !user.passwordHash) {
            return null;
          }

          if (user.active === false) {
            return null;
          }

          const isPasswordMatch = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          );

          if (!isPasswordMatch) {
            return null;
          }

          let onboardingCompleted = false;
          if (user.tenantId) {
            const tenant = await Tenant.findById(user.tenantId).lean();
            if (tenant) {
              onboardingCompleted = !!tenant.onboardingCompleted;
            }
          }

          return {
            id: String(user._id),
            name: user.name,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId ? String(user.tenantId) : null,
            activeTenantId: user.tenantId ? String(user.tenantId) : null,
            onboardingCompleted,
          };
        } catch (err) {
          console.error("Auth authorize error:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          await connectToDatabase();
          const email = user.email?.toLowerCase().trim();
          if (!email) return false;

          let dbUser = await User.findOne({ email });
          let tenantOnboardingCompleted = false;

          if (!dbUser) {
            // Automatically create a new Tenant (name: 'Mon restaurant', onboardingCompleted: false)
            const newTenant = await Tenant.create({
              name: "Mon restaurant",
              brandColor: "#059669",
              subscriptionStatus: "trial",
              onboardingCompleted: false,
            });

            // Create User (role: 'restaurant_admin', tenantId of new tenant, authProvider: 'google', googleId)
            dbUser = await User.create({
              name: user.name || "Admin Restaurant",
              email,
              role: "restaurant_admin",
              active: true,
              authProvider: "google",
              googleId: account.providerAccountId || (profile?.sub as string) || null,
              tenantId: newTenant._id,
            });

            tenantOnboardingCompleted = false;
          } else {
            if (dbUser.active === false) {
              return false;
            }

            if (!dbUser.googleId && account.providerAccountId) {
              dbUser.googleId = account.providerAccountId;
              if (dbUser.authProvider !== "google" && !dbUser.passwordHash) {
                dbUser.authProvider = "google";
              }
              await dbUser.save();
            }

            if (dbUser.tenantId) {
              const tenant = await Tenant.findById(dbUser.tenantId).lean();
              if (tenant) {
                tenantOnboardingCompleted = !!tenant.onboardingCompleted;
              }
            }
          }

          user.id = String(dbUser._id);
          user.role = dbUser.role;
          user.tenantId = dbUser.tenantId ? String(dbUser.tenantId) : null;
          user.activeTenantId = dbUser.tenantId ? String(dbUser.tenantId) : null;
          (user as { onboardingCompleted?: boolean }).onboardingCompleted = tenantOnboardingCompleted;

          return true;
        } catch (err) {
          console.error("Google signIn callback error:", err);
          return false;
        }
      }
      return true;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "ordena_saas_super_secret_key_2026",
});
