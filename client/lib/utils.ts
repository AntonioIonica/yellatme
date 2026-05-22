import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import {
  startOfWeek,
  endOfWeek,
  subWeeks,
  isWithinInterval,
  startOfMonth,
  subMonths,
  endOfMonth,
  startOfYear,
  endOfYear,
  subYears,
} from "date-fns";
import { Subscription } from "@/store/useSubscriptionsStore";

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

export function getSubsByInterval(subs: Subscription[], interval: string) {
  const now = new Date();

  let start: Date;
  let end: Date;

  switch (interval) {
    case "prevWeek":
      start = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
      end = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
      break;

    case "prevMonth":
      start = startOfMonth(subMonths(now, 1));
      end = endOfMonth(subMonths(now, 1));
      break;

    case "prevSixMonths":
      start = startOfMonth(subMonths(now, 11));
      end = endOfMonth(subMonths(now, 5));
      break;

    case "prevYear":
      start = startOfYear(subYears(now, 1));
      end = endOfYear(subYears(now, 1));
      break;

    case "currentWeek":
      // Gets the start day of the given week = current week, and sets the start day as 1, to monday
      start = startOfWeek(now, { weekStartsOn: 1 });
      end = endOfWeek(now, { weekStartsOn: 1 });
      break;

    case "currentMonth":
      start = startOfMonth(now);
      end = endOfMonth(now);
      break;

    case "pastSixMonths":
      start = startOfMonth(subMonths(now, 5));
      end = endOfMonth(now);
      break;

    case "pastYear":
      start = startOfYear(now);
      end = now;
      break;

    case "currentYear":
      start = now;
      end = endOfYear(now);
      break;

    default:
      console.log(`You should choose an interval`);
  }

  const filteredSubs = subs?.filter((sub) =>
    isWithinInterval(new Date(sub.renewalDate), { start, end }),
  );

  return filteredSubs;
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
