import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Naziv ne može biti prazan.' }, { status: 400 });

  const db = createServiceClient();
  const { data, error } = await db
    .from('sizes')
    .update({ name: name.trim() })
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Veličina sa tim nazivom već postoji.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = createServiceClient();

  // Get the size name first so we can check listings
  const { data: sizeRow } = await db
    .from('sizes')
    .select('name')
    .eq('id', params.id)
    .single();

  if (sizeRow) {
    const { count } = await db
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .contains('size', [sizeRow.name]);

    if (count && count > 0) {
      return NextResponse.json(
        { error: `Veličina se koristi na ${count} oglas${count === 1 ? 'u' : 'a'}. Najpre je ukloni sa oglasa.` },
        { status: 409 }
      );
    }
  }

  const { error } = await db.from('sizes').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
