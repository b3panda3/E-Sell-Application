import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const storefrontId = searchParams.get("storefrontId");

    if (!storefrontId) {
      return NextResponse.json({ error: "storefrontId is required" }, { status: 400 });
    }

    const products = await db.product.findMany({
      where: { storefrontId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Products GET error:", error);
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
    const { storefrontId, name, description, priceNGN, priceCrypto, category, images, isActive } = body;

    if (!storefrontId || !name || priceNGN === undefined) {
      return NextResponse.json(
        { error: "storefrontId, name, and priceNGN are required" },
        { status: 400 }
      );
    }

    // Verify storefront belongs to user
    const storefront = await db.storefront.findFirst({
      where: { id: storefrontId, userId: session.user.id },
    });
    if (!storefront) {
      return NextResponse.json({ error: "Storefront not found" }, { status: 404 });
    }

    const product = await db.product.create({
      data: {
        storefrontId,
        name,
        description: description || null,
        priceNGN: parseFloat(String(priceNGN)),
        priceCrypto: priceCrypto || null,
        category: category || null,
        images: images || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Product POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
