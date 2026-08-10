import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Tenant } from "@/models/Tenant";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Accès refusé. Réservé aux super administrateurs." },
        { status: 403 }
      );
    }

    const { tenantId } = await req.json();

    if (!tenantId) {
      return NextResponse.json({ error: "ID du tenant manquant." }, { status: 400 });
    }

    await connectToDatabase();

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return NextResponse.json({ error: "Restaurant non trouvé." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      activeTenantId: String(tenant._id),
      tenantName: tenant.name,
    });
  } catch (error) {
    console.error("POST /api/super-admin/switch-tenant error:", error);
    return NextResponse.json({ error: "Erreur serveur lors du changement de tenant." }, { status: 500 });
  }
}
