'use client';

import { signOut } from 'next-auth/react';

export default function AdminSignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/admin/login' })}
      className="text-xs text-gray-400 hover:text-red-500 transition-colors"
    >
      Odjavi se
    </button>
  );
}
