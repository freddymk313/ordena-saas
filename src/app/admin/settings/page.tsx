"use client";

import React, { useState, useEffect } from "react";
import StatusPill from "@/components/ui-custom/StatusPill";
import {
  Settings,
  Building2,
  Palette,
  Globe,
  CreditCard,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Image as ImageIcon,
} from "lucide-react";

interface TenantSettings {
  _id: string;
  name: string;
  logoUrl: string;
  brandColor: string;
  subscriptionStatus: string;
  createdAt: string;
}

const PRESET_COLORS = [
  { name: "Vert Émeraude", hex: "#059669" },
  { name: "Bleu Océan", hex: "#2563eb" },
  { name: "Violet Royal", hex: "#7c3aed" },
  { name: "Ambre Chaleureux", hex: "#d97706" },
  { name: "Rouge Rubis", hex: "#dc2626" },
];

export default function AdminSettingsPage() {
  const [tenant, setTenant] = useState<TenantSettings | null>(null);
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [brandColor, setBrandColor] = useState("#059669");
  const [timezone, setTimezone] = useState("Europe/Paris");
  const [currency, setCurrency] = useState("EUR (€)");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (res.ok && data.tenant) {
          setTenant(data.tenant);
          setName(data.tenant.name || "");
          setLogoUrl(data.tenant.logoUrl || "");
          setBrandColor(data.tenant.brandColor || "#059669");
        }
      } catch (e) {
        console.error("Error fetching settings:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), logoUrl: logoUrl.trim(), brandColor }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", text: "Paramètres de l'établissement sauvegardés avec succès !" });
        if (data.tenant) setTenant(data.tenant);
      } else {
        setFeedback({ type: "error", text: data.error || "Échec de la sauvegarde" });
      }
    } catch (e) {
      setFeedback({ type: "error", text: "Erreur serveur lors de la sauvegarde" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-600" />
          Paramètres Établissement & Marque
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Personnalisez l&apos;identité visuelle et les configurations globales de votre restaurant.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between animate-in fade-in ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-red-50 border-red-200 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Identité Visuelle */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-gray-900 text-sm">Informations & Logo du Restaurant</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  Nom du Restaurant *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: Le Bistro Gourmet"
                  className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  URL du Logo (Optionnel)
                </label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Ce logo apparaîtra en haut de la sidebar et sur l&apos;écran client QR code.
                </p>
              </div>
            </div>

            {/* Logo Preview */}
            <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <span className="text-[11px] font-bold text-gray-400 uppercase mb-2">Aperçu du Logo</span>
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden shadow-sm border border-gray-200 text-white font-bold text-xl"
                style={{ backgroundColor: brandColor }}
              >
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-white/80" />
                )}
              </div>
              <span className="text-xs font-bold text-gray-700 mt-2">{name || "Nom Restaurant"}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Couleur de Marque */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Palette className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-gray-900 text-sm">Couleur d&apos;Accent de la Marque</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent p-0"
              />
              <input
                type="text"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-28 px-3 py-2 text-xs font-mono font-bold border border-gray-300 rounded-xl uppercase"
              />
              <span className="text-xs text-gray-500">
                Couleur principale des boutons et pastilles sur le menu client.
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">
                Palettes Prédéfinies
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setBrandColor(c.hex)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                      brandColor === c.hex
                        ? "border-gray-900 bg-gray-900 text-white font-bold shadow-xs"
                        : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Localisation & Devise */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Globe className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-gray-900 text-sm">Fuseau Horaire & Monnaie</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                Fuseau Horaire
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
              >
                <option value="Europe/Paris">Europe/Paris (UTC+01:00 / CET)</option>
                <option value="Europe/London">Europe/London (UTC+00:00 / GMT)</option>
                <option value="America/New_York">America/New_York (UTC-05:00 / EST)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                Devise d&apos;Affichage
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
              >
                <option value="EUR (€)">Euro (€)</option>
                <option value="USD ($)">Dollar US ($)</option>
                <option value="GBP (£)">Livre Sterling (£)</option>
                <option value="CHF">Franc Suisse (CHF)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Statut d'Abonnement (Lecture Seule) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-gray-900 text-sm">Statut de l&apos;Abonnement SaaS</h2>
          </div>

          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-900">Formule Activée : Pro Multi-Tenant</p>
              <p className="text-[11px] text-gray-500">
                ID Tenant : <span className="font-mono text-gray-700">{tenant?._id}</span>
              </p>
            </div>
            <StatusPill status={tenant?.subscriptionStatus || "active"} variant="table" />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sauvegarde...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Sauvegarder les modifications</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
