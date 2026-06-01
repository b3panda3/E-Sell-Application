import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const themes = await db.theme.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ themes });
  } catch (error) {
    console.error("Themes GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
