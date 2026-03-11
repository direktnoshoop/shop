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

  const body = await req.json();
  const updates: Record<string, string> = {};
  if (body.name !== undefined) updates.name = body.name.trim();
  if (body.content !== undefined) updates.content = body.content;

  if (updates.name !== undefined && !updates.name) {
    return NextResponse.json({ error: 'Naziv ne može biti prazan.' }, { status: 400 });
  }

  const db = createServiceClient();
  const { data, error } = await db
    .from('size_guides')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Vodič sa tim nazivom već postoji.' }, { status: 409 });
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

  // Check if any listing uses this guide
  const { count } = await db
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .eq('size_guide_id', params.id);

  if (count && count > 0) {
    return NextResponse.json(
      { error: `Vodič se koristi na ${count} oglas${count === 1 ? 'u' : 'a'}. Najpre ga ukloni sa oglasa.` },
      { status: 409 }
    );
  }

  const { error } = await db.from('size_guides').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
