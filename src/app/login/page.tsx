"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
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
  const signupSuccess = searchParams.get("signupSuccess");
  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Demo mode check
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

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
        setError("Identifiants incorrects. Veuillez vérifier votre email et mot de passe.");
        setLoading(false);
        return;
      }

      // Fetch session to determine role and onboarding status
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();
      const role = sessionData?.user?.role;
      const onboardingCompleted = sessionData?.user?.onboardingCompleted;

      if (callbackUrl && !callbackUrl.includes("/login")) {
        router.push(callbackUrl);
      } else {
        if (role === "super_admin") {
          router.push("/super-admin/dashboard");
        } else if (role === "restaurant_admin") {
          if (onboardingCompleted === false) {
            router.push("/onboarding");
          } else {
            router.push("/admin/dashboard");
          }
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

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      await signIn("google", { callbackUrl: "/onboarding" });
    } catch (err) {
      console.error("Google signin error:", err);
      setError("Impossible d'initialiser la connexion Google.");
      setGoogleLoading(false);
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
        setSeedSuccess("Base de données initialisée avec succès !");
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <Link href="/" className="inline-block transition-transform hover:scale-105 mb-4">
          <Image
            src="/logo_desk.png"
            width={220}
            height={60}
            alt="Ordena SaaS"
            className="w-auto h-9 mx-auto"
            priority
          />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Connexion à votre espace
        </h1>
        <p className="mt-2 text-sm text-slate-600 font-medium">
          Gérez votre restaurant, vos commandes et vos équipes
        </p>
      </div>

      {/* Main Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-2xl sm:px-10 space-y-6">
          {signupSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3 text-xs leading-relaxed animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Compte créé avec succès !</span> Connectez-vous ci-dessous pour accéder à votre espace.
              </div>
            </div>
          )}

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

          {/* Google Login Button */}
          <div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold shadow-2xs transition-all active:scale-98 disabled:opacity-50"
            >
              {googleLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Connexion avec Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continuer avec Google</span>
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">
                ou par e-mail
              </span>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Adresse e-mail
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@restaurant.com"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mot de passe
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-all active:scale-98"
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

          {/* Link to signup */}
          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-600 font-medium">
              Pas encore de compte ?{" "}
              <Link
                href="/signup"
                className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Créer mon restaurant
              </Link>
            </p>
          </div>

          {/* Quick Fill Demo Accounts Section - ONLY visible when process.env.NEXT_PUBLIC_DEMO_MODE === 'true' */}
          {isDemoMode && (
            <div className="pt-6 border-t border-dashed border-amber-200 space-y-4 bg-amber-50/50 -mx-6 sm:-mx-10 -mb-8 p-6 sm:p-8 rounded-b-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Accès Rapide Démo (1-Clic)
                </span>
                <button
                  type="button"
                  onClick={handleSeedDatabase}
                  disabled={seedLoading}
                  className="text-xs font-medium text-amber-800 hover:text-amber-900 underline flex items-center gap-1"
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
                  className="p-3 text-left rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 transition-all group"
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
                  className="p-3 text-left rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 transition-all group"
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
                  className="p-3 text-left rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 transition-all group"
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
                  className="p-3 text-left rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100 transition-all group"
                >
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <ChefHat className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Cuisine Staff</span>
                  </div>
                  <p className="text-[10px] text-amber-700 mt-1 truncate">cuisine@bistro.com</p>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
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
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

