"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import {
  Plus,
  QrCode as QrCodeIcon,
  Download,
  Printer,
  Trash2,
  RefreshCw,
  ExternalLink,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import StatusPill from "@/components/ui-custom/StatusPill";
import DataTable, { Column } from "@/components/ui-custom/DataTable";

interface TableData {
  _id: string;
  label: string;
  qrToken: string;
  status: "free" | "occupied" | "service_requested" | "bill_requested";
  createdAt?: string;
}

export default function AdminTablesPage() {
  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTableLabel, setNewTableLabel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // QR Modal states
  const [selectedTableForQr, setSelectedTableForQr] = useState<TableData | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const printRef = useRef<HTMLDivElement>(null);

  const originUrl = typeof window !== "undefined" ? window.location.origin : "";

  const fetchTables = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/tables");
      if (!res.ok) throw new Error("Erreur de chargement des tables");
      const data = await res.json();
      setTables(data);
    } catch (err: unknown) {
      setError((err as Error).message || "Impossible de charger les tables");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTables();
  }, []);

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableLabel.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newTableLabel.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erreur lors de la création");
      }

      setNewTableLabel("");
      setIsAddModalOpen(false);
      await fetchTables();
    } catch (err: unknown) {
      alert((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTable = async (id: string, label: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer la ${label} ?`)) return;

    try {
      const res = await fetch(`/api/tables/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      await fetchTables();
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleResetStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/tables/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "free" }),
      });
      if (!res.ok) throw new Error("Erreur lors du changement de statut");
      await fetchTables();
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const openQrModal = async (table: TableData) => {
    setSelectedTableForQr(table);
    const targetUrl = `${originUrl}/t/${table.qrToken}`;

    try {
      const url = await QRCode.toDataURL(targetUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: "#064e3b",
          light: "#ffffff",
        },
      });
      setQrDataUrl(url);
    } catch (err) {
      console.error("Erreur de génération QR Code", err);
    }
  };

  const downloadQrCode = () => {
    if (!qrDataUrl || !selectedTableForQr) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `QR_${selectedTableForQr.label.replace(/\s+/g, "_")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printQrCode = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow || !selectedTableForQr || !qrDataUrl) return;

    const qrUrl = `${originUrl}/t/${selectedTableForQr.qrToken}`;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Imprimer QR Code - ${selectedTableForQr.label}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background-color: #fff;
              color: #111827;
            }
            .card {
              border: 2px solid #065f46;
              border-radius: 20px;
              padding: 32px;
              text-align: center;
              max-width: 380px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            }
            .logo {
              font-size: 20px;
              font-weight: 800;
              color: #047857;
              margin-bottom: 8px;
              letter-spacing: -0.5px;
            }
            .subtitle {
              font-size: 13px;
              color: #6b7280;
              margin-bottom: 24px;
            }
            .qr-img {
              width: 260px;
              height: 260px;
              margin: 0 auto;
            }
            .table-number {
              font-size: 28px;
              font-weight: 700;
              margin-top: 20px;
              color: #064e3b;
            }
            .instructions {
              font-size: 12px;
              color: #4b5563;
              margin-top: 12px;
            }
            .url {
              font-size: 10px;
              color: #9ca3af;
              margin-top: 8px;
              word-break: break-all;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="logo">ORDENA</div>
            <div class="subtitle">Scannez pour consulter le menu & commander</div>
            <img class="qr-img" src="${qrDataUrl}" alt="QR Code" />
            <div class="table-number">${selectedTableForQr.label}</div>
            <div class="instructions">Pointez l'appareil photo de votre smartphone pour commander directement</div>
            <div class="url">${qrUrl}</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const columns: Column<TableData>[] = [
    {
      key: "label",
      header: "Table / Emplacement",
      sortable: true,
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm border border-emerald-100">
            {row.label.replace(/[^0-9]/g, "") || row.label.charAt(0)}
          </div>
          <div>
            <span className="font-semibold text-gray-900 block">{row.label}</span>
            <span className="text-xs text-gray-400 font-mono">Token: {row.qrToken.substring(0, 8)}...</span>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Statut Actuel",
      sortable: true,
      filterOptions: [
        { label: "Libre", value: "free" },
        { label: "Occupée", value: "occupied" },
        { label: "Appel Serveur", value: "service_requested" },
        { label: "Demande Addition", value: "bill_requested" },
      ],
      accessor: (row) => <StatusPill status={row.status} variant="table" />,
    },
    {
      key: "qrUrl",
      header: "Lien Direct Client",
      accessor: (row) => {
        const url = `${originUrl}/t/${row.qrToken}`;
        return (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-medium hover:underline"
          >
            <span>/t/{row.qrToken.substring(0, 6)}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openQrModal(row)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium text-xs transition-colors border border-emerald-200"
            title="Générer & Afficher le QR Code"
          >
            <QrCodeIcon className="w-3.5 h-3.5" />
            <span>QR Code</span>
          </button>

          {row.status !== "free" && (
            <button
              onClick={() => handleResetStatus(row._id)}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              title="Réinitialiser en Libre"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => handleDeleteTable(row._id, row.label)}
            className="p-1.5 rounded-lg border border-rose-100 text-rose-600 hover:bg-rose-50 transition-colors"
            title="Supprimer la table"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Gestion des Tables & QR Codes
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Créez vos tables, générez les QR codes uniques et téléchargez-les pour vos supports de table.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-2xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter une table</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
          Chargement des tables...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={tables}
          searchPlaceholder="Rechercher une table..."
          emptyMessage="Aucune table enregistrée. Cliquez sur 'Ajouter une table' pour commencer."
        />
      )}

      {/* MODAL: Add Table */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-bold text-gray-900">Nouvelle Table</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTable} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">
                  Nom ou Numéro de Table
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Table 12, Terrasse 3, VIP 1"
                  value={newTableLabel}
                  onChange={(e) => setNewTableLabel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    "Création..."
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Créer la table</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: QR Code Display & Print */}
      {selectedTableForQr && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  QR Code - {selectedTableForQr.label}
                </h2>
                <p className="text-xs text-gray-500">
                  Prêt à imprimer ou télécharger
                </p>
              </div>
              <button
                onClick={() => setSelectedTableForQr(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Preview Card */}
            <div
              ref={printRef}
              className="bg-emerald-50/40 border-2 border-emerald-600/30 rounded-2xl p-6 text-center space-y-3 flex flex-col items-center justify-center"
            >
              <span className="text-xs font-bold tracking-wider text-emerald-800 uppercase">
                ORDENA SAAS
              </span>

              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt={`QR Code ${selectedTableForQr.label}`}
                  className="w-56 h-56 rounded-xl bg-white p-2 shadow-xs"
                />
              ) : (
                <div className="w-56 h-56 rounded-xl bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                  Génération...
                </div>
              )}

              <div>
                <span className="text-xl font-extrabold text-gray-900 block">
                  {selectedTableForQr.label}
                </span>
                <span className="text-xs text-gray-500">
                  Scannez pour voir le menu & passer commande
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={downloadQrCode}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-800 font-semibold text-sm transition-colors"
              >
                <Download className="w-4 h-4 text-gray-600" />
                <span>Télécharger PNG</span>
              </button>

              <button
                onClick={printQrCode}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-2xs"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
