import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ServiceRequest } from "@/models/ServiceRequest";
import { Table } from "@/models/Table";
import { Bill } from "@/models/Bill";
import { Order } from "@/models/Order";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, tableId } = body;

    await connectToDatabase();

    if (action === "mark_handled") {
      const serviceReq = await ServiceRequest.findById(id);
      if (serviceReq) {
        serviceReq.status = "handled";
        await serviceReq.save();

        // Check if there are other pending requests for this table
        const remainingPending = await ServiceRequest.find({
          tableId: serviceReq.tableId,
          status: "pending",
        });

        if (remainingPending.length === 0) {
          const table = await Table.findById(serviceReq.tableId);
          if (table && (table.status === "service_requested" || table.status === "bill_requested")) {
            table.status = "occupied";
            await table.save();
          }
        }
      }
      return NextResponse.json({ success: true });
    }

    if (action === "mark_served") {
      const targetTableId = tableId || id;
      // Mark all ready or preparing orders for this table as served
      await Order.updateMany(
        { tableId: targetTableId, status: { $in: ["ready", "preparing", "pending"] } },
        { status: "served" }
      );

      // Mark any pending call_server request as handled
      await ServiceRequest.updateMany(
        { tableId: targetTableId, type: "call_server", status: "pending" },
        { status: "handled" }
      );

      const table = await Table.findById(targetTableId);
      if (table && table.status === "service_requested") {
        table.status = "occupied";
        await table.save();
      }

      return NextResponse.json({ success: true });
    }

    if (action === "mark_paid") {
      const targetTableId = tableId || id;

      // Mark active bills for this table as paid
      await Bill.updateMany(
        { tableId: targetTableId, status: { $ne: "paid" } },
        { status: "paid" }
      );

      // Mark all orders for this table as served
      await Order.updateMany(
        { tableId: targetTableId },
        { status: "served" }
      );

      // Mark all service requests as handled
      await ServiceRequest.updateMany(
        { tableId: targetTableId, status: "pending" },
        { status: "handled" }
      );

      // Reset table status to free
      const table = await Table.findById(targetTableId);
      if (table) {
        table.status = "free";
        await table.save();
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  } catch (error) {
    console.error("PATCH /api/staff/service-requests/[id] error:", error);
    return NextResponse.json({ error: "Erreur lors de l'action de service" }, { status: 500 });
  }
}
