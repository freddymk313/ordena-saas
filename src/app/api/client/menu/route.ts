import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { MenuCategory } from "@/models/MenuCategory";
import { MenuItem } from "@/models/MenuItem";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const tenantId = searchParams.get("tenantId");

    if (!tenantId) {
      return NextResponse.json({ error: "tenantId est requis" }, { status: 400 });
    }

    await connectToDatabase();

    const categories = await MenuCategory.find({ tenantId }).sort({ order: 1 }).lean();
    const items = await MenuItem.find({ tenantId, available: true }).lean();

    return NextResponse.json({
      categories: categories.map((c) => ({
        _id: String(c._id),
        name: c.name,
        order: c.order,
      })),
      items: items.map((i) => ({
        _id: String(i._id),
        categoryId: String(i.categoryId),
        name: i.name,
        description: i.description || "",
        price: i.price,
        photoUrl: i.photoUrl || "",
        available: i.available,
      })),
    });
  } catch (error) {
    console.error("GET /api/client/menu error:", error);
    return NextResponse.json({ error: "Erreur lors du chargement du menu" }, { status: 500 });
  }
}
