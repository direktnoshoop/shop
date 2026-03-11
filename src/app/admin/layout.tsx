import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminSignOutButton from '@/components/admin/AdminSignOutButton';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Login page is handled separately without the admin chrome
  return (
    <div className="min-h-screen bg-gray-50">
      {session && (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/admin/dashboard" className="text-base font-bold text-gray-900">
                DFShop <span className="text-rose-500">Admin</span>
              </Link>
              <Link
                href="/admin/dashboard"
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Oglasi
              </Link>
              <Link
                href="/admin/listings/new"
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                + Novi oglas
              </Link>
              <Link
                href="/admin/settings"
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Podešavanja
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                target="_blank"
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Pogledaj shop →
              </Link>
              <AdminSignOutButton />
            </div>
          </div>
        </nav>
      )}
      {children}
    </div>
  );
}
