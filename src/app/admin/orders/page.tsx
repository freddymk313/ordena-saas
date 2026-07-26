"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  RotateCcw,
  Search,
  CheckCircle2,
  Flame,
  ChefHat,
  Volume2,
  VolumeX,
  ShoppingBag,
} from "lucide-react";
import KanbanBoard from "@/components/ui-custom/KanbanBoard";
import { KanbanOrder } from "@/components/ui-custom/KanbanCard";
import StatCard from "@/components/ui-custom/StatCard";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<KanbanOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [prevPendingCount, setPrevPendingCount] = useState(0);

  // Audio Context synth for kitchen chime
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playChimeAlert = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(659.25, now); // E5
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, now + 0.15); // A5
      gain2.gain.setValueAtTime(0.2, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.6);
    } catch (e) {
      console.error("Audio chime error:", e);
    }
  }, [soundEnabled]);

  // Fetch orders from API
  const fetchOrders = useCallback(async (showIndicator = false) => {
    try {
      if (showIndicator) setIsRefreshing(true);
      const res = await fetch("/api/staff/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data || []);

        const pendingCount = (data || []).filter((o: KanbanOrder) => o.status === "pending").length;
        if (pendingCount > prevPendingCount && prevPendingCount !== 0) {
          playChimeAlert();
        }
        setPrevPendingCount(pendingCount);
      }
    } catch (err) {
      console.error("Fetch orders error:", err);
    } finally {
      setLoading(false);
      if (showIndicator) setIsRefreshing(false);
    }
  }, [prevPendingCount, playChimeAlert]);

  // Polling every 4 seconds for real-time synchronization
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders();
    }, 4000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Advance Order Status
  const handleAdvanceStatus = async (orderId: string, currentStatus: string) => {
    let nextStatus: KanbanOrder["status"] = "pending";
    if (currentStatus === "pending") nextStatus = "preparing";
    else if (currentStatus === "preparing") nextStatus = "ready";
    else if (currentStatus === "ready") nextStatus = "served";
    else return;

    // Optimistic UI state update
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, status: nextStatus } : o))
    );

    try {
      const res = await fetch(`/api/staff/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        // Rollback on failure
        await fetchOrders();
      }
    } catch (err) {
      console.error("Advance order status error:", err);
      await fetchOrders();
    }
  };

  // Filter orders by search term
  const filteredOrders = orders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const matchesTable = o.tableLabel.toLowerCase().includes(query);
    const matchesCustomer = (o.customerName || "").toLowerCase().includes(query);
    const matchesDish = o.items.some((item) => item.name.toLowerCase().includes(query));
    return matchesTable || matchesCustomer || matchesDish;
  });

  // Calculate statistics
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const preparingCount = orders.filter((o) => o.status === "preparing").length;
  const readyCount = orders.filter((o) => o.status === "ready").length;
  const servedCount = orders.filter((o) => o.status === "served").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Commandes & Cuisine
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Direct (4s)
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Suivi Kanban en temps réel des commandes en salle et en cuisine.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1.5 ${
              soundEnabled
                ? "bg-amber-50 text-amber-900 border-amber-200"
                : "bg-gray-100 text-gray-500 border-gray-200"
            }`}
            title="Alerte sonore de nouvelle commande"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-amber-600" />
                <span className="hidden sm:inline">Son Activé</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-gray-400" />
                <span className="hidden sm:inline">Son Muet</span>
              </>
            )}
          </button>

          <button
            onClick={() => fetchOrders(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs transition-colors shadow-2xs"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-emerald-600 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Summary StatCards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<ShoppingBag className="w-5 h-5 text-amber-600" />}
          label="En attente"
          value={pendingCount}
          badgeBgClass={
            pendingCount > 0
              ? "bg-amber-100 text-amber-900 border-amber-200 animate-bounce"
              : "bg-gray-100 text-gray-700"
          }
        />
        <StatCard
          icon={<Flame className="w-5 h-5 text-blue-600" />}
          label="En préparation"
          value={preparingCount}
          badgeBgClass="bg-blue-50 text-blue-800 border-blue-100"
        />
        <StatCard
          icon={<ChefHat className="w-5 h-5 text-emerald-600" />}
          label="Prêtes à servir"
          value={readyCount}
          badgeBgClass="bg-emerald-50 text-emerald-800 border-emerald-100"
        />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5 text-gray-600" />}
          label="Total Servies"
          value={servedCount}
          badgeBgClass="bg-gray-100 text-gray-800"
        />
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par numéro de table, client ou plat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <span className="text-xs text-gray-500 font-medium">
          {filteredOrders.length} commande(s) affichée(s)
        </span>
      </div>

      {/* Kanban Board View */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center text-xs text-gray-400 font-medium bg-white rounded-2xl border border-gray-200">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-2" />
          <span>Chargement des commandes en direct...</span>
        </div>
      ) : (
        <KanbanBoard
          orders={filteredOrders}
          onAdvanceStatus={handleAdvanceStatus}
        />
      )}
    </div>
  );
}
