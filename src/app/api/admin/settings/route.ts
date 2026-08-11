import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Tenant } from "@/models/Tenant";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await connectToDatabase();

    let tenantId = session.user.activeTenantId || session.user.tenantId;

    if (!tenantId) {
      const firstTenant = await Tenant.findOne().lean();
      if (firstTenant) {
        tenantId = String(firstTenant._id);
      }
    }

    if (!tenantId) {
      return NextResponse.json({ error: "Aucun établissement trouvé" }, { status: 404 });
    }

    const tenant = await Tenant.findById(tenantId).lean();
    if (!tenant) {
      return NextResponse.json({ error: "Établissement introuvable" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      tenant: {
        _id: String(tenant._id),
        name: tenant.name || "",
        phone: tenant.phone ?? "",
        address: tenant.address ?? "",
        currency: tenant.currency ?? "€",
        taxRate: tenant.taxRate ?? 10,
        enableMobileOrders: tenant.enableMobileOrders ?? true,
        enableCallServer: tenant.enableCallServer ?? true,
        enableSound: tenant.enableSound ?? true,
        logoUrl: tenant.logoUrl ?? "",
        brandColor: tenant.brandColor ?? "#059669",
        timezone: tenant.timezone ?? "Europe/Paris",
        subscriptionStatus: tenant.subscriptionStatus,
        onboardingCompleted: tenant.onboardingCompleted,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/settings error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des paramètres" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await connectToDatabase();

    let tenantId = session.user.activeTenantId || session.user.tenantId;
    if (!tenantId) {
      const firstTenant = await Tenant.findOne().lean();
      if (firstTenant) {
        tenantId = String(firstTenant._id);
      }
    }

    if (!tenantId) {
      return NextResponse.json({ error: "Aucun établissement associé" }, { status: 400 });
    }

    const body = await req.json();
    const {
      name,
      phone,
      address,
      currency,
      taxRate,
      enableMobileOrders,
      enableCallServer,
      enableSound,
      logoUrl,
      brandColor,
      timezone,
    } = body;

    const updateFields: Record<string, unknown> = {};

    if (name !== undefined && typeof name === "string") {
      updateFields.name = name.trim();
    }
    if (phone !== undefined && typeof phone === "string") {
      updateFields.phone = phone.trim();
    }
    if (address !== undefined && typeof address === "string") {
      updateFields.address = address.trim();
    }
    if (currency !== undefined && typeof currency === "string") {
      updateFields.currency = currency.trim();
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
    if (logoUrl !== undefined && typeof logoUrl === "string") {
      updateFields.logoUrl = logoUrl.trim();
    }
    if (brandColor !== undefined && typeof brandColor === "string") {
      updateFields.brandColor = brandColor.trim();
    }
    if (timezone !== undefined && typeof timezone === "string") {
      updateFields.timezone = timezone.trim();
    }

    const updatedTenant = await Tenant.findByIdAndUpdate(
      tenantId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedTenant) {
      return NextResponse.json({ error: "Établissement non trouvé" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      tenant: {
        _id: String(updatedTenant._id),
        name: updatedTenant.name,
        phone: updatedTenant.phone ?? "",
        address: updatedTenant.address ?? "",
        currency: updatedTenant.currency ?? "€",
        taxRate: updatedTenant.taxRate ?? 10,
        enableMobileOrders: updatedTenant.enableMobileOrders ?? true,
        enableCallServer: updatedTenant.enableCallServer ?? true,
        enableSound: updatedTenant.enableSound ?? true,
        logoUrl: updatedTenant.logoUrl ?? "",
        brandColor: updatedTenant.brandColor ?? "#059669",
        timezone: updatedTenant.timezone ?? "Europe/Paris",
        subscriptionStatus: updatedTenant.subscriptionStatus,
        onboardingCompleted: updatedTenant.onboardingCompleted,
      },
    });
  } catch (error) {
    console.error("PATCH /api/admin/settings error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des paramètres" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  return PATCH(req);
}
