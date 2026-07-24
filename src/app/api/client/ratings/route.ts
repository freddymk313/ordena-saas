import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Rating } from "@/models/Rating";

export async function POST(req: NextRequest) {
  try {
    const { tenantId, orderId, ratings } = await req.json();

    if (!tenantId || !ratings || !Array.isArray(ratings) || ratings.length === 0) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    await connectToDatabase();

    const ratingDocs = ratings.map((r: { menuItemId?: string; score: number; comment?: string }) => ({
      tenantId,
      orderId: orderId || undefined,
      menuItemId: r.menuItemId || undefined,
      score: Math.min(5, Math.max(1, Number(r.score) || 5)),
      comment: r.comment ? r.comment.trim() : "",
    }));

    await Rating.insertMany(ratingDocs);

    return NextResponse.json({ success: true, count: ratingDocs.length });
  } catch (error) {
    console.error("POST /api/client/ratings error:", error);
    return NextResponse.json({ error: "Erreur lors de l'enregistrement de l'avis" }, { status: 500 });
  }
}
