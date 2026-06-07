import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// DELETE /api/wallets/[id] — Remove a wallet address (verify ownership)
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

    // Find the wallet and verify ownership
    const wallet = await db.walletAddress.findUnique({
      where: { id },
    });

    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet address not found" },
        { status: 404 }
      );
    }

    if (wallet.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You do not have permission to delete this wallet" },
        { status: 403 }
      );
    }

    await db.walletAddress.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Wallet DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
