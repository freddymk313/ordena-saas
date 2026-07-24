"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState, useCallback } from "react";
import {
  Bell,
  Receipt,
  Users,
  Check,
  RefreshCw,
  AlertTriangle,
  Utensils,
  Clock,
  Sparkles,
} from "lucide-react";
import StatusPill from "@/components/ui-custom/StatusPill";
import StatCard from "@/components/ui-custom/StatCard";
import { cn } from "@/lib/utils";

interface ServiceReqInfo {
  _id: string;
  type: "call_server" | "request_bill";
  createdAt: string;
}

interface TableStatusInfo {
  _id: string;
  label: string;
  qrToken: string;
  status: "free" | "occupied" | "service_requested" | "bill_requested";
  pendingRequests: ServiceReqInfo[];
  hasCallServer: boolean;
  hasRequestBill: boolean;
  activeOrdersCount: number;
  hasPendingBill: boolean;
}

export default function StaffFloorMapPage() {
  const [tables, setTables] = useState<TableStatusInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const fetchStatus = useCallback(async (showIndicator = false) => {
    try {
      if (showIndicator) setIsRefreshing(true);
      const res = await fetch("/api/tables/status");
      if (!res.ok) throw new Error("Erreur serveur");
      const data = await res.json();
      setTables(data.tables || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Polling error floor map:", err);
    } finally {
      setLoading(false);
      if (showIndicator) setIsRefreshing(false);
    }
  }, []);

  // Polling every 4 seconds
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStatus();
    const interval = setInterval(() => {
      fetchStatus();
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Actions on Service Request (Handle call or bill request)
  const handleResolveRequest = async (requestId: string) => {
    try {
      const res = await fetch(`/api/service-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "handled" }),
      });
      if (res.ok) {
        await fetchStatus(true);
      }
    } catch (err) {
      console.error("Resolve error:", err);
    }
  };

  // Actions on Table Status
  const handleUpdateTableStatus = async (tableId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tables/${tableId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await fetchStatus(true);
      }
    } catch (err) {
      console.error("Table update error:", err);
    }
  };

  // Stats calculation
  const totalTables = tables.length;
  const occupiedCount = tables.filter((t) => t.status === "occupied" || t.status === "service_requested" || t.status === "bill_requested").length;
  const pendingCallsCount = tables.filter((t) => t.hasCallServer || t.hasRequestBill).length;
  const freeCount = tables.filter((t) => t.status === "free").length;

  // Filtered tables
  const filteredTables = tables.filter((t) => {
    if (activeFilter === "calls") return t.hasCallServer || t.hasRequestBill;
    if (activeFilter === "occupied") return t.status !== "free";
    if (activeFilter === "free") return t.status === "free";
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Plan de Salle - Service en Direct
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Direct (4s)
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Surveillez l&apos;état des tables, les appels serveur et les demandes d&apos;addition en temps réel.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-gray-400 hidden md:inline-block">
              Dernière mise à jour: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => fetchStatus(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs transition-colors shadow-2xs"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 text-emerald-600", isRefreshing && "animate-spin")} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Summary StatCards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Taux d'occupation"
          value={`${totalTables > 0 ? Math.round((occupiedCount / totalTables) * 100) : 0}%`}
          trend={{ value: `${occupiedCount}/${totalTables} tables`, isPositive: true }}
          badgeBgClass="bg-blue-50 text-blue-700 border-blue-100"
        />

        <StatCard
          icon={<Bell className="w-5 h-5" />}
          label="Appels en attente"
          value={pendingCallsCount}
          badgeBgClass={
            pendingCallsCount > 0
              ? "bg-rose-100 text-rose-700 border-rose-200 animate-bounce"
              : "bg-emerald-50 text-emerald-700 border-emerald-100"
          }
        />

        <StatCard
          icon={<Receipt className="w-5 h-5" />}
          label="Tables occupées"
          value={occupiedCount}
          badgeBgClass="bg-purple-50 text-purple-700 border-purple-100"
        />

        <StatCard
          icon={<Utensils className="w-5 h-5" />}
          label="Tables libres"
          value={freeCount}
          badgeBgClass="bg-emerald-50 text-emerald-700 border-emerald-100"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
        <button
          onClick={() => setActiveFilter("all")}
          className={cn(
            "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all",
            activeFilter === "all"
              ? "bg-emerald-700 text-white shadow-2xs"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          )}
        >
          Toutes les tables ({tables.length})
        </button>

        <button
          onClick={() => setActiveFilter("calls")}
          className={cn(
            "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
            activeFilter === "calls"
              ? "bg-amber-600 text-white shadow-2xs"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          )}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span>Appels urgents ({pendingCallsCount})</span>
        </button>

        <button
          onClick={() => setActiveFilter("occupied")}
          className={cn(
            "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all",
            activeFilter === "occupied"
              ? "bg-blue-600 text-white shadow-2xs"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          )}
        >
          Occupées ({occupiedCount})
        </button>

        <button
          onClick={() => setActiveFilter("free")}
          className={cn(
            "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all",
            activeFilter === "free"
              ? "bg-emerald-600 text-white shadow-2xs"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          )}
        >
          Libres ({freeCount})
        </button>
      </div>

      {/* Floor Plan Grid */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center text-gray-400 text-sm">
          Chargement du plan de salle...
        </div>
      ) : filteredTables.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTables.map((table) => {
            const hasUrgentCall = table.hasCallServer || table.hasRequestBill;

            return (
              <div
                key={table._id}
                className={cn(
                  "bg-white rounded-xl p-5 border transition-all shadow-2xs relative flex flex-col justify-between gap-4",
                  hasUrgentCall
                    ? "border-amber-400 ring-2 ring-amber-300/50 bg-amber-50/20"
                    : table.status === "free"
                    ? "border-gray-100 hover:border-emerald-200"
                    : "border-blue-100 hover:border-blue-200"
                )}
              >
                {/* Urgent Call Top Ribbon */}
                {hasUrgentCall && (
                  <div className="absolute -top-2.5 right-3 bg-amber-500 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Intervention requise</span>
                  </div>
                )}

                {/* Table Header: Label & Status */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl font-bold text-base flex items-center justify-center border shrink-0",
                          hasUrgentCall
                            ? "bg-amber-100 text-amber-900 border-amber-300"
                            : table.status === "free"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-blue-50 text-blue-800 border-blue-200"
                        )}
                      >
                        {table.label.replace(/[^0-9]/g, "") || table.label.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-base leading-tight">
                          {table.label}
                        </h3>
                        <div className="mt-1">
                          <StatusPill status={table.status} variant="table" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Active Orders / Requests Indicators */}
                  <div className="mt-4 pt-3 border-t border-gray-100 space-y-2 text-xs">
                    {/* Active pending service requests */}
                    {table.pendingRequests.map((req) => (
                      <div
                        key={req._id}
                        className="p-2 rounded-lg bg-amber-100/80 text-amber-900 flex items-center justify-between font-medium"
                      >
                        <div className="flex items-center gap-1.5">
                          {req.type === "call_server" ? (
                            <Bell className="w-3.5 h-3.5 text-amber-700 animate-bounce" />
                          ) : (
                            <Receipt className="w-3.5 h-3.5 text-purple-700" />
                          )}
                          <span>
                            {req.type === "call_server"
                              ? "Appel serveur"
                              : "Demande d'addition"}
                          </span>
                        </div>

                        <button
                          onClick={() => handleResolveRequest(req._id)}
                          className="px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] transition-colors"
                        >
                          Traiter
                        </button>
                      </div>
                    ))}

                    {/* Active orders count */}
                    {table.activeOrdersCount > 0 && (
                      <div className="flex items-center gap-1.5 text-blue-700 font-medium">
                        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                        <span>{table.activeOrdersCount} commande(s) en cours</span>
                      </div>
                    )}

                    {table.status === "free" && table.pendingRequests.length === 0 && (
                      <div className="flex items-center gap-1.5 text-gray-400 font-normal italic">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Table disponible</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Staff Controls */}
                <div className="pt-2 border-t border-gray-100 flex items-center gap-1.5 justify-end">
                  {table.status === "free" ? (
                    <button
                      onClick={() => handleUpdateTableStatus(table._id, "occupied")}
                      className="w-full py-1.5 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold text-xs border border-blue-200 transition-colors"
                    >
                      Installer des clients
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateTableStatus(table._id, "free")}
                      className="w-full py-1.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs border border-emerald-200 transition-colors flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Libérer la table</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
          Aucune table correspondant aux filtres.
        </div>
      )}
    </div>
  );
}
