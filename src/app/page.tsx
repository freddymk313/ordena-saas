"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  UtensilsCrossed,
  QrCode,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  ChefHat,
  ConciergeBell,
  BarChart3,
  CheckCircle2,
  Zap,
  Smartphone,
  Clock,
  Layers,
  ChevronRight,
  Building2,
  Users,
  Award,
  DollarSign,
  TrendingUp,
  Check,
} from "lucide-react";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"client" | "kitchen" | "server" | "admin">("client");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-emerald-500 selection:text-white antialiased">
      {/* 1. Header / Navigation */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src={"/logo_desk.png"}
              width={250}
              height={250}
              alt="logo desktop"
              className="w-auto h-8 transition-transform group-hover:scale-[1.02]"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-emerald-600 transition-colors">
              Fonctionnalités
            </a>
            <a href="#workflows" className="hover:text-emerald-600 transition-colors">
              Démos par Rôle
            </a>
            <a href="#pricing" className="hover:text-emerald-600 transition-colors">
              Tarifs
            </a>
            <a href="#faq" className="hover:text-emerald-600 transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-emerald-600 transition-colors"
            >
              Se Connecter
            </Link>
            <Link
              href="/login"
              className="px-4 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
            >
              Essai Gratuit 14j
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-28 md:pb-32 overflow-hidden bg-gradient-to-b from-emerald-50/50 via-slate-50/80 to-slate-50">
        {/* Glow ambient background effects */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-[300px] h-[300px] bg-teal-300/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-xs font-bold mb-8 backdrop-blur-md shadow-xs animate-in fade-in slide-in-from-bottom-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>SaaS Restaurant Multi-Tenant Nouvelle Génération</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight max-w-5xl mx-auto leading-[1.1]">
            Commande sur table par{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              QR Code
            </span>{" "}
            & service ultra fluide
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Permettez à vos clients de commander et de régler directement depuis leur table sans télécharger d&apos;application, tout en synchronisant la cuisine et le service en temps réel.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-500 shadow-xl shadow-emerald-600/25 active:scale-98 transition-all text-base flex items-center justify-center gap-2 group"
            >
              <span>Accéder aux Démos (Se Connecter)</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/t/tbl_demo_1"
              target="_blank"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-white text-slate-800 border border-slate-200/80 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all text-base flex items-center justify-center gap-2 shadow-xs"
            >
              <QrCode className="w-5 h-5 text-emerald-600" />
              <span>Tester le Scan Client (Table 1)</span>
            </Link>
          </div>

          {/* Proof Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200/60 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Isolation Multi-Tenant Complète</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200/60 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Zéro App à Installer</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200/60 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Mise à jour ultra-rapide (Polling 4s)</span>
            </div>
          </div>

          {/* Visual Application Mockup Dashboard Showcase */}
          <div className="mt-14 max-w-5xl mx-auto bg-slate-900 rounded-3xl p-3 sm:p-5 shadow-2xl border border-slate-800 text-left relative overflow-hidden group">
            {/* Top Browser Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 px-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                <span className="text-xs text-slate-400 font-mono ml-2 hidden sm:inline-block">
                  app.ordena-saas.com / bistro-gourmet
                </span>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                En direct
              </span>
            </div>

            {/* Dashboard Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Card 1: Floor Map Preview */}
              <div className="bg-slate-800/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" /> Plan de Salle
                  </span>
                  <span className="text-emerald-400 text-[11px] font-mono">4 Tables</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-xs">
                    <p className="font-bold text-emerald-200">Table 1</p>
                    <span className="text-[10px] text-emerald-400 font-semibold">Disponible</span>
                  </div>
                  <div className="p-3 bg-blue-950/60 border border-blue-800/80 rounded-xl text-xs">
                    <p className="font-bold text-blue-200">Table 2</p>
                    <span className="text-[10px] text-blue-400 font-semibold">Occupée (2 plats)</span>
                  </div>
                  <div className="p-3 bg-amber-950/60 border border-amber-800/80 rounded-xl text-xs">
                    <p className="font-bold text-amber-200">Table 3</p>
                    <span className="text-[10px] text-amber-400 font-bold animate-pulse">Appel Serveur</span>
                  </div>
                  <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-xs">
                    <p className="font-bold text-emerald-200">Table VIP</p>
                    <span className="text-[10px] text-emerald-400 font-semibold">Disponible</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Kitchen KDS Preview */}
              <div className="bg-slate-800/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-2">
                    <ChefHat className="w-4 h-4 text-amber-400" /> Écran Cuisine (KDS)
                  </span>
                  <span className="text-amber-400 text-[11px] font-mono">2 En cours</span>
                </div>
                <div className="space-y-2">
                  <div className="p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between font-bold text-slate-200">
                      <span>#104 - Table 2 (Marc)</span>
                      <span className="text-amber-400 text-[11px]">En prépa</span>
                    </div>
                    <p className="text-[11px] text-slate-400">1x Burger Artisan, 1x Entrecôte</p>
                  </div>
                  <div className="p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between font-bold text-slate-200">
                      <span>#105 - Table 3 (Julie)</span>
                      <span className="text-blue-400 text-[11px]">En attente</span>
                    </div>
                    <p className="text-[11px] text-slate-400">2x Salade Burrata</p>
                  </div>
                </div>
              </div>

              {/* Card 3: Mobile Web Client Preview */}
              <div className="bg-gradient-to-br from-emerald-900/90 to-slate-900 p-4 rounded-2xl border border-emerald-700/50 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                    <span className="flex items-center gap-2 text-emerald-300">
                      <Smartphone className="w-4 h-4" /> Client Scan QR
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                      Mobile Native Web
                    </span>
                  </div>
                  <div className="mt-3 bg-slate-900/90 p-3 rounded-xl text-xs space-y-1.5 border border-slate-800">
                    <p className="font-bold text-white">Le Bistro Gourmet — Table 1</p>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Scannez, commandez vos boissons et plats en 30 secondes sans attendre.
                    </p>
                  </div>
                </div>
                <Link
                  href="/t/tbl_demo_1"
                  target="_blank"
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs text-center transition-colors shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>Tester la commande Table 1</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Bento Grid Features Section */}
      <section id="features" className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Architecture Moderne
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-4">
              Pensé pour fluidifier chaque minute de votre service
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600">
              Des modules autonomes et interconnectés conçus pour booster votre chiffre d&apos;affaires.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento 1: Large Box */}
            <div className="md:col-span-2 p-8 bg-slate-50 rounded-3xl border border-slate-200/80 hover:border-emerald-300 transition-all flex flex-col justify-between group relative overflow-hidden">
              <div className="space-y-4 max-w-lg z-10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <QrCode className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-2xl">
                  Scan & Commande QR ultra-rapide
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Generés par table, vos QR Codes offrent un menu interactif haute définition. Les clients commandent en autonomie, choisissent leurs options de cuisson et ajoutent des compléments en quelques clics.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-200/60 flex items-center gap-4 text-xs font-bold text-slate-500">
                <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-emerald-600" /> +30% de panier moyen</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-emerald-600" /> -8 min d&apos;attente</span>
              </div>
            </div>

            {/* Bento 2: KDS Kitchen */}
            <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200/80 hover:border-emerald-300 transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <ChefHat className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-xl">Kanban Cuisine Dedicated</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Fini le papier. Les tickets arrivent instantanément en cuisine avec les alertes de cuisson et demandes particulières.
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-xs font-mono text-slate-600">
                En attente ➔ En prépa ➔ Prêt
              </div>
            </div>

            {/* Bento 3: Floor & Waiter Call */}
            <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200/80 hover:border-emerald-300 transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <ConciergeBell className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-xl">Appels & Demandes d&apos;addition</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Notifications sonores et visuelles instantanées sur la tablette serveur lors d&apos;un appel table ou d&apos;un règlement.
                </p>
              </div>
              <span className="inline-block text-xs font-bold text-blue-600">
                Réactivité accrue du personnel →
              </span>
            </div>

            {/* Bento 4: Large Analytics Box */}
            <div className="md:col-span-2 p-8 bg-slate-900 text-white rounded-3xl border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-4 max-w-lg z-10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-white text-2xl">
                  Analytics & Dynamic Multi-Tenant
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Chaque établissement profite d&apos;une étanchéité parfaite de ses données. Suivez vos ventes globales, plats les plus rentables et heures de pointe en temps réel.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-4 text-xs font-bold text-emerald-400">
                <span className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                  <TrendingUp className="w-4 h-4" /> Rapport de Ventes Direct
                </span>
                <span className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                  <ShieldCheck className="w-4 h-4" /> Sécurité des données
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Workflows Section */}
      <section id="workflows" className="py-24 bg-slate-100/60 border-t border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Parcours par Métier
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-4">
              Chaque acteur a son interface sur mesure
            </h2>
            <p className="text-slate-600 mt-2 text-base">
              Sélectionnez un rôle pour explorer l&apos;ergonomie dédiée de la plateforme.
            </p>
          </div>

          {/* Workflow Pill Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10 bg-slate-200/70 p-1.5 rounded-2xl max-w-fit mx-auto border border-slate-300/50">
            <button
              onClick={() => setActiveTab("client")}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === "client"
                  ? "bg-white text-emerald-700 shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Smartphone className="w-4 h-4" /> Client (Scan QR)
            </button>

            <button
              onClick={() => setActiveTab("server")}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === "server"
                  ? "bg-white text-emerald-700 shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ConciergeBell className="w-4 h-4" /> Serveur (Salle)
            </button>

            <button
              onClick={() => setActiveTab("kitchen")}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === "kitchen"
                  ? "bg-white text-emerald-700 shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ChefHat className="w-4 h-4" /> Cuisine (Kanban)
            </button>

            <button
              onClick={() => setActiveTab("admin")}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === "admin"
                  ? "bg-white text-emerald-700 shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Building2 className="w-4 h-4" /> Manager / Admin
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xl max-w-4xl mx-auto">
            {activeTab === "client" && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="font-extrabold text-xl text-slate-900 flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-emerald-600" /> Parcours Client sur Table
                  </h3>
                  <Link
                    href="/t/tbl_demo_1"
                    target="_blank"
                    className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                  >
                    Ouvrir l&apos;écran client réel →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                      1
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">Scan du Chevalet</h4>
                    <p className="text-slate-500 leading-relaxed">
                      Le client scanne le QR code présent sur la table sans aucune installation d&apos;application.
                    </p>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                      2
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">Commande en direct</h4>
                    <p className="text-slate-500 leading-relaxed">
                      Consultation de la carte, choix des plats, ajouts de compléments et envoi direct en cuisine.
                    </p>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                      3
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">Suivi & Addition</h4>
                    <p className="text-slate-500 leading-relaxed">
                      Affiche le statut de préparation, permet d&apos;appeler un serveur ou d&apos;appeler la note.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "server" && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="font-extrabold text-xl text-slate-900 flex items-center gap-2">
                    <ConciergeBell className="w-5 h-5 text-blue-600" /> Console Salle & Serveur
                  </h3>
                  <Link
                    href="/staff/floor-map"
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Ouvrir le plan de salle →
                  </Link>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Supervisez en un coup d&apos;œil toutes les tables du restaurant. Les couleurs dynamiques vous indiquent l&apos;état instantané de la salle.
                </p>
                <div className="p-4 bg-blue-50/80 border border-blue-200/80 rounded-2xl text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="font-bold text-blue-900">Identifiants Démo Serveur :</span>
                  <span className="font-mono text-blue-800 bg-white px-3 py-1.5 rounded-lg border border-blue-200 shadow-2xs">
                    serveur@bistro.com / serveurpassword123
                  </span>
                </div>
              </div>
            )}

            {activeTab === "kitchen" && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="font-extrabold text-xl text-slate-900 flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-amber-600" /> Écran Kanban Cuisine
                  </h3>
                  <Link
                    href="/staff/kitchen"
                    className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
                  >
                    Ouvrir l&apos;écran cuisine →
                  </Link>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Vue optimisée pour l&apos;équipe en cuisine. Les tickets s&apos;organisent automatiquement selon l&apos;heure d&apos;arrivée et les priorités.
                </p>
                <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="font-bold text-amber-900">Identifiants Démo Cuisine :</span>
                  <span className="font-mono text-amber-800 bg-white px-3 py-1.5 rounded-lg border border-amber-200 shadow-2xs">
                    cuisine@bistro.com / cuisinepassword123
                  </span>
                </div>
              </div>
            )}

            {activeTab === "admin" && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="font-extrabold text-xl text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-purple-600" /> Administration & Super Admin
                  </h3>
                  <Link
                    href="/admin/dashboard"
                    className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
                  >
                    Ouvrir le dashboard admin →
                  </Link>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Mise à jour immédiate de la carte, des indisponibilités de produits, édition des QR codes et rapports d&apos;activité détaillés.
                </p>
                <div className="p-4 bg-purple-50/80 border border-purple-200/80 rounded-2xl text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="font-bold text-purple-900">Identifiants Démo Manager :</span>
                  <span className="font-mono text-purple-800 bg-white px-3 py-1.5 rounded-lg border border-purple-200 shadow-2xs">
                    admin@bistro.com / bistropassword123
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Tarification Clairs
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-4">
              Zéro commission sur vos ventes
            </h2>
            <p className="mt-4 text-slate-600 text-base sm:text-lg">
              Choisissez la formule adaptée au volume de votre établissement.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Plan 1 */}
            <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Starter</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">49$</span>
                  <span className="text-xs text-slate-500">/ mois</span>
                </div>
                <p className="text-xs text-slate-500">Idéal pour les petits établissements jusqu&apos;à 15 tables.</p>
                <ul className="space-y-3 text-xs text-slate-600 pt-4 border-t border-slate-200">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" /> Jusqu&apos;à 15 tables & QR codes
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" /> Écran Cuisine & Serveur
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" /> Support standard
                  </li>
                </ul>
              </div>
              <Link
                href="/login"
                className="w-full py-3.5 bg-white border border-slate-300 hover:border-emerald-500 text-slate-800 font-bold rounded-xl text-xs text-center transition-all block shadow-2xs"
              >
                Démarrer l&apos;essai gratuit
              </Link>
            </div>

            {/* Plan 2 - Featured */}
            <div className="p-8 bg-slate-900 text-white rounded-3xl border-2 border-emerald-500 flex flex-col justify-between space-y-6 relative shadow-2xl scale-[1.02]">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-full shadow-md">
                Recommandé
              </div>
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Pro Restaurant</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">89$</span>
                  <span className="text-xs text-slate-400">/ mois</span>
                </div>
                <p className="text-xs text-slate-300">Pour les brasseries et restaurants à fort volume.</p>
                <ul className="space-y-3 text-xs text-slate-300 pt-4 border-t border-slate-800">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" /> Tables & QR codes illimités
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" /> Dashboard Analytics & Chiffre d&apos;affaires
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" /> Alertes sonores temps réel
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" /> Support prioritaire 7j/7
                  </li>
                </ul>
              </div>
              <Link
                href="/login"
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs text-center transition-all block shadow-lg shadow-emerald-500/25"
              >
                Tester gratuitement 14 jours
              </Link>
            </div>

            {/* Plan 3 */}
            <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Multi-Enseignes</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">Sur devis</span>
                </div>
                <p className="text-xs text-slate-500">Pour les groupes de restauration et franchises multi-tenant.</p>
                <ul className="space-y-3 text-xs text-slate-600 pt-4 border-t border-slate-200">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" /> Console Super-Admin centralisée
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" /> Gestion multi-établissements
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" /> Account Manager dédié
                  </li>
                </ul>
              </div>
              <Link
                href="/login"
                className="w-full py-3.5 bg-white border border-slate-300 hover:border-emerald-500 text-slate-800 font-bold rounded-xl text-xs text-center transition-all block shadow-2xs"
              >
                Contacter l&apos;équipe commerciale
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Call to Action Banner */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Prêt à moderniser le service de votre restaurant ?
          </h2>
          <p className="mt-4 text-emerald-100 text-base max-w-xl mx-auto">
            Testez immédiatement notre démo interactive ou configurez votre compte en moins de 5 minutes.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/login"
              className="px-8 py-4 bg-white text-emerald-950 font-bold rounded-xl text-sm shadow-xl hover:bg-emerald-50 active:scale-95 transition-all"
            >
              Se Connecter & Tester
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <span className="text-white font-bold text-sm tracking-tight">Ordena SaaS Multi-Tenant</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <Link href="/login" className="hover:text-white transition-colors">Connexion Staff</Link>
            <Link href="/admin/tables" className="hover:text-white transition-colors">Gestion QR</Link>
            <Link href="/staff/floor-map" className="hover:text-white transition-colors">Plan de Salle</Link>
            <Link href="/super-admin/dashboard" className="hover:text-white transition-colors">Super Admin</Link>
          </div>

          <p>© {new Date().getFullYear()} Ordena. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}