"use client";

import React, { useState, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  UtensilsCrossed,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Building2,
  ChefHat,
  ConciergeBell,
  ArrowRight,
  Database,
  Loader2,
  CheckCircle2,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Seed DB states
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Veuillez saisir votre adresse email et votre mot de passe.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password: password.trim(),
        redirect: false,
      });

      if (res?.error) {
        setError("Identifiants incorrects. Veuillez vérifier vos données ou lancer l'initialisation DB (Seed).");
        setLoading(false);
        return;
      }

      // Fetch session to determine role and redirect accordingly
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();
      const role = sessionData?.user?.role;

      if (callbackUrl && !callbackUrl.includes("/login")) {
        router.push(callbackUrl);
      } else {
        if (role === "super_admin") {
          router.push("/super-admin/dashboard");
        } else if (role === "restaurant_admin") {
          router.push("/admin/dashboard");
        } else if (role === "server") {
          router.push("/staff/server");
        } else if (role === "kitchen") {
          router.push("/staff/kitchen");
        } else {
          router.push("/admin/dashboard");
        }
      }
      router.refresh();
    } catch (err: unknown) {
      console.error("Login submission error:", err);
      setError("Une erreur est survenue lors de la connexion.");
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  const handleSeedDatabase = async () => {
    setSeedLoading(true);
    setSeedSuccess(null);
    setError(null);
    try {
      const res = await fetch("/api/seed?force=true", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSeedSuccess("Base de données initialisée ! Vous pouvez maintenant vous connecter avec les boutons d'accès rapide ci-dessous.");
      } else {
        setError(data.error || "Échec de l'initialisation de la base de données.");
      }
    } catch (err: unknown) {
      console.error("Seed error:", err);
      setError("Erreur de connexion au serveur pour le seed.");
    } finally {
      setSeedLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-gray-200/80 sm:rounded-2xl sm:px-10 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 text-xs leading-relaxed animate-in fade-in">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Erreur d&apos;authentification :</span> {error}
              </div>
            </div>
          )}

          {seedSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3 text-xs leading-relaxed animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Succès :</span> {seedSuccess}
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Adresse e-mail
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@restaurant.com"
                  className="block w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Mot de passe
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connexion en cours...</span>
                  </>
                ) : (
                  <>
                    <span>Se Connecter</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Fill Demo Accounts Section */}
          <div className="pt-6 border-t border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Accès Rapide Démo (1-Clic)
              </span>
              <button
                type="button"
                onClick={handleSeedDatabase}
                disabled={seedLoading}
                className="text-xs font-medium text-emerald-700 hover:text-emerald-800 underline flex items-center gap-1"
              >
                {seedLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Database className="w-3 h-3" />
                )}
                <span>Initialiser DB (Seed)</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => fillCredentials("admin@ordena.com", "adminpassword123")}
                className="p-3 text-left rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 hover:border-purple-300 transition-all group"
              >
                <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0" />
                  <span>Super Admin</span>
                </div>
                <p className="text-[10px] text-purple-700 mt-1 truncate">admin@ordena.com</p>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials("admin@bistro.com", "bistropassword123")}
                className="p-3 text-left rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 hover:border-emerald-300 transition-all group"
              >
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                  <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Admin Restaurant</span>
                </div>
                <p className="text-[10px] text-emerald-700 mt-1 truncate">admin@bistro.com</p>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials("serveur@bistro.com", "serveurpassword123")}
                className="p-3 text-left rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 hover:border-blue-300 transition-all group"
              >
                <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                  <ConciergeBell className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>Serveur Staff</span>
                </div>
                <p className="text-[10px] text-blue-700 mt-1 truncate">serveur@bistro.com</p>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials("cuisine@bistro.com", "cuisinepassword123")}
                className="p-3 text-left rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/60 hover:border-amber-300 transition-all group"
              >
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <ChefHat className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Cuisine Staff</span>
                </div>
                <p className="text-[10px] text-amber-700 mt-1 truncate">cuisine@bistro.com</p>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-gray-500 hover:text-gray-800 transition-colors"
          >
            ← Retour à la page d&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
