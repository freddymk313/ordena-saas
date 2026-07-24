import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Tenant } from "@/models/Tenant";
import { User } from "@/models/User";
import { Table } from "@/models/Table";
import { MenuCategory } from "@/models/MenuCategory";
import { MenuItem } from "@/models/MenuItem";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  return handleSeed(req);
}

export async function POST(req: NextRequest) {
  return handleSeed(req);
}

async function handleSeed(req: NextRequest) {
  try {
    const force = req.nextUrl.searchParams.get("force") === "true";

    await connectToDatabase();

    // Check if database is already seeded
    const existingSuperAdmin = await User.findOne({ role: "super_admin" });

    if (existingSuperAdmin && !force) {
      const tenantCount = await Tenant.countDocuments();
      const userCount = await User.countDocuments();
      const tableCount = await Table.countDocuments();

      return NextResponse.json({
        message: "Base de données déjà initialisée avec succès.",
        stats: { tenants: tenantCount, users: userCount, tables: tableCount },
        demoCredentials: [
          { role: "Super Admin", email: "admin@ordena.com", pass: "adminpassword123" },
          { role: "Admin Restaurant", email: "admin@bistro.com", pass: "bistropassword123" },
          { role: "Serveur", email: "serveur@bistro.com", pass: "serveurpassword123" },
          { role: "Cuisine", email: "cuisine@bistro.com", pass: "cuisinepassword123" },
        ],
      });
    }

    // 1. Create Tenant
    let tenant = await Tenant.findOne({ name: "Le Bistro Gourmet" });
    if (!tenant) {
      tenant = await Tenant.create({
        name: "Le Bistro Gourmet",
        logoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80",
        brandColor: "#059669",
        subscriptionStatus: "active",
      });
    }

    // 2. Passwords Hash
    const superAdminHash = await bcrypt.hash("adminpassword123", 10);
    const bistroAdminHash = await bcrypt.hash("bistropassword123", 10);
    const serverHash = await bcrypt.hash("serveurpassword123", 10);
    const kitchenHash = await bcrypt.hash("cuisinepassword123", 10);

    // 3. Upsert Users
    const usersToCreate = [
      {
        name: "Super Admin (Nordev)",
        email: "admin@ordena.com",
        passwordHash: superAdminHash,
        role: "super_admin",
        tenantId: null,
      },
      {
        name: "Marc Dubreuil (Manager)",
        email: "admin@bistro.com",
        passwordHash: bistroAdminHash,
        role: "restaurant_admin",
        tenantId: tenant._id,
      },
      {
        name: "Jean Serveur",
        email: "serveur@bistro.com",
        passwordHash: serverHash,
        role: "server",
        tenantId: tenant._id,
      },
      {
        name: "Chef Antoine",
        email: "cuisine@bistro.com",
        passwordHash: kitchenHash,
        role: "kitchen",
        tenantId: tenant._id,
      },
    ];

    for (const u of usersToCreate) {
      await User.findOneAndUpdate(
        { email: u.email },
        { $set: u },
        { upsert: true, new: true }
      );
    }

    // 4. Create Tables
    const tablesData = [
      { label: "Table 1", qrToken: "tbl_demo_1", status: "free" },
      { label: "Table 2", qrToken: "tbl_demo_2", status: "occupied" },
      { label: "Table 3", qrToken: "tbl_demo_3", status: "service_requested" },
      { label: "Table VIP 10", qrToken: "tbl_demo_10", status: "free" },
    ];

    for (const t of tablesData) {
      await Table.findOneAndUpdate(
        { tenantId: tenant._id, label: t.label },
        { $set: { ...t, tenantId: tenant._id } },
        { upsert: true, new: true }
      );
    }

    // 5. Create Menu Categories & Items
    const categories = [
      { name: "Entrées", order: 1 },
      { name: "Plats Principaux", order: 2 },
      { name: "Desserts", order: 3 },
      { name: "Boissons", order: 4 },
    ];

    const categoryDocs: Record<string, any> = {};

    for (const cat of categories) {
      let catDoc = await MenuCategory.findOne({ tenantId: tenant._id, name: cat.name });
      if (!catDoc) {
        catDoc = await MenuCategory.create({ tenantId: tenant._id, ...cat });
      }
      categoryDocs[cat.name] = catDoc;
    }

    const itemsData = [
      {
        categoryName: "Entrées",
        name: "Salade Burrata & Tomates Rôties",
        description: "Burrata di Bufala, tomates cerises confites, pesto de basilic frais et pignons",
        price: 14.5,
        photoUrl: "https://images.unsplash.com/photo-1592417817098-8f3d6ef23a81?w=400&auto=format&fit=crop&q=80",
        available: true,
      },
      {
        categoryName: "Entrées",
        name: "Tartare de Saumon & Avocat",
        description: "Saumon frais mariné au citron vert, aneth, brunoise d'avocat et sésame",
        price: 16.0,
        photoUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80",
        available: true,
      },
      {
        categoryName: "Plats Principaux",
        name: "Entrecôte Black Angus (300g)",
        description: "Viande grillée, sauce au poivre vert maison, frites fraîches et salade",
        price: 28.0,
        photoUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80",
        available: true,
      },
      {
        categoryName: "Plats Principaux",
        name: "Burger Artisan Gourmet",
        description: "Pain brioché, steak haché 180g, cheddar affiné, bacon croustillant, oignons confits",
        price: 19.5,
        photoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80",
        available: true,
      },
      {
        categoryName: "Desserts",
        name: "Fondant au Chocolat Valrhona",
        description: "Cœur coulant, glace vanille de Madagascar et coulis de fruits rouges",
        price: 9.5,
        photoUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&auto=format&fit=crop&q=80",
        available: true,
      },
      {
        categoryName: "Boissons",
        name: "Limonade Artisanale Citron & Menthe",
        description: "Jus de citron pressé à la minute, menthe fraîche et eau pétillante",
        price: 5.5,
        photoUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&auto=format&fit=crop&q=80",
        available: true,
      },
    ];

    for (const item of itemsData) {
      const catDoc = categoryDocs[item.categoryName];
      if (catDoc) {
        await MenuItem.findOneAndUpdate(
          { tenantId: tenant._id, name: item.name },
          {
            $set: {
              tenantId: tenant._id,
              categoryId: catDoc._id,
              name: item.name,
              description: item.description,
              price: item.price,
              photoUrl: item.photoUrl,
              available: item.available,
            },
          },
          { upsert: true, new: true }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Initialisation (seed) effectuée avec succès !",
      demoCredentials: [
        { role: "Super Admin", email: "admin@ordena.com", pass: "adminpassword123" },
        { role: "Admin Restaurant", email: "admin@bistro.com", pass: "bistropassword123" },
        { role: "Serveur", email: "serveur@bistro.com", pass: "serveurpassword123" },
        { role: "Cuisine", email: "cuisine@bistro.com", pass: "cuisinepassword123" },
      ],
    });
  } catch (error: any) {
    console.error("Seed API error:", error);
    let errorMsg = error?.message || String(error);
    if (errorNameOrMsg(error).includes("MongooseServerSelectionError") || errorNameOrMsg(error).includes("whitelist") || errorNameOrMsg(error).includes("ReplicaSetNoPrimary")) {
      errorMsg = "Impossible de se connecter à MongoDB Atlas. Assurez-vous d'avoir autorisé votre adresse IP (0.0.0.0/0) dans la console MongoDB Atlas -> Network Access.";
    }
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}

function errorNameOrMsg(err: any): string {
  return `${err?.name || ''} ${err?.message || ''} ${err?.stack || ''}`;
}
