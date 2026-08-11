import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Tenant } from "@/models/Tenant";
import { auth } from "@/auth";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const tenantId = session.user.activeTenantId || session.user.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: "Aucun établissement associé" }, { status: 400 });
    }

    const body = await req.json();
    const {
      name,
      logoUrl,
      brandColor,
      currency,
      address,
      phone,
      timezone,
      taxRate,
      enableMobileOrders,
      enableCallServer,
      enableSound,
    } = body;

    await connectToDatabase();

    const updateFields: Record<string, unknown> = {};
    if (name && typeof name === "string" && name.trim()) {
      updateFields.name = name.trim();
    }
    if (logoUrl !== undefined && typeof logoUrl === "string") {
      updateFields.logoUrl = logoUrl.trim();
    }
    if (brandColor && typeof brandColor === "string") {
      updateFields.brandColor = brandColor.trim();
    }
    if (currency && typeof currency === "string") {
      updateFields.currency = currency.trim();
    }
    if (address !== undefined && typeof address === "string") {
      updateFields.address = address.trim();
    }
    if (phone !== undefined && typeof phone === "string") {
      updateFields.phone = phone.trim();
    }
    if (timezone && typeof timezone === "string") {
      updateFields.timezone = timezone.trim();
    }
    if (taxRate !== undefined) {
      const numTax = Number(taxRate);
      updateFields.taxRate = isNaN(numTax) ? 10 : numTax;
    }
    if (enableMobileOrders !== undefined) {
      updateFields.enableMobileOrders = Boolean(enableMobileOrders);
    }
    if (enableCallServer !== undefined) {
      updateFields.enableCallServer = Boolean(enableCallServer);
    }
    if (enableSound !== undefined) {
      updateFields.enableSound = Boolean(enableSound);
    }

    const updatedTenant = await Tenant.findByIdAndUpdate(
      tenantId,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedTenant) {
      return NextResponse.json({ error: "Établissement non trouvé" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      tenant: {
        _id: String(updatedTenant._id),
        name: updatedTenant.name,
        logoUrl: updatedTenant.logoUrl,
        brandColor: updatedTenant.brandColor,
        currency: updatedTenant.currency,
        address: updatedTenant.address,
        phone: updatedTenant.phone,
        timezone: updatedTenant.timezone,
        taxRate: updatedTenant.taxRate ?? 10,
        enableMobileOrders: updatedTenant.enableMobileOrders ?? true,
        enableCallServer: updatedTenant.enableCallServer ?? true,
        enableSound: updatedTenant.enableSound ?? true,
        onboardingCompleted: updatedTenant.onboardingCompleted,
      },
    });
  } catch (error) {
    console.error("PATCH /api/onboarding/tenant error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des paramètres du restaurant" },
      { status: 500 }
    );
  }
}
