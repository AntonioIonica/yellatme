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

test("Should display the subscriptions page correctly", async ({ page }) => {
  await page.goto("/dashboard/subscriptions");

  await expect(
    page.getByRole("heading", { name: "Subscriptions" }),
  ).toBeVisible();
});

test("Should display analytics page correctly", async ({ page }) => {
  await page.goto("/dashboard/analytics");

  await expect(page.getByRole("heading", { name: "Analytics" })).toBeVisible();

  await expect(page.getByText("Spending Trend")).toBeVisible();
  await expect(page.getByText("By Category")).toBeVisible();
  await expect(page.getByText("Year Over Year")).toBeVisible();
});

test("Should increase category auto total", async ({ page }) => {
  await page.goto("/dashboard/analytics");

  const subscriptionName = `Analytics category ${Date.now()}`;

  await page.getByRole("button", { name: "Add subscription" }).click();

  await page.getByLabel("Subscription name:*").fill(subscriptionName);
  await page
    .getByLabel("Subscription description:")
    .fill("Analytics category auto total test");
  await page.getByLabel("Price:*").fill("15");
  await page.getByLabel("Payment method:*").fill("Credit card");
  await page.getByRole("dialog").getByRole("combobox").nth(2).click();
  await page.getByRole("option", { name: "Auto" }).click();

  await page.getByRole("button", { name: "Create subscription" }).click();

  await expect(
    page.getByText(
      `Subscription ${subscriptionName} was added to your collection!`,
    ),
  ).toBeVisible();

  //   Reload to fetch fresh data
  await page.goto("/dashboard/analytics");

  const autoCategory = page
    .locator(".space-y-1")
    .filter({ has: page.getByText("auto", { exact: true }) })
    .first();

  await expect(autoCategory.getByText("$15.0")).toBeVisible();

  //   Delete subscription
  await page.goto("/dashboard/subscriptions");

  const subscriptionCard = page
    .locator(".bg-card")
    .filter({ has: page.getByText(subscriptionName, { exact: true }) })
    .first();

  await subscriptionCard.getByRole("button").click();

  await page.getByRole("menuitem", { name: "Delete" }).click();
});
