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

    const staff = await db.staff.findMany({
      where: { storefrontId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ staff });
  } catch (error) {
    console.error("Staff GET error:", error);
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
    const { storefrontId, name, role, email, phone, bio, profileImageUrl } = body;

    if (!storefrontId || !name || !role) {
      return NextResponse.json(
        { error: "storefrontId, name, and role are required" },
        { status: 400 }
      );
    }

    const storefront = await db.storefront.findFirst({
      where: { id: storefrontId, userId: session.user.id },
    });
    if (!storefront) {
      return NextResponse.json({ error: "Storefront not found" }, { status: 404 });
    }

    const staff = await db.staff.create({
      data: {
        storefrontId,
        name,
        role,
        email: email || null,
        phone: phone || null,
        bio: bio || null,
        profileImageUrl: profileImageUrl || null,
      },
    });

    return NextResponse.json({ staff }, { status: 201 });
  } catch (error) {
    console.error("Staff POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
