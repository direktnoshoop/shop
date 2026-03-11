import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServiceClient, supabase } from '@/lib/supabase';

// GET /api/site-settings — public
export async function GET() {
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const settings: Record<string, string> = {};
  for (const row of data ?? []) {
    settings[row.key] = row.value;
  }

  return NextResponse.json(settings);
}

// PATCH /api/site-settings — admin only
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { key, value } = await req.json();
  if (!key) {
    return NextResponse.json({ error: 'Key is required.' }, { status: 400 });
  }

  const db = createServiceClient();
  const { error } = await db
    .from('site_settings')
    .upsert({ key, value: value ?? '' }, { onConflict: 'key' });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
