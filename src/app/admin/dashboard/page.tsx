"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import {
  DollarSign,
  Receipt,
  ShoppingBag,
  Star,
  Award,
  Flame,
  Clock,
  RotateCcw,
  Sparkles,
  Utensils,
} from "lucide-react";

interface DashboardData {
  period: string;
  totalRevenue: number;
  averageBill: number;
  totalOrders: number;
  paidBillsCount: number;
  rushHours: { hour: string; hourNum: number; commandes: number }[];
  topOrderedDishes: {
    _id: string;
    name: string;
    price: number;
    photoUrl?: string;
    orderCount: number;
  }[];
  topRatedDishes: {
    _id: string;
    name: string;
    price: number;
    photoUrl?: string;
    avgRating: number;
    reviewCount: number;
  }[];
}

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState<"today" | "7d" | "30d" | "all">("7d");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/dashboard?period=${period}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Fetch dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      if (isMounted) await fetchDashboardData();
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [fetchDashboardData]);

  // Find maximum rush hour for highlight color
  const maxRushOrders = data
    ? Math.max(...data.rushHours.map((h) => h.commandes), 1)
    : 1;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Header & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Tableau de Bord Analytique
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Vue d&apos;ensemble du chiffre d&apos;affaires, des heures de rush et des performances du menu
              </p>
            </div>
          </div>
        </div>

        {/* Period Filter Buttons */}
        <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
          {[
            { id: "today", label: "Aujourd'hui" },
            { id: "7d", label: "7 derniers jours" },
            { id: "30d", label: "30 jours" },
            { id: "all", label: "Tout l'historique" },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id as typeof period)}
              className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-all ${
                period === p.id
                  ? "bg-white text-gray-900 shadow-xs border border-gray-200/80"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {p.label}
            </button>
          ))}

          <button
            onClick={() => fetchDashboardData()}
            className="p-1.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-200/60 transition-colors ml-1"
            title="Rafraîchir"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. STAT CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Stat 1: Chiffre d'Affaires */}
        <StatCard
          title="Chiffre d'Affaires"
          value={loading ? "..." : `${(data?.totalRevenue || 0).toFixed(2)} €`}
          subtext={`Sur ${data?.paidBillsCount || 0} additions réglées`}
          icon={<DollarSign className="w-6 h-6 text-emerald-600" />}
          iconBg="bg-emerald-50 text-emerald-600 border border-emerald-100"
          accentColor="text-emerald-600"
        />

        {/* Stat 2: Montant Moyen Addition */}
        <StatCard
          title="Panier Moyen (Ticket)"
          value={loading ? "..." : `${(data?.averageBill || 0).toFixed(2)} €`}
          subtext="Montant moyen dépensé par table"
          icon={<Receipt className="w-6 h-6 text-purple-600" />}
          iconBg="bg-purple-50 text-purple-600 border border-purple-100"
          accentColor="text-purple-600"
        />

        {/* Stat 3: Nombre de Commandes */}
        <StatCard
          title="Total Commandes"
          value={loading ? "..." : `${data?.totalOrders || 0}`}
          subtext="Commandes enregistrées en salle"
          icon={<ShoppingBag className="w-6 h-6 text-amber-600" />}
          iconBg="bg-amber-50 text-amber-600 border border-amber-100"
          accentColor="text-amber-600"
        />
      </div>

      {/* 2. BAR CHART: HEURES DE RUSH */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-gray-900 tracking-tight">
                Analyse des Heures de Rush
              </h2>
              <p className="text-xs text-gray-500">
                Nombre de commandes passées par tranche horaire (00h - 23h)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Pic d&apos;affluence en ambre foncé</span>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="h-72 w-full pt-4">
          {loading ? (
            <div className="h-full flex items-center justify-center text-xs text-gray-400 font-medium animate-pulse">
              Chargement du graphique des heures de rush...
            </div>
          ) : data?.rushHours ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.rushHours}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="hour"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                  interval={1}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(241, 245, 249, 0.6)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const hourData = payload[0].payload as {
                        hour: string;
                        commandes: number;
                      };
                      return (
                        <div className="bg-gray-900 text-white p-3 rounded-xl shadow-lg border border-gray-800 text-xs font-bold space-y-1">
                          <p className="text-amber-400 font-extrabold">
                            Tranche {hourData.hour}
                          </p>
                          <p className="text-gray-200">
                            {hourData.commandes} commande
                            {hourData.commandes > 1 ? "s" : ""}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="commandes" radius={[6, 6, 0, 0]}>
                  {data.rushHours.map((entry, index) => {
                    const ratio = maxRushOrders > 0 ? entry.commandes / maxRushOrders : 0;
                    // Darker amber for peak rush hours
                    const barColor =
                      entry.commandes === 0
                        ? "#e2e8f0"
                        : ratio > 0.6
                        ? "#f59e0b"
                        : "#fbbf24";

                    return <Cell key={`cell-${index}`} fill={barColor} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-gray-400">
              Aucune donnée horaire disponible
            </div>
          )}
        </div>
      </div>

      {/* 3. RANKINGS GRID: TOP ORDERED & TOP RATED */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Ordered Dishes */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-gray-900">
                  Plats les Plus Commandés
                </h3>
                <p className="text-xs text-gray-500">Volume de vente total sur la période</p>
              </div>
            </div>
            <Award className="w-5 h-5 text-amber-500" />
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="p-8 text-center text-xs text-gray-400 font-medium animate-pulse">
                Chargement du classement...
              </div>
            ) : data?.topOrderedDishes && data.topOrderedDishes.length > 0 ? (
              data.topOrderedDishes.map((dish, rank) => (
                <div
                  key={dish._id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/70 border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                        rank === 0
                          ? "bg-amber-500 text-white shadow-2xs"
                          : rank === 1
                          ? "bg-gray-300 text-gray-800"
                          : rank === 2
                          ? "bg-amber-700/20 text-amber-900"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      #{rank + 1}
                    </span>

                    {dish.photoUrl ? (
                      <Image
                        src={dish.photoUrl}
                        alt={dish.name}
                        width={40}
                        height={40}
                        unoptimized
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-xl object-cover shrink-0 border border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gray-200 text-gray-500 flex items-center justify-center shrink-0">
                        <Utensils className="w-5 h-5" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="font-extrabold text-sm text-gray-900 truncate">
                        {dish.name}
                      </p>
                      <p className="text-xs font-bold text-gray-500">
                        {dish.price.toFixed(2)} €
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs border border-amber-200">
                      {dish.orderCount} vendu{dish.orderCount > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-2xl">
                Aucune donnée de commande sur cette période.
              </div>
            )}
          </div>
        </div>

        {/* Top Rated Dishes */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
                <Star className="w-5 h-5 fill-amber-500" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-gray-900">
                  Plats les Mieux Notés
                </h3>
                <p className="text-xs text-gray-500">
                  Moyenne des notes et avis clients (Rating)
                </p>
              </div>
            </div>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="p-8 text-center text-xs text-gray-400 font-medium animate-pulse">
                Chargement des notes...
              </div>
            ) : data?.topRatedDishes && data.topRatedDishes.length > 0 ? (
              data.topRatedDishes.map((dish, rank) => (
                <div
                  key={dish._id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/70 border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                        rank === 0
                          ? "bg-amber-500 text-white shadow-2xs"
                          : rank === 1
                          ? "bg-gray-300 text-gray-800"
                          : rank === 2
                          ? "bg-amber-700/20 text-amber-900"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      #{rank + 1}
                    </span>

                    {dish.photoUrl ? (
                      <Image
                        src={dish.photoUrl}
                        alt={dish.name}
                        width={40}
                        height={40}
                        unoptimized
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-xl object-cover shrink-0 border border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gray-200 text-gray-500 flex items-center justify-center shrink-0">
                        <Utensils className="w-5 h-5" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="font-extrabold text-sm text-gray-900 truncate">
                        {dish.name}
                      </p>
                      <p className="text-xs font-bold text-gray-500">
                        {dish.price.toFixed(2)} €
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-full font-black text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{dish.avgRating > 0 ? dish.avgRating.toFixed(1) : "5.0"}</span>
                    </div>
                    <span className="text-[11px] font-bold text-gray-400">
                      ({dish.reviewCount} avis)
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-2xl">
                Aucun avis enregistré pour l&apos;instant.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * STAT CARD COMPONENT
 */
function StatCard({
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
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs space-y-4 relative overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2.5 rounded-2xl ${iconBg}`}>{icon}</div>
      </div>

      <div>
        <p className={`text-3xl font-black tracking-tight ${accentColor}`}>{value}</p>
        <p className="text-xs font-semibold text-gray-400 mt-1">{subtext}</p>
      </div>
    </motion.div>
  );
}
