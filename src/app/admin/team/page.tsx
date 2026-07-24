"use client";

import React, { useState, useEffect, useCallback } from "react";
import StatCard from "@/components/ui-custom/StatCard";
import DataTable, { Column } from "@/components/ui-custom/DataTable";
import {
  Users,
  UserPlus,
  ShieldCheck,
  ConciergeBell,
  ChefHat,
  Trash2,
  Edit,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  Key,
} from "lucide-react";

interface TeamUser {
  _id: string;
  name: string;
  email: string;
  role: "restaurant_admin" | "server" | "kitchen" | "super_admin";
  createdAt: string;
}

export default function AdminTeamPage() {
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"restaurant_admin" | "server" | "kitchen">("server");
  const [creating, setCreating] = useState(false);

  const [editingUser, setEditingUser] = useState<TeamUser | null>(null);
  const [editRole, setEditRole] = useState<"restaurant_admin" | "server" | "kitchen">("server");
  const [editPassword, setEditPassword] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchTeam = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/team");
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
        setCurrentUserId(data.currentUserId);
      }
    } catch (e) {
      console.error("Error fetching team users:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) return;
    setCreating(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password, role }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", text: "Membre d'équipe créé avec succès !" });
        setName("");
        setEmail("");
        setPassword("");
        setRole("server");
        setShowAddModal(false);
        fetchTeam();
      } else {
        setFeedback({ type: "error", text: data.error || "Échec création membre" });
      }
    } catch (e) {
      setFeedback({ type: "error", text: "Erreur serveur" });
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSavingEdit(true);
    try {
      const res = await fetch("/api/admin/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingUser._id,
          role: editRole,
          newPassword: editPassword ? editPassword : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", text: "Compte utilisateur mis à jour !" });
        setEditingUser(null);
        setEditPassword("");
        fetchTeam();
      } else {
        setFeedback({ type: "error", text: data.error || "Erreur mise à jour" });
      }
    } catch (e) {
      setFeedback({ type: "error", text: "Erreur serveur" });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le compte de ${userName} ?`)) return;
    try {
      const res = await fetch(`/api/admin/team?userId=${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", text: "Utilisateur supprimé." });
        fetchTeam();
      } else {
        setFeedback({ type: "error", text: data.error || "Erreur suppression" });
      }
    } catch (e) {
      setFeedback({ type: "error", text: "Erreur serveur" });
    }
  };

  const getRoleBadge = (uRole: string) => {
    if (uRole === "restaurant_admin" || uRole === "super_admin") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
          Manager Admin
        </span>
      );
    }
    if (uRole === "server") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
          <ConciergeBell className="w-3.5 h-3.5 text-blue-600" />
          Serveur
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
        <ChefHat className="w-3.5 h-3.5 text-amber-600" />
        Cuisine
      </span>
    );
  };

  const columns: Column<TeamUser>[] = [
    {
      key: "user",
      header: "Membre & E-mail",
      accessor: (u: TeamUser) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-900 font-extrabold flex items-center justify-center text-xs shrink-0">
            {u.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-gray-900 flex items-center gap-1.5">
              {u.name}
              {u._id === currentUserId && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">
                  (Vous)
                </span>
              )}
            </p>
            <p className="text-[11px] text-gray-500">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Rôle Établissement",
      accessor: (u: TeamUser) => getRoleBadge(u.role),
    },
    {
      key: "date",
      header: "Date d'ajout",
      accessor: (u: TeamUser) => (
        <span className="text-xs text-gray-500 font-mono">
          {new Date(u.createdAt).toLocaleDateString("fr-FR")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      accessor: (u: TeamUser) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingUser(u);
              setEditRole(u.role === "super_admin" ? "restaurant_admin" : u.role);
            }}
            className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
            title="Modifier le rôle"
          >
            <Edit className="w-4 h-4" />
          </button>

          {u._id !== currentUserId && (
            <button
              onClick={() => handleDeleteUser(u._id, u.name)}
              className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Supprimer le membre"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const adminCount = users.filter((u) => u.role === "restaurant_admin" || u.role === "super_admin").length;
  const serverCount = users.filter((u) => u.role === "server").length;
  const kitchenCount = users.filter((u) => u.role === "kitchen").length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            Utilisateurs & Équipe du Restaurant
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Gérez les accès et rôles de vos collaborateurs (Admin, Serveur, Cuisine).
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Ajouter un membre</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between animate-in fade-in ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-red-50 border-red-200 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Team Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5 text-emerald-600" />}
          label="Total Membres Équipe"
          value={users.length}
        />
        <StatCard
          icon={<ShieldCheck className="w-5 h-5 text-purple-600" />}
          label="Administrateurs"
          value={adminCount}
        />
        <StatCard
          icon={<ConciergeBell className="w-5 h-5 text-blue-600" />}
          label="Serveurs en salle"
          value={serverCount}
        />
        <StatCard
          icon={<ChefHat className="w-5 h-5 text-amber-600" />}
          label="Équipe Cuisine"
          value={kitchenCount}
        />
      </div>

      {/* Main DataTable */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        {loading ? (
          <div className="py-16 flex justify-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <DataTable data={users} columns={columns} keyExtractor={(u: TeamUser) => u._id} />
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-600" />
                Nouveau Membre d&apos;Équipe
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Nom complet *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: Jean Dupont"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Adresse e-mail *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jean@bistro.com"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Mot de passe temporaire *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Rôle de l&apos;utilisateur *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="server">Serveur en Salle</option>
                  <option value="kitchen">Personnel Cuisine</option>
                  <option value="restaurant_admin">Administrateur Restaurant</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl transition-colors"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Créer le compte"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-sm">
                Modifier le rôle de {editingUser.name}
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpdateRole} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Nouveau Rôle
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="server">Serveur en Salle</option>
                  <option value="kitchen">Personnel Cuisine</option>
                  <option value="restaurant_admin">Administrateur Restaurant</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-gray-400" />
                  Changer le mot de passe (Laissez vide pour conserver)
                </label>
                <input
                  type="password"
                  minLength={6}
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Nouveau mot de passe..."
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3.5 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl transition-colors"
                >
                  {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sauvegarder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
