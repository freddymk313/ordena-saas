import { Session } from "next-auth";
import { auth } from "@/auth";

export interface TenantFilter {
  tenantId?: string;
}

/**
 * Extrait le filtre tenantId pour les requêtes MongoDB en fonction de la session utilisateur.
 * - Pour les rôles internes d'un restaurant (restaurant_admin, server, kitchen): filtre strictement par tenantId.
 * - Pour le super_admin: filtre par activeTenantId s'il est défini, sinon retourne un filtre vide (accès global).
 */
export function getTenantFilterFromSession(session: Session | null): TenantFilter {
  if (!session?.user) {
    throw new Error("Accès non autorisé : session manquante");
  }

  const { role, tenantId, activeTenantId } = session.user;

  if (role === "super_admin") {
    if (activeTenantId) {
      return { tenantId: activeTenantId };
    }
    return {};
  }

  if (!tenantId) {
    throw new Error("Aucun tenant associé à cet utilisateur");
  }

  return { tenantId };
}

/**
 * Raccourci côté serveur (Server Components / API Routes) pour obtenir le filtre tenant courant.
 */
export async function getTenantFilter(): Promise<TenantFilter> {
  const session = await auth();
  return getTenantFilterFromSession(session);
}
