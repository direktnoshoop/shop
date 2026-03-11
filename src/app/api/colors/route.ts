import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServiceClient, supabase } from '@/lib/supabase';

// GET /api/colors — public
export async function GET() {
  const { data, error } = await supabase
    .from('colors')
    .select('id, name, display_order')
    .order('display_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/colors — admin only
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Naziv boje je obavezan.' }, { status: 400 });
  }

  const db = createServiceClient();
  const { data, error } = await db
    .from('colors')
    .insert({ name: name.trim() })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Boja sa tim nazivom već postoji.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
