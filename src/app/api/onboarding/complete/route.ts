import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Tenant } from "@/models/Tenant";
import { auth } from "@/auth";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const tenantId = session.user.activeTenantId || session.user.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: "Aucun établissement associé" }, { status: 400 });
    }

    await connectToDatabase();

    const tenant = await Tenant.findByIdAndUpdate(
      tenantId,
      { $set: { onboardingCompleted: true } },
      { new: true }
    );

    if (!tenant) {
      return NextResponse.json({ error: "Établissement introuvable" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      onboardingCompleted: true,
      message: "Onboarding validé avec succès",
    });
  } catch (error) {
    console.error("POST /api/onboarding/complete error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la finalisation de l'onboarding" },
      { status: 500 }
    );
  }
}
