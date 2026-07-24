"use client";

import React, { useState, useEffect, useCallback } from "react";
import StatusPill from "@/components/ui-custom/StatusPill";
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  UtensilsCrossed,
  Image as ImageIcon,
  Loader2,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

interface Category {
  _id: string;
  name: string;
  order: number;
}

interface MenuItem {
  _id: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  photoUrl?: string;
  available: boolean;
}

export default function AdminMenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [addingCat, setAddingCat] = useState(false);

  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemName, setItemName] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemPhoto, setItemPhoto] = useState("");
  const [itemAvailable, setItemAvailable] = useState(true);
  const [savingItem, setSavingItem] = useState(false);

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCats(true);
      const res = await fetch("/api/admin/menu/categories");
      const data = await res.json();
      if (res.ok) {
        setCategories(data.categories || []);
        if (data.categories?.length > 0 && !selectedCategory) {
          setSelectedCategory(data.categories[0]._id);
        }
      }
    } catch (e) {
      console.error("Error fetching categories:", e);
    } finally {
      setLoadingCats(false);
    }
  }, [selectedCategory]);

  const fetchItems = useCallback(async () => {
    try {
      setLoadingItems(true);
      const res = await fetch("/api/admin/menu/items");
      const data = await res.json();
      if (res.ok) {
        setItems(data.items || []);
      }
    } catch (e) {
      console.error("Error fetching items:", e);
    } finally {
      setLoadingItems(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, [fetchCategories, fetchItems]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setAddingCat(true);
    try {
      const res = await fetch("/api/admin/menu/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackMsg({ type: "success", text: "Catégorie ajoutée avec succès !" });
        setNewCatName("");
        setShowAddCatModal(false);
        fetchCategories();
      } else {
        setFeedbackMsg({ type: "error", text: data.error || "Échec ajout catégorie" });
      }
    } catch (e) {
      setFeedbackMsg({ type: "error", text: "Erreur serveur" });
    } finally {
      setAddingCat(false);
    }
  };

  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (!confirm(`Supprimer la catégorie "${catName}" et tous ses plats associés ?`)) return;
    try {
      const res = await fetch(`/api/admin/menu/categories?id=${catId}`, { method: "DELETE" });
      if (res.ok) {
        setFeedbackMsg({ type: "success", text: "Catégorie supprimée." });
        if (selectedCategory === catId) setSelectedCategory(null);
        fetchCategories();
        fetchItems();
      }
    } catch (e) {
      setFeedbackMsg({ type: "error", text: "Erreur suppression" });
    }
  };

  const handleToggleAvailable = async (item: MenuItem) => {
    const newStatus = !item.available;
    setItems((prev) =>
      prev.map((i) => (i._id === item._id ? { ...i, available: newStatus } : i))
    );

    try {
      const res = await fetch("/api/admin/menu/items", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item._id, available: newStatus }),
      });
      if (!res.ok) {
        setItems((prev) =>
          prev.map((i) => (i._id === item._id ? { ...i, available: item.available } : i))
        );
      }
    } catch (e) {
      fetchItems();
    }
  };

  const openCreateItemModal = () => {
    setEditingItem(null);
    setItemName("");
    setItemDesc("");
    setItemPrice("");
    setItemPhoto("");
    setItemAvailable(true);
    setShowItemModal(true);
  };

  const openEditItemModal = (item: MenuItem) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemDesc(item.description || "");
    setItemPrice(item.price.toString());
    setItemPhoto(item.photoUrl || "");
    setItemAvailable(item.available);
    setShowItemModal(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !itemPrice || !selectedCategory) return;
    setSavingItem(true);
    try {
      const payload = {
        id: editingItem?._id,
        categoryId: selectedCategory,
        name: itemName.trim(),
        description: itemDesc.trim(),
        price: parseFloat(itemPrice),
        photoUrl: itemPhoto.trim(),
        available: itemAvailable,
      };

      const res = await fetch("/api/admin/menu/items", {
        method: editingItem ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedbackMsg({
          type: "success",
          text: editingItem ? "Plat modifié !" : "Plat créé avec succès !",
        });
        setShowItemModal(false);
        fetchItems();
      } else {
        setFeedbackMsg({ type: "error", text: data.error || "Erreur enregistrement plat" });
      }
    } catch (e) {
      setFeedbackMsg({ type: "error", text: "Erreur serveur" });
    } finally {
      setSavingItem(false);
    }
  };

  const handleDeleteItem = async (itemId: string, name: string) => {
    if (!confirm(`Supprimer le plat "${name}" ?`)) return;
    try {
      const res = await fetch(`/api/admin/menu/items?id=${itemId}`, { method: "DELETE" });
      if (res.ok) {
        setFeedbackMsg({ type: "success", text: "Plat supprimé." });
        fetchItems();
      }
    } catch (e) {
      setFeedbackMsg({ type: "error", text: "Erreur suppression plat" });
    }
  };

  const filteredItems = items
    .filter((item) => !selectedCategory || item.categoryId === selectedCategory)
    .filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-600" />
            Gestion du Menu & Catégories
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Gérez vos catégories de la carte et basculez les plats en disponible ou rupture de stock.
          </p>
        </div>

        <button
          onClick={openCreateItemModal}
          disabled={!selectedCategory}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Plat</span>
        </button>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between animate-in fade-in ${
            feedbackMsg.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-red-50 border-red-200 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Categories */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <span className="font-bold text-gray-900 text-xs uppercase tracking-wider">
              Catégories ({categories.length})
            </span>
            <button
              onClick={() => setShowAddCatModal(true)}
              className="p-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter</span>
            </button>
          </div>

          {loadingCats ? (
            <div className="py-8 flex justify-center text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : categories.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">Aucune catégorie créée</p>
          ) : (
            <div className="space-y-1">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat._id;
                const catItemCount = items.filter((i) => i.categoryId === cat._id).length;

                return (
                  <div
                    key={cat._id}
                    onClick={() => setSelectedCategory(cat._id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl cursor-pointer text-xs transition-all font-medium group ${
                      isSelected
                        ? "bg-[#E1F5EE] text-emerald-900 font-bold shadow-2xs"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-white border border-gray-200 text-gray-600">
                        {catItemCount}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(cat._id, cat.name);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Main Area: Items Table */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h2 className="font-bold text-gray-900 text-base">
                Plats de la catégorie :{" "}
                <span className="text-emerald-600">
                  {categories.find((c) => c._id === selectedCategory)?.name || "Tous"}
                </span>
              </h2>
              <p className="text-xs text-gray-500">{filteredItems.length} plat(s) répertorié(s)</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher un plat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {loadingItems ? (
            <div className="py-12 flex justify-center text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-gray-500">Aucun plat dans cette catégorie</p>
              <button
                onClick={openCreateItemModal}
                disabled={!selectedCategory}
                className="px-3.5 py-2 text-xs bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
              >
                Ajouter le premier plat
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wider font-bold">
                    <th className="pb-3 pl-2">Visuel & Plat</th>
                    <th className="pb-3">Prix</th>
                    <th className="pb-3">Disponibilité (Switch)</th>
                    <th className="pb-3">Statut</th>
                    <th className="pb-3 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredItems.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50/60 transition-colors group">
                      <td className="py-3.5 pl-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden border border-gray-200/80 shrink-0 flex items-center justify-center text-gray-400">
                            {item.photoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.photoUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{item.name}</p>
                            {item.description && (
                              <p className="text-[11px] text-gray-500 truncate max-w-xs">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 font-bold text-gray-900 text-sm">
                        {item.price.toFixed(2)} €
                      </td>

                      <td className="py-3.5">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.available}
                            onChange={() => handleToggleAvailable(item)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </td>

                      <td className="py-3.5">
                        <StatusPill
                          status={item.available ? "free" : "occupied"}
                          variant="table"
                          className={
                            item.available
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-red-50 text-red-800 border-red-200"
                          }
                        />
                      </td>

                      <td className="py-3.5 text-right pr-2">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditItemModal(item)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item._id, item.name)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Category Modal */}
      {showAddCatModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-sm">Nouvelle Catégorie</h3>
              <button onClick={() => setShowAddCatModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Nom de la catégorie
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="ex: Entrées, Grillades..."
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCatModal(false)}
                  className="px-3.5 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={addingCat}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl transition-colors"
                >
                  {addingCat ? <Loader2 className="w-4 h-4 animate-spin" /> : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create / Edit Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-sm">
                {editingItem ? "Modifier le Plat" : "Ajouter un Plat"}
              </h3>
              <button onClick={() => setShowItemModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Nom du plat *
                </label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="ex: Burger Artisan Gourmet"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Prix (€) *
                </label>
                <input
                  type="number"
                  step="0.10"
                  required
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  placeholder="14.50"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  placeholder="Ingrédients et détails du plat..."
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  URL de la photo (Optionnel)
                </label>
                <input
                  type="url"
                  value={itemPhoto}
                  onChange={(e) => setItemPhoto(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="availCheck"
                  checked={itemAvailable}
                  onChange={(e) => setItemAvailable(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="availCheck" className="text-xs font-medium text-gray-700">
                  Disponible immédiatement à la commande
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-3.5 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savingItem}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl transition-colors"
                >
                  {savingItem ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
