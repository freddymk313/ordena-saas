import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { MenuCategory } from "@/models/MenuCategory";
import { MenuItem } from "@/models/MenuItem";
import { auth } from "@/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, order } = body;

    await connectToDatabase();

    const category = await MenuCategory.findById(id);
    if (!category) {
      return NextResponse.json({ error: "Catégorie non trouvée" }, { status: 404 });
    }

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return NextResponse.json({ error: "Nom de catégorie invalide" }, { status: 400 });
      }
      category.name = name.trim();
    }

    if (order !== undefined && typeof order === "number") {
      category.order = order;
    }

    await category.save();

    return NextResponse.json({
      _id: category._id.toString(),
      name: category.name,
      order: category.order,
    });
  } catch (error) {
    console.error("PATCH /api/admin/menu/categories/[id] error:", error);
    return NextResponse.json({ error: "Erreur de mise à jour" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const category = await MenuCategory.findById(id);
    if (!category) {
      return NextResponse.json({ error: "Catégorie non trouvée" }, { status: 404 });
    }

    // Delete associated menu items or prevent orphan items by deleting them
    await MenuItem.deleteMany({ categoryId: id });
    await MenuCategory.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Catégorie et plats associés supprimés" });
  } catch (error) {
    console.error("DELETE /api/admin/menu/categories/[id] error:", error);
    return NextResponse.json({ error: "Erreur de suppression" }, { status: 500 });
  }
}
