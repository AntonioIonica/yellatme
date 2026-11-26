import { test, expect, Page } from "@playwright/test";

// Will select the startDate and renewalDate based on calendar obj
async function selectDateRange(
  page: Page,
  startDate: string,
  renewalDate: string,
) {
  await page.locator("#date-picker-range").click();

  await page.locator(`[data-day="${startDate}"]`).click();
  await page.locator(`[data-day="${renewalDate}"]`).click();
}

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

test("Should display an active subscription on its renewal date", async ({
  page,
}) => {
  const subscriptionName = `Calendar test ${Date.now()}`;

  await page.goto("/dashboard/calendar");

  await page.getByRole("button", { name: "Add subscription" }).click();

  await page.getByLabel("Subscription name:*").fill(subscriptionName);
  await page
    .getByLabel("Subscription description:")
    .fill("Calendar display test");
  await page.getByLabel("Price:*").fill("9");
  await page.getByLabel("Payment method:*").fill("Credit card");

  await selectDateRange(page, "11/24/2026", "12/10/2026");

  await page.getByRole("button", { name: "Create subscription" }).click();

  await expect(
    page.getByText(
      `Subscription ${subscriptionName} was added to your collection!`,
    ),
  ).toBeVisible();

  await page.locator("button:has(svg.lucide-chevron-right)").click();

  const laterThisMonthCard = page
    .locator(".text-card-foreground")
    .filter({ has: page.getByText("Later this month", { exact: true }) });

  await expect(laterThisMonthCard.getByText(subscriptionName)).toBeVisible();

  // Delete subscription
  await page.goto("/dashboard/subscriptions");

  const subscriptionCard = page
    .locator(".bg-card")
    .filter({ has: page.getByText(subscriptionName, { exact: true }) })
    .first();

  await subscriptionCard.getByRole("button").click();

  await page.getByRole("menuitem", { name: "Delete" }).click();
});

test("Should not display a cancelled subscription", async ({ page }) => {
  const subscriptionName = `Calendar cancelled test ${Date.now()}`;

  await page.goto("/dashboard/calendar");

  await page.getByRole("button", { name: "Add subscription" }).click();

  await page.getByLabel("Subscription name:*").fill(subscriptionName);
  await page
    .getByLabel("Subscription description:")
    .fill("Calendar cancelled display test");
  await page.getByLabel("Price:*").fill("9");
  await page.getByLabel("Payment method:*").fill("Credit card");

  await selectDateRange(page, "11/24/2026", "12/10/2026");

  await page.getByRole("dialog").getByRole("combobox").nth(3).click();
  await page.getByRole("option", { name: "Cancelled" }).click();

  await page.getByRole("button", { name: "Create subscription" }).click();

  await expect(
    page.getByText(
      `Subscription ${subscriptionName} was added to your collection!`,
    ),
  ).toBeVisible();

  await page.locator("button:has(svg.lucide-chevron-right)").click();

  const laterThisMonthCard = page
    .locator(".text-card-foreground")
    .filter({ has: page.getByText("Later this month", { exact: true }) });

  await expect(
    laterThisMonthCard.getByText(subscriptionName),
  ).not.toBeVisible();

  // Delete subscription
  await page.goto("/dashboard/subscriptions");

  await page.getByRole("button", { name: "Status" }).click();
  await page.getByRole("menuitem", { name: "Cancelled" }).click();

  const subscriptionCard = page
    .locator(".bg-card")
    .filter({ has: page.getByText(subscriptionName, { exact: true }) })
    .first();

  await subscriptionCard.getByRole("button").click();

  await page.getByRole("menuitem", { name: "Delete" }).click();
});
