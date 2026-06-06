import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await db.adminUser.findUnique({
      where: { userId: session.user.id },
    });
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, youtubeUrl, description, category, featured, sortOrder, isActive } = body;

    const existing = await db.educationVideo.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const video = await db.educationVideo.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(youtubeUrl !== undefined && { youtubeUrl }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(featured !== undefined && { featured }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ video });
  } catch (error) {
    console.error('Education video PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await db.adminUser.findUnique({
      where: { userId: session.user.id },
    });
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const { id } = await params;

    const existing = await db.educationVideo.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Soft delete by setting isActive to false
    await db.educationVideo.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Education video DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
