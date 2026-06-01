import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: themeId } = await params;

    // Verify theme exists
    const theme = await db.theme.findUnique({ where: { id: themeId } });
    if (!theme) {
      return NextResponse.json({ error: "Theme not found" }, { status: 404 });
    }

    // Find or create storefront
    let storefront = await db.storefront.findFirst({
      where: { userId: session.user.id },
    });

    if (storefront) {
      storefront = await db.storefront.update({
        where: { id: storefront.id },
        data: { themeId },
        include: { theme: true },
      });
    } else {
      storefront = await db.storefront.create({
        data: {
          userId: session.user.id,
          themeId,
          customColors: theme.defaultColors,
        },
        include: { theme: true },
      });
    }

    return NextResponse.json({ storefront });
  } catch (error) {
    console.error("Theme select error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
