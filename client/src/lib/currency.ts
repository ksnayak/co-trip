export const CURRENCIES = [
  { code: "INR", symbol: "\u20B9", label: "Indian Rupee" },
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "\u20AC", label: "Euro" },
  { code: "GBP", symbol: "\u00A3", label: "British Pound" },
  { code: "JPY", symbol: "\u00A5", label: "Japanese Yen" },
  { code: "AUD", symbol: "A$", label: "Australian Dollar" },
  { code: "CAD", symbol: "C$", label: "Canadian Dollar" },
  { code: "THB", symbol: "\u0E3F", label: "Thai Baht" },
] as const;

export function getCurrencySymbol(code?: string | null): string {
  if (!code) return "\u20B9";
  const found = CURRENCIES.find((c) => c.code === code);
  return found?.symbol ?? "\u20B9";
}
