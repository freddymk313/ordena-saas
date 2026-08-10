import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { MenuCategory } from "@/models/MenuCategory";
import { Tenant } from "@/models/Tenant";
import { auth } from "@/auth";
import { getTenantFilterFromSession } from "@/lib/tenant";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await connectToDatabase();
    const tenantFilter = getTenantFilterFromSession(session);

    let queryTenantId = tenantFilter.tenantId;

    if (!queryTenantId) {
      const firstTenant = await Tenant.findOne().lean();
      if (firstTenant) {
        queryTenantId = String(firstTenant._id);
      }
    }

    if (!queryTenantId) {
      return NextResponse.json([]);
    }

    const categories = await MenuCategory.find({ tenantId: queryTenantId })
      .sort({ order: 1, name: 1 })
      .lean();

    return NextResponse.json(
      categories.map((c) => ({
        _id: String(c._id),
        tenantId: String(c.tenantId),
        name: c.name,
        order: c.order || 0,
        createdAt: c.createdAt,
      }))
    );
  } catch (error) {
    console.error("GET /api/admin/menu/categories error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des catégories" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { name, order } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Le nom de la catégorie est obligatoire" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const tenantFilter = getTenantFilterFromSession(session);

    let queryTenantId = tenantFilter.tenantId;
    if (!queryTenantId) {
      const firstTenant = await Tenant.findOne().lean();
      if (firstTenant) {
        queryTenantId = String(firstTenant._id);
      }
    }

    if (!queryTenantId) {
      return NextResponse.json(
        { error: "Aucun restaurant associé" },
        { status: 400 }
      );
    }

    // Determine max order if not provided
    let categoryOrder = order;
    if (typeof categoryOrder !== "number") {
      const lastCat = await MenuCategory.findOne({ tenantId: queryTenantId })
        .sort({ order: -1 })
        .lean();
      categoryOrder = lastCat ? (lastCat.order || 0) + 1 : 1;
    }

    const newCategory = await MenuCategory.create({
      tenantId: queryTenantId,
      name: name.trim(),
      order: categoryOrder,
    });

    return NextResponse.json(
      {
        _id: String(newCategory._id),
        tenantId: String(newCategory.tenantId),
        name: newCategory.name,
        order: newCategory.order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/menu/categories error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la catégorie" },
      { status: 500 }
    );
  }
}
