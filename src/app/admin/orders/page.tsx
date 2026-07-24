"use client";

import React, { useState, useEffect, useCallback } from "react";
import StatCard from "@/components/ui-custom/StatCard";
import StatusPill from "@/components/ui-custom/StatusPill";
import KanbanBoard from "@/components/ui-custom/KanbanBoard";
import { KanbanOrder } from "@/components/ui-custom/KanbanCard";
import DataTable, { Column } from "@/components/ui-custom/DataTable";
import {
  UtensilsCrossed,
  Clock,
  ChefHat,
  LayoutGrid,
  List,
  Loader2,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

interface OrderItem {
  menuItemId?: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order extends KanbanOrder {
  tableId: string;
  tableLabel: string;
  customerName: string;
  items: OrderItem[];
  status: "pending" | "preparing" | "ready" | "served";
  createdAt: string;
  estimatedReadyAt?: string;
}

interface TableOption {
  _id: string;
  label: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<TableOption[]>([]);
  const [stats, setStats] = useState({
    dailyOrdersCount: 0,
    avgPrepTimeMinutes: 14,
    activeOrdersCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filters for List view
  const [statusFilter, setStatusFilter] = useState("all");
  const [tableFilter, setTableFilter] = useState("all");

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/orders?status=${statusFilter}&tableId=${tableFilter}`);
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
        if (data.stats) setStats(data.stats);
        if (data.tables) setTables(data.tables);
      }
    } catch (e) {
      console.error("Error fetching orders:", e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, tableFilter]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleAdvanceStatus = async (orderId: string, currentStatus: string) => {
    const statusFlow: Record<string, "preparing" | "ready" | "served"> = {
      pending: "preparing",
      preparing: "ready",
      ready: "served",
    };

    const nextStatus = statusFlow[currentStatus];
    if (!nextStatus) return;

    setUpdatingId(orderId);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, nextStatus }),
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (e) {
      console.error("Error updating order status:", e);
    } finally {
      setUpdatingId(null);
    }
  };

  // DataTable columns for List View
  const listColumns: Column<Order>[] = [
    {
      key: "table",
      header: "Table & Client",
      accessor: (order: Order) => (
        <div>
          <p className="font-bold text-gray-900">{order.tableLabel}</p>
          <p className="text-[11px] text-gray-500">{order.customerName}</p>
        </div>
      ),
    },
    {
      key: "items",
      header: "Plats commandés",
      accessor: (order: Order) => (
        <div className="text-xs space-y-0.5">
          {order.items.map((it, i) => (
            <p key={i} className="text-gray-700 font-medium">
              {it.quantity}x {it.name}
            </p>
          ))}
        </div>
      ),
    },
    {
      key: "total",
      header: "Montant Total",
      accessor: (order: Order) => {
        const total = order.items.reduce((acc: number, it: OrderItem) => acc + it.price * it.quantity, 0);
        return <span className="font-bold text-gray-900">{total.toFixed(2)} €</span>;
      },
    },
    {
      key: "time",
      header: "Heure",
      accessor: (order: Order) => (
        <span className="text-xs text-gray-500 font-mono">
          {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      ),
    },
    {
      key: "status",
      header: "Statut",
      accessor: (order: Order) => <StatusPill status={order.status} variant="order" />,
    },
    {
      key: "actions",
      header: "Action",
      accessor: (order: Order) => {
        if (order.status === "served") {
          return (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Servi
            </span>
          );
        }
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAdvanceStatus(order._id, order.status);
            }}
            disabled={updatingId === order._id}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
          >
            {updatingId === order._id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Avancer statut →"}
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-emerald-600" />
            Commandes & Suivi Cuisine
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Supervisez l&apos;avancement des commandes en direct (actualisation auto 5s).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors"
            title="Rafraîchir"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* View Switcher */}
          <div className="flex items-center bg-gray-200/80 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                viewMode === "kanban"
                  ? "bg-white text-emerald-800 shadow-2xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                viewMode === "list"
                  ? "bg-white text-emerald-800 shadow-2xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Liste</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<UtensilsCrossed className="w-5 h-5 text-emerald-600" />}
          label="Commandes du jour"
          value={stats.dailyOrdersCount}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-blue-600" />}
          label="Temps de prépa moyen"
          value={`${stats.avgPrepTimeMinutes} min`}
        />
        <StatCard
          icon={<ChefHat className="w-5 h-5 text-amber-600" />}
          label="Commandes actives"
          value={stats.activeOrdersCount}
        />
      </div>

      {loading ? (
        <div className="py-16 flex justify-center text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : viewMode === "kanban" ? (
        /* KANBAN BOARD VIEW */
        <KanbanBoard
          orders={orders}
          onAdvanceStatus={handleAdvanceStatus}
        />
      ) : (
        /* FILTERABLE LIST VIEW */
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center gap-4 border-b border-gray-100 pb-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                Filtrer par statut
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="preparing">En préparation</option>
                <option value="ready">Prête</option>
                <option value="served">Servie</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                Filtrer par table
              </label>
              <select
                value={tableFilter}
                onChange={(e) => setTableFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="all">Toutes les tables</option>
                {tables.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DataTable data={orders} columns={listColumns} keyExtractor={(o: Order) => o._id} />
        </div>
      )}
    </div>
  );
}
