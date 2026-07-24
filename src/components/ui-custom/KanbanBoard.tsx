"use client";

import React from "react";
import KanbanColumn from "./KanbanColumn";
import { KanbanOrder } from "./KanbanCard";
import { cn } from "@/lib/utils";

export interface KanbanBoardProps {
  orders: KanbanOrder[];
  onAdvanceStatus?: (orderId: string, currentStatus: string) => void;
  className?: string;
}

const COLUMNS: { id: KanbanOrder["status"]; title: string; colorClass: string }[] = [
  { id: "pending", title: "En attente", colorClass: "bg-amber-100 text-amber-900" },
  { id: "preparing", title: "En préparation", colorClass: "bg-blue-100 text-blue-900" },
  { id: "ready", title: "Prêt à servir", colorClass: "bg-emerald-100 text-emerald-900" },
  { id: "served", title: "Servi", colorClass: "bg-gray-200 text-gray-800" },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  orders,
  onAdvanceStatus,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex gap-4 overflow-x-auto pb-4 pt-1 items-start min-h-[550px]",
        className
      )}
    >
      {COLUMNS.map((col) => {
        const columnOrders = orders.filter((o) => o.status === col.id);

        return (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            orders={columnOrders}
            statusColorClass={col.colorClass}
            onAdvanceStatus={onAdvanceStatus}
          />
        );
      })}
    </div>
  );
};

export default KanbanBoard;
