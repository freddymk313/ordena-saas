import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ServiceRequest } from "@/models/ServiceRequest";
import { Table } from "@/models/Table";
import { Bill } from "@/models/Bill";
import { Order } from "@/models/Order";
import { Tenant } from "@/models/Tenant";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    await connectToDatabase();

    let tenantId = session?.user?.activeTenantId || session?.user?.tenantId;

    if (!tenantId) {
      const firstTenant = await Tenant.findOne().lean();
      if (firstTenant) {
        tenantId = String(firstTenant._id);
      }
    }

    const query: Record<string, unknown> = { status: "pending" };
    if (tenantId) {
      query.tenantId = tenantId;
    }

    // Fetch pending service requests sorted by oldest first
    const requests = await ServiceRequest.find(query)
      .sort({ createdAt: 1 })
      .populate("tableId", "label status")
      .lean();

    // Fetch bills for pending request_bill items
    const bills = await Bill.find({
      tenantId,
      status: { $in: ["pending", "bill_delivered"] },
    }).lean();

    // Fetch ready orders waiting to be served
    const readyOrders = await Order.find({
      tenantId,
      status: "ready",
    })
      .populate("tableId", "label")
      .populate("items.menuItemId", "name price")
      .lean();

    // Fetch tables with active bills
    const tables = await Table.find({ tenantId }).lean();

    const formattedRequests = requests.map((req) => {
      const tableObj = typeof req.tableId === "object" && req.tableId !== null ? req.tableId : null;
      const tableIdStr = tableObj && "_id" in tableObj ? (tableObj as { _id: { toString(): string } })._id.toString() : String(req.tableId);
      const tableLabel = tableObj && "label" in tableObj ? (tableObj.label as string) : "Table ?";

      // Find bill for table if request_bill
      const tableBill = bills.find((b) => String(b.tableId) === tableIdStr);

      return {
        _id: String(req._id),
        tenantId: String(req.tenantId),
        tableId: tableIdStr,
        tableLabel,
        type: req.type,
        status: req.status,
        createdAt: new Date(req.createdAt).toISOString(),
        bill: tableBill
          ? {
              _id: String(tableBill._id),
              totalAmount: tableBill.totalAmount,
              status: tableBill.status,
            }
          : null,
      };
    });

    const formattedReadyOrders = readyOrders.map((o) => {
      const tableObj = typeof o.tableId === "object" && o.tableId !== null ? o.tableId : null;
      const tableLabel = tableObj && "label" in tableObj ? (tableObj.label as string) : "Table ?";

      return {
        _id: String(o._id),
        tableId: o.tableId ? (typeof o.tableId === "object" ? String((o.tableId as { _id: unknown })._id) : String(o.tableId)) : "",
        tableLabel,
        customerName: o.customerName || "Client Table",
        status: o.status,
        createdAt: new Date(o.createdAt).toISOString(),
        items: o.items.map((i: { menuItemId?: unknown; quantity: number }) => {
          const itemObj = typeof i.menuItemId === "object" && i.menuItemId !== null ? (i.menuItemId as { name?: string; price?: number }) : null;
          return {
            name: itemObj?.name || "Article",
            price: itemObj?.price || 0,
            quantity: i.quantity,
          };
        }),
      };
    });

    return NextResponse.json({
      serviceRequests: formattedRequests,
      readyOrders: formattedReadyOrders,
      tables: tables.map((t) => ({
        _id: String(t._id),
        label: t.label,
        status: t.status,
      })),
    });
  } catch (error) {
    console.error("GET /api/staff/service-requests error:", error);
    return NextResponse.json({ error: "Erreur lors du chargement des demandes" }, { status: 500 });
  }
}
