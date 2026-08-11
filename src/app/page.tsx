"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  QrCode,
  UtensilsCrossed,
  Receipt,
  Building2,
  BarChart3,
  Star,
  Check,
  X,
  ArrowRight,
  Menu,
  ChefHat,
  Flame,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans flex flex-col selection:bg-emerald-600 selection:text-white antialiased overflow-x-hidden">
      {/* 1. Sticky Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <Image
              src="/logo_desk.png"
              width={200}
              height={50}
              alt="Ordena"
              priority
              className="w-auto h-7 sm:h-8 transition-transform group-hover:scale-[1.02]"
            />
          </Link>

          {/* Desktop Anchor Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a
              href="#comparatif"
              className="hover:text-emerald-600 transition-colors py-1"
            >
              Sans / Avec Ordena
            </a>
            <a
              href="#fonctionnalites"
              className="hover:text-emerald-600 transition-colors py-1"
            >
              Fonctionnalités
            </a>
            <a
              href="#comment-ca-marche"
              className="hover:text-emerald-600 transition-colors py-1"
            >
              Comment ça marche
            </a>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-emerald-600 transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2.5 rounded-full text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20 active:scale-95 transition-all inline-flex items-center gap-1.5"
            >
              <span>Créer mon compte</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              href="/signup"
              className="px-3.5 py-2 rounded-full text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm"
            >
              Créer un compte
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 shadow-lg">
            <a
              href="#comparatif"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-700 hover:text-emerald-600"
            >
              Sans / Avec Ordena
            </a>
            <a
              href="#fonctionnalites"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-700 hover:text-emerald-600"
            >
              Fonctionnalités
            </a>
            <a
              href="#comment-ca-marche"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-700 hover:text-emerald-600"
            >
              Comment ça marche
            </a>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Connexion
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-emerald-600 text-sm font-bold text-white shadow-md shadow-emerald-600/20"
              >
                Créer mon compte gratuitement
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-32 bg-[#fafafa]">
        {/* Subtle grid background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-xs font-semibold mb-6 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>La plateforme tout-en-un pour restaurants modernes</span>
          </div>

          {/* Hero Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.12]">
            Le service de salle qui tourne tout seul.
          </h1>

          {/* Hero Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            QR code à table, commandes envoyées en cuisine en temps réel, additions réglées sans faire attendre personne. La plateforme tout-en-un pour restaurants modernes.
          </p>

          {/* Hero CTAs */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md mx-auto">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-600/25 active:scale-95 transition-all text-center"
            >
              Créer mon compte gratuitement
            </Link>
            <a
              href="#comment-ca-marche"
              className="w-full sm:w-auto px-7 py-4 rounded-full text-base font-semibold bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 transition-all text-center shadow-2xs"
            >
              Voir comment ça marche
            </a>
          </div>

          {/* Key micro-benefits */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Sans engagement ni carte bancaire</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Prêt en 2 minutes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Aucune application à installer pour le client</span>
            </div>
          </div>

          {/* Hero Browser Mockup — Real Ordena Dashboard UI */}
          <div className="mt-14 sm:mt-18 max-w-5xl mx-auto text-left">
            <div className="rounded-2xl sm:rounded-3xl bg-slate-900/5 p-2 sm:p-3 ring-1 ring-slate-900/10 shadow-2xl backdrop-blur-xs">
              <div className="rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-xs">
                {/* Browser Top Window Bar */}
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
                    <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
                  </div>

                  {/* Browser Address Bar */}
                  <div className="flex-1 max-w-md mx-auto hidden sm:flex items-center justify-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-500 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>https://ordena.app/admin/dashboard</span>
                  </div>

                  <div className="text-[11px] font-bold text-slate-400 shrink-0">
                    Live Demo
                  </div>
                </div>

                {/* Dashboard Frame Content */}
                <div className="flex bg-[#fafafa]">
                  {/* Mockup Sidebar */}
                  <aside className="w-48 lg:w-56 bg-white border-r border-slate-200/80 p-4 hidden md:flex flex-col justify-between shrink-0">
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 px-1">
                        <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                          <UtensilsCrossed className="w-4 h-4" />
                        </div>
                        <span className="font-extrabold text-sm tracking-tight text-slate-900">Ordena</span>
                      </div>

                      <nav className="space-y-1">
                        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs">
                          <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                          <span>Tableau de bord</span>
                        </div>
                        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 font-medium text-xs hover:bg-slate-50">
                          <UtensilsCrossed className="w-4 h-4 text-slate-400" />
                          <span>Menu & Catégories</span>
                        </div>
                        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 font-medium text-xs hover:bg-slate-50">
                          <ChefHat className="w-4 h-4 text-slate-400" />
                          <span>Commandes & Cuisine</span>
                        </div>
                        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 font-medium text-xs hover:bg-slate-50">
                          <QrCode className="w-4 h-4 text-slate-400" />
                          <span>Tables & QR</span>
                        </div>
                        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 font-medium text-xs hover:bg-slate-50">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span>Utilisateurs</span>
                        </div>
                        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 font-medium text-xs hover:bg-slate-50">
                          <Settings className="w-4 h-4 text-slate-400" />
                          <span>Paramètres</span>
                        </div>
                      </nav>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center gap-2 px-1">
                      <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                        M
                      </div>
                      <div className="text-[11px] leading-tight">
                        <p className="font-bold text-slate-900 truncate">Marc Dubreuil</p>
                        <p className="text-slate-400">Admin Restaurant</p>
                      </div>
                    </div>
                  </aside>

                  {/* Mockup Main Dashboard Area */}
                  <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
                    {/* Header inside mockup */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Espace Restaurant
                          </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Analytique</h3>
                        <p className="text-xs text-slate-500">Vue d&apos;ensemble du chiffre d&apos;affaires, des heures de rush et des performances</p>
                      </div>

                      {/* Timeframe selector pill */}
                      <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600 self-start sm:self-auto">
                        <span className="px-2.5 py-1 text-slate-500">Aujourd&apos;hui</span>
                        <span className="px-2.5 py-1 bg-white text-slate-900 rounded-lg shadow-2xs font-bold">7 derniers jours</span>
                        <span className="px-2.5 py-1 text-slate-500 hidden sm:inline">30 jours</span>
                      </div>
                    </div>

                    {/* 3 KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
                      {/* KPI 1 */}
                      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between text-slate-500">
                          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Chiffre d&apos;affaires</span>
                          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                            <BarChart3 className="w-3.5 h-3.5" />
                          </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">71.50 €</p>
                        <p className="text-[11px] text-slate-400">Sur 1 additions réglées</p>
                      </div>

                      {/* KPI 2 */}
                      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between text-slate-500">
                          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Panier moyen (ticket)</span>
                          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                            <Receipt className="w-3.5 h-3.5" />
                          </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">71.50 €</p>
                        <p className="text-[11px] text-slate-400">Montant moyen dépensé par table</p>
                      </div>

                      {/* KPI 3 */}
                      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between text-slate-500">
                          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Total commandes</span>
                          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                            <UtensilsCrossed className="w-3.5 h-3.5" />
                          </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">1</p>
                        <p className="text-[11px] text-slate-400">Commandes enregistrées en salle</p>
                      </div>
                    </div>

                    {/* Chart / Rush hours section */}
                    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900">Analyse des Heures de Rush</h4>
                          <p className="text-xs text-slate-400">Nombre de commandes passées par tranche horaire (00h - 23h)</p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold self-start sm:self-auto">
                          <Flame className="w-3 h-3 text-amber-600" />
                          Pic d&apos;affluence en ambre foncé
                        </span>
                      </div>

                      {/* Bar chart mockup */}
                      <div className="pt-2">
                        <div className="h-28 flex items-end gap-1.5 sm:gap-2.5 border-b border-slate-100 pb-2">
                          {[
                            { hour: "11h", val: 15 },
                            { hour: "12h", val: 65 },
                            { hour: "13h", val: 95, peak: true },
                            { hour: "14h", val: 40 },
                            { hour: "15h", val: 10 },
                            { hour: "18h", val: 20 },
                            { hour: "19h", val: 75 },
                            { hour: "20h", val: 100, peak: true },
                            { hour: "21h", val: 80 },
                            { hour: "22h", val: 35 },
                          ].map((bar, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                              <div
                                style={{ height: `${bar.val}%` }}
                                className={`w-full rounded-t-md transition-all ${
                                  bar.peak
                                    ? "bg-amber-500"
                                    : "bg-emerald-500/80 group-hover:bg-emerald-500"
                                }`}
                              />
                              <span className="text-[10px] font-semibold text-slate-400">
                                {bar.hour}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </main>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Section "Sans Ordena / Avec Ordena" (Deux colonnes) */}
      <section id="comparatif" className="py-20 sm:py-28 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2 block">
              Comparatif concret
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Pourquoi changer maintenant ?
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600">
              Découvrez la différence immédiate sur votre chiffre d&apos;affaires et la fluidité de votre équipe en salle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {/* Colonne 1: Sans Ordena */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                    <X className="w-4 h-4 stroke-[3]" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">Sans Ordena</h3>
                </div>
                <p className="text-xs text-slate-500">
                  Les frictions habituelles du service traditionnel en restauration.
                </p>

                <ul className="space-y-4 pt-4 border-t border-slate-200/80">
                  <li className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                    <div className="p-1 rounded-md bg-rose-50 text-rose-500 shrink-0 mt-0.5">
                      <X className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span>Serveurs débordés aux heures de rush</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                    <div className="p-1 rounded-md bg-rose-50 text-rose-500 shrink-0 mt-0.5">
                      <X className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span>Clients qui attendent pour commander ou payer</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                    <div className="p-1 rounded-md bg-rose-50 text-rose-500 shrink-0 mt-0.5">
                      <X className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span>Aucune vue sur les plats qui marchent vraiment</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                    <div className="p-1 rounded-md bg-rose-50 text-rose-500 shrink-0 mt-0.5">
                      <X className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span>Erreurs de commande à l&apos;oral</span>
                  </li>
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 italic">
                Résultat : rotation de tables ralentie, stress en salle et perte de revenus aux heures de pointe.
              </div>
            </div>

            {/* Colonne 2: Avec Ordena */}
            <div className="p-6 sm:p-8 rounded-3xl bg-emerald-50/40 border-2 border-emerald-500/60 shadow-lg shadow-emerald-600/5 flex flex-col justify-between space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-4 py-1.5 bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider rounded-bl-2xl">
                Recommandé
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">Avec Ordena</h3>
                </div>
                <p className="text-xs text-slate-600">
                  Un flux continu et automatisé de la prise de commande à l&apos;addition.
                </p>

                <ul className="space-y-4 pt-4 border-t border-emerald-200/60">
                  <li className="flex items-start gap-3 text-sm text-slate-900 font-semibold">
                    <div className="p-1 rounded-md bg-emerald-500 text-white shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span>Commande passée en moins de 30 secondes depuis la table</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-900 font-semibold">
                    <div className="p-1 rounded-md bg-emerald-500 text-white shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span>Cuisine et service synchronisés en temps réel</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-900 font-semibold">
                    <div className="p-1 rounded-md bg-emerald-500 text-white shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span>Tableau de bord sur vos plats les plus vendus et les mieux notés</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-900 font-semibold">
                    <div className="p-1 rounded-md bg-emerald-500 text-white shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span>Zéro erreur, zéro carnet papier</span>
                  </li>
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 text-xs font-semibold text-emerald-900">
                Gain mesuré : +28% de rotation de tables et des pourboires en hausse pour votre personnel.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Section Fonctionnalités (Grille de 6 cartes avec icônes) */}
      <section id="fonctionnalites" className="py-20 sm:py-28 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2 block">
              Fonctionnalités Clés
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Tout ce dont votre restaurant a besoin
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600">
              Des outils simples, puissants et connectés pour piloter votre salle et régaler vos clients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Carte 1 */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-emerald-500/30 transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Commande par QR code</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Le client scanne, commande, c&apos;est parti. Aucun téléchargement requis, compatible avec tous les smartphones.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center text-xs font-bold text-emerald-600">
                <span>Sans friction client</span>
              </div>
            </div>

            {/* Carte 2 */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-emerald-500/30 transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UtensilsCrossed className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Cuisine & service en temps réel</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Chaque commande arrive instantanément là où il faut. L&apos;écran cuisine KDS classe par priorité sans aucun retard.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center text-xs font-bold text-emerald-600">
                <span>Synchronisation live</span>
              </div>
            </div>

            {/* Carte 3 */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-emerald-500/30 transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Receipt className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Additions & paiement</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Le client demande l&apos;addition en un clic, le serveur encaisse rapidement ou le règlement se fait en direct.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center text-xs font-bold text-emerald-600">
                <span>Zéro attente en fin de repas</span>
              </div>
            </div>

            {/* Carte 4 */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-emerald-500/30 transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Multi-établissements</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Gérez plusieurs restaurants depuis un seul compte. Basculez d&apos;une enseigne à l&apos;autre en un clic sans friction.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center text-xs font-bold text-emerald-600">
                <span>Architecture Multi-Tenant</span>
              </div>
            </div>

            {/* Carte 5 */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-emerald-500/30 transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Tableau de bord analytique</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Chiffre d&apos;affaires, heures de rush, plats les mieux notés. Prenez des décisions rentables basées sur vos chiffres.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center text-xs font-bold text-emerald-600">
                <span>Indicateurs en direct</span>
              </div>
            </div>

            {/* Carte 6 */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-emerald-500/30 transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Star className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Notation des plats</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Vos clients notent, vous savez quoi mettre en avant. Optimisez votre carte en continu selon les retours vérifiés.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center text-xs font-bold text-emerald-600">
                <span>Satisfaction client mesurée</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Section "Comment ça marche" (4 étapes numérotées, style nordevagency) */}
      <section id="comment-ca-marche" className="py-20 sm:py-28 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2 block">
              Processus simple
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Comment ça marche
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600">
              Démarrez en quelques minutes, sans matériel spécifique ni formation complexe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Step 01 */}
            <div className="space-y-4 p-6 rounded-3xl bg-slate-50 border border-slate-200/70 relative">
              <span className="text-4xl sm:text-5xl font-black text-emerald-600 block tracking-tight">
                01.
              </span>
              <h3 className="text-lg font-extrabold text-slate-900">Créez votre compte</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                2 minutes, sans carte bancaire. Vous obtenez un espace restaurant dédié et sécurisé.
              </p>
            </div>

            {/* Step 02 */}
            <div className="space-y-4 p-6 rounded-3xl bg-slate-50 border border-slate-200/70 relative">
              <span className="text-4xl sm:text-5xl font-black text-emerald-600 block tracking-tight">
                02.
              </span>
              <h3 className="text-lg font-extrabold text-slate-900">Ajoutez votre menu</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Catégories, plats, prix, photos. Modifiez vos disponibilités et tarifs en temps réel.
              </p>
            </div>

            {/* Step 03 */}
            <div className="space-y-4 p-6 rounded-3xl bg-slate-50 border border-slate-200/70 relative">
              <span className="text-4xl sm:text-5xl font-black text-emerald-600 block tracking-tight">
                03.
              </span>
              <h3 className="text-lg font-extrabold text-slate-900">Imprimez vos QR codes</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Un par table, générés automatiquement. Téléchargez-les en PDF prêts pour chevalets ou stickers.
              </p>
            </div>

            {/* Step 04 */}
            <div className="space-y-4 p-6 rounded-3xl bg-slate-50 border border-slate-200/70 relative">
              <span className="text-4xl sm:text-5xl font-black text-emerald-600 block tracking-tight">
                04.
              </span>
              <h3 className="text-lg font-extrabold text-slate-900">Vos clients commandent</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Vous supervisez tout depuis votre tableau de bord. Cuisine, salle et encaissement restent synchronisés.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Section "Conçu pour les restaurants" */}
      <section className="py-20 sm:py-28 bg-[#fafafa]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-100 text-emerald-800 mb-2">
            <UtensilsCrossed className="w-8 h-8 text-emerald-600" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight max-w-3xl mx-auto leading-tight">
            Conçu pour les restaurants qui veulent un service fluide, de la commande à l&apos;addition.
          </h2>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Offrez à vos clients une expérience moderne et sans friction, tout en libérant votre personnel pour ce qui compte vraiment : l&apos;accueil, le conseil et le plaisir du service.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="px-8 py-4 rounded-full text-base font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
            >
              Démarrer gratuitement maintenant
            </Link>
          </div>
        </div>
      </section>

      {/* 7. CTA Final */}
      <section className="py-20 sm:py-24 bg-slate-900 text-white text-center relative overflow-hidden">
        {/* Subtle glow circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Prêt à moderniser le service de votre restaurant ?
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto font-normal leading-relaxed">
            Créez votre compte en moins de 2 minutes et testez immédiatement la commande QR code avec vos premières tables.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
            >
              Créer mon compte gratuitement
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 active:scale-95 transition-all"
            >
              Se Connecter
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="bg-slate-950 text-slate-400 py-14 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <span className="text-white font-bold text-base tracking-tight">Ordena</span>
            </Link>

            <nav className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-400">
              <a href="#comparatif" className="hover:text-white transition-colors">
                Sans / Avec Ordena
              </a>
              <a href="#fonctionnalites" className="hover:text-white transition-colors">
                Fonctionnalités
              </a>
              <a href="#comment-ca-marche" className="hover:text-white transition-colors">
                Comment ça marche
              </a>
              <Link href="/login" className="hover:text-white transition-colors">
                Connexion Staff
              </Link>
              <Link href="/signup" className="hover:text-white transition-colors">
                Créer un compte
              </Link>
            </nav>
          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>© {new Date().getFullYear()} Ordena. Plateforme de commande en salle par QR Code. Tous droits réservés.</p>
            <div className="flex items-center gap-4">
              <span>Mentions légales</span>
              <span>•</span>
              <span>Politique de confidentialité</span>
              <span>•</span>
              <span>Sécurité des données</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
