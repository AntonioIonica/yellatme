import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getIntervalSubs(date: Date, days: number, direction: string) {
  const now = new Date();

  const momentaryDate = new Date();

  if (direction === "less") {
    momentaryDate.setDate(momentaryDate.getDate() - days);

    return date <= now && momentaryDate <= date;
  }

  momentaryDate.setDate(momentaryDate.getDate() + days);

  return date >= now && date <= momentaryDate;
}

export function comparePay(
  previous: number,
  current: number,
  dateType: string,
) {
  if (previous === 0) {
    if (current === 0) {
      return "No costs in both periods";
    }
    return `+$${current} from last ${dateType}`;
  }

  const change = ((current - previous) / previous) * 100;

  if (change > 0) {
    return `${change.toFixed(1)}% more than last ${dateType}`;
  } else if (change < 0) {
    return `${Math.abs(change).toFixed(1)}% less than last ${dateType}`;
  } else {
    return `Same costs as last ${dateType}`;
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
