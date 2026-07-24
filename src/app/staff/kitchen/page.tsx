"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  Utensils,
  Clock,
  Volume2,
  VolumeX,
  RotateCcw,
  Search,
  ChevronRight,
  Flame,
  ChefHat,
  BellRing,
} from "lucide-react";

interface OrderItem {
  name: string;
  price: number;
  photoUrl?: string;
  quantity: number;
}

interface KitchenOrder {
  _id: string;
  tenantId: string;
  tableId: string;
  tableLabel: string;
  tableStatus: string;
  customerName: string;
  status: "pending" | "preparing" | "ready" | "served";
  estimatedReadyAt: string | null;
  createdAt: string;
  items: OrderItem[];
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastOrderCount, setLastOrderCount] = useState(0);

  // Audio Context synth for chime alerts
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playKitchenChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;
      // High kitchen chime: E5 -> A5
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

  // Time tick state to keep render pure
  const [nowTimestamp, setNowTimestamp] = useState<number>(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNowTimestamp(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/staff/orders");
      if (res.ok) {
        const data: KitchenOrder[] = await res.json();
        setOrders(data);

        // Check if new pending orders arrived
        const pendingCount = data.filter((o) => o.status === "pending").length;
        if (pendingCount > lastOrderCount && lastOrderCount !== 0) {
          playKitchenChime();
        }
        setLastOrderCount(pendingCount);
      }
    } catch (err) {
      console.error("Fetch kitchen orders error:", err);
    } finally {
      setLoading(false);
    }
  }, [lastOrderCount, playKitchenChime]);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      if (isMounted) await fetchOrders();
    };
    run();
    const interval = setInterval(fetchOrders, 3000); // 3 second polling for kitchen screen
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fetchOrders]);

  // Update status handler
  const handleUpdateStatus = async (orderId: string, nextStatus: KitchenOrder["status"]) => {
    try {
      // Optimistic state update
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: nextStatus } : o))
      );

      const res = await fetch(`/api/staff/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        await fetchOrders(); // Rollback if error
      }
    } catch (err) {
      console.error("Update order status error:", err);
      await fetchOrders();
    }
  };

  // Filter orders by search
  const filteredOrders = orders.filter((o) => {
    if (o.status === "served") return false; // Kitchen view focuses on pending, preparing, ready
    const matchesQuery =
      !searchQuery.trim() ||
      o.tableLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.items.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesQuery;
  });

  // Categorize into Kanban Columns
  const pendingOrders = filteredOrders.filter((o) => o.status === "pending");
  const preparingOrders = filteredOrders.filter((o) => o.status === "preparing");
  const readyOrders = filteredOrders.filter((o) => o.status === "ready");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
                Cuisine & Écran de Production
              </h1>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                En direct
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              File des commandes synchronisée en temps réel — Colonnes Kanban
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search Bar */}
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Table, prénom, plat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playKitchenChime();
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
              soundEnabled
                ? "bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100"
                : "bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200"
            }`}
            title={soundEnabled ? "Sonnette activée" : "Sonnette désactivée"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-600" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden md:inline">{soundEnabled ? "Sonnette On" : "Mute"}</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => fetchOrders()}
            className="p-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
            title="Rafraîchir"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Badges Bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-extrabold text-sm shadow-2xs">
              {pendingOrders.length}
            </div>
            <div>
              <span className="text-xs font-bold text-amber-950">En attente</span>
              <p className="text-[10px] text-amber-800/80 font-medium">Commandes reçues</p>
            </div>
          </div>
          <Flame className="w-5 h-5 text-amber-500 opacity-60" />
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 p-3.5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-sm shadow-2xs">
              {preparingOrders.length}
            </div>
            <div>
              <span className="text-xs font-bold text-blue-950">En préparation</span>
              <p className="text-[10px] text-blue-800/80 font-medium">Sur les fourneaux</p>
            </div>
          </div>
          <Utensils className="w-5 h-5 text-blue-500 opacity-60" />
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-sm shadow-2xs">
              {readyOrders.length}
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-950">Prêt à servir</span>
              <p className="text-[10px] text-emerald-800/80 font-medium">Prêt pour envoi</p>
            </div>
          </div>
          <BellRing className="w-5 h-5 text-emerald-500 opacity-60" />
        </div>
      </div>

      {/* KANBAN BOARD COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* COLUMN 1: PENDING (En attente) */}
        <KanbanColumn
          title="1. En attente"
          count={pendingOrders.length}
          badgeBg="bg-amber-100 text-amber-900 border-amber-200"
          headerColor="border-amber-400 bg-amber-50/50"
        >
          {loading ? (
            <div className="p-8 text-center text-xs text-gray-400 font-medium animate-pulse">
              Chargement des commandes...
            </div>
          ) : pendingOrders.length > 0 ? (
            pendingOrders.map((order) => (
              <KitchenCard
                key={order._id}
                order={order}
                nowTimestamp={nowTimestamp}
                onAdvance={() => handleUpdateStatus(order._id, "preparing")}
                advanceLabel="Commencer la préparation 🍳"
                advanceColor="bg-amber-500 hover:bg-amber-600 text-white"
              />
            ))
          ) : (
            <div className="p-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-2xl bg-white/50 font-medium">
              Aucune commande en attente.
            </div>
          )}
        </KanbanColumn>

        {/* COLUMN 2: PREPARING (En préparation) */}
        <KanbanColumn
          title="2. En préparation"
          count={preparingOrders.length}
          badgeBg="bg-blue-100 text-blue-900 border-blue-200"
          headerColor="border-blue-400 bg-blue-50/50"
        >
          {preparingOrders.length > 0 ? (
            preparingOrders.map((order) => (
              <KitchenCard
                key={order._id}
                order={order}
                nowTimestamp={nowTimestamp}
                onAdvance={() => handleUpdateStatus(order._id, "ready")}
                advanceLabel="Marquer comme prêt 🔔"
                advanceColor="bg-blue-600 hover:bg-blue-700 text-white"
                onStepBack={() => handleUpdateStatus(order._id, "pending")}
              />
            ))
          ) : (
            <div className="p-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-2xl bg-white/50 font-medium">
              Aucun plat en cours de préparation.
            </div>
          )}
        </KanbanColumn>

        {/* COLUMN 3: READY (Prêt) */}
        <KanbanColumn
          title="3. Prêt à servir"
          count={readyOrders.length}
          badgeBg="bg-emerald-100 text-emerald-900 border-emerald-200"
          headerColor="border-emerald-400 bg-emerald-50/50"
        >
          {readyOrders.length > 0 ? (
            readyOrders.map((order) => (
              <KitchenCard
                key={order._id}
                order={order}
                nowTimestamp={nowTimestamp}
                onAdvance={() => handleUpdateStatus(order._id, "served")}
                advanceLabel="Marquer servi 🍽️"
                advanceColor="bg-emerald-600 hover:bg-emerald-700 text-white"
                onStepBack={() => handleUpdateStatus(order._id, "preparing")}
              />
            ))
          ) : (
            <div className="p-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-2xl bg-white/50 font-medium">
              Aucune commande en attente de service.
            </div>
          )}
        </KanbanColumn>
      </div>
    </div>
  );
}

/**
 * KANBAN COLUMN WRAPPER
 */
function KanbanColumn({
  title,
  count,
  badgeBg,
  headerColor,
  children,
}: {
  title: string;
  count: number;
  badgeBg: string;
  headerColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 min-w-0">
      <div
        className={`flex items-center justify-between p-3.5 rounded-2xl border-l-4 border-y border-r border-gray-200/80 bg-white shadow-2xs ${headerColor}`}
      >
        <h3 className="font-extrabold text-sm text-gray-900">{title}</h3>
        <span className={`px-2.5 py-0.5 rounded-full font-black text-xs border ${badgeBg}`}>
          {count}
        </span>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

/**
 * KITCHEN ORDER CARD COMPONENT
 */
function KitchenCard({
  order,
  nowTimestamp,
  onAdvance,
  advanceLabel,
  advanceColor,
  onStepBack,
}: {
  order: KitchenOrder;
  nowTimestamp: number;
  onAdvance: () => void;
  advanceLabel: string;
  advanceColor: string;
  onStepBack?: () => void;
}) {
  // Compute minutes elapsed since creation
  const minutesAgo = Math.max(
    0,
    Math.floor((nowTimestamp - new Date(order.createdAt).getTime()) / 60000)
  );

  // Time urgency color
  let timeBadgeColor = "bg-emerald-50 text-emerald-800 border-emerald-200";
  if (minutesAgo > 10 && minutesAgo <= 20) {
    timeBadgeColor = "bg-amber-50 text-amber-800 border-amber-200";
  } else if (minutesAgo > 20) {
    timeBadgeColor = "bg-rose-50 text-rose-800 border-rose-200 animate-pulse";
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-2xs space-y-3 hover:shadow-md transition-shadow relative overflow-hidden"
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-black text-base text-gray-900 bg-gray-100 px-2.5 py-1 rounded-xl">
            {order.tableLabel}
          </span>
          <div>
            <span className="text-xs font-bold text-gray-700 block">
              Prénom: {order.customerName || "Client"}
            </span>
          </div>
        </div>

        {/* Time Elapsed Badge */}
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-mono text-xs font-bold border ${timeBadgeColor}`}>
          <Clock className="w-3.5 h-3.5" />
          <span>{minutesAgo} min</span>
        </div>
      </div>

      {/* Dishes Detail List */}
      <div className="space-y-1.5 py-1">
        {order.items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2 rounded-xl bg-gray-50/80 border border-gray-100 text-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-6 h-6 rounded-lg bg-gray-900 text-white font-extrabold flex items-center justify-center shrink-0 text-xs">
                {item.quantity}x
              </span>
              <span className="font-extrabold text-gray-900 truncate">
                {item.name}
              </span>
            </div>
            <span className="font-bold text-gray-500 shrink-0">
              {(item.price * item.quantity).toFixed(2)} €
            </span>
          </div>
        ))}
      </div>

      {/* Actions Row */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
        {onStepBack && (
          <button
            onClick={onStepBack}
            className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            title="Revenir au statut précédent"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onAdvance}
          className={`flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs shadow-2xs transition-transform active:scale-98 flex items-center justify-center gap-1.5 ${advanceColor}`}
        >
          <span>{advanceLabel}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
