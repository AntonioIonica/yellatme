import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function upcomingInterval(date: Date, days: number) {
  // Checks if the passed date is less than given days from today
  const now = new Date();

  const nextMonth = new Date();
  nextMonth.setDate(now.getDate() + days);

  return date >= now && date <= nextMonth;
}
