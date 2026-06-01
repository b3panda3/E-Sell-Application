import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const service = await db.service.findUnique({ where: { id } });
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }
    return NextResponse.json({ service });
  } catch (error) {
    console.error("Service GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, priceNGN, priceCrypto, duration, isActive } = body;

    const service = await db.service.findUnique({
      where: { id },
      include: { storefront: true },
    });
    if (!service || service.storefront.userId !== session.user.id) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const updated = await db.service.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(priceNGN !== undefined && { priceNGN: parseFloat(String(priceNGN)) }),
        ...(priceCrypto !== undefined && { priceCrypto }),
        ...(duration !== undefined && { duration }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ service: updated });
  } catch (error) {
    console.error("Service PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const service = await db.service.findUnique({
      where: { id },
      include: { storefront: true },
    });
    if (!service || service.storefront.userId !== session.user.id) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    await db.service.delete({ where: { id } });
    return NextResponse.json({ message: "Service deleted" });
  } catch (error) {
    console.error("Service DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
