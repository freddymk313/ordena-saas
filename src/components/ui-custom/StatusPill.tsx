"use client";

import React from "react";
import { getStatusConfig, StatusVariant } from "@/lib/status-colors";
import { cn } from "@/lib/utils";

export interface StatusPillProps {
  status: string;
  variant: StatusVariant;
  className?: string;
  showDot?: boolean;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  variant,
  className,
  showDot = true,
}) => {
  const config = getStatusConfig(variant, status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
        config.badgeClass,
        className
      )}
    >
      {showDot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dotClass)}
        />
      )}
      {config.label}
    </span>
  );
};

export default StatusPill;
