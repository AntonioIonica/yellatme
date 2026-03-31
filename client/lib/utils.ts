import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Checks if the passed date is less than 30 days from today
export function upcomingMonth(date: Date) {
  const now = new Date();

  const nextMonth = new Date();
  nextMonth.setDate(now.getDate() + 30);

  return date >= now && date <= nextMonth;
}
