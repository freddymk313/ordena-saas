"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Lock,
  Mail,
  User,
  Store,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldAlert,
  Loader2,
  CheckCircle2,
} from "lucide-react";

function SignupForm() {
  const router = useRouter();

  const [restaurantName, setRestaurantName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmailConflict, setIsEmailConflict] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsEmailConflict(false);

    if (!restaurantName.trim()) {
      setError("Veuillez saisir le nom de votre établissement.");
      return;
    }
    if (!name.trim()) {
      setError("Veuillez saisir votre nom complet.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Veuillez saisir une adresse e-mail valide.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Le mot de passe doit comporter au moins 6 caractères.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantName: restaurantName.trim(),
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409 || data.code === "EMAIL_ALREADY_EXISTS") {
          setIsEmailConflict(true);
          setError("Cette adresse e-mail est déjà associée à un compte.");
        } else {
          setError(data.error || "Erreur lors de la création de votre compte.");
        }
        setLoading(false);
        return;
      }

      // Auto sign in user immediately
      const signInRes = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        // Fallback to login page if immediate credentials sign-in failed
        router.push("/login?signupSuccess=true");
      } else {
        router.push("/onboarding");
        router.refresh();
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Une erreur réseau est survenue. Veuillez réessayer.");
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      await signIn("google", { callbackUrl: "/onboarding" });
    } catch (err) {
      console.error("Google signup error:", err);
      setError("Impossible d'initialiser la connexion Google.");
      setGoogleLoading(false);
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
          Créez votre restaurant
        </h1>
        <p className="mt-2 text-sm text-slate-600 font-medium">
          Démarrez gratuitement en 2 minutes. Sans engagement ni carte bancaire.
        </p>
      </div>

      {/* Main Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-2xl sm:px-10 space-y-6">
          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 text-xs leading-relaxed animate-in fade-in">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">Attention :</span> {error}
                {isEmailConflict && (
                  <div className="mt-2">
                    <Link
                      href={`/login?email=${encodeURIComponent(email)}`}
                      className="inline-flex items-center gap-1.5 font-bold text-emerald-700 hover:text-emerald-800 underline"
                    >
                      Se connecter avec cette adresse email &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Google Sign-in Button */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignup}
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

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nom du restaurant
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Store className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="Ex: Le Bistrot Gourmand"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nom complet de l&apos;administrateur
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Jean Dupont"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                />
              </div>
            </div>

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
                  placeholder="contact@restaurant.com"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mot de passe (6 caractères min.)
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
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
                    <span>Création du restaurant en cours...</span>
                  </>
                ) : (
                  <>
                    <span>Créer mon restaurant & Commencer</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Free Trial / Guarantee Badges */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-4 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Essai gratuit 14 jours</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Sans carte bancaire</span>
            </div>
          </div>

          {/* Link to login */}
          <div className="text-center pt-1">
            <p className="text-xs text-slate-600 font-medium">
              Déjà inscrit sur Ordena ?{" "}
              <Link
                href="/login"
                className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
