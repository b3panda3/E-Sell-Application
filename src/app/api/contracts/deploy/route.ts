import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { contractAddress, txHash, network, name, symbol, supply, mintable, pausable } = body;

    if (!contractAddress || !name || !symbol || !supply) {
      return NextResponse.json(
        { error: 'contractAddress, name, symbol, and supply are required' },
        { status: 400 }
      );
    }

    // Verify the user is a merchant
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || user.role !== 'MERCHANT') {
      return NextResponse.json(
        { error: 'Only merchants can deploy tokens' },
        { status: 403 }
      );
    }

    // Delete any previous token and create a new one
    await db.deployedToken.deleteMany({ where: { userId: session.user.id } });

    const deployedToken = await db.deployedToken.create({
      data: {
        userId: session.user.id,
        contractAddress,
        tokenAddress: contractAddress,
        network: network || 'BSC',
        name,
        symbol,
        supply: parseInt(supply, 10),
        mintable: !!mintable,
        pausable: !!pausable,
        verifiedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      deployedToken: {
        id: deployedToken.id,
        contractAddress: deployedToken.contractAddress,
        tokenAddress: deployedToken.tokenAddress,
        network: deployedToken.network,
        name: deployedToken.name,
        symbol: deployedToken.symbol,
        supply: deployedToken.supply.toString(),
        mintable: deployedToken.mintable,
        pausable: deployedToken.pausable,
        verifiedAt: deployedToken.verifiedAt,
      },
    });
  } catch (error) {
    console.error('Contract deploy save error:', error);
    return NextResponse.json(
      { error: 'Failed to save deployment' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deployedTokens = await db.deployedToken.findMany({
      where: { userId: session.user.id },
      orderBy: { verifiedAt: 'desc' },
    });

    return NextResponse.json({
      tokens: deployedTokens.map((t) => ({
        ...t,
        supply: t.supply.toString(),
      })),
    });
  } catch (error) {
    console.error('Get deployed tokens error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tokens' },
      { status: 500 }
    );
  }
}
