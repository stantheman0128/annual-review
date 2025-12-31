import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET: 取得所有卡片 (雙方都能看到彼此的)
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    try {
        const entries = await prisma.entry.findMany({
            where: {
                ...(type && { type }),
            },
            include: {
                user: true,
                reactions: {
                    include: { user: true }
                },
                comments: {
                    include: { user: true },
                    orderBy: { createdAt: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, data: entries });
    } catch (error) {
        console.error('GET entries error:', error);
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}

// POST: 新增卡片
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userName, type, content, year, imageUrl, lockedUntil } = body;

        // 找到或建立使用者
        let user = await prisma.user.findUnique({ where: { name: userName } });
        if (!user) {
            user = await prisma.user.create({ data: { name: userName } });
        }

        const entry = await prisma.entry.create({
            data: {
                userId: user.id,
                type,
                content,
                year,
                imageUrl: imageUrl || null,
                lockedUntil: lockedUntil ? new Date(lockedUntil) : null,
            },
            include: {
                user: true,
                reactions: true
            }
        });

        return NextResponse.json({ success: true, data: entry }, { status: 201 });
    } catch (error) {
        console.error('POST entry error:', error);
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
    }
}
