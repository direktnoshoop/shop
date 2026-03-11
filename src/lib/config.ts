export const CONTACT = {
  whatsapp: process.env.NEXT_PUBLIC_CONTACT_WHATSAPP ?? '',
  viber: process.env.NEXT_PUBLIC_CONTACT_VIBER ?? '',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? '',
};

export const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY ?? 'RSD';

export const EUR_TO_RSD = parseFloat(process.env.NEXT_PUBLIC_EUR_TO_RSD ?? '117');

export function toRSD(price: number, currency: string): number {
  return currency === 'EUR' ? price * EUR_TO_RSD : price;
}

export const SITE_NAME = 'DFShop';

export function buildWhatsAppUrl(listingTitle: string): string {
  const number = CONTACT.whatsapp.replace(/\D/g, '');
  const message = encodeURIComponent(
    `Zdravo! Zainteresovan/a sam za oglas: "${listingTitle}". Da li je još uvek dostupno?`
  );
  return `https://wa.me/${number}?text=${message}`;
}

export function buildViberUrl(listingTitle: string): string {
  const number = CONTACT.viber.replace(/\D/g, '');
  const message = encodeURIComponent(
    `Zdravo! Zainteresovan/a sam za oglas: "${listingTitle}". Da li je još uvek dostupno?`
  );
  return `viber://chat?number=${number}&text=${message}`;
}
