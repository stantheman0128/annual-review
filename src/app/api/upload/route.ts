import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
        }

        // 上傳到 Vercel Blob
        const blob = await put(file.name, file, {
            access: 'public',
        });

        return NextResponse.json({
            success: true,
            data: {
                url: blob.url,
                pathname: blob.pathname
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
