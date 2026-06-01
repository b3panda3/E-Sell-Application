import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

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
    const { name, role, email, phone, bio, profileImageUrl } = body;

    const staff = await db.staff.findUnique({
      where: { id },
      include: { storefront: true },
    });
    if (!staff || staff.storefront.userId !== session.user.id) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    const updated = await db.staff.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(role !== undefined && { role }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(bio !== undefined && { bio }),
        ...(profileImageUrl !== undefined && { profileImageUrl }),
      },
    });

    return NextResponse.json({ staff: updated });
  } catch (error) {
    console.error("Staff PUT error:", error);
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

    const staff = await db.staff.findUnique({
      where: { id },
      include: { storefront: true },
    });
    if (!staff || staff.storefront.userId !== session.user.id) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    await db.staff.delete({ where: { id } });
    return NextResponse.json({ message: "Staff deleted" });
  } catch (error) {
    console.error("Staff DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
