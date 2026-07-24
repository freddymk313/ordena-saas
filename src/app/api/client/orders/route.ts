import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { Table } from "@/models/Table";

interface PopulatedMenuItem {
  _id: { toString(): string } | string;
  name?: string;
  price?: number;
  photoUrl?: string;
}

interface PopulatedOrderItem {
  menuItemId: PopulatedMenuItem | { toString(): string };
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tableId, tenantId, customerName, items } = body;

    if (!tableId || !tenantId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "tableId, tenantId et au moins un article sont requis" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Verify table exists
    const table = await Table.findById(tableId);
    if (!table) {
      return NextResponse.json({ error: "Table introuvable" }, { status: 404 });
    }

    // Default preparation estimate: 15 minutes from now
    const estimatedReadyAt = new Date(Date.now() + 15 * 60 * 1000);

    const newOrder = await Order.create({
      tenantId,
      tableId,
      customerName: customerName ? customerName.trim() : "Client Table",
      items,
      status: "pending",
      estimatedReadyAt,
    });

    // Mark table as occupied
    if (table.status === "free") {
      table.status = "occupied";
      await table.save();
    }

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("POST /api/client/orders error:", error);
    return NextResponse.json({ error: "Erreur lors de la prise de commande" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tableId = searchParams.get("tableId");

    if (!tableId) {
      return NextResponse.json({ error: "tableId est requis" }, { status: 400 });
    }

    await connectToDatabase();

    const orders = await Order.find({ tableId })
      .sort({ createdAt: -1 })
      .populate("items.menuItemId", "name price photoUrl")
      .lean();

    return NextResponse.json(
      orders.map((o) => ({
        _id: o._id.toString(),
        tableId: o.tableId.toString(),
        customerName: o.customerName || "",
        status: o.status,
        estimatedReadyAt: o.estimatedReadyAt ? new Date(o.estimatedReadyAt).toISOString() : null,
        createdAt: new Date(o.createdAt).toISOString(),
        items: o.items.map((i: PopulatedOrderItem) => {
          const isPopulated = typeof i.menuItemId === "object" && i.menuItemId !== null;
          const pop = isPopulated ? (i.menuItemId as PopulatedMenuItem) : null;
          const itemIdStr = pop
            ? typeof pop._id === "object" && pop._id
              ? pop._id.toString()
              : String(pop._id)
            : String(i.menuItemId);

          return {
            menuItemId: itemIdStr,
            name: pop?.name || "Article",
            price: pop?.price || 0,
            photoUrl: pop?.photoUrl || "",
            quantity: i.quantity,
          };
        }),
      }))
    );
  } catch (error) {
    console.error("GET /api/client/orders error:", error);
    return NextResponse.json({ error: "Erreur lors du chargement des commandes" }, { status: 500 });
  }
}
