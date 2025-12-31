import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET: 取得單一卡片
export async function GET(request: Request, { params }: RouteParams) {
    const { id } = await params;

    try {
        const entry = await prisma.entry.findUnique({
            where: { id },
            include: {
                user: true,
                reactions: { include: { user: true } }
            }
        });

        if (!entry) {
            return NextResponse.json({ success: false, error: 'Entry not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: entry });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}

// PUT: 編輯卡片
export async function PUT(request: Request, { params }: RouteParams) {
    const { id } = await params;

    try {
        const body = await request.json();
        const { content, imageUrl, lockedUntil } = body;

        const entry = await prisma.entry.update({
            where: { id },
            data: {
                ...(content !== undefined && { content }),
                ...(imageUrl !== undefined && { imageUrl }),
                ...(lockedUntil !== undefined && { lockedUntil: lockedUntil ? new Date(lockedUntil) : null }),
            },
            include: {
                user: true,
                reactions: { include: { user: true } }
            }
        });

        return NextResponse.json({ success: true, data: entry });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
    }
}

// DELETE: 刪除卡片
export async function DELETE(request: Request, { params }: RouteParams) {
    const { id } = await params;

    try {
        await prisma.entry.delete({ where: { id } });
        return NextResponse.json({ success: true, message: 'Entry deleted' });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
    }
}
