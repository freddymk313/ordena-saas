import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
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

    await connectToDatabase();

    const item = await MenuItem.findById(id);
    if (!item) {
      return NextResponse.json({ error: "Plat non trouvé" }, { status: 404 });
    }

    const { categoryId, name, description, price, photoUrl, available } = body;

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return NextResponse.json({ error: "Nom de plat invalide" }, { status: 400 });
      }
      item.name = name.trim();
    }

    if (description !== undefined) {
      item.description = String(description).trim();
    }

    if (price !== undefined) {
      if (typeof price !== "number" || price < 0) {
        return NextResponse.json({ error: "Prix invalide" }, { status: 400 });
      }
      item.price = price;
    }

    if (categoryId !== undefined) {
      item.categoryId = categoryId;
    }

    if (photoUrl !== undefined) {
      item.photoUrl = String(photoUrl).trim();
    }

    if (available !== undefined) {
      item.available = Boolean(available);
    }

    await item.save();

    return NextResponse.json({
      _id: item._id.toString(),
      categoryId: item.categoryId.toString(),
      name: item.name,
      description: item.description,
      price: item.price,
      photoUrl: item.photoUrl,
      available: item.available,
      updatedAt: item.updatedAt,
    });
  } catch (error) {
    console.error("PATCH /api/admin/menu/items/[id] error:", error);
    return NextResponse.json({ error: "Erreur lors de la modification du plat" }, { status: 500 });
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

    const deleted = await MenuItem.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Plat non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Plat supprimé avec succès" });
  } catch (error) {
    console.error("DELETE /api/admin/menu/items/[id] error:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression du plat" }, { status: 500 });
  }
}
