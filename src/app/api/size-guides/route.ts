import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase';

export async function GET() {
  const db = createServiceClient();
  const { data, error } = await db
    .from('size_guides')
    .select('id, name, content, created_at')
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, content } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Naziv je obavezan.' }, { status: 400 });

  const db = createServiceClient();
  const { data, error } = await db
    .from('size_guides')
    .insert({ name: name.trim(), content: content ?? '' })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Vodič sa tim nazivom već postoji.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
