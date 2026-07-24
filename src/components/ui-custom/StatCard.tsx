"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: {
    value: string | number;
    isPositive: boolean;
    label?: string;
  };
  className?: string;
  badgeBgClass?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  trend,
  className,
  badgeBgClass = "bg-emerald-50 text-emerald-700 border-emerald-100",
}) => {
  return (
    <div
      className={cn(
        "bg-white rounded-xl p-5 border border-gray-100 shadow-sm transition-all hover:shadow-md",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <div
          className={cn(
            "w-10 h-10 rounded-full border flex items-center justify-center shrink-0",
            badgeBgClass
          )}
        >
          {icon}
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <span className="text-2xl font-medium tracking-tight text-gray-900">
          {value}
        </span>

        {trend && (
          <div
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full border",
              trend.isPositive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                : "bg-rose-50 text-rose-700 border-rose-200/80"
            )}
          >
            {trend.isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>{trend.value}</span>
            {trend.label && (
              <span className="text-gray-400 font-normal ml-0.5">
                {trend.label}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
