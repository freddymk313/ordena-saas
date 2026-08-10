import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Bill } from "@/models/Bill";
import { Table } from "@/models/Table";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const tableId = searchParams.get("tableId");
    const orderId = searchParams.get("orderId");

    if (!tableId && !orderId) {
      return NextResponse.json({ error: "tableId ou orderId est requis" }, { status: 400 });
    }

    await connectToDatabase();

    let bill = null;

    if (orderId) {
      // Find bill containing this order
      bill = await Bill.findOne({ orderIds: orderId }).sort({ createdAt: -1 }).lean();
    }

    if (!bill && tableId) {
      const table = await Table.findById(tableId).lean();
      if (table?.currentOrderId) {
        bill = await Bill.findOne({
          tableId,
          orderIds: table.currentOrderId,
        })
          .sort({ createdAt: -1 })
          .lean();
      } else {
        // If currentOrderId is null, check if there is an active pending/unpaid bill for this table
        bill = await Bill.findOne({
          tableId,
          status: { $in: ["pending", "bill_delivered"] },
        })
          .sort({ createdAt: -1 })
          .lean();
      }
    }

    if (!bill) {
      return NextResponse.json({ bill: null, isPaid: false });
    }

    return NextResponse.json({
      bill: {
        _id: String(bill._id),
        totalAmount: bill.totalAmount,
        status: bill.status,
        createdAt: new Date(bill.createdAt).toISOString(),
      },
      isPaid: bill.status === "paid",
    });
  } catch (error) {
    console.error("GET /api/client/bill error:", error);
    return NextResponse.json({ error: "Erreur lors de la vérification de l'addition" }, { status: 500 });
  }
}
