import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Tenant } from "@/models/Tenant";
import { MenuCategory } from "@/models/MenuCategory";
import { MenuItem } from "@/models/MenuItem";
import { Table } from "@/models/Table";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const tenantId = session.user.activeTenantId || session.user.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: "Aucun établissement associé" }, { status: 400 });
    }

    await connectToDatabase();

    const tenant = await Tenant.findById(tenantId).lean();
    if (!tenant) {
      return NextResponse.json({ error: "Établissement introuvable" }, { status: 404 });
    }

    const [categories, items, tables] = await Promise.all([
      MenuCategory.find({ tenantId }).sort({ order: 1 }).lean(),
      MenuItem.find({ tenantId }).populate("categoryId", "name").sort({ createdAt: -1 }).lean(),
      Table.find({ tenantId }).sort({ label: 1 }).lean(),
    ]);

    return NextResponse.json({
      tenant: {
        _id: String(tenant._id),
        name: tenant.name,
        logoUrl: tenant.logoUrl || "",
        brandColor: tenant.brandColor || "#059669",
        currency: tenant.currency || "€",
        address: tenant.address || "",
        phone: tenant.phone || "",
        timezone: tenant.timezone || "Europe/Paris",
        taxRate: tenant.taxRate ?? 10,
        enableMobileOrders: tenant.enableMobileOrders ?? true,
        enableCallServer: tenant.enableCallServer ?? true,
        enableSound: tenant.enableSound ?? true,
        subscriptionStatus: tenant.subscriptionStatus,
        onboardingCompleted: !!tenant.onboardingCompleted,
      },
      categories: categories.map((c) => ({
        _id: String(c._id),
        name: c.name,
        order: c.order,
      })),
      items: items.map((i) => {
        const catObj = typeof i.categoryId === "object" && i.categoryId !== null ? i.categoryId : null;
        const categoryName = catObj && "name" in catObj ? (catObj.name as string) : "Catégorie";
        const categoryIdStr = catObj && "_id" in catObj ? (catObj as { _id: { toString(): string } })._id.toString() : String(i.categoryId);

        return {
          _id: String(i._id),
          categoryId: categoryIdStr,
          categoryName,
          name: i.name,
          description: i.description || "",
          price: i.price,
          photoUrl: i.photoUrl || "",
          available: i.available ?? true,
        };
      }),
      tables: tables.map((t) => ({
        _id: String(t._id),
        label: t.label,
        qrToken: t.qrToken,
        status: t.status,
      })),
    });
  } catch (error) {
    console.error("GET /api/onboarding/status error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données d'onboarding" },
      { status: 500 }
    );
  }
}
