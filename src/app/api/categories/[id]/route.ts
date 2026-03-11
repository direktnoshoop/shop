import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase';

// PATCH /api/categories/[id] — admin only
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
    return NextResponse.json({ error: 'Naziv kategorije je obavezan.' }, { status: 400 });
  }

  const db = createServiceClient();
  const { data, error } = await db
    .from('categories')
    .update({ name: name.trim() })
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Kategorija sa tim nazivom već postoji.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/categories/[id] — admin only
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = createServiceClient();

  // Check if category is in use
  const { data: cat } = await db
    .from('categories')
    .select('name')
    .eq('id', params.id)
    .single();

  if (cat) {
    const { count } = await db
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('category', cat.name);

    if (count && count > 0) {
      return NextResponse.json(
        { error: `Nije moguće obrisati — kategorija se koristi na ${count} oglasa.` },
        { status: 409 }
      );
    }
  }

  const { error } = await db.from('categories').delete().eq('id', params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
