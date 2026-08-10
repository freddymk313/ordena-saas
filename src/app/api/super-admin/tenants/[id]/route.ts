import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Tenant } from "@/models/Tenant";
import { auth } from "@/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Accès refusé. Réservé aux super administrateurs." },
        { status: 403 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "ID du tenant manquant." }, { status: 400 });
    }

    const body = await req.json();
    const { name, logoUrl, brandColor, subscriptionStatus } = body;

    await connectToDatabase();

    const tenant = await Tenant.findById(id);
    if (!tenant) {
      return NextResponse.json({ error: "Restaurant non trouvé." }, { status: 404 });
    }

    if (name !== undefined) tenant.name = name.trim();
    if (logoUrl !== undefined) tenant.logoUrl = logoUrl.trim();
    if (brandColor !== undefined) tenant.brandColor = brandColor;
    if (subscriptionStatus !== undefined) tenant.subscriptionStatus = subscriptionStatus;

    await tenant.save();

    return NextResponse.json({
      success: true,
      tenant: {
        _id: String(tenant._id),
        name: tenant.name,
        logoUrl: tenant.logoUrl,
        brandColor: tenant.brandColor,
        subscriptionStatus: tenant.subscriptionStatus,
        updatedAt: tenant.updatedAt,
      },
    });
  } catch (error) {
    console.error("PATCH /api/super-admin/tenants/[id] error:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour du restaurant" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Accès refusé. Réservé aux super administrateurs." },
        { status: 403 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "ID du tenant manquant." }, { status: 400 });
    }

    await connectToDatabase();

    const deleted = await Tenant.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Restaurant non trouvé." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Restaurant supprimé avec succès." });
  } catch (error) {
    console.error("DELETE /api/super-admin/tenants/[id] error:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
