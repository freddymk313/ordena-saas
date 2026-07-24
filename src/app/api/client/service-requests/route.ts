import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ServiceRequest } from "@/models/ServiceRequest";
import { Table } from "@/models/Table";
import { Order } from "@/models/Order";
import { Bill } from "@/models/Bill";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    const { tableId, tenantId, type } = await req.json();

    if (!tableId || !tenantId || !["call_server", "request_bill"].includes(type)) {
      return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
    }

    await connectToDatabase();

    // Create service request
    const serviceReq = await ServiceRequest.create({
      tenantId,
      tableId,
      type,
      status: "pending",
    });

    // Update table status
    const table = await Table.findById(tableId);
    if (table) {
      if (type === "call_server") {
        table.status = "service_requested";
      } else if (type === "request_bill") {
        table.status = "bill_requested";
      }
      await table.save();
    }

    // If request_bill, find or create pending Bill for table
    let bill = null;
    if (type === "request_bill") {
      const existingBill = await Bill.findOne({
        tableId,
        status: { $in: ["pending", "bill_delivered"] },
      });

      if (existingBill) {
        bill = existingBill;
      } else {
        // Find orders for this table
        const orders = await Order.find({ tableId }).populate("items.menuItemId").lean();

        let totalAmount = 0;
        const orderIds: mongoose.Types.ObjectId[] = [];

        orders.forEach((o) => {
          orderIds.push(o._id);
          o.items.forEach((item: { menuItemId?: { price?: number } | unknown; quantity: number }) => {
            const price = typeof item.menuItemId === "object" && item.menuItemId && "price" in item.menuItemId && typeof item.menuItemId.price === "number" ? item.menuItemId.price : 0;
            totalAmount += price * item.quantity;
          });
        });

        bill = await Bill.create({
          tenantId,
          tableId,
          orderIds,
          totalAmount: Math.round(totalAmount * 100) / 100,
          status: "pending",
        });
      }
    }

    return NextResponse.json({ serviceRequest: serviceReq, bill });
  } catch (error) {
    console.error("POST /api/client/service-requests error:", error);
    return NextResponse.json({ error: "Erreur lors de la demande de service" }, { status: 500 });
  }
}
