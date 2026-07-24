"use client";

import React, { useState, useEffect, useCallback } from "react";
import StatCard from "@/components/ui-custom/StatCard";
import StatusPill from "@/components/ui-custom/StatusPill";
import DataTable, { Column } from "@/components/ui-custom/DataTable";
import {
  Receipt,
  Euro,
  CreditCard,
  Clock,
  Loader2,
  CheckCircle2,
  X,
  FileText,
  ChevronRight,
  Filter,
} from "lucide-react";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface BillOrder {
  _id: string;
  customerName?: string;
  items: OrderItem[];
}

interface Bill {
  _id: string;
  tableId: string;
  tableLabel: string;
  totalAmount: number;
  status: "pending" | "bill_delivered" | "paid";
  createdAt: string;
  orders: BillOrder[];
}

export default function AdminBillingPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [stats, setStats] = useState({
    periodRevenue: 0,
    averageBillAmount: 0,
    paidBillsCount: 0,
    pendingBillsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("7d");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Detail Modal State
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  const fetchBills = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/billing?period=${period}&status=${statusFilter}`);
      const data = await res.json();
      if (res.ok) {
        setBills(data.bills || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (e) {
      console.error("Error fetching bills:", e);
    } finally {
      setLoading(false);
    }
  }, [period, statusFilter]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const handleUpdateStatus = async (billId: string, nextStatus: "bill_delivered" | "paid") => {
    setUpdatingId(billId);
    try {
      const res = await fetch("/api/admin/billing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billId, nextStatus }),
      });
      if (res.ok) {
        if (selectedBill && selectedBill._id === billId) {
          setSelectedBill((prev) => (prev ? { ...prev, status: nextStatus } : null));
        }
        fetchBills();
      }
    } catch (e) {
      console.error("Error updating bill status:", e);
    } finally {
      setUpdatingId(null);
    }
  };

  const columns: Column<Bill>[] = [
    {
      key: "table",
      header: "Table",
      accessor: (bill: Bill) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
            {bill.tableLabel.replace("Table ", "")}
          </div>
          <div>
            <p className="font-bold text-gray-900">{bill.tableLabel}</p>
            <p className="text-[10px] text-gray-400">
              {new Date(bill.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "ordersCount",
      header: "Commandes liées",
      accessor: (bill: Bill) => (
        <span className="text-xs text-gray-600 font-medium">
          {bill.orders.length} commande(s)
        </span>
      ),
    },
    {
      key: "total",
      header: "Montant Total",
      accessor: (bill: Bill) => (
        <span className="font-extrabold text-gray-900 text-sm">
          {bill.totalAmount.toFixed(2)} €
        </span>
      ),
    },
    {
      key: "status",
      header: "Statut Addition",
      accessor: (bill: Bill) => <StatusPill status={bill.status} variant="bill" />,
    },
    {
      key: "actions",
      header: "Actions",
      accessor: (bill: Bill) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {bill.status === "pending" && (
            <button
              onClick={() => handleUpdateStatus(bill._id, "bill_delivered")}
              disabled={updatingId === bill._id}
              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors"
            >
              {updatingId === bill._id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Apportée"}
            </button>
          )}

          {bill.status !== "paid" && (
            <button
              onClick={() => handleUpdateStatus(bill._id, "paid")}
              disabled={updatingId === bill._id}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
            >
              {updatingId === bill._id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Marquer Payée"}
            </button>
          )}

          {bill.status === "paid" && (
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Réglée
            </span>
          )}

          <button
            onClick={() => setSelectedBill(bill)}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <Receipt className="w-6 h-6 text-emerald-600" />
          Additions & Factures
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Historique des factures et encaissements des clients par table.
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<Euro className="w-5 h-5 text-emerald-600" />}
          label="Chiffre d'affaires (période)"
          value={`${stats.periodRevenue.toFixed(2)} €`}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          icon={<CreditCard className="w-5 h-5 text-blue-600" />}
          label="Montant moyen addition"
          value={`${stats.averageBillAmount.toFixed(2)} €`}
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-purple-600" />}
          label="Additions en attente"
          value={stats.pendingBillsCount}
        />
      </div>

      {/* Controls & Data Table */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="font-bold text-xs text-gray-700 uppercase tracking-wider">Filtres</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Period selector */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-gray-500 font-medium">Période :</span>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-xl bg-white font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="today">Aujourd&apos;hui</option>
                <option value="7d">7 derniers jours</option>
                <option value="30d">30 derniers jours</option>
                <option value="all">Tout l&apos;historique</option>
              </select>
            </div>

            {/* Status selector */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-gray-500 font-medium">Statut :</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-xl bg-white font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">Addition demandée</option>
                <option value="bill_delivered">Addition apportée</option>
                <option value="paid">Payée</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <DataTable
            data={bills}
            columns={columns}
            keyExtractor={(b: Bill) => b._id}
            onRowClick={(b: Bill) => setSelectedBill(b)}
          />
        )}
      </div>

      {/* Bill Detail Modal */}
      {selectedBill && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-5 shadow-xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-gray-900 text-base">
                  Détail Addition — {selectedBill.tableLabel}
                </h3>
              </div>
              <button onClick={() => setSelectedBill(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl text-xs">
              <div>
                <p className="text-gray-500">Statut actuel :</p>
                <StatusPill status={selectedBill.status} variant="bill" />
              </div>
              <div className="text-right">
                <p className="text-gray-500">Montant Total :</p>
                <span className="text-lg font-black text-gray-900">
                  {selectedBill.totalAmount.toFixed(2)} €
                </span>
              </div>
            </div>

            {/* Orders breakdown */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider">
                Articles commandés ({selectedBill.orders.length} commande(s))
              </h4>

              {selectedBill.orders.length === 0 ? (
                <p className="text-xs text-gray-400">Aucun détail de commande disponible</p>
              ) : (
                selectedBill.orders.map((ord, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-xl space-y-1.5 text-xs">
                    <div className="flex justify-between font-bold text-gray-800 border-b border-gray-200/60 pb-1">
                      <span>Commande #{idx + 1}</span>
                      {ord.customerName && (
                        <span className="text-emerald-700">Client: {ord.customerName}</span>
                      )}
                    </div>
                    <div className="space-y-1 pt-1">
                      {ord.items.map((it, itemIdx) => (
                        <div key={itemIdx} className="flex justify-between text-gray-600">
                          <span>{it.quantity}x {it.name}</span>
                          <span className="font-mono">{(it.price * it.quantity).toFixed(2)} €</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Action buttons */}
            <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedBill(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Fermer
              </button>

              {selectedBill.status !== "paid" && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedBill._id, "paid")}
                  disabled={updatingId === selectedBill._id}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  {updatingId === selectedBill._id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Marquer Facture Payée</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
