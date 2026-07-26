import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { MenuItem } from "@/models/MenuItem";
import { MenuCategory } from "@/models/MenuCategory";
import { Tenant } from "@/models/Tenant";
import { auth } from "@/auth";
import { getTenantFilterFromSession } from "@/lib/tenant";

export async function GET(req: NextRequest) {
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
        queryTenantId = firstTenant._id.toString();
      }
    }

    if (!queryTenantId) {
      return NextResponse.json([]);
    }

    const searchParams = req.nextUrl.searchParams;
    const categoryId = searchParams.get("categoryId");

    const query: Record<string, unknown> = { tenantId: queryTenantId };
    if (categoryId && categoryId !== "all") {
      query.categoryId = categoryId;
    }

    const items = await MenuItem.find(query)
      .populate("categoryId", "name order")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      items.map((i) => {
        const catObj = typeof i.categoryId === "object" && i.categoryId !== null ? i.categoryId : null;
        const categoryName = catObj && "name" in catObj ? (catObj.name as string) : "Catégorie inconnue";
        const categoryIdStr = catObj && "_id" in catObj ? (catObj as { _id: { toString(): string } })._id.toString() : String(i.categoryId);

        return {
          _id: i._id.toString(),
          tenantId: i.tenantId.toString(),
          categoryId: categoryIdStr,
          categoryName,
          name: i.name,
          description: i.description || "",
          price: i.price,
          photoUrl: i.photoUrl || "",
          available: i.available ?? true,
          createdAt: i.createdAt,
        };
      })
    );
  } catch (error) {
    console.error("GET /api/admin/menu/items error:", error);
    return NextResponse.json({ error: "Erreur lors du chargement des plats" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { categoryId, name, description, price, photoUrl, available } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Le nom du plat est obligatoire" }, { status: 400 });
    }
    if (!categoryId) {
      return NextResponse.json({ error: "La catégorie est obligatoire" }, { status: 400 });
    }
    if (price === undefined || typeof price !== "number" || price < 0) {
      return NextResponse.json({ error: "Un prix valide (≥ 0 €) est obligatoire" }, { status: 400 });
    }

    await connectToDatabase();
    const tenantFilter = getTenantFilterFromSession(session);

    let queryTenantId = tenantFilter.tenantId;
    if (!queryTenantId) {
      const firstTenant = await Tenant.findOne().lean();
      if (firstTenant) {
        queryTenantId = firstTenant._id.toString();
      }
    }

    if (!queryTenantId) {
      return NextResponse.json({ error: "Aucun restaurant associé" }, { status: 400 });
    }

    const categoryExists = await MenuCategory.findById(categoryId);
    if (!categoryExists) {
      return NextResponse.json({ error: "La catégorie spécifiée n'existe pas" }, { status: 404 });
    }

    const newItem = await MenuItem.create({
      tenantId: queryTenantId,
      categoryId,
      name: name.trim(),
      description: (description || "").trim(),
      price: Number(price),
      photoUrl: (photoUrl || "").trim(),
      available: available !== undefined ? Boolean(available) : true,
    });

    return NextResponse.json(
      {
        _id: newItem._id.toString(),
        tenantId: newItem.tenantId.toString(),
        categoryId: newItem.categoryId.toString(),
        categoryName: categoryExists.name,
        name: newItem.name,
        description: newItem.description,
        price: newItem.price,
        photoUrl: newItem.photoUrl,
        available: newItem.available,
        createdAt: newItem.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/menu/items error:", error);
    return NextResponse.json({ error: "Erreur de création du plat" }, { status: 500 });
  }
}
