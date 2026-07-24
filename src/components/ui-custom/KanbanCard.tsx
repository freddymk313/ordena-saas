"use client";

import React from "react";
import { Clock, User, CheckCircle2, ArrowRight } from "lucide-react";
import StatusPill from "./StatusPill";
import { cn } from "@/lib/utils";

export interface KanbanOrderItem {
  name: string;
  quantity: number;
}

export interface KanbanOrder {
  _id: string;
  tableLabel: string;
  customerName?: string;
  items: KanbanOrderItem[];
  status: "pending" | "preparing" | "ready" | "served";
  createdAt: string | Date;
  estimatedReadyAt?: string | Date;
}

export interface KanbanCardProps {
  order: KanbanOrder;
  onAdvanceStatus?: (orderId: string, currentStatus: string) => void;
  className?: string;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  order,
  onAdvanceStatus,
  className,
}) => {
  const timeFormatted = new Date(order.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const getNextStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Commencer prépa";
      case "preparing":
        return "Marquer prêt";
      case "ready":
        return "Marquer servi";
      default:
        return null;
    }
  };

  const nextActionLabel = getNextStatusLabel(order.status);

  return (
    <div
      className={cn(
        "bg-white rounded-xl p-4 border border-gray-100 shadow-xs hover:shadow-md transition-all flex flex-col gap-3 group",
        className
      )}
    >
      {/* Header: Table label + Status */}
      <div className="flex items-center justify-between gap-2 border-b border-gray-50 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900 text-sm bg-gray-100 px-2.5 py-0.5 rounded-md">
            {order.tableLabel}
          </span>
          {order.customerName && (
            <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
              <User className="w-3 h-3 text-gray-400" />
              {order.customerName}
            </span>
          )}
        </div>
        <StatusPill status={order.status} variant="order" showDot={false} />
      </div>

      {/* Items List */}
      <div className="space-y-1.5 flex-1">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex items-baseline justify-between text-xs text-gray-800">
            <span className="font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded shrink-0 mr-2">
              {item.quantity}x
            </span>
            <span className="flex-1 truncate font-medium text-gray-700">{item.name}</span>
          </div>
        ))}
      </div>

      {/* Footer: Time + Action Button */}
      <div className="pt-2 border-t border-gray-50 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1 text-gray-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{timeFormatted}</span>
        </div>

        {nextActionLabel && onAdvanceStatus && (
          <button
            onClick={() => onAdvanceStatus(order._id, order.status)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors shadow-2xs"
          >
            <span>{nextActionLabel}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}

        {order.status === "served" && (
          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Terminé
          </span>
        )}
      </div>
    </div>
  );
};

export default KanbanCard;
