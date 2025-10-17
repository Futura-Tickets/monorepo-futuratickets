import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatTwoDigits = (digit: number): string => {
  return digit < 10 ? '0' + digit.toString() : digit.toString();
};