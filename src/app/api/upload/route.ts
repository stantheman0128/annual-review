import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const ext = file.name.split('.').pop();
        const filename = `memories/${timestamp}.${ext}`;

        // Convert File to ArrayBuffer then Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('photos')
            .upload(filename, buffer, {
                contentType: file.type,
                upsert: false
            });

        if (error) {
            console.error('Supabase upload error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('photos')
            .getPublicUrl(filename);

        return NextResponse.json({
            success: true,
            data: {
                url: urlData.publicUrl,
                pathname: filename
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
