export const SITE = {
  name: "Esonet Concept AI Skill Training",
  shortName: "Esonet Concept",
  email: "info@esonetconcept.com",
  whatsappNumber: "2347048200526",
  whatsappDisplay: "+234 704 820 0526",
  facebook: "https://facebook.com/esonetconcept",
  instagram: "https://instagram.com/esonetconcept",
  tagline: "Master AI Skills. Build Your Future",
};

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${SITE.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function formatNaira(amount: number | string | null | undefined) {
  const value = Number(amount ?? 0);
  return `₦${value.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

export const COUNTRIES = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "Cameroon",
  "Uganda",
  "Tanzania",
  "Rwanda",
  "United Kingdom",
  "United States",
  "Canada",
  "United Arab Emirates",
  "Other",
];

export const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export const PAYMENT_STATUSES = ["pending", "successful", "failed", "refunded"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
