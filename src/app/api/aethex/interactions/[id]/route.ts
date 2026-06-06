import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { rating } = await request.json();

    if (!rating || (rating !== 1 && rating !== 2)) {
      return NextResponse.json({ error: 'Rating must be 1 (thumbs down) or 2 (thumbs up)' }, { status: 400 });
    }

    const existing = await db.aethexInteraction.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Interaction not found' }, { status: 404 });
    }

    const interaction = await db.aethexInteraction.update({
      where: { id },
      data: { rating },
    });

    return NextResponse.json({ interaction });
  } catch (error) {
    console.error('Aethex interaction PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
