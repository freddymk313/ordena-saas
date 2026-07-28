import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { Tenant } from "@/models/Tenant";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    await connectToDatabase();

    let tenantId = session?.user?.activeTenantId || session?.user?.tenantId;

    if (!tenantId) {
      const firstTenant = await Tenant.findOne().lean();
      if (firstTenant) {
        tenantId = firstTenant._id.toString();
      }
    }

    const searchParams = req.nextUrl.searchParams;
    const statusFilter = searchParams.get("status");

    const query: Record<string, unknown> = {};
    if (tenantId) {
      query.tenantId = tenantId;
    }

    if (statusFilter && statusFilter !== "all") {
      query.status = statusFilter;
    }

    // Fetch orders sorted by createdAt ASC (oldest first for kitchen queue)
    const orders = await Order.find(query)
      .sort({ createdAt: 1 })
      .populate("tableId", "label status")
      .populate("items.menuItemId", "name price photoUrl")
      .lean();

    const formattedOrders = orders.map((o) => {
      const tableObj = typeof o.tableId === "object" && o.tableId !== null ? o.tableId : null;
      const tableLabel = tableObj && "label" in tableObj ? (tableObj.label as string) : "Table ? ";
      const tableStatus = tableObj && "status" in tableObj ? (tableObj.status as string) : "free";

      return {
        _id: o._id.toString(),
        tenantId: o.tenantId.toString(),
        tableId: o.tableId ? (typeof o.tableId === "object" ? (o.tableId as { _id: { toString(): string } })._id.toString() : String(o.tableId)) : "",
        tableLabel,
        tableStatus,
        customerName: o.customerName || "Client Table",
        status: o.status,
        estimatedReadyAt: o.estimatedReadyAt ? new Date(o.estimatedReadyAt).toISOString() : null,
        createdAt: new Date(o.createdAt).toISOString(),
        items: o.items.map((i: { menuItemId?: unknown; quantity: number }) => {
          const itemObj = typeof i.menuItemId === "object" && i.menuItemId !== null ? (i.menuItemId as { name?: string; price?: number; photoUrl?: string }) : null;
          return {
            name: itemObj?.name || "Article",
            price: itemObj?.price || 0,
            photoUrl: itemObj?.photoUrl || "",
            quantity: i.quantity,
          };
        }),
      };
    });

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("GET /api/staff/orders error:", error);
    return NextResponse.json({ error: "Erreur lors du chargement des commandes" }, { status: 500 });
  }
}
