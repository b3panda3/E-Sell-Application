import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/wallets — Fetch all wallet addresses for the authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wallets = await db.walletAddress.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ wallets });
  } catch (error) {
    console.error("Wallets GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/wallets — Add a new wallet address
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { network, address, label } = body;

    // Validate address format
    if (!address || typeof address !== "string") {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    const trimmedAddress = address.trim();

    // BSC addresses start with 0x and are 42 characters long
    if (!trimmedAddress.startsWith("0x")) {
      return NextResponse.json(
        { error: "Wallet address must start with 0x" },
        { status: 400 }
      );
    }

    if (trimmedAddress.length !== 42) {
      return NextResponse.json(
        { error: "Wallet address must be 42 characters long (valid BSC/Ethereum format)" },
        { status: 400 }
      );
    }

    // Check for hex characters after 0x
    const hexPattern = /^0x[0-9a-fA-F]{40}$/;
    if (!hexPattern.test(trimmedAddress)) {
      return NextResponse.json(
        { error: "Wallet address contains invalid characters" },
        { status: 400 }
      );
    }

    // Check for duplicate address
    const existing = await db.walletAddress.findFirst({
      where: { userId: session.user.id, address: trimmedAddress },
    });

    if (existing) {
      return NextResponse.json(
        { error: "This wallet address already exists" },
        { status: 409 }
      );
    }

    const validNetworks = ["BSC", "Ethereum", "Polygon", "Arbitrum", "Optimism"];
    const walletNetwork = validNetworks.includes(network) ? network : "BSC";

    const wallet = await db.walletAddress.create({
      data: {
        userId: session.user.id,
        network: walletNetwork,
        address: trimmedAddress,
        label: label?.trim() || null,
      },
    });

    return NextResponse.json({ wallet }, { status: 201 });
  } catch (error) {
    console.error("Wallets POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
