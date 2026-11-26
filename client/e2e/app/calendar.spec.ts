import { test, expect } from "@playwright/test";

test("Should display the calendar page correctly", async ({ page }) => {
  await page.goto("/dashboard/calendar");

  await expect(page.getByRole("heading", { name: "Calendar" })).toBeVisible();
});

test("Should navigate to next month", async ({ page }) => {
  await page.goto("/dashboard/calendar");

  const currentDate = new Date();

  const nextDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    1,
  );

  const nextMonth = nextDate.toLocaleString("default", { month: "long" });

  const year =
    nextMonth === "January"
      ? nextDate.getFullYear() + 1
      : nextDate.getFullYear();

  await page.locator("button:has(svg.lucide-chevron-right)").click();

  await expect(
    page.getByRole("heading", { name: `${nextMonth} - ${year}` }),
  ).toBeVisible();
});

test("Should navigate to previous month", async ({ page }) => {
  await page.goto("/dashboard/calendar");

  const currentDate = new Date();

  const prevDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1,
    1,
  );

  const prevMonth = prevDate.toLocaleString("default", { month: "long" });

  const year =
    prevMonth === "December"
      ? prevDate.getFullYear() - 1
      : prevDate.getFullYear();

  await page.locator("button:has(svg.lucide-chevron-left)").click();

  await expect(
    page.getByRole("heading", { name: `${prevMonth} - ${year}` }),
  ).toBeVisible();
});
