import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Tenant } from "@/models/Tenant";
import { User } from "@/models/User";
import { Order } from "@/models/Order";
import { Bill } from "@/models/Bill";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Accès refusé. Réservé aux super administrateurs." },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // 1. Fetch all tenants
    const tenants = await Tenant.find().sort({ createdAt: -1 }).lean();

    // 2. Fetch platform global metrics
    const totalTenants = tenants.length;
    const activeTenants = tenants.filter(
      (t) => t.subscriptionStatus === "active" || t.subscriptionStatus === "trial"
    ).length;

    const totalOrders = await Order.countDocuments();
    const paidBills = await Bill.find({ status: "paid" }).lean();
    const totalRevenue = paidBills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const totalUsers = await User.countDocuments();

    // 3. Collect per-tenant stats and admins
    const tenantIds = tenants.map((t) => t._id);

    // Get order count per tenant
    const orderAgg = await Order.aggregate([
      { $match: { tenantId: { $in: tenantIds } } },
      { $group: { _id: "$tenantId", count: { $sum: 1 } } },
    ]);
    const orderCountMap: Record<string, number> = {};
    orderAgg.forEach((item) => {
      if (item._id) orderCountMap[String(item._id)] = item.count;
    });

    // Get revenue per tenant
    const revenueAgg = await Bill.aggregate([
      { $match: { tenantId: { $in: tenantIds }, status: "paid" } },
      { $group: { _id: "$tenantId", total: { $sum: "$totalAmount" } } },
    ]);
    const revenueMap: Record<string, number> = {};
    revenueAgg.forEach((item) => {
      if (item._id) revenueMap[String(item._id)] = item.total;
    });

    // Get restaurant_admin users for each tenant
    const admins = await User.find({
      tenantId: { $in: tenantIds },
      role: "restaurant_admin",
    })
      .select("name email tenantId createdAt")
      .lean();

    const adminMap: Record<string, { name: string; email: string }> = {};
    admins.forEach((u) => {
      if (u.tenantId) {
        adminMap[String(u.tenantId)] = { name: u.name, email: u.email };
      }
    });

    // Format list of tenants with additional metadata
    const formattedTenants = tenants.map((t) => {
      const idStr = String(t._id);
      return {
        _id: idStr,
        name: t.name,
        logoUrl: t.logoUrl || "",
        brandColor: t.brandColor || "#3b82f6",
        subscriptionStatus: t.subscriptionStatus || "active",
        createdAt: t.createdAt,
        orderCount: orderCountMap[idStr] || 0,
        revenue: revenueMap[idStr] || 0,
        admin: adminMap[idStr] || null,
      };
    });

    return NextResponse.json({
      metrics: {
        totalTenants,
        activeTenants,
        totalOrders,
        totalRevenue,
        totalUsers,
      },
      tenants: formattedTenants,
      currentActiveTenantId: session.user.activeTenantId || session.user.tenantId,
    });
  } catch (error) {
    console.error("GET /api/super-admin/tenants error:", error);
    return NextResponse.json({ error: "Erreur serveur lors de la récupération" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Accès refusé. Réservé aux super administrateurs." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, logoUrl, brandColor, subscriptionStatus, adminName, adminEmail, adminPassword } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Le nom du restaurant est requis." }, { status: 400 });
    }
    if (!adminEmail || !adminEmail.trim()) {
      return NextResponse.json({ error: "L'adresse e-mail de l'administrateur est requise." }, { status: 400 });
    }
    if (!adminPassword || adminPassword.length < 6) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 6 caractères." }, { status: 400 });
    }

    await connectToDatabase();

    // Check if user with this email already exists
    const existingUser = await User.findOne({
      email: adminEmail.toLowerCase().trim(),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cette adresse e-mail." },
        { status: 400 }
      );
    }

    // 1. Create Tenant
    const newTenant = await Tenant.create({
      name: name.trim(),
      logoUrl: logoUrl ? logoUrl.trim() : "",
      brandColor: brandColor || "#3b82f6",
      subscriptionStatus: subscriptionStatus || "active",
    });

    // 2. Hash Password & Create restaurant_admin User
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const newAdmin = await User.create({
      name: (adminName && adminName.trim()) || `Admin ${name}`,
      email: adminEmail.toLowerCase().trim(),
      passwordHash,
      role: "restaurant_admin",
      tenantId: newTenant._id,
    });

    return NextResponse.json({
      success: true,
      tenant: {
        _id: String(newTenant._id),
        name: newTenant.name,
        logoUrl: newTenant.logoUrl,
        brandColor: newTenant.brandColor,
        subscriptionStatus: newTenant.subscriptionStatus,
        createdAt: newTenant.createdAt,
      },
      admin: {
        _id: String(newAdmin._id),
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });
  } catch (error) {
    console.error("POST /api/super-admin/tenants error:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la création du tenant." },
      { status: 500 }
    );
  }
}
