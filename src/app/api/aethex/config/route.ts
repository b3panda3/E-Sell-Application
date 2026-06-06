import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const storefront = await db.storefront.findFirst({
      where: { userId: session.user.id },
    });

    if (!storefront) {
      return NextResponse.json({ config: null });
    }

    const config = await db.aethexConfig.findUnique({
      where: { storefrontId: storefront.id },
    });

    return NextResponse.json({ config });
  } catch (error) {
    console.error('Aethex config GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const storefront = await db.storefront.findFirst({
      where: { userId: session.user.id },
    });

    if (!storefront) {
      return NextResponse.json({ error: 'Storefront not found' }, { status: 404 });
    }

    const body = await request.json();
    const { isEnabled, greeting, faqs, customInstructions, language, escalationMessage, autoResponseDelay } = body;

    const data = {
      ...(isEnabled !== undefined && { isEnabled }),
      ...(greeting !== undefined && { greeting }),
      ...(faqs !== undefined && { faqs: typeof faqs === 'string' ? faqs : JSON.stringify(faqs) }),
      ...(customInstructions !== undefined && { customInstructions }),
      ...(language !== undefined && { language }),
      ...(escalationMessage !== undefined && { escalationMessage }),
      ...(autoResponseDelay !== undefined && { autoResponseDelay }),
    };

    const config = await db.aethexConfig.upsert({
      where: { storefrontId: storefront.id },
      update: data,
      create: {
        storefrontId: storefront.id,
        ...data,
      },
    });

    return NextResponse.json({ config });
  } catch (error) {
    console.error('Aethex config POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
