import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Table } from "@/models/Table";
import { auth } from "@/auth";
import crypto from "crypto";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await connectToDatabase();

    const tenantId = session.user.activeTenantId || session.user.tenantId;
    const query = tenantId ? { tenantId } : {};

    const tables = await Table.find(query).sort({ label: 1 }).lean();

    return NextResponse.json(tables);
  } catch (error) {
    console.error("GET /api/tables error:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération des tables" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { label } = await req.json();

    if (!label || typeof label !== "string") {
      return NextResponse.json({ error: "Le libellé de la table est requis" }, { status: 400 });
    }

    await connectToDatabase();

    const tenantId = session.user.activeTenantId || session.user.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: "Aucun établissement actif" }, { status: 400 });
    }

    const qrToken = crypto.randomBytes(12).toString("hex");

    const newTable = await Table.create({
      tenantId,
      label: label.trim(),
      qrToken,
      status: "free",
    });

    return NextResponse.json(newTable, { status: 201 });
  } catch (error) {
    console.error("POST /api/tables error:", error);
    return NextResponse.json({ error: "Erreur lors de la création de la table" }, { status: 500 });
  }
}
