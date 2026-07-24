import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Table } from "@/models/Table";
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

    const tenantId = session.user.activeTenantId || session.user.tenantId;
    const query = tenantId ? { _id: id, tenantId } : { _id: id };

    const updatedTable = await Table.findOneAndUpdate(query, body, {
      new: true,
    });

    if (!updatedTable) {
      return NextResponse.json({ error: "Table introuvable" }, { status: 404 });
    }

    return NextResponse.json(updatedTable);
  } catch (error) {
    console.error("PATCH /api/tables/[id] error:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour de la table" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    await connectToDatabase();

    const tenantId = session.user.activeTenantId || session.user.tenantId;
    const query = tenantId ? { _id: id, tenantId } : { _id: id };

    const deleted = await Table.findOneAndDelete(query);

    if (!deleted) {
      return NextResponse.json({ error: "Table introuvable" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/tables/[id] error:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression de la table" }, { status: 500 });
  }
}
