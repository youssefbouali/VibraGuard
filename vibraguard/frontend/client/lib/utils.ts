import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(timeStr: string) {
  if (!timeStr) return "";
  try {
    // Standard ISO parse
    return format(parseISO(timeStr), "HH:mm:ss");
  } catch (e) {
    // Fallback for non-standard or overly precise strings
    const parts = timeStr.split('T');
    if (parts.length > 1) {
      // Extract HH:mm:ss
      return parts[1].substring(0, 8);
    }
    return timeStr;
  }
}
