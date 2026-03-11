import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase';

// PATCH /api/colors/[id] — admin only
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    .update({ name: name.trim() })
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Boja sa tim nazivom već postoji.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/colors/[id] — admin only
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = createServiceClient();

  // Check if color is in use
  const { data: col } = await db
    .from('colors')
    .select('name')
    .eq('id', params.id)
    .single();

  if (col) {
    const { count } = await db
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('color', col.name);

    if (count && count > 0) {
      return NextResponse.json(
        { error: `Nije moguće obrisati — boja se koristi na ${count} oglasa.` },
        { status: 409 }
      );
    }
  }

  const { error } = await db.from('colors').delete().eq('id', params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
