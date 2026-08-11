"use client";

import React, { useState, useEffect } from "react";
import {
  Store,
  Save,
  Check,
  Sliders,
  DollarSign,
  Phone,
  MapPin,
  Percent,
  Coins,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const CURRENCIES = [
  { label: "Euro (€)", value: "€" },
  { label: "Dollar US ($)", value: "$" },
  { label: "Franc Suisse (CHF)", value: "CHF" },
  { label: "Dollar Canadien (CAD)", value: "CAD" },
  { label: "Livre Sterling (£)", value: "£" },
  { label: "Dirham Marocain (MAD)", value: "MAD" },
  { label: "Franc CFA (FCFA)", value: "FCFA" },
];

export default function AdminSettingsPage() {
  // Form states
  const [restaurantName, setRestaurantName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [currency, setCurrency] = useState("€");
  const [vatRate, setVatRate] = useState("10");

  const [enableSound, setEnableSound] = useState(true);
  const [enableCallServer, setEnableCallServer] = useState(true);
  const [enableMobileOrders, setEnableMobileOrders] = useState(true);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch initial settings from DB
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const reload = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const res = await fetch("/api/admin/settings", { method: "GET" });
        if (!res.ok) {
          throw new Error(`Erreur lors du chargement (${res.status})`);
        }
        const data = await res.json();
        if (isMounted && data.tenant) {
          setRestaurantName(data.tenant.name || "");
          setPhone(data.tenant.phone || "");
          setAddress(data.tenant.address || "");
          setCurrency(data.tenant.currency || "€");
          setVatRate(
            data.tenant.taxRate !== undefined && data.tenant.taxRate !== null
              ? String(data.tenant.taxRate)
              : "10"
          );
          setEnableSound(data.tenant.enableSound ?? true);
          setEnableCallServer(data.tenant.enableCallServer ?? true);
          setEnableMobileOrders(data.tenant.enableMobileOrders ?? true);
        }
      } catch (err) {
        console.error("Erreur fetchSettings:", err);
        if (isMounted) {
          setErrorMessage("Impossible de charger les paramètres de l'établissement depuis la base.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSettings();

    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]);

  // Save settings to DB
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantName.trim()) {
      setErrorMessage("Le nom de l'établissement ne peut pas être vide.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);
      setSavedSuccess(false);

      const payload = {
        name: restaurantName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        currency: currency.trim(),
        taxRate: Number(vatRate) || 0,
        enableMobileOrders,
        enableCallServer,
        enableSound,
      };

      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erreur lors de la sauvegarde des paramètres");
      }

      // Synchronize local state with API response returned document
      if (data.tenant) {
        setRestaurantName(data.tenant.name || "");
        setPhone(data.tenant.phone || "");
        setAddress(data.tenant.address || "");
        setCurrency(data.tenant.currency || "€");
        setVatRate(data.tenant.taxRate !== undefined && data.tenant.taxRate !== null ? String(data.tenant.taxRate) : "10");
        setEnableSound(data.tenant.enableSound ?? true);
        setEnableCallServer(data.tenant.enableCallServer ?? true);
        setEnableMobileOrders(data.tenant.enableMobileOrders ?? true);
      }

      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
      }, 4000);
    } catch (err: unknown) {
      console.error("Erreur handleSave:", err);
      const msg = err instanceof Error ? err.message : "Une erreur est survenue lors de l'enregistrement.";
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-12 flex flex-col items-center justify-center space-y-4 min-h-[400px]">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm font-semibold text-gray-500">Chargement des paramètres du restaurant...</p>
      </div>
    );
  }

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
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all shrink-0 cursor-pointer disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Enregistrement en cours...</span>
            </>
          ) : savedSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>Modifications enregistrées !</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Enregistrer les paramètres</span>
            </>
          )}
        </button>
      </div>

      {/* Success Notification */}
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Paramètres mis à jour avec succès en base de données. Vos clients et serveurs verront ces changements immédiatement.</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={reload}
            className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-900 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            Réessayer
          </button>
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
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-gray-400" />
                Nom de l&apos;établissement *
              </label>
              <input
                type="text"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                placeholder="Ex: Le Bistro Gourmet"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                Numéro de téléphone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: +33 1 42 68 55 00"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                Adresse postale
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex: 12 Rue de la Gastronomie, 75001 Paris"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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
              <p className="text-xs text-gray-500">Unité monétaire et taxe appliquée sur les tickets de caisse et menus.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-gray-400" />
                Devise d&apos;affichage
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-500 mt-1">
                Symbole monétaire utilisé pour tous les prix et rapports.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-gray-400" />
                Taux de TVA par défaut (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={vatRate}
                onChange={(e) => setVatRate(e.target.value)}
                placeholder="10"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Taux indicatif appliqué sur les récapitulatifs d&apos;addition.
              </p>
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
              <p className="text-xs text-gray-500">Fonctionnalités disponibles sur les QR Codes de table et alertes équipe.</p>
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
                className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
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
                className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
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
                className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Footer Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Enregistrement en cours...</span>
              </>
            ) : savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Paramètres enregistrés avec succès !</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Enregistrer les paramètres</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
