import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Tenant } from "@/models/Tenant";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { restaurantName, name, email, password } = body;

    if (!restaurantName || typeof restaurantName !== "string" || !restaurantName.trim()) {
      return NextResponse.json(
        { error: "Le nom du restaurant est obligatoire." },
        { status: 400 }
      );
    }

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Votre nom complet est obligatoire." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Veuillez fournir une adresse e-mail valide." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 6 caractères." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "Cette adresse e-mail est déjà utilisée.",
          code: "EMAIL_ALREADY_EXISTS",
        },
        { status: 409 }
      );
    }

    // Create the new restaurant Tenant
    const newTenant = await Tenant.create({
      name: restaurantName.trim(),
      brandColor: "#059669",
      subscriptionStatus: "trial",
      onboardingCompleted: false,
      currency: "€",
      timezone: "Europe/Paris",
    });

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create the Admin User for this restaurant
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "restaurant_admin",
      authProvider: "credentials",
      active: true,
      tenantId: newTenant._id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Compte restaurant créé avec succès",
        user: {
          id: String(newUser._id),
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/auth/signup error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création de votre compte." },
      { status: 500 }
    );
  }
}
