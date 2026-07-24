import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { Table } from "@/models/Table";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!["pending", "preparing", "ready", "served"].includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    await connectToDatabase();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 });
    }

    order.status = status;
    await order.save();

    // If order is served, check if all orders for this table are served
    if (status === "served") {
      const remainingUnserved = await Order.find({
        tableId: order.tableId,
        status: { $ne: "served" },
      });

      if (remainingUnserved.length === 0) {
        const table = await Table.findById(order.tableId);
        if (table && table.status === "service_requested") {
          table.status = "occupied";
          await table.save();
        }
      }
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("PATCH /api/staff/orders/[id] error:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour de la commande" }, { status: 500 });
  }
}
