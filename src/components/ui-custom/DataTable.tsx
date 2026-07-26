"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  accessor?: (row: T) => React.ReactNode;
  sortable?: boolean;
  filterOptions?: { label: string; value: string }[];
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchKey?: keyof T | ((row: T) => string);
  pageSize?: number;
  emptyMessage?: string;
  className?: string;
  actions?: React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  searchPlaceholder = "Rechercher...",
  searchKey,
  pageSize = 10,
  emptyMessage = "Aucune donnée trouvée",
  className,
  actions,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);

  // Search and Filter Logic
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // Search filter
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase();
        if (searchKey) {
          const value =
            typeof searchKey === "function"
              ? searchKey(row)
              : String((row as Record<string, unknown>)[searchKey as string] ?? "");
          if (!value.toLowerCase().includes(query)) return false;
        } else {
          // Default search in all values
          const matchesAny = Object.values(row as Record<string, unknown>).some((val) =>
            String(val ?? "").toLowerCase().includes(query)
          );
          if (!matchesAny) return false;
        }
      }

      // Dropdown Filters
      for (const [key, filterVal] of Object.entries(activeFilters)) {
        if (filterVal && String((row as Record<string, unknown>)[key]) !== filterVal) {
          return false;
        }
      }

      return true;
    });
  }, [data, searchTerm, searchKey, activeFilters]);

  // Sorting logic
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const valA = (a as Record<string, unknown>)[sortKey];
      const valB = (b as Record<string, unknown>)[sortKey];

      if (valA === valB) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;

      const comparison = String(valA).localeCompare(String(valB), undefined, {
        numeric: true,
      });

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortKey, sortDirection]);

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === "asc") setSortDirection("desc");
      else {
        setSortKey(null);
        setSortDirection("asc");
      }
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const handleFilterChange = (columnKey: string, value: string) => {
    setActiveFilters((prev) => {
      const updated = { ...prev };
      if (!value) delete updated[columnKey];
      else updated[columnKey] = value;
      return updated;
    });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setActiveFilters({});
    setCurrentPage(1);
  };

  const hasFilters = searchTerm.length > 0 || Object.keys(activeFilters).length > 0;

  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col",
        className
      )}
    >
      {/* Table Header Controls */}
      <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-white">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          {columns
            .filter((col) => col.filterOptions && col.filterOptions.length > 0)
            .map((col) => (
              <div key={col.key} className="relative inline-block">
                <select
                  value={activeFilters[col.key] || ""}
                  onChange={(e) => handleFilterChange(col.key, e.target.value)}
                  className="pl-3 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none cursor-pointer"
                >
                  <option value="">Tous les {col.header.toLowerCase()}</option>
                  {col.filterOptions?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <Filter className="w-3 h-3 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            ))}

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1 rounded-md hover:bg-rose-50 transition-colors"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Table Content: Mobile Cards (< sm) & Desktop Table (>= sm) */}
      <div className="flex-1">
        {/* Mobile Cards View */}
        <div className="block sm:hidden divide-y divide-gray-100">
          {paginatedData.length > 0 ? (
            paginatedData.map((row, index) => (
              <div
                key={
                  (row as Record<string, unknown>)._id
                    ? String((row as Record<string, unknown>)._id)
                    : index
                }
                className="p-4 space-y-2.5 bg-white hover:bg-gray-50/50 transition-colors"
              >
                {columns.map((col) => (
                  <div
                    key={col.key}
                    className="flex items-center justify-between text-xs gap-3"
                  >
                    <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px] shrink-0">
                      {col.header}
                    </span>
                    <div className="text-right font-semibold text-gray-900 min-w-0 truncate">
                      {col.accessor
                        ? col.accessor(row)
                        : String((row as Record<string, unknown>)[col.key] ?? "-")}
                    </div>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-400 text-xs">
              {emptyMessage}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-50/70 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className="px-4 py-3 whitespace-nowrap">
                    {col.sortable ? (
                      <button
                        onClick={() => handleSort(col.key)}
                        className="inline-flex items-center gap-1.5 hover:text-gray-900 transition-colors focus:outline-hidden group font-semibold"
                      >
                        <span>{col.header}</span>
                        <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.length > 0 ? (
                paginatedData.map((row, index) => (
                  <tr
                    key={
                      (row as Record<string, unknown>)._id
                        ? String((row as Record<string, unknown>)._id)
                        : index
                    }
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 whitespace-nowrap">
                        {col.accessor
                          ? col.accessor(row)
                          : String(
                              (row as Record<string, unknown>)[col.key] ?? "-"
                            )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-gray-400 text-sm"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-white">
        <div>
          Affichage de{" "}
          <span className="font-semibold text-gray-900">
            {sortedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
          </span>{" "}
          à{" "}
          <span className="font-semibold text-gray-900">
            {Math.min(currentPage * pageSize, sortedData.length)}
          </span>{" "}
          sur <span className="font-semibold text-gray-900">{sortedData.length}</span> résultats
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Page précédente"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-medium text-gray-700 px-2">
            Page {currentPage} sur {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Page suivante"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
