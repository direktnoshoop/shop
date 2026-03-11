import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

// Browser/public client — lazy singleton using anon key
export function getSupabaseClient(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          fetch: (url, opts) => fetch(url, { ...opts, cache: 'no-store' }),
        },
      }
    );
  }
  return _supabase;
}

// Convenience default export for server components that import `supabase`
export const supabase = {
  from: (table: string) => getSupabaseClient().from(table),
  storage: {
    from: (bucket: string) => getSupabaseClient().storage.from(bucket),
  },
};

// Server-only client — uses service role key, bypasses RLS
// fetch: cache: 'no-store' ensures Next.js never serves stale data from its fetch cache
export function createServiceClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false },
      global: {
        fetch: (url, opts) => fetch(url, { ...opts, cache: 'no-store' }),
      },
    }
  );
}

export function getPublicImageUrl(storagePath: string): string {
  const client = getSupabaseClient();
  const { data } = client.storage
    .from('listing-images')
    .getPublicUrl(storagePath);
  return data.publicUrl;
}
