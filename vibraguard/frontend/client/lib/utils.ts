import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, isToday } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(timeStr: string) {
  if (!timeStr) return "";
  try {
    const date = parseISO(timeStr);
    if (isToday(date)) {
      return format(date, "HH:mm:ss");
    } else {
      return format(date, "dd MMM yyyy, HH:mm:ss");
    }
  } catch (e) {
    const parts = timeStr.split('T');
    if (parts.length > 1) {
      return parts[1].substring(0, 8);
    }
    return timeStr;
  }
}
