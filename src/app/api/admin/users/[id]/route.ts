import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User, UserRole } from "@/models/User";
import { Tenant } from "@/models/Tenant";
import { auth } from "@/auth";
import { getTenantFilterFromSession } from "@/lib/tenant";
import bcrypt from "bcryptjs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const currentRole = session.user.role;
    if (currentRole !== "restaurant_admin" && currentRole !== "super_admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "ID utilisateur manquant" }, { status: 400 });
    }

    await connectToDatabase();
    const tenantFilter = getTenantFilterFromSession(session);

    let queryTenantId = tenantFilter.tenantId;
    if (!queryTenantId) {
      const firstTenant = await Tenant.findOne().lean();
      if (firstTenant) {
        queryTenantId = firstTenant._id.toString();
      }
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Security: Cannot touch super_admin accounts
    if (targetUser.role === "super_admin") {
      return NextResponse.json(
        { error: "Impossible de modifier un compte super admin" },
        { status: 403 }
      );
    }

    // Security: Strict tenant isolation
    if (targetUser.tenantId?.toString() !== queryTenantId) {
      return NextResponse.json({ error: "Accès non autorisé à cet utilisateur" }, { status: 403 });
    }

    const body = await req.json();
    const { role, active, password, name, email } = body;

    if (role !== undefined) {
      const validRoles: UserRole[] = ["restaurant_admin", "server", "kitchen"];
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
      }
      targetUser.role = role;
    }

    if (active !== undefined) {
      targetUser.active = Boolean(active);
    }

    if (name && typeof name === "string" && name.trim()) {
      targetUser.name = name.trim();
    }

    if (email && typeof email === "string" && email.includes("@")) {
      const normalizedEmail = email.toLowerCase().trim();
      if (normalizedEmail !== targetUser.email) {
        const emailExists = await User.findOne({
          email: normalizedEmail,
          _id: { $ne: targetUser._id },
        });
        if (emailExists) {
          return NextResponse.json(
            { error: "Cet email est déjà utilisé par un autre compte" },
            { status: 400 }
          );
        }
        targetUser.email = normalizedEmail;
      }
    }

    if (password) {
      if (typeof password !== "string" || password.length < 6) {
        return NextResponse.json(
          { error: "Le nouveau mot de passe doit contenir au moins 6 caractères" },
          { status: 400 }
        );
      }
      targetUser.passwordHash = await bcrypt.hash(password, 10);
    }

    await targetUser.save();

    return NextResponse.json({
      _id: targetUser._id.toString(),
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role,
      active: targetUser.active,
      tenantId: targetUser.tenantId ? targetUser.tenantId.toString() : null,
      updatedAt: targetUser.updatedAt,
    });
  } catch (error) {
    console.error("PATCH /api/admin/users/[id] error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification de l'utilisateur" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const currentRole = session.user.role;
    if (currentRole !== "restaurant_admin" && currentRole !== "super_admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "ID utilisateur manquant" }, { status: 400 });
    }

    // Cannot delete self
    if (session.user.id === id) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas supprimer votre propre compte" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const tenantFilter = getTenantFilterFromSession(session);

    let queryTenantId = tenantFilter.tenantId;
    if (!queryTenantId) {
      const firstTenant = await Tenant.findOne().lean();
      if (firstTenant) {
        queryTenantId = firstTenant._id.toString();
      }
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Security: Cannot delete super_admin
    if (targetUser.role === "super_admin") {
      return NextResponse.json(
        { error: "Impossible de supprimer un compte super admin" },
        { status: 403 }
      );
    }

    // Security: Strict tenant isolation
    if (targetUser.tenantId?.toString() !== queryTenantId) {
      return NextResponse.json({ error: "Accès non autorisé à cet utilisateur" }, { status: 403 });
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Utilisateur supprimé" });
  } catch (error) {
    console.error("DELETE /api/admin/users/[id] error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'utilisateur" },
      { status: 500 }
    );
  }
}
