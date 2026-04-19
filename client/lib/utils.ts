import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function upcomingInterval(date: Date, days: number, direction: string) {
  const now = new Date();

  const momentaryDate = new Date();

  if (direction == "less") {
    momentaryDate.setDate(now.getDate() - days);

    return date <= now && momentaryDate <= date;
  }

  momentaryDate.setDate(now.getDate() + days);

  return date >= now && date <= momentaryDate;
}

export function comparePay(
  subsPrice1: number,
  subsPrice2: number,
  dateType: string,
) {
  if (subsPrice1 == 0 || subsPrice2 == 0) {
    return `No previous ${dateType}ly data available`;
  }

  if (subsPrice1 > subsPrice2) {
    return `${((subsPrice2 / subsPrice1) * 100).toFixed(1)}% less than last ${dateType}`;
  } else if (subsPrice1 < subsPrice2) {
    return `${((subsPrice1 / subsPrice2) * 100).toFixed(1)}% more than last ${dateType}`;
  } else {
    return `Same cost as last ${dateType}`;
  }
}

// "EUR", "USD", "GBP", "LEI"
export function parseCurrency(currency: String) {
  switch (currency) {
    case "EUR":
      return "€";
    case "USD":
      return "$";
    case "GBP":
      return "£";
    default:
      return "RON";
  }
}
