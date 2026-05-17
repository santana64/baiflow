import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function centsFromEuros(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "0").replace(",", ".");
  return Math.round(Number(normalized) * 100);
}

export function eurosFromCents(cents: number) {
  return (cents / 100).toFixed(2);
}
