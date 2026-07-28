"use client";

import React, { useState } from "react";
import {
  Store,
  Save,
  Check,
  Sliders,
  DollarSign,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [restaurantName, setRestaurantName] = useState("Mon Bistro Gourmand");
  const [phone, setPhone] = useState("+33 1 42 68 55 00");
  const [address, setAddress] = useState("12 Rue de la Gastronomie, 75001 Paris");
  const [currency, setCurrency] = useState("€");
  const [vatRate, setVatRate] = useState("10");

  const [enableSound, setEnableSound] = useState(true);
  const [enableCallServer, setEnableCallServer] = useState(true);
  const [enableMobileOrders, setEnableMobileOrders] = useState(true);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Paramètres du Restaurant
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Configurez les informations générales de l&apos;établissement, les devises et les règles de commande.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all shrink-0"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>Modifications enregistrées !</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Enregistrement..." : "Enregistrer les paramètres"}</span>
            </>
          )}
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Paramètres mis à jour avec succès. Vos clients verront ces changements immédiatement.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Informations Générales */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-gray-900">Établissement & Coordonnées</h2>
              <p className="text-xs text-gray-500">Nom du restaurant, téléphone et adresse affichés sur l&apos;application client.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                Nom de l&apos;établissement
              </label>
              <input
                type="text"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                Numéro de téléphone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                Adresse postale
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Facturation & Monnaie */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-gray-900">Devise & Fiscalité</h2>
              <p className="text-xs text-gray-500">Unité monétaire et taxe appliquée sur les tickets de caisse.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                Devise d&apos;affichage
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="€">Euro (€)</option>
                <option value="$">Dollar US ($)</option>
                <option value="CHF">Franc Suisse (CHF)</option>
                <option value="CAD">Dollar Canadien (CAD)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                Taux de TVA par défaut (%)
              </label>
              <input
                type="number"
                value={vatRate}
                onChange={(e) => setVatRate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Règles de Commande & Notifications */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-gray-900">Expérience Client & Alertes</h2>
              <p className="text-xs text-gray-500">Fonctionnalités disponibles sur les QR Codes de table.</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/70 border border-gray-200/80 hover:bg-gray-50 cursor-pointer transition-colors">
              <div>
                <span className="font-extrabold text-xs text-gray-900 block">Commandes Mobiles Directes</span>
                <span className="text-xs text-gray-500">Permettre aux clients de passer commande directement depuis leur téléphone.</span>
              </div>
              <input
                type="checkbox"
                checked={enableMobileOrders}
                onChange={(e) => setEnableMobileOrders(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/70 border border-gray-200/80 hover:bg-gray-50 cursor-pointer transition-colors">
              <div>
                <span className="font-extrabold text-xs text-gray-900 block">Bouton Appel Serveur</span>
                <span className="text-xs text-gray-500">Afficher un bouton sur le menu digital pour appeler un serveur à la table.</span>
              </div>
              <input
                type="checkbox"
                checked={enableCallServer}
                onChange={(e) => setEnableCallServer(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/70 border border-gray-200/80 hover:bg-gray-50 cursor-pointer transition-colors">
              <div>
                <span className="font-extrabold text-xs text-gray-900 block">Sonnerie Chime Cuisine</span>
                <span className="text-xs text-gray-500">Émettre un signal sonore lorsqu&apos;une nouvelle commande arrive sur l&apos;écran cuisine.</span>
              </div>
              <input
                type="checkbox"
                checked={enableSound}
                onChange={(e) => setEnableSound(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
              />
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}
