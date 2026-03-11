"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const STORAGE_KEY = "kako-kupiti-banner-dismissed";

export default function InfoBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="bg-rose-50 border-b border-rose-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-center gap-3 text-sm">
        <span className="text-rose-700">
          Prvi put kupujes? Saznaj kako funkcionise kupovina.
        </span>
        <Link
          href="/kako-kupiti"
          onClick={() => {
            localStorage.setItem(STORAGE_KEY, "1");
            setVisible(false);
          }}
          className="inline-flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
        >
          Kako naručiti →
        </Link>
      </div>
    </div>
  );
}
