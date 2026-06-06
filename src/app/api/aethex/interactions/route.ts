import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const storefront = await db.storefront.findFirst({
      where: { userId: session.user.id },
    });

    if (!storefront) {
      return NextResponse.json({ interactions: [], total: 0 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const rating = searchParams.get('rating');
    const escalated = searchParams.get('escalated');

    const where: Record<string, unknown> = { storefrontId: storefront.id };
    if (rating === 'positive') where.rating = 2;
    if (rating === 'negative') where.rating = 1;
    if (escalated === 'true') where.escalated = true;

    const [interactions, total] = await Promise.all([
      db.aethexInteraction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.aethexInteraction.count({ where }),
    ]);

    return NextResponse.json({
      interactions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Aethex interactions GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
