'use client';

import { useState } from 'react';
import SizeGuideModal from './SizeGuideModal';

interface Props {
  name: string;
  content: string;
}

export default function SizeGuideButton({ name, content }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border border-gray-300 text-gray-600 hover:border-rose-400 hover:text-rose-500 transition-colors bg-white"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        Vodič za veličine
      </button>

      {open && (
        <SizeGuideModal
          name={name}
          content={content}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
