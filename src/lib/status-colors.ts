export type StatusVariant = "order" | "bill" | "table" | "service";

export interface StatusConfig {
  label: string;
  badgeClass: string;
  dotClass: string;
}

export const statusColors: Record<StatusVariant, Record<string, StatusConfig>> = {
  order: {
    pending: {
      label: "En attente",
      badgeClass: "bg-amber-50 text-amber-800 border-amber-200/80",
      dotClass: "bg-amber-500",
    },
    preparing: {
      label: "En préparation",
      badgeClass: "bg-blue-50 text-blue-800 border-blue-200/80",
      dotClass: "bg-blue-500",
    },
    ready: {
      label: "Prêt à servir",
      badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
      dotClass: "bg-emerald-500",
    },
    served: {
      label: "Servi",
      badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
      dotClass: "bg-gray-400",
    },
  },
  bill: {
    pending: {
      label: "Addition demandée",
      badgeClass: "bg-amber-50 text-amber-800 border-amber-200/80",
      dotClass: "bg-amber-500",
    },
    bill_delivered: {
      label: "Addition apportée",
      badgeClass: "bg-blue-50 text-blue-800 border-blue-200/80",
      dotClass: "bg-blue-500",
    },
    paid: {
      label: "Payée",
      badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
      dotClass: "bg-emerald-500",
    },
  },
  table: {
    free: {
      label: "Libre",
      badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
      dotClass: "bg-emerald-500",
    },
    occupied: {
      label: "Occupée",
      badgeClass: "bg-blue-50 text-blue-800 border-blue-200/80",
      dotClass: "bg-blue-500",
    },
    service_requested: {
      label: "Appel serveur",
      badgeClass: "bg-amber-50 text-amber-800 border-amber-200/80",
      dotClass: "bg-amber-500",
    },
    bill_requested: {
      label: "Demande d'addition",
      badgeClass: "bg-purple-50 text-purple-800 border-purple-200/80",
      dotClass: "bg-purple-500",
    },
  },
  service: {
    call_server: {
      label: "Appel serveur",
      badgeClass: "bg-amber-50 text-amber-800 border-amber-200/80",
      dotClass: "bg-amber-500",
    },
    request_bill: {
      label: "Demande addition",
      badgeClass: "bg-purple-50 text-purple-800 border-purple-200/80",
      dotClass: "bg-purple-500",
    },
    pending: {
      label: "En attente",
      badgeClass: "bg-red-50 text-red-800 border-red-200/80",
      dotClass: "bg-red-500",
    },
    handled: {
      label: "Traité",
      badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
      dotClass: "bg-gray-400",
    },
  },
};

export function getStatusConfig(variant: StatusVariant, status: string): StatusConfig {
  const variantMap = statusColors[variant];
  if (variantMap && variantMap[status]) {
    return variantMap[status];
  }
  return {
    label: status,
    badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
    dotClass: "bg-gray-400",
  };
}
