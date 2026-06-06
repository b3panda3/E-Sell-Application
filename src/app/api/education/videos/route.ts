import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

const INITIAL_VIDEOS = [
  { title: 'How to Set Up Your E-Sell Store', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category: 'getting-started', featured: true, description: 'Step-by-step merchant onboarding guide', sortOrder: 1 },
  { title: 'Using the AI Chatbot on E-Sell', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category: 'ai', featured: true, description: 'How to interact with the AI assistant', sortOrder: 2 },
  { title: 'How to Accept Payments with Paystack', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category: 'payments', featured: true, description: 'Payment setup and configuration', sortOrder: 3 },
  { title: 'Setting Up MetaMask for Crypto Payments', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category: 'crypto', featured: true, description: 'Wallet setup walkthrough', sortOrder: 4 },
  { title: 'Securing Your Crypto Wallet', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category: 'crypto', featured: false, description: 'Security best practices', sortOrder: 5 },
  { title: 'Understanding Trust Badges', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category: 'getting-started', featured: false, description: 'How trust levels work', sortOrder: 6 },
  { title: 'Voice Commands on E-Sell', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category: 'ai', featured: false, description: 'Hands-free navigation', sortOrder: 7 },
  { title: 'Adding Products and Services', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category: 'storefront', featured: false, description: 'Product management', sortOrder: 8 },
  { title: 'Customizing Your Storefront Theme', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category: 'storefront', featured: false, description: 'Theme editor walkthrough', sortOrder: 9 },
  { title: 'How to Browse and Shop on E-Sell', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category: 'getting-started', featured: false, description: 'Customer shopping guide', sortOrder: 10 },
  { title: 'Understanding BNB and BEP-20 Tokens', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category: 'crypto', featured: false, description: 'Binance Smart Chain intro', sortOrder: 11 },
  { title: 'How to Set Up Your Wallet Address', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category: 'crypto', featured: false, description: 'Wallet configuration', sortOrder: 12 },
  { title: 'Building Customer Trust', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category: 'storefront', featured: false, description: 'Growing your trust badge', sortOrder: 13 },
  { title: 'Multi-Currency Pricing on E-Sell', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category: 'payments', featured: false, description: 'NGN, BNB, and USDT pricing', sortOrder: 14 },
  { title: 'Deploying Your Own Token on BSC', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category: 'advanced', featured: false, description: 'Token deployment guide', sortOrder: 15 },
  { title: 'Managing Staff on Your Store', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category: 'storefront', featured: false, description: 'Team management', sortOrder: 16 },
  { title: 'E-Sell Platform Overview 2025', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category: 'getting-started', featured: false, description: 'Complete walkthrough', sortOrder: 17 },
];

export async function GET() {
  try {
    const dbVideos = await db.educationVideo.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    if (dbVideos.length > 0) {
      return NextResponse.json({ videos: dbVideos });
    }

    // Seed initial videos if none exist
    const created = await Promise.all(
      INITIAL_VIDEOS.map((v) =>
        db.educationVideo.create({ data: v })
      )
    );

    return NextResponse.json({ videos: created });
  } catch (error) {
    console.error('Education videos GET error:', error);
    // Fallback to hardcoded list if DB fails
    return NextResponse.json({
      videos: INITIAL_VIDEOS.map((v, i) => ({
        id: String(i + 1),
        ...v,
        isActive: true,
        createdBy: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin status
    const admin = await db.adminUser.findUnique({
      where: { userId: session.user.id },
    });
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { title, youtubeUrl, description, category, featured, sortOrder } = body;

    if (!title || !youtubeUrl) {
      return NextResponse.json({ error: 'Title and YouTube URL are required' }, { status: 400 });
    }

    const video = await db.educationVideo.create({
      data: {
        title,
        youtubeUrl,
        description: description || null,
        category: category || null,
        featured: featured || false,
        sortOrder: sortOrder || 0,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({ video }, { status: 201 });
  } catch (error) {
    console.error('Education video POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
