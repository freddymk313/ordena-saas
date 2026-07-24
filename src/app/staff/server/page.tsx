"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Receipt,
  CheckCircle2,
  Volume2,
  VolumeX,
  RotateCcw,
  Clock,
  CreditCard,
  Utensils,
  Play,
} from "lucide-react";

interface ServiceRequestItem {
  _id: string;
  tenantId: string;
  tableId: string;
  tableLabel: string;
  type: "call_server" | "request_bill";
  status: "pending" | "handled";
  createdAt: string;
  bill?: {
    _id: string;
    totalAmount: number;
    status: string;
  } | null;
}

interface ReadyOrderItem {
  _id: string;
  tableId: string;
  tableLabel: string;
  customerName: string;
  status: string;
  createdAt: string;
  items: { name: string; price: number; quantity: number }[];
}

export default function ServerPage() {
  const [requests, setRequests] = useState<ServiceRequestItem[]>([]);
  const [readyOrders, setReadyOrders] = useState<ReadyOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Pure time tick state
  const [nowTimestamp, setNowTimestamp] = useState<number>(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNowTimestamp(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Track previous counts to detect new calls
  const [prevCallCount, setPrevCallCount] = useState(0);
  const [prevBillCount, setPrevBillCount] = useState(0);

  // Audio Context synthesizer for distinct alerts
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSoundAlert = useCallback(
    (type: "call_server" | "request_bill") => {
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

        if (type === "call_server") {
          // Urgent double bell chime (Amber)
          const osc1 = ctx.createOscillator();
          const gain1 = ctx.createGain();
          osc1.type = "sine";
          osc1.frequency.setValueAtTime(880, now); // A5
          gain1.gain.setValueAtTime(0.2, now);
          gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc1.connect(gain1);
          gain1.connect(ctx.destination);
          osc1.start(now);
          osc1.stop(now + 0.25);

          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = "sine";
          osc2.frequency.setValueAtTime(1046.5, now + 0.15); // C6
          gain2.gain.setValueAtTime(0.25, now + 0.15);
          gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start(now + 0.15);
          osc2.stop(now + 0.5);
        } else {
          // Cash register coin chime (Purple)
          const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5 -> E5 -> G5 -> C6
          freqs.forEach((freq, idx) => {
            const startTime = now + idx * 0.08;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0.2, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + 0.3);
          });
        }
      } catch (err) {
        console.error("Audio synth error:", err);
      }
    },
    [soundEnabled]
  );

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/staff/service-requests");
      if (res.ok) {
        const data = await res.json();
        const fetchedRequests: ServiceRequestItem[] = data.serviceRequests || [];
        setRequests(fetchedRequests);
        setReadyOrders(data.readyOrders || []);
        // Detect new incoming service requests
        const callCount = fetchedRequests.filter((r) => r.type === "call_server").length;
        const billCount = fetchedRequests.filter((r) => r.type === "request_bill").length;

        if (callCount > prevCallCount && prevCallCount !== 0) {
          playSoundAlert("call_server");
        } else if (billCount > prevBillCount && prevBillCount !== 0) {
          playSoundAlert("request_bill");
        }

        setPrevCallCount(callCount);
        setPrevBillCount(billCount);
      }
    } catch (err) {
      console.error("Fetch server requests error:", err);
    } finally {
      setLoading(false);
    }
  }, [prevCallCount, prevBillCount, playSoundAlert]);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      if (isMounted) await fetchData();
    };
    run();
    const interval = setInterval(fetchData, 3000); // 3 sec polling
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fetchData]);

  // Execute Service Action
  const handleAction = async (
    requestId: string,
    action: "mark_handled" | "mark_served" | "mark_paid",
    tableId?: string
  ) => {
    try {
      const res = await fetch(`/api/staff/service-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, tableId }),
      });

      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error("Service request action error:", err);
    }
  };

  // Group service requests by type
  const callServerRequests = requests.filter((r) => r.type === "call_server");
  const requestBillRequests = requests.filter((r) => r.type === "request_bill");

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            <Bell className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
                Console Service & Salle
              </h1>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Appels serveur, demandes d&apos;addition et gestion des encaissements
            </p>
          </div>
        </div>

        {/* Audio Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Audio Test Buttons */}
          <button
            onClick={() => playSoundAlert("call_server")}
            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-colors flex items-center gap-1"
          >
            <Play className="w-3 h-3 text-amber-600" />
            <span>Test Appel</span>
          </button>

          <button
            onClick={() => playSoundAlert("request_bill")}
            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold transition-colors flex items-center gap-1"
          >
            <Play className="w-3 h-3 text-purple-600" />
            <span>Test Addition</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
              soundEnabled
                ? "bg-purple-50 border-purple-200 text-purple-900 hover:bg-purple-100"
                : "bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-purple-600" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? "Sons On" : "Mute"}</span>
          </button>

          {/* Refresh */}
          <button
            onClick={() => fetchData()}
            className="p-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alert Banners / Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Call Server Alert Card */}
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-base shadow-xs">
              {callServerRequests.length}
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-amber-950">Appels Serveur</h3>
              <p className="text-xs text-amber-800/80 font-medium">Clients attendant un serveur</p>
            </div>
          </div>
          <Bell className="w-6 h-6 text-amber-600 animate-bounce" />
        </div>

        {/* Bill Request Alert Card */}
        <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-base shadow-xs">
              {requestBillRequests.length}
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-purple-950">Demandes Addition</h3>
              <p className="text-xs text-purple-800/80 font-medium">Prêts pour encaissement</p>
            </div>
          </div>
          <Receipt className="w-6 h-6 text-purple-600 animate-pulse" />
        </div>

        {/* Ready Dishes Alert Card */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-xs">
              {readyOrders.length}
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-emerald-950">Plats Prêts</h3>
              <p className="text-xs text-emerald-800/80 font-medium">En attente d&apos;envoi en salle</p>
            </div>
          </div>
          <Utensils className="w-6 h-6 text-emerald-600" />
        </div>
      </div>

      {/* KANBAN BOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* COLUMN 1: APPELS SERVEUR */}
        <div className="space-y-3 min-w-0">
          <div className="flex items-center justify-between p-3.5 rounded-2xl border-l-4 border-amber-500 bg-amber-50/70 border-y border-r border-amber-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-600 animate-pulse" />
              <h3 className="font-extrabold text-sm text-amber-950">
                1. Appels Serveur ({callServerRequests.length})
              </h3>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-200/60 px-2.5 py-0.5 rounded-full">
              Urgent
            </span>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="p-8 text-center text-xs text-gray-400 font-medium animate-pulse">
                Chargement des appels...
              </div>
            ) : callServerRequests.length > 0 ? (
              callServerRequests.map((req) => (
                <CallServerCard
                  key={req._id}
                  request={req}
                  nowTimestamp={nowTimestamp}
                  onMarkHandled={() => handleAction(req._id, "mark_handled", req.tableId)}
                  onMarkServed={() => handleAction(req._id, "mark_served", req.tableId)}
                />
              ))
            ) : (
              <div className="p-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-2xl bg-white/50 font-medium">
                Aucun appel serveur en attente.
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 2: DEMANDES ADDITION */}
        <div className="space-y-3 min-w-0">
          <div className="flex items-center justify-between p-3.5 rounded-2xl border-l-4 border-purple-600 bg-purple-50/70 border-y border-r border-purple-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-purple-600" />
              <h3 className="font-extrabold text-sm text-purple-950">
                2. Demandes d&apos;Addition ({requestBillRequests.length})
              </h3>
            </div>
            <span className="text-xs font-bold text-purple-800 bg-purple-200/60 px-2.5 py-0.5 rounded-full">
              Encaissement
            </span>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="p-8 text-center text-xs text-gray-400 font-medium animate-pulse">
                Chargement des demandes d&apos;addition...
              </div>
            ) : requestBillRequests.length > 0 ? (
              requestBillRequests.map((req) => (
                <RequestBillCard
                  key={req._id}
                  request={req}
                  nowTimestamp={nowTimestamp}
                  onMarkHandled={() => handleAction(req._id, "mark_handled", req.tableId)}
                  onMarkPaid={() => handleAction(req._id, "mark_paid", req.tableId)}
                />
              ))
            ) : (
              <div className="p-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-2xl bg-white/50 font-medium">
                Aucune demande d&apos;addition en attente.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AUXILIARY PANEL: PLATS PRÊTS À SERVIR */}
      {readyOrders.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-gray-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-emerald-600" />
              <h2 className="font-extrabold text-base text-gray-900">
                Plats sortis de cuisine prêts à servir ({readyOrders.length})
              </h2>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100">
              Prêt pour envoi en table
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {readyOrders.map((order) => (
              <div
                key={order._id}
                className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-gray-900 bg-white px-2.5 py-1 rounded-xl shadow-2xs">
                    {order.tableLabel}
                  </span>
                  <span className="text-xs font-bold text-gray-600">
                    {order.customerName}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-gray-800">
                      <span>{item.quantity}x {item.name}</span>
                      <span className="font-bold">{(item.price * item.quantity).toFixed(2)} €</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleAction(order._id, "mark_served", order.tableId)}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-2xs transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Marquer servi 🍽️</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * CALL SERVER CARD COMPONENT (Appel Serveur)
 */
function CallServerCard({
  request,
  nowTimestamp,
  onMarkHandled,
  onMarkServed,
}: {
  request: ServiceRequestItem;
  nowTimestamp: number;
  onMarkHandled: () => void;
  onMarkServed: () => void;
}) {
  const minutesAgo = Math.max(
    0,
    Math.floor((nowTimestamp - new Date(request.createdAt).getTime()) / 60000)
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-amber-50/30 rounded-2xl p-4 border-2 border-amber-400 shadow-xs space-y-3 relative overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-amber-200/60 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-black text-base text-gray-900 bg-white px-3 py-1 rounded-xl border border-amber-300 shadow-2xs">
            {request.tableLabel}
          </span>
          <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-200">
            🔔 Appelle le serveur
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-900 bg-white px-2 py-1 rounded-lg border border-amber-200">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>{minutesAgo} min</span>
        </div>
      </div>

      <p className="text-xs text-amber-950 font-medium">
        Un client à la <strong className="font-extrabold">{request.tableLabel}</strong> sollicite un serveur en table.
      </p>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={onMarkHandled}
          className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-2xs transition-transform active:scale-95 flex items-center justify-center gap-1.5"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Marquer traité</span>
        </button>

        <button
          onClick={onMarkServed}
          className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-2xs transition-transform active:scale-95 flex items-center justify-center gap-1.5"
        >
          <Utensils className="w-4 h-4" />
          <span>Marquer servi</span>
        </button>
      </div>
    </motion.div>
  );
}

/**
 * REQUEST BILL CARD COMPONENT (Demande Addition)
 */
function RequestBillCard({
  request,
  nowTimestamp,
  onMarkHandled,
  onMarkPaid,
}: {
  request: ServiceRequestItem;
  nowTimestamp: number;
  onMarkHandled: () => void;
  onMarkPaid: () => void;
}) {
  const minutesAgo = Math.max(
    0,
    Math.floor((nowTimestamp - new Date(request.createdAt).getTime()) / 60000)
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-purple-50/30 rounded-2xl p-4 border-2 border-purple-400 shadow-xs space-y-3 relative overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-purple-200/60 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-black text-base text-gray-900 bg-white px-3 py-1 rounded-xl border border-purple-300 shadow-2xs">
            {request.tableLabel}
          </span>
          <span className="text-xs font-bold text-purple-900 bg-purple-100 px-2.5 py-0.5 rounded-lg border border-purple-200">
            🧾 Demande l&apos;addition
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs font-mono font-bold text-purple-900 bg-white px-2 py-1 rounded-lg border border-purple-200">
          <Clock className="w-3.5 h-3.5 text-purple-600" />
          <span>{minutesAgo} min</span>
        </div>
      </div>

      {request.bill && (
        <div className="bg-white p-3 rounded-xl border border-purple-200 flex items-center justify-between text-xs font-bold text-purple-950">
          <span>Montant Total à encaisser :</span>
          <span className="text-sm font-black text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
            {request.bill.totalAmount.toFixed(2)} €
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={onMarkHandled}
          className="py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-2xs transition-transform active:scale-95 flex items-center justify-center gap-1.5"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Marquer traité</span>
        </button>

        <button
          onClick={onMarkPaid}
          className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-2xs transition-transform active:scale-95 flex items-center justify-center gap-1.5"
        >
          <CreditCard className="w-4 h-4" />
          <span>Facture payée 💶</span>
        </button>
      </div>
    </motion.div>
  );
}
