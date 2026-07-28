"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Users,
  UserPlus,
  Shield,
  Utensils,
  ChefHat,
  X,
  AlertCircle,
  RefreshCw,
  Key,
  Trash2,
  Edit2,
  Power,
  Check,
} from "lucide-react";
import StatCard from "@/components/ui-custom/StatCard";
import DataTable, { Column } from "@/components/ui-custom/DataTable";
import StatusPill from "@/components/ui-custom/StatusPill";

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "restaurant_admin" | "server" | "kitchen";
  active: boolean;
  tenantId?: string | null;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Selected user for Edit/Delete
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Form states for Add User
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    role: "server" as "restaurant_admin" | "server" | "kitchen",
    password: "",
  });
  const [addFormError, setAddFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit role form
  const [editRole, setEditRole] = useState<"restaurant_admin" | "server" | "kitchen">("server");

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/users");
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Erreur lors du chargement des utilisateurs");
      }
      const data = await res.json();
      setUsers(data || []);
    } catch (err: unknown) {
      setError((err as Error).message || "Impossible de charger la liste des utilisateurs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, [fetchUsers]);

  // Generate random password helper
  const handleGeneratePassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let randomPass = "Ord-";
    for (let i = 0; i < 6; i++) {
      randomPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setAddForm((prev) => ({ ...prev, password: randomPass }));
  };

  // Submit Add User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddFormError(null);

    if (!addForm.name.trim()) {
      setAddFormError("Veuillez saisir le nom complet.");
      return;
    }
    if (!addForm.email.trim() || !addForm.email.includes("@")) {
      setAddFormError("Veuillez saisir une adresse email valide.");
      return;
    }
    if (!addForm.password || addForm.password.length < 6) {
      setAddFormError("Le mot de passe doit faire au moins 6 caractères.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Échec de la création de l'utilisateur");
      }

      setSuccessMsg(`L'utilisateur ${data.name} a été créé avec succès.`);
      setIsAddModalOpen(false);
      setAddForm({ name: "", email: "", role: "server", password: "" });
      fetchUsers();
    } catch (err: unknown) {
      setAddFormError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle User Active / Disabled status
  const handleToggleActive = useCallback(async (user: AdminUser) => {
    try {
      const newActiveState = !user.active;
      // Optimistic update
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, active: newActiveState } : u))
      );

      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: newActiveState }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Erreur lors du changement de statut");
      }

      setSuccessMsg(
        `Le compte de ${user.name} est maintenant ${
          newActiveState ? "activé" : "désactivé"
        }.`
      );
    } catch (err: unknown) {
      setError((err as Error).message);
      fetchUsers(); // Rollback
    }
  }, [fetchUsers]);

  // Submit Edit Role
  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: editRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la mise à jour du rôle");
      }

      setSuccessMsg(`Le rôle de ${selectedUser.name} a été mis à jour.`);
      setIsEditModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Delete User
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la suppression de l'utilisateur");
      }

      setSuccessMsg(`Utilisateur ${selectedUser.name} supprimé avec succès.`);
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Role display label and badge style
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "restaurant_admin":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200/80">
            <Shield className="w-3 h-3 text-purple-600" />
            Admin Restaurant
          </span>
        );
      case "server":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200/80">
            <Utensils className="w-3 h-3 text-blue-600" />
            Serveur
          </span>
        );
      case "kitchen":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80">
            <ChefHat className="w-3 h-3 text-amber-600" />
            Cuisine
          </span>
        );
      default:
        return <span className="text-xs text-gray-500">{role}</span>;
    }
  };

  // Table columns definition
  const columns: Column<AdminUser>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Utilisateur",
        sortable: true,
        accessor: (user) => (
          <div>
            <div className="font-bold text-gray-900 text-sm">{user.name}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
          </div>
        ),
      },
      {
        key: "role",
        header: "Rôle",
        sortable: true,
        filterOptions: [
          { label: "Admin Restaurant", value: "restaurant_admin" },
          { label: "Serveur", value: "server" },
          { label: "Cuisine", value: "kitchen" },
        ],
        accessor: (user) => getRoleBadge(user.role),
      },
      {
        key: "active",
        header: "Statut",
        sortable: true,
        filterOptions: [
          { label: "Actif", value: "true" },
          { label: "Désactivé", value: "false" },
        ],
        accessor: (user) => (
          <StatusPill
            variant="user"
            status={user.active ? "active" : "disabled"}
          />
        ),
      },
      {
        key: "createdAt",
        header: "Créé le",
        sortable: true,
        accessor: (user) => (
          <span className="text-xs text-gray-500">
            {new Date(user.createdAt).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        accessor: (user) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedUser(user);
                setEditRole(user.role);
                setIsEditModalOpen(true);
              }}
              className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors"
              title="Modifier le rôle"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleToggleActive(user)}
              className={`p-1.5 rounded-lg border transition-colors ${
                user.active
                  ? "bg-white border-gray-200 text-gray-600 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50/50"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
              }`}
              title={user.active ? "Désactiver le compte" : "Réactiver le compte"}
            >
              <Power className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                setSelectedUser(user);
                setIsDeleteModalOpen(true);
              }}
              className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50/50 transition-colors"
              title="Supprimer l'utilisateur"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ),
      },
    ],
    [handleToggleActive]
  );

  // Statistics calculation
  const totalCount = users.length;
  const adminCount = users.filter((u) => u.role === "restaurant_admin").length;
  const serverCount = users.filter((u) => u.role === "server").length;
  const kitchenCount = users.filter((u) => u.role === "kitchen").length;
  const disabledCount = users.filter((u) => !u.active).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Gestion des Utilisateurs
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              {totalCount} membres
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Gérez l&apos;équipe de votre établissement (admins, serveurs, cuisine) et leurs accès.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-xs font-bold transition-colors shadow-2xs"
            title="Actualiser la liste"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => {
              setAddFormError(null);
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Ajouter un utilisateur</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-800 font-bold">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800 font-bold">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Summary StatCards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5 text-emerald-600" />}
          label="Total Équipe"
          value={totalCount}
          badgeBgClass="bg-emerald-50 text-emerald-800 border-emerald-100"
        />
        <StatCard
          icon={<Shield className="w-5 h-5 text-purple-600" />}
          label="Administrateurs"
          value={adminCount}
          badgeBgClass="bg-purple-50 text-purple-800 border-purple-100"
        />
        <StatCard
          icon={<Utensils className="w-5 h-5 text-blue-600" />}
          label="Serveurs"
          value={serverCount}
          badgeBgClass="bg-blue-50 text-blue-800 border-blue-100"
        />
        <StatCard
          icon={<ChefHat className="w-5 h-5 text-amber-600" />}
          label="Cuisine"
          value={kitchenCount}
          badgeBgClass="bg-amber-50 text-amber-800 border-amber-100"
        />
      </div>

      {disabledCount > 0 && (
        <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span>{disabledCount} compte(s) désactivé(s) - Ils ne peuvent plus se connecter.</span>
        </div>
      )}

      {/* DataTable */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center text-xs text-gray-400 font-medium bg-white rounded-2xl border border-gray-100">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-2" />
          <span>Chargement des utilisateurs...</span>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={users}
          searchPlaceholder="Rechercher par nom, email ou rôle..."
          emptyMessage="Aucun utilisateur trouvé pour ce restaurant."
        />
      )}

      {/* Modal: Add User */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-gray-100 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">Nouveau membre</h3>
                  <p className="text-xs text-gray-500">Ajouter un utilisateur à l&apos;équipe</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addFormError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{addFormError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nom complet <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="ex: Jean Dupont"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Adresse email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="ex: jean.dupont@bistro.com"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Rôle attribué <span className="text-rose-500">*</span>
                </label>
                <select
                  value={addForm.role}
                  onChange={(e) =>
                    setAddForm({
                      ...addForm,
                      role: e.target.value as "restaurant_admin" | "server" | "kitchen",
                    })
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="server">Serveur / Salle</option>
                  <option value="kitchen">Cuisine / Chef</option>
                  <option value="restaurant_admin">Administrateur Restaurant</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700">
                    Mot de passe <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-800 font-bold hover:underline"
                  >
                    <Key className="w-3 h-3" />
                    <span>Générer</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Saisissez ou générez un mot de passe"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-2"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Créer l&apos;utilisateur</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Role */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-gray-100 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-black text-gray-900">Modifier le rôle</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Changer le rôle pour <strong className="text-gray-900">{selectedUser.name}</strong> ({selectedUser.email}) :
            </p>

            <div>
              <select
                value={editRole}
                onChange={(e) =>
                  setEditRole(e.target.value as "restaurant_admin" | "server" | "kitchen")
                }
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="server">Serveur / Salle</option>
                <option value="kitchen">Cuisine / Chef</option>
                <option value="restaurant_admin">Administrateur Restaurant</option>
              </select>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleUpdateRole}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-2"
              >
                {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Enregistrer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete User */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-gray-100 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900">Supprimer l&apos;utilisateur</h3>
                <p className="text-xs text-gray-500">Confirmation de suppression</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer définitivement le compte de{" "}
              <strong className="text-gray-900">{selectedUser.name}</strong> ({selectedUser.email}) ?
              Cette action est irréversible.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs flex items-center gap-2"
              >
                {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Supprimer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
