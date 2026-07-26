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
} from "lucide-react";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"client" | "kitchen" | "server" | "admin">("client");

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* 1. Header / Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src={"/logo_desk.png"}
              width={250}
              height={250}
              alt="logo desktop"
              className="w-auto h-9"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
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
              className="px-4 py-2 text-sm font-bold text-gray-700 hover:text-emerald-600 transition-colors"
            >
              Se Connecter
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition-all hover:shadow-md"
            >
              Essai Gratuit 14j
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden bg-gradient-to-b from-emerald-50/40 via-gray-50 to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-900 text-xs font-bold mb-8 animate-in fade-in slide-in-from-bottom-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>SaaS Restaurant Multi-Tenant Nouvelle Génération</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Commande sur table par <span className="text-emerald-600 underline decoration-emerald-300 decoration-wavy">QR Code</span> & gestion de service fluide
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Permettez à vos clients de commander et de régler directement depuis leur table sans télécharger d&apos;application, tout en synchronisant automatiquement la cuisine et le service en salle.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 transition-all text-base flex items-center justify-center gap-2 group"
            >
              <span>Accéder aux Démos (Se Connecter)</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/t/tbl_demo_1"
              target="_blank"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-white text-gray-800 border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all text-base flex items-center justify-center gap-2 shadow-xs"
            >
              <QrCode className="w-5 h-5 text-emerald-600" />
              <span>Tester le Scan Client (Table 1)</span>
            </Link>
          </div>

          {/* Social Proof / Stats Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Isolation Multi-Tenant Complète</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Zéro Application à Installer</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Mise à jour en temps réel (Polling 4s)</span>
            </div>
          </div>

          {/* Visual Showcase Box */}
          <div className="mt-14 max-w-5xl mx-auto bg-white rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-200/80 text-left">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400"></span>
                <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                <span className="text-xs text-gray-400 font-mono ml-2">app.ordena-saas.com / bistro-gourmet</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                ● En direct
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Card 1: Floor map preview */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600" /> Plan de Salle
                  </span>
                  <span className="text-emerald-600">4 Tables</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-emerald-100/60 border border-emerald-200 rounded-lg text-xs">
                    <p className="font-bold text-emerald-900">Table 1</p>
                    <span className="text-[10px] text-emerald-700">Disponible</span>
                  </div>
                  <div className="p-3 bg-blue-100/60 border border-blue-200 rounded-lg text-xs">
                    <p className="font-bold text-blue-900">Table 2</p>
                    <span className="text-[10px] text-blue-700">Occupée (2 plats)</span>
                  </div>
                  <div className="p-3 bg-amber-100/60 border border-amber-200 rounded-lg text-xs">
                    <p className="font-bold text-amber-900">Table 3</p>
                    <span className="text-[10px] text-amber-700 font-bold animate-pulse">Appel Serveur</span>
                  </div>
                  <div className="p-3 bg-emerald-100/60 border border-emerald-200 rounded-lg text-xs">
                    <p className="font-bold text-emerald-900">Table VIP</p>
                    <span className="text-[10px] text-emerald-700">Disponible</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Kitchen Kanban preview */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                  <span className="flex items-center gap-1.5">
                    <ChefHat className="w-4 h-4 text-amber-600" /> Écran Cuisine
                  </span>
                  <span className="text-amber-600">2 En cours</span>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 bg-white border border-gray-200 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>#104 - Table 2 (Marc)</span>
                      <span className="text-amber-600">En prépa</span>
                    </div>
                    <p className="text-[11px] text-gray-500">1x Burger Artisan, 1x Entrecôte</p>
                  </div>
                  <div className="p-2.5 bg-white border border-gray-200 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>#105 - Table 3 (Julie)</span>
                      <span className="text-blue-600">En attente</span>
                    </div>
                    <p className="text-[11px] text-gray-500">2x Salade Burrata</p>
                  </div>
                </div>
              </div>

              {/* Card 3: Mobile Client preview */}
              <div className="bg-emerald-900 text-white p-4 rounded-xl space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-emerald-300">
                      <Smartphone className="w-4 h-4" /> Vue Client Scan QR
                    </span>
                    <span className="text-[10px] bg-emerald-800 px-2 py-0.5 rounded text-emerald-200">Mobile</span>
                  </div>
                  <div className="mt-3 bg-emerald-800/80 p-3 rounded-lg text-xs space-y-2 border border-emerald-700">
                    <p className="font-bold text-white">Le Bistro Gourmet — Table 1</p>
                    <p className="text-[11px] text-emerald-200">Scannez, commandez vos boissons et vos plats en 30 secondes sans attendre.</p>
                  </div>
                </div>
                <Link
                  href="/t/tbl_demo_1"
                  target="_blank"
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-lg text-xs text-center transition-colors block"
                >
                  Tester la commande Table 1 →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2">
              Fonctionnalités Clés
            </h2>
            <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Tout ce dont votre établissement a besoin pour booster sa rentabilité
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-emerald-200 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Scan & Commande QR</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                QR Codes uniques par table. Vos clients parcourent le menu, sélectionnent leurs choix et envoient leur commande en cuisine sans attente.
              </p>
            </div>

            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-emerald-200 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <ChefHat className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Kanban Cuisine dédié</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Les chefs voient instantanément les commandes triées par ordre d&apos;arrivée. Marquez les plats &quot;En préparation&quot; puis &quot;Prêt&quot; en 1 clic.
              </p>
            </div>

            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-emerald-200 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                <ConciergeBell className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Appels & Demandes d&apos;addition</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Les serveurs reçoivent une alerte sonore et visuelle dès qu&apos;une table demande de l&apos;aide ou réclame l&apos;addition.
              </p>
            </div>

            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-emerald-200 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Analytics & Multi-Tenant</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Suivez votre chiffre d&apos;affaires, le panier moyen, les heures de rush et le classement des plats les plus populaires.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Workflows Section */}
      <section id="workflows" className="py-20 bg-gray-50 border-t border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2">
              Démos & Parcours par Rôle
            </h2>
            <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Une expérience sur mesure pour chaque acteur du restaurant
            </p>
          </div>

          {/* Workflow Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <button
              onClick={() => setActiveTab("client")}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === "client"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Smartphone className="w-4 h-4" /> Client (Scan QR)
            </button>

            <button
              onClick={() => setActiveTab("server")}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === "server"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              <ConciergeBell className="w-4 h-4" /> Serveur (Plan & Appels)
            </button>

            <button
              onClick={() => setActiveTab("kitchen")}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === "kitchen"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              <ChefHat className="w-4 h-4" /> Cuisine (Kanban)
            </button>

            <button
              onClick={() => setActiveTab("admin")}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === "admin"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Building2 className="w-4 h-4" /> Manager / Admin
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm max-w-4xl mx-auto">
            {activeTab === "client" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
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
                  <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center">1</div>
                    <h4 className="font-bold text-gray-900">Scan QR Code</h4>
                    <p className="text-gray-500">Le client pointe son smartphone vers le chevalet de table sans installer d&apos;application.</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center">2</div>
                    <h4 className="font-bold text-gray-900">Choix & Panier</h4>
                    <p className="text-gray-500">Il consulte la carte illustrée, choisit ses plats et saisit son prénom pour lancer la commande.</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center">3</div>
                    <h4 className="font-bold text-gray-900">Suivi & Services</h4>
                    <p className="text-gray-500">Suivi en direct du temps estimé, bouton &quot;Appeler le serveur&quot; et &quot;Addition&quot; en 1 clic.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "server" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                    <ConciergeBell className="w-5 h-5 text-blue-600" /> Console Serveur en Salle
                  </h3>
                  <Link
                    href="/staff/floor-map"
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Ouvrir le plan de salle →
                  </Link>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Supervisez en coup d&apos;œil toutes les tables du restaurant. Les pastilles de couleurs vous indiquent instantanément les tables libres (vert), occupées (bleu), ou en attente d&apos;un serveur / de l&apos;addition (ambre et rouge).
                </p>
                <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-xl text-xs flex items-center justify-between">
                  <span className="font-bold text-blue-900">Connexion démo Serveur :</span>
                  <span className="font-mono text-blue-800 bg-white px-2 py-1 rounded border border-blue-200">
                    serveur@bistro.com / serveurpassword123
                  </span>
                </div>
              </div>
            )}

            {activeTab === "kitchen" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-amber-600" /> Écran Kanban Cuisine
                  </h3>
                  <Link
                    href="/staff/kitchen"
                    className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
                  >
                    Ouvrir l&apos;écran cuisine →
                  </Link>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Finies les fiches papier perdues ou mal lisibles ! Les chefs reçoivent les commandes sur un tableau Kanban clair, triées par ordre d&apos;arrivée.
                </p>
                <div className="p-4 bg-amber-50/60 border border-amber-100 rounded-xl text-xs flex items-center justify-between">
                  <span className="font-bold text-amber-900">Connexion démo Cuisine :</span>
                  <span className="font-mono text-amber-800 bg-white px-2 py-1 rounded border border-amber-200">
                    cuisine@bistro.com / cuisinepassword123
                  </span>
                </div>
              </div>
            )}

            {activeTab === "admin" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-purple-600" /> Administration Restaurant & Super Admin
                  </h3>
                  <Link
                    href="/admin/dashboard"
                    className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
                  >
                    Ouvrir le dashboard admin →
                  </Link>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Gérez le menu (plats, prix, disponibilité en rupture), générez les QR codes imprimables par table et consultez vos métriques de ventes en temps réel. Le Super Admin peut quant à lui créer et gérer plusieurs établissements en parallèle.
                </p>
                <div className="p-4 bg-purple-50/60 border border-purple-100 rounded-xl text-xs flex items-center justify-between">
                  <span className="font-bold text-purple-900">Connexion démo Manager :</span>
                  <span className="font-mono text-purple-800 bg-white px-2 py-1 rounded border border-purple-200">
                    admin@bistro.com / bistropassword123
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2">
              Tarifs Transparents
            </h2>
            <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Une formule simple sans commission sur vos commandes
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Plan 1 */}
            <div className="p-8 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Starter</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-gray-900">49€</span>
                  <span className="text-xs text-gray-500">/ mois</span>
                </div>
                <p className="text-xs text-gray-500">Idéal pour les petits établissements jusqu&apos;à 15 tables.</p>
                <ul className="space-y-2.5 text-xs text-gray-600 pt-4 border-t border-gray-200">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Jusqu&apos;à 15 tables & QR codes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Écran Cuisine & Serveur
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Support par email
                  </li>
                </ul>
              </div>
              <Link
                href="/login"
                className="w-full py-3 bg-white border border-gray-300 hover:border-emerald-500 text-gray-800 font-bold rounded-xl text-xs text-center transition-colors block"
              >
                Démarrer l&apos;essai gratuit
              </Link>
            </div>

            {/* Plan 2 - Recommended */}
            <div className="p-8 bg-emerald-900 text-white rounded-2xl border-2 border-emerald-600 flex flex-col justify-between space-y-6 relative shadow-xl">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-emerald-950 text-[10px] font-black uppercase tracking-widest rounded-full">
                Le Plus Populaire
              </div>
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Pro Restaurant</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">89€</span>
                  <span className="text-xs text-emerald-200">/ mois</span>
                </div>
                <p className="text-xs text-emerald-100">Pour les restaurants et brasseries à fort volume.</p>
                <ul className="space-y-2.5 text-xs text-emerald-100 pt-4 border-t border-emerald-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Tables & QR codes illimités
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Dashboard Analytics & Chiffre d&apos;affaires
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Alertes sonores & temps réel
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Support prioritaire 7j/7
                  </li>
                </ul>
              </div>
              <Link
                href="/login"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-xl text-xs text-center transition-colors block"
              >
                Tester gratuitement 14 jours
              </Link>
            </div>

            {/* Plan 3 */}
            <div className="p-8 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Multi-Enseignes</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-gray-900">Sur devis</span>
                </div>
                <p className="text-xs text-gray-500">Pour les groupes de restauration et franchises multi-tenant.</p>
                <ul className="space-y-2.5 text-xs text-gray-600 pt-4 border-t border-gray-200">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Console Super-Admin centralisée
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Gestion multi-établissements
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Account Manager dédié
                  </li>
                </ul>
              </div>
              <Link
                href="/login"
                className="w-full py-3 bg-white border border-gray-300 hover:border-emerald-500 text-gray-800 font-bold rounded-xl text-xs text-center transition-colors block"
              >
                Contacter l&apos;équipe commercial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Call to Action Banner */}
      <section className="py-16 bg-emerald-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Prêt à transformer le service de votre restaurant ?
          </h2>
          <p className="mt-4 text-emerald-100 text-sm sm:text-base max-w-xl mx-auto">
            Connectez-vous immédiatement avec nos comptes démo ou initialisez votre espace en 1 clic.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/login"
              className="px-8 py-3.5 bg-white text-emerald-900 font-bold rounded-xl text-sm shadow-md hover:bg-emerald-50 transition-colors"
            >
              Se Connecter & Tester
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
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

          <p>© {new Date().getFullYear()} Ordena SaaS. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
