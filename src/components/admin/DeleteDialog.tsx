'use client';

interface Props {
  listingTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteDialog({ listingTitle, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
        <div className="flex items-start gap-4">
          <div className="shrink-0 bg-red-100 rounded-full p-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Obriši oglas</h3>
            <p className="text-sm text-gray-500 mt-1">
              Da li ste sigurni da želite da obrišete oglas <strong>"{listingTitle}"</strong>? Sve slike će takođe biti obrisane. Ova akcija se ne može poništiti.
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Otkaži
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Obriši
          </button>
        </div>
      </div>
    </div>
  );
}
