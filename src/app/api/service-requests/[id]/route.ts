import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ServiceRequest } from "@/models/ServiceRequest";
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

    const serviceReq = await ServiceRequest.findOneAndUpdate(query, body, {
      new: true,
    });

    if (!serviceReq) {
      return NextResponse.json({ error: "Demande non trouvée" }, { status: 404 });
    }

    // Check if there are other pending requests for this table
    const remainingPending = await ServiceRequest.find({
      tableId: serviceReq.tableId,
      status: "pending",
    });

    if (remainingPending.length === 0) {
      // If no remaining pending service requests, update table status if it was service_requested
      const table = await Table.findById(serviceReq.tableId);
      if (table && table.status === "service_requested") {
        table.status = "occupied";
        await table.save();
      }
    }

    return NextResponse.json(serviceReq);
  } catch (error) {
    console.error("PATCH /api/service-requests/[id] error:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}
