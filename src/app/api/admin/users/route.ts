import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User, UserRole } from "@/models/User";
import { Tenant } from "@/models/Tenant";
import { auth } from "@/auth";
import { getTenantFilterFromSession } from "@/lib/tenant";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const currentRole = session.user.role;
    if (currentRole !== "restaurant_admin" && currentRole !== "super_admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    await connectToDatabase();
    const tenantFilter = getTenantFilterFromSession(session);

    let queryTenantId = tenantFilter.tenantId;

    if (!queryTenantId) {
      const firstTenant = await Tenant.findOne().lean();
      if (firstTenant) {
        queryTenantId = String(firstTenant._id);
      }
    }

    if (!queryTenantId) {
      return NextResponse.json([]);
    }

    // Strict filter: only users for this tenant, and never show super_admin
    const users = await User.find({
      tenantId: queryTenantId,
      role: { $ne: "super_admin" },
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      users.map((u) => ({
        _id: String(u._id),
        name: u.name,
        email: u.email,
        role: u.role,
        active: u.active ?? true,
        tenantId: u.tenantId ? String(u.tenantId) : null,
        createdAt: u.createdAt,
      }))
    );
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des utilisateurs" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const currentRole = session.user.role;
    if (currentRole !== "restaurant_admin" && currentRole !== "super_admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, role, password } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Le nom est obligatoire" }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Email valide obligatoire" }, { status: 400 });
    }

    const validRoles: UserRole[] = ["restaurant_admin", "server", "kitchen"];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Rôle invalide (doit être Admin Restaurant, Serveur ou Cuisine)" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 6 caractères" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const tenantFilter = getTenantFilterFromSession(session);

    let queryTenantId = tenantFilter.tenantId;
    if (!queryTenantId) {
      const firstTenant = await Tenant.findOne().lean();
      if (firstTenant) {
        queryTenantId = String(firstTenant._id);
      }
    }

    if (!queryTenantId) {
      return NextResponse.json({ error: "Aucun restaurant associé" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: "Un utilisateur avec cet email existe déjà" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role,
      active: true,
      tenantId: queryTenantId,
    });

    return NextResponse.json(
      {
        _id: String(newUser._id),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        active: newUser.active,
        tenantId: newUser.tenantId ? String(newUser.tenantId) : null,
        createdAt: newUser.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/users error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'utilisateur" },
      { status: 500 }
    );
  }
}
