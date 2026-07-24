import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Bill } from "@/models/Bill";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tableId = searchParams.get("tableId");

    if (!tableId) {
      return NextResponse.json({ error: "tableId est requis" }, { status: 400 });
    }

    await connectToDatabase();

    const bill = await Bill.findOne({ tableId })
      .sort({ createdAt: -1 })
      .lean();

    if (!bill) {
      return NextResponse.json({ bill: null, isPaid: false });
    }

    return NextResponse.json({
      bill: {
        _id: bill._id.toString(),
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
