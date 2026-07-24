import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Table } from "@/models/Table";
import { ServiceRequest } from "@/models/ServiceRequest";
import { Order } from "@/models/Order";
import { Bill } from "@/models/Bill";
import { auth } from "@/auth";

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

    // Find pending service requests for these tables
    const pendingRequests = await ServiceRequest.find({
      ...query,
      status: "pending",
    }).lean();

    // Find active orders
    const activeOrders = await Order.find({
      ...query,
      status: { $in: ["pending", "preparing", "ready"] },
    }).lean();

    // Find pending bills
    const pendingBills = await Bill.find({
      ...query,
      status: { $in: ["pending", "bill_delivered"] },
    }).lean();

    // Combine into enhanced table status list
    const enhancedTables = tables.map((t) => {
      const tableIdStr = t._id.toString();

      const requests = pendingRequests.filter(
        (r) => r.tableId.toString() === tableIdStr
      );

      const orders = activeOrders.filter(
        (o) => o.tableId.toString() === tableIdStr
      );

      const bill = pendingBills.find(
        (b) => b.tableId.toString() === tableIdStr
      );

      return {
        ...t,
        pendingRequests: requests.map((r) => ({
          _id: r._id.toString(),
          type: r.type,
          createdAt: r.createdAt,
        })),
        hasCallServer: requests.some((r) => r.type === "call_server"),
        hasRequestBill: requests.some((r) => r.type === "request_bill"),
        activeOrdersCount: orders.length,
        hasPendingBill: !!bill,
      };
    });

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      tables: enhancedTables,
    });
  } catch (error) {
    console.error("GET /api/tables/status error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statuts" },
      { status: 500 }
    );
  }
}
