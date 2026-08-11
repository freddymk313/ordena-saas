"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import QRCode from "qrcode";
import {
  Store,
  UtensilsCrossed,
  QrCode,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Plus,
  Download,
  Printer,
  Sparkles,
  Loader2,
  LogOut,
  Palette,
  Coins,
  MapPin,
  Phone,
  Clock,
  Check,
} from "lucide-react";

interface CategoryData {
  _id: string;
  name: string;
  order?: number;
}

interface ItemData {
  _id: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  description?: string;
  price: number;
  photoUrl?: string;
}

interface TableData {
  _id: string;
  label: string;
  qrToken: string;
  status: string;
}

const BRAND_COLORS = [
  { name: "Émeraude", hex: "#059669", bg: "bg-emerald-600" },
  { name: "Saphir", hex: "#2563eb", bg: "bg-blue-600" },
  { name: "Ambre", hex: "#d97706", bg: "bg-amber-600" },
  { name: "Violet", hex: "#7c3aed", bg: "bg-purple-600" },
  { name: "Rubis", hex: "#e11d48", bg: "bg-rose-600" },
  { name: "Ardoise", hex: "#334155", bg: "bg-slate-700" },
];

const CURRENCIES = [
  { label: "Euro (€)", value: "€" },
  { label: "Dollar ($)", value: "$" },
  { label: "Franc Suisse (CHF)", value: "CHF" },
  { label: "Dollar Canadien (CAD)", value: "CAD" },
  { label: "Livre Sterling (£)", value: "£" },
  { label: "Dirham (MAD)", value: "MAD" },
  { label: "Franc CFA (FCFA)", value: "FCFA" },
];

function OnboardingContent() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Tenant state (Step 1)
  const [restaurantName, setRestaurantName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [brandColor, setBrandColor] = useState("#059669");
  const [currency, setCurrency] = useState("€");
  const [timezone, setTimezone] = useState("Europe/Paris");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  // Categories & Items state (Step 2)
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [items, setItems] = useState<ItemData[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemPhoto, setNewItemPhoto] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [addingItem, setAddingItem] = useState(false);

  // Tables state (Step 3)
  const [tables, setTables] = useState<TableData[]>([]);
  const [newTableLabel, setNewTableLabel] = useState("");
  const [addingTable, setAddingTable] = useState(false);
  const [tableQrMap, setTableQrMap] = useState<Record<string, string>>({});
  const [selectedTableForQr, setSelectedTableForQr] = useState<TableData | null>(null);
  const [modalQrUrl, setModalQrUrl] = useState("");

  const originUrl = typeof window !== "undefined" ? window.location.origin : "";

  // Fetch initial onboarding data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch("/api/onboarding/status");
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        if (!res.ok) {
          throw new Error("Impossible de charger les informations du restaurant");
        }
        const data = await res.json();

        // If already completed, redirect to admin dashboard
        if (data.tenant?.onboardingCompleted) {
          router.replace("/admin/dashboard");
          return;
        }

        setRestaurantName(data.tenant?.name || "Mon restaurant");
        setLogoUrl(data.tenant?.logoUrl || "");
        setBrandColor(data.tenant?.brandColor || "#059669");
        setCurrency(data.tenant?.currency || "€");
        setTimezone(data.tenant?.timezone || "Europe/Paris");
        setAddress(data.tenant?.address || "");
        setPhone(data.tenant?.phone || "");

        setCategories(data.categories || []);
        setItems(data.items || []);
        setTables(data.tables || []);
        if (data.categories?.length > 0) {
          setNewItemCategory(data.categories[0]._id);
        }
      } catch (err) {
        console.error("Error loading onboarding data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  // Generate QR code data URLs for tables
  useEffect(() => {
    async function generateAllQrs() {
      const map: Record<string, string> = {};
      for (const t of tables) {
        try {
          const url = await QRCode.toDataURL(`${originUrl}/t/${t.qrToken}`, {
            width: 250,
            margin: 2,
            color: { dark: brandColor || "#059669", light: "#ffffff" },
          });
          map[t._id] = url;
        } catch (e) {
          console.error("QR gen error:", e);
        }
      }
      setTableQrMap(map);
    }

    if (tables.length > 0) {
      generateAllQrs();
    }
  }, [tables, brandColor, originUrl]);

  // Save Step 1: Restaurant Profile
  const handleSaveStep1 = async () => {
    if (!restaurantName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/onboarding/tenant", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: restaurantName.trim(),
          logoUrl: logoUrl.trim(),
          brandColor,
          currency,
          timezone,
          address: address.trim(),
          phone: phone.trim(),
        }),
      });
      if (res.ok) {
        setStep(2);
      }
    } catch (err) {
      console.error("Error saving step 1:", err);
    } finally {
      setSaving(false);
    }
  };

  // Step 2: Add Category
  const handleAddCategory = async (catNameParam?: string) => {
    const nameToAdd = catNameParam || newCatName;
    if (!nameToAdd.trim()) return;

    setAddingCategory(true);
    try {
      const res = await fetch("/api/admin/menu/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameToAdd.trim() }),
      });
      if (res.ok) {
        const createdCat = await res.json();
        setCategories((prev) => [...prev, createdCat]);
        setNewCatName("");
        if (!newItemCategory) {
          setNewItemCategory(createdCat._id);
        }
      }
    } catch (err) {
      console.error("Add category error:", err);
    } finally {
      setAddingCategory(false);
    }
  };

  // Step 2: Add Dish
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice || !newItemCategory) return;

    setAddingItem(true);
    try {
      const res = await fetch("/api/admin/menu/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: newItemCategory,
          name: newItemName.trim(),
          price: parseFloat(newItemPrice),
          description: newItemDesc.trim(),
          photoUrl: newItemPhoto.trim(),
          available: true,
        }),
      });

      if (res.ok) {
        const createdItem = await res.json();
        setItems((prev) => [createdItem, ...prev]);
        setNewItemName("");
        setNewItemPrice("");
        setNewItemDesc("");
        setNewItemPhoto("");
      }
    } catch (err) {
      console.error("Add item error:", err);
    } finally {
      setAddingItem(false);
    }
  };

  // Step 3: Add Table
  const handleAddTable = async (e?: React.FormEvent, customLabel?: string) => {
    if (e) e.preventDefault();
    const labelToAdd = customLabel || newTableLabel;
    if (!labelToAdd.trim()) return;

    setAddingTable(true);
    try {
      const res = await fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: labelToAdd.trim() }),
      });
      if (res.ok) {
        const createdTable = await res.json();
        setTables((prev) => [...prev, createdTable]);
        setNewTableLabel("");
      }
    } catch (err) {
      console.error("Add table error:", err);
    } finally {
      setAddingTable(false);
    }
  };

  // Step 3: Quick add 3 tables
  const handleQuickAddTables = async () => {
    setAddingTable(true);
    try {
      const nextNum = tables.length + 1;
      for (let i = 0; i < 3; i++) {
        const label = `Table ${nextNum + i}`;
        const res = await fetch("/api/tables", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label }),
        });
        if (res.ok) {
          const created = await res.json();
          setTables((prev) => [...prev, created]);
        }
      }
    } catch (err) {
      console.error("Quick add tables error:", err);
    } finally {
      setAddingTable(false);
    }
  };

  // Step 4: Complete Onboarding
  const handleFinishOnboarding = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
      });
      if (res.ok) {
        await updateSession({ onboardingCompleted: true });
        router.replace("/admin/dashboard");
      }
    } catch (err) {
      console.error("Error completing onboarding:", err);
    } finally {
      setSaving(false);
    }
  };

  const openQrModal = (table: TableData) => {
    setSelectedTableForQr(table);
    setModalQrUrl(tableQrMap[table._id] || "");
  };

  const downloadQrCode = (table: TableData) => {
    const url = tableQrMap[table._id];
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = `QR_${table.label.replace(/\s+/g, "_")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600">Chargement de votre assistant...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/80 font-sans antialiased text-slate-900 selection:bg-emerald-500 selection:text-white flex flex-col">
      {/* Top Header Navigation */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <Image
            src="/logo_desk.png"
            width={140}
            height={38}
            alt="Ordena SaaS"
            className="w-auto h-7"
            priority
          />
          <div className="h-4 w-px bg-slate-200 hidden sm:block" />
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 hidden sm:inline-block">
            Configuration initiale
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-slate-800 block">
              {session?.user?.name || "Admin"}
            </span>
            <span className="text-[11px] text-slate-500">{restaurantName || "Mon restaurant"}</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Se déconnecter"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-slate-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Quitter</span>
          </button>
        </div>
      </header>

      {/* Progress Stepper Bar */}
      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 pt-8 pb-4">
        <div className="grid grid-cols-4 gap-2 sm:gap-4 relative">
          {[
            { num: 1, title: "Profil Restaurant", icon: Store },
            { num: 2, title: "Menu & Plats", icon: UtensilsCrossed },
            { num: 3, title: "Tables & QR", icon: QrCode },
            { num: 4, title: "C'est prêt !", icon: CheckCircle },
          ].map((s) => {
            const isDone = step > s.num;
            const isCurrent = step === s.num;
            const Icon = s.icon;
            return (
              <div
                key={s.num}
                className={`flex flex-col items-center sm:items-start p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? "bg-white border-emerald-500 shadow-sm ring-2 ring-emerald-500/20"
                    : isDone
                    ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                    : "bg-white/60 border-slate-200 text-slate-400 opacity-70"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCurrent
                        ? "bg-emerald-600 text-white"
                        : isDone
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <Icon
                    className={`w-4 h-4 hidden sm:block ${
                      isCurrent || isDone ? "text-emerald-600" : "text-slate-400"
                    }`}
                  />
                </div>
                <span className="text-[11px] sm:text-xs font-bold truncate text-center sm:text-left w-full">
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-4 flex-1 pb-16">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-10 shadow-sm">
          {/* ================= STEP 1: RESTAURANT PROFILE ================= */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Étape 1 sur 4
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
                  Personnalisez votre restaurant
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Configurez l&apos;identité visuelle et les paramètres régionaux de votre établissement.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Restaurant Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Nom de l&apos;établissement *
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
                      className="block w-full pl-10 pr-3.5 py-3 text-base font-semibold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900"
                    />
                  </div>
                </div>

                {/* Brand Color Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-emerald-600" />
                    Couleur de marque principale
                  </label>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {BRAND_COLORS.map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => setBrandColor(c.hex)}
                          className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                            brandColor === c.hex
                              ? "border-slate-900 ring-2 ring-slate-900/20 bg-slate-50"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full ${c.bg} shadow-xs`} />
                          <span className="text-[10px] font-bold text-slate-700 truncate">
                            {c.name}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs text-slate-500 font-medium">Ou code hex :</span>
                      <input
                        type="color"
                        value={brandColor}
                        onChange={(e) => setBrandColor(e.target.value)}
                        className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                      />
                      <span className="text-xs font-mono font-bold text-slate-700 uppercase">
                        {brandColor}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Currency Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-emerald-600" />
                    Devise par défaut
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="block w-full px-3.5 py-2.5 text-sm font-semibold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Utilisée pour l&apos;affichage de vos plats, additions et rapports.
                  </p>
                </div>

                {/* Logo URL */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    URL du Logo (Optionnel)
                  </label>
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://monrestaurant.com/logo.png"
                    className="block w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setLogoUrl("/logo_desk.png")}
                      className="text-[11px] font-semibold text-emerald-700 hover:underline"
                    >
                      Utiliser le logo par défaut Ordena
                    </button>
                  </div>
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    Fuseau horaire
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="block w-full px-3.5 py-2.5 text-sm font-semibold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Europe/Paris">Europe/Paris (UTC+1 / UTC+2)</option>
                    <option value="Europe/London">Europe/London (UTC+0)</option>
                    <option value="Europe/Brussels">Europe/Brussels (UTC+1)</option>
                    <option value="Europe/Zurich">Europe/Zurich (UTC+1)</option>
                    <option value="America/Montreal">America/Montreal (UTC-5)</option>
                    <option value="Africa/Casablanca">Africa/Casablanca (UTC+1)</option>
                    <option value="Africa/Abidjan">Africa/Abidjan (UTC+0)</option>
                  </select>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    Adresse (Optionnel)
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="12 rue de la Paix, 75001 Paris"
                    className="block w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    Téléphone (Optionnel)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+33 1 23 45 67 89"
                    className="block w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-6 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveStep1}
                  disabled={saving || !restaurantName.trim()}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all active:scale-98 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <span>Suivant : Mon premier menu</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 2: MENU & DISHES ================= */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Étape 2 sur 4
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
                    Ajoutez vos premières catégories & plats
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Définissez la carte de votre restaurant. Vous pourrez la modifier et l&apos;enrichir à tout moment depuis votre panneau d&apos;administration.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 underline shrink-0"
                >
                  Passer cette étape, j&apos;ajouterai mes plats plus tard &rarr;
                </button>
              </div>

              {/* 1. Category Creation */}
              <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  1. Catégories du menu ({categories.length})
                </h3>

                {/* Quick Add Suggestions */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Suggestions 1-clic :</span>
                  {["Entrées", "Plats Chauds", "Desserts", "Boissons", "Formules Midi"].map((cat) => {
                    const alreadyExists = categories.some((c) => c.name.toLowerCase() === cat.toLowerCase());
                    return (
                      <button
                        key={cat}
                        type="button"
                        disabled={alreadyExists || addingCategory}
                        onClick={() => handleAddCategory(cat)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                          alreadyExists
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300 opacity-60 cursor-default"
                            : "bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border-slate-300"
                        }`}
                      >
                        {alreadyExists ? `✓ ${cat}` : `+ ${cat}`}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Category Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Nom de catégorie personnalisée (ex: Pizzas au feu de bois)"
                    className="flex-1 px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCategory()}
                    disabled={addingCategory || !newCatName.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 shrink-0 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter</span>
                  </button>
                </div>
              </div>

              {/* 2. Dish Form */}
              <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
                  2. Ajouter un plat au menu
                </h3>

                {categories.length === 0 ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
                    Veuillez ajouter ou sélectionner au moins une catégorie ci-dessus pour ajouter des plats.
                  </div>
                ) : (
                  <form onSubmit={handleAddItem} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          Catégorie *
                        </label>
                        <select
                          value={newItemCategory}
                          onChange={(e) => setNewItemCategory(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                          {categories.map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          Nom du plat *
                        </label>
                        <input
                          type="text"
                          required
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          placeholder="Ex: Burger Maison & Frites"
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          Prix ({currency}) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={newItemPrice}
                          onChange={(e) => setNewItemPrice(e.target.value)}
                          placeholder="14.50"
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          Description (Optionnel)
                        </label>
                        <input
                          type="text"
                          value={newItemDesc}
                          onChange={(e) => setNewItemDesc(e.target.value)}
                          placeholder="Steak haché frais, cheddar affiné, sauce secrète..."
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          URL de la Photo (Optionnel)
                        </label>
                        <input
                          type="url"
                          value={newItemPhoto}
                          onChange={(e) => setNewItemPhoto(e.target.value)}
                          placeholder="https://images.unsplash.com/photo-..."
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={addingItem || !newItemName.trim() || !newItemPrice}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                    >
                      {addingItem ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Ajout en cours...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Ajouter ce plat au menu</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>

              {/* 3. Realtime Menu Items List Preview */}
              {items.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Plats créés ({items.length})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {items.map((it) => (
                      <div
                        key={it._id}
                        className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between shadow-2xs"
                      >
                        <div className="flex-1 min-w-0 pr-3">
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mb-1">
                            {it.categoryName || "Plat"}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 truncate">{it.name}</h4>
                          {it.description && (
                            <p className="text-xs text-slate-500 truncate">{it.description}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-black text-emerald-700">
                            {it.price.toFixed(2)} {currency}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2 Bottom Navigation */}
              <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Retour</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all active:scale-98"
                >
                  <span>Suivant : Tables & QR Codes</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 3: TABLES & QR CODES ================= */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Étape 3 sur 4
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
                    Générez vos premières tables & QR codes
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Chaque table possède son QR code sécurisé unique permettant aux clients de commander instantanément.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 underline shrink-0"
                >
                  Passer cette étape &rarr;
                </button>
              </div>

              {/* Table Creation Form & Quick Button */}
              <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-sm font-bold text-slate-800">
                    Ajouter une table personnalisée
                  </h3>

                  <button
                    type="button"
                    onClick={handleQuickAddTables}
                    disabled={addingTable}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>+ Ajouter 3 tables en 1 clic</span>
                  </button>
                </div>

                <form onSubmit={handleAddTable} className="flex gap-2">
                  <input
                    type="text"
                    value={newTableLabel}
                    onChange={(e) => setNewTableLabel(e.target.value)}
                    placeholder="Nom ou numéro (ex: Table 1, Terrasse 4, Salon VIP)"
                    className="flex-1 px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
                  />
                  <button
                    type="submit"
                    disabled={addingTable || !newTableLabel.trim()}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 shrink-0 flex items-center gap-1.5 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Créer la table</span>
                  </button>
                </form>
              </div>

              {/* Tables & QR Code Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Tables configurées ({tables.length})
                  </span>
                </div>

                {tables.length === 0 ? (
                  <div className="p-8 text-center bg-white border border-dashed border-slate-300 rounded-2xl space-y-2">
                    <QrCode className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-sm font-semibold text-slate-700">
                      Aucune table n&apos;est encore créée
                    </p>
                    <p className="text-xs text-slate-500">
                      Ajoutez votre première table ci-dessus ou utilisez le bouton 1-clic.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tables.map((t) => {
                      const qrUrl = tableQrMap[t._id];
                      return (
                        <div
                          key={t._id}
                          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col items-center text-center space-y-3"
                        >
                          <div className="w-full flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-sm font-black text-slate-900">{t.label}</span>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                              Prête
                            </span>
                          </div>

                          {qrUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={qrUrl}
                              alt={`QR ${t.label}`}
                              className="w-36 h-36 rounded-xl border border-slate-100 p-1.5 bg-slate-50"
                            />
                          ) : (
                            <div className="w-36 h-36 rounded-xl bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                              <Loader2 className="w-5 h-5 animate-spin" />
                            </div>
                          )}

                          <div className="w-full grid grid-cols-2 gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => downloadQrCode(t)}
                              className="inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                            >
                              <Download className="w-3.5 h-3.5 text-slate-500" />
                              <span>Télécharger</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => openQrModal(t)}
                              className="inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors border border-emerald-200"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Aperçu</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Step 3 Bottom Navigation */}
              <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Retour</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all active:scale-98"
                >
                  <span>Suivant : Finalisation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 4: CONFIRMATION / CELEBRATION ================= */}
          {step === 4 && (
            <div className="space-y-8 animate-in fade-in duration-200 text-center sm:text-left">
              <div className="text-center max-w-xl mx-auto space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                  Félicitations, c&apos;est prêt !
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Votre restaurant <strong className="text-slate-900">{restaurantName}</strong> est configuré et prêt à accueillir ses premières commandes avec Ordena SaaS.
                </p>
              </div>

              {/* Summary Dashboard Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <Store className="w-4 h-4 text-emerald-600" />
                    <span>Établissement</span>
                  </div>
                  <div className="text-lg font-black text-slate-900 truncate">
                    {restaurantName}
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs"
                      style={{ backgroundColor: brandColor }}
                    />
                    <span className="text-xs font-medium text-slate-600">
                      Devise : <strong>{currency}</strong>
                    </span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
                    <span>Menu & Plats</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {items.length}{" "}
                    <span className="text-xs font-semibold text-slate-500">plat(s)</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {categories.length} catégorie(s) définie(s)
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span>Tables & QR Codes</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {tables.length}{" "}
                    <span className="text-xs font-semibold text-slate-500">table(s)</span>
                  </div>
                  <p className="text-xs text-slate-600">QR codes uniques actifs</p>
                </div>
              </div>

              {/* Ready Checklist */}
              <div className="border border-emerald-200/80 bg-emerald-50/40 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  Ce que vous pouvez faire dès maintenant :
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Imprimer vos QR codes et les disposer sur vos tables</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Créer des accès pour vos serveurs et votre cuisine</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Suivre les commandes et le chiffre d&apos;affaires en direct</span>
                  </div>
                </div>
              </div>

              {/* Final CTA Button */}
              <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Revenir en arrière</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinishOnboarding}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base shadow-lg hover:shadow-xl transition-all active:scale-98 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Finalisation en cours...</span>
                    </>
                  ) : (
                    <>
                      <span>Aller à mon dashboard &rarr;</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* QR Code Modal preview */}
      {selectedTableForQr && modalQrUrl && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150 text-center">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                QR Code - {selectedTableForQr.label}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedTableForQr(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center">
              <span className="text-xs font-bold text-emerald-800 uppercase mb-2">
                {restaurantName}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={modalQrUrl}
                alt="QR Code"
                className="w-48 h-48 rounded-xl bg-white p-2 border border-slate-200 shadow-2xs"
              />
              <span className="text-base font-extrabold text-slate-900 mt-2">
                {selectedTableForQr.label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => downloadQrCode(selectedTableForQr)}
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedTableForQr(null)}
                className="inline-flex items-center justify-center py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
