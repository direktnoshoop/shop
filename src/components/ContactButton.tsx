'use client';

import { CONTACT, buildWhatsAppUrl, buildViberUrl } from '@/lib/config';

interface Props {
  listingTitle: string;
}

export default function ContactButton({ listingTitle }: Props) {
  const hasWhatsApp = !!CONTACT.whatsapp;
  const hasViber = !!CONTACT.viber;
  const hasEmail = !!CONTACT.email;

  if (!hasWhatsApp && !hasViber && !hasEmail) return null;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-gray-700">Kontaktiraj prodavca</p>
      <div className="flex flex-col sm:flex-row flex-wrap gap-2">
        {hasWhatsApp && (
          <a
            href={buildWhatsAppUrl(listingTitle)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-xl font-medium text-sm transition-colors w-full sm:w-auto"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </a>
        )}
        {hasViber && (
          <a
            href={buildViberUrl(listingTitle)}
            className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-xl font-medium text-sm transition-colors w-full sm:w-auto"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.4 0C5.1.3.1 5.5 0 11.8c-.1 3.8 1.4 7.3 4 9.9V24l2.9-1.5c1.1.3 2.3.5 3.5.5 6.3 0 11.4-5.1 11.4-11.4C21.8 5.1 16.7 0 11.4 0zm5.9 16.4c-.2.6-.9 1.1-1.6 1.2-.4 0-.7.2-2.4-.5-3.7-1.5-6-5.3-6.2-5.5-.2-.3-.9-1.1-.9-2.2s.6-1.5.8-1.7c.2-.2.4-.3.6-.3h.5c.1 0 .3 0 .4.3.2.4.6 1.5.7 1.6 0 .1.1.2 0 .3-.1.1-.1.2-.2.3-.1.1-.2.2-.3.3-.1.1-.2.2-.1.4.1.2.6.9 1.2 1.5.8.8 1.5 1.1 1.7 1.2.2.1.3 0 .4-.1.1-.1.6-.7.7-.9.2-.2.3-.2.5-.1.2.1 1.3.6 1.5.7.2.1.4.2.4.3.1.1.1.5-.1 1.1z" />
            </svg>
            Viber
          </a>
        )}
        {hasEmail && (
          <a
            href={`mailto:${CONTACT.email}?subject=Oglas: ${encodeURIComponent(listingTitle)}`}
            className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 bg-gray-700 hover:bg-gray-800 active:bg-gray-900 text-white rounded-xl font-medium text-sm transition-colors w-full sm:w-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email
          </a>
        )}
      </div>
    </div>
  );
}
