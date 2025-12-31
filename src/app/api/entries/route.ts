import { NextResponse } from 'next/server';
import db, { Entry, generateId } from '@/lib/store';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const user = searchParams.get('user');
    const type = searchParams.get('type');

    // Read latest data
    await db.read();

    let results = db.data.entries;

    if (user) {
        results = results.filter(e => e.user === user);
    }
    if (type) {
        results = results.filter(e => e.type === type);
    }

    // Sort by createdAt desc
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, data: results });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Auto-fill basic validation if needed, or trust frontend for now
        const newEntry: Entry = {
            _id: generateId(),
            user: body.user,
            type: body.type,
            content: body.content,
            year: body.year,
            createdAt: new Date().toISOString()
        };

        await db.update(({ entries }) => entries.push(newEntry));

        return NextResponse.json({ success: true, data: newEntry }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
    }
}
