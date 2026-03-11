import type { Metadata } from "next";
import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";
import { CONTACT } from "@/lib/config";

export const metadata: Metadata = {
  title: "Kako kupiti",
  robots: { index: false, follow: false },
};

export default function KakoKupitiPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kako kupiti?</h1>
        <p className="text-gray-400 text-sm mb-10">
          Sve što treba da znaš pre nego što se javljaš
        </p>

        <div className="space-y-8">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-start gap-4">
              <span className="shrink-0 w-9 h-9 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center font-bold text-sm">
                1
              </span>
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-1">
                  Pregledaj oglase
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Sve dostupne stvari možeš pronaći na{" "}
                  <Link
                    href="/"
                    className="text-rose-500 hover:underline font-medium"
                  >
                    početnoj stranici
                  </Link>
                  . Koristi filtere da suzite pretragu po brendu, veličini,
                  kategoriji, boji ili cenovnom opsegu. Klikni na oglas za više
                  detalja i fotografija.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-start gap-4">
              <span className="shrink-0 w-9 h-9 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center font-bold text-sm">
                2
              </span>
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-1">
                  Kontaktiraj prodavca
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-3">
                  Na svakom oglasu se nalaze dugmad za brzi kontakt putem
                  WhatsApp-a, Vibera ili e-maila. Klikni na željeni način i
                  otvoriće se razgovor sa unapred popunjenom porukom - samo
                  pošalji i čekaj odgovor.
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {CONTACT.whatsapp && (
                    <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full font-medium">
                      WhatsApp
                    </span>
                  )}
                  {CONTACT.viber && (
                    <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full font-medium">
                      Viber
                    </span>
                  )}
                  {CONTACT.email && (
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                      E-mail
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-start gap-4">
              <span className="shrink-0 w-9 h-9 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center font-bold text-sm">
                3
              </span>
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-1">
                  Dogovorite detalje
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Kupovina se dogovara direktno sa prodavcem - bez onlajn
                  plaćanja i bez korpe. Sve se rešava privatno: cena je fiksna i
                  navedena na oglasu, a preuzimanje ili dostava se dogovaraju u
                  razgovoru.
                </p>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-start gap-4">
              <span className="shrink-0 w-9 h-9 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center font-bold text-sm">
                4
              </span>
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-1">
                  Plaćanje i preuzimanje
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Plaćanje je gotovinom ili na drugi dogovoreni način - obavezno
                  pre ili pri preuzimanju. Moguće je lično preuzimanje ili
                  slanje poštom/kurirskom službom, zavisno od dogovora. Troškove
                  dostave snosi kupac.
                </p>
              </div>
            </div>
          </div>

          {/* Info box */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-amber-900 mb-1">
              Napomena
            </h3>
            <p className="text-sm text-amber-800 leading-relaxed">
              Ovo je privatan prodajni prostor jednog prodavca - nije
              marketplace ni prodavnica. Pitanja, reklamacije i sve ostalo
              rešavamo direktno u razgovoru.
            </p>
          </div>
        </div>

        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-rose-500 hover:text-rose-700 font-medium"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Pogledaj oglase
          </Link>
        </div>
      </main>
    </div>
  );
}
