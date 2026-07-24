"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Building2,
  Plus,
  CheckCircle2,
  DollarSign,
  ShoppingBag,
  Users,
  Search,
  Sparkles,
  RotateCcw,
  Check,
  Utensils,
  Lock,
  X,
  Palette,
  Mail,
  UserCheck,
  Layers,
  ArrowRight,
} from "lucide-react";

interface TenantItem {
  _id: string;
  name: string;
  logoUrl?: string;
  brandColor?: string;
  subscriptionStatus: "active" | "trial" | "inactive" | "canceled";
  createdAt: string;
  orderCount: number;
  revenue: number;
  admin: {
    name: string;
    email: string;
  } | null;
}

interface PlatformMetrics {
  totalTenants: number;
  activeTenants: number;
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
}

const BRAND_PRESETS = [
  { name: "Bleu Océan", hex: "#3b82f6" },
  { name: "Rouge Gourmand", hex: "#ef4444" },
  { name: "Émeraude Frais", hex: "#10b981" },
  { name: "Ambre Chaleureux", hex: "#f59e0b" },
  { name: "Violet Élégant", hex: "#8b5cf6" },
  { name: "Rose Moderne", hex: "#ec4899" },
  { name: "Noir Luxe", hex: "#1f2937" },
];

export default function SuperAdminDashboardPage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();

  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [activeTenantId, setActiveTenantId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Create Tenant Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    logoUrl: "",
    brandColor: "#3b82f6",
    subscriptionStatus: "active",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
  });

  // Fetch all tenants & platform metrics
  const fetchSuperAdminData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/super-admin/tenants");
      if (res.ok) {
        const json = await res.json();
        setMetrics(json.metrics || null);
        setTenants(json.tenants || []);
        if (json.currentActiveTenantId) {
          setActiveTenantId(json.currentActiveTenantId);
        } else if (session?.user?.activeTenantId) {
          setActiveTenantId(session.user.activeTenantId);
        }
      }
    } catch (err) {
      console.error("Fetch super admin error:", err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      if (isMounted) await fetchSuperAdminData();
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [fetchSuperAdminData]);

  // Handle Switching Active Tenant
  const handleSwitchTenant = async (tenantId: string) => {
    try {
      const res = await fetch("/api/super-admin/switch-tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId }),
      });

      if (res.ok) {
        setActiveTenantId(tenantId);
        await updateSession({ activeTenantId: tenantId });
      }
    } catch (err) {
      console.error("Error switching tenant:", err);
    }
  };

  // Handle updating tenant status
  const handleStatusChange = async (
    tenantId: string,
    newStatus: "active" | "trial" | "inactive" | "canceled"
  ) => {
    try {
      const res = await fetch(`/api/super-admin/tenants/${tenantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionStatus: newStatus }),
      });

      if (res.ok) {
        setTenants((prev) =>
          prev.map((t) =>
            t._id === tenantId ? { ...t, subscriptionStatus: newStatus } : t
          )
        );
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // Handle creating new tenant + admin
  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!formData.name.trim()) {
      setFormError("Le nom du restaurant est obligatoire.");
      return;
    }
    if (!formData.adminEmail.trim()) {
      setFormError("L'adresse e-mail de l'administrateur est obligatoire.");
      return;
    }
    if (!formData.adminPassword || formData.adminPassword.length < 6) {
      setFormError("Le mot de passe doit comporter au moins 6 caractères.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/super-admin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok) {
        setFormError(json.error || "Une erreur s'est produite lors de la création.");
        return;
      }

      setFormSuccess(`Le restaurant "${json.tenant.name}" et son administrateur ont été créés avec succès !`);
      
      // Reset form
      setFormData({
        name: "",
        logoUrl: "",
        brandColor: "#3b82f6",
        subscriptionStatus: "active",
        adminName: "",
        adminEmail: "",
        adminPassword: "",
      });

      // Refresh list
      await fetchSuperAdminData();

      // Automatically switch to the newly created tenant
      if (json.tenant._id) {
        await handleSwitchTenant(json.tenant._id);
      }

      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess("");
      }, 1500);
    } catch (err) {
      console.error("Create tenant error:", err);
      setFormError("Erreur lors de la connexion au serveur.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter tenants
  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.admin?.email && t.admin.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.admin?.name && t.admin.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" ? true : t.subscriptionStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. TOP HEADER & ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Gestion multi-tenants SaaS
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Vue globale de la plateforme, gestion des restaurants et bascule de tenant actif
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchSuperAdminData()}
            className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-extrabold text-xs flex items-center gap-2 transition-colors"
            title="Rafraîchir les données"
          >
            <RotateCcw className="w-4 h-4 text-gray-500" />
            <span className="hidden sm:inline">Actualiser</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-xs transition-all hover:scale-[1.01]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nouveau Restaurant (Tenant)</span>
          </button>
        </div>
      </div>

      {/* 2. GLOBAL METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Restaurants Actifs"
          value={loading ? "..." : `${metrics?.activeTenants || 0} / ${metrics?.totalTenants || 0}`}
          subtext="Établissements sous abonnement"
          icon={<Building2 className="w-5 h-5 text-amber-600" />}
          iconBg="bg-amber-50 border border-amber-100"
          accentColor="text-amber-600"
        />

        <MetricCard
          title="Commandes Plateforme"
          value={loading ? "..." : `${metrics?.totalOrders || 0}`}
          subtext="Total cumulé tous tenants"
          icon={<ShoppingBag className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-50 border border-blue-100"
          accentColor="text-blue-600"
        />

        <MetricCard
          title="Volume d'Affaires"
          value={loading ? "..." : `${(metrics?.totalRevenue || 0).toFixed(2)} €`}
          subtext="Factures réglées plateforme"
          icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-50 border border-emerald-100"
          accentColor="text-emerald-600"
        />

        <MetricCard
          title="Comptes Utilisateurs"
          value={loading ? "..." : `${metrics?.totalUsers || 0}`}
          subtext="Admins, serveurs, cuisiniers"
          icon={<Users className="w-5 h-5 text-purple-600" />}
          iconBg="bg-purple-50 border border-purple-100"
          accentColor="text-purple-600"
        />
      </div>

      {/* 3. ACTIVE TENANT BAR & TENANTS LIST */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs space-y-6">
        {/* Active Tenant Notification Bar */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-gray-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Tenant actuellement actif dans la session
              </p>
              <p className="text-lg font-black text-amber-400">
                {tenants.find((t) => t._id === activeTenantId)?.name || "Aucun tenant sélectionné"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <span>Accéder à l&apos;Admin Restaurant</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom de restaurant ou e-mail admin..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: "all", label: "Tous" },
              { id: "active", label: "Actifs" },
              { id: "trial", label: "Essai" },
              { id: "inactive", label: "Inactifs" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                  statusFilter === f.id
                    ? "bg-gray-900 text-white shadow-2xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tenants List Grid */}
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-xs font-bold text-gray-400 animate-pulse">
              Chargement des restaurants et métriques...
            </div>
          ) : filteredTenants.length > 0 ? (
            filteredTenants.map((tenant) => {
              const isActive = tenant._id === activeTenantId;

              return (
                <motion.div
                  key={tenant._id}
                  layout
                  className={`p-5 rounded-2xl border transition-all ${
                    isActive
                      ? "bg-amber-50/40 border-amber-300 ring-2 ring-amber-500/20 shadow-2xs"
                      : "bg-white border-gray-200/80 hover:border-gray-300"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Restaurant Info */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      {tenant.logoUrl ? (
                        <Image
                          src={tenant.logoUrl}
                          alt={tenant.name}
                          width={48}
                          height={48}
                          unoptimized
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-2xl object-cover border border-gray-200 shrink-0"
                        />
                      ) : (
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white shrink-0 text-lg shadow-2xs"
                          style={{ backgroundColor: tenant.brandColor || "#3b82f6" }}
                        >
                          {tenant.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-extrabold text-base text-gray-900">
                            {tenant.name}
                          </h3>

                          {/* Brand Color Dot */}
                          <div
                            className="w-3.5 h-3.5 rounded-full border border-white shadow-xs"
                            style={{ backgroundColor: tenant.brandColor || "#3b82f6" }}
                            title={`Couleur: ${tenant.brandColor}`}
                          />

                          {/* Status Badge Select */}
                          <select
                            value={tenant.subscriptionStatus}
                            onChange={(e) =>
                              handleStatusChange(
                                tenant._id,
                                e.target.value as "active" | "trial" | "inactive" | "canceled"
                              )
                            }
                            className={`px-2.5 py-0.5 rounded-full font-black text-[11px] border focus:outline-hidden cursor-pointer ${
                              tenant.subscriptionStatus === "active"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : tenant.subscriptionStatus === "trial"
                                ? "bg-amber-100 text-amber-800 border-amber-300"
                                : "bg-gray-100 text-gray-600 border-gray-300"
                            }`}
                          >
                            <option value="active">Actif</option>
                            <option value="trial">Essai</option>
                            <option value="inactive">Inactif</option>
                            <option value="canceled">Annulé</option>
                          </select>

                          {isActive && (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-black text-[11px] flex items-center gap-1 shadow-2xs">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>ACTIF EN SESSION</span>
                            </span>
                          )}
                        </div>

                        {/* Admin Details */}
                        <div className="flex items-center gap-3 text-xs font-semibold text-gray-500 flex-wrap">
                          {tenant.admin ? (
                            <span className="flex items-center gap-1 text-gray-700">
                              <UserCheck className="w-3.5 h-3.5 text-gray-400" />
                              <span>{tenant.admin.name} ({tenant.admin.email})</span>
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">Aucun administrateur assigné</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Metrics & Actions */}
                    <div className="flex items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                      {/* Restaurant Stats */}
                      <div className="flex items-center gap-4 text-xs">
                        <div className="text-center lg:text-right">
                          <p className="font-extrabold text-gray-900">{tenant.orderCount}</p>
                          <p className="text-[10px] font-bold text-gray-400">Commandes</p>
                        </div>
                        <div className="w-px h-7 bg-gray-200" />
                        <div className="text-center lg:text-right">
                          <p className="font-extrabold text-emerald-600">{tenant.revenue.toFixed(2)} €</p>
                          <p className="text-[10px] font-bold text-gray-400">Total Ventes</p>
                        </div>
                      </div>

                      {/* Active Switch Button */}
                      <div>
                        {isActive ? (
                          <button
                            disabled
                            className="px-4 py-2 rounded-xl bg-amber-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs opacity-90 cursor-default"
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>Tenant Actif</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSwitchTenant(tenant._id)}
                            className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                          >
                            <Layers className="w-3.5 h-3.5 text-amber-400" />
                            <span>Activer ce Tenant</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="p-12 text-center text-xs font-bold text-gray-400 border border-dashed border-gray-200 rounded-2xl">
              Aucun restaurant ne correspond à votre recherche.
            </div>
          )}
        </div>
      </div>

      {/* 4. MODAL FORM: CREATE NEW TENANT + RESTAURANT_ADMIN ACCOUNT */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-3xl border border-gray-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 bg-gray-900 text-white flex items-center justify-between border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-gray-950 flex items-center justify-center font-black">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold">Nouveau Restaurant (Tenant)</h2>
                    <p className="text-xs text-gray-400">
                      Création du profil établissement et du compte restaurant_admin
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body / Form */}
              <form onSubmit={handleCreateTenant} className="p-6 space-y-6 overflow-y-auto flex-1">
                {formError && (
                  <div className="p-4 rounded-2xl bg-red-50 text-red-700 border border-red-200 text-xs font-bold">
                    {formError}
                  </div>
                )}

                {formSuccess && (
                  <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{formSuccess}</span>
                  </div>
                )}

                {/* Section 1: Informations du Restaurant */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-amber-500" />
                    <span>1. Informations de l&apos;Établissement</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Nom du Restaurant *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="ex: Le Petit Bistro"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Statut d&apos;abonnement
                      </label>
                      <select
                        value={formData.subscriptionStatus}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            subscriptionStatus: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      >
                        <option value="active">Actif</option>
                        <option value="trial">Période d&apos;essai</option>
                        <option value="inactive">Inactif</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      URL du Logo (Optionnel)
                    </label>
                    <input
                      type="url"
                      value={formData.logoUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, logoUrl: e.target.value })
                      }
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>

                  {/* Brand Color Selector */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-gray-500" />
                      <span>Couleur de marque</span>
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {BRAND_PRESETS.map((preset) => (
                        <button
                          type="button"
                          key={preset.hex}
                          onClick={() =>
                            setFormData({ ...formData, brandColor: preset.hex })
                          }
                          className={`w-8 h-8 rounded-xl border-2 transition-all flex items-center justify-center ${
                            formData.brandColor === preset.hex
                              ? "border-gray-900 scale-110 shadow-xs"
                              : "border-transparent hover:scale-105"
                          }`}
                          style={{ backgroundColor: preset.hex }}
                          title={preset.name}
                        >
                          {formData.brandColor === preset.hex && (
                            <Check className="w-4 h-4 text-white stroke-[3]" />
                          )}
                        </button>
                      ))}

                      <input
                        type="color"
                        value={formData.brandColor}
                        onChange={(e) =>
                          setFormData({ ...formData, brandColor: e.target.value })
                        }
                        className="w-8 h-8 rounded-xl border border-gray-200 cursor-pointer p-0 bg-transparent"
                        title="Couleur personnalisée"
                      />
                    </div>
                  </div>
                </div>

                <div className="w-full h-px bg-gray-100" />

                {/* Section 2: Compte Restaurant Admin */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-amber-500" />
                    <span>2. Compte Administrateur Associé (restaurant_admin)</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Nom complet du gérant
                      </label>
                      <input
                        type="text"
                        value={formData.adminName}
                        onChange={(e) =>
                          setFormData({ ...formData, adminName: e.target.value })
                        }
                        placeholder="ex: Jean Dupont"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <span>E-mail Administrateur *</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.adminEmail}
                        onChange={(e) =>
                          setFormData({ ...formData, adminEmail: e.target.value })
                        }
                        placeholder="admin@restaurant.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-gray-400" />
                      <span>Mot de passe Administrateur *</span>
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={formData.adminPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, adminPassword: e.target.value })
                      }
                      placeholder="Minimum 6 caractères"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-extrabold text-xs hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-xs disabled:opacity-50 transition-all"
                  >
                    {isSubmitting ? (
                      <span>Création en cours...</span>
                    ) : (
                      <>
                        <Building2 className="w-4 h-4" />
                        <span>Créer le Restaurant & Admin</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * METRIC CARD COMPONENT
 */
function MetricCard({
  title,
  value,
  subtext,
  icon,
  iconBg,
  accentColor,
}: {
  title: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
  iconBg: string;
  accentColor: string;
}) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2 rounded-xl ${iconBg}`}>{icon}</div>
      </div>

      <div>
        <p className={`text-2xl font-black tracking-tight ${accentColor}`}>{value}</p>
        <p className="text-xs font-semibold text-gray-400 mt-0.5">{subtext}</p>
      </div>
    </div>
  );
}
