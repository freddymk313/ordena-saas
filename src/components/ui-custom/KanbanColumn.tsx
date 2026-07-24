"use client";

import React from "react";
import KanbanCard, { KanbanOrder } from "./KanbanCard";
import { cn } from "@/lib/utils";

export interface KanbanColumnProps {
  id: string;
  title: string;
  orders: KanbanOrder[];
  statusColorClass?: string;
  onAdvanceStatus?: (orderId: string, currentStatus: string) => void;
  className?: string;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  orders,
  statusColorClass = "bg-gray-100 text-gray-700",
  onAdvanceStatus,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col bg-gray-50/70 rounded-xl border border-gray-100 p-3 min-w-[280px] max-w-[340px] flex-1 h-full min-h-[500px]",
        className
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-semibold text-gray-800 text-sm tracking-tight">{title}</h3>
        <span
          className={cn(
            "text-xs font-bold px-2 py-0.5 rounded-full",
            statusColorClass
          )}
        >
          {orders.length}
        </span>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-0.5">
        {orders.length > 0 ? (
          orders.map((order) => (
            <KanbanCard
              key={order._id}
              order={order}
              onAdvanceStatus={onAdvanceStatus}
            />
          ))
        ) : (
          <div className="h-32 border-2 border-dashed border-gray-200/80 rounded-xl flex items-center justify-center text-xs text-gray-400 font-medium">
            Aucune commande
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
