import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ esellCode: string }> }
) {
  try {
    const { esellCode } = await params;

    const user = await db.user.findUnique({
      where: { esellCode },
      include: {
        storefronts: {
          include: {
            theme: true,
            products: { where: { isActive: true }, orderBy: { createdAt: "desc" } },
            services: { where: { isActive: true }, orderBy: { createdAt: "desc" } },
            staff: true,
          },
        },
        trustProfile: true,
      },
    });

    if (!user || user.role !== "MERCHANT") {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const storefront = user.storefronts[0];
    if (!storefront || !storefront.isActive) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    return NextResponse.json({
      store: {
        merchantName: user.name,
        merchantImage: user.image,
        esellCode: user.esellCode,
        businessCategory: user.businessCategory,
        trustBadge: user.trustBadge,
        trustProfile: user.trustProfile,
        storefront,
        // storeName from storefront if set, otherwise fall back to user name
        storeName: storefront.storeName || user.name,
      },
    });
  } catch (error) {
    console.error("Storefront GET by esellCode error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
