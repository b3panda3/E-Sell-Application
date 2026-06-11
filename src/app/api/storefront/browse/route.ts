import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const merchants = await db.user.findMany({
      where: {
        role: "MERCHANT",
        storefronts: { some: { isActive: true } },
      },
      include: {
        storefronts: {
          where: { isActive: true },
          include: {
            theme: true,
            products: { where: { isActive: true } },
            services: { where: { isActive: true } },
          },
        },
        trustProfile: true,
      },
    });

    const stores = merchants.map((merchant) => {
      const storefront = merchant.storefronts[0];
      return {
        merchantName: merchant.name,
        merchantImage: merchant.image,
        esellCode: merchant.esellCode,
        businessCategory: merchant.businessCategory,
        trustBadge: merchant.trustBadge,
        trustProfile: merchant.trustProfile
          ? {
              badge: merchant.trustProfile.badge,
              totalTrades: merchant.trustProfile.totalTrades,
              satisfactionScore: merchant.trustProfile.satisfactionScore,
            }
          : null,
        storefront: {
          id: storefront.id,
          storeName: storefront.storeName,
          logoUrl: storefront.logoUrl,
          featuredImageUrl: storefront.featuredImageUrl,
          currency: storefront.currency,
          themeId: storefront.themeId,
          customColors: storefront.customColors,
          aboutUs: storefront.aboutUs,
          theme: storefront.theme
            ? { name: storefront.theme.name, defaultColors: storefront.theme.defaultColors }
            : null,
          products: storefront.products.map((p) => ({ id: p.id })),
          services: storefront.services.map((s) => ({ id: s.id })),
        },
      };
    });

    return NextResponse.json({ stores });
  } catch (error) {
    console.error("Browse stores error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
