import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storefronts = await db.storefront.findMany({
      where: { userId: session.user.id },
      include: {
        theme: true,
        products: { where: { isActive: true } },
        services: { where: { isActive: true } },
        staff: true,
      },
    });

    return NextResponse.json({ storefronts });
  } catch (error) {
    console.error("Storefront GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { themeId, customColors, aboutUs, address, socialLinks, bankDetails, isActive, logoUrl, featuredImageUrl, storeName, currency } = body;

    // Check if storefront already exists
    const existing = await db.storefront.findFirst({
      where: { userId: session.user.id },
    });

    if (existing) {
      // Update existing storefront
      const updated = await db.storefront.update({
        where: { id: existing.id },
        data: {
          ...(themeId !== undefined && { themeId }),
          ...(storeName !== undefined && { storeName }),
          ...(customColors !== undefined && { customColors }),
          ...(aboutUs !== undefined && { aboutUs }),
          ...(address !== undefined && { address }),
          ...(socialLinks !== undefined && { socialLinks }),
          ...(bankDetails !== undefined && { bankDetails }),
          ...(isActive !== undefined && { isActive }),
          ...(logoUrl !== undefined && { logoUrl }),
          ...(featuredImageUrl !== undefined && { featuredImageUrl }),
          ...(currency !== undefined && { currency }),
        },
        include: { theme: true },
      });
      return NextResponse.json({ storefront: updated });
    }

    // Create new storefront
    const storefront = await db.storefront.create({
      data: {
        userId: session.user.id,
        storeName: storeName || null,
        themeId: themeId || null,
        customColors: customColors || null,
        aboutUs: aboutUs || null,
        address: address || null,
        socialLinks: socialLinks || null,
        bankDetails: bankDetails || null,
        isActive: isActive !== undefined ? isActive : true,
        logoUrl: logoUrl || null,
        featuredImageUrl: featuredImageUrl || null,
        currency: currency || 'NGN',
      },
      include: { theme: true },
    });

    return NextResponse.json({ storefront }, { status: 201 });
  } catch (error) {
    console.error("Storefront POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
