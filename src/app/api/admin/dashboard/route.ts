import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Bill } from "@/models/Bill";
import { Order } from "@/models/Order";
import { MenuItem } from "@/models/MenuItem";
import { Rating } from "@/models/Rating";
import { Tenant } from "@/models/Tenant";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    await connectToDatabase();

    let tenantId = session?.user?.activeTenantId || session?.user?.tenantId;

    if (!tenantId) {
      const firstTenant = await Tenant.findOne().lean();
      if (firstTenant) {
        tenantId = firstTenant._id.toString();
      }
    }

    const searchParams = req.nextUrl.searchParams;
    const period = searchParams.get("period") || "7d";

    // Date range filter
    const now = new Date();
    let startDate: Date | null = null;

    if (period === "today") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === "7d") {
      startDate = new Date();
      startDate.setDate(now.getDate() - 7);
    } else if (period === "30d") {
      startDate = new Date();
      startDate.setDate(now.getDate() - 30);
    }

    const dateFilter: Record<string, unknown> = {};
    if (startDate) {
      dateFilter.$gte = startDate;
    }

    const tenantFilter = tenantId ? { tenantId } : {};

    // 1. BILLS & REVENUE STATS
    const billQuery: Record<string, unknown> = { ...tenantFilter, status: "paid" };
    if (startDate) {
      billQuery.createdAt = dateFilter;
    }

    const paidBills = await Bill.find(billQuery).lean();
    const totalRevenue = paidBills.reduce((acc, bill) => acc + (bill.totalAmount || 0), 0);
    const paidBillsCount = paidBills.length;
    const averageBill = paidBillsCount > 0 ? totalRevenue / paidBillsCount : 0;

    // 2. ORDERS STATS
    const orderQuery: Record<string, unknown> = { ...tenantFilter };
    if (startDate) {
      orderQuery.createdAt = dateFilter;
    }

    const orders = await Order.find(orderQuery).lean();
    const totalOrders = orders.length;

    // 3. RUSH HOURS CALCULATION (00h to 23h)
    const hoursCounts = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, "0")}h`,
      hourNum: i,
      commandes: 0,
    }));

    orders.forEach((o) => {
      const h = new Date(o.createdAt).getHours();
      if (hoursCounts[h]) {
        hoursCounts[h].commandes += 1;
      }
    });

    // 4. TOP ORDERED DISHES
    const itemQuantityMap: Record<string, number> = {};
    orders.forEach((o) => {
      o.items?.forEach((item: { menuItemId?: unknown; quantity: number }) => {
        const idStr = item.menuItemId ? item.menuItemId.toString() : null;
        if (idStr) {
          itemQuantityMap[idStr] = (itemQuantityMap[idStr] || 0) + (item.quantity || 1);
        }
      });
    });

    const allMenuItems = await MenuItem.find(tenantFilter).lean();

    const topOrderedDishes = allMenuItems
      .map((item) => {
        const idStr = item._id.toString();
        return {
          _id: idStr,
          name: item.name,
          price: item.price,
          photoUrl: item.photoUrl,
          orderCount: itemQuantityMap[idStr] || 0,
        };
      })
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 5);

    // 5. TOP RATED DISHES
    const ratingsQuery: Record<string, unknown> = { ...tenantFilter };
    if (startDate) {
      ratingsQuery.createdAt = dateFilter;
    }

    const ratings = await Rating.find(ratingsQuery).lean();

    const ratingMap: Record<string, { totalScore: number; count: number }> = {};
    ratings.forEach((r) => {
      if (r.menuItemId) {
        const idStr = r.menuItemId.toString();
        if (!ratingMap[idStr]) {
          ratingMap[idStr] = { totalScore: 0, count: 0 };
        }
        ratingMap[idStr].totalScore += r.score;
        ratingMap[idStr].count += 1;
      }
    });

    const topRatedDishes = allMenuItems
      .map((item) => {
        const idStr = item._id.toString();
        const stat = ratingMap[idStr];
        const avgScore = stat && stat.count > 0 ? stat.totalScore / stat.count : 0;
        const count = stat ? stat.count : 0;
        return {
          _id: idStr,
          name: item.name,
          price: item.price,
          photoUrl: item.photoUrl,
          avgRating: Math.round(avgScore * 10) / 10,
          reviewCount: count,
        };
      })
      .filter((item) => item.reviewCount > 0 || item.avgRating > 0)
      .sort((a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount)
      .slice(0, 5);

    return NextResponse.json({
      period,
      totalRevenue,
      averageBill,
      totalOrders,
      paidBillsCount,
      rushHours: hoursCounts,
      topOrderedDishes,
      topRatedDishes,
    });
  } catch (error) {
    console.error("GET /api/admin/dashboard error:", error);
    return NextResponse.json({ error: "Erreur serveur dashboard" }, { status: 500 });
  }
}
