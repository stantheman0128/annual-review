import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET: 取得留言
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const entryId = searchParams.get('entryId');

        if (!entryId) {
            return NextResponse.json({ success: false, error: 'Missing entryId' }, { status: 400 });
        }

        const comments = await prisma.comment.findMany({
            where: { entryId },
            include: { user: true },
            orderBy: { createdAt: 'asc' }
        });

        return NextResponse.json({ success: true, data: comments });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}

// POST: 新增留言
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { entryId, userName, content } = body;

        if (!entryId || !userName || !content) {
            return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
        }

        let user = await prisma.user.findUnique({ where: { name: userName } });
        if (!user) {
            user = await prisma.user.create({ data: { name: userName } });
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                entryId,
                userId: user.id
            },
            include: { user: true }
        });

        return NextResponse.json({ success: true, data: comment }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}

// DELETE: 刪除留言
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const userName = searchParams.get('userName');

        if (!id || !userName) {
            return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
        }

        const comment = await prisma.comment.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!comment) {
            return NextResponse.json({ success: false, error: 'Comment not found' }, { status: 404 });
        }

        // 權限檢查：只能刪除自己的留言
        if (comment.user.name !== userName) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        await prisma.comment.delete({ where: { id } });

        return NextResponse.json({ success: true, message: 'Comment deleted' });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
