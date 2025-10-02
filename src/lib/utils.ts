import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function limitStrLen(str: string, n: number) {
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
}

export { cn, limitStrLen };
