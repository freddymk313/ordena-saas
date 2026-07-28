"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Utensils,
  Layers,
  AlertCircle,
  Tag,
} from "lucide-react";
import StatCard from "@/components/ui-custom/StatCard";
import DataTable, { Column } from "@/components/ui-custom/DataTable";

interface Category {
  _id: string;
  name: string;
  order: number;
}

interface MenuItemData {
  _id: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  description: string;
  price: number;
  photoUrl: string;
  available: boolean;
  createdAt?: string;
}

export default function AdminMenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItemData[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Category modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryOrder, setCategoryOrder] = useState<number>(1);
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);

  // Dish modal states
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<MenuItemData | null>(null);
  const [dishName, setDishName] = useState("");
  const [dishDescription, setDishDescription] = useState("");
  const [dishPrice, setDishPrice] = useState<string>("0");
  const [dishCategoryId, setDishCategoryId] = useState("");
  const [dishPhotoUrl, setDishPhotoUrl] = useState("");
  const [dishAvailable, setDishAvailable] = useState(true);
  const [isSubmittingDish, setIsSubmittingDish] = useState(false);

  // Toggling status tracking for fast feedback
  const [togglingIds, setTogglingIds] = useState<Record<string, boolean>>({});

  // Fetch categories and items
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [catRes, itemsRes] = await Promise.all([
        fetch("/api/admin/menu/categories"),
        fetch("/api/admin/menu/items"),
      ]);

      if (!catRes.ok || !itemsRes.ok) {
        throw new Error("Erreur de chargement des données du menu");
      }

      const catData = await catRes.json();
      const itemsData = await itemsRes.json();

      setCategories(catData || []);
      setItems(itemsData || []);
    } catch (err: unknown) {
      setError((err as Error).message || "Impossible de charger le menu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  // Handle Category Create / Update
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    try {
      setIsSubmittingCategory(true);
      const isEdit = !!editingCategory;
      const url = isEdit
        ? `/api/admin/menu/categories/${editingCategory._id}`
        : "/api/admin/menu/categories";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: categoryName.trim(),
          order: categoryOrder,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Erreur lors de l'enregistrement de la catégorie");
      }

      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      setCategoryName("");
      await fetchData();
    } catch (err: unknown) {
      alert((err as Error).message);
    } finally {
      setIsSubmittingCategory(false);
    }
  };

  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryOrder(categories.length + 1);
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryOrder(cat.order || 1);
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (cat: Category) => {
    const dishCount = items.filter((i) => i.categoryId === cat._id).length;
    const msg = dishCount > 0
      ? `Supprimer la catégorie "${cat.name}" ainsi que les ${dishCount} plat(s) associés ?`
      : `Voulez-vous supprimer la catégorie "${cat.name}" ?`;

    if (!confirm(msg)) return;

    try {
      const res = await fetch(`/api/admin/menu/categories/${cat._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erreur de suppression");
      if (selectedCategoryId === cat._id) setSelectedCategoryId("all");
      await fetchData();
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  // Handle Dish Create / Update
  const openAddDishModal = () => {
    setEditingDish(null);
    setDishName("");
    setDishDescription("");
    setDishPrice("12.00");
    setDishCategoryId(
      selectedCategoryId !== "all" ? selectedCategoryId : categories[0]?._id || ""
    );
    setDishPhotoUrl("");
    setDishAvailable(true);
    setIsDishModalOpen(true);
  };

  const openEditDishModal = (dish: MenuItemData) => {
    setEditingDish(dish);
    setDishName(dish.name);
    setDishDescription(dish.description || "");
    setDishPrice(dish.price.toString());
    setDishCategoryId(dish.categoryId);
    setDishPhotoUrl(dish.photoUrl || "");
    setDishAvailable(dish.available);
    setIsDishModalOpen(true);
  };

  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim() || !dishCategoryId) return;

    const priceNum = parseFloat(dishPrice.replace(",", "."));
    if (isNaN(priceNum) || priceNum < 0) {
      alert("Veuillez saisir un prix valide");
      return;
    }

    try {
      setIsSubmittingDish(true);
      const isEdit = !!editingDish;
      const url = isEdit
        ? `/api/admin/menu/items/${editingDish._id}`
        : "/api/admin/menu/items";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: dishName.trim(),
          description: dishDescription.trim(),
          price: priceNum,
          categoryId: dishCategoryId,
          photoUrl: dishPhotoUrl.trim(),
          available: dishAvailable,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Erreur lors de l'enregistrement du plat");
      }

      setIsDishModalOpen(false);
      setEditingDish(null);
      await fetchData();
    } catch (err: unknown) {
      alert((err as Error).message);
    } finally {
      setIsSubmittingDish(false);
    }
  };

  const handleDeleteDish = async (dish: MenuItemData) => {
    if (!confirm(`Voulez-vous supprimer le plat "${dish.name}" ?`)) return;

    try {
      const res = await fetch(`/api/admin/menu/items/${dish._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erreur de suppression du plat");
      await fetchData();
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  // Immediate toggle available/rupture state in MongoDB
  const handleToggleAvailability = async (dish: MenuItemData) => {
    const newAvailable = !dish.available;

    // Optimistic UI update
    setItems((prev) =>
      prev.map((i) => (i._id === dish._id ? { ...i, available: newAvailable } : i))
    );
    setTogglingIds((prev) => ({ ...prev, [dish._id]: true }));

    try {
      const res = await fetch(`/api/admin/menu/items/${dish._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: newAvailable }),
      });

      if (!res.ok) {
        // Rollback on failure
        setItems((prev) =>
          prev.map((i) => (i._id === dish._id ? { ...i, available: dish.available } : i))
        );
      }
    } catch (err) {
      console.error("Toggle error:", err);
      // Rollback on network error
      setItems((prev) =>
        prev.map((i) => (i._id === dish._id ? { ...i, available: dish.available } : i))
      );
    } finally {
      setTogglingIds((prev) => ({ ...prev, [dish._id]: false }));
    }
  };

  // Filtered dishes for selected category
  const filteredItems = useMemo(() => {
    if (selectedCategoryId === "all") return items;
    return items.filter((i) => i.categoryId === selectedCategoryId);
  }, [items, selectedCategoryId]);

  // Statistics
  const totalCategories = categories.length;
  const totalDishes = items.length;
  const availableDishesCount = items.filter((i) => i.available).length;
  const outOfStockDishesCount = items.filter((i) => !i.available).length;

  // Selected Category Info
  const currentCategory = categories.find((c) => c._id === selectedCategoryId);

  // Table Columns
  const columns: Column<MenuItemData>[] = [
    {
      key: "photoUrl",
      header: "Photo",
      accessor: (row) => (
        <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center relative">
          {row.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={row.photoUrl}
              alt={row.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <Utensils className="w-5 h-5 text-gray-300" />
          )}
        </div>
      ),
    },
    {
      key: "name",
      header: "Nom du plat",
      sortable: true,
      accessor: (row) => (
        <div className="space-y-0.5 max-w-xs">
          <div className="font-extrabold text-gray-900 text-sm leading-tight flex items-center gap-2">
            <span>{row.name}</span>
            {!row.available && (
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold">
                Rupture
              </span>
            )}
          </div>
          {row.description && (
            <p className="text-xs text-gray-500 line-clamp-1">{row.description}</p>
          )}
        </div>
      ),
    },
    {
      key: "categoryName",
      header: "Catégorie",
      sortable: true,
      accessor: (row) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold">
          <Tag className="w-3 h-3 text-gray-400" />
          {row.categoryName || categories.find((c) => c._id === row.categoryId)?.name || "—"}
        </span>
      ),
    },
    {
      key: "price",
      header: "Prix",
      sortable: true,
      accessor: (row) => (
        <span className="font-extrabold text-gray-900 text-sm">
          {row.price.toFixed(2)} €
        </span>
      ),
    },
    {
      key: "available",
      header: "Disponibilité",
      accessor: (row) => (
        <button
          onClick={() => handleToggleAvailability(row)}
          disabled={togglingIds[row._id]}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-extrabold border transition-all ${
            row.available
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
              : "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100"
          }`}
          title="Cliquer pour changer immédiatement la disponibilité en base"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              row.available ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
            }`}
          />
          <span>{row.available ? "Disponible" : "En rupture"}</span>
        </button>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openEditDishModal(row)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
            title="Modifier le plat"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteDish(row)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
            title="Supprimer le plat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Menu & Catégories
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Gérez vos catégories, ajoutez des plats et mettez à jour les stocks en direct pour vos clients.
          </p>
        </div>

        <button
          onClick={openAddDishModal}
          disabled={categories.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un plat</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-800 font-bold">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Summary StatCards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<BookOpen className="w-5 h-5 text-emerald-600" />}
          label="Total Catégories"
          value={totalCategories}
          badgeBgClass="bg-emerald-50 text-emerald-700 border-emerald-100"
        />
        <StatCard
          icon={<Utensils className="w-5 h-5 text-blue-600" />}
          label="Total Plats au Menu"
          value={totalDishes}
          badgeBgClass="bg-blue-50 text-blue-700 border-blue-100"
        />
        <StatCard
          icon={<Check className="w-5 h-5 text-emerald-600" />}
          label="Plats Disponibles"
          value={availableDishesCount}
          badgeBgClass="bg-emerald-50 text-emerald-700 border-emerald-100"
        />
        <StatCard
          icon={<AlertCircle className="w-5 h-5 text-rose-600" />}
          label="Plats en Rupture"
          value={outOfStockDishesCount}
          badgeBgClass={
            outOfStockDishesCount > 0
              ? "bg-rose-100 text-rose-800 border-rose-200"
              : "bg-gray-100 text-gray-700"
          }
        />
      </div>

      {/* Main Grid: Left Categories Sidebar + Right Dishes Table */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Sidebar: Categories List */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-4 space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <h2 className="font-extrabold text-sm text-gray-900">Catégories</h2>
            </div>
            <button
              onClick={openAddCategoryModal}
              className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 text-xs font-bold flex items-center gap-1 transition-colors"
              title="Ajouter une catégorie"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter</span>
            </button>
          </div>

          <div className="space-y-1.5">
            {/* Filter All */}
            <button
              onClick={() => setSelectedCategoryId("all")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategoryId === "all"
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span>Tous les plats</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] ${
                  selectedCategoryId === "all"
                    ? "bg-emerald-700 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {items.length}
              </span>
            </button>

            {categories.map((cat) => {
              const count = items.filter((i) => i.categoryId === cat._id).length;
              const isSelected = selectedCategoryId === cat._id;

              return (
                <div
                  key={cat._id}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-emerald-600 text-white shadow-2xs"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <button
                    onClick={() => setSelectedCategoryId(cat._id)}
                    className="flex-1 text-left truncate mr-2"
                  >
                    {cat.name}
                  </button>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] ${
                        isSelected
                          ? "bg-emerald-700 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {count}
                    </span>

                    <button
                      onClick={() => openEditCategoryModal(cat)}
                      className={`p-1 rounded hover:bg-black/10 transition-colors ${
                        isSelected ? "text-white" : "text-gray-400 hover:text-gray-700"
                      }`}
                      title="Renommer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      className={`p-1 rounded hover:bg-black/10 transition-colors ${
                        isSelected ? "text-white" : "text-gray-400 hover:text-rose-600"
                      }`}
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {categories.length === 0 && !loading && (
              <div className="p-4 border border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-400">
                Aucune catégorie. Cliquez sur &quot;Ajouter&quot; ci-dessus pour commencer.
              </div>
            )}
          </div>
        </div>

        {/* Right Main Panel: Dishes Table */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-emerald-600" />
              <h2 className="font-extrabold text-base text-gray-900">
                {selectedCategoryId === "all"
                  ? "Tous les plats au menu"
                  : currentCategory?.name || "Plats de la catégorie"}
              </h2>
              <span className="text-xs text-gray-500 font-medium">
                ({filteredItems.length} plat{filteredItems.length > 1 ? "s" : ""})
              </span>
            </div>

            <button
              onClick={openAddDishModal}
              disabled={categories.length === 0}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau plat</span>
            </button>
          </div>

          <DataTable
            columns={columns}
            data={filteredItems}
            searchPlaceholder="Rechercher un plat..."
            searchKey="name"
            pageSize={10}
            emptyMessage="Aucun plat trouvé dans cette catégorie."
          />
        </div>
      </div>

      {/* MODAL: Add / Edit Category */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-base text-gray-900">
                {editingCategory ? "Modifier la catégorie" : "Ajouter une catégorie"}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Nom de la catégorie
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Entrées, Plats principaux, Desserts, Boissons..."
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Ordre d&apos;affichage
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={categoryOrder}
                  onChange={(e) => setCategoryOrder(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCategory}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
                >
                  {isSubmittingCategory ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add / Edit Dish */}
      {isDishModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-base text-gray-900">
                {editingDish ? "Modifier le plat" : "Ajouter un nouveau plat"}
              </h3>
              <button
                onClick={() => setIsDishModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Nom du plat *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Burger Artisan, Salade Burrata, Tiramisu..."
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Catégorie *
                  </label>
                  <select
                    value={dishCategoryId}
                    onChange={(e) => setDishCategoryId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Prix (€) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="12.50"
                    value={dishPrice}
                    onChange={(e) => setDishPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Description / Ingrédients
                </label>
                <textarea
                  rows={2}
                  placeholder="Ingrédients, allergènes, description appétissante..."
                  value={dishDescription}
                  onChange={(e) => setDishDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  URL de la Photo (Optionnel)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={dishPhotoUrl}
                  onChange={(e) => setDishPhotoUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                {dishPhotoUrl && (
                  <div className="mt-2.5 flex items-center gap-3 p-2 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={dishPhotoUrl}
                        alt="Aperçu"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-xs text-gray-500">Aperçu de l&apos;image</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="dishAvailable"
                  checked={dishAvailable}
                  onChange={(e) => setDishAvailable(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                />
                <label htmlFor="dishAvailable" className="text-xs font-bold text-gray-800">
                  Plat disponible en salle (décocher si rupture de stock)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsDishModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDish}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
                >
                  {isSubmittingDish ? "Enregistrement..." : "Enregistrer le plat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
