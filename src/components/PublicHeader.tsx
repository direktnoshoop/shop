"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { SITE_NAME } from "@/lib/config";

const NAV_LINKS = [
  { href: "/", label: "Oglasi", exact: true },
  { href: "/kako-kupiti", label: "Kako kupiti", exact: false },
];

export default function PublicHeader() {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 shrink-0">
            <Image
              src="/logo.png"
              alt="Logo"
              width={32}
              height={32}
              className="object-cover w-full h-full object-[center_10%]"
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            {SITE_NAME}
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "text-rose-500 bg-rose-50"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
