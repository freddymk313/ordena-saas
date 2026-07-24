"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState, useCallback, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Utensils,
  ShoppingBag,
  Bell,
  Receipt,
  CheckCircle2,
  Clock,
  Star,
  ChevronRight,
  Plus,
  Minus,
  Sparkles,
  AlertCircle,
  X,
  Send,
  HeartHandshake,
  Search,
} from "lucide-react";

interface MenuItemData {
  _id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  photoUrl: string;
  available: boolean;
}

interface CategoryData {
  _id: string;
  name: string;
  order: number;
}

interface OrderItemData {
  menuItemId: string;
  name: string;
  price: number;
  photoUrl: string;
  quantity: number;
}

interface OrderData {
  _id: string;
  tableId: string;
  customerName: string;
  status: "pending" | "preparing" | "ready" | "served";
  estimatedReadyAt: string | null;
  createdAt: string;
  items: OrderItemData[];
}

interface BillData {
  _id: string;
  totalAmount: number;
  status: "pending" | "bill_delivered" | "paid";
  createdAt: string;
}

export default function ClientTablePage({
  params,
}: {
  params: Promise<{ qrToken: string }>;
}) {
  const { qrToken } = use(params);

  // Table & Tenant metadata
  const [loadingSession, setLoadingSession] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [table, setTable] = useState<{ _id: string; label: string; qrToken: string; status: string } | null>(null);
  const [tenant, setTenant] = useState<{ _id: string; name: string; logoUrl?: string; brandColor?: string } | null>(null);

  // Menu data
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [items, setItems] = useState<MenuItemData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Cart state: menuItemId -> quantity
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  const [customerName, setCustomerName] = useState<string>("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Active Orders & Bill polling
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [bill, setBill] = useState<BillData | null>(null);

  // View control: "menu" | "order_status" | "rating" | "rated_thank_you"
  const [activeView, setActiveView] = useState<"menu" | "order_status" | "rating" | "rated_thank_you">("menu");

  // Ratings form state
  const [dishRatings, setDishRatings] = useState<{ [menuItemId: string]: { score: number; comment: string } }>({});
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // UI state
  const [serviceNotice, setServiceNotice] = useState<string | null>(null);
  const [isCallingServer, setIsCallingServer] = useState(false);
  const [isRequestingBill, setIsRequestingBill] = useState(false);

  const brandColor = tenant?.brandColor || "#059669";

  // 1. Initialize Table Session & Cookie
  const initSession = useCallback(async () => {
    try {
      setLoadingSession(true);
      setSessionError(null);

      const res = await fetch("/api/client/table-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrToken }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Session de table invalide");
      }

      const data = await res.json();
      setTable(data.table);
      setTenant(data.tenant);

      // Load menu for tenant
      const menuRes = await fetch(`/api/client/menu?tenantId=${data.tenant._id}`);
      if (menuRes.ok) {
        const menuData = await menuRes.json();
        setCategories(menuData.categories || []);
        setItems(menuData.items || []);
      }
    } catch (err: unknown) {
      setSessionError((err as Error).message || "Erreur de connexion à la table");
    } finally {
      setLoadingSession(false);
    }
  }, [qrToken]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    initSession();
  }, [initSession]);

  // 2. Poll Orders and Bill Status every 4 seconds
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const fetchOrdersAndBill = useCallback(async () => {
    if (!table?._id) return;

    try {
      // Fetch Orders
      const ordersRes = await fetch(`/api/client/orders?tableId=${table._id}`);
      if (ordersRes.ok) {
        const fetchedOrders: OrderData[] = await ordersRes.json();
        setOrders(fetchedOrders);

        // If client has active orders, switch to order_status view if currently on menu
        if (fetchedOrders.length > 0 && activeView === "menu" && Object.keys(cart).length === 0) {
          setActiveView("order_status");
        }
      }

      // Fetch Bill Status
      const billRes = await fetch(`/api/client/bill?tableId=${table._id}`);
      if (billRes.ok) {
        const billData = await billRes.json();
        setBill(billData.bill);

        // If bill is paid and we haven't rated yet, switch to rating view!
        if (billData.isPaid && activeView !== "rating" && activeView !== "rated_thank_you") {
          setActiveView("rating");
        }
      }
    } catch (err) {
      console.error("Polling error client:", err);
    }
  }, [table?._id, activeView, cart]);

  useEffect(() => {
    if (!table?._id) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrdersAndBill();

    const interval = setInterval(() => {
      fetchOrdersAndBill();
    }, 4000);

    return () => clearInterval(interval);
  }, [table?._id, fetchOrdersAndBill]);

  // Cart operations
  const updateQuantity = (menuItemId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[menuItemId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[menuItemId];
        return copy;
      }
      return { ...prev, [menuItemId]: next };
    });
  };

  const cartItemsCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const cartTotalAmount = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = items.find((i) => i._id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  // Handle Order Submit
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!table || !tenant) return;
    if (cartItemsCount === 0) return;

    try {
      setIsSubmittingOrder(true);

      const orderItems = Object.entries(cart).map(([menuItemId, quantity]) => ({
        menuItemId,
        quantity,
      }));

      const res = await fetch("/api/client/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: table._id,
          tenantId: tenant._id,
          customerName: customerName || "Client",
          items: orderItems,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erreur lors de la commande");
      }

      setCart({});
      setIsCartOpen(false);
      setActiveView("order_status");
      await fetchOrdersAndBill();
    } catch (err: unknown) {
      alert((err as Error).message);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Handle Call Server / Request Bill
  const handleTriggerServiceRequest = async (type: "call_server" | "request_bill") => {
    if (!table || !tenant) return;

    try {
      if (type === "call_server") setIsCallingServer(true);
      if (type === "request_bill") setIsRequestingBill(true);

      const res = await fetch("/api/client/service-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: table._id,
          tenantId: tenant._id,
          type,
        }),
      });

      if (res.ok) {
        setServiceNotice(
          type === "call_server"
            ? "🔔 Un serveur a été prévenu et arrive à votre table !"
            : "🧾 Demande d'addition envoyée au serveur !"
        );
        setTimeout(() => setServiceNotice(null), 5000);
        await fetchOrdersAndBill();
      }
    } catch (err) {
      console.error("Service request error:", err);
    } finally {
      setIsCallingServer(false);
      setIsRequestingBill(false);
    }
  };

  // Submit Ratings
  const handleRatingChange = (menuItemId: string, score: number) => {
    setDishRatings((prev) => ({
      ...prev,
      [menuItemId]: {
        score,
        comment: prev[menuItemId]?.comment || "",
      },
    }));
  };

  const handleRatingCommentChange = (menuItemId: string, comment: string) => {
    setDishRatings((prev) => ({
      ...prev,
      [menuItemId]: {
        score: prev[menuItemId]?.score || 5,
        comment,
      },
    }));
  };

  const handleSubmitRatings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;

    try {
      setIsSubmittingRating(true);

      // Collect all unique ordered items across past orders
      const orderedItemIds = new Set<string>();
      orders.forEach((o) => o.items.forEach((i) => orderedItemIds.add(i.menuItemId)));

      const ratingsPayload = Array.from(orderedItemIds).map((id) => ({
        menuItemId: id,
        score: dishRatings[id]?.score || 5,
        comment: dishRatings[id]?.comment || "",
      }));

      const res = await fetch("/api/client/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: tenant._id,
          orderId: orders[0]?._id,
          ratings: ratingsPayload,
        }),
      });

      if (res.ok) {
        setActiveView("rated_thank_you");
      }
    } catch (err) {
      console.error("Submit rating error:", err);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // Filter menu items
  const filteredItems = items.filter((item) => {
    const matchesCat = selectedCategory === "all" || item.categoryId === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Calculate status of overall orders
  const latestOrder = orders[0]; // Most recent order
  const allOrdersServed = orders.length > 0 && orders.every((o) => o.status === "served");

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div
          className="w-12 h-12 rounded-2xl border-4 border-t-transparent animate-spin mb-4"
          style={{ borderColor: `${brandColor} transparent ${brandColor} ${brandColor}` }}
        />
        <p className="text-sm font-semibold text-gray-700">Connexion à votre table...</p>
        <p className="text-xs text-gray-400 mt-1">Génération du menu en direct</p>
      </div>
    );
  }

  if (sessionError || !table || !tenant) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Session de table non trouvée</h1>
        <p className="text-sm text-gray-500 max-w-sm mb-6">
          {sessionError || "Veuillez rescanner le QR code présent sur votre table."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/80 text-gray-900 flex flex-col pb-28 font-sans max-w-md mx-auto relative shadow-xl min-w-[320px]">
      {/* Floating Notice Alert */}
      <AnimatePresence>
        {serviceNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto bg-gray-900 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between text-xs font-medium border border-gray-800"
          >
            <span>{serviceNotice}</span>
            <button onClick={() => setServiceNotice(null)} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Brand Header Banner */}
      <header
        className="sticky top-0 z-30 px-5 py-4 text-white shadow-md transition-colors"
        style={{ backgroundColor: brandColor }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white font-extrabold text-lg border border-white/20">
              {tenant.name.charAt(0)}
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight leading-tight">{tenant.name}</h1>
              <div className="flex items-center gap-1.5 text-xs text-white/90 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                <span>{table.label}</span>
              </div>
            </div>
          </div>

          {/* Tab View Switcher Buttons */}
          <div className="flex items-center gap-2">
            {orders.length > 0 && (
              <button
                onClick={() => setActiveView(activeView === "menu" ? "order_status" : "menu")}
                className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 backdrop-blur-xs"
              >
                {activeView === "menu" ? (
                  <>
                    <Clock className="w-3.5 h-3.5" />
                    <span>Suivi ({orders.length})</span>
                  </>
                ) : (
                  <>
                    <Utensils className="w-3.5 h-3.5" />
                    <span>Menu</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* VIEW 1: MENU VIEW */}
      {activeView === "menu" && (
        <main className="flex-1 p-4 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un plat, une boisson..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs font-medium placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs"
            />
          </div>

          {/* Categories Horizontal Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === "all"
                  ? "bg-gray-900 text-white shadow-xs"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              Tous les plats
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat._id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat._id
                    ? "bg-gray-900 text-white shadow-xs"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          <div className="space-y-3">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const qty = cart[item._id] || 0;

                return (
                  <div
                    key={item._id}
                    className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-2xs flex gap-3.5 items-center justify-between"
                  >
                    {/* Item Photo */}
                    <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden shrink-0 relative">
                      {item.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.photoUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Utensils className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm leading-snug truncate">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">
                        {item.description}
                      </p>
                      <span className="font-extrabold text-gray-900 text-sm mt-1.5 block">
                        {item.price.toFixed(2)} €
                      </span>
                    </div>

                    {/* Add / Quantity Selector */}
                    <div className="shrink-0 flex items-center gap-1">
                      {qty > 0 ? (
                        <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-2 border border-gray-200">
                          <button
                            onClick={() => updateQuantity(item._id, -1)}
                            className="w-7 h-7 rounded-lg bg-white text-gray-800 flex items-center justify-center shadow-2xs font-bold text-xs"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-extrabold text-xs min-w-[14px] text-center">
                            {qty}
                          </span>
                          <button
                            onClick={() => updateQuantity(item._id, 1)}
                            className="w-7 h-7 rounded-lg text-white flex items-center justify-center shadow-2xs font-bold text-xs"
                            style={{ backgroundColor: brandColor }}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => updateQuantity(item._id, 1)}
                          className="px-3 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition-transform active:scale-95"
                          style={{ backgroundColor: brandColor }}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Ajouter</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 text-xs">
                Aucun plat disponible dans cette catégorie.
              </div>
            )}
          </div>
        </main>
      )}

      {/* VIEW 2: ORDER STATUS & COUNTDOWN */}
      {activeView === "order_status" && (
        <main className="flex-1 p-4 space-y-5">
          {/* Header Card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Suivi de votre commande
                </span>
                <h2 className="text-lg font-extrabold text-gray-900">
                  {table.label}
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-100">
                {orders.length} Commande(s)
              </span>
            </div>

            {/* Bill status banner if requested */}
            {bill && (
              <div className="bg-purple-50 rounded-xl p-3 border border-purple-100 flex items-center justify-between text-xs font-bold text-purple-900">
                <div className="flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-purple-600" />
                  <span>Addition ({bill.totalAmount.toFixed(2)} €)</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px]">
                  {bill.status === "pending"
                    ? "En attente"
                    : bill.status === "bill_delivered"
                    ? "Apportée"
                    : "Payée"}
                </span>
              </div>
            )}

            {/* Countdown timer component if not all served */}
            {!allOrdersServed && latestOrder && (
              <OrderCountdownCard order={latestOrder} brandColor={brandColor} />
            )}

            {/* Order status step indicator */}
            {latestOrder && (
              <div className="py-2">
                <StatusStepProgress status={latestOrder.status} brandColor={brandColor} />
              </div>
            )}
          </div>

          {/* List of Ordered Dishes */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs space-y-3">
            <h3 className="font-bold text-sm text-gray-900">Détail des plats commandés</h3>
            <div className="divide-y divide-gray-100">
              {orders.flatMap((o) => o.items).map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-gray-100 font-bold text-gray-800 flex items-center justify-center shrink-0">
                      {item.quantity}x
                    </span>
                    <span className="font-semibold text-gray-900">{item.name}</span>
                  </div>
                  <span className="font-bold text-gray-700">
                    {(item.price * item.quantity).toFixed(2)} €
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between font-extrabold text-sm text-gray-900">
              <span>Total Général</span>
              <span>
                {orders
                  .reduce(
                    (sum, o) =>
                      sum + o.items.reduce((s, i) => s + i.price * i.quantity, 0),
                    0
                  )
                  .toFixed(2)}{" "}
                €
              </span>
            </div>
          </div>
        </main>
      )}

      {/* VIEW 3: RATING VIEW (Triggered after payment) */}
      {activeView === "rating" && (
        <main className="flex-1 p-4 space-y-5">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs space-y-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-extrabold text-gray-900">
              Merci pour votre visite !
            </h2>
            <p className="text-xs text-gray-500">
              Votre addition a été réglée avec succès. Prenez un instant pour noter votre repas chez{" "}
              <strong className="text-gray-900">{tenant.name}</strong>.
            </p>
          </div>

          <form onSubmit={handleSubmitRatings} className="space-y-4">
            {/* List unique ordered dishes */}
            {Array.from(
              new Map(
                orders.flatMap((o) => o.items).map((item) => [item.menuItemId, item])
              ).values()
            ).map((item) => {
              const currentRating = dishRatings[item.menuItemId]?.score || 5;

              return (
                <div
                  key={item.menuItemId}
                  className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                      {item.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.photoUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Utensils className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{item.name}</h4>
                      <p className="text-xs text-gray-400">Comment était ce plat ?</p>
                    </div>
                  </div>

                  {/* 1-5 Star selector */}
                  <div className="flex items-center justify-center gap-2 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(item.menuItemId, star)}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= currentRating ? "fill-amber-400" : "text-gray-200"
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  {/* Comment input */}
                  <input
                    type="text"
                    placeholder="Un commentaire particulier sur ce plat ? (optionnel)"
                    value={dishRatings[item.menuItemId]?.comment || ""}
                    onChange={(e) =>
                      handleRatingCommentChange(item.menuItemId, e.target.value)
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              );
            })}

            <button
              type="submit"
              disabled={isSubmittingRating}
              className="w-full py-3.5 px-4 rounded-xl text-white font-extrabold text-sm shadow-md transition-transform active:scale-98 flex items-center justify-center gap-2"
              style={{ backgroundColor: brandColor }}
            >
              <Send className="w-4 h-4" />
              <span>{isSubmittingRating ? "Envoi..." : "Envoyer mes appréciations"}</span>
            </button>
          </form>
        </main>
      )}

      {/* VIEW 4: RATED THANK YOU */}
      {activeView === "rated_thank_you" && (
        <main className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <HeartHandshake className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900">Merci beaucoup !</h2>
          <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
            Vos retours nous aident à améliorer continuellement la qualité de notre cuisine et de notre service. À très bientôt !
          </p>
        </main>
      )}

      {/* PERMANENT SERVICE ACTION BUTTONS (Appeler le serveur / Demander l'addition) */}
      {/* Appears permanently when orders are active or served */}
      {orders.length > 0 && activeView !== "rating" && activeView !== "rated_thank_you" && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-lg max-w-md mx-auto">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => handleTriggerServiceRequest("call_server")}
              disabled={isCallingServer}
              className="py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs border border-amber-200 transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-95"
            >
              <Bell className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>{isCallingServer ? "Envoi..." : "Appeler serveur"}</span>
            </button>

            <button
              onClick={() => handleTriggerServiceRequest("request_bill")}
              disabled={isRequestingBill}
              className="py-2.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs border border-purple-200 transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-95"
            >
              <Receipt className="w-4 h-4 text-purple-600" />
              <span>{isRequestingBill ? "Envoi..." : "Demander l'addition"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Cart Button Bar (When on Menu view and items selected) */}
      {activeView === "menu" && cartItemsCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-lg max-w-md mx-auto">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-4 rounded-2xl text-white font-extrabold text-sm shadow-md flex items-center justify-between transition-transform active:scale-98"
            style={{ backgroundColor: brandColor }}
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-xs font-bold">
                {cartItemsCount}
              </span>
              <span>Voir mon panier</span>
            </div>
            <div className="flex items-center gap-1">
              <span>{cartTotalAmount.toFixed(2)} €</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* MODAL: CART & CUSTOMER NAME INPUT */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end justify-center">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-t-3xl w-full max-w-md p-5 space-y-5 shadow-2xl max-h-[85vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-gray-800" />
                  <h2 className="font-extrabold text-base text-gray-900">
                    Votre Panier ({cartItemsCount})
                  </h2>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="overflow-y-auto flex-1 space-y-3 pr-1">
                {Object.entries(cart).map(([itemId, qty]) => {
                  const item = items.find((i) => i._id === itemId);
                  if (!item) return null;

                  return (
                    <div
                      key={itemId}
                      className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <h4 className="font-bold text-gray-900">{item.name}</h4>
                        <span className="text-gray-500 font-medium">
                          {(item.price * qty).toFixed(2)} €
                        </span>
                      </div>

                      <div className="flex items-center bg-white rounded-xl p-1 gap-2 border border-gray-200">
                        <button
                          onClick={() => updateQuantity(itemId, -1)}
                          className="w-6 h-6 rounded-lg bg-gray-100 text-gray-800 flex items-center justify-center font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold min-w-[14px] text-center">{qty}</span>
                        <button
                          onClick={() => updateQuantity(itemId, 1)}
                          className="w-6 h-6 rounded-lg text-white flex items-center justify-center font-bold"
                          style={{ backgroundColor: brandColor }}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Customer Name Input & Order Button */}
              <form onSubmit={handlePlaceOrder} className="space-y-4 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Votre prénom (pour l&apos;annonce de commande)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Lucas, Sophie..."
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-between text-sm font-extrabold text-gray-900 pt-1">
                  <span>Total à payer</span>
                  <span>{cartTotalAmount.toFixed(2)} €</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingOrder}
                  className="w-full py-3.5 px-4 rounded-2xl text-white font-extrabold text-sm shadow-md transition-transform active:scale-98 flex items-center justify-center gap-2"
                  style={{ backgroundColor: brandColor }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isSubmittingOrder ? "Validation..." : "Envoyer la commande en cuisine"}
                  </span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * COUNTDOWN TIMER COMPONENT
 * Animated Progress Bar using Framer Motion
 */
function OrderCountdownCard({
  order,
  brandColor,
}: {
  order: OrderData;
  brandColor: string;
}) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  const readyTime = order.estimatedReadyAt ? new Date(order.estimatedReadyAt).getTime() : 0;
  const createdTime = order.createdAt ? new Date(order.createdAt).getTime() : 0;
  const totalSeconds = readyTime && createdTime ? Math.max(60, Math.floor((readyTime - createdTime) / 1000)) : 900;

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const remaining = readyTime ? Math.max(0, Math.floor((readyTime - now) / 1000)) : 0;
      setSecondsRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [readyTime]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  // Calculate percentage elapsed
  const elapsed = totalSeconds - secondsRemaining;
  const progressPercent = Math.min(100, Math.max(0, (elapsed / totalSeconds) * 100));

  return (
    <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-100 space-y-3">
      <div className="flex items-center justify-between text-xs font-extrabold text-emerald-900">
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-emerald-600 animate-spin" />
          <span>Temps de préparation estimé</span>
        </div>
        <span className="font-mono text-sm font-black">
          {secondsRemaining > 0
            ? `${minutes}m ${seconds < 10 ? "0" : ""}${seconds}s`
            : "Imminent !"}
        </span>
      </div>

      {/* Animated Framer Motion Progress Bar */}
      <div className="w-full h-3 bg-emerald-200/60 rounded-full overflow-hidden p-0.5">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: brandColor }}
          initial={{ width: "0%" }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

/**
 * STATUS STEP INDICATOR
 */
function StatusStepProgress({
  status,
  brandColor,
}: {
  status: OrderData["status"];
  brandColor: string;
}) {
  const steps = [
    { key: "pending", label: "Reçue" },
    { key: "preparing", label: "En préparation" },
    { key: "ready", label: "Prête" },
    { key: "served", label: "Servie" },
  ];

  const getStepIndex = (s: string) => {
    switch (s) {
      case "pending":
        return 0;
      case "preparing":
        return 1;
      case "ready":
        return 2;
      case "served":
        return 3;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className="grid grid-cols-4 gap-1 relative">
      {steps.map((step, idx) => {
        const isPassed = idx <= currentIndex;
        const isCurrent = idx === currentIndex;

        return (
          <div key={step.key} className="flex flex-col items-center text-center space-y-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                isCurrent
                  ? "ring-2 ring-emerald-400 ring-offset-2 text-white shadow-xs"
                  : isPassed
                  ? "text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
              style={{
                backgroundColor: isPassed ? brandColor : undefined,
              }}
            >
              {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
            </div>
            <span
              className={`text-[10px] font-bold ${
                isCurrent ? "text-gray-900" : isPassed ? "text-gray-700" : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
