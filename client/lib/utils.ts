import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function upcomingInterval(date: Date, days: number) {
  const now = new Date();

  const momentaryDate = new Date();
  momentaryDate.setDate(now.getDate() + days);

  return date >= now && date <= momentaryDate;
}
