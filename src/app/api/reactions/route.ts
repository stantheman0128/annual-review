import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// POST: 新增表情反應
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { entryId, userName, emoji } = body;

        // 找到使用者
        let user = await prisma.user.findUnique({ where: { name: userName } });
        if (!user) {
            user = await prisma.user.create({ data: { name: userName } });
        }

        // 建立反應 (若已存在會因 unique constraint 失敗)
        const reaction = await prisma.reaction.create({
            data: {
                entryId,
                userId: user.id,
                emoji,
            },
            include: { user: true }
        });

        return NextResponse.json({ success: true, data: reaction }, { status: 201 });
    } catch (error: any) {
        // 如果是重複的反應，回傳特定錯誤
        if (error.code === 'P2002') {
            return NextResponse.json({ success: false, error: 'Already reacted with this emoji' }, { status: 409 });
        }
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

// DELETE: 移除表情反應
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const entryId = searchParams.get('entryId');
        const userName = searchParams.get('userName');
        const emoji = searchParams.get('emoji');

        if (!entryId || !userName || !emoji) {
            return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { name: userName } });
        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        await prisma.reaction.delete({
            where: {
                entryId_userId_emoji: {
                    entryId,
                    userId: user.id,
                    emoji,
                }
            }
        });

        return NextResponse.json({ success: true, message: 'Reaction removed' });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
    }
}
