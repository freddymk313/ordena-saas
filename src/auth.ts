import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
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

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId ? user.tenantId.toString() : null,
            activeTenantId: user.tenantId ? user.tenantId.toString() : null,
          };
        } catch (err) {
          console.error("Auth authorize error:", err);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "ordena_saas_super_secret_key_2026",
});
