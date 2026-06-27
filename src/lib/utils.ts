import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formátování čísla v české konvenci (mezera jako oddělovač tisíců). */
export function formatNumber(n: number, maximumFractionDigits = 0): string {
  return new Intl.NumberFormat("cs-CZ", { maximumFractionDigits }).format(n);
}

/** Formátování procent (česká konvence). */
export function formatPercent(n: number, maximumFractionDigits = 1): string {
  return new Intl.NumberFormat("cs-CZ", {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(n) + " %";
}
