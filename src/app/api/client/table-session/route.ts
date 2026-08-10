import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Table } from "@/models/Table";
import { Tenant } from "@/models/Tenant";
import { MenuCategory } from "@/models/MenuCategory";
import { MenuItem } from "@/models/MenuItem";
import { signTableToken } from "@/lib/table-session";

export async function POST(req: NextRequest) {
  try {
    const { qrToken } = await req.json();

    if (!qrToken || typeof qrToken !== "string") {
      return NextResponse.json({ error: "Token QR invalide" }, { status: 400 });
    }

    await connectToDatabase();

    const table = await Table.findOne({ qrToken }).lean();
    if (!table) {
      return NextResponse.json({ error: "Table introuvable ou QR code invalide" }, { status: 404 });
    }

    const tenant = await Tenant.findById(table.tenantId).lean();
    if (!tenant) {
      return NextResponse.json({ error: "Établissement introuvable" }, { status: 404 });
    }

    // Seed default categories & menu items for tenant if empty
    const categoryCount = await MenuCategory.countDocuments({ tenantId: tenant._id });
    if (categoryCount === 0) {
      const catEntrees = await MenuCategory.create({ tenantId: tenant._id, name: "Entrées", order: 1 });
      const catPlats = await MenuCategory.create({ tenantId: tenant._id, name: "Plats Principaux", order: 2 });
      const catDesserts = await MenuCategory.create({ tenantId: tenant._id, name: "Desserts", order: 3 });
      const catBoissons = await MenuCategory.create({ tenantId: tenant._id, name: "Boissons", order: 4 });

      await MenuItem.insertMany([
        {
          tenantId: tenant._id,
          categoryId: catEntrees._id,
          name: "Tartare de Saumon & Avocat",
          description: "Saumon frais, dés d'avocat au citron vert, ciboulette et sésame grillé",
          price: 14.50,
          photoUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop",
          available: true,
        },
        {
          tenantId: tenant._id,
          categoryId: catEntrees._id,
          name: "Velouté de Potimarron aux Châtaignes",
          description: "Soupe onctueuse au potimarron rôti, éclats de châtaignes et huile de noisette",
          price: 9.80,
          photoUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&auto=format&fit=crop",
          available: true,
        },
        {
          tenantId: tenant._id,
          categoryId: catPlats._id,
          name: "Burger Gourmet & Frites Maison",
          description: "Bœuf charolais, cheddar affiné, oignons confits, sauce artisanale et brioche dorée",
          price: 18.90,
          photoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop",
          available: true,
        },
        {
          tenantId: tenant._id,
          categoryId: catPlats._id,
          name: "Risotto aux Champignons Sauvages",
          description: "Riz Arborio crémeux, cèpes poêlés, parmesan Reggiano 24 mois et roquette",
          price: 17.50,
          photoUrl: "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=500&auto=format&fit=crop",
          available: true,
        },
        {
          tenantId: tenant._id,
          categoryId: catPlats._id,
          name: "Pavé de Thon Mi-Cuit Sésame",
          description: "Thon rouge snacké, wok de légumes de saison, réduction soja-gingembre",
          price: 22.00,
          photoUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop",
          available: true,
        },
        {
          tenantId: tenant._id,
          categoryId: catDesserts._id,
          name: "Fondant au Chocolat & Glace Vanille",
          description: "Cœur coulant au chocolat noir 70%, quenelle de vanille de Madagascar",
          price: 8.50,
          photoUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop",
          available: true,
        },
        {
          tenantId: tenant._id,
          categoryId: catDesserts._id,
          name: "Tiramisu Traditionnel Café",
          description: "Biscuit cuillère imbibé d'espresso pur, mascarpone aérien et cacao amer",
          price: 7.90,
          photoUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop",
          available: true,
        },
        {
          tenantId: tenant._id,
          categoryId: catBoissons._id,
          name: "Limonade Artisanale Citron Gingembre",
          description: "Fait maison, fraîcheur acidulée et pointe de gingembre bio",
          price: 4.80,
          photoUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop",
          available: true,
        },
        {
          tenantId: tenant._id,
          categoryId: catBoissons._id,
          name: "Mocktail Fruits Rouges & Menthe",
          description: "Purée de framboises, jus de pamplemousse rose, menthe fraîche et eau pétillante",
          price: 6.50,
          photoUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop",
          available: true,
        },
      ]);
    }

    const payload = {
      tableId: String(table._id),
      tenantId: String(tenant._id),
      qrToken: table.qrToken,
      tableLabel: table.label,
    };

    const token = await signTableToken(payload);

    const response = NextResponse.json({
      table: {
        _id: String(table._id),
        label: table.label,
        qrToken: table.qrToken,
        status: table.status,
        currentOrderId: table.currentOrderId ? String(table.currentOrderId) : null,
      },
      tenant: {
        _id: String(tenant._id),
        name: tenant.name,
        logoUrl: tenant.logoUrl,
        brandColor: tenant.brandColor || "#059669",
      },
      token,
    });

    // Set 3h session cookie
    response.cookies.set("ordena_table_session", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3 * 3600, // 3 hours
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("POST /api/client/table-session error:", error);
    return NextResponse.json({ error: "Erreur lors de l'initialisation de la session" }, { status: 500 });
  }
}
